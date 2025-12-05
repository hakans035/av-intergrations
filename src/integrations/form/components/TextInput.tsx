'use client';

import { useRef, useEffect, memo, useId, useState } from 'react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel';
  autoFocus?: boolean;
  required?: boolean;
  error?: string;
  ariaLabel?: string;
}

export const TextInput = memo(function TextInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Typ je antwoord hier...',
  type = 'text',
  autoFocus = true,
  required = false,
  error,
  ariaLabel,
}: TextInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit();
    }
  };

  const autoCompleteValue = type === 'email' ? 'email' : type === 'tel' ? 'tel' : 'off';

  return (
    <div className="w-full animate-fade-in">
      <div className="relative">
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full bg-transparent border-b-2 text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white
            placeholder-blue-200/30 focus:outline-none transition-all duration-300
            pb-4 tracking-tight font-light
            ${error ? 'border-red-400' : isFocused ? 'border-white' : 'border-white/20'}
          `}
          placeholder={placeholder}
          autoComplete={autoCompleteValue}
          aria-required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          aria-label={ariaLabel}
        />
        {/* Animated underline */}
        <div
          className={`
            absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-white via-blue-200 to-white
            transition-all duration-500 ease-out
            ${isFocused || value ? 'w-full opacity-100' : 'w-0 opacity-0'}
          `}
        />
      </div>
      {error && (
        <p id={errorId} className="mt-3 text-red-300 text-sm flex items-center gap-2 animate-fade-in" role="alert">
          <span className="w-1 h-1 rounded-full bg-red-400" />
          {error}
        </p>
      )}
    </div>
  );
});
