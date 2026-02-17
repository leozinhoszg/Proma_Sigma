const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notificacao = sequelize.define('Notificacao', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    usuario_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    tipo: {
        type: DataTypes.ENUM(
            'solicitacao_criada',
            'solicitacao_aprovada',
            'solicitacao_reprovada'
        ),
        allowNull: false
    },
    titulo: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    mensagem: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    referencia_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: null
    },
    lida: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    lida_em: {
        type: DataTypes.DATE,
        defaultValue: null
    },
    metadados: {
        type: DataTypes.JSON,
        defaultValue: null
    }
}, {
    tableName: 'notificacoes',
    indexes: [
        { fields: ['usuario_id', 'lida', { attribute: 'created_at', order: 'DESC' }] },
        { fields: ['usuario_id', { attribute: 'created_at', order: 'DESC' }] },
        { fields: ['tipo'] }
    ]
});

module.exports = Notificacao;
