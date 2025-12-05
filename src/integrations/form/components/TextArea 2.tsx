'use client';

import { useRef, useEffect } from 'react';

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function TextArea({
  value,
  onChange,
  onSubmit,
  placeholder = 'Typ je antwoord hier...',
  autoFocus = true,
}: TextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    <div className="space-y-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full bg-transparent border-b border-blue-300/30 text-2xl md:text-3xl text-white placeholder-blue-200/40 focus:outline-none focus:border-white transition-colors duration-300 pb-3 tracking-tight font-light min-h-[120px] resize-none"
        placeholder={placeholder}
        rows={3}
      />
      <p className="text-sm text-blue-200/60">
        Shift + Enter voor nieuwe regel, Ctrl + Enter om door te gaan
      </p>
    </div>
  );
}
