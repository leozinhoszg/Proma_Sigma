const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Setor = sequelize.define('Setor', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    nome: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: { msg: 'Nome do setor e obrigatorio' },
            len: { args: [1, 100], msg: 'Nome deve ter no maximo 100 caracteres' }
        },
        set(val) {
            this.setDataValue('nome', val ? val.toUpperCase().trim() : val);
        }
    },
    ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'setores',
    indexes: [
        { fields: ['nome'] }
    ]
});

module.exports = Setor;
