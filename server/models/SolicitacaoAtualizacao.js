const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SolicitacaoAtualizacao = sequelize.define('SolicitacaoAtualizacao', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    solicitante_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    setor_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: null
    },
    fornecedor_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    contrato_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    sequencia_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    observacao: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Observacao e obrigatoria' }
        }
    },
    anexo_pdf: {
        type: DataTypes.STRING(500),
        defaultValue: null
    },
    novo_valor: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: null,
        get() {
            const val = this.getDataValue('novo_valor');
            return val !== null ? parseFloat(val) : null;
        }
    },
    novo_dia_emissao: {
        type: DataTypes.INTEGER,
        defaultValue: null,
        validate: {
            min: { args: [1], msg: 'Dia de emissao deve ser no minimo 1' },
            max: { args: [31], msg: 'Dia de emissao deve ser no maximo 31' }
        }
    },
    status: {
        type: DataTypes.ENUM('pendente', 'aprovada', 'reprovada'),
        allowNull: false,
        defaultValue: 'pendente'
    },
    avaliador_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: null
    },
    data_avaliacao: {
        type: DataTypes.DATE,
        defaultValue: null
    },
    motivo_reprovacao: {
        type: DataTypes.TEXT,
        defaultValue: null
    }
}, {
    tableName: 'solicitacoes_atualizacao',
    indexes: [
        { fields: ['status', { attribute: 'created_at', order: 'DESC' }] },
        { fields: ['solicitante_id', { attribute: 'created_at', order: 'DESC' }] },
        { fields: ['contrato_id'] },
        { fields: ['sequencia_id'] }
    ]
});

module.exports = SolicitacaoAtualizacao;
