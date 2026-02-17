const express = require('express');
const router = express.Router();
const { solicitacaoController } = require('../controllers');
const { autenticar, autorizarPermissao } = require('../middleware/auth');
const { upload } = require('../config/upload');

router.use(autenticar);

// Rotas de Compras (devem vir ANTES de /:id para evitar conflito)
router.get('/compras/estatisticas', autorizarPermissao('compras'), solicitacaoController.getEstatisticas);
router.get('/compras/listar', autorizarPermissao('compras'), solicitacaoController.getAllCompras);
router.patch('/:id/aprovar', autorizarPermissao('compras'), solicitacaoController.aprovar);
router.patch('/:id/reprovar', autorizarPermissao('compras'), solicitacaoController.reprovar);

// Rotas de Solicitacoes (usuario comum)
router.get('/', autorizarPermissao('solicitacoes'), solicitacaoController.getAll);
router.post('/', autorizarPermissao('solicitacoes'), upload.single('anexo_pdf'), solicitacaoController.create);

// Detalhes e anexo: acessivel por solicitacoes OU compras
const permitirSolicitacoesOuCompras = (req, res, next) => {
    if (req.user.isAdmin) return next();
    if (req.user.permissoes && (req.user.permissoes.includes('solicitacoes') || req.user.permissoes.includes('compras'))) {
        return next();
    }
    return res.status(403).json({ message: 'Acesso negado. Voce nao tem permissao para acessar este recurso.' });
};
router.get('/:id', permitirSolicitacoesOuCompras, solicitacaoController.getById);
router.get('/:id/anexo', permitirSolicitacoesOuCompras, solicitacaoController.downloadAnexo);

module.exports = router;
