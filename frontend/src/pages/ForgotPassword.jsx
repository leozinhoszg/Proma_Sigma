import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import ThemeToggle from '../components/ui/ThemeToggle';
import logo from '../assets/PROMA 6.2.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Digite seu email');
      return;
    }

    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      // Por seguranca, mostramos sucesso mesmo se email nao existir
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-v2 min-h-screen flex">
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle className="btn-circle login-theme-toggle backdrop-blur-md" />
      </div>

      {/* Left Side - Navy Blue Brand Panel */}
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
              Nao se preocupe, vamos ajuda-lo a recuperar o acesso a sua conta
            </p>

            {/* Features */}
            <div className="space-y-4 text-left">
              <div className="login-feature-card group">
                <div className="login-feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold block text-white">Receba um link seguro por email</span>
                  <span className="text-xs text-white/50">Enviaremos instrucoes para seu email</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/30 group-hover:text-sky-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              <div className="login-feature-card group">
                <div className="login-feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold block text-white">Link valido por 1 hora</span>
                  <span className="text-xs text-white/50">Por seguranca, o link expira apos esse periodo</span>
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
                  <span className="text-sm font-semibold block text-white">Processo seguro e criptografado</span>
                  <span className="text-xs text-white/50">Seus dados estao protegidos</span>
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

      {/* Right Side - Form */}
      <div className="w-full lg:w-[55%] flex flex-col login-form-panel relative">
        {/* Subtle background pattern */}
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

            {/* Back Link */}
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-navy-700 dark:hover:text-sky-400 transition-colors mb-6 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Voltar ao login</span>
            </Link>

            {!sent ? (
              <>
                {/* Title */}
                <div className="mb-8">
                  <h2 className="text-3xl lg:text-4xl font-bold login-title mb-2">
                    Recuperar Senha
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Digite seu email cadastrado e enviaremos instrucoes para redefinir sua senha
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
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        className="login-input w-full h-13 pl-12 pr-4 text-base"
                        placeholder="nome@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="login-submit-btn w-full h-13 text-base font-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Enviando...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Enviar link de recuperacao
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    )}
                  </button>
                </form>

                {/* Link para login */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
                  Lembrou a senha?{' '}
                  <Link to="/login" className="font-semibold login-forgot-link transition-colors">
                    Fazer login
                  </Link>
                </p>
              </>
            ) : (
              <div className="text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold login-title mb-2">Email enviado!</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                  Se o email <span className="font-semibold text-navy-700 dark:text-sky-400">{email}</span> existir em nosso sistema, voce recebera um link para redefinir sua senha.
                </p>

                {/* Info Box */}
                <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 text-left mb-8">
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-sky-700 dark:text-sky-300 mb-1">Verifique sua caixa de entrada</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Se nao encontrar o email, verifique tambem a pasta de spam.
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/login"
                  className="login-submit-btn w-full h-13 text-base font-semibold flex items-center justify-center"
                >
                  Voltar ao login
                </Link>
              </div>
            )}

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
