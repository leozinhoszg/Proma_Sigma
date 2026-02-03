const express = require('express');
const router = express.Router();
const { estabelecimentoController } = require('../controllers');
const { autenticar, autorizarPermissao } = require('../middleware/auth');

// Todas as rotas requerem autenticacao e permissao de estabelecimentos
router.use(autenticar);
router.use(autorizarPermissao('estabelecimentos'));

router.get('/', estabelecimentoController.getAll);
router.get('/:id', estabelecimentoController.getById);
router.post('/', estabelecimentoController.create);
router.put('/:id', estabelecimentoController.update);
router.delete('/:id', estabelecimentoController.delete);

module.exports = router;
