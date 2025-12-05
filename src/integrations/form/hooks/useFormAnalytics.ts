'use client';

import { useEffect, useRef, useCallback } from 'react';
import { FormAnalytics } from '@/components/analytics/GoogleAnalytics';

interface UseFormAnalyticsOptions {
  formId: string;
  totalFields: number;
}

export function useFormAnalytics({ formId, totalFields }: UseFormAnalyticsOptions) {
  const hasStarted = useRef(false);
  const lastFieldIndex = useRef(-1);
  const trackedMilestones = useRef<Set<number>>(new Set());

  // Track form start (only once)
  const trackFormStart = useCallback(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    FormAnalytics.formStart(formId);
  }, [formId]);

  // Track field view
  const trackFieldView = useCallback(
    (fieldRef: string, fieldIndex: number, fieldType: string) => {
      lastFieldIndex.current = fieldIndex;
      FormAnalytics.fieldView(formId, fieldRef, fieldIndex, fieldType);

      // Check for progress milestones
      const progress = Math.round(((fieldIndex + 1) / totalFields) * 100);
      const milestones = [25, 50, 75];

      for (const milestone of milestones) {
        if (progress >= milestone && !trackedMilestones.current.has(milestone)) {
          trackedMilestones.current.add(milestone);
          FormAnalytics.formProgress(formId, progress, `${milestone}%`);
        }
      }
    },
    [formId, totalFields]
  );

  // Track field answer
  const trackFieldAnswer = useCallback(
    (fieldRef: string, fieldIndex: number) => {
      FormAnalytics.fieldAnswer(formId, fieldRef, fieldIndex);
    },
    [formId]
  );

  // Track form completion
  const trackFormComplete = useCallback(
    (qualificationResult: string) => {
      FormAnalytics.formComplete(formId, qualificationResult, totalFields);
    },
    [formId, totalFields]
  );

  // Track form abandonment on page leave
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only track if form was started but not completed
      if (hasStarted.current && lastFieldIndex.current >= 0) {
        const progress = Math.round(((lastFieldIndex.current + 1) / totalFields) * 100);
        if (progress < 100) {
          FormAnalytics.formAbandon(formId, lastFieldIndex.current, progress);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formId, totalFields]);

  return {
    trackFormStart,
    trackFieldView,
    trackFieldAnswer,
    trackFormComplete,
  };
}

export default useFormAnalytics;
