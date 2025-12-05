'use client';

import { useEffect, useState, useCallback } from 'react';
import { ExternalLink, CheckCircle2, PartyPopper, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { ThankYouScreen as ThankYouScreenType } from '../types';
import { getSafeRedirectUrl } from '@/lib/security/url-validator';

interface ThankYouScreenProps {
  screen: ThankYouScreenType;
  redirectUrl?: string;
}

const REDIRECT_TIMEOUT_MS = 5000;

export function ThankYouScreenComponent({ screen, redirectUrl }: ThankYouScreenProps) {
  const [redirectState, setRedirectState] = useState<'pending' | 'failed'>('pending');
  const [countdown, setCountdown] = useState(5);

  const safeRedirectUrl = getSafeRedirectUrl(redirectUrl);

  const handleManualRedirect = useCallback(() => {
    window.location.href = safeRedirectUrl;
  }, [safeRedirectUrl]);

  // Handle automatic redirect with timeout
  useEffect(() => {
    if (screen.type !== 'url_redirect' || !redirectUrl) {
      return;
    }

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    // Attempt redirect
    const redirectTimeout = setTimeout(() => {
      try {
        window.location.href = safeRedirectUrl;
      } catch {
        setRedirectState('failed');
      }
    }, 100);

    // Fallback timeout if redirect doesn't complete
    const fallbackTimeout = setTimeout(() => {
      setRedirectState('failed');
    }, REDIRECT_TIMEOUT_MS);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(redirectTimeout);
      clearTimeout(fallbackTimeout);
    };
  }, [screen.type, redirectUrl, safeRedirectUrl]);

  // URL redirect screen
  if (screen.type === 'url_redirect') {
    if (redirectState === 'failed') {
      return (
        <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-4">
          <div className="animate-fade-in-up opacity-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-500/20 flex items-center justify-center mb-6 sm:mb-8">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400" strokeWidth={1.5} />
          </div>
          <h2 className="animate-fade-in-up opacity-0 animation-delay-100 text-xl sm:text-2xl md:text-3xl font-semibold mb-4 gradient-text">
            Doorsturen niet gelukt
          </h2>
          <p className="animate-fade-in-up opacity-0 animation-delay-200 text-base sm:text-lg text-blue-100/70 mb-6 sm:mb-8">
            Klik op de knop om door te gaan naar de volgende stap.
          </p>
          <div className="w-full px-4 sm:px-0 sm:w-auto">
            <button
              onClick={handleManualRedirect}
              className="
                animate-fade-in-up opacity-0 animation-delay-300
                group flex items-center justify-center gap-3 px-6 sm:px-8 py-4 bg-white text-[#1062eb] rounded-2xl
                text-base sm:text-lg font-bold
                transition-all duration-300 ease-out
                shadow-xl shadow-black/25
                hover:shadow-2xl hover:-translate-y-1
                active:translate-y-0 active:scale-[0.98]
                btn-glow
                w-full sm:w-auto
              "
            >
              Ga verder
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-4">
        <div className="animate-fade-in-up opacity-0 relative mb-8">
          <div className="w-20 h-20 rounded-full glass flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-white animate-spin" strokeWidth={1.5} />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-400" strokeWidth={2} />
          </div>
        </div>
        <p className="animate-fade-in-up opacity-0 animation-delay-100 text-xl md:text-2xl text-white mb-3 font-medium">
          Je wordt doorgestuurd...
        </p>
        <p className="animate-fade-in-up opacity-0 animation-delay-200 text-sm text-blue-200/50">
          {countdown > 0 ? (
            <span>Even geduld <span className="font-mono glass px-2 py-1 rounded ml-1">{countdown}s</span></span>
          ) : (
            'Bezig met laden...'
          )}
        </p>
      </div>
    );
  }

  // Regular thank you screen
  const safeButtonUrl = screen.properties.redirect_url
    ? getSafeRedirectUrl(screen.properties.redirect_url)
    : '/';

  // Determine if this is a success screen (qualified) or disqualified
  const isSuccess = !screen.title.toLowerCase().includes('helaas') && !screen.title.toLowerCase().includes('sorry');

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-4">
      {/* Success/Status Icon */}
      <div className="animate-fade-in-up opacity-0 mb-8">
        {isSuccess ? (
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-green-400/30 to-emerald-600/30 flex items-center justify-center animate-float">
              <PartyPopper className="w-10 h-10 sm:w-12 sm:h-12 text-green-400" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-400/30 flex items-center justify-center">
              <span className="text-lg">✨</span>
            </div>
          </div>
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-400/20 to-blue-600/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-300" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Title */}
      <h1 className="animate-fade-in-up opacity-0 animation-delay-100 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6">
        <span className="gradient-text">{screen.title}</span>
      </h1>

      {/* Description */}
      {screen.properties.description && (
        <p className="animate-fade-in-up opacity-0 animation-delay-200 text-base sm:text-lg md:text-xl text-blue-100/70 font-light mb-10 whitespace-pre-line max-w-lg leading-relaxed">
          {screen.properties.description}
        </p>
      )}

      {/* CTA Button */}
      {screen.properties.show_button && screen.properties.button_text && (
        <div className="w-full px-4 sm:px-0 sm:w-auto">
          <a
            href={safeButtonUrl}
            className="
              animate-fade-in-up opacity-0 animation-delay-300
              group flex items-center justify-center gap-3 px-6 sm:px-10 py-4 bg-white text-[#1062eb] rounded-2xl
              text-base sm:text-lg font-bold
              transition-all duration-300 ease-out
              shadow-xl shadow-black/25
              hover:shadow-2xl hover:-translate-y-1
              active:translate-y-0 active:scale-[0.98]
              btn-glow
              w-full sm:w-auto
            "
          >
            {screen.properties.button_text}
            <ExternalLink className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.5} />
          </a>
        </div>
      )}
    </div>
  );
}
