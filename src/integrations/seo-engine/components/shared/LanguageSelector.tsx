'use client';

import type { Language } from '../../types';

interface LanguageSelectorProps {
  value: Language;
  onChange: (language: Language) => void;
  disabled?: boolean;
}

export function LanguageSelector({ value, onChange, disabled = false }: LanguageSelectorProps) {
  return (
    <div className="inline-flex rounded-xl bg-white/5 p-1 border border-white/10">
      <button
        type="button"
        onClick={() => onChange('nl')}
        disabled={disabled}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
          value === 'nl'
            ? 'bg-white/20 text-white shadow-sm'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        NL
      </button>
      <button
        type="button"
        onClick={() => onChange('en')}
        disabled={disabled}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
          value === 'en'
            ? 'bg-white/20 text-white shadow-sm'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        EN
      </button>
    </div>
  );
}
