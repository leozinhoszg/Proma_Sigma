import { useState, useEffect } from 'react';

export default function SplashScreen({ isLoading }) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Travar/destravar scroll sincronizado com visibilidade
  useEffect(() => {
    if (visible) {
      document.documentElement.classList.add('splash-active');
    } else {
      document.documentElement.classList.remove('splash-active');
    }
  }, [visible]);

  // Tempo minimo de exibicao: 800ms
  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Fade-out quando loading termina E tempo minimo passou
  useEffect(() => {
    if (!isLoading && minTimeElapsed) {
      setFadeOut(true);
      const timer = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, minTimeElapsed]);

  if (!visible) return null;

  return (
    <div className={`splash-screen-react ${fadeOut ? 'splash-fade-out' : ''}`}>
      {/* Background orbs */}
      <div className="splash-orb splash-orb-1"></div>
      <div className="splash-orb splash-orb-2"></div>
      <div className="splash-orb splash-orb-3"></div>

      {/* Background effects */}
      <div className="splash-glow"></div>
      <div className="splash-grid"></div>
      <div className="splash-vignette"></div>
      <div className="splash-streak"></div>

      {/* Content */}
      <div className="splash-content">
        <div className="splash-logo-box">
          <svg viewBox="0 0 652.84 652.69" width="64" height="64" xmlns="http://www.w3.org/2000/svg">
            <path fill="#fff" d="M595.89,0H56.95C25.48,0,0,25.48,0,56.81v539.08c0,31.33,25.48,56.81,56.95,56.81h538.93c31.48,0,56.95-25.48,56.95-56.81V56.81c0-31.33-25.48-56.81-56.95-56.81ZM605.7,459.87l-151.83,151.83h-167.2l232.35-234.84-75.55-75.4-308.05,310.24h-39.68c-26.79,0-48.61-22.25-48.61-49.93v-38.51L358.12,209.66l-75.55-75.55L47.14,371.88v-165.74L213.76,39.53v-.59h343.33c26.94,0,48.61,22.25,48.61,49.93v371Z"/>
          </svg>
        </div>
        <h1 className="splash-title">
          PROMA <span className="splash-accent">SIGMA</span>
        </h1>
        <div className="splash-divider"></div>
        <p className="splash-subtitle">Sistema de Controle de Contratos</p>
      </div>

    </div>
  );
}
