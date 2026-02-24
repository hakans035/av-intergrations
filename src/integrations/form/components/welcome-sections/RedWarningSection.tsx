'use client';

import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const warnings = [
  {
    icon: AlertTriangle,
    text: 'Je denkt dat je boekhouder jou helpt met belastingbesparing',
  },
  {
    icon: ShieldAlert,
    text: 'Je denkt dat je in jouw situatie geen belasting kan besparen',
  },
  {
    icon: AlertTriangle,
    text: 'Je zakelijke bankrekening is gevuld, maar je geld is niet voor jou aan het werk',
  },
  {
    icon: ShieldAlert,
    text: 'Je bent ondernemer, maar bouwt niks op voor je pensioen',
  },
];

export function RedWarningSection() {
  return (
    <section className="py-20 sm:py-28 bg-red-950/20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-400 mb-10 text-center"
        >
          Stop met deze acties
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {warnings.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="bg-white/10 rounded-2xl p-6 sm:p-8 border border-white/10"
              >
                <Icon className="w-6 h-6 text-red-400 mb-3" />
                <span className="text-sm sm:text-base text-white/90 leading-relaxed">{item.text}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
