import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { relatorioAPI } from "../services/api";
import { getStatusClass, getMonthKey } from "../utils/helpers";
import Loading from "../components/ui/Loading";
import EmptyState from "../components/ui/EmptyState";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalFornecedores: 0,
    totalContratos: 0,
    pendentes: 0,
    atrasadas: 0,
  });
  const [atrasadas, setAtrasadas] = useState([]);
  const [pendentes, setPendentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados do resumo e tabela
      const [resumoRes, tabelaRes] = await Promise.all([
        relatorioAPI.getResumo(),
        relatorioAPI.getTabela(),
      ]);

      const resumo = resumoRes.data || {};
      const tabela = tabelaRes.data || [];

      // Calcular atrasadas e pendentes a partir da tabela
      const mesAtual = getMonthKey();
      const hoje = new Date();
      const diaAtual = hoje.getDate();

      const medicoesAtrasadas = [];
      const medicoesPendentes = [];

      tabela.forEach((row) => {
        const statusSalvo = row.statusMensal?.[mesAtual];
        if (statusSalvo === "ok") return;

        const medicaoInfo = {
          fornecedorNome: row.fornecedor,
          contratoNumero: row.contrato,
          sequencia: row.sequencia,
          valor: row.valor,
          diaEmissao: row.diaEmissao,
        };

        if (diaAtual < row.diaEmissao) {
          medicoesPendentes.push({ ...medicaoInfo, status: "pendente" });
        } else {
          medicoesAtrasadas.push({ ...medicaoInfo, status: "atrasada" });
        }
      });

      setStats({
        totalFornecedores: resumo.fornecedores || 0,
        totalContratos: resumo.contratos || 0,
        pendentes: resumo.pendentes || medicoesPendentes.length,
        atrasadas: resumo.atrasadas || medicoesAtrasadas.length,
      });

      setAtrasadas(medicoesAtrasadas.slice(0, 5));
      setPendentes(medicoesPendentes.slice(0, 5));
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
      setError("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Carregando dashboard..." />;
  }

  if (error) {
    return (
      <div className="glass-card p-6">
        <div className="alert alert-error">
          <span>{error}</span>
          <button className="btn btn-sm btn-ghost" onClick={loadDashboardData}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Dashboard</h1>
          <p className="text-base-content/60">
            Visão geral do sistema de controle
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm shadow-soft"
          onClick={loadDashboardData}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Atualizar
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-animate">
        <div className="stat-card-glass error">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-base-content/60 font-medium">
                Medições Atrasadas
              </p>
              <p className="text-3xl font-bold text-error mt-1">
                {stats.atrasadas}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-error"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card-glass warning">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-base-content/60 font-medium">
                Medições Pendentes
              </p>
              <p className="text-3xl font-bold text-warning mt-1">
                {stats.pendentes}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-warning"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card-glass info">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-base-content/60 font-medium">
                Fornecedores
              </p>
              <p className="text-3xl font-bold text-info mt-1">
                {stats.totalFornecedores}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-info"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card-glass success">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-base-content/60 font-medium">
                Contratos
              </p>
              <p className="text-3xl font-bold text-success mt-1">
                {stats.totalContratos}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Listas de Medições */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medições Atrasadas */}
        <div className="glass-card glass-card-hover p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Medições Atrasadas
            </h2>
            <Link to="/relatorio" className="btn btn-ghost btn-xs">
              Ver todas
            </Link>
          </div>

          {atrasadas.length === 0 ? (
            <EmptyState
              title="Nenhuma medição atrasada"
              description="Todas as medições estão em dia!"
              icon="✅"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr className="text-base-content/50">
                    <th>Fornecedor</th>
                    <th>Contrato</th>
                    <th>Seq</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {atrasadas.map((m, idx) => (
                    <tr key={idx} className="hover:bg-base-200/30">
                      <td className="font-medium">{m.fornecedorNome}</td>
                      <td className="text-base-content/70">
                        {m.contratoNumero}
                      </td>
                      <td className="text-center">{m.sequencia}</td>
                      <td>
                        <span className={`text-xs ${getStatusClass(m.status)}`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Medições Pendentes */}
        <div className="glass-card glass-card-hover p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-warning">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Medições Pendentes
            </h2>
            <Link to="/relatorio" className="btn btn-ghost btn-xs">
              Ver todas
            </Link>
          </div>

          {pendentes.length === 0 ? (
            <EmptyState
              title="Nenhuma medição pendente"
              description="Não há medições aguardando processamento"
              icon="📋"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr className="text-base-content/50">
                    <th>Fornecedor</th>
                    <th>Contrato</th>
                    <th>Seq</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendentes.map((m, idx) => (
                    <tr key={idx} className="hover:bg-base-200/30">
                      <td className="font-medium">{m.fornecedorNome}</td>
                      <td className="text-base-content/70">
                        {m.contratoNumero}
                      </td>
                      <td className="text-center">{m.sequencia}</td>
                      <td>
                        <span className={`text-xs ${getStatusClass(m.status)}`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
