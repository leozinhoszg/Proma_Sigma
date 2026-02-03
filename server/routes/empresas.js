const express = require('express');
const router = express.Router();
const { empresaController } = require('../controllers');
const { autenticar, autorizarPermissao } = require('../middleware/auth');

// Todas as rotas requerem autenticacao e permissao de empresas
router.use(autenticar);
router.use(autorizarPermissao('empresas'));

router.get('/', empresaController.getAll);
router.get('/:id', empresaController.getById);
router.post('/', empresaController.create);
router.put('/:id', empresaController.update);
router.delete('/:id', empresaController.delete);

module.exports = router;
