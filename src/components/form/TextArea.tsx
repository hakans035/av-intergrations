'use client';

import { useRef, useEffect, memo, useId, useState } from 'react';

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  required?: boolean;
  error?: string;
  ariaLabel?: string;
}

export const TextArea = memo(function TextArea({
  value,
  onChange,
  onSubmit,
  placeholder = 'Typ je antwoord hier...',
  autoFocus = true,
  required = false,
  error,
  ariaLabel,
}: TextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const errorId = useId();
  const hintId = useId();
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey === false && e.ctrlKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full bg-transparent border-0 text-xl md:text-2xl text-white
            placeholder-white/30 focus:outline-none transition-all duration-300
            pb-3 tracking-tight font-light min-h-[140px] resize-none
          `}
          placeholder={placeholder}
          rows={3}
          aria-required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${hintId}${error ? ` ${errorId}` : ''}`}
          aria-label={ariaLabel}
        />
        {/* Animated underline */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/20 rounded-full overflow-hidden">
          <div
            className={`
              h-full bg-gradient-to-r from-white via-blue-200 to-cyan-200 rounded-full
              transition-all duration-500 ease-out
              ${isFocused || value ? 'w-full' : 'w-0'}
            `}
          />
        </div>
        {/* Error indicator */}
        {error && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-400 rounded-full" />
        )}
      </div>
      <p id={hintId} className="text-sm text-white/40 flex items-center gap-2">
        <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-xs">Shift + Enter</kbd>
        <span>nieuwe regel</span>
        <span className="text-white/20">|</span>
        <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-xs">Ctrl + Enter</kbd>
        <span>door</span>
      </p>
      {error && (
        <p id={errorId} className="text-red-300 text-sm flex items-center gap-2" role="alert">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          {error}
        </p>
      )}
    </div>
  );
});
