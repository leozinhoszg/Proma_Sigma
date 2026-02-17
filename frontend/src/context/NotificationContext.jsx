import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { notificacoesAPI } from '../services/api';

const NotificationContext = createContext(null);

// Mapa de rotas por tipo de notificacao
const rotaPorTipo = {
  solicitacao_criada: '/compras',
  solicitacao_aprovada: '/solicitacoes',
  solicitacao_reprovada: '/solicitacoes'
};

function mostrarNotificacaoBrowser(notificacao) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  try {
    const notif = new Notification(notificacao.titulo, {
      body: notificacao.mensagem,
      icon: '/favicon.ico',
      tag: `notif-${notificacao.id}`,
      renotify: true
    });

    notif.onclick = () => {
      window.focus();
      const rota = rotaPorTipo[notificacao.tipo] || '/';
      window.location.href = rota;
      notif.close();
    };
  } catch (e) {
    // Fallback silencioso — alguns navegadores mobile nao suportam new Notification()
  }
}

export function NotificationProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [notificacoes, setNotificacoes] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [loading, setLoading] = useState(false);
  const [permissaoPush, setPermissaoPush] = useState(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const socketRef = useRef(null);

  // Solicitar permissao de notificacoes do navegador ao autenticar
  useEffect(() => {
    if (!user || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(perm => setPermissaoPush(perm));
    }
  }, [user]);

  const solicitarPermissaoPush = useCallback(async () => {
    if (!('Notification' in window)) return 'denied';
    const perm = await Notification.requestPermission();
    setPermissaoPush(perm);
    return perm;
  }, []);

  // Conectar socket quando autenticado
  useEffect(() => {
    if (!isAuthenticated() || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setNotificacoes([]);
      setNaoLidas(0);
      return;
    }

    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) return;

    const socket = io({
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    socket.on('notificacao:nova', (notificacao) => {
      setNotificacoes(prev => [notificacao, ...prev]);
      setNaoLidas(prev => prev + 1);

      // Push notification do navegador quando aba nao esta em foco
      if (document.hidden) {
        mostrarNotificacaoBrowser(notificacao);
      }
    });

    socket.on('connect_error', (error) => {
      console.warn('Socket.IO erro de conexao:', error.message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, isAuthenticated]);

  // Carregar notificacoes iniciais
  useEffect(() => {
    if (!user) return;

    const carregarNotificacoes = async () => {
      setLoading(true);
      try {
        const [listRes, countRes] = await Promise.all([
          notificacoesAPI.listar({ limite: 20 }),
          notificacoesAPI.contarNaoLidas()
        ]);
        setNotificacoes(listRes.data.notificacoes || []);
        setNaoLidas(countRes.data.naoLidas || 0);
      } catch (error) {
        console.error('Erro ao carregar notificacoes:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarNotificacoes();
  }, [user]);

  const marcarComoLida = useCallback(async (id) => {
    try {
      await notificacoesAPI.marcarComoLida(id);
      setNotificacoes(prev =>
        prev.map(n => n.id === id ? { ...n, lida: true } : n)
      );
      setNaoLidas(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar notificacao como lida:', error);
    }
  }, []);

  const marcarTodasComoLidas = useCallback(async () => {
    try {
      await notificacoesAPI.marcarTodasComoLidas();
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
      setNaoLidas(0);
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  }, []);

  const limparTodas = useCallback(async () => {
    try {
      await notificacoesAPI.limparTodas();
      setNotificacoes([]);
      setNaoLidas(0);
    } catch (error) {
      console.error('Erro ao limpar notificacoes:', error);
    }
  }, []);

  const value = {
    notificacoes,
    naoLidas,
    loading,
    marcarComoLida,
    marcarTodasComoLidas,
    limparTodas,
    socket: socketRef.current,
    permissaoPush,
    solicitarPermissaoPush
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
}

export default NotificationContext;
