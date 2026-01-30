import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import logo from '../assets/PROMA 6.2.png';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [invalidToken, setInvalidToken] = useState(!token);

  const getPasswordStrength = (password) => {
    if (!password) return { class: '', width: 0, label: '' };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { class: 'progress-error', width: 33, label: 'Fraca' };
    if (strength <= 3) return { class: 'progress-warning', width: 66, label: 'Média' };
    return { class: 'progress-success', width: 100, label: 'Forte' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (senha !== confirmarSenha) {
      setError('As senhas não conferem');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, senha);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login?msg=senha_alterada');
      }, 2000);
    } catch (err) {
      if (err.response?.status === 400) {
        setInvalidToken(true);
      } else {
        setError(err.response?.data?.message || 'Erro ao redefinir senha');
      }
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(senha);

  // Token inválido
  if (invalidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-error mb-2">Link inválido ou expirado</h2>
            <p className="text-base-content/60 mb-6">
              O link de redefinição de senha é inválido ou já expirou.
              Solicite um novo link.
            </p>
            <Link to="/esqueci-senha" className="btn btn-primary">
              Solicitar novo link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Sucesso
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-success mb-2">Senha alterada!</h2>
            <p className="text-base-content/60">
              Sua senha foi alterada com sucesso. Redirecionando para o login...
            </p>
            <span className="loading loading-dots loading-md mt-4"></span>
          </div>
        </div>
      </div>
    );
  }

  // Formulário
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                <img src={logo} alt="PROMA" className="h-10" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Redefinir senha</h1>
            <p className="text-base-content/60 mt-1">PROMA SIGMA - Digite sua nova senha abaixo</p>
          </div>

          {/* Erro */}
          {error && (
            <div className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nova senha</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input input-bordered w-full pr-12"
                  placeholder="Digite sua nova senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  minLength={6}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Barra de força da senha */}
              {senha && (
                <div className="mt-2">
                  <progress className={`progress ${strength.class} w-full h-1`} value={strength.width} max="100"></progress>
                  <p className="text-xs text-base-content/60 mt-1">
                    Força: <span className={strength.class.replace('progress-', 'text-')}>{strength.label}</span>
                  </p>
                </div>
              )}
              <p className="text-xs text-base-content/60 mt-1">Mínimo de 6 caracteres</p>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Confirmar nova senha</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input input-bordered"
                placeholder="Confirme sua nova senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                minLength={6}
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? '' : 'Redefinir senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
