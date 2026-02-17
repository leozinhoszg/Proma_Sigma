const express = require('express');
const router = express.Router();
const { fornecedorController } = require('../controllers');
const { autenticar, autorizarPermissao } = require('../middleware/auth');

// Todas as rotas requerem autenticacao
router.use(autenticar);

// Leitura: qualquer usuario autenticado (necessario para dropdowns em outras paginas)
router.get('/', fornecedorController.getAll);
router.get('/:id', fornecedorController.getById);

// Escrita: requer permissao de fornecedores
router.post('/', autorizarPermissao('fornecedores'), fornecedorController.create);
router.put('/:id', autorizarPermissao('fornecedores'), fornecedorController.update);
router.delete('/:id', autorizarPermissao('fornecedores'), fornecedorController.delete);

module.exports = router;
