'use client';

import { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

interface FieldWrapperProps {
  questionNumber: number;
  title: string;
  description?: string;
  required?: boolean;
  children: ReactNode;
}

export function FieldWrapper({
  questionNumber,
  title,
  description,
  required,
  children,
}: FieldWrapperProps) {
  return (
    <div className="flex gap-4 md:gap-6">
      {/* Step Number & Arrow */}
      <div className="flex items-center gap-2 pt-2 md:pt-3 text-blue-200 select-none">
        <span className="text-lg font-normal">{questionNumber}</span>
        <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
      </div>

      {/* Question & Input */}
      <div className="flex-1 flex flex-col space-y-2">
        {/* Label */}
        <label className="text-2xl md:text-3xl font-medium tracking-tight">
          {title}
          {required && '*'}
        </label>

        {/* Description */}
        {description && (
          <p className="text-lg md:text-xl text-blue-200/80 italic font-light pb-4">
            {description}
          </p>
        )}

        {/* Input Field */}
        <div className="pt-2">{children}</div>
      </div>
    </div>
  );
}
