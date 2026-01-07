'use client';

import { useMemo } from 'react';
import type { QACheckResult, ComplianceCheckResult, SEOValidationResult } from '../types';
import { ActionButton } from './shared';

interface QAChecklistProps {
  qaResult?: QACheckResult;
  isLoading?: boolean;
  onRerunChecks?: () => void;
}

interface CheckItem {
  id: string;
  category: string;
  name: string;
  passed: boolean;
  isBlocking: boolean;
  message?: string;
  suggestion?: string;
}

export function QAChecklist({
  qaResult,
  isLoading = false,
  onRerunChecks,
}: QAChecklistProps) {
  // Combine all check results into a unified list
  const checkItems = useMemo((): CheckItem[] => {
    const items: CheckItem[] = [];

    if (!qaResult) return items;

    const { checkResults } = qaResult;

    // Language correctness
    items.push({
      id: 'lang-correctness',
      category: 'Kwaliteit',
      name: 'Taalcorrectheid',
      passed: checkResults.languageCorrectness.passed,
      isBlocking: false,
      message: checkResults.languageCorrectness.passed
        ? 'Geen fouten gevonden'
        : `${checkResults.languageCorrectness.errors.length} fouten gevonden`,
      suggestion: checkResults.languageCorrectness.errors[0],
    });

    // Link validation
    items.push({
      id: 'link-validation',
      category: 'Kwaliteit',
      name: 'Link validatie',
      passed: checkResults.linkValidation.passed,
      isBlocking: true,
      message: checkResults.linkValidation.passed
        ? 'Alle links werken'
        : `${checkResults.linkValidation.brokenLinks.length} gebroken links`,
      suggestion: checkResults.linkValidation.brokenLinks[0]
        ? `Fix: ${checkResults.linkValidation.brokenLinks[0]}`
        : undefined,
    });

    // Plagiarism check
    items.push({
      id: 'plagiarism',
      category: 'Kwaliteit',
      name: 'Originaliteit',
      passed: checkResults.plagiarism.passed,
      isBlocking: true,
      message: `${Math.round(100 - checkResults.plagiarism.similarity)}% origineel`,
      suggestion: !checkResults.plagiarism.passed ? 'Herschrijf gedupliceerde content' : undefined,
    });

    // Compliance check
    const compliance = checkResults.compliance;
    items.push({
      id: 'compliance-overall',
      category: 'Compliance',
      name: 'Compliance check',
      passed: compliance.passed,
      isBlocking: true,
      message: compliance.passed
        ? 'Voldoet aan richtlijnen'
        : `${compliance.violations.length} schendingen`,
    });

    // Add individual violations
    compliance.violations.forEach((violation, index) => {
      items.push({
        id: `compliance-violation-${index}`,
        category: 'Compliance',
        name: violation.type,
        passed: false,
        isBlocking: violation.severity === 'error',
        message: violation.message,
        suggestion: violation.suggestion,
      });
    });

    // SEO checks
    const seo = checkResults.seo;
    items.push({
      id: 'seo-overall',
      category: 'SEO',
      name: 'SEO Score',
      passed: seo.score >= 70,
      isBlocking: false,
      message: `Score: ${seo.score}/100`,
    });

    items.push({
      id: 'seo-title',
      category: 'SEO',
      name: 'Title tag',
      passed: seo.details.titleLength.valid,
      isBlocking: false,
      message: `${seo.details.titleLength.value} tekens`,
      suggestion: !seo.details.titleLength.valid
        ? seo.details.titleLength.value < 30
          ? 'Title is te kort'
          : 'Title is te lang'
        : undefined,
    });

    items.push({
      id: 'seo-meta',
      category: 'SEO',
      name: 'Meta description',
      passed: seo.details.descriptionLength.valid,
      isBlocking: false,
      message: `${seo.details.descriptionLength.value} tekens`,
    });

    items.push({
      id: 'seo-headings',
      category: 'SEO',
      name: 'Heading structuur',
      passed: seo.details.headingStructure.valid,
      isBlocking: false,
      message: `H1: ${seo.details.headingStructure.h1Count}, H2: ${seo.details.headingStructure.h2Count}`,
    });

    items.push({
      id: 'seo-keyword',
      category: 'SEO',
      name: 'Keyword aanwezig',
      passed: seo.details.keywordPresence.valid,
      isBlocking: false,
      message: seo.details.keywordPresence.valid ? 'Aanwezig' : 'Ontbreekt',
    });

    items.push({
      id: 'seo-internal-links',
      category: 'SEO',
      name: 'Interne links',
      passed: seo.details.internalLinks.valid,
      isBlocking: false,
      message: `${seo.details.internalLinks.count} links`,
    });

    items.push({
      id: 'seo-images',
      category: 'SEO',
      name: 'Afbeeldingen alt-tekst',
      passed: seo.details.imageAltText.valid,
      isBlocking: false,
      message: seo.details.imageAltText.valid ? 'OK' : 'Ontbreekt',
    });

    return items;
  }, [qaResult]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, CheckItem[]> = {};
    checkItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [checkItems]);

  // Calculate overall readiness
  const overallStats = useMemo(() => {
    const total = checkItems.length;
    const passed = checkItems.filter((i) => i.passed).length;
    const blockers = checkItems.filter((i) => !i.passed && i.isBlocking).length;
    const warnings = checkItems.filter((i) => !i.passed && !i.isBlocking).length;

    return { total, passed, blockers, warnings };
  }, [checkItems]);

  const isReady = qaResult ? qaResult.canPublish : false;

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <svg className="animate-spin h-8 w-8 text-white/60 mx-auto" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="mt-4 text-sm text-white/50">Kwaliteitscontroles uitvoeren...</p>
      </div>
    );
  }

  if (!qaResult || checkItems.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <p className="text-white/50">Geen controles beschikbaar. Voer eerst de checks uit.</p>
        {onRerunChecks && (
          <div className="mt-4">
            <ActionButton onClick={onRerunChecks}>Checks uitvoeren</ActionButton>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className={`glass rounded-2xl p-6 border ${isReady ? 'border-green-500/30' : 'border-red-500/30'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isReady ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}
            >
              {isReady ? (
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${isReady ? 'text-green-400' : 'text-red-400'}`}>
                {isReady ? 'Klaar voor publicatie' : 'Niet klaar voor publicatie'}
              </h2>
              <p className="text-sm text-white/50">
                {overallStats.passed}/{overallStats.total} checks geslaagd
                {overallStats.blockers > 0 && ` • ${overallStats.blockers} blokkerende problemen`}
                {overallStats.warnings > 0 && ` • ${overallStats.warnings} waarschuwingen`}
              </p>
            </div>
          </div>
          {onRerunChecks && (
            <ActionButton variant="secondary" onClick={onRerunChecks}>
              Opnieuw controleren
            </ActionButton>
          )}
        </div>

        {/* Blocking errors */}
        {qaResult.blockingErrors.length > 0 && (
          <div className="mt-4 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
            <h4 className="text-sm font-medium text-red-400 mb-2">Blokkerende fouten:</h4>
            <ul className="space-y-1">
              {qaResult.blockingErrors.map((error, index) => (
                <li key={index} className="text-sm text-white/70">• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Check Groups */}
      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category} className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{category}</h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-4 p-4 rounded-xl ${
                  item.passed
                    ? 'bg-green-500/10'
                    : item.isBlocking
                    ? 'bg-red-500/10'
                    : 'bg-yellow-500/10'
                }`}
              >
                {/* Status Icon */}
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    item.passed
                      ? 'bg-green-500/30'
                      : item.isBlocking
                      ? 'bg-red-500/30'
                      : 'bg-yellow-500/30'
                  }`}
                >
                  {item.passed ? (
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className={`w-4 h-4 ${item.isBlocking ? 'text-red-400' : 'text-yellow-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                    </svg>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{item.name}</span>
                    {item.isBlocking && !item.passed && (
                      <span className="px-1.5 py-0.5 text-xs bg-red-500/20 text-red-300 rounded">
                        Blokkerend
                      </span>
                    )}
                  </div>
                  {item.message && (
                    <p className="text-sm text-white/60 mt-0.5">{item.message}</p>
                  )}
                  {item.suggestion && (
                    <p className="text-sm text-blue-300 mt-1">
                      <span className="text-white/40">Suggestie:</span> {item.suggestion}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
