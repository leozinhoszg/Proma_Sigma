const express = require('express');
const router = express.Router();
const { contratoController } = require('../controllers');
const { autenticar, autorizarPermissao } = require('../middleware/auth');

// Todas as rotas requerem autenticacao
router.use(autenticar);

// Leitura: qualquer usuario autenticado (necessario para dropdowns em outras paginas)
router.get('/', contratoController.getAll);
router.get('/:id', contratoController.getById);

// Escrita: requer permissao de contratos
router.post('/', autorizarPermissao('contratos'), contratoController.create);
router.put('/:id', autorizarPermissao('contratos'), contratoController.update);
router.delete('/:id', autorizarPermissao('contratos'), contratoController.delete);

module.exports = router;
