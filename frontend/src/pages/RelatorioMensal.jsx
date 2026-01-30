import { useState, useEffect, useMemo } from 'react';
import { relatorioAPI, sequenciasAPI } from '../services/api';
import { formatCurrency, formatDate, getStatusClass, getMonthKey, getMonthName } from '../utils/helpers';
import Loading from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { useToast } from '../hooks/useToast';
import Toast from '../components/ui/Toast';

const STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente', class: 'badge-warning' },
  { value: 'ok', label: 'OK', class: 'badge-success' },
  { value: 'atrasada', label: 'Atrasada', class: 'badge-error' },
  { value: 'nao_aplicavel', label: 'N/A', class: 'badge-ghost' }
];

export default function RelatorioMensal() {
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mesAno, setMesAno] = useState(getMonthKey());
  const [expandedFornecedores, setExpandedFornecedores] = useState(new Set());
  const [filterStatus, setFilterStatus] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMedicao, setEditingMedicao] = useState(null);
  const [editFormData, setEditFormData] = useState({
    status: '',
    valor: '',
    observacoes: '',
    dataMedicao: '',
    nf: ''
  });

  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadRelatorio();
  }, [mesAno]);

  const loadRelatorio = async () => {
    try {
      setLoading(true);
      const response = await relatorioAPI.getTabela();
      const tabela = response.data || [];

      // Transformar array plano em estrutura aninhada por fornecedor > contrato
      const fornecedoresMap = new Map();
      const hoje = new Date();
      const diaAtual = hoje.getDate();

      tabela.forEach(row => {
        const fornecedorId = row.fornecedorId?._id || row.fornecedorId;
        const contratoId = row.contratoId?._id || row.contratoId;

        // Calcular status da sequência
        const statusSalvo = row.statusMensal?.[mesAno];
        let status = statusSalvo;
        if (!status || status === 'pendente' || status === 'atrasada') {
          if (diaAtual < row.diaEmissao) {
            status = 'pendente';
          } else if (!statusSalvo || statusSalvo !== 'ok') {
            status = 'atrasada';
          }
        }

        if (!fornecedoresMap.has(fornecedorId)) {
          fornecedoresMap.set(fornecedorId, {
            _id: fornecedorId,
            nome: row.fornecedor,
            contratos: new Map()
          });
        }

        const fornecedor = fornecedoresMap.get(fornecedorId);
        if (!fornecedor.contratos.has(contratoId)) {
          fornecedor.contratos.set(contratoId, {
            _id: contratoId,
            numero: row.contrato,
            estabelecimento: row.estabelecimento,
            medicoes: []
          });
        }

        const contrato = fornecedor.contratos.get(contratoId);
        contrato.medicoes.push({
          _id: row.sequenciaId,
          sequencia: row.sequencia,
          status: status,
          valor: row.valor,
          diaEmissao: row.diaEmissao,
          dataMedicao: row.datMedicao,
          nf: row.numeroNota,
          observacoes: row.observacao
        });
      });

      // Converter Maps para arrays
      const fornecedoresArray = Array.from(fornecedoresMap.values()).map(f => ({
        ...f,
        contratos: Array.from(f.contratos.values())
      }));

      setRelatorio({ fornecedores: fornecedoresArray });

      // Expandir todos os fornecedores por padrão
      const ids = new Set(fornecedoresArray.map(f => f._id));
      setExpandedFornecedores(ids);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      showToast('Erro ao carregar relatório', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (direction) => {
    const [year, month] = mesAno.split('-').map(Number);
    let newMonth = month + direction;
    let newYear = year;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    setMesAno(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const toggleFornecedor = (fornecedorId) => {
    setExpandedFornecedores(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fornecedorId)) {
        newSet.delete(fornecedorId);
      } else {
        newSet.add(fornecedorId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    if (relatorio?.fornecedores) {
      setExpandedFornecedores(new Set(relatorio.fornecedores.map(f => f._id)));
    }
  };

  const collapseAll = () => {
    setExpandedFornecedores(new Set());
  };

  const openEditModal = (medicao, contrato, fornecedor) => {
    setEditingMedicao({
      ...medicao,
      contratoNumero: contrato.numero,
      fornecedorNome: fornecedor.nome
    });
    setEditFormData({
      status: medicao.status || 'pendente',
      valor: medicao.valor || '',
      observacoes: medicao.observacoes || '',
      dataMedicao: medicao.dataMedicao ? medicao.dataMedicao.split('T')[0] : '',
      nf: medicao.nf || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingMedicao?._id) return;

    try {
      setSaving(true);
      // Atualizar status da sequência usando a API de sequências
      await sequenciasAPI.updateStatus(editingMedicao._id, mesAno, editFormData.status);
      showToast('Status atualizado com sucesso', 'success');
      setIsEditModalOpen(false);
      loadRelatorio();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      showToast('Erro ao atualizar status', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatusChange = async (sequenciaId, novoStatus) => {
    try {
      await sequenciasAPI.updateStatus(sequenciaId, mesAno, novoStatus);
      showToast('Status atualizado', 'success');
      loadRelatorio();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      showToast('Erro ao atualizar status', 'error');
    }
  };

  const stats = useMemo(() => {
    if (!relatorio?.fornecedores) return { total: 0, ok: 0, pendente: 0, atrasada: 0 };

    let total = 0, ok = 0, pendente = 0, atrasada = 0;

    relatorio.fornecedores.forEach(f => {
      f.contratos?.forEach(c => {
        c.medicoes?.forEach(m => {
          total++;
          if (m.status === 'ok') ok++;
          else if (m.status === 'pendente') pendente++;
          else if (m.status === 'atrasada') atrasada++;
        });
      });
    });

    return { total, ok, pendente, atrasada };
  }, [relatorio]);

  const filteredFornecedores = useMemo(() => {
    if (!relatorio?.fornecedores) return [];
    if (!filterStatus) return relatorio.fornecedores;

    return relatorio.fornecedores.map(f => ({
      ...f,
      contratos: f.contratos?.map(c => ({
        ...c,
        medicoes: c.medicoes?.filter(m => m.status === filterStatus)
      })).filter(c => c.medicoes?.length > 0)
    })).filter(f => f.contratos?.length > 0);
  }, [relatorio, filterStatus]);

  if (loading) {
    return <Loading text="Carregando relatório..." />;
  }

  return (
    <div className="space-y-6">
      <Toast {...toast} onClose={hideToast} />

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Relatório Mensal</h1>
          <p className="text-base-content/60">Acompanhamento das medições</p>
        </div>

        {/* Navegação de mês */}
        <div className="glass-card p-2 flex items-center gap-2">
          <button className="btn btn-ghost btn-sm btn-square" onClick={() => handleMonthChange(-1)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-semibold min-w-[160px] text-center px-4">
            {getMonthName(mesAno)}
          </span>
          <button className="btn btn-ghost btn-sm btn-square" onClick={() => handleMonthChange(1)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-animate">
        <div className="stat-card-glass primary">
          <div className="stat-title text-sm text-base-content/60">Total</div>
          <div className="stat-value text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="stat-card-glass success">
          <div className="stat-title text-sm text-base-content/60">OK</div>
          <div className="stat-value text-2xl font-bold text-success">{stats.ok}</div>
        </div>
        <div className="stat-card-glass warning">
          <div className="stat-title text-sm text-base-content/60">Pendentes</div>
          <div className="stat-value text-2xl font-bold text-warning">{stats.pendente}</div>
        </div>
        <div className="stat-card-glass error">
          <div className="stat-title text-sm text-base-content/60">Atrasadas</div>
          <div className="stat-value text-2xl font-bold text-error">{stats.atrasada}</div>
        </div>
      </div>

      {/* Filtros e ações */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <select
            className="select select-bordered select-sm glass-input"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Todos os status</option>
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm" onClick={expandAll}>
              Expandir todos
            </button>
            <button className="btn btn-ghost btn-sm" onClick={collapseAll}>
              Recolher todos
            </button>
          </div>

          <button className="btn btn-ghost btn-sm ml-auto" onClick={loadRelatorio}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Atualizar
          </button>
        </div>
      </div>

      {/* Lista de Fornecedores */}
      {filteredFornecedores.length === 0 ? (
        <div className="glass-card p-8">
          <EmptyState
            title="Nenhuma medição encontrada"
            description={filterStatus ? "Tente remover o filtro" : "Não há medições para este período"}
            icon="📊"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFornecedores.map((fornecedor) => (
            <div key={fornecedor._id} className="glass-card overflow-hidden">
              {/* Header do Fornecedor */}
              <div
                className="p-4 cursor-pointer hover:bg-base-200/30 transition-colors flex items-center justify-between"
                onClick={() => toggleFornecedor(fornecedor._id)}
              >
                <div className="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-base-content/50 transition-transform ${expandedFornecedores.has(fornecedor._id) ? 'rotate-90' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <h3 className="font-bold text-lg">{fornecedor.nome}</h3>
                </div>
                <span className="badge badge-ghost">
                  {fornecedor.contratos?.reduce((acc, c) => acc + (c.medicoes?.length || 0), 0) || 0} medições
                </span>
              </div>

              {/* Contratos e Medições */}
              {expandedFornecedores.has(fornecedor._id) && fornecedor.contratos?.length > 0 && (
                <div className="border-t border-base-200/30 p-4 bg-base-200/10">
                  {fornecedor.contratos.map((contrato) => (
                    <div key={contrato._id} className="mb-4 last:mb-0">
                      <div className="text-sm font-medium text-base-content/60 mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Contrato: <span className="font-mono">{contrato.numero}</span>
                      </div>

                      {contrato.medicoes?.length > 0 ? (
                        <div className="glass-card overflow-hidden">
                          <table className="table table-sm">
                            <thead className="bg-base-200/30">
                              <tr className="text-base-content/50 uppercase text-xs">
                                <th>Seq</th>
                                <th>Status</th>
                                <th>Valor</th>
                                <th>NF</th>
                                <th>Data</th>
                                <th>Observações</th>
                                <th className="w-20"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {contrato.medicoes.map((medicao) => (
                                <tr key={medicao._id} className="hover:bg-base-200/20">
                                  <td className="font-semibold">{medicao.sequencia}</td>
                                  <td>
                                    <select
                                      className={`select select-xs ${getStatusClass(medicao.status)} min-w-[100px]`}
                                      value={medicao.status}
                                      onChange={(e) => handleQuickStatusChange(medicao._id, e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {STATUS_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="font-mono text-sm">{medicao.valor ? formatCurrency(medicao.valor) : '-'}</td>
                                  <td className="text-base-content/70">{medicao.nf || '-'}</td>
                                  <td className="text-base-content/70 text-sm">{medicao.dataMedicao ? formatDate(medicao.dataMedicao) : '-'}</td>
                                  <td className="max-w-[150px] truncate text-base-content/60 text-sm" title={medicao.observacoes}>
                                    {medicao.observacoes || '-'}
                                  </td>
                                  <td>
                                    <button
                                      className="btn btn-ghost btn-xs"
                                      onClick={() => openEditModal(medicao, contrato, fornecedor)}
                                    >
                                      Editar
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-base-content/40 italic">
                          Nenhuma medição neste contrato
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de Edição */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Medição"
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => setIsEditModalOpen(false)} disabled={saving}>
              Cancelar
            </button>
            <button className="btn btn-primary shadow-soft" onClick={handleEditSubmit} disabled={saving}>
              {saving ? <span className="loading loading-spinner loading-sm"></span> : 'Salvar'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="glass-card p-4 text-sm">
            <p><strong>Fornecedor:</strong> {editingMedicao?.fornecedorNome}</p>
            <p><strong>Contrato:</strong> {editingMedicao?.contratoNumero}</p>
            <p><strong>Sequência:</strong> {editingMedicao?.sequencia}</p>
          </div>

          <div className="divider"></div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Status</span>
            </label>
            <select
              className="select select-bordered glass-input"
              value={editFormData.status}
              onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Valor</span>
            </label>
            <input
              type="number"
              className="input input-bordered glass-input"
              value={editFormData.valor}
              onChange={(e) => setEditFormData(prev => ({ ...prev, valor: e.target.value }))}
              step="0.01"
              min="0"
              placeholder="0,00"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Número da NF</span>
            </label>
            <input
              type="text"
              className="input input-bordered glass-input"
              value={editFormData.nf}
              onChange={(e) => setEditFormData(prev => ({ ...prev, nf: e.target.value }))}
              placeholder="Número da nota fiscal"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Data da Medição</span>
            </label>
            <input
              type="date"
              className="input input-bordered glass-input"
              value={editFormData.dataMedicao}
              onChange={(e) => setEditFormData(prev => ({ ...prev, dataMedicao: e.target.value }))}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Observações</span>
            </label>
            <textarea
              className="textarea textarea-bordered glass-input"
              value={editFormData.observacoes}
              onChange={(e) => setEditFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              rows={3}
              placeholder="Observações sobre a medição"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
