'use client';

import { ArrowRight, Clock, Check, Euro } from 'lucide-react';
import { WelcomeScreen as WelcomeScreenType } from '../types';

interface WelcomeScreenProps {
  screen: WelcomeScreenType;
  onStart: () => void;
}

export function WelcomeScreenComponent({ screen, onStart }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto px-4 sm:px-6">
      {/* Main heading with gradient */}
      <h1 className="animate-fade-in-up opacity-0 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
        <span className="gradient-text">{screen.title}</span>
      </h1>

      {/* Savings highlight - wow effect */}
      <div className="animate-fade-in-up opacity-0 animation-delay-100 mb-8 w-full flex justify-center px-2">
        <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-green-500/15 border border-green-400/40">
          <Euro className="w-5 h-5 sm:w-6 sm:h-6 text-green-300 flex-shrink-0" />
          <span className="text-sm sm:text-xl font-semibold text-white">
            <em>Gemiddelde besparing per deelnemer: <span className="text-green-300 whitespace-nowrap">€3.000 – €15.000</span> per jaar</em>
          </span>
        </div>
      </div>

      {/* Trust indicators - professional badges */}
      <div className="animate-fade-in-up opacity-0 animation-delay-200 flex flex-wrap justify-center gap-4 sm:gap-6 mb-10">
        <div className="flex items-center gap-2 text-white/80">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <Clock className="w-4 h-4 text-green-400" />
          </div>
          <span className="text-sm font-medium">Slechts 2 minuten</span>
        </div>
        <div className="flex items-center gap-2 text-white/80">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Check className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-sm font-medium">100% gratis</span>
        </div>
      </div>

      {/* CTA Button */}
      {screen.properties.show_button && (
        <div className="animate-fade-in-up opacity-0 animation-delay-300 w-full px-4 sm:px-0 sm:w-auto">
          <button
            onClick={onStart}
            className="
              group flex items-center justify-center gap-3 px-6 sm:px-8 py-4
              bg-white text-[#1062eb] rounded-2xl
              text-base sm:text-lg font-bold
              transition-all duration-300
              shadow-xl shadow-black/25
              hover:shadow-2xl hover:-translate-y-0.5
              active:translate-y-0 active:scale-[0.98]
              w-full sm:w-auto
              btn-glow
            "
          >
            {screen.properties.button_text || 'Start'}
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
          </button>
          <p className="mt-4 text-sm text-white/40 hidden sm:block text-center">
            of druk <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-xs">Enter</kbd>
          </p>
        </div>
      )}
    </div>
  );
}
