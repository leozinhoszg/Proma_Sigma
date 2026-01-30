import api from './api';

export const authService = {
  async login(usuario, senha) {
    const response = await api.post('/auth/login', { usuario, senha });
    return response.data;
  },

  async register(usuario, email, senha) {
    const response = await api.post('/auth/register', { usuario, email, senha });
    return response.data;
  },

  async logout(refreshToken) {
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      // Ignora erros no logout
    }
  },

  async logoutAll() {
    await api.post('/auth/logout-all');
  },

  async refreshToken(refreshToken) {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token, senha) {
    const response = await api.post(`/auth/reset-password/${token}`, { senha });
    return response.data;
  },

  async verifyEmail(token) {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  async resendVerification(email) {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async getSessions() {
    const response = await api.get('/auth/sessions');
    return response.data;
  }
};

export default authService;
