const { Empresa, Estabelecimento } = require('../models');
const auditService = require('../services/auditService');

// Listar todas as empresas
exports.getAll = async (req, res) => {
    try {
        const empresas = await Empresa.find().sort({ nome: 1 }).populate('estabelecimentos');
        res.json(empresas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Buscar empresa por ID
exports.getById = async (req, res) => {
    try {
        const empresa = await Empresa.findById(req.params.id).populate('estabelecimentos');
        if (!empresa) {
            return res.status(404).json({ message: 'Empresa nao encontrada' });
        }
        res.json(empresa);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Criar nova empresa
exports.create = async (req, res) => {
    try {
        const empresa = new Empresa({
            codEmpresa: req.body.codEmpresa,
            nome: req.body.nome,
            ativo: req.body.ativo !== undefined ? req.body.ativo : true
        });
        const novaEmpresa = await empresa.save();

        // Log de auditoria
        await auditService.logCrud(req, 'CRIAR', 'EMPRESA', 'Empresa', {
            recursoId: novaEmpresa._id,
            recursoNome: novaEmpresa.nome,
            descricao: `Empresa criada: ${novaEmpresa.nome} (${novaEmpresa.codEmpresa})`,
            dadosNovos: { codEmpresa: novaEmpresa.codEmpresa, nome: novaEmpresa.nome }
        });

        res.status(201).json(novaEmpresa);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Atualizar empresa
exports.update = async (req, res) => {
    try {
        const empresaAnterior = await Empresa.findById(req.params.id);
        if (!empresaAnterior) {
            return res.status(404).json({ message: 'Empresa nao encontrada' });
        }

        const empresa = await Empresa.findByIdAndUpdate(
            req.params.id,
            {
                codEmpresa: req.body.codEmpresa,
                nome: req.body.nome,
                ativo: req.body.ativo
            },
            { new: true, runValidators: true }
        );

        // Log de auditoria
        await auditService.logCrud(req, 'ATUALIZAR', 'EMPRESA', 'Empresa', {
            recursoId: empresa._id,
            recursoNome: empresa.nome,
            descricao: `Empresa atualizada: ${empresa.nome}`,
            dadosAnteriores: { codEmpresa: empresaAnterior.codEmpresa, nome: empresaAnterior.nome, ativo: empresaAnterior.ativo },
            dadosNovos: { codEmpresa: empresa.codEmpresa, nome: empresa.nome, ativo: empresa.ativo }
        });

        res.json(empresa);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Excluir empresa (cascata)
exports.delete = async (req, res) => {
    try {
        const empresa = await Empresa.findById(req.params.id);
        if (!empresa) {
            return res.status(404).json({ message: 'Empresa nao encontrada' });
        }

        // Contar estabelecimentos que serao excluidos
        const estabelecimentos = await Estabelecimento.find({ empresa: req.params.id });

        // Excluir estabelecimentos
        await Estabelecimento.deleteMany({ empresa: req.params.id });

        // Excluir empresa
        await Empresa.findByIdAndDelete(req.params.id);

        // Log de auditoria
        await auditService.logCrud(req, 'EXCLUIR', 'EMPRESA', 'Empresa', {
            recursoId: req.params.id,
            recursoNome: empresa.nome,
            descricao: `Empresa excluida em cascata: ${empresa.nome}`,
            dadosAnteriores: { codEmpresa: empresa.codEmpresa, nome: empresa.nome },
            metadados: {
                estabelecimentosExcluidos: estabelecimentos.length
            },
            nivel: 'CRITICAL'
        });

        res.json({ message: 'Empresa excluida com sucesso' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
