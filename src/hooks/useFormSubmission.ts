'use client';

import { useState, useCallback, useEffect } from 'react';
import { FormAnswers } from '@/integrations/form/types';
import { setClientCsrfToken, getCsrfHeaders } from '@/lib/security/csrf';

interface SubmissionResult {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    qualificationResult: string;
  };
  errors?: Array<{ field: string; message: string }>;
}

interface UseFormSubmissionOptions {
  formId: string;
  onSuccess?: (result: SubmissionResult) => void;
  onError?: (error: Error) => void;
}

interface UTMParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}

/**
 * Generate a unique session ID for tracking
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Extract UTM parameters from URL
 */
function getUTMParams(): UTMParams {
  if (typeof window === 'undefined') {
    return {};
  }

  const params = new URLSearchParams(window.location.search);

  return {
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
    utmContent: params.get('utm_content') || undefined,
    utmTerm: params.get('utm_term') || undefined,
  };
}

export function useFormSubmission({ formId, onSuccess, onError }: UseFormSubmissionOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => generateSessionId());
  const [utmParams] = useState<UTMParams>(() => getUTMParams());

  // Initialize CSRF token on mount
  useEffect(() => {
    setClientCsrfToken();
  }, []);

  const submitForm = useCallback(
    async (answers: FormAnswers): Promise<SubmissionResult> => {
      setIsSubmitting(true);
      setError(null);

      try {
        const response = await fetch('/api/submissions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getCsrfHeaders(),
          },
          body: JSON.stringify({
            formId,
            answers,
            sessionId,
            ...utmParams,
          }),
        });

        const result: SubmissionResult = await response.json();

        if (!response.ok) {
          const errorMessage = result.message || 'Er is een fout opgetreden';
          setError(errorMessage);
          onError?.(new Error(errorMessage));
          return result;
        }

        onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Netwerk fout';
        setError(errorMessage);
        onError?.(new Error(errorMessage));
        return {
          success: false,
          message: errorMessage,
        };
      } finally {
        setIsSubmitting(false);
      }
    },
    [formId, sessionId, utmParams, onSuccess, onError]
  );

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    submitForm,
    isSubmitting,
    error,
    resetError,
    sessionId,
    utmParams,
  };
}

export default useFormSubmission;
