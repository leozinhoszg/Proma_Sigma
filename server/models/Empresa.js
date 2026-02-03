const mongoose = require('mongoose');

const empresaSchema = new mongoose.Schema({
    codEmpresa: {
        type: String,
        required: [true, 'Código da empresa é obrigatório'],
        unique: true,
        trim: true
    },
    nome: {
        type: String,
        required: [true, 'Nome da empresa é obrigatório'],
        trim: true,
        uppercase: true
    },
    ativo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Virtual para obter estabelecimentos da empresa
empresaSchema.virtual('estabelecimentos', {
    ref: 'Estabelecimento',
    localField: '_id',
    foreignField: 'empresa'
});

// Garantir que virtuals sejam incluídos no JSON
empresaSchema.set('toJSON', { virtuals: true });
empresaSchema.set('toObject', { virtuals: true });

// Index para busca por código
empresaSchema.index({ codEmpresa: 1 });

module.exports = mongoose.model('Empresa', empresaSchema);
