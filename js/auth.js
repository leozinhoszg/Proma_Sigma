/**
 * Módulo de Autenticação - Frontend
 * Gerencia tokens, sessões e requisições autenticadas
 */

const Auth = {
    // Configurações
    config: {
        loginPage: '/login.html',
        homePage: '/index.html',
        tokenRefreshThreshold: 60 * 1000 // 1 minuto antes de expirar
    },

    /**
     * Verifica se o usuário está autenticado
     */
    isAuthenticated() {
        const token = this.getAccessToken();
        if (!token) return false;

        // Verificar se token expirou
        try {
            const payload = this.parseJwt(token);
            const now = Date.now() / 1000;
            return payload.exp > now;
        } catch {
            return false;
        }
    },

    /**
     * Obtém o access token
     */
    getAccessToken() {
        return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    },

    /**
     * Obtém o refresh token
     */
    getRefreshToken() {
        return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    },

    /**
     * Obtém dados do usuário
     */
    getUser() {
        const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    },

    /**
     * Salva os tokens
     */
    saveTokens(accessToken, refreshToken, remember = true) {
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('accessToken', accessToken);
        storage.setItem('refreshToken', refreshToken);
    },

    /**
     * Salva dados do usuário
     */
    saveUser(user, remember = true) {
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(user));
    },

    /**
     * Limpa todos os dados de autenticação
     */
    clearAuth() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
    },

    /**
     * Decodifica um JWT
     */
    parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch {
            return null;
        }
    },

    /**
     * Verifica se o token precisa ser renovado
     */
    needsRefresh() {
        const token = this.getAccessToken();
        if (!token) return false;

        try {
            const payload = this.parseJwt(token);
            const now = Date.now() / 1000;
            const timeUntilExpiry = (payload.exp - now) * 1000;
            return timeUntilExpiry < this.config.tokenRefreshThreshold;
        } catch {
            return true;
        }
    },

    /**
     * Renova o access token
     */
    async refreshAccessToken() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            throw new Error('Refresh token não encontrado');
        }

        try {
            const response = await fetch('/api/auth/refresh-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });

            if (!response.ok) {
                throw new Error('Falha ao renovar token');
            }

            const data = await response.json();
            const remember = localStorage.getItem('accessToken') !== null;
            this.saveTokens(data.accessToken, data.refreshToken, remember);

            return data.accessToken;
        } catch (error) {
            this.clearAuth();
            throw error;
        }
    },

    /**
     * Faz uma requisição autenticada
     */
    async fetch(url, options = {}) {
        // Verificar se precisa renovar o token
        if (this.needsRefresh()) {
            try {
                await this.refreshAccessToken();
            } catch {
                this.logout();
                return;
            }
        }

        const token = this.getAccessToken();
        if (!token) {
            this.logout();
            return;
        }

        // Adicionar header de autorização
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };

        try {
            const response = await fetch(url, { ...options, headers });

            // Se token expirou, tentar renovar
            if (response.status === 401) {
                const data = await response.json();
                if (data.code === 'TOKEN_EXPIRED') {
                    try {
                        await this.refreshAccessToken();
                        // Tentar novamente com novo token
                        headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
                        return fetch(url, { ...options, headers });
                    } catch {
                        this.logout();
                        return;
                    }
                }
                this.logout();
                return;
            }

            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Faz logout
     */
    async logout() {
        const refreshToken = this.getRefreshToken();

        if (refreshToken) {
            try {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.getAccessToken()}`
                    },
                    body: JSON.stringify({ refreshToken })
                });
            } catch {
                // Ignora erros no logout
            }
        }

        this.clearAuth();
        window.location.href = this.config.loginPage;
    },

    /**
     * Protege uma página (redireciona se não autenticado)
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = this.config.loginPage;
            return false;
        }
        return true;
    },

    /**
     * Redireciona se já autenticado (para páginas de login)
     */
    redirectIfAuthenticated() {
        if (this.isAuthenticated()) {
            window.location.href = this.config.homePage;
            return true;
        }
        return false;
    },

    /**
     * Inicializa o módulo de autenticação
     */
    init() {
        // Configurar interceptador para renovação automática de token
        setInterval(() => {
            if (this.isAuthenticated() && this.needsRefresh()) {
                this.refreshAccessToken().catch(() => {});
            }
        }, 30000); // Verificar a cada 30 segundos
    }
};

// Inicializar ao carregar
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});

// Exportar para uso global
window.Auth = Auth;
