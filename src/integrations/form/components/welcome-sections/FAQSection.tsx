'use client';

import { motion } from 'framer-motion';
import { Accordion } from '../Accordion';

const faqItems = [
  {
    question: 'Waarom doet mijn boekhouder/accountant dit niet?',
    answer: 'Omdat jouw boekhouder/accountant enkel gericht is op het draaien van productie en grote aantallen cijfers. Wij zijn gericht op jou laten besparen, dat is ons enige doel!',
  },
  {
    question: 'Weinig mensen praten hierover, terwijl ik precies wil weten hoe dit zit.',
    answer: 'Dit wordt niet geleerd op school. Ramin Nourzad (oprichter van Ambition Valley) heeft zelf Fiscaal Recht gestudeerd aan de Universiteit in Tilburg, ook daar werd alleen geleerd hoe het belastingstelsel werkt. Ramin heeft zichzelf aangeleerd om het vóór je te laten werken.',
  },
  {
    question: 'Kan een ZZP\'er altijd minder belasting betalen?',
    answer: 'JA! Tot nu toe hebben wij GEEN ENKELE ZZP\'er gehad die wij niet hebben kunnen helpen. Er zijn meerdere manieren om je belastingdruk effectief te verlagen.',
  },
  {
    question: 'Helpen jullie met de overstap van eenmanszaak naar BV?',
    answer: 'Jazeker. Ramin heeft deze overstap zelf enkele jaren geleden ook al gemaakt, en kan jou precies vertellen waar je rekening mee moet houden. Zo voorkom je dure fouten achteraf, en kan je dit bespaarde geld meteen voor jezelf aan het werk zetten.',
  },
  {
    question: 'Ik denk dat ik nog niet genoeg verdien om dit traject te doen?',
    answer: 'Wij hebben meer dan genoeg klantcases waarbij iemand dacht niet genoeg te verdienen om belasting te kunnen besparen. Het resultaat: juist bij lagere inkomens is er vaak optimalisatie mogelijk, zodat je zelfs extra toeslagen kunt krijgen!',
  },
  {
    question: 'Hoe weet ik of het bij mij past?',
    answer: 'Daar is onze gratis en vrijblijvende 15 minuten intake voor gemaakt. Tijdens deze call laten wij je meteen zien hoeveel jij aan belasting kan besparen.',
  },
];

export function FAQSection() {
  return (
    <section className="py-20 sm:py-28 bg-black/10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-10 text-left"
        >
          Veelgestelde vragen
        </motion.h2>

        <Accordion items={faqItems} />
      </div>
    </section>
  );
}
