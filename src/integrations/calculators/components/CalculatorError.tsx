'use client'

import Image from 'next/image'
import Link from 'next/link'

interface CalculatorErrorProps {
  code: string
  message: string
  onRetry?: () => void
}

export function CalculatorError({ code, message, onRetry }: CalculatorErrorProps) {
  return (
    <div className="bg-[#1062eb] text-white min-h-screen flex flex-col antialiased relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-cyan-400/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Logo */}
      <header className="absolute top-4 left-4 sm:top-8 sm:left-8 md:top-10 md:left-10 z-10">
        <Link href="/calculators">
          <Image
            src="/av-logo-white.png"
            alt="Ambition Valley"
            width={160}
            height={40}
            className="h-8 md:h-10 w-auto"
            priority
          />
        </Link>
      </header>

      <main className="flex-grow flex flex-col justify-center items-center w-full px-6 md:px-0 relative z-10">
        <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto animate-fade-in-up">
          {/* Error Icon */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 gradient-text">
            Er ging iets mis
          </h2>

          <p className="text-lg text-white/60 mb-2 font-light">
            {message}
          </p>

          <p className="text-sm text-white/40 mb-8">
            Foutcode: {code}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 border border-white/20 text-white rounded-2xl font-medium text-base hover:bg-white/20 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Opnieuw proberen
              </button>
            )}
            <Link
              href="/calculators"
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-[#1062eb] rounded-2xl font-bold text-base shadow-xl shadow-black/25 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Naar calculators
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
