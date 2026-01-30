const mongoose = require('mongoose');

// Modelo para armazenar medições da API do ERP (Datasul)
// Campos mapeados diretamente da API: http://192.168.69.213:8080/api/cnp/v1/medicoes
const medicaoSchema = new mongoose.Schema({
    // Referência à sequência do nosso sistema
    sequencia: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sequencia',
        required: true
    },
    // Campos da API ERP (mantidos com mesmos nomes para compatibilidade)
    'num-seq-medicao': {
        type: Number,
        required: true
    },
    'cod-estabel': {
        type: String,
        required: true
    },
    'serie-nota': {
        type: String,
        default: ''
    },
    'sld-val-medicao': {
        type: Number,
        default: 0
    },
    'num-seq-item': {
        type: Number,
        required: true
    },
    'numero-ordem': {
        type: Number,
        default: 0
    },
    'val-medicao': {
        type: Number,
        required: true
    },
    'dat-medicao': {
        type: Date,
        required: true
    },
    'sld-rec-medicao': {
        type: Number,
        default: 0
    },
    'nr-contrato': {
        type: Number,
        required: true
    },
    'dat-prev-medicao': {
        type: Date
    },
    'numero-nota': {
        type: String,
        default: ''
    },
    'nome-emit': {
        type: String,
        default: ''
    },
    'dat-receb': {
        type: Date
    },
    'responsavel': {
        type: String,
        default: ''
    },
    // Campos adicionais do nosso sistema
    mesReferencia: {
        type: String,
        required: true
    },
    statusRegistro: {
        type: String,
        enum: ['registrada', 'nao_registrada', 'pendente'],
        default: 'pendente'
    },
    alertaValor: {
        type: Boolean,
        default: false
    },
    diferencaValor: {
        type: Number,
        default: 0
    },
    sincronizadoEm: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Índice composto para evitar duplicatas de medições
medicaoSchema.index({ 'nr-contrato': 1, 'cod-estabel': 1, 'num-seq-item': 1, 'num-seq-medicao': 1 }, { unique: true });

// Índice para busca por sequência e mês
medicaoSchema.index({ sequencia: 1, mesReferencia: 1 });

module.exports = mongoose.model('Medicao', medicaoSchema);
