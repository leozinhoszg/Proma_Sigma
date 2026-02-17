import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

function tempoRelativo(dataStr) {
  const agora = new Date();
  const data = new Date(dataStr);
  const diffMs = agora - data;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMs / 3600000);
  const diffDias = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `${diffMin} min`;
  if (diffHoras < 24) return `${diffHoras}h`;
  return `${diffDias}d`;
}

const tipoConfig = {
  solicitacao_criada: { icone: '\u{1F4E9}' },
  solicitacao_aprovada: { icone: '\u2705' },
  solicitacao_reprovada: { icone: '\u274C' }
};

export default function NotificationBell() {
  const { notificacoes, naoLidas, marcarComoLida, marcarTodasComoLidas, permissaoPush, solicitarPermissaoPush } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleNotificationClick = async (notificacao) => {
    if (!notificacao.lida) {
      await marcarComoLida(notificacao.id);
    }
    setOpen(false);
    if (notificacao.tipo === 'solicitacao_criada') {
      navigate('/compras');
    } else {
      navigate('/solicitacoes');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg navbar-link transition-colors"
        title="Notificacoes"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {naoLidas > 0 && (
          <span className="absolute -top-1 -right-1 bg-error text-error-content text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {naoLidas > 99 ? '99+' : naoLidas}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          ></div>
          <div className="absolute right-0 mt-3 w-80 user-dropdown rounded-xl shadow-xl z-50 animate-fadeIn origin-top-right">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b dropdown-divider">
              <span className="font-semibold dropdown-text text-sm">Notificacoes</span>
              {naoLidas > 0 && (
                <button
                  onClick={marcarTodasComoLidas}
                  className="text-xs text-primary hover:underline"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            {/* Banner para ativar notificacoes */}
            {permissaoPush === 'default' && (
              <button
                onClick={solicitarPermissaoPush}
                className="w-full px-4 py-2.5 text-left text-xs border-b dropdown-divider bg-primary/5 hover:bg-primary/10 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="text-primary font-medium">Ativar notificacoes no navegador</span>
              </button>
            )}

            {/* Lista */}
            <div className="max-h-80 overflow-y-auto">
              {notificacoes.length === 0 ? (
                <div className="px-4 py-8 text-center dropdown-text-muted text-sm">
                  Nenhuma notificacao
                </div>
              ) : (
                notificacoes.slice(0, 15).map((notif) => {
                  const config = tipoConfig[notif.tipo] || { icone: '\u{1F514}' };
                  return (
                    <button
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`w-full text-left px-4 py-3 border-b dropdown-divider dropdown-item transition-colors ${!notif.lida ? 'bg-base-200/50' : ''}`}
                    >
                      <div className="flex gap-3">
                        <span className="text-lg flex-shrink-0 mt-0.5">{config.icone}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm dropdown-text ${!notif.lida ? 'font-semibold' : ''}`}>
                            {notif.titulo}
                          </p>
                          <p className="text-xs dropdown-text-muted mt-0.5 line-clamp-2">
                            {notif.mensagem}
                          </p>
                          <p className="text-xs dropdown-text-muted mt-1 opacity-70">
                            {tempoRelativo(notif.created_at)}
                          </p>
                        </div>
                        {!notif.lida && (
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
