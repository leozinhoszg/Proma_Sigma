const { Op } = require('sequelize');
const { sequelize, Fornecedor, Contrato, Sequencia, Medicao, SolicitacaoAtualizacao } = require('../models');
const auditService = require('../services/auditService');
const { buildSetorFilter } = require('../middleware/setorFilter');

// Listar todos os fornecedores
exports.getAll = async (req, res) => {
    try {
        const setorFilter = buildSetorFilter(req);
        const fornecedores = await Fornecedor.findAll({
            where: { ...setorFilter },
            order: [['nome', 'ASC']]
        });
        res.json(fornecedores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Buscar fornecedor por ID
exports.getById = async (req, res) => {
    try {
        const setorFilter = buildSetorFilter(req);
        const fornecedor = await Fornecedor.findOne({
            where: { id: req.params.id, ...setorFilter }
        });
        if (!fornecedor) {
            return res.status(404).json({ message: 'Fornecedor nao encontrado' });
        }
        res.json(fornecedor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Criar novo fornecedor
exports.create = async (req, res) => {
    try {
        if (!req.user.setor_id && !req.user.isAdmin) {
            return res.status(400).json({ message: 'Usuario nao possui setor atribuido. Contate o administrador.' });
        }

        const novoFornecedor = await Fornecedor.create({
            nome: req.body.nome,
            setor_id: req.user.setor_id
        });

        // Log de auditoria
        await auditService.logCrud(req, 'CRIAR', 'FORNECEDOR', 'Fornecedor', {
            recursoId: novoFornecedor.id,
            recursoNome: novoFornecedor.nome,
            descricao: `Fornecedor criado: ${novoFornecedor.nome}`,
            dadosNovos: { nome: novoFornecedor.nome, setor_id: novoFornecedor.setor_id }
        });

        res.status(201).json(novoFornecedor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Atualizar fornecedor
exports.update = async (req, res) => {
    try {
        const setorFilter = buildSetorFilter(req);
        const fornecedorAnterior = await Fornecedor.findOne({
            where: { id: req.params.id, ...setorFilter }
        });
        if (!fornecedorAnterior) {
            return res.status(404).json({ message: 'Fornecedor nao encontrado' });
        }

        await Fornecedor.update(
            { nome: req.body.nome },
            { where: { id: req.params.id } }
        );

        const fornecedor = await Fornecedor.findByPk(req.params.id);

        // Log de auditoria
        await auditService.logCrud(req, 'ATUALIZAR', 'FORNECEDOR', 'Fornecedor', {
            recursoId: fornecedor.id,
            recursoNome: fornecedor.nome,
            descricao: `Fornecedor atualizado: ${fornecedor.nome}`,
            dadosAnteriores: { nome: fornecedorAnterior.nome },
            dadosNovos: { nome: fornecedor.nome }
        });

        res.json(fornecedor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Excluir fornecedor (cascata)
exports.delete = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const setorFilter = buildSetorFilter(req);
        const fornecedor = await Fornecedor.findOne({
            where: { id: req.params.id, ...setorFilter },
            transaction: t
        });
        if (!fornecedor) {
            await t.rollback();
            return res.status(404).json({ message: 'Fornecedor nao encontrado' });
        }

        // Buscar contratos do fornecedor (mesmo setor)
        const contratos = await Contrato.findAll({
            where: { fornecedor_id: req.params.id, ...setorFilter },
            transaction: t
        });
        const contratoIds = contratos.map(c => c.id);

        if (contratoIds.length > 0) {
            // Buscar sequencias dos contratos
            const sequencias = await Sequencia.findAll({
                where: { contrato_id: { [Op.in]: contratoIds } },
                attributes: ['id'],
                transaction: t
            });
            const sequenciaIds = sequencias.map(s => s.id);

            if (sequenciaIds.length > 0) {
                // Excluir medicoes das sequencias
                await Medicao.destroy({
                    where: { sequencia_id: { [Op.in]: sequenciaIds } },
                    transaction: t
                });

                // Excluir solicitacoes de atualizacao das sequencias
                await SolicitacaoAtualizacao.destroy({
                    where: { sequencia_id: { [Op.in]: sequenciaIds } },
                    transaction: t
                });
            }

            // Excluir solicitacoes de atualizacao dos contratos (que possam referenciar contratos diretamente)
            await SolicitacaoAtualizacao.destroy({
                where: { contrato_id: { [Op.in]: contratoIds } },
                transaction: t
            });

            // Excluir sequencias dos contratos
            await Sequencia.destroy({
                where: { contrato_id: { [Op.in]: contratoIds } },
                transaction: t
            });
        }

        // Excluir solicitacoes de atualizacao do fornecedor
        await SolicitacaoAtualizacao.destroy({
            where: { fornecedor_id: req.params.id },
            transaction: t
        });

        // Excluir contratos
        await Contrato.destroy({
            where: { fornecedor_id: req.params.id, ...setorFilter },
            transaction: t
        });

        // Excluir fornecedor
        await Fornecedor.destroy({
            where: { id: req.params.id },
            transaction: t
        });

        await t.commit();

        // Log de auditoria
        await auditService.logCrud(req, 'EXCLUIR', 'FORNECEDOR', 'Fornecedor', {
            recursoId: req.params.id,
            recursoNome: fornecedor.nome,
            descricao: `Fornecedor excluido em cascata: ${fornecedor.nome}`,
            dadosAnteriores: { nome: fornecedor.nome },
            metadados: {
                contratosExcluidos: contratos.length,
                sequenciasExcluidas: contratoIds.length > 0 ? 'sim' : 'nao'
            },
            nivel: 'CRITICAL'
        });

        res.json({ message: 'Fornecedor excluido com sucesso' });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};
