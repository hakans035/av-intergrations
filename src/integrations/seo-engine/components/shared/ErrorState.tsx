'use client';

import { ActionButton } from './ActionButton';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = 'Er ging iets mis',
  message,
  onRetry,
  retryLabel = 'Opnieuw proberen',
}: ErrorStateProps) {
  return (
    <div className="glass rounded-2xl p-12 text-center">
      <div className="text-red-400 mb-4">
        <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-white">{title}</h3>
      <p className="mt-2 text-sm text-white/50">{message}</p>
      {onRetry && (
        <div className="mt-6">
          <ActionButton variant="secondary" onClick={onRetry}>
            {retryLabel}
          </ActionButton>
        </div>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="glass rounded-2xl p-12 text-center">
      <div className="text-white/40 mb-4">
        <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-white">{title}</h3>
      <p className="mt-1 text-sm text-white/50">{message}</p>
      {action && (
        <div className="mt-6">
          <ActionButton onClick={action.onClick}>{action.label}</ActionButton>
        </div>
      )}
    </div>
  );
}
