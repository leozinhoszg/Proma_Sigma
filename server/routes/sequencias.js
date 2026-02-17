const express = require('express');
const router = express.Router();
const { sequenciaController } = require('../controllers');
const { autenticar, autorizarPermissao } = require('../middleware/auth');

// Todas as rotas requerem autenticacao
router.use(autenticar);

// Leitura: qualquer usuario autenticado (necessario para dropdowns em outras paginas)
router.get('/', sequenciaController.getAll);
router.get('/buscar', sequenciaController.buscar);
router.get('/:id', sequenciaController.getById);

// Escrita: requer permissao de contratos (sequencias fazem parte de contratos)
router.post('/', autorizarPermissao('contratos'), sequenciaController.create);
router.put('/:id', autorizarPermissao('contratos'), sequenciaController.update);
router.patch('/:id/status', autorizarPermissao('contratos'), sequenciaController.updateStatus);
router.delete('/:id', autorizarPermissao('contratos'), sequenciaController.delete);

module.exports = router;
