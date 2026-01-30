const express = require('express');
const router = express.Router();

const fornecedoresRoutes = require('./fornecedores');
const contratosRoutes = require('./contratos');
const sequenciasRoutes = require('./sequencias');
const relatorioRoutes = require('./relatorio');
const webhooksRoutes = require('./webhooks');
const medicoesRoutes = require('./medicoes');

router.use('/fornecedores', fornecedoresRoutes);
router.use('/contratos', contratosRoutes);
router.use('/sequencias', sequenciasRoutes);
router.use('/relatorio', relatorioRoutes);
router.use('/webhooks', webhooksRoutes);
router.use('/medicoes', medicoesRoutes);

module.exports = router;
