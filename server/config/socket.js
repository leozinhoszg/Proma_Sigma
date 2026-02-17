const { Server } = require('socket.io');
const authService = require('../services/authService');
const { User, Perfil, PerfilPermissao } = require('../models');

let io = null;

function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    // JWT authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) {
                return next(new Error('Token nao fornecido'));
            }

            const decoded = authService.verificarAccessToken(token);

            const user = await User.findByPk(decoded.id, {
                include: [{
                    model: Perfil,
                    as: 'perfil',
                    include: [{ model: PerfilPermissao, as: 'permissoesRef' }]
                }]
            });

            if (!user || !user.ativo) {
                return next(new Error('Usuario nao encontrado ou inativo'));
            }

            socket.userId = decoded.id;
            socket.userPermissoes = user.perfil?.permissoesRef?.map(p => p.permissao) || [];
            socket.isAdmin = user.perfil?.is_admin || false;

            next();
        } catch (error) {
            next(new Error('Token invalido'));
        }
    });

    io.on('connection', (socket) => {
        // Join personal room
        socket.join(`user:${socket.userId}`);

        // Join compras room if user has permission
        if (socket.isAdmin || socket.userPermissoes.includes('compras')) {
            socket.join('compras');
        }

        socket.on('disconnect', () => {
            // Cleanup handled automatically by Socket.IO
        });
    });

    return io;
}

function getIO() {
    if (!io) {
        throw new Error('Socket.IO nao inicializado. Chame initSocket primeiro.');
    }
    return io;
}

module.exports = { initSocket, getIO };
