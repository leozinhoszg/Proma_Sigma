import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Carregar usuário do storage ao iniciar
  useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

      if (userData && token) {
        setUser(JSON.parse(userData));
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = useCallback(async (usuario, senha, lembrar = false) => {
    const data = await authService.login(usuario, senha);

    const storage = lembrar ? localStorage : sessionStorage;
    storage.setItem('accessToken', data.accessToken);
    storage.setItem('refreshToken', data.refreshToken);
    storage.setItem('user', JSON.stringify(data.user));

    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');

    await authService.logout(refreshToken);

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');

    setUser(null);
    navigate('/login');
  }, [navigate]);

  const isAuthenticated = useCallback(() => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    return !!token && !!user;
  }, [user]);

  const value = {
    user,
    usuario: user, // Alias para compatibilidade
    loading,
    login,
    logout,
    isAuthenticated,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export default AuthContext;
