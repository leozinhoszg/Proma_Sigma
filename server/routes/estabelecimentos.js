const express = require('express');
const router = express.Router();
const { estabelecimentoController } = require('../controllers');
const { autenticar, autorizarPermissao } = require('../middleware/auth');

// Todas as rotas requerem autenticacao
router.use(autenticar);

// Leitura: qualquer usuario autenticado (necessario para dropdowns em outras paginas)
router.get('/', estabelecimentoController.getAll);
router.get('/:id', estabelecimentoController.getById);

// Escrita: requer permissao de estabelecimentos
router.post('/', autorizarPermissao('estabelecimentos'), estabelecimentoController.create);
router.put('/:id', autorizarPermissao('estabelecimentos'), estabelecimentoController.update);
router.delete('/:id', autorizarPermissao('estabelecimentos'), estabelecimentoController.delete);

module.exports = router;
