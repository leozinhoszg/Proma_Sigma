const express = require('express');
const router = express.Router();
const notificacaoController = require('../controllers/notificacaoController');
const { autenticar } = require('../middleware/auth');

router.use(autenticar);

router.get('/', notificacaoController.listar);
router.get('/nao-lidas', notificacaoController.contarNaoLidas);
router.patch('/lidas', notificacaoController.marcarTodasComoLidas);
router.patch('/:id/lida', notificacaoController.marcarComoLida);

module.exports = router;
