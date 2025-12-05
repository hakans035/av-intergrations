'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function GoogleAnalyticsPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }, [pathname, searchParams]);

  return null;
}

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              cookie_flags: 'SameSite=None;Secure'
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <GoogleAnalyticsPageView />
      </Suspense>
    </>
  );
}

// Analytics event tracking functions
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, unknown>
) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', eventName, eventParams);
}

// Pre-defined form events
export const FormAnalytics = {
  formStart: (formId: string) => {
    trackEvent('form_start', {
      form_id: formId,
      form_name: 'Ambition Valley Lead Form',
    });
  },

  fieldView: (formId: string, fieldRef: string, fieldIndex: number, fieldType: string) => {
    trackEvent('field_view', {
      form_id: formId,
      field_ref: fieldRef,
      field_index: fieldIndex,
      field_type: fieldType,
    });
  },

  fieldAnswer: (formId: string, fieldRef: string, fieldIndex: number) => {
    trackEvent('field_answer', {
      form_id: formId,
      field_ref: fieldRef,
      field_index: fieldIndex,
    });
  },

  formProgress: (formId: string, progress: number, milestone: string) => {
    trackEvent('form_progress', {
      form_id: formId,
      progress_percent: progress,
      milestone,
    });
  },

  formComplete: (formId: string, qualificationResult: string, totalFields: number) => {
    trackEvent('form_complete', {
      form_id: formId,
      qualification_result: qualificationResult,
      total_fields: totalFields,
    });
  },

  formAbandon: (formId: string, lastFieldIndex: number, progress: number) => {
    trackEvent('form_abandon', {
      form_id: formId,
      last_field_index: lastFieldIndex,
      progress_percent: progress,
    });
  },
};

export default GoogleAnalytics;
