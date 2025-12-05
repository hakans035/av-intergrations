'use client';

import { useEffect, useCallback, memo, useId } from 'react';
import { Check } from 'lucide-react';
import { FormChoice } from '../types';

interface MultipleChoiceProps {
  choices: FormChoice[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  onSubmit: () => void;
  allowMultiple?: boolean;
  showKeyHints?: boolean;
}

export const MultipleChoice = memo(function MultipleChoice({
  choices,
  value,
  onChange,
  onSubmit,
  allowMultiple = false,
  showKeyHints = true,
}: MultipleChoiceProps) {
  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
  const groupId = useId();

  const handleSelect = useCallback(
    (choiceRef: string) => {
      if (allowMultiple) {
        const newValues = selectedValues.includes(choiceRef)
          ? selectedValues.filter((v) => v !== choiceRef)
          : [...selectedValues, choiceRef];
        onChange(newValues);
      } else {
        onChange(choiceRef);
        // Auto-advance on single choice
        setTimeout(onSubmit, 150);
      }
    },
    [allowMultiple, selectedValues, onChange, onSubmit]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if key is A-Z or a-z
      const key = e.key.toUpperCase();
      const index = key.charCodeAt(0) - 65; // A = 0, B = 1, etc.

      if (index >= 0 && index < choices.length && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleSelect(choices[index].ref);
      }

      // Enter to submit (for multiple choice)
      if (e.key === 'Enter' && allowMultiple && selectedValues.length > 0) {
        e.preventDefault();
        onSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [choices, handleSelect, allowMultiple, selectedValues.length, onSubmit]);

  const getKeyLetter = (index: number) => String.fromCharCode(65 + index);

  return (
    <div
      className="space-y-3 animate-fade-in"
      role={allowMultiple ? 'group' : 'radiogroup'}
      aria-label="Kies een optie"
    >
      {choices.map((choice, index) => {
        const isSelected = selectedValues.includes(choice.ref);
        const optionId = `${groupId}-option-${index}`;
        return (
          <button
            key={choice.id}
            id={optionId}
            onClick={() => handleSelect(choice.ref)}
            role={allowMultiple ? 'checkbox' : 'radio'}
            aria-checked={isSelected}
            aria-label={`${choice.label}${showKeyHints ? `, druk ${getKeyLetter(index)}` : ''}`}
            style={{ animationDelay: `${index * 50}ms` }}
            className={`
              w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl text-left
              transition-all duration-200 ease-out group
              focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1062eb]
              animate-fade-in-up opacity-0
              active:scale-[0.98]
              ${
                isSelected
                  ? 'bg-white/20 border-2 border-white shadow-lg shadow-white/10'
                  : 'bg-white/5 border border-white/20 hover:border-white/40 hover:bg-white/10'
              }
            `}
          >
            {/* Key hint */}
            {showKeyHints && (
              <span
                className={`
                  w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-sm font-bold
                  transition-all duration-200
                  ${
                    isSelected
                      ? 'bg-white text-[#1062eb] shadow-lg'
                      : 'bg-white/10 text-white/70 group-hover:bg-white/20 group-hover:text-white'
                  }
                `}
                aria-hidden="true"
              >
                {isSelected ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
                ) : (
                  getKeyLetter(index)
                )}
              </span>
            )}

            {/* Label */}
            <span className={`flex-1 text-base sm:text-lg md:text-xl transition-colors duration-200 ${isSelected ? 'text-white font-medium' : 'text-white/90 font-normal'}`}>
              {choice.label}
            </span>

            {/* Selection indicator */}
            {isSelected && (
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
            )}
          </button>
        );
      })}

      {allowMultiple && (
        <p className="text-sm text-blue-200/60 pt-3 flex items-center gap-2" aria-live="polite">
          <span className="w-1 h-1 rounded-full bg-blue-300/50" />
          Kies meerdere opties, druk <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-xs mx-1">Enter</kbd> om door te gaan
        </p>
      )}
    </div>
  );
});
