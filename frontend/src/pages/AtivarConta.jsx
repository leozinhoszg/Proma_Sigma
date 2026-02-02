import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import ThemeToggle from '../components/ui/ThemeToggle';
import logo from '../assets/PROMA 6.2.png';

export default function AtivarConta() {
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

    if (strength <= 2) return { class: 'bg-red-500', width: 33, label: 'Fraca', textClass: 'text-red-500' };
    if (strength <= 3) return { class: 'bg-yellow-500', width: 66, label: 'Media', textClass: 'text-yellow-500' };
    return { class: 'bg-emerald-500', width: 100, label: 'Forte', textClass: 'text-emerald-500' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (senha.length < 6) {
      setError('A senha deve ter no minimo 6 caracteres');
      return;
    }

    if (senha !== confirmarSenha) {
      setError('As senhas nao conferem');
      return;
    }

    setLoading(true);

    try {
      await authService.ativarConta(token, senha);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login?msg=conta_ativada');
      }, 2000);
    } catch (err) {
      if (err.response?.status === 400) {
        setInvalidToken(true);
      } else {
        setError(err.response?.data?.message || 'Erro ao ativar conta');
      }
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(senha);

  // Componente do painel esquerdo (brand panel)
  const BrandPanel = ({ subtitle }) => (
    <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden login-brand-panel">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large floating orbs */}
        <div className="login-orb login-orb-1"></div>
        <div className="login-orb login-orb-2"></div>
        <div className="login-orb login-orb-3"></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 login-grid-pattern opacity-10"></div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-linear-to-br from-transparent via-white/5 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
        <div className="max-w-md text-center">
          {/* Logo */}
          <div className="mb-10 login-logo-container">
            <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl mb-6">
              <img src={logo} alt="PROMA" className="h-16" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 logo-font">
              PROMA <span className="text-sky-400">SIGMA</span>
            </h1>
            <div className="h-1 w-20 mx-auto bg-linear-to-r from-sky-500 to-blue-400 rounded-full"></div>
          </div>

          <p className="text-white/70 text-lg leading-relaxed mb-12">
            {subtitle}
          </p>

          {/* Features */}
          <div className="space-y-4 text-left">
            <div className="login-feature-card group">
              <div className="login-feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold block text-white">Use no minimo 6 caracteres</span>
                <span className="text-xs text-white/50">Senhas mais longas sao mais seguras</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/30 group-hover:text-sky-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            <div className="login-feature-card group">
              <div className="login-feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold block text-white">Combine letras, numeros e simbolos</span>
                <span className="text-xs text-white/50">Aumenta a seguranca da sua conta</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/30 group-hover:text-sky-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            <div className="login-feature-card group">
              <div className="login-feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold block text-white">Evite senhas obvias ou repetidas</span>
                <span className="text-xs text-white/50">Nao use datas ou nomes pessoais</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/30 group-hover:text-sky-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-20 fill-current text-white/5">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,118.92,156.63,69.08,321.39,56.44Z"></path>
        </svg>
      </div>
    </div>
  );

  // Token invalido
  if (invalidToken) {
    return (
      <div className="login-page-v2 min-h-screen flex">
        {/* Theme Toggle */}
        <div className="fixed top-6 right-6 z-50">
          <ThemeToggle className="btn-circle login-theme-toggle backdrop-blur-md" />
        </div>

        {/* Left Side - Brand Panel */}
        <BrandPanel subtitle="Sistema de gestao e monitoramento de contratos com fornecedores" />

        {/* Right Side - Error */}
        <div className="w-full lg:w-[55%] flex flex-col login-form-panel relative">
          <div className="absolute inset-0 login-form-bg"></div>

          <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-16 relative z-10">
            <div className="w-full max-w-md login-form-container text-center">
              {/* Mobile Logo */}
              <div className="lg:hidden flex flex-col items-center mb-10">
                <div className="inline-flex items-center justify-center p-3 bg-linear-to-br from-navy-600 to-navy-800 rounded-xl shadow-lg mb-4">
                  <img src={logo} alt="PROMA" className="h-10" />
                </div>
                <h1 className="text-2xl font-bold text-navy-900 dark:text-white logo-font">
                  PROMA <span className="text-sky-600 dark:text-sky-400">SIGMA</span>
                </h1>
              </div>

              {/* Error Icon */}
              <div className="w-20 h-20 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-3">Link invalido ou expirado</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                O link de ativacao de conta e invalido ou ja expirou.
                Entre em contato com o administrador para solicitar um novo convite.
              </p>

              <Link
                to="/login"
                className="login-submit-btn w-full h-13 text-base font-semibold flex items-center justify-center"
              >
                Voltar ao login
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 pb-6 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              PROMA SIGMA &copy; {new Date().getFullYear()} &bull; Todos os direitos reservados
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Sucesso
  if (success) {
    return (
      <div className="login-page-v2 min-h-screen flex">
        {/* Theme Toggle */}
        <div className="fixed top-6 right-6 z-50">
          <ThemeToggle className="btn-circle login-theme-toggle backdrop-blur-md" />
        </div>

        {/* Left Side - Brand Panel */}
        <BrandPanel subtitle="Sistema de gestao e monitoramento de contratos com fornecedores" />

        {/* Right Side - Success */}
        <div className="w-full lg:w-[55%] flex flex-col login-form-panel relative">
          <div className="absolute inset-0 login-form-bg"></div>

          <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-16 relative z-10">
            <div className="w-full max-w-md login-form-container text-center">
              {/* Mobile Logo */}
              <div className="lg:hidden flex flex-col items-center mb-10">
                <div className="inline-flex items-center justify-center p-3 bg-linear-to-br from-navy-600 to-navy-800 rounded-xl shadow-lg mb-4">
                  <img src={logo} alt="PROMA" className="h-10" />
                </div>
                <h1 className="text-2xl font-bold text-navy-900 dark:text-white logo-font">
                  PROMA <span className="text-sky-600 dark:text-sky-400">SIGMA</span>
                </h1>
              </div>

              {/* Success Icon */}
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-3">Conta ativada com sucesso!</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                Sua conta foi ativada. Voce sera redirecionado para a pagina de login.
              </p>

              <div className="flex justify-center">
                <svg className="animate-spin h-8 w-8 text-navy-700 dark:text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 pb-6 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              PROMA SIGMA &copy; {new Date().getFullYear()} &bull; Todos os direitos reservados
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Formulario
  return (
    <div className="login-page-v2 min-h-screen flex">
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle className="btn-circle login-theme-toggle backdrop-blur-md" />
      </div>

      {/* Left Side - Brand Panel */}
      <BrandPanel subtitle="Crie uma senha segura para acessar o sistema" />

      {/* Right Side - Form */}
      <div className="w-full lg:w-[55%] flex flex-col login-form-panel relative">
        <div className="absolute inset-0 login-form-bg"></div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-16 relative z-10">
          <div className="w-full max-w-md login-form-container">
            {/* Mobile Logo */}
            <div className="lg:hidden flex flex-col items-center mb-10">
              <div className="inline-flex items-center justify-center p-3 bg-linear-to-br from-navy-600 to-navy-800 rounded-xl shadow-lg mb-4">
                <img src={logo} alt="PROMA" className="h-10" />
              </div>
              <h1 className="text-2xl font-bold text-navy-900 dark:text-white logo-font">
                PROMA <span className="text-sky-600 dark:text-sky-400">SIGMA</span>
              </h1>
            </div>

            {/* Welcome Badge */}
            <span className="inline-flex items-center gap-2 text-xs font-semibold login-welcome-badge px-3 py-1.5 rounded-full mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Bem-vindo ao PROMA SIGMA!
            </span>

            {/* Title */}
            <div className="mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold login-title mb-2">
                Ativar Conta
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Defina sua senha para acessar o sistema
              </p>
            </div>

            {/* Erro */}
            {error && (
              <div className="login-alert-error mb-6 p-4 rounded-xl flex items-center gap-3">
                <div className="login-alert-error-icon w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="login-alert-error-text text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="login-input-group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Sua senha
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="login-input w-full h-13 pl-12 pr-12 text-base"
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    minLength={6}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy-700 dark:hover:text-sky-400 transition-colors p-1"
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

                {/* Barra de forca da senha */}
                {senha && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Forca da senha:</span>
                      <span className={`text-xs font-medium ${strength.textClass}`}>{strength.label}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.class} transition-all duration-300`} style={{ width: `${strength.width}%` }}></div>
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Minimo de 6 caracteres</p>
              </div>

              <div className="login-input-group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Confirmar senha
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="login-input w-full h-13 pl-12 pr-4 text-base"
                    placeholder="Confirme sua senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    minLength={6}
                    autoComplete="new-password"
                    required
                  />
                </div>
                {confirmarSenha && senha !== confirmarSenha && (
                  <p className="text-xs text-red-500 mt-2">As senhas nao conferem</p>
                )}
                {confirmarSenha && senha === confirmarSenha && (
                  <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Senhas conferem
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="login-submit-btn w-full h-13 text-base font-semibold"
                disabled={loading || senha !== confirmarSenha}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Ativando...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Ativar minha conta
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="login-divider-text px-4 font-medium">Acesso Seguro</span>
              </div>
            </div>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-6 text-gray-400 dark:text-gray-500">
              <div className="flex items-center gap-2 text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>SSL Seguro</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Dados Protegidos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 pb-6 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            PROMA SIGMA &copy; {new Date().getFullYear()} &bull; Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
