'use client';

import { ArrowRight, Check, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { WelcomeScreen } from '../../types';
import { TrustBannerSection } from './TrustBannerSection';

interface HeroSectionProps {
  screen: WelcomeScreen;
  onStart: () => void;
}

const checkmarks = [
  'Persoonlijk Traject',
  'Belastingbesparing & Vermogensgroei',
  'Verdien het traject terug',
];

function scrollToNextSection() {
  window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
}

export function HeroSection({ screen, onStart }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen min-h-dvh flex flex-col items-center justify-center text-center px-4 sm:px-6 py-16">
      {/* Main content */}
      <div className="max-w-3xl mx-auto">
        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6 text-white"
        >
          {screen.title}
        </motion.h1>

        {/* Savings highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 w-full flex justify-center px-2"
        >
          <div className="flex flex-col items-center gap-1 sm:gap-2">
            <span className="text-sm sm:text-base text-white/70 font-medium">
              Gemiddelde besparing per deelnemer
            </span>
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-400">
              €3.000 – €15.000 <span className="text-lg sm:text-xl font-medium text-white/60">per jaar</span>
            </span>
          </div>
        </motion.div>

        {/* Checkmarks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-10"
        >
          {checkmarks.map((text) => (
            <div key={text} className="flex items-center gap-2 text-white/80">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-green-400" strokeWidth={3} />
              </div>
              <span className="text-sm font-medium">{text}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        {screen.properties.show_button && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full px-4 sm:px-0 sm:w-auto flex flex-col items-center mb-12"
          >
            <motion.button
              onClick={onStart}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="
                group flex items-center justify-center gap-3 px-6 sm:px-8 py-4
                bg-white text-[#1062eb] rounded-full
                text-base sm:text-lg font-bold
                transition-shadow duration-300
                shadow-xl shadow-black/25
                hover:shadow-2xl
                w-full sm:w-auto
                btn-glow
              "
            >
              {screen.properties.button_text || 'Start'}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
            </motion.button>
            <p className="mt-4 text-sm text-white/40 hidden sm:block text-center">
              of druk <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-xs">Enter</kbd>
            </p>
          </motion.div>
        )}

        {/* Trust banner marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <TrustBannerSection />
        </motion.div>
      </div>

      {/* Scroll button */}
      <motion.button
        onClick={scrollToNextSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer group"
      >
        <span className="text-xs text-white/40 font-medium tracking-wide group-hover:text-white/60 transition-colors">
          Scroll om meer te lezen
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
        </motion.div>
      </motion.button>
    </section>
  );
}
