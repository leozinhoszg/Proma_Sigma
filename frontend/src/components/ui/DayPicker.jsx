import { useState, useRef, useEffect } from 'react';

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function DayPicker({ value, onChange, placeholder = 'Selecione o dia' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDaySelect = (day) => {
    onChange(day);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Input que abre o picker */}
      <button
        type="button"
        className="input input-bordered w-full text-left flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-base-content' : 'text-base-content/50'}>
          {value ? `Dia ${value}` : placeholder}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-base-content/50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Dropdown com os dias */}
      {isOpen && (
        <div className="absolute z-50 mt-1 left-0 bg-base-100 border border-base-300 rounded-lg shadow-lg p-2 animate-fadeIn">
          {/* Grid de dias */}
          <div className="grid grid-cols-7 gap-0.5">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                className={`
                  w-7 h-7 rounded text-xs font-medium transition-all
                  ${value === day
                    ? 'bg-primary text-primary-content'
                    : 'hover:bg-base-200 text-base-content'
                  }
                `}
                onClick={() => handleDaySelect(day)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
