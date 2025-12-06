'use client';

import { Check } from 'lucide-react';
import { FormChoice } from '@/lib/types';

interface CheckboxProps {
  choices: FormChoice[];
  value: string[];
  onChange: (value: string[]) => void;
  onSubmit: () => void;
}

export function Checkbox({ choices, value, onChange, onSubmit }: CheckboxProps) {
  const selectedValues = Array.isArray(value) ? value : [];

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
    <div className="space-y-3">
      {choices.map((choice) => {
        const isSelected = selectedValues.includes(choice.ref);
        return (
          <button
            key={choice.id}
            onClick={() => handleToggle(choice.ref)}
            onKeyDown={(e) => handleKeyDown(e, choice.ref)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left
              transition-all duration-200 group
              ${
                isSelected
                  ? 'border-white bg-white/10 text-white'
                  : 'border-blue-300/30 hover:border-blue-200/50 text-white/90 hover:bg-white/5'
              }
            `}
          >
            {/* Checkbox */}
            <span
              className={`
                w-6 h-6 flex items-center justify-center rounded border-2
                transition-colors duration-200
                ${
                  isSelected
                    ? 'bg-white border-white'
                    : 'border-blue-200/50 group-hover:border-blue-200/70'
                }
              `}
            >
              {isSelected && <Check className="w-4 h-4 text-[#1062eb]" strokeWidth={3} />}
            </span>

            {/* Label */}
            <span className="text-base md:text-lg font-light flex-1">{choice.label}</span>
          </button>
        );
      })}
    </div>
  );
}
