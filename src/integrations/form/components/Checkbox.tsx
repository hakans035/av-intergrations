'use client';

import { memo, useId } from 'react';
import { Check, Square, CheckSquare } from 'lucide-react';
import { FormChoice } from '../types';

interface CheckboxProps {
  choices: FormChoice[];
  value: string[];
  onChange: (value: string[]) => void;
  onSubmit: () => void;
}

export const Checkbox = memo(function Checkbox({ choices, value, onChange }: CheckboxProps) {
  const selectedValues = Array.isArray(value) ? value : [];
  const groupId = useId();

  const handleToggle = (choiceRef: string) => {
    const newValues = selectedValues.includes(choiceRef)
      ? selectedValues.filter((v) => v !== choiceRef)
      : [...selectedValues, choiceRef];
    onChange(newValues);
  };

  const handleKeyDown = (e: React.KeyboardEvent, choiceRef: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle(choiceRef);
    }
  };

  return (
    <div className="space-y-3 animate-fade-in" role="group" aria-label="Selecteer opties">
      {choices.map((choice, index) => {
        const isSelected = selectedValues.includes(choice.ref);
        const checkboxId = `${groupId}-checkbox-${index}`;
        return (
          <button
            key={choice.id}
            id={checkboxId}
            onClick={() => handleToggle(choice.ref)}
            onKeyDown={(e) => handleKeyDown(e, choice.ref)}
            role="checkbox"
            aria-checked={isSelected}
            aria-label={choice.label}
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
            {/* Checkbox Icon */}
            <span
              className={`
                w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl
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
                <Square className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
              )}
            </span>

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

      <p className="text-sm text-blue-200/60 pt-3 flex items-center gap-2" aria-live="polite">
        <span className="w-1 h-1 rounded-full bg-blue-300/50" />
        Selecteer meerdere opties
      </p>
    </div>
  );
});
