const { Setor, User } = require('../models');
const auditService = require('../services/auditService');

// Listar todos os setores
exports.getAll = async (req, res) => {
    try {
        const { ativo } = req.query;
        const where = {};
        if (ativo !== undefined) {
            where.ativo = ativo === 'true';
        }

        const setores = await Setor.findAll({ where, order: [['nome', 'ASC']] });
        res.json(setores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Buscar setor por ID
exports.getById = async (req, res) => {
    try {
        const setor = await Setor.findByPk(req.params.id);
        if (!setor) {
            return res.status(404).json({ message: 'Setor nao encontrado' });
        }
        res.json(setor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Criar novo setor
exports.create = async (req, res) => {
    try {
        const novoSetor = await Setor.create({
            nome: req.body.nome
        });

        await auditService.logCrud(req, 'CRIAR', 'SISTEMA', 'Setor', {
            recursoId: novoSetor.id,
            recursoNome: novoSetor.nome,
            descricao: `Setor criado: ${novoSetor.nome}`,
            dadosNovos: { nome: novoSetor.nome }
        });

        res.status(201).json(novoSetor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Atualizar setor
exports.update = async (req, res) => {
    try {
        const setorAnterior = await Setor.findByPk(req.params.id);
        if (!setorAnterior) {
            return res.status(404).json({ message: 'Setor nao encontrado' });
        }

        const camposAtualizar = {};
        if (req.body.nome !== undefined) camposAtualizar.nome = req.body.nome;
        if (req.body.ativo !== undefined) camposAtualizar.ativo = req.body.ativo;

        await setorAnterior.update(camposAtualizar);

        const setor = await Setor.findByPk(req.params.id);

        await auditService.logCrud(req, 'ATUALIZAR', 'SISTEMA', 'Setor', {
            recursoId: setor.id,
            recursoNome: setor.nome,
            descricao: `Setor atualizado: ${setor.nome}`,
            dadosAnteriores: { nome: setorAnterior.nome, ativo: setorAnterior.ativo },
            dadosNovos: { nome: setor.nome, ativo: setor.ativo }
        });

        res.json(setor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Excluir setor
exports.delete = async (req, res) => {
    try {
        const setor = await Setor.findByPk(req.params.id);
        if (!setor) {
            return res.status(404).json({ message: 'Setor nao encontrado' });
        }

        // Verificar se ha usuarios vinculados
        const usuariosVinculados = await User.count({ where: { setor_id: req.params.id } });
        if (usuariosVinculados > 0) {
            return res.status(400).json({
                message: `Nao e possivel excluir. ${usuariosVinculados} usuario(s) estao vinculados a este setor.`
            });
        }

        await Setor.destroy({ where: { id: req.params.id } });

        await auditService.logCrud(req, 'EXCLUIR', 'SISTEMA', 'Setor', {
            recursoId: req.params.id,
            recursoNome: setor.nome,
            descricao: `Setor excluido: ${setor.nome}`,
            dadosAnteriores: { nome: setor.nome, ativo: setor.ativo },
            nivel: 'CRITICAL'
        });

        res.json({ message: 'Setor excluido com sucesso' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
