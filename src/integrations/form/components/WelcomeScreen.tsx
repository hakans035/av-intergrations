'use client';

import { WelcomeScreen as WelcomeScreenType } from '../types';
import {
  HeroSection,
  RedWarningSection,
  SolutionSection,
  FAQSection,
  CTAStepsSection,
} from './welcome-sections';

interface WelcomeScreenProps {
  screen: WelcomeScreenType;
  onStart: () => void;
}

export function WelcomeScreenComponent({ screen, onStart }: WelcomeScreenProps) {
  return (
    <div className="w-full">
      <HeroSection screen={screen} onStart={onStart} />
      <RedWarningSection />
      <SolutionSection />
      <FAQSection />
      <CTAStepsSection onStart={onStart} />
    </div>
  );
}
