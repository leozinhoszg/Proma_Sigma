import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { solicitacoesAPI, fornecedoresAPI, contratosAPI, sequenciasAPI } from '../services/api';
import useToast from '../hooks/useToast';
import Toast from '../components/ui/Toast';
import { formatCurrency, formatDate } from '../utils/helpers';

export default function SolicitacaoAtualizacao() {
  const { usuario } = useAuth();
  const { socket } = useNotifications();
  const { toasts, success, error: showError, warning } = useToast();

  // Estado do formulario
  const [fornecedores, setFornecedores] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [sequencias, setSequencias] = useState([]);
  const [sequenciaSelecionada, setSequenciaSelecionada] = useState(null);

  const [formData, setFormData] = useState({
    fornecedor_id: '',
    contrato_id: '',
    sequencia_id: '',
    observacao: '',
    novo_valor: '',
    novo_dia_emissao: ''
  });
  const [anexoPdf, setAnexoPdf] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Estado da listagem
  const [minhasSolicitacoes, setMinhasSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Recarregar apenas solicitacoes (para uso em tempo real)
  const recarregarSolicitacoes = useCallback(async () => {
    try {
      const solRes = await solicitacoesAPI.getAll();
      setMinhasSolicitacoes(solRes.data);
    } catch (err) {
      // silencioso — nao exibir erro em reload automatico
    }
  }, []);

  // Carregar fornecedores e minhas solicitacoes
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [fornRes, solRes] = await Promise.all([
          fornecedoresAPI.getAll(),
          solicitacoesAPI.getAll()
        ]);
        setFornecedores(fornRes.data);
        setMinhasSolicitacoes(solRes.data);
      } catch (err) {
        showError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, []);

  // Atualizar lista em tempo real via Socket.IO (aprovacao/reprovacao)
  useEffect(() => {
    if (!socket) return;

    const handleNotificacao = (notificacao) => {
      if (notificacao.tipo === 'solicitacao_aprovada' || notificacao.tipo === 'solicitacao_reprovada') {
        recarregarSolicitacoes();
      }
    };

    socket.on('notificacao:nova', handleNotificacao);
    return () => socket.off('notificacao:nova', handleNotificacao);
  }, [socket, recarregarSolicitacoes]);

  // Cascata: quando fornecedor muda, carregar contratos
  useEffect(() => {
    if (formData.fornecedor_id) {
      contratosAPI.getAll(formData.fornecedor_id).then(res => {
        setContratos(res.data);
      }).catch(() => setContratos([]));
    } else {
      setContratos([]);
    }
    setFormData(prev => ({ ...prev, contrato_id: '', sequencia_id: '' }));
    setSequencias([]);
    setSequenciaSelecionada(null);
  }, [formData.fornecedor_id]);

  // Cascata: quando contrato muda, carregar sequencias
  useEffect(() => {
    if (formData.contrato_id) {
      sequenciasAPI.getAll(formData.contrato_id).then(res => {
        setSequencias(res.data);
      }).catch(() => setSequencias([]));
    } else {
      setSequencias([]);
    }
    setFormData(prev => ({ ...prev, sequencia_id: '' }));
    setSequenciaSelecionada(null);
  }, [formData.contrato_id]);

  // Quando sequencia muda, mostrar dados de referencia
  useEffect(() => {
    if (formData.sequencia_id) {
      const seq = sequencias.find(s => s.id === parseInt(formData.sequencia_id));
      setSequenciaSelecionada(seq || null);
    } else {
      setSequenciaSelecionada(null);
    }
  }, [formData.sequencia_id, sequencias]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        showError('Apenas arquivos PDF sao permitidos');
        e.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showError('Arquivo deve ter no maximo 10MB');
        e.target.value = '';
        return;
      }
      setAnexoPdf(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fornecedor_id || !formData.contrato_id || !formData.sequencia_id || !formData.novo_valor || !formData.novo_dia_emissao || !anexoPdf || !formData.observacao.trim()) {
      warning('Preencha todos os campos obrigatórios');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('fornecedor_id', formData.fornecedor_id);
      data.append('contrato_id', formData.contrato_id);
      data.append('sequencia_id', formData.sequencia_id);
      data.append('observacao', formData.observacao.trim());
      data.append('novo_valor', formData.novo_valor);
      data.append('novo_dia_emissao', formData.novo_dia_emissao);
      data.append('anexo_pdf', anexoPdf);

      await solicitacoesAPI.criar(data);

      success('Solicitacao enviada com sucesso!');

      // Limpar formulario
      setFormData({
        fornecedor_id: '',
        contrato_id: '',
        sequencia_id: '',
        observacao: '',
        novo_valor: '',
        novo_dia_emissao: ''
      });
      setAnexoPdf(null);
      setSequenciaSelecionada(null);

      // Limpar input de arquivo
      const fileInput = document.getElementById('anexo-pdf-input');
      if (fileInput) fileInput.value = '';

      // Recarregar lista
      const solRes = await solicitacoesAPI.getAll();
      setMinhasSolicitacoes(solRes.data);
    } catch (err) {
      showError(err.response?.data?.message || 'Erro ao enviar solicitacao');
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="h-8 w-64 bg-base-300/50 rounded-lg animate-pulse"></div>
        <div className="glass-card p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-base-300/30 rounded-lg animate-pulse"></div>
          ))}
        </div>
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
              Solicitação de{' '}
              <span className="text-gradient">Atualização</span>
            </h1>
            <p className="text-base-content/50 text-sm mt-1">
              Solicite alterações em contratos existentes
              {usuario?.setor && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {usuario.setor.nome}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Nova Solicitação
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dropdowns em cascata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Fornecedor <span className="text-error">*</span></span>
              </label>
              <select
                name="fornecedor_id"
                className="select select-bordered w-full"
                value={formData.fornecedor_id}
                onChange={handleChange}
              >
                <option value="">Selecionar fornecedor...</option>
                {fornecedores.map(f => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">N. de Contrato <span className="text-error">*</span></span>
              </label>
              <select
                name="contrato_id"
                className="select select-bordered w-full"
                value={formData.contrato_id}
                onChange={handleChange}
                disabled={!formData.fornecedor_id}
              >
                <option value="">Selecionar contrato...</option>
                {contratos.map(c => (
                  <option key={c.id} value={c.id}>{c.nr_contrato}</option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Sequência <span className="text-error">*</span></span>
              </label>
              <select
                name="sequencia_id"
                className="select select-bordered w-full"
                value={formData.sequencia_id}
                onChange={handleChange}
                disabled={!formData.contrato_id}
              >
                <option value="">Selecionar sequência...</option>
                {sequencias.map(s => (
                  <option key={s.id} value={s.id}>{s.num_seq_item}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Referencia da sequencia selecionada */}
          {sequenciaSelecionada && (
            <div className="bg-base-200/30 rounded-lg p-3 text-sm flex flex-wrap gap-4">
              <span className="text-base-content/60">
                Valor atual: <strong className="text-base-content">{formatCurrency(sequenciaSelecionada.valor)}</strong>
              </span>
              <span className="text-base-content/60">
                Dia emissão: <strong className="text-base-content">{sequenciaSelecionada.dia_emissao}</strong>
              </span>
            </div>
          )}

          {/* Novos valores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Novo Valor (R$) <span className="text-error">*</span></span>
              </label>
              <input
                type="number"
                name="novo_valor"
                step="0.01"
                min="0"
                className="input input-bordered w-full"
                value={formData.novo_valor}
                onChange={handleChange}
                placeholder="Ex: 1500.00"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Novo Dia de Emissão <span className="text-error">*</span></span>
                <span className="label-text-alt text-base-content/40">(1-31)</span>
              </label>
              <input
                type="number"
                name="novo_dia_emissao"
                min="1"
                max="31"
                className="input input-bordered w-full"
                value={formData.novo_dia_emissao}
                onChange={handleChange}
                placeholder="Ex: 15"
              />
            </div>
          </div>

          {/* Anexo PDF */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Anexo (PDF) <span className="text-error">*</span></span>
              <span className="label-text-alt text-base-content/40">Max 10MB</span>
            </label>
            <input
              id="anexo-pdf-input"
              type="file"
              accept=".pdf,application/pdf"
              className="file-input file-input-bordered w-full"
              onChange={handleFileChange}
            />
          </div>

          {/* Observacao */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Observação <span className="text-error">*</span></span>
            </label>
            <textarea
              name="observacao"
              className="textarea textarea-bordered w-full h-24"
              value={formData.observacao}
              onChange={handleChange}
              placeholder="Descreva o motivo da solicitacao de atualizacao..."
            />
          </div>

          {/* Botao */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary shadow-soft"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Enviando...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Enviar Solicitação
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Minhas Solicitacoes */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-base-200/30">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Minhas Solicitações
          </h2>
        </div>

        {minhasSolicitacoes.length === 0 ? (
          <div className="p-8 text-center text-base-content/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>Nenhuma solicitação enviada ainda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm table-glass">
              <thead>
                <tr className="text-base-content/50">
                  <th>#</th>
                  <th>Fornecedor</th>
                  <th>Contrato</th>
                  <th>Seq.</th>
                  <th>Status</th>
                  <th>Avaliado por</th>
                  <th>Data</th>
                  <th>Anexo</th>
                </tr>
              </thead>
              <tbody>
                {minhasSolicitacoes.map((sol, idx) => (
                  <tr key={sol.id} className="hover:bg-base-200/30">
                    <td className="text-base-content/40">{idx + 1}</td>
                    <td className="font-medium">{sol.fornecedor?.nome}</td>
                    <td>{sol.contrato?.nr_contrato}</td>
                    <td>{sol.sequencia?.num_seq_item}</td>
                    <td>{getStatusBadge(sol.status)}</td>
                    <td className="text-base-content/60 text-xs">
                      {sol.avaliador ? sol.avaliador.nome : <span className="text-base-content/30">-</span>}
                    </td>
                    <td className="text-base-content/60 text-xs">{formatDate(sol.created_at)}</td>
                    <td>
                      {sol.anexo_pdf ? (
                        <button
                          className="btn btn-ghost btn-xs text-primary"
                          onClick={() => handleDownloadPdf(sol.id)}
                        >
                          PDF
                        </button>
                      ) : (
                        <span className="text-base-content/30 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-3 border-t border-base-200/30 bg-base-200/5">
          <p className="text-xs text-base-content/40">{minhasSolicitacoes.length} solicitacao(oes)</p>
        </div>
      </div>
    </div>
  );
}
