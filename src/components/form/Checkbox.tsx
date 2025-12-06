'use client';

import { memo, useId } from 'react';
import { Check, Square, CheckSquare } from 'lucide-react';
import { FormChoice } from '@/lib/types';

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
              w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left
              transition-all duration-300 ease-out group
              focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1062eb]
              animate-fade-in-up opacity-0
              ${
                isSelected
                  ? 'bg-white/15 border-2 border-white shadow-lg shadow-white/10 scale-[1.02]'
                  : 'glass border border-white/10 hover:border-white/30 hover:bg-white/10 hover:scale-[1.01]'
              }
            `}
          >
            {/* Checkbox Icon */}
            <span
              className={`
                w-10 h-10 flex items-center justify-center rounded-lg
                transition-all duration-300
                ${
                  isSelected
                    ? 'bg-white text-[#1062eb] shadow-lg'
                    : 'bg-white/10 text-white/70 group-hover:bg-white/20 group-hover:text-white'
                }
              `}
              aria-hidden="true"
            >
              {isSelected ? (
                <Check className="w-5 h-5" strokeWidth={3} />
              ) : (
                <Square className="w-5 h-5" strokeWidth={2} />
              )}
            </span>

            {/* Label */}
            <span className={`text-lg md:text-xl transition-colors duration-300 ${isSelected ? 'text-white font-medium' : 'text-white/90 font-light'}`}>
              {choice.label}
            </span>

            {/* Selection indicator */}
            {isSelected && (
              <span className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
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
