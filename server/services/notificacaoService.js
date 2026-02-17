const { Notificacao, User, Perfil, PerfilPermissao } = require('../models');
const { getIO } = require('../config/socket');

const notificacaoService = {
    /**
     * Cria notificacao(oes) e emite via Socket.IO
     */
    async notificar(dados) {
        try {
            const { destinatarioIds, tipo, titulo, mensagem, referenciaId, metadados } = dados;
            const ids = Array.isArray(destinatarioIds) ? destinatarioIds : [destinatarioIds];

            const notificacoes = await Notificacao.bulkCreate(
                ids.map(uid => ({
                    usuario_id: uid,
                    tipo,
                    titulo,
                    mensagem,
                    referencia_id: referenciaId || null,
                    metadados: metadados || null
                }))
            );

            // Emitir via Socket.IO para cada destinatario
            try {
                const io = getIO();
                for (const notificacao of notificacoes) {
                    io.to(`user:${notificacao.usuario_id}`).emit('notificacao:nova', {
                        id: notificacao.id,
                        tipo: notificacao.tipo,
                        titulo: notificacao.titulo,
                        mensagem: notificacao.mensagem,
                        referencia_id: notificacao.referencia_id,
                        metadados: notificacao.metadados,
                        lida: false,
                        created_at: notificacao.created_at
                    });
                }
            } catch (socketError) {
                console.error('Erro ao emitir notificacao via Socket.IO:', socketError.message);
            }

            return notificacoes;
        } catch (error) {
            console.error('Erro ao criar notificacao:', error);
            return null;
        }
    },

    /**
     * Notifica todos os usuarios com permissao 'compras' ou admin
     */
    async notificarCompras(dados) {
        try {
            const users = await User.findAll({
                include: [{
                    model: Perfil,
                    as: 'perfil',
                    include: [{ model: PerfilPermissao, as: 'permissoesRef' }]
                }],
                where: { ativo: true }
            });

            const comprasUserIds = users
                .filter(u => u.perfil?.is_admin || u.perfil?.permissoesRef?.some(p => p.permissao === 'compras'))
                .map(u => u.id);

            if (comprasUserIds.length === 0) return null;

            return this.notificar({
                ...dados,
                destinatarioIds: comprasUserIds
            });
        } catch (error) {
            console.error('Erro ao notificar compras:', error);
            return null;
        }
    },

    /**
     * Lista notificacoes paginadas de um usuario
     */
    async listar(usuarioId, opcoes = {}) {
        const { pagina = 1, limite = 20, apenasNaoLidas = false } = opcoes;
        const where = { usuario_id: usuarioId };
        if (apenasNaoLidas) where.lida = false;

        const offset = (pagina - 1) * limite;

        const [notificacoes, total, naoLidas] = await Promise.all([
            Notificacao.findAll({
                where,
                order: [['created_at', 'DESC']],
                offset,
                limit: limite
            }),
            Notificacao.count({ where }),
            Notificacao.count({ where: { usuario_id: usuarioId, lida: false } })
        ]);

        return {
            notificacoes: notificacoes.map(n => n.get({ plain: true })),
            naoLidas,
            paginacao: { pagina, limite, total, totalPaginas: Math.ceil(total / limite) }
        };
    },

    /**
     * Conta notificacoes nao lidas
     */
    async contarNaoLidas(usuarioId) {
        return Notificacao.count({ where: { usuario_id: usuarioId, lida: false } });
    },

    /**
     * Marca uma notificacao como lida
     */
    async marcarComoLida(notificacaoId, usuarioId) {
        const notificacao = await Notificacao.findOne({
            where: { id: notificacaoId, usuario_id: usuarioId }
        });
        if (!notificacao) return null;

        await notificacao.update({ lida: true, lida_em: new Date() });
        return notificacao.get({ plain: true });
    },

    /**
     * Marca todas as notificacoes como lidas
     */
    async marcarTodasComoLidas(usuarioId) {
        const [count] = await Notificacao.update(
            { lida: true, lida_em: new Date() },
            { where: { usuario_id: usuarioId, lida: false } }
        );
        return count;
    }
};

module.exports = notificacaoService;
