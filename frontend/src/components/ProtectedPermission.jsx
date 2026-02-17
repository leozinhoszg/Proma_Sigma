import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHomePath } from '../utils/helpers';

/**
 * Componente de guarda de permissão
 * Verifica se o usuário tem a permissão necessária para acessar a rota
 * Se não tiver, redireciona para a homepage do usuário
 *
 * @param {string|string[]} permissao - Permissão(ões) necessária(s) para acessar a rota
 * @param {React.ReactNode} children - Componente filho a ser renderizado
 */
export default function ProtectedPermission({ permissao, children }) {
  const { usuario } = useAuth();

  // Verificar permissões do usuário
  const temPermissao = () => {
    const perfil = usuario?.perfil;

    // Se não tem perfil, não tem permissão (exceto dashboard)
    if (!perfil) {
      return false;
    }

    // Se é admin, tem acesso total
    if (perfil.isAdmin) {
      return true;
    }

    const permissoesUsuario = perfil.permissoes || [];

    // Se permissao for array, verifica se tem pelo menos uma
    if (Array.isArray(permissao)) {
      return permissao.some(p => permissoesUsuario.includes(p));
    }

    // Se for string única
    return permissoesUsuario.includes(permissao);
  };

  if (!temPermissao()) {
    return <Navigate to={getHomePath(usuario)} replace />;
  }

  return children;
}
