'use client';

import { useEffect, useCallback, memo } from 'react';
import { Check, ThumbsUp, ThumbsDown } from 'lucide-react';

interface YesNoProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  showKeyHints?: boolean;
}

export const YesNo = memo(function YesNo({ value, onChange, onSubmit, showKeyHints = true }: YesNoProps) {
  const options = [
    { key: 'Y', label: 'Ja', value: 'yes', icon: ThumbsUp, color: 'green' },
    { key: 'N', label: 'Nee', value: 'no', icon: ThumbsDown, color: 'red' },
  ];

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      setTimeout(onSubmit, 150);
    },
    [onChange, onSubmit]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === 'Y' || key === 'J') {
        e.preventDefault();
        handleSelect('yes');
      } else if (key === 'N') {
        e.preventDefault();
        handleSelect('no');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelect]);

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-in" role="radiogroup" aria-label="Ja of Nee">
      {options.map((option, index) => {
        const isSelected = value === option.value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            role="radio"
            aria-checked={isSelected}
            aria-label={`${option.label}${showKeyHints ? `, druk ${option.key}` : ''}`}
            style={{ animationDelay: `${index * 100}ms` }}
            className={`
              flex-1 flex items-center justify-center gap-3 sm:gap-4 px-6 sm:px-8 py-4 sm:py-5 rounded-2xl
              transition-all duration-200 ease-out group
              focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1062eb]
              animate-fade-in-up opacity-0
              active:scale-[0.98]
              ${
                isSelected
                  ? option.color === 'green'
                    ? 'bg-green-500/20 border-2 border-green-400 shadow-lg shadow-green-500/20'
                    : 'bg-red-500/20 border-2 border-red-400 shadow-lg shadow-red-500/20'
                  : 'bg-white/5 border border-white/20 hover:border-white/40 hover:bg-white/10'
              }
            `}
          >
            {/* Icon */}
            <div
              className={`
                w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center
                transition-all duration-200
                ${
                  isSelected
                    ? option.color === 'green'
                      ? 'bg-green-400 text-green-900'
                      : 'bg-red-400 text-red-900'
                    : 'bg-white/10 text-white/60 group-hover:bg-white/20 group-hover:text-white'
                }
              `}
            >
              {isSelected ? (
                <Check className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
              ) : (
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
              )}
            </div>

            <div className="flex flex-col items-start">
              {/* Label */}
              <span className={`text-lg sm:text-xl md:text-2xl transition-colors duration-200 ${isSelected ? 'text-white font-semibold' : 'text-white/90 font-medium'}`}>
                {option.label}
              </span>

              {/* Key hint - hidden on mobile */}
              {showKeyHints && (
                <span className="hidden sm:block text-xs text-white/40 mt-0.5">
                  Druk <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">{option.key}</kbd>
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
});
