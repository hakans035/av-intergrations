'use client';

import { Clock, Shield, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { WelcomeScreen as WelcomeScreenType } from '@/lib/types';

interface WelcomeScreenProps {
  screen: WelcomeScreenType;
  onStart: () => void;
}

export function WelcomeScreenComponent({ screen, onStart }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto px-4">
      {/* Badge */}
      <div className="animate-fade-in-up opacity-0 mb-8">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass text-xs sm:text-sm font-medium">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300 flex-shrink-0" />
          <span className="text-white/90"><em>Gemiddelde besparing per deelnemer: €3.000 – €15.000 per jaar</em></span>
        </div>
      </div>

      {/* Main heading */}
      <h1 className="animate-fade-in-up opacity-0 animation-delay-100 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
        <span className="gradient-text">{screen.title}</span>
      </h1>

      {/* Description */}
      {screen.properties.description && (
        <p className="animate-fade-in-up opacity-0 animation-delay-200 text-lg md:text-xl lg:text-2xl text-blue-100/80 font-light mb-10 max-w-2xl leading-relaxed">
          {screen.properties.description}
        </p>
      )}

      {/* Trust indicators */}
      <div className="animate-fade-in-up opacity-0 animation-delay-300 flex flex-wrap justify-center gap-3 md:gap-6 mb-12">
        <div className="flex items-center gap-2.5 glass rounded-full px-4 py-2.5">
          <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center">
            <Clock className="w-4 h-4 text-green-300" strokeWidth={2} />
          </div>
          <span className="text-white/90 text-sm font-medium">2 minuten</span>
        </div>
        <div className="flex items-center gap-2.5 glass rounded-full px-4 py-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-400/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-blue-300" strokeWidth={2} />
          </div>
          <span className="text-white/90 text-sm font-medium">100% gratis</span>
        </div>
        <div className="flex items-center gap-2.5 glass rounded-full px-4 py-2.5">
          <div className="w-8 h-8 rounded-full bg-purple-400/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-purple-300" strokeWidth={2} />
          </div>
          <span className="text-white/90 text-sm font-medium">Direct resultaat</span>
        </div>
      </div>

      {/* CTA Button */}
      {screen.properties.show_button && (
        <div className="animate-fade-in-up opacity-0 animation-delay-400">
          <button
            onClick={onStart}
            className="
              group relative flex items-center gap-3 px-10 py-5
              bg-white text-[#1062eb] rounded-2xl
              text-lg font-bold
              transition-all duration-300 ease-out
              shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)]
              hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.45)]
              hover:-translate-y-1
              active:translate-y-0 active:shadow-lg
              btn-glow
            "
          >
            <span>{screen.properties.button_text || 'Start de check'}</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
          </button>
          <p className="mt-4 text-sm text-blue-200/50 animate-pulse-subtle">
            Druk op <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-xs">Enter ↵</kbd>
          </p>
        </div>
      )}
    </div>
  );
}
