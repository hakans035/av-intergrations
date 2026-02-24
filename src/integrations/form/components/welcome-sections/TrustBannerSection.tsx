'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const logos = [
  { name: 'Belastingdienst', src: '/logos/belastingdienst.svg', width: 64, height: 35, className: 'h-12 sm:h-20 w-auto' },
  { name: 'Knab', src: '/logos/knab.svg', width: 280, height: 91, className: 'h-5 sm:h-9 w-auto' },
  { name: 'Deloitte', src: '/logos/deloitte.svg', width: 182, height: 34, className: 'h-4 sm:h-8 w-auto' },
  { name: 'Rabobank', src: '/logos/rabobank.svg', width: 193, height: 193, className: 'h-14 sm:h-24 w-auto' },
  { name: 'KPMG', src: '/logos/kpmg.svg', width: 1483, height: 591, className: 'h-5 sm:h-9 w-auto' },
];

function LogoSet() {
  return (
    <>
      {logos.map((logo) => (
        <div
          key={logo.name}
          className="shrink-0 flex items-center justify-center opacity-40 hover:opacity-60 transition-opacity duration-300"
        >
          <Image
            src={logo.src}
            alt={logo.name}
            width={logo.width}
            height={logo.height}
            className={`${logo.className} object-contain brightness-0 invert`}
          />
        </div>
      ))}
    </>
  );
}

export function TrustBannerSection() {
  const firstSetRef = useRef<HTMLDivElement>(null);
  const [setWidth, setSetWidth] = useState(0);

  useEffect(() => {
    if (!firstSetRef.current) return;

    const measure = () => {
      setSetWidth(firstSetRef.current?.offsetWidth ?? 0);
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <section className="pt-2 pb-0 sm:py-8 overflow-hidden">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-[10px] sm:text-sm text-white/50 font-medium uppercase tracking-wider mb-4 sm:mb-8 text-center"
      >
        Advies gegeven aan
      </motion.p>

      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-24 bg-gradient-to-r from-[#1062eb] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-10 sm:w-24 bg-gradient-to-l from-[#1062eb] to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex"
          animate={setWidth > 0 ? { x: [0, -setWidth] } : undefined}
          transition={setWidth > 0 ? {
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 30,
              ease: 'linear',
            },
          } : undefined}
        >
          {/* First set — measured */}
          <div ref={firstSetRef} className="flex items-center gap-8 sm:gap-20 shrink-0 pr-8 sm:pr-20">
            <LogoSet />
          </div>
          {/* Second set — fills the gap */}
          <div className="flex items-center gap-8 sm:gap-20 shrink-0 pr-8 sm:pr-20">
            <LogoSet />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
