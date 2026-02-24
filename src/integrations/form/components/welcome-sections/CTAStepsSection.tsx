'use client';

import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface CTAStepsSectionProps {
  onStart: () => void;
}

const steps = [
  {
    number: 1,
    heading: 'Vul onze Checklist in',
    description: 'Wij stellen een aantal gerichte vragen over jou en je financiële situatie. Zo weten we meteen hoe we je kunnen helpen.',
  },
  {
    number: 2,
    heading: 'Plan je Gratis Intake',
    description: 'Tijdens deze call van slechts 15 minuten laten we je meteen zien hoeveel belasting jij kunt besparen.',
  },
  {
    number: 3,
    heading: 'Start je Route naar Financiële Vrijheid',
    description: 'Wij nemen je mee in jouw concrete strategie om belasting te besparen en je vermogen te laten groeien.',
  },
];

export function CTAStepsSection({ onStart }: CTAStepsSectionProps) {
  return (
    <section className="bg-black/30">
      {/* CTA */}
      <div className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Start vandaag
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-sm sm:text-base text-white/60 mb-8 max-w-lg mx-auto"
          >
            Vul onze checklist in en ontdek hoeveel belasting jij kunt besparen.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <motion.button
              onClick={onStart}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="
                group inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-4
                bg-white text-[#1062eb] rounded-full
                text-base sm:text-lg font-bold
                transition-shadow duration-300
                shadow-xl shadow-black/25
                hover:shadow-2xl
                btn-glow
              "
            >
              Klik hier om jouw gratis intake te starten
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Steps */}
      <div className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <span className="text-lg font-bold text-white">{step.number}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">{step.heading}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
