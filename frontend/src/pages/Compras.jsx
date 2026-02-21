import { useState, useEffect, useCallback } from 'react';
import { solicitacoesAPI } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import useToast from '../hooks/useToast';
import Toast from '../components/ui/Toast';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { formatCurrency, formatDate } from '../utils/helpers';

export default function Compras() {
  const { toasts, success, error: showError } = useToast();
  const { socket } = useNotifications();

  const [activeTab, setActiveTab] = useState('solicitacoes');
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [estatisticas, setEstatisticas] = useState({ pendentes: 0, aprovadasMes: 0, reprovadasMes: 0, totalMes: 0 });
  const [loading, setLoading] = useState(true);

  // Filtros do historico
  const [filtroStatus, setFiltroStatus] = useState('');

  // Modal de reprovacao
  const [modalReprovar, setModalReprovar] = useState({ open: false, solicitacao: null });
  const [motivoReprovacao, setMotivoReprovacao] = useState('');
  const [processando, setProcessando] = useState(false);

  // Dialog de aprovacao
  const [dialogAprovar, setDialogAprovar] = useState({ open: false, solicitacao: null });

  const carregarDados = useCallback(async (silencioso = false) => {
    if (!silencioso) setLoading(true);
    try {
      const [pendRes, histRes, estRes] = await Promise.all([
        solicitacoesAPI.listarCompras({ status: 'pendente' }),
        solicitacoesAPI.listarCompras(),
        solicitacoesAPI.estatisticas()
      ]);
      setSolicitacoes(pendRes.data);
      setHistorico(histRes.data.filter(s => s.status !== 'pendente'));
      setEstatisticas(estRes.data);
    } catch (err) {
      if (!silencioso) showError('Erro ao carregar dados');
    } finally {
      if (!silencioso) setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Atualizar dados em tempo real via Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleNotificacao = (notificacao) => {
      if (notificacao.tipo === 'solicitacao_criada') {
        carregarDados(true);
      }
    };

    socket.on('notificacao:nova', handleNotificacao);
    return () => socket.off('notificacao:nova', handleNotificacao);
  }, [socket, carregarDados]);

  const handleAprovar = async () => {
    if (!dialogAprovar.solicitacao) return;
    setProcessando(true);
    try {
      await solicitacoesAPI.aprovar(dialogAprovar.solicitacao.id);
      success('Solicitacao aprovada com sucesso! Contrato atualizado.');
      setDialogAprovar({ open: false, solicitacao: null });
      await carregarDados();
    } catch (err) {
      showError(err.response?.data?.message || 'Erro ao aprovar');
    } finally {
      setProcessando(false);
    }
  };

  const handleReprovar = async () => {
    if (!modalReprovar.solicitacao || !motivoReprovacao.trim()) {
      showError('Informe o motivo da reprovacao');
      return;
    }
    setProcessando(true);
    try {
      await solicitacoesAPI.reprovar(modalReprovar.solicitacao.id, motivoReprovacao.trim());
      success('Solicitacao reprovada');
      setModalReprovar({ open: false, solicitacao: null });
      setMotivoReprovacao('');
      await carregarDados();
    } catch (err) {
      showError(err.response?.data?.message || 'Erro ao reprovar');
    } finally {
      setProcessando(false);
    }
  };

  const handleDownloadPdf = async (id) => {
    try {
      const res = await solicitacoesAPI.downloadAnexo(id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      showError('Erro ao abrir PDF');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pendente: 'badge-warning',
      aprovada: 'badge-success',
      reprovada: 'badge-error'
    };
    const labels = {
      pendente: 'Pendente',
      aprovada: 'Aprovada',
      reprovada: 'Reprovada'
    };
    return <span className={`badge ${map[status] || 'badge-ghost'} badge-sm`}>{labels[status] || status}</span>;
  };

  const historicoFiltrado = historico.filter(s => {
    if (filtroStatus && s.status !== filtroStatus) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="h-8 w-48 bg-base-300/50 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-base-300/30 rounded-xl animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-base-300/30 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <Toast toasts={toasts} />

      {/* ═══ Header ═══ */}
      <div
        className="glass-card p-6 relative overflow-hidden animate-fadeInUp"
        style={{ animationFillMode: 'both' }}
      >
        {/* Acento gradiente superior */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, oklch(60% 0.18 255) 30%, oklch(65% 0.16 200) 70%, transparent)' }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-16 pointer-events-none opacity-[0.04]"
          style={{ background: 'linear-gradient(to bottom, oklch(60% 0.18 255), transparent)' }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs text-base-content/40 uppercase tracking-wider font-medium mb-1">
              Gestão de contratos
            </p>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <span className="text-gradient">Compras</span>
            </h1>
            <p className="text-base-content/50 text-sm mt-1">
              Avaliação de solicitações de atualização de contrato
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm shadow-soft gap-2 group"
            onClick={carregarDados}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Atualizar
          </button>
        </div>
      </div>

      {/* Cards estatisticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 stagger-animate">
        {/* Pendentes */}
        <div className="stat-card-glass warning group" aria-label={`Solicitações pendentes: ${estatisticas.pendentes}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-base-content/60 font-medium">Pendentes</p>
              <p className="text-2xl sm:text-3xl font-bold text-warning mt-1">{estatisticas.pendentes}</p>
              <p className="text-xs text-base-content/40 mt-0.5">aguardando avaliação</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-warning/10 flex items-center justify-center icon-hover-float transition-transform group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Aprovadas */}
        <div className="stat-card-glass success group" aria-label={`Aprovadas no mês: ${estatisticas.aprovadasMes}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-base-content/60 font-medium">Aprovadas</p>
              <p className="text-2xl sm:text-3xl font-bold text-success mt-1">{estatisticas.aprovadasMes}</p>
              <p className="text-xs text-base-content/40 mt-0.5">neste mês</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-success/10 flex items-center justify-center icon-hover-float transition-transform group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Reprovadas */}
        <div className="stat-card-glass error group col-span-2 sm:col-span-1" aria-label={`Reprovadas no mês: ${estatisticas.reprovadasMes}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-base-content/60 font-medium">Reprovadas</p>
              <p className="text-2xl sm:text-3xl font-bold text-error mt-1">{estatisticas.reprovadasMes}</p>
              <p className="text-xs text-base-content/40 mt-0.5">neste mês</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-error/10 flex items-center justify-center icon-hover-float transition-transform group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + Conteúdo */}
      <div className="glass-card overflow-hidden">
        {/* Tabs dentro do card */}
        <div className="px-3 sm:px-4 pt-4 border-b border-base-200/30 overflow-x-auto">
          <div role="tablist" className="flex gap-1 flex-nowrap whitespace-nowrap">
            <button
              role="tab"
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                activeTab === 'solicitacoes'
                  ? 'bg-base-200/40 text-base-content border-b-2 border-primary'
                  : 'text-base-content/50 hover:text-base-content/70 hover:bg-base-200/20'
              }`}
              onClick={() => setActiveTab('solicitacoes')}
            >
              Solicitações
              {solicitacoes.length > 0 && (
                <span className="ml-2 badge badge-warning badge-xs">{solicitacoes.length}</span>
              )}
            </button>
            <button
              role="tab"
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                activeTab === 'historico'
                  ? 'bg-base-200/40 text-base-content border-b-2 border-primary'
                  : 'text-base-content/50 hover:text-base-content/70 hover:bg-base-200/20'
              }`}
              onClick={() => setActiveTab('historico')}
            >
              Histórico
            </button>
          </div>
        </div>

        {/* Tab: Solicitacoes Pendentes */}
        {activeTab === 'solicitacoes' && (
          <>

          {solicitacoes.length === 0 ? (
            <div className="p-8 text-center text-base-content/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-success opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Nenhuma solicitacao pendente</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm table-glass">
                <thead>
                  <tr className="text-base-content/50">
                    <th className="hidden md:table-cell">Setor</th>
                    <th>Fornecedor</th>
                    <th>N. Contrato</th>
                    <th>Seq.</th>
                    <th className="hidden sm:table-cell">Valor Atual</th>
                    <th>Novo Valor</th>
                    <th className="hidden md:table-cell">Anexo</th>
                    <th className="text-right">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitacoes.map(sol => (
                    <tr key={sol.id} className="hover:bg-base-200/30">
                      <td className="hidden md:table-cell">
                        <span className="badge badge-outline badge-sm">{sol.setor?.nome || '-'}</span>
                      </td>
                      <td className="font-medium">{sol.fornecedor?.nome}</td>
                      <td>{sol.contrato?.nr_contrato}</td>
                      <td>{sol.sequencia?.num_seq_item}</td>
                      <td className="hidden sm:table-cell text-base-content/60">{formatCurrency(sol.sequencia?.valor)}</td>
                      <td>
                        {sol.novo_valor !== null ? (
                          <span className="font-medium text-primary">{formatCurrency(sol.novo_valor)}</span>
                        ) : (
                          <span className="text-base-content/30">-</span>
                        )}
                      </td>
                      <td className="hidden md:table-cell">
                        {sol.anexo_pdf ? (
                          <button
                            className="btn btn-ghost btn-xs text-primary"
                            onClick={() => handleDownloadPdf(sol.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            PDF
                          </button>
                        ) : (
                          <span className="text-base-content/30 text-xs">-</span>
                        )}
                      </td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <button
                            className="btn btn-success btn-sm btn-outline"
                            onClick={() => setDialogAprovar({ open: true, solicitacao: sol })}
                            title="Aprovar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="hidden sm:inline">Aprovar</span>
                          </button>
                          <button
                            className="btn btn-error btn-sm btn-outline"
                            onClick={() => {
                              setModalReprovar({ open: true, solicitacao: sol });
                              setMotivoReprovacao('');
                            }}
                            title="Reprovar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="hidden sm:inline">Reprovar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="p-3 border-t border-base-200/30 bg-base-200/5">
            <p className="text-xs text-base-content/40">{solicitacoes.length} solicitação(ões) pendente(s)</p>
          </div>
        </>
        )}

        {/* Tab: Historico */}
        {activeTab === 'historico' && (
          <>
            <div className="p-4 border-b border-base-200/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-base font-semibold">Histórico de Solicitações</h2>
              <div className="flex gap-2">
                <select
                  className="select select-bordered select-sm"
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                >
                  <option value="">Todos os status</option>
                  <option value="aprovada">Aprovadas</option>
                  <option value="reprovada">Reprovadas</option>
                </select>
              </div>
            </div>

            {historicoFiltrado.length === 0 ? (
              <div className="p-8 text-center text-base-content/50">
                <p>Nenhum registro no histórico</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-sm table-glass">
                  <thead>
                    <tr className="text-base-content/50">
                      <th>Fornecedor</th>
                      <th>Contrato</th>
                      <th>Seq.</th>
                      <th>Status</th>
                      <th className="hidden sm:table-cell">Solicitante</th>
                      <th className="hidden md:table-cell">Avaliador</th>
                      <th className="hidden md:table-cell">Data Avaliação</th>
                      <th className="hidden lg:table-cell">Observação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicoFiltrado.map(sol => (
                      <tr key={sol.id} className="hover:bg-base-200/30">
                        <td className="font-medium">{sol.fornecedor?.nome}</td>
                        <td>{sol.contrato?.nr_contrato}</td>
                        <td>{sol.sequencia?.num_seq_item}</td>
                        <td>{getStatusBadge(sol.status)}</td>
                        <td className="hidden sm:table-cell text-base-content/60">{sol.solicitante?.nome || sol.solicitante?.usuario}</td>
                        <td className="hidden md:table-cell text-base-content/60">{sol.avaliador?.nome || sol.avaliador?.usuario || '-'}</td>
                        <td className="hidden md:table-cell text-base-content/60 text-xs">{sol.data_avaliacao ? formatDate(sol.data_avaliacao) : '-'}</td>
                        <td className="hidden lg:table-cell max-w-xs">
                          <div className="text-xs text-base-content/60 truncate" title={sol.observacao}>
                            {sol.observacao}
                          </div>
                          {sol.motivo_reprovacao && (
                            <div className="text-xs text-error mt-1 truncate" title={sol.motivo_reprovacao}>
                              Motivo: {sol.motivo_reprovacao}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="p-3 border-t border-base-200/30 bg-base-200/5">
              <p className="text-xs text-base-content/40">{historicoFiltrado.length} registro(s)</p>
            </div>
          </>
        )}
      </div>

      {/* Dialog de Aprovacao */}
      <ConfirmDialog
        isOpen={dialogAprovar.open}
        onClose={() => setDialogAprovar({ open: false, solicitacao: null })}
        onConfirm={handleAprovar}
        title="Aprovar Solicitacao"
        message={
          dialogAprovar.solicitacao ? (
            <div className="space-y-2 text-sm">
              <p><strong>Fornecedor:</strong> {dialogAprovar.solicitacao.fornecedor?.nome}</p>
              <p><strong>Contrato:</strong> {dialogAprovar.solicitacao.contrato?.nr_contrato}</p>
              <p><strong>Sequencia:</strong> {dialogAprovar.solicitacao.sequencia?.num_seq_item}</p>
              {dialogAprovar.solicitacao.novo_valor !== null && (
                <p><strong>Novo Valor:</strong> {formatCurrency(dialogAprovar.solicitacao.sequencia?.valor)} → <span className="text-primary font-semibold">{formatCurrency(dialogAprovar.solicitacao.novo_valor)}</span></p>
              )}
              {dialogAprovar.solicitacao.novo_dia_emissao !== null && (
                <p><strong>Novo Dia Emissao:</strong> {dialogAprovar.solicitacao.sequencia?.dia_emissao} → <span className="text-primary font-semibold">{dialogAprovar.solicitacao.novo_dia_emissao}</span></p>
              )}
              <p className="text-base-content/60 mt-2"><strong>Observacao:</strong> {dialogAprovar.solicitacao.observacao}</p>
              <div className="divider my-2"></div>
              <p className="text-warning text-xs">Ao aprovar, o contrato sera atualizado automaticamente com os novos valores.</p>
            </div>
          ) : ''
        }
        confirmText={processando ? 'Aprovando...' : 'Aprovar'}
        variant="success"
      />

      {/* Modal de Reprovacao */}
      <Modal
        isOpen={modalReprovar.open}
        onClose={() => setModalReprovar({ open: false, solicitacao: null })}
        title="Reprovar Solicitacao"
        size="md"
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => setModalReprovar({ open: false, solicitacao: null })}>
              Cancelar
            </button>
            <button
              className="btn btn-error"
              onClick={handleReprovar}
              disabled={processando || !motivoReprovacao.trim()}
            >
              {processando ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Reprovando...
                </>
              ) : (
                'Reprovar'
              )}
            </button>
          </>
        }
      >
        {modalReprovar.solicitacao && (
          <div className="space-y-4">
            <div className="bg-base-200/30 rounded-lg p-3 text-sm space-y-1">
              <p><strong>Fornecedor:</strong> {modalReprovar.solicitacao.fornecedor?.nome}</p>
              <p><strong>Contrato:</strong> {modalReprovar.solicitacao.contrato?.nr_contrato}</p>
              <p><strong>Solicitante:</strong> {modalReprovar.solicitacao.solicitante?.nome || modalReprovar.solicitacao.solicitante?.usuario}</p>
              <p><strong>Observacao:</strong> {modalReprovar.solicitacao.observacao}</p>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Motivo da Reprovacao <span className="text-error">*</span></span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-24"
                value={motivoReprovacao}
                onChange={(e) => setMotivoReprovacao(e.target.value)}
                placeholder="Informe o motivo da reprovacao..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
