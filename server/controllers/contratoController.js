const { Contrato, Sequencia, Estabelecimento } = require('../models');
const auditService = require('../services/auditService');

// Listar todos os contratos
exports.getAll = async (req, res) => {
    try {
        const filter = {};
        if (req.query.fornecedor) {
            filter.fornecedor = req.query.fornecedor;
        }
        const contratos = await Contrato.find(filter)
            .populate('fornecedor', 'nome')
            .populate({
                path: 'estabelecimento',
                select: 'codEstabel nome empresa',
                populate: {
                    path: 'empresa',
                    select: 'codEmpresa nome'
                }
            })
            .sort({ 'nr-contrato': 1 });
        res.json(contratos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Buscar contrato por ID
exports.getById = async (req, res) => {
    try {
        const contrato = await Contrato.findById(req.params.id)
            .populate('fornecedor', 'nome')
            .populate({
                path: 'estabelecimento',
                select: 'codEstabel nome empresa',
                populate: {
                    path: 'empresa',
                    select: 'codEmpresa nome'
                }
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
        // Verificar se o estabelecimento existe e buscar cod-estabel
        const estabelecimento = await Estabelecimento.findById(req.body.estabelecimento)
            .populate('empresa', 'codEmpresa nome');
        if (!estabelecimento) {
            return res.status(400).json({ message: 'Estabelecimento nao encontrado' });
        }

        const contrato = new Contrato({
            fornecedor: req.body.fornecedor,
            'nr-contrato': req.body['nr-contrato'],
            estabelecimento: req.body.estabelecimento,
            'cod-estabel': estabelecimento.codEstabel,
            observacao: req.body.observacao || ''
        });
        const novoContrato = await contrato.save();
        const contratoPopulado = await Contrato.findById(novoContrato._id)
            .populate('fornecedor', 'nome')
            .populate({
                path: 'estabelecimento',
                select: 'codEstabel nome empresa',
                populate: {
                    path: 'empresa',
                    select: 'codEmpresa nome'
                }
            });

        // Log de auditoria
        await auditService.logCrud(req, 'CRIAR', 'CONTRATO', 'Contrato', {
            recursoId: novoContrato._id,
            recursoNome: `Contrato ${novoContrato['nr-contrato']}`,
            descricao: `Contrato criado: ${novoContrato['nr-contrato']} - ${contratoPopulado.fornecedor?.nome} - ${estabelecimento.nome}`,
            dadosNovos: {
                'nr-contrato': novoContrato['nr-contrato'],
                'cod-estabel': novoContrato['cod-estabel'],
                estabelecimento: estabelecimento.nome,
                empresa: estabelecimento.empresa?.nome,
                fornecedor: contratoPopulado.fornecedor?.nome
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
        // Buscar dados anteriores para auditoria
        const contratoAnterior = await Contrato.findById(req.params.id)
            .populate('fornecedor', 'nome')
            .populate({
                path: 'estabelecimento',
                select: 'codEstabel nome empresa',
                populate: {
                    path: 'empresa',
                    select: 'codEmpresa nome'
                }
            });
        if (!contratoAnterior) {
            return res.status(404).json({ message: 'Contrato nao encontrado' });
        }

        const updateData = {};
        if (req.body.fornecedor) updateData.fornecedor = req.body.fornecedor;
        if (req.body['nr-contrato']) updateData['nr-contrato'] = req.body['nr-contrato'];
        if (req.body.observacao !== undefined) updateData.observacao = req.body.observacao;

        // Se estiver mudando o estabelecimento, buscar e atualizar cod-estabel
        if (req.body.estabelecimento) {
            const estabelecimento = await Estabelecimento.findById(req.body.estabelecimento);
            if (!estabelecimento) {
                return res.status(400).json({ message: 'Estabelecimento nao encontrado' });
            }
            updateData.estabelecimento = req.body.estabelecimento;
            updateData['cod-estabel'] = estabelecimento.codEstabel;
        }

        const contrato = await Contrato.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('fornecedor', 'nome')
            .populate({
                path: 'estabelecimento',
                select: 'codEstabel nome empresa',
                populate: {
                    path: 'empresa',
                    select: 'codEmpresa nome'
                }
            });

        // Log de auditoria
        await auditService.logCrud(req, 'ATUALIZAR', 'CONTRATO', 'Contrato', {
            recursoId: contrato._id,
            recursoNome: `Contrato ${contrato['nr-contrato']}`,
            descricao: `Contrato atualizado: ${contrato['nr-contrato']}`,
            dadosAnteriores: {
                'nr-contrato': contratoAnterior['nr-contrato'],
                'cod-estabel': contratoAnterior['cod-estabel'],
                estabelecimento: contratoAnterior.estabelecimento?.nome,
                empresa: contratoAnterior.estabelecimento?.empresa?.nome,
                observacao: contratoAnterior.observacao
            },
            dadosNovos: {
                'nr-contrato': contrato['nr-contrato'],
                'cod-estabel': contrato['cod-estabel'],
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
    try {
        const contrato = await Contrato.findById(req.params.id)
            .populate('fornecedor', 'nome')
            .populate({
                path: 'estabelecimento',
                select: 'codEstabel nome empresa',
                populate: {
                    path: 'empresa',
                    select: 'codEmpresa nome'
                }
            });
        if (!contrato) {
            return res.status(404).json({ message: 'Contrato nao encontrado' });
        }

        // Contar sequencias para log
        const sequenciasCount = await Sequencia.countDocuments({ contrato: req.params.id });

        // Excluir sequencias do contrato
        await Sequencia.deleteMany({ contrato: req.params.id });

        // Excluir contrato
        await Contrato.findByIdAndDelete(req.params.id);

        // Log de auditoria
        await auditService.logCrud(req, 'EXCLUIR', 'CONTRATO', 'Contrato', {
            recursoId: req.params.id,
            recursoNome: `Contrato ${contrato['nr-contrato']}`,
            descricao: `Contrato excluido em cascata: ${contrato['nr-contrato']} - ${contrato.fornecedor?.nome} - ${contrato.estabelecimento?.nome}`,
            dadosAnteriores: {
                'nr-contrato': contrato['nr-contrato'],
                'cod-estabel': contrato['cod-estabel'],
                estabelecimento: contrato.estabelecimento?.nome,
                empresa: contrato.estabelecimento?.empresa?.nome,
                fornecedor: contrato.fornecedor?.nome
            },
            metadados: { sequenciasExcluidas: sequenciasCount },
            nivel: 'CRITICAL'
        });

        res.json({ message: 'Contrato excluido com sucesso' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
