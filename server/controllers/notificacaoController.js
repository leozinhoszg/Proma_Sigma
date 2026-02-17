const notificacaoService = require('../services/notificacaoService');

exports.listar = async (req, res) => {
    try {
        const { pagina, limite, apenasNaoLidas } = req.query;
        const resultado = await notificacaoService.listar(req.user.id, {
            pagina: parseInt(pagina) || 1,
            limite: parseInt(limite) || 20,
            apenasNaoLidas: apenasNaoLidas === 'true'
        });
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.contarNaoLidas = async (req, res) => {
    try {
        const count = await notificacaoService.contarNaoLidas(req.user.id);
        res.json({ naoLidas: count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.marcarComoLida = async (req, res) => {
    try {
        const notificacao = await notificacaoService.marcarComoLida(req.params.id, req.user.id);
        if (!notificacao) {
            return res.status(404).json({ message: 'Notificacao nao encontrada' });
        }
        res.json(notificacao);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.marcarTodasComoLidas = async (req, res) => {
    try {
        const count = await notificacaoService.marcarTodasComoLidas(req.user.id);
        res.json({ message: `${count} notificacoes marcadas como lidas` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
