require('dotenv').config();
const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initSocket } = require('./config/socket');
const { sequelize } = require('./config/db');
const { connectDB } = require('./config/db');
// const seedData = require('./config/seed');
const routes = require('./routes');

const app = express();

app.set('trust proxy', process.env.TRUST_PROXY || 'loopback');

// Middleware
app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api', routes);

// Servir arquivos estaticos do frontend
const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendPath));

// SPA fallback
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erro interno do servidor' });
});

const startServer = async () => {
    try {
        // Conectar ao MySQL
        await connectDB();

        // Sincronizar modelos (criar tabelas se nao existirem)
        await sequelize.sync();
        console.log('Tabelas sincronizadas com sucesso');

        // Executar seed se banco estiver vazio
        // await seedData();

        const PORT = process.env.PORT || 3000;
        const HOST = process.env.HOST || '0.0.0.0';

        // Verificar se certificados SSL existem
        const sslKeyPath = path.join(__dirname, 'ssl', 'server.key');
        const sslCertPath = path.join(__dirname, 'ssl', 'server.crt');
        const useSSL = fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath);

        let server;
        if (useSSL) {
            const sslOptions = {
                key: fs.readFileSync(sslKeyPath),
                cert: fs.readFileSync(sslCertPath),
            };
            server = https.createServer(sslOptions, app);
        } else {
            server = http.createServer(app);
        }

        const protocol = useSSL ? 'https' : 'http';

        initSocket(server);
        server.listen(PORT, HOST, () => {
            // Obter IP da rede local
            const os = require('os');
            const interfaces = os.networkInterfaces();
            let networkIP = null;
            for (const name of Object.keys(interfaces)) {
                for (const iface of interfaces[name]) {
                    if (iface.family === 'IPv4' && !iface.internal) {
                        networkIP = iface.address;
                        break;
                    }
                }
                if (networkIP) break;
            }

            console.log(`
========================================
  Servidor rodando na porta ${PORT} (${useSSL ? 'HTTPS' : 'HTTP'})
========================================

  Local:    ${protocol}://localhost:${PORT}
  Network:  ${protocol}://${networkIP || 'N/A'}:${PORT}
  API:      ${protocol}://localhost:${PORT}/api

  Endpoints disponiveis:

  Auth:
  - POST           /api/auth/register
  - POST           /api/auth/login
  - POST           /api/auth/logout
  - POST           /api/auth/refresh-token
  - GET            /api/auth/me
  - POST           /api/auth/forgot-password
  - POST           /api/auth/reset-password/:token

  Recursos:
  - GET/POST       /api/fornecedores
  - GET/PUT/DELETE /api/fornecedores/:id
  - GET/POST       /api/contratos
  - GET/PUT/DELETE /api/contratos/:id
  - GET/POST       /api/sequencias
  - GET/PUT/DELETE /api/sequencias/:id
  - PATCH          /api/sequencias/:id/status
  - GET            /api/relatorio/tabela
  - GET            /api/relatorio/resumo
  - POST           /api/relatorio/seed

  Webhooks (n8n):
  - GET/POST       /api/webhooks
  - GET/PUT/DELETE /api/webhooks/:id
  - GET            /api/webhooks/eventos
  - POST           /api/webhooks/:id/testar
  - POST           /api/webhooks/verificar-atrasadas
  - POST           /api/webhooks/enviar-resumo

  Medicoes (API ERP):
  - GET            /api/medicoes/buscar?contrato=&estabelecimento=&sequencia=
  - GET            /api/medicoes/alertas
  - GET            /api/medicoes/sequencia/:id
  - GET            /api/medicoes/sequencia/:id/status
  - POST           /api/medicoes/sincronizar/:sequenciaId
  - POST           /api/medicoes/sincronizar-todas

========================================
            `);
        });
    } catch (error) {
        console.error('Erro ao iniciar servidor:', error);
        process.exit(1);
    }
};

startServer();
