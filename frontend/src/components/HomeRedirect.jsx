import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHomePath } from '../utils/helpers';

/**
 * Componente que redireciona o usuario para sua homepage baseada nas permissoes.
 * Se o usuario tem permissao de dashboard, renderiza o children (Dashboard).
 * Caso contrario, redireciona para a primeira pagina disponivel.
 */
export default function HomeRedirect({ children }) {
  const { usuario } = useAuth();
  const homePath = getHomePath(usuario);

  // Se a homepage do usuario e o dashboard, renderiza normalmente
  if (homePath === '/') {
    return children;
  }

  // Caso contrario, redireciona para a homepage correta
  return <Navigate to={homePath} replace />;
}
