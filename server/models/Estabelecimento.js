const mongoose = require('mongoose');

const estabelecimentoSchema = new mongoose.Schema({
    empresa: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Empresa',
        required: [true, 'Empresa é obrigatória']
    },
    codEstabel: {
        type: String,
        required: [true, 'Código do estabelecimento é obrigatório'],
        trim: true
    },
    nome: {
        type: String,
        required: [true, 'Nome do estabelecimento é obrigatório'],
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

// Index composto para garantir que código do estabelecimento seja único por empresa
estabelecimentoSchema.index({ empresa: 1, codEstabel: 1 }, { unique: true });

// Garantir que virtuals sejam incluídos no JSON
estabelecimentoSchema.set('toJSON', { virtuals: true });
estabelecimentoSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Estabelecimento', estabelecimentoSchema);
