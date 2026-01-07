'use client';

import { ReactNode, useId } from 'react';
import { ArrowRight } from 'lucide-react';

interface FieldWrapperProps {
  questionNumber: number;
  title: string;
  description?: string;
  required?: boolean;
  children: ReactNode;
  fieldRef?: string;
}

export function FieldWrapper({
  questionNumber,
  title,
  description,
  required,
  children,
  fieldRef,
}: FieldWrapperProps) {
  const uniqueId = useId();
  const labelId = `field-label-${fieldRef || uniqueId}`;
  const descriptionId = description ? `field-desc-${fieldRef || uniqueId}` : undefined;

  return (
    <fieldset
      className="flex gap-4 sm:gap-5 md:gap-8 border-0 p-0 m-0"
      aria-labelledby={labelId}
      aria-describedby={descriptionId}
    >
      {/* Step Number & Arrow */}
      <div className="flex items-start gap-1.5 sm:gap-2 pt-1 select-none animate-slide-in-right" aria-hidden="true">
        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl glass text-white/80 font-semibold text-base sm:text-lg">
          {questionNumber}
        </div>
        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/40 mt-2 sm:mt-2.5" strokeWidth={2} />
      </div>

      {/* Question & Input */}
      <div className="flex-1 flex flex-col">
        {/* Label */}
        <legend
          id={labelId}
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight leading-tight animate-fade-in-up"
        >
          <span className="gradient-text">{title}</span>
          {required && (
            <span className="text-red-400 ml-1.5 text-xl" aria-label="verplicht veld">
              *
            </span>
          )}
        </legend>

        {/* Description */}
        {description && (
          <p
            id={descriptionId}
            className="text-base md:text-lg text-blue-100/70 font-light mt-3 mb-2 animate-fade-in animation-delay-100"
          >
            {description}
          </p>
        )}

        {/* Input Field */}
        <div className="mt-6" role="group" aria-labelledby={`field-${title?.replace(/\s+/g, '-')}`}>
          {children}
        </div>
      </div>
    </fieldset>
  );
}
