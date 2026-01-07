'use client';

import type { ApprovalGate } from '../../types';
import type { Reviewer } from '../../lib/approval-workflow';

interface ReviewerSelectProps {
  gate: ApprovalGate;
  reviewers: Reviewer[];
  value: string | null;
  onChange: (reviewerId: string) => void;
  disabled?: boolean;
}

const gateLabels: Record<ApprovalGate, string> = {
  content_editor: 'Content Editor',
  compliance_officer: 'Compliance Officer',
  publishing_manager: 'Publishing Manager',
};

export function ReviewerSelect({
  gate,
  reviewers,
  value,
  onChange,
  disabled = false,
}: ReviewerSelectProps) {
  const filteredReviewers = reviewers.filter((r) => r.role === gate);

  return (
    <div>
      <label className="block text-sm font-medium text-white/60 mb-2">
        {gateLabels[gate]}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || filteredReviewers.length === 0}
        className={`
          w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10
          text-white text-sm appearance-none
          focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/10'}
        `}
      >
        <option value="" className="bg-gray-900">
          Selecteer reviewer...
        </option>
        {filteredReviewers.map((reviewer) => (
          <option key={reviewer.id} value={reviewer.id} className="bg-gray-900">
            {reviewer.name}
          </option>
        ))}
      </select>
    </div>
  );
}
