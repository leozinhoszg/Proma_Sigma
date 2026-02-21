import { useState, useMemo, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getHomePath } from "../../utils/helpers";
import ThemeToggle from "../ui/ThemeToggle";
import NotificationBell from "../ui/NotificationBell";
import logo from "../../assets/PROMA 6.2.png";

// Ícones SVG para os itens de navegação
const navIcons = {
  dashboard: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  fornecedores: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  contratos: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  relatorio: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  solicitacoes: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  compras: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
  ),
  configuracoes: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

// Itens de navegação com suas permissões necessárias
const allNavItems = [
  { path: "/", label: "Dashboard", permissao: "dashboard" },
  { path: "/fornecedores", label: "Fornecedores", permissao: "fornecedores" },
  { path: "/contratos", label: "Contratos", permissao: "contratos" },
  { path: "/relatorio", label: "Relatório", permissao: "relatorio" },
  { path: "/solicitacoes", label: "Solicitações", permissao: "solicitacoes" },
  { path: "/compras", label: "Compras", permissao: "compras" },
];

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const homePath = useMemo(() => getHomePath(usuario), [usuario]);

  // Filtrar itens de navegação baseado nas permissões do usuário
  const navItems = useMemo(() => {
    const perfil = usuario?.perfil;

    // Se não tem perfil, mostrar apenas dashboard
    if (!perfil) {
      return allNavItems.filter((item) => item.permissao === "dashboard");
    }

    // Se é admin, mostrar tudo
    if (perfil.isAdmin) {
      return allNavItems;
    }

    // Filtrar baseado nas permissões do perfil
    const permissoes = perfil.permissoes || [];
    return allNavItems.filter((item) => permissoes.includes(item.permissao));
  }, [usuario?.perfil]);

  // Verificar se tem acesso às configurações (usuários ou perfis)
  const temAcessoConfiguracoes = useMemo(() => {
    const perfil = usuario?.perfil;
    if (!perfil) return false;
    if (perfil.isAdmin) return true;
    const permissoes = perfil.permissoes || [];
    return permissoes.includes("usuarios") || permissoes.includes("perfis");
  }, [usuario?.perfil]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fechar drawer ao mudar de rota
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Bloquear scroll do body quando drawer estiver aberto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen app-bg flex flex-col">
      {/* Navbar */}
      <nav className="navbar-header sticky top-0 z-50">
        {/* Decorative background (clipped) */}
        <div className="navbar-bg-effects">
          <div className="navbar-orb navbar-orb-1"></div>
          <div className="navbar-orb navbar-orb-2"></div>
          <div className="navbar-orb navbar-orb-3"></div>
          <div className="navbar-grid"></div>
          <div className="navbar-glow"></div>
        </div>

        <div className="relative z-10 px-3 sm:px-4 lg:px-8">
          <div className="relative flex items-center justify-between h-14 lg:h-16">
            {/* Left Side - Hamburger (mobile) / Logo (desktop) */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg navbar-link"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {/* Logo - desktop only (with image) */}
              <Link to={homePath} className="hidden lg:flex items-center gap-3 min-w-0">
                <img src={logo} alt="PROMA" className="h-10 w-auto flex-shrink-0" />
                <span className="navbar-brand font-bold text-xl tracking-wide logo-font whitespace-nowrap">
                  PROMA <span className="navbar-brand-accent">SIGMA</span>
                </span>
              </Link>
            </div>

            {/* Logo text - centered on mobile, hidden on desktop */}
            <Link
              to={homePath}
              className="lg:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <span className="navbar-brand font-bold text-lg tracking-wide logo-font whitespace-nowrap">
                PROMA <span className="navbar-brand-accent">SIGMA</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? "navbar-link-active"
                      : "navbar-link"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Theme Toggle - hidden on mobile, available in drawer */}
              <div className="hidden sm:block">
                <ThemeToggle className="navbar-link" />
              </div>
              <NotificationBell />

              {/* User Menu - desktop only */}
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg navbar-link transition-colors"
                >
                  {usuario?.fotoPerfil ? (
                    <img
                      src={usuario.fotoPerfil}
                      alt="Foto de perfil"
                      className="w-8 h-8 rounded-full object-cover border navbar-avatar-border"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full navbar-avatar flex items-center justify-center">
                      <span className="text-sm font-semibold navbar-brand">
                        {usuario?.usuario?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                  <span className="navbar-brand text-sm font-medium">
                    {usuario?.nome || usuario?.usuario || "Usuário"}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 opacity-70"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-3 w-52 user-dropdown rounded-xl shadow-xl py-2 z-50 animate-fadeIn origin-top-right">
                      <div className="px-4 py-2.5 border-b dropdown-divider">
                        <p className="text-sm font-medium dropdown-text truncate">
                          {usuario?.usuario || "Usuário"}
                        </p>
                        <p className="text-xs dropdown-text-muted truncate">
                          {usuario?.email || "Sem email"}
                        </p>
                      </div>
                      <Link
                        to="/perfil"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full px-4 py-2 text-left text-sm dropdown-item transition-colors flex items-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Meu Perfil
                      </Link>
                      {temAcessoConfiguracoes && (
                        <Link
                          to="/configuracoes"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full px-4 py-2 text-left text-sm dropdown-item transition-colors flex items-center gap-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.11 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Configurações
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm dropdown-item-danger transition-colors flex items-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Sair
                      </button>
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>

        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 top-14 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Drawer - starts below navbar */}
      <aside
        className={`drawer-panel fixed top-14 left-0 bottom-0 w-72 z-40 lg:hidden transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          boxShadow: mobileMenuOpen ? "4px 0 25px rgba(0,0,0,0.15)" : "none",
        }}
      >
        {/* Drawer User Info */}
        <div className="px-5 py-4 border-b drawer-border">
          <div className="flex items-center gap-3">
            {usuario?.fotoPerfil ? (
              <img src={usuario.fotoPerfil} alt="Foto" className="w-10 h-10 rounded-full object-cover border-2 drawer-avatar-border" />
            ) : (
              <div className="w-10 h-10 rounded-full drawer-avatar-bg flex items-center justify-center">
                <span className="text-sm font-bold drawer-avatar-text">
                  {usuario?.usuario?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium drawer-text truncate">
                {usuario?.nome || usuario?.usuario || "Usuário"}
              </p>
              <p className="text-xs drawer-text-muted truncate">
                {usuario?.email || "Sem email"}
              </p>
            </div>
          </div>
        </div>

        {/* Drawer Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="px-3 mb-2 text-[0.65rem] font-semibold uppercase tracking-widest drawer-label">
            Navegação
          </p>
          <div className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? "drawer-link-active"
                    : "drawer-link"
                }`}
              >
                <span className={isActive(item.path) ? "drawer-icon-active" : "drawer-icon"}>
                  {navIcons[item.permissao]}
                </span>
                {item.label}
                {isActive(item.path) && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full drawer-dot" />
                )}
              </Link>
            ))}
          </div>

          {temAcessoConfiguracoes && (
            <>
              <div className="mx-3 my-3 border-t drawer-border-subtle" />
              <p className="px-3 mb-2 text-[0.65rem] font-semibold uppercase tracking-widest drawer-label">
                Sistema
              </p>
              <Link
                to="/configuracoes"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive("/configuracoes")
                    ? "drawer-link-active"
                    : "drawer-link"
                }`}
              >
                <span className={isActive("/configuracoes") ? "drawer-icon-active" : "drawer-icon"}>
                  {navIcons.configuracoes}
                </span>
                Configurações
                {isActive("/configuracoes") && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full drawer-dot" />
                )}
              </Link>
            </>
          )}
        </nav>

        {/* Drawer Footer */}
        <div className="px-3 py-3 border-t drawer-border space-y-0.5">
          {/* Meu Perfil */}
          <Link
            to="/perfil"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive("/perfil")
                ? "drawer-link-active"
                : "drawer-link"
            }`}
          >
            <span className={isActive("/perfil") ? "drawer-icon-active" : "drawer-icon"}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            Meu Perfil
          </Link>

          {/* Theme Toggle */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium drawer-link">
            <span className="drawer-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </span>
            <span className="flex-1">Tema</span>
            <ThemeToggle className="navbar-link" />
          </div>

          <div className="mx-3 my-1 border-t drawer-border-subtle" />

          {/* Sair */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium drawer-danger transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pt-4 pb-4 px-3 sm:pt-6 sm:px-4 lg:pt-8 lg:pb-6 lg:px-6">
        <div className="max-w-7xl mx-auto animate-fadeIn">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-4 text-center text-sm text-base-content/50">
        PROMA SIGMA - {new Date().getFullYear()}
      </footer>
    </div>
  );
}
