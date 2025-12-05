'use client';

import { useEffect } from 'react';
import { Triangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="bg-[#1062eb] text-white min-h-screen flex flex-col antialiased">
      <header className="absolute top-8 left-8 md:top-10 md:left-10 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded flex items-center justify-center shadow-sm">
            <Triangle className="w-5 h-5 text-[#1062eb] fill-current translate-y-[1px]" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col justify-center h-full">
            <span className="text-xs font-semibold tracking-widest leading-none uppercase opacity-90 mb-[2px]">
              Ambition
            </span>
            <span className="text-xs font-semibold tracking-widest leading-none uppercase opacity-90">
              Valley
            </span>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col justify-center items-center w-full px-6 md:px-0">
        <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">!</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Er is iets misgegaan
          </h1>

          <p className="text-lg text-blue-200/80 mb-8">
            Onze excuses voor het ongemak. Probeer het opnieuw of ga terug naar de startpagina.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={reset}
              className="
                flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#1062eb] rounded-lg
                font-semibold
                hover:bg-blue-50 transition-colors duration-200
                shadow-lg shadow-black/10
              "
            >
              <RefreshCw className="w-5 h-5" strokeWidth={2} />
              Probeer opnieuw
            </button>

            <a
              href="/"
              className="
                flex items-center justify-center gap-2 px-6 py-3 border border-white/30 rounded-lg
                font-semibold
                hover:bg-white/10 transition-colors duration-200
              "
            >
              <Home className="w-5 h-5" strokeWidth={2} />
              Naar startpagina
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
