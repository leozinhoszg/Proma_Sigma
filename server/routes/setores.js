const express = require('express');
const router = express.Router();
const { setorController } = require('../controllers');
const { autenticar, autorizarPermissao } = require('../middleware/auth');

// Todas as rotas requerem autenticacao
router.use(autenticar);

// Listar setores - qualquer autenticado (para popular dropdowns)
router.get('/', setorController.getAll);

// CRUD - requer permissao de usuarios (admin)
router.post('/', autorizarPermissao('usuarios'), setorController.create);
router.put('/:id', autorizarPermissao('usuarios'), setorController.update);
router.delete('/:id', autorizarPermissao('usuarios'), setorController.delete);

module.exports = router;
