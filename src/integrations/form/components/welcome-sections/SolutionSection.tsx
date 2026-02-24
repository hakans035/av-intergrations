'use client';

import { motion } from 'framer-motion';

export function SolutionSection() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full mx-auto mb-8" />
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6"
        >
          Jouw Oplossing
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="text-lg sm:text-xl md:text-2xl font-semibold text-white/90 leading-snug mb-6"
        >
          Een persoonlijk, belastingbesparend traject waarin wij je leren hoe je jouw geld voor jezelf aan het werk zet.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-sm sm:text-base text-white/60 leading-relaxed max-w-lg mx-auto"
        >
          Wij willen jou leren kennen. Jouw verhaal en passie. Wij zorgen er vervolgens voor dat we een strategie opstellen die past bij jou als persoon en jouw doelen en wensen.
        </motion.p>
      </div>
    </section>
  );
}
