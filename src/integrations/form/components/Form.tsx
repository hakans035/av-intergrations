'use client';

import { useState, useCallback, useEffect } from 'react';
import { ArrowUp, ArrowDown, Check, Clock, Users, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { FormDefinition, FormAnswers, FormField } from '../types';
import { getNextFieldIndex, interpolateTemplate } from '../lib/form-logic';
import { FieldWrapper } from './FieldWrapper';
import { TextInput } from './TextInput';
import { TextArea } from './TextArea';
import { MultipleChoice } from './MultipleChoice';
import { YesNo } from './YesNo';
import { Checkbox } from './Checkbox';
import { WelcomeScreenComponent } from './WelcomeScreen';
import { ThankYouScreenComponent } from './ThankYouScreen';

interface FormProps {
  form: FormDefinition;
  onSubmit?: (answers: FormAnswers) => void;
}

type FormState = 'welcome' | 'questions' | 'thankyou';

// Progress motivation messages
const getProgressMessage = (progress: number): { message: string; emoji: string } | null => {
  if (progress >= 25 && progress < 30) return { message: 'Goed bezig! Je bent al een kwart onderweg.', emoji: '🎯' };
  if (progress >= 50 && progress < 55) return { message: 'Halverwege! Nog even en je ontvangt je persoonlijke advies.', emoji: '🚀' };
  if (progress >= 75 && progress < 80) return { message: 'Bijna klaar! Nog een paar vragen.', emoji: '⭐' };
  if (progress >= 90 && progress < 95) return { message: 'Laatste vragen! Je advies wordt voorbereid...', emoji: '🎉' };
  return null;
};

export function Form({ form, onSubmit }: FormProps) {
  const [state, setState] = useState<FormState>('welcome');
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [thankyouScreenIndex, setThankyouScreenIndex] = useState(0);
  const [visitedFields, setVisitedFields] = useState<number[]>([]);
  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationMessage, setMotivationMessage] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentField = form.fields[currentFieldIndex];
  const hasWelcomeScreen = form.welcome_screens.length > 0;

  // Start at questions if no welcome screen
  useEffect(() => {
    if (!hasWelcomeScreen) {
      setState('questions');
    }
  }, [hasWelcomeScreen]);

  const handleStart = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setState('questions');
      setVisitedFields([0]);
      setIsTransitioning(false);
    }, 300);
  };

  const updateAnswer = useCallback((fieldRef: string, value: string | string[] | boolean) => {
    setAnswers((prev) => ({ ...prev, [fieldRef]: value }));
  }, []);

  const calculateProgress = useCallback(() => {
    if (state === 'welcome') return 0;
    if (state === 'thankyou') return 100;
    return Math.round(((currentFieldIndex + 1) / form.fields.length) * 100);
  }, [state, currentFieldIndex, form.fields.length]);

  // Check for motivation messages on progress change
  useEffect(() => {
    const progress = calculateProgress();
    const progressMessage = getProgressMessage(progress);
    if (progressMessage && state === 'questions') {
      setMotivationMessage(`${progressMessage.emoji} ${progressMessage.message}`);
      setShowMotivation(true);
      const timer = setTimeout(() => setShowMotivation(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentFieldIndex, calculateProgress, state]);

  const goToNext = useCallback(() => {
    if (!currentField) return;

    // Use functional update to get the latest answers state
    setAnswers((currentAnswers) => {
      const answer = currentAnswers[currentField.ref];

      // Validate required fields
      if (currentField.validations.required) {
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          return currentAnswers; // Don't proceed, return unchanged
        }
      }

      setIsTransitioning(true);

      setTimeout(() => {
        const next = getNextFieldIndex(currentField.ref, currentAnswers, form);

        if (next?.type === 'thankyou') {
          setThankyouScreenIndex(next.index);
          setState('thankyou');
          onSubmit?.(currentAnswers);
        } else if (next?.type === 'field') {
          setCurrentFieldIndex(next.index);
          setVisitedFields((prev) => [...prev, next.index]);
        }
        setIsTransitioning(false);
      }, 200);

      return currentAnswers; // Return unchanged (we're just reading)
    });
  }, [currentField, form, onSubmit]);

  const goToPrevious = useCallback(() => {
    if (visitedFields.length > 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        const newVisited = visitedFields.slice(0, -1);
        setVisitedFields(newVisited);
        setCurrentFieldIndex(newVisited[newVisited.length - 1]);
        setIsTransitioning(false);
      }, 200);
    } else if (hasWelcomeScreen) {
      setIsTransitioning(true);
      setTimeout(() => {
        setState('welcome');
        setIsTransitioning(false);
      }, 200);
    }
  }, [visitedFields, hasWelcomeScreen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && state === 'questions') {
        // Enter is handled by individual components
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state]);

  const renderField = (field: FormField) => {
    const value = answers[field.ref] || '';

    switch (field.type) {
      case 'short_text':
        return (
          <TextInput
            value={value as string}
            onChange={(v) => updateAnswer(field.ref, v)}
            onSubmit={goToNext}
            placeholder="Typ je antwoord hier..."
          />
        );

      case 'email':
        return (
          <TextInput
            value={value as string}
            onChange={(v) => updateAnswer(field.ref, v)}
            onSubmit={goToNext}
            type="email"
            placeholder="naam@voorbeeld.nl"
          />
        );

      case 'phone_number':
        return (
          <TextInput
            value={value as string}
            onChange={(v) => updateAnswer(field.ref, v)}
            onSubmit={goToNext}
            type="tel"
            placeholder="+31 6 12345678"
          />
        );

      case 'long_text':
        return (
          <TextArea
            value={value as string}
            onChange={(v) => updateAnswer(field.ref, v)}
            onSubmit={goToNext}
            placeholder="Typ je antwoord hier..."
          />
        );

      case 'multiple_choice':
        return (
          <MultipleChoice
            choices={field.properties.choices || []}
            value={value as string | string[]}
            onChange={(v) => updateAnswer(field.ref, v)}
            onSubmit={goToNext}
            allowMultiple={field.properties.allow_multiple_selection}
            showKeyHints={form.settings.show_key_hint_on_choices}
          />
        );

      case 'yes_no':
        return (
          <YesNo
            value={value as string}
            onChange={(v) => updateAnswer(field.ref, v)}
            onSubmit={goToNext}
            showKeyHints={form.settings.show_key_hint_on_choices}
          />
        );

      case 'checkbox':
        return (
          <Checkbox
            choices={field.properties.choices || []}
            value={(value as string[]) || []}
            onChange={(v) => updateAnswer(field.ref, v)}
            onSubmit={goToNext}
          />
        );

      default:
        return (
          <TextInput
            value={value as string}
            onChange={(v) => updateAnswer(field.ref, v)}
            onSubmit={goToNext}
          />
        );
    }
  };

  // Get the redirect URL with interpolated values (URL-encoded for safety)
  const getRedirectUrl = () => {
    const screen = form.thankyou_screens[thankyouScreenIndex];
    if (screen?.properties.redirect_url) {
      return interpolateTemplate(screen.properties.redirect_url, answers, form.fields, true);
    }
    return undefined;
  };

  const progress = calculateProgress();

  return (
    <div className="bg-[#1062eb] text-white min-h-screen min-h-dvh flex flex-col antialiased relative overflow-hidden">
      {/* Background Effects - hidden on mobile for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="hidden md:block absolute -top-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float" />
        <div className="hidden md:block absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float animation-delay-200" />
        <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-3xl" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>
      {/* Logo Section */}
      <header className="absolute top-4 left-4 sm:top-8 sm:left-8 md:top-10 md:left-10 z-10">
        <Image
          src="/av-logo-white.png"
          alt="Ambition Valley"
          width={160}
          height={40}
          className="h-8 md:h-10 w-auto"
          priority
        />
      </header>

      {/* Social Proof Badge - on welcome screen */}
      {state === 'welcome' && (
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8 md:top-10 md:right-10 z-10">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-300" strokeWidth={2} />
            <span className="text-xs sm:text-sm text-white/90">728+ checks</span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {form.settings.show_progress_bar && state === 'questions' && (
        <div className="fixed top-0 left-0 right-0 h-1.5 bg-white/10 z-20 backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-white via-blue-200 to-cyan-200 transition-all duration-500 ease-out shadow-lg shadow-white/20"
            style={{ width: `${progress}%` }}
          />
          {/* Progress glow effect */}
          <div
            className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white/50 to-transparent blur-sm transition-all duration-500 ease-out"
            style={{ left: `calc(${progress}% - 16px)` }}
          />
        </div>
      )}

      {/* Motivation Toast */}
      <div
        className={`
          fixed top-16 left-1/2 -translate-x-1/2 z-30
          glass rounded-2xl px-6 py-3 shadow-xl shadow-black/10
          transition-all duration-500 ease-out
          ${showMotivation ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
        `}
      >
        <p className="text-sm font-medium text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" strokeWidth={2.5} />
          {motivationMessage}
        </p>
      </div>

      {/* Main Content */}
      <main className="flex-grow flex flex-col justify-center items-center w-full px-4 sm:px-6 md:px-0">
        <div
          className={`
            w-full max-w-2xl transform -translate-y-10
            transition-all duration-300 ease-out
            ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
          `}
        >
          {state === 'welcome' && form.welcome_screens[0] && (
            <WelcomeScreenComponent
              screen={form.welcome_screens[0]}
              onStart={handleStart}
            />
          )}

          {state === 'questions' && currentField && (
            <FieldWrapper
              questionNumber={currentFieldIndex + 1}
              title={currentField.title}
              required={currentField.validations.required}
            >
              {renderField(currentField)}
            </FieldWrapper>
          )}

          {state === 'thankyou' && form.thankyou_screens[thankyouScreenIndex] && (
            <ThankYouScreenComponent
              screen={form.thankyou_screens[thankyouScreenIndex]}
              redirectUrl={getRedirectUrl()}
            />
          )}
        </div>
      </main>

      {/* Navigation Footer */}
      {state === 'questions' && (
        <footer className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 bg-gradient-to-t from-[#1062eb] via-[#1062eb]/95 to-transparent pb-safe">
          <div className="max-w-2xl mx-auto">
            <div className="glass rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 shadow-xl shadow-black/10">
              {/* OK Button */}
              <button
                onClick={goToNext}
                className="
                  flex items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-white text-[#1062eb] rounded-xl
                  font-bold text-sm
                  hover:bg-blue-50 transition-all duration-300
                  shadow-lg shadow-black/10
                  hover:shadow-xl hover:-translate-y-0.5
                  btn-glow
                  flex-1 sm:flex-none
                "
              >
                OK
                <Check className="w-4 h-4" strokeWidth={3} />
              </button>

              {/* Navigation Arrows */}
              <div className="flex items-center gap-1 glass rounded-xl p-1">
                <button
                  onClick={goToPrevious}
                  disabled={visitedFields.length <= 1 && !hasWelcomeScreen}
                  className="
                    p-2.5 sm:p-3 rounded-lg hover:bg-white/10 transition-all duration-200
                    disabled:opacity-30 disabled:cursor-not-allowed
                  "
                  aria-label="Vorige vraag"
                >
                  <ArrowUp className="w-5 h-5" strokeWidth={2} />
                </button>
                <button
                  onClick={goToNext}
                  className="p-2.5 sm:p-3 rounded-lg hover:bg-white/10 transition-all duration-200"
                  aria-label="Volgende vraag"
                >
                  <ArrowDown className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Keyboard hint - hidden on mobile */}
            <div className="mt-2 text-center hidden sm:block">
              <span className="text-xs text-white/40">
                Druk op <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-xs mx-1">Enter ↵</kbd> om door te gaan
              </span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
