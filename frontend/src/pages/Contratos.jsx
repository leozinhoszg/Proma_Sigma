import { useState, useEffect } from 'react';
import { contratosAPI, fornecedoresAPI, sequenciasAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Loading from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../hooks/useToast';
import Toast from '../components/ui/Toast';

const initialFormData = {
  numero: '',
  fornecedor: '',
  objeto: '',
  valor: '',
  dataInicio: '',
  dataFim: ''
};

export default function Contratos() {
  const [contratos, setContratos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFornecedor, setFilterFornecedor] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSequenciasModalOpen, setIsSequenciasModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedContrato, setSelectedContrato] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  const [sequencias, setSequencias] = useState([]);
  const [novaSequencia, setNovaSequencia] = useState({ numero: '', descricao: '' });

  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [contratosRes, fornecedoresRes] = await Promise.all([
        contratosAPI.listar(),
        fornecedoresAPI.listar()
      ]);
      setContratos(contratosRes.data || []);
      setFornecedores(fornecedoresRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showToast('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (contrato) => {
    setFormData({
      numero: contrato.numero || '',
      fornecedor: contrato.fornecedor?._id || contrato.fornecedor || '',
      objeto: contrato.objeto || '',
      valor: contrato.valor || '',
      dataInicio: contrato.dataInicio ? contrato.dataInicio.split('T')[0] : '',
      dataFim: contrato.dataFim ? contrato.dataFim.split('T')[0] : ''
    });
    setEditingId(contrato._id);
    setIsModalOpen(true);
  };

  const openDeleteDialog = (id) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const openSequenciasModal = async (contrato) => {
    setSelectedContrato(contrato);
    setNovaSequencia({ numero: '', descricao: '' });
    try {
      const response = await sequenciasAPI.listarPorContrato(contrato._id);
      setSequencias(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar sequências:', error);
      setSequencias([]);
    }
    setIsSequenciasModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.numero.trim()) {
      showToast('Número do contrato é obrigatório', 'warning');
      return;
    }

    if (!formData.fornecedor) {
      showToast('Selecione um fornecedor', 'warning');
      return;
    }

    try {
      setSaving(true);

      const dados = {
        ...formData,
        valor: formData.valor ? parseFloat(formData.valor) : 0
      };

      if (editingId) {
        await contratosAPI.atualizar(editingId, dados);
        showToast('Contrato atualizado com sucesso', 'success');
      } else {
        await contratosAPI.criar(dados);
        showToast('Contrato criado com sucesso', 'success');
      }

      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar contrato:', error);
      showToast('Erro ao salvar contrato', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await contratosAPI.excluir(deletingId);
      showToast('Contrato excluído com sucesso', 'success');
      loadData();
    } catch (error) {
      console.error('Erro ao excluir contrato:', error);
      showToast('Erro ao excluir contrato', 'error');
    }
  };

  const handleAddSequencia = async () => {
    if (!novaSequencia.numero.trim()) {
      showToast('Número da sequência é obrigatório', 'warning');
      return;
    }

    try {
      await sequenciasAPI.criar({
        contrato: selectedContrato._id,
        numero: novaSequencia.numero,
        descricao: novaSequencia.descricao
      });
      showToast('Sequência adicionada com sucesso', 'success');
      setNovaSequencia({ numero: '', descricao: '' });

      const response = await sequenciasAPI.listarPorContrato(selectedContrato._id);
      setSequencias(response.data || []);
    } catch (error) {
      console.error('Erro ao adicionar sequência:', error);
      showToast('Erro ao adicionar sequência', 'error');
    }
  };

  const handleDeleteSequencia = async (sequenciaId) => {
    try {
      await sequenciasAPI.excluir(sequenciaId);
      showToast('Sequência excluída', 'success');
      const response = await sequenciasAPI.listarPorContrato(selectedContrato._id);
      setSequencias(response.data || []);
    } catch (error) {
      console.error('Erro ao excluir sequência:', error);
      showToast('Erro ao excluir sequência', 'error');
    }
  };

  const getFornecedorNome = (fornecedor) => {
    if (!fornecedor) return '-';
    if (typeof fornecedor === 'string') {
      const f = fornecedores.find(f => f._id === fornecedor);
      return f?.nome || '-';
    }
    return fornecedor.nome || '-';
  };

  const filteredContratos = contratos.filter(c => {
    const matchesSearch =
      c.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.objeto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getFornecedorNome(c.fornecedor).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFornecedor = !filterFornecedor ||
      (c.fornecedor?._id || c.fornecedor) === filterFornecedor;

    return matchesSearch && matchesFornecedor;
  });

  if (loading) {
    return <Loading text="Carregando contratos..." />;
  }

  return (
    <div className="space-y-6">
      <Toast {...toast} onClose={hideToast} />

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Contratos</h1>
          <p className="text-base-content/60">Gerencie os contratos e suas sequências</p>
        </div>
        <button className="btn btn-primary shadow-soft" onClick={openCreateModal}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Contrato
        </button>
      </div>

      {/* Filtros */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-3 flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar contrato..."
              className="input input-ghost flex-1 glass-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="select select-bordered glass-input w-full sm:w-64"
            value={filterFornecedor}
            onChange={(e) => setFilterFornecedor(e.target.value)}
          >
            <option value="">Todos os fornecedores</option>
            {fornecedores.map(f => (
              <option key={f._id} value={f._id}>{f.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Contratos */}
      {filteredContratos.length === 0 ? (
        <div className="glass-card p-8">
          <EmptyState
            title={searchTerm || filterFornecedor ? "Nenhum resultado encontrado" : "Nenhum contrato cadastrado"}
            description={searchTerm || filterFornecedor ? "Tente alterar os filtros" : "Clique em 'Novo Contrato' para começar"}
            icon="📄"
            action={
              !searchTerm && !filterFornecedor && (
                <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
                  Adicionar Contrato
                </button>
              )
            }
          />
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="bg-base-200/30">
                <tr className="text-base-content/60 uppercase text-xs">
                  <th>Número</th>
                  <th>Fornecedor</th>
                  <th>Objeto</th>
                  <th>Valor</th>
                  <th>Período</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredContratos.map((contrato) => (
                  <tr key={contrato._id} className="hover:bg-base-200/20 transition-colors">
                    <td className="font-semibold font-mono">{contrato.numero}</td>
                    <td className="text-base-content/80">{getFornecedorNome(contrato.fornecedor)}</td>
                    <td className="max-w-xs truncate text-base-content/70">{contrato.objeto || '-'}</td>
                    <td className="font-semibold text-primary">{contrato.valor ? formatCurrency(contrato.valor) : '-'}</td>
                    <td className="text-sm text-base-content/60">
                      {contrato.dataInicio || contrato.dataFim ? (
                        <span>
                          {formatDate(contrato.dataInicio)} - {formatDate(contrato.dataFim)}
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <button
                          className="btn btn-ghost btn-sm btn-square"
                          onClick={() => openSequenciasModal(contrato)}
                          title="Gerenciar Sequências"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                          </svg>
                        </button>
                        <button
                          className="btn btn-ghost btn-sm btn-square"
                          onClick={() => openEditModal(contrato)}
                          title="Editar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                          onClick={() => openDeleteDialog(contrato._id)}
                          title="Excluir"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-base-200/30 bg-base-200/10">
            <p className="text-sm text-base-content/50">
              {filteredContratos.length} contrato{filteredContratos.length !== 1 ? 's' : ''} encontrado{filteredContratos.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Modal de Criar/Editar Contrato */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Editar Contrato' : 'Novo Contrato'}
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)} disabled={saving}>
              Cancelar
            </button>
            <button className="btn btn-primary shadow-soft" onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : editingId ? 'Salvar' : 'Criar'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Número do Contrato *</span>
            </label>
            <input
              type="text"
              name="numero"
              className="input input-bordered glass-input"
              value={formData.numero}
              onChange={handleInputChange}
              placeholder="Ex: CT-2024-001"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Fornecedor *</span>
            </label>
            <select
              name="fornecedor"
              className="select select-bordered glass-input"
              value={formData.fornecedor}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecione um fornecedor</option>
              {fornecedores.map(f => (
                <option key={f._id} value={f._id}>{f.nome}</option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Objeto</span>
            </label>
            <textarea
              name="objeto"
              className="textarea textarea-bordered glass-input"
              value={formData.objeto}
              onChange={handleInputChange}
              placeholder="Descrição do objeto do contrato"
              rows={3}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Valor</span>
            </label>
            <input
              type="number"
              name="valor"
              className="input input-bordered glass-input"
              value={formData.valor}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              placeholder="0,00"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Data Início</span>
              </label>
              <input
                type="date"
                name="dataInicio"
                className="input input-bordered glass-input"
                value={formData.dataInicio}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Data Fim</span>
              </label>
              <input
                type="date"
                name="dataFim"
                className="input input-bordered glass-input"
                value={formData.dataFim}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal de Sequências */}
      <Modal
        isOpen={isSequenciasModalOpen}
        onClose={() => setIsSequenciasModalOpen(false)}
        title={`Sequências - ${selectedContrato?.numero || ''}`}
      >
        <div className="space-y-4">
          {/* Formulário para adicionar sequência */}
          <div className="glass-card p-4">
            <p className="text-sm font-medium mb-3">Adicionar Nova Sequência</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Número"
                className="input input-bordered input-sm glass-input w-24"
                value={novaSequencia.numero}
                onChange={(e) => setNovaSequencia(prev => ({ ...prev, numero: e.target.value }))}
              />
              <input
                type="text"
                placeholder="Descrição (opcional)"
                className="input input-bordered input-sm glass-input flex-1"
                value={novaSequencia.descricao}
                onChange={(e) => setNovaSequencia(prev => ({ ...prev, descricao: e.target.value }))}
              />
              <button className="btn btn-primary btn-sm" onClick={handleAddSequencia}>
                Adicionar
              </button>
            </div>
          </div>

          {/* Lista de sequências */}
          {sequencias.length === 0 ? (
            <p className="text-center text-base-content/50 py-8">
              Nenhuma sequência cadastrada
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead className="bg-base-200/30">
                  <tr className="text-base-content/60 uppercase text-xs">
                    <th>Número</th>
                    <th>Descrição</th>
                    <th className="w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {sequencias.map((seq) => (
                    <tr key={seq._id} className="hover:bg-base-200/20">
                      <td className="font-semibold">{seq.numero}</td>
                      <td className="text-base-content/70">{seq.descricao || '-'}</td>
                      <td>
                        <button
                          className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                          onClick={() => handleDeleteSequencia(seq._id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>

      {/* Dialog de Confirmação de Exclusão */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Contrato"
        message="Tem certeza que deseja excluir este contrato? Todas as sequências e medições associadas também serão excluídas."
        confirmText="Excluir"
        variant="error"
      />
    </div>
  );
}
