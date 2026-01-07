'use client';

import type { ContentStatus } from '../../types';

interface StatusBadgeProps {
  status: ContentStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<ContentStatus, { label: string; className: string }> = {
  draft: {
    label: 'Concept',
    className: 'bg-gray-500/20 text-gray-300 border-gray-400/30',
  },
  pending_review: {
    label: 'In review',
    className: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
  },
  approved: {
    label: 'Goedgekeurd',
    className: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
  },
  published: {
    label: 'Gepubliceerd',
    className: 'bg-green-500/20 text-green-300 border-green-400/30',
  },
  archived: {
    label: 'Gearchiveerd',
    className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${config.className} ${sizeClasses[size]}`}
    >
      {config.label}
    </span>
  );
}
