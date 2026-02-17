/**
 * Script de migracao para atualizar ENUMs no MySQL.
 * MySQL nao altera ENUMs automaticamente via Sequelize sync().
 * Execute este script ANTES de iniciar o servidor apos as alteracoes.
 *
 * Uso: node server/scripts/migrateEnums.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { sequelize } = require('../config/db');

const migrateEnums = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conectado ao MySQL');

        // Verificar se a tabela perfil_permissoes existe
        const [tables] = await sequelize.query(
            "SHOW TABLES LIKE 'perfil_permissoes'"
        );

        if (tables.length > 0) {
            console.log('Atualizando ENUM de perfil_permissoes.permissao...');
            await sequelize.query(`
                ALTER TABLE perfil_permissoes MODIFY COLUMN permissao ENUM(
                    'dashboard', 'fornecedores', 'contratos', 'relatorio',
                    'usuarios', 'perfis', 'auditoria', 'empresas', 'estabelecimentos',
                    'solicitacoes', 'compras'
                ) NOT NULL
            `);
            console.log('perfil_permissoes.permissao atualizado');
        } else {
            console.log('Tabela perfil_permissoes nao existe ainda (sera criada pelo sync)');
        }

        // Verificar se a tabela audit_logs existe
        const [auditTables] = await sequelize.query(
            "SHOW TABLES LIKE 'audit_logs'"
        );

        if (auditTables.length > 0) {
            console.log('Atualizando ENUM de audit_logs.acao...');
            await sequelize.query(`
                ALTER TABLE audit_logs MODIFY COLUMN acao ENUM(
                    'LOGIN_SUCESSO', 'LOGIN_FALHA', 'LOGIN_BLOQUEADO', 'LOGOUT', 'LOGOUT_TODOS',
                    'REGISTRO', 'CONTA_ATIVADA', 'SENHA_ALTERADA', 'SENHA_RESET',
                    'SENHA_RESET_SOLICITADO', 'EMAIL_VERIFICADO', 'OTP_SOLICITADO',
                    'OTP_VERIFICADO', 'TOKEN_REFRESH', 'CRIAR', 'ATUALIZAR', 'EXCLUIR',
                    'VISUALIZAR', 'ATIVAR', 'DESATIVAR', 'ALTERAR_PERMISSOES', 'ALTERAR_PERFIL',
                    'SINCRONIZAR', 'SINCRONIZAR_LOTE', 'EXPORTAR', 'IMPORTAR',
                    'EMAIL_ENVIADO', 'EMAIL_FALHA', 'APROVAR', 'REPROVAR'
                ) NOT NULL
            `);
            console.log('audit_logs.acao atualizado');

            console.log('Atualizando ENUM de audit_logs.categoria...');
            await sequelize.query(`
                ALTER TABLE audit_logs MODIFY COLUMN categoria ENUM(
                    'AUTH', 'USUARIO', 'PERFIL', 'FORNECEDOR', 'CONTRATO', 'SEQUENCIA',
                    'MEDICAO', 'SISTEMA', 'EMAIL', 'EMPRESA', 'ESTABELECIMENTO', 'SOLICITACAO'
                ) NOT NULL
            `);
            console.log('audit_logs.categoria atualizado');
        } else {
            console.log('Tabela audit_logs nao existe ainda (sera criada pelo sync)');
        }

        console.log('Migracao de ENUMs concluida com sucesso!');
    } catch (error) {
        console.error('Erro na migracao:', error.message);
        process.exit(1);
    } finally {
        await sequelize.close();
        console.log('Desconectado do MySQL');
    }
};

if (require.main === module) {
    migrateEnums();
}

module.exports = migrateEnums;
