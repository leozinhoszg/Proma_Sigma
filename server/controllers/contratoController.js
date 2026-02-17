const { Op } = require('sequelize');
const { sequelize, Contrato, Sequencia, Estabelecimento, Fornecedor, Empresa, Medicao, SolicitacaoAtualizacao } = require('../models');
const auditService = require('../services/auditService');
const { buildSetorFilter } = require('../middleware/setorFilter');

// Include padrao para contrato com fornecedor e estabelecimento->empresa
const contratoInclude = [
    { model: Fornecedor, as: 'fornecedor', attributes: ['id', 'nome'] },
    {
        model: Estabelecimento,
        as: 'estabelecimento',
        attributes: ['id', 'cod_estabel', 'nome'],
        include: [
            { model: Empresa, as: 'empresa', attributes: ['id', 'cod_empresa', 'nome'] }
        ]
    }
];

// Listar todos os contratos
exports.getAll = async (req, res) => {
    try {
        const setorFilter = buildSetorFilter(req);
        const where = { ...setorFilter };
        if (req.query.fornecedor) {
            where.fornecedor_id = req.query.fornecedor;
        }
        const contratos = await Contrato.findAll({
            where,
            include: contratoInclude,
            order: [['nr_contrato', 'ASC']]
        });
        res.json(contratos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Buscar contrato por ID
exports.getById = async (req, res) => {
    try {
        const setorFilter = buildSetorFilter(req);
        const contrato = await Contrato.findOne({
            where: { id: req.params.id, ...setorFilter },
            include: contratoInclude
        });
        if (!contrato) {
            return res.status(404).json({ message: 'Contrato nao encontrado' });
        }
        res.json(contrato);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Criar novo contrato
exports.create = async (req, res) => {
    try {
        if (!req.user.setor_id && !req.user.isAdmin) {
            return res.status(400).json({ message: 'Usuario nao possui setor atribuido. Contate o administrador.' });
        }

        // Verificar se o fornecedor pertence ao setor do usuario
        const setorFilter = buildSetorFilter(req);
        const fornecedor = await Fornecedor.findOne({
            where: { id: req.body.fornecedor, ...setorFilter }
        });
        if (!fornecedor) {
            return res.status(404).json({ message: 'Fornecedor nao encontrado no seu setor' });
        }

        // Verificar se o estabelecimento existe e buscar cod_estabel
        const estabelecimento = await Estabelecimento.findByPk(req.body.estabelecimento, {
            include: [{ model: Empresa, as: 'empresa', attributes: ['id', 'cod_empresa', 'nome'] }]
        });
        if (!estabelecimento) {
            return res.status(400).json({ message: 'Estabelecimento nao encontrado' });
        }

        const contrato = await Contrato.create({
            fornecedor_id: req.body.fornecedor,
            nr_contrato: req.body.nr_contrato,
            estabelecimento_id: req.body.estabelecimento,
            cod_estabel: estabelecimento.cod_estabel,
            observacao: req.body.observacao || '',
            setor_id: req.user.setor_id
        });

        const contratoPopulado = await Contrato.findByPk(contrato.id, {
            include: contratoInclude
        });

        // Log de auditoria
        await auditService.logCrud(req, 'CRIAR', 'CONTRATO', 'Contrato', {
            recursoId: contrato.id,
            recursoNome: `Contrato ${contrato.nr_contrato}`,
            descricao: `Contrato criado: ${contrato.nr_contrato} - ${contratoPopulado.fornecedor?.nome} - ${estabelecimento.nome}`,
            dadosNovos: {
                nr_contrato: contrato.nr_contrato,
                cod_estabel: contrato.cod_estabel,
                estabelecimento: estabelecimento.nome,
                empresa: estabelecimento.empresa?.nome,
                fornecedor: contratoPopulado.fornecedor?.nome,
                setor_id: contrato.setor_id
            }
        });

        res.status(201).json(contratoPopulado);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Atualizar contrato
exports.update = async (req, res) => {
    try {
        const setorFilter = buildSetorFilter(req);
        const contratoAnterior = await Contrato.findOne({
            where: { id: req.params.id, ...setorFilter },
            include: contratoInclude
        });
        if (!contratoAnterior) {
            return res.status(404).json({ message: 'Contrato nao encontrado' });
        }

        const updateData = {};
        if (req.body.fornecedor) updateData.fornecedor_id = req.body.fornecedor;
        if (req.body.nr_contrato) updateData.nr_contrato = req.body.nr_contrato;
        if (req.body.observacao !== undefined) updateData.observacao = req.body.observacao;

        // Se estiver mudando o estabelecimento, buscar e atualizar cod_estabel
        if (req.body.estabelecimento) {
            const estabelecimento = await Estabelecimento.findByPk(req.body.estabelecimento);
            if (!estabelecimento) {
                return res.status(400).json({ message: 'Estabelecimento nao encontrado' });
            }
            updateData.estabelecimento_id = req.body.estabelecimento;
            updateData.cod_estabel = estabelecimento.cod_estabel;
        }

        await Contrato.update(updateData, { where: { id: req.params.id } });

        const contrato = await Contrato.findByPk(req.params.id, {
            include: contratoInclude
        });

        // Log de auditoria
        await auditService.logCrud(req, 'ATUALIZAR', 'CONTRATO', 'Contrato', {
            recursoId: contrato.id,
            recursoNome: `Contrato ${contrato.nr_contrato}`,
            descricao: `Contrato atualizado: ${contrato.nr_contrato}`,
            dadosAnteriores: {
                nr_contrato: contratoAnterior.nr_contrato,
                cod_estabel: contratoAnterior.cod_estabel,
                estabelecimento: contratoAnterior.estabelecimento?.nome,
                empresa: contratoAnterior.estabelecimento?.empresa?.nome,
                observacao: contratoAnterior.observacao
            },
            dadosNovos: {
                nr_contrato: contrato.nr_contrato,
                cod_estabel: contrato.cod_estabel,
                estabelecimento: contrato.estabelecimento?.nome,
                empresa: contrato.estabelecimento?.empresa?.nome,
                observacao: contrato.observacao
            }
        });

        res.json(contrato);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Excluir contrato (cascata)
exports.delete = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const setorFilter = buildSetorFilter(req);
        const contrato = await Contrato.findOne({
            where: { id: req.params.id, ...setorFilter },
            include: contratoInclude,
            transaction: t
        });
        if (!contrato) {
            await t.rollback();
            return res.status(404).json({ message: 'Contrato nao encontrado' });
        }

        // Buscar sequencias do contrato
        const sequencias = await Sequencia.findAll({
            where: { contrato_id: req.params.id },
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

        // Excluir solicitacoes de atualizacao do contrato
        await SolicitacaoAtualizacao.destroy({
            where: { contrato_id: req.params.id },
            transaction: t
        });

        // Excluir sequencias do contrato
        await Sequencia.destroy({
            where: { contrato_id: req.params.id },
            transaction: t
        });

        // Excluir contrato
        await Contrato.destroy({
            where: { id: req.params.id },
            transaction: t
        });

        await t.commit();

        // Log de auditoria
        await auditService.logCrud(req, 'EXCLUIR', 'CONTRATO', 'Contrato', {
            recursoId: req.params.id,
            recursoNome: `Contrato ${contrato.nr_contrato}`,
            descricao: `Contrato excluido em cascata: ${contrato.nr_contrato} - ${contrato.fornecedor?.nome} - ${contrato.estabelecimento?.nome}`,
            dadosAnteriores: {
                nr_contrato: contrato.nr_contrato,
                cod_estabel: contrato.cod_estabel,
                estabelecimento: contrato.estabelecimento?.nome,
                empresa: contrato.estabelecimento?.empresa?.nome,
                fornecedor: contrato.fornecedor?.nome
            },
            metadados: { sequenciasExcluidas: sequencias.length },
            nivel: 'CRITICAL'
        });

        res.json({ message: 'Contrato excluido com sucesso' });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};
