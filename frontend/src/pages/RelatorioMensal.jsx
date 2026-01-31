import { useState, useEffect, useMemo } from 'react';
import { relatorioAPI, medicoesAPI } from '../services/api';
import { formatCurrency, formatDate, getMonthKey, getMonthName } from '../utils/helpers';
import Loading from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../hooks/useToast';
import Toast from '../components/ui/Toast';

const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

const getStatusBadge = (status) => {
  switch (status) {
    case 'ok':
      return 'badge-success';
    case 'pendente':
      return 'badge-warning';
    case 'atrasada':
      return 'badge-error';
    case 'nao_aplicavel':
      return 'badge-ghost';
    default:
      return 'badge-ghost';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'ok':
      return 'OK';
    case 'pendente':
      return 'PEND';
    case 'atrasada':
      return 'ATR';
    case 'nao_aplicavel':
      return 'N/A';
    default:
      return '-';
  }
};

export default function RelatorioMensal() {
  const [relatorio, setRelatorio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [expandedFornecedores, setExpandedFornecedores] = useState(new Set());
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedSequencias, setSelectedSequencias] = useState(new Set());

  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadRelatorio();
  }, [anoAtual]);

  const loadRelatorio = async () => {
    try {
      setLoading(true);
      const response = await relatorioAPI.getTabela(anoAtual);
      const tabela = response.data || [];
      setRelatorio(tabela);

      // Expandir todos os fornecedores por padrão
      const fornecedorIds = new Set(tabela.map(row => row.fornecedorId?._id || row.fornecedorId));
      setExpandedFornecedores(fornecedorIds);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      showToast('Erro ao carregar relatório', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (direction) => {
    setAnoAtual(prev => prev + direction);
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
    const ids = new Set(relatorio.map(row => row.fornecedorId?._id || row.fornecedorId));
    setExpandedFornecedores(ids);
  };

  const collapseAll = () => {
    setExpandedFornecedores(new Set());
  };

  // Checkbox handling
  const toggleSequencia = (sequenciaId) => {
    setSelectedSequencias(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sequenciaId)) {
        newSet.delete(sequenciaId);
      } else {
        newSet.add(sequenciaId);
      }
      return newSet;
    });
  };

  const toggleAllSequencias = () => {
    if (selectedSequencias.size === relatorio.length) {
      setSelectedSequencias(new Set());
    } else {
      setSelectedSequencias(new Set(relatorio.map(row => row.sequenciaId)));
    }
  };

  // Sincronizar sequências selecionadas
  const sincronizarSelecionadas = async () => {
    if (selectedSequencias.size === 0) {
      showToast('Selecione ao menos uma sequência', 'warning');
      return;
    }

    try {
      setSyncing(true);
      const promises = Array.from(selectedSequencias).map(id =>
        medicoesAPI.sincronizar(id)
      );
      await Promise.all(promises);
      showToast(`${selectedSequencias.size} sequência(s) sincronizada(s) com sucesso`, 'success');
      setSelectedSequencias(new Set());
      loadRelatorio();
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      showToast('Erro ao sincronizar sequências', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Sincronizar todas as sequências
  const sincronizarTodas = async () => {
    try {
      setSyncing(true);
      await medicoesAPI.sincronizarTodas();
      showToast('Todas as sequências sincronizadas com sucesso', 'success');
      setSelectedSequencias(new Set());
      loadRelatorio();
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      showToast('Erro ao sincronizar todas as sequências', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Agrupar dados por fornecedor > contrato
  const dadosAgrupados = useMemo(() => {
    const fornecedoresMap = new Map();

    relatorio.forEach(row => {
      const fornecedorId = row.fornecedorId?._id || row.fornecedorId;
      const contratoId = row.contratoId?._id || row.contratoId;

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
          medicoes: []
        });
      }

      const contrato = fornecedor.contratos.get(contratoId);
      contrato.medicoes.push({
        _id: row.sequenciaId,
        sequencia: row.sequencia,
        estabelecimento: row.estabelecimento,
        recebimento: row.recebimento,
        custo: row.custo || row.valor,
        dataEmissao: row.dataEmissao || row.diaEmissao,
        dataMedicao: row.datMedicao || row.dataMedicao,
        responsavel: row.responsavel,
        numeroNota: row.numeroNota,
        statusMensal: row.statusMensal || {}
      });
    });

    // Converter Maps para arrays
    return Array.from(fornecedoresMap.values()).map(f => ({
      ...f,
      contratos: Array.from(f.contratos.values())
    }));
  }, [relatorio]);

  // Estatísticas
  const stats = useMemo(() => {
    const mesAtual = `${anoAtual}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    let total = 0, ok = 0, pendente = 0, atrasada = 0;

    relatorio.forEach(row => {
      total++;
      const status = row.statusMensal?.[mesAtual];
      if (status === 'ok') ok++;
      else if (status === 'pendente') pendente++;
      else if (status === 'atrasada') atrasada++;
    });

    return { total, ok, pendente, atrasada };
  }, [relatorio, anoAtual]);

  // Filtrar dados
  const dadosFiltrados = useMemo(() => {
    if (!filterStatus) return dadosAgrupados;

    const mesAtual = `${anoAtual}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    return dadosAgrupados.map(f => ({
      ...f,
      contratos: f.contratos.map(c => ({
        ...c,
        medicoes: c.medicoes.filter(m => m.statusMensal?.[mesAtual] === filterStatus)
      })).filter(c => c.medicoes.length > 0)
    })).filter(f => f.contratos.length > 0);
  }, [dadosAgrupados, filterStatus, anoAtual]);

  // Obter status de um mês específico
  const getStatusMes = (statusMensal, mesIndex) => {
    const monthKey = `${anoAtual}-${String(mesIndex + 1).padStart(2, '0')}`;
    return statusMensal?.[monthKey] || null;
  };

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

        {/* Navegação de ano */}
        <div className="glass-card p-2 flex items-center gap-2">
          <button className="btn btn-ghost btn-sm btn-square" onClick={() => handleYearChange(-1)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-semibold min-w-[100px] text-center px-4">
            {anoAtual}
          </span>
          <button className="btn btn-ghost btn-sm btn-square" onClick={() => handleYearChange(1)}>
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
            <option value="ok">OK</option>
            <option value="pendente">Pendente</option>
            <option value="atrasada">Atrasada</option>
            <option value="nao_aplicavel">N/A</option>
          </select>

          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm" onClick={expandAll}>
              Expandir todos
            </button>
            <button className="btn btn-ghost btn-sm" onClick={collapseAll}>
              Recolher todos
            </button>
          </div>

          <div className="flex gap-2 ml-auto">
            {/* Botões de Sincronização */}
            <button
              className="btn btn-primary btn-sm shadow-soft"
              onClick={sincronizarSelecionadas}
              disabled={syncing || selectedSequencias.size === 0}
            >
              {syncing ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Sincronizar Selecionadas ({selectedSequencias.size})
            </button>

            <button
              className="btn btn-secondary btn-sm shadow-soft"
              onClick={sincronizarTodas}
              disabled={syncing}
            >
              {syncing ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Sincronizar Todas
            </button>

            <button className="btn btn-ghost btn-sm" onClick={loadRelatorio}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Fornecedores */}
      {dadosFiltrados.length === 0 ? (
        <div className="glass-card p-8">
          <EmptyState
            title="Nenhuma medição encontrada"
            description={filterStatus ? "Tente remover o filtro" : "Não há medições para este período"}
            icon="📊"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {dadosFiltrados.map((fornecedor) => (
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
                        <div className="glass-card overflow-x-auto">
                          <table className="table table-xs table-pin-rows">
                            <thead className="bg-base-200/30">
                              <tr className="text-base-content/50 uppercase text-xs">
                                <th className="w-8">
                                  <input
                                    type="checkbox"
                                    className="checkbox checkbox-xs"
                                    checked={contrato.medicoes.every(m => selectedSequencias.has(m._id))}
                                    onChange={() => {
                                      const allSelected = contrato.medicoes.every(m => selectedSequencias.has(m._id));
                                      setSelectedSequencias(prev => {
                                        const newSet = new Set(prev);
                                        contrato.medicoes.forEach(m => {
                                          if (allSelected) {
                                            newSet.delete(m._id);
                                          } else {
                                            newSet.add(m._id);
                                          }
                                        });
                                        return newSet;
                                      });
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </th>
                                <th>Est.</th>
                                <th>Seq</th>
                                <th>Receb.</th>
                                <th>Custo</th>
                                <th>Dt.Emis.</th>
                                <th>Dt.Med.</th>
                                <th>Resp.</th>
                                {MESES.map((mes, idx) => (
                                  <th key={mes} className="text-center">{mes}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {contrato.medicoes.map((medicao) => (
                                <tr key={medicao._id} className="hover:bg-base-200/20">
                                  <td>
                                    <input
                                      type="checkbox"
                                      className="checkbox checkbox-xs"
                                      checked={selectedSequencias.has(medicao._id)}
                                      onChange={() => toggleSequencia(medicao._id)}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </td>
                                  <td className="text-xs">{medicao.estabelecimento || '-'}</td>
                                  <td className="font-semibold">{medicao.sequencia}</td>
                                  <td className="text-xs">{medicao.recebimento || '-'}</td>
                                  <td className="font-mono text-xs">{medicao.custo ? formatCurrency(medicao.custo) : '-'}</td>
                                  <td className="text-xs">{medicao.dataEmissao ? (typeof medicao.dataEmissao === 'number' ? `Dia ${medicao.dataEmissao}` : formatDate(medicao.dataEmissao)) : '-'}</td>
                                  <td className="text-xs">{medicao.dataMedicao ? formatDate(medicao.dataMedicao) : '-'}</td>
                                  <td className="text-xs">{medicao.responsavel || '-'}</td>
                                  {MESES.map((mes, idx) => {
                                    const status = getStatusMes(medicao.statusMensal, idx);
                                    return (
                                      <td key={mes} className="text-center">
                                        {status ? (
                                          <span className={`badge badge-xs ${getStatusBadge(status)}`}>
                                            {getStatusLabel(status)}
                                          </span>
                                        ) : (
                                          <span className="text-base-content/30">-</span>
                                        )}
                                      </td>
                                    );
                                  })}
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
    </div>
  );
}
