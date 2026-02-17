const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { SolicitacaoAtualizacao, User, Setor, Fornecedor, Contrato, Sequencia, Estabelecimento, Empresa, Perfil, PerfilPermissao } = require('../models');
const auditService = require('../services/auditService');
const notificacaoService = require('../services/notificacaoService');
const emailService = require('../services/emailService');

// Include padrao para consultas
const solicitacaoInclude = [
    {
        model: User,
        as: 'solicitante',
        attributes: ['id', 'usuario', 'nome', 'email']
    },
    {
        model: Setor,
        as: 'setor',
        attributes: ['id', 'nome']
    },
    {
        model: Fornecedor,
        as: 'fornecedor',
        attributes: ['id', 'nome']
    },
    {
        model: Contrato,
        as: 'contrato',
        attributes: ['id', 'nr_contrato', 'cod_estabel'],
        include: [
            { model: Estabelecimento, as: 'estabelecimento', attributes: ['id', 'cod_estabel', 'nome'] }
        ]
    },
    {
        model: Sequencia,
        as: 'sequencia',
        attributes: ['id', 'num_seq_item', 'dia_emissao', 'valor']
    },
    {
        model: User,
        as: 'avaliador',
        attributes: ['id', 'usuario', 'nome']
    }
];

// Listar solicitacoes do proprio usuario
exports.getAll = async (req, res) => {
    try {
        const { status } = req.query;
        const where = { solicitante_id: req.user.id };
        if (status) where.status = status;

        const solicitacoes = await SolicitacaoAtualizacao.findAll({
            where,
            include: solicitacaoInclude,
            order: [['created_at', 'DESC']]
        });

        res.json(solicitacoes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Listar todas as solicitacoes (para Compras)
exports.getAllCompras = async (req, res) => {
    try {
        const { status, fornecedor_id, data_inicio, data_fim } = req.query;
        const where = {};

        if (status) where.status = status;
        if (fornecedor_id) where.fornecedor_id = fornecedor_id;
        if (data_inicio || data_fim) {
            where.created_at = {};
            if (data_inicio) where.created_at[Op.gte] = new Date(data_inicio);
            if (data_fim) where.created_at[Op.lte] = new Date(data_fim + 'T23:59:59');
        }

        const solicitacoes = await SolicitacaoAtualizacao.findAll({
            where,
            include: solicitacaoInclude,
            order: [['created_at', 'DESC']]
        });

        res.json(solicitacoes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Buscar solicitacao por ID
exports.getById = async (req, res) => {
    try {
        const solicitacao = await SolicitacaoAtualizacao.findByPk(req.params.id, {
            include: solicitacaoInclude
        });

        if (!solicitacao) {
            return res.status(404).json({ message: 'Solicitacao nao encontrada' });
        }

        // Verificar acesso: solicitante pode ver a propria, compras pode ver todas
        const isCompras = req.user.isAdmin || (req.user.permissoes && req.user.permissoes.includes('compras'));
        if (!isCompras && solicitacao.solicitante_id !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        res.json(solicitacao);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Criar nova solicitacao
exports.create = async (req, res) => {
    try {
        const { fornecedor_id, contrato_id, sequencia_id, observacao, novo_valor, novo_dia_emissao } = req.body;

        // Validar que o contrato pertence ao fornecedor
        const contrato = await Contrato.findByPk(contrato_id);
        if (!contrato || contrato.fornecedor_id !== parseInt(fornecedor_id)) {
            return res.status(400).json({ message: 'Contrato nao pertence ao fornecedor selecionado' });
        }

        // Validar que a sequencia pertence ao contrato
        const sequencia = await Sequencia.findByPk(sequencia_id);
        if (!sequencia || sequencia.contrato_id !== parseInt(contrato_id)) {
            return res.status(400).json({ message: 'Sequencia nao pertence ao contrato selecionado' });
        }

        // Obter setor do usuario
        const usuario = await User.findByPk(req.user.id, {
            include: [{ model: Setor, as: 'setor' }]
        });

        const dadosSolicitacao = {
            solicitante_id: req.user.id,
            setor_id: usuario?.setor_id || null,
            fornecedor_id: parseInt(fornecedor_id),
            contrato_id: parseInt(contrato_id),
            sequencia_id: parseInt(sequencia_id),
            observacao
        };

        if (novo_valor !== undefined && novo_valor !== '' && novo_valor !== null) {
            dadosSolicitacao.novo_valor = parseFloat(novo_valor);
        }
        if (novo_dia_emissao !== undefined && novo_dia_emissao !== '' && novo_dia_emissao !== null) {
            dadosSolicitacao.novo_dia_emissao = parseInt(novo_dia_emissao);
        }

        // Anexo PDF (via multer)
        if (req.file) {
            dadosSolicitacao.anexo_pdf = req.file.filename;
        }

        const solicitacao = await SolicitacaoAtualizacao.create(dadosSolicitacao);

        // Recarregar com includes
        const solicitacaoCompleta = await SolicitacaoAtualizacao.findByPk(solicitacao.id, {
            include: solicitacaoInclude
        });

        // Audit log
        const fornecedor = await Fornecedor.findByPk(fornecedor_id);
        await auditService.logCrud(req, 'CRIAR', 'SOLICITACAO', 'SolicitacaoAtualizacao', {
            recursoId: solicitacao.id,
            recursoNome: `Solicitacao #${solicitacao.id}`,
            descricao: `Solicitacao de atualizacao criada para contrato ${contrato.nr_contrato} - ${fornecedor?.nome}`,
            dadosNovos: {
                fornecedor: fornecedor?.nome,
                contrato: contrato.nr_contrato,
                sequencia: sequencia.num_seq_item,
                observacao,
                novo_valor: dadosSolicitacao.novo_valor,
                novo_dia_emissao: dadosSolicitacao.novo_dia_emissao,
                anexo: !!req.file
            }
        });

        // Notificar Compras sobre nova solicitacao
        const solicitanteNome = usuario?.nome || req.user.usuario;
        notificacaoService.notificarCompras({
            tipo: 'solicitacao_criada',
            titulo: 'Nova solicitacao de atualizacao',
            mensagem: `${solicitanteNome} enviou a solicitacao #${solicitacao.id} para o contrato ${contrato.nr_contrato} (${fornecedor?.nome})`,
            referenciaId: solicitacao.id,
            metadados: {
                solicitacao_id: solicitacao.id,
                solicitante_nome: solicitanteNome,
                contrato_nr: contrato.nr_contrato,
                fornecedor_nome: fornecedor?.nome
            }
        }).catch(err => console.error('Erro ao notificar compras:', err));

        // Enviar e-mail para usuarios de Compras
        (async () => {
            try {
                const usersCompras = await User.findAll({
                    include: [{
                        model: Perfil,
                        as: 'perfil',
                        include: [{ model: PerfilPermissao, as: 'permissoesRef' }]
                    }],
                    where: { ativo: true }
                });

                const destinatarios = usersCompras.filter(
                    u => u.perfil?.is_admin || u.perfil?.permissoesRef?.some(p => p.permissao === 'compras')
                );

                if (destinatarios.length > 0) {
                    await emailService.enviarNotificacaoSolicitacao(destinatarios, {
                        solicitanteNome,
                        contratoNr: contrato.nr_contrato,
                        fornecedorNome: fornecedor?.nome || 'N/A'
                    });
                }
            } catch (err) {
                console.error('Erro ao enviar e-mail para compras:', err);
            }
        })();

        res.status(201).json(solicitacaoCompleta);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Aprovar solicitacao
exports.aprovar = async (req, res) => {
    try {
        const solicitacao = await SolicitacaoAtualizacao.findByPk(req.params.id, {
            include: solicitacaoInclude
        });

        if (!solicitacao) {
            return res.status(404).json({ message: 'Solicitacao nao encontrada' });
        }

        if (solicitacao.status !== 'pendente') {
            return res.status(400).json({ message: 'Solicitacao ja foi avaliada' });
        }

        // Atualizar solicitacao
        await solicitacao.update({
            status: 'aprovada',
            avaliador_id: req.user.id,
            data_avaliacao: new Date()
        });

        // Atualizar sequencia automaticamente
        const sequencia = await Sequencia.findByPk(solicitacao.sequencia_id);
        if (sequencia) {
            const dadosAntigoSequencia = {
                valor: sequencia.valor,
                dia_emissao: sequencia.dia_emissao
            };

            const camposAtualizar = {};
            if (solicitacao.novo_valor !== null) {
                camposAtualizar.valor = solicitacao.novo_valor;
            }
            if (solicitacao.novo_dia_emissao !== null) {
                camposAtualizar.dia_emissao = solicitacao.novo_dia_emissao;
            }

            if (Object.keys(camposAtualizar).length > 0) {
                await sequencia.update(camposAtualizar);

                // Audit log da atualizacao da sequencia
                await auditService.logCrud(req, 'ATUALIZAR', 'SEQUENCIA', 'Sequencia', {
                    recursoId: sequencia.id,
                    recursoNome: `Sequencia ${sequencia.num_seq_item}`,
                    descricao: `Sequencia atualizada via aprovacao de solicitacao #${solicitacao.id}`,
                    dadosAnteriores: dadosAntigoSequencia,
                    dadosNovos: camposAtualizar,
                    nivel: 'WARN'
                });
            }
        }

        // Audit log da aprovacao
        await auditService.logCrud(req, 'APROVAR', 'SOLICITACAO', 'SolicitacaoAtualizacao', {
            recursoId: solicitacao.id,
            recursoNome: `Solicitacao #${solicitacao.id}`,
            descricao: `Solicitacao #${solicitacao.id} aprovada`,
            dadosNovos: {
                status: 'aprovada',
                avaliador: req.user.usuario,
                novo_valor: solicitacao.novo_valor,
                novo_dia_emissao: solicitacao.novo_dia_emissao
            },
            nivel: 'WARN'
        });

        // Notificar solicitante sobre aprovacao
        const avaliadorUser = await User.findByPk(req.user.id, { attributes: ['id', 'nome', 'usuario'] });
        const avaliadorNome = avaliadorUser?.nome || req.user.usuario;
        notificacaoService.notificar({
            destinatarioIds: solicitacao.solicitante_id,
            tipo: 'solicitacao_aprovada',
            titulo: 'Solicitacao aprovada',
            mensagem: `Sua solicitacao #${solicitacao.id} foi aprovada por ${avaliadorNome}`,
            referenciaId: solicitacao.id,
            metadados: {
                solicitacao_id: solicitacao.id,
                avaliador_id: req.user.id,
                avaliador_nome: avaliadorNome,
                contrato_nr: solicitacao.contrato?.nr_contrato,
                fornecedor_nome: solicitacao.fornecedor?.nome
            }
        }).catch(err => console.error('Erro ao notificar solicitante:', err));

        // Recarregar com includes atualizados
        const solicitacaoAtualizada = await SolicitacaoAtualizacao.findByPk(solicitacao.id, {
            include: solicitacaoInclude
        });

        res.json({
            message: 'Solicitacao aprovada com sucesso',
            solicitacao: solicitacaoAtualizada
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reprovar solicitacao
exports.reprovar = async (req, res) => {
    try {
        const { motivo_reprovacao } = req.body;

        if (!motivo_reprovacao || !motivo_reprovacao.trim()) {
            return res.status(400).json({ message: 'Motivo da reprovacao e obrigatorio' });
        }

        const solicitacao = await SolicitacaoAtualizacao.findByPk(req.params.id, {
            include: solicitacaoInclude
        });

        if (!solicitacao) {
            return res.status(404).json({ message: 'Solicitacao nao encontrada' });
        }

        if (solicitacao.status !== 'pendente') {
            return res.status(400).json({ message: 'Solicitacao ja foi avaliada' });
        }

        await solicitacao.update({
            status: 'reprovada',
            avaliador_id: req.user.id,
            data_avaliacao: new Date(),
            motivo_reprovacao: motivo_reprovacao.trim()
        });

        // Audit log
        await auditService.logCrud(req, 'REPROVAR', 'SOLICITACAO', 'SolicitacaoAtualizacao', {
            recursoId: solicitacao.id,
            recursoNome: `Solicitacao #${solicitacao.id}`,
            descricao: `Solicitacao #${solicitacao.id} reprovada`,
            dadosNovos: {
                status: 'reprovada',
                avaliador: req.user.usuario,
                motivo_reprovacao: motivo_reprovacao.trim()
            }
        });

        // Notificar solicitante sobre reprovacao
        const avaliadorUser = await User.findByPk(req.user.id, { attributes: ['id', 'nome', 'usuario'] });
        const avaliadorNome = avaliadorUser?.nome || req.user.usuario;
        notificacaoService.notificar({
            destinatarioIds: solicitacao.solicitante_id,
            tipo: 'solicitacao_reprovada',
            titulo: 'Solicitacao reprovada',
            mensagem: `Sua solicitacao #${solicitacao.id} foi reprovada por ${avaliadorNome}. Motivo: ${motivo_reprovacao.trim()}`,
            referenciaId: solicitacao.id,
            metadados: {
                solicitacao_id: solicitacao.id,
                avaliador_id: req.user.id,
                avaliador_nome: avaliadorNome,
                motivo_reprovacao: motivo_reprovacao.trim(),
                contrato_nr: solicitacao.contrato?.nr_contrato,
                fornecedor_nome: solicitacao.fornecedor?.nome
            }
        }).catch(err => console.error('Erro ao notificar solicitante:', err));

        const solicitacaoAtualizada = await SolicitacaoAtualizacao.findByPk(solicitacao.id, {
            include: solicitacaoInclude
        });

        res.json({
            message: 'Solicitacao reprovada',
            solicitacao: solicitacaoAtualizada
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Download do anexo PDF
exports.downloadAnexo = async (req, res) => {
    try {
        const solicitacao = await SolicitacaoAtualizacao.findByPk(req.params.id);

        if (!solicitacao) {
            return res.status(404).json({ message: 'Solicitacao nao encontrada' });
        }

        // Verificar acesso
        const isCompras = req.user.isAdmin || (req.user.permissoes && req.user.permissoes.includes('compras'));
        if (!isCompras && solicitacao.solicitante_id !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        if (!solicitacao.anexo_pdf) {
            return res.status(404).json({ message: 'Esta solicitacao nao possui anexo' });
        }

        const filePath = path.join(__dirname, '..', 'uploads', 'solicitacoes', solicitacao.anexo_pdf);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Arquivo nao encontrado no servidor' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${solicitacao.anexo_pdf}"`);
        fs.createReadStream(filePath).pipe(res);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Estatisticas para dashboard Compras
exports.getEstatisticas = async (req, res) => {
    try {
        const now = new Date();
        const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);

        const [pendentes, aprovadasMes, reprovadasMes, totalMes] = await Promise.all([
            SolicitacaoAtualizacao.count({ where: { status: 'pendente' } }),
            SolicitacaoAtualizacao.count({
                where: {
                    status: 'aprovada',
                    data_avaliacao: { [Op.gte]: inicioMes }
                }
            }),
            SolicitacaoAtualizacao.count({
                where: {
                    status: 'reprovada',
                    data_avaliacao: { [Op.gte]: inicioMes }
                }
            }),
            SolicitacaoAtualizacao.count({
                where: { created_at: { [Op.gte]: inicioMes } }
            })
        ]);

        res.json({ pendentes, aprovadasMes, reprovadasMes, totalMes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
