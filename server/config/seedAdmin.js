const mongoose = require('mongoose');
const { User } = require('../models');
require('dotenv').config();

const criarUsuarioAdmin = async () => {
    try {
        // Conectar ao banco
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado ao MongoDB');

        // Verificar se ja existe um admin
        const adminExistente = await User.findOne({ perfil: 'admin' });

        if (adminExistente) {
            console.log('Usuario admin ja existe:');
            console.log(`  Usuario: ${adminExistente.usuario}`);
            console.log(`  Email: ${adminExistente.email}`);
            return;
        }

        // Criar usuario admin
        const admin = new User({
            usuario: 'admin',
            email: 'admin@sistema.local',
            senha: 'Admin@123',
            perfil: 'admin',
            ativo: true,
            emailVerificado: true // Admin nao precisa verificar email
        });

        await admin.save();

        console.log('Usuario admin criado com sucesso!');
        console.log('================================');
        console.log('  Usuario: admin');
        console.log('  Email: admin@sistema.local');
        console.log('  Senha: Admin@123');
        console.log('  Perfil: admin');
        console.log('================================');
        console.log('IMPORTANTE: Altere a senha apos o primeiro login!');

    } catch (error) {
        console.error('Erro ao criar usuario admin:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Desconectado do MongoDB');
    }
};

// Executar se chamado diretamente
if (require.main === module) {
    criarUsuarioAdmin();
}

module.exports = criarUsuarioAdmin;
