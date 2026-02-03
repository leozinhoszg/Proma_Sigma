const { Estabelecimento, Empresa } = require('../models');
const auditService = require('../services/auditService');

// Listar todos os estabelecimentos
exports.getAll = async (req, res) => {
    try {
        const { empresa } = req.query;
        const filtro = empresa ? { empresa } : {};

        const estabelecimentos = await Estabelecimento.find(filtro)
            .sort({ nome: 1 })
            .populate('empresa', 'codEmpresa nome');
        res.json(estabelecimentos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Buscar estabelecimento por ID
exports.getById = async (req, res) => {
    try {
        const estabelecimento = await Estabelecimento.findById(req.params.id)
            .populate('empresa', 'codEmpresa nome');
        if (!estabelecimento) {
            return res.status(404).json({ message: 'Estabelecimento nao encontrado' });
        }
        res.json(estabelecimento);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Criar novo estabelecimento
exports.create = async (req, res) => {
    try {
        // Verificar se a empresa existe
        const empresa = await Empresa.findById(req.body.empresa);
        if (!empresa) {
            return res.status(400).json({ message: 'Empresa nao encontrada' });
        }

        const estabelecimento = new Estabelecimento({
            empresa: req.body.empresa,
            codEstabel: req.body.codEstabel,
            nome: req.body.nome,
            ativo: req.body.ativo !== undefined ? req.body.ativo : true
        });
        const novoEstabelecimento = await estabelecimento.save();

        // Buscar com populate para retornar dados completos
        const estabelecimentoCompleto = await Estabelecimento.findById(novoEstabelecimento._id)
            .populate('empresa', 'codEmpresa nome');

        // Log de auditoria
        await auditService.logCrud(req, 'CRIAR', 'ESTABELECIMENTO', 'Estabelecimento', {
            recursoId: novoEstabelecimento._id,
            recursoNome: novoEstabelecimento.nome,
            descricao: `Estabelecimento criado: ${novoEstabelecimento.nome} (${novoEstabelecimento.codEstabel}) - Empresa: ${empresa.nome}`,
            dadosNovos: { codEstabel: novoEstabelecimento.codEstabel, nome: novoEstabelecimento.nome, empresa: empresa.nome }
        });

        res.status(201).json(estabelecimentoCompleto);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Atualizar estabelecimento
exports.update = async (req, res) => {
    try {
        const estabelecimentoAnterior = await Estabelecimento.findById(req.params.id)
            .populate('empresa', 'codEmpresa nome');
        if (!estabelecimentoAnterior) {
            return res.status(404).json({ message: 'Estabelecimento nao encontrado' });
        }

        // Se estiver mudando a empresa, verificar se a nova empresa existe
        if (req.body.empresa && req.body.empresa !== estabelecimentoAnterior.empresa.toString()) {
            const empresa = await Empresa.findById(req.body.empresa);
            if (!empresa) {
                return res.status(400).json({ message: 'Empresa nao encontrada' });
            }
        }

        const estabelecimento = await Estabelecimento.findByIdAndUpdate(
            req.params.id,
            {
                empresa: req.body.empresa,
                codEstabel: req.body.codEstabel,
                nome: req.body.nome,
                ativo: req.body.ativo
            },
            { new: true, runValidators: true }
        ).populate('empresa', 'codEmpresa nome');

        // Log de auditoria
        await auditService.logCrud(req, 'ATUALIZAR', 'ESTABELECIMENTO', 'Estabelecimento', {
            recursoId: estabelecimento._id,
            recursoNome: estabelecimento.nome,
            descricao: `Estabelecimento atualizado: ${estabelecimento.nome}`,
            dadosAnteriores: {
                codEstabel: estabelecimentoAnterior.codEstabel,
                nome: estabelecimentoAnterior.nome,
                empresa: estabelecimentoAnterior.empresa?.nome,
                ativo: estabelecimentoAnterior.ativo
            },
            dadosNovos: {
                codEstabel: estabelecimento.codEstabel,
                nome: estabelecimento.nome,
                empresa: estabelecimento.empresa?.nome,
                ativo: estabelecimento.ativo
            }
        });

        res.json(estabelecimento);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Excluir estabelecimento
exports.delete = async (req, res) => {
    try {
        const estabelecimento = await Estabelecimento.findById(req.params.id)
            .populate('empresa', 'codEmpresa nome');
        if (!estabelecimento) {
            return res.status(404).json({ message: 'Estabelecimento nao encontrado' });
        }

        await Estabelecimento.findByIdAndDelete(req.params.id);

        // Log de auditoria
        await auditService.logCrud(req, 'EXCLUIR', 'ESTABELECIMENTO', 'Estabelecimento', {
            recursoId: req.params.id,
            recursoNome: estabelecimento.nome,
            descricao: `Estabelecimento excluido: ${estabelecimento.nome} - Empresa: ${estabelecimento.empresa?.nome}`,
            dadosAnteriores: { codEstabel: estabelecimento.codEstabel, nome: estabelecimento.nome, empresa: estabelecimento.empresa?.nome },
            nivel: 'WARN'
        });

        res.json({ message: 'Estabelecimento excluido com sucesso' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
