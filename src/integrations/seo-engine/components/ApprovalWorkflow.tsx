'use client';

import { useState } from 'react';
import type { ContentDraft, ApprovalGate, ApprovalAction, ApprovalLog } from '../types';
import type { Reviewer, WorkflowState } from '../lib/approval-workflow';
import { StatusBadge, ActionButton } from './shared';

interface ApprovalWorkflowProps {
  draft: ContentDraft;
  workflowState: WorkflowState;
  reviewers: Reviewer[];
  auditLogs: ApprovalLog[];
  currentUser: Reviewer;
  onApprove: (notes?: string) => void;
  onReject: (notes: string) => void;
  onRequestRevision: (notes: string) => void;
  onFlagForLegal?: (notes: string) => void;
}

const gateLabels: Record<ApprovalGate, { title: string; description: string }> = {
  content_editor: {
    title: 'Content Editor',
    description: 'Review van inhoud, stijl en SEO',
  },
  compliance_officer: {
    title: 'Compliance Officer',
    description: 'Controle op regelgeving en claims',
  },
  publishing_manager: {
    title: 'Publishing Manager',
    description: 'Finale goedkeuring voor publicatie',
  },
};

const actionLabels: Record<ApprovalAction, string> = {
  approve: 'Goedgekeurd',
  reject: 'Afgewezen',
  request_revision: 'Revisie gevraagd',
  flag_for_legal: 'Juridisch gemarkeerd',
};

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export function ApprovalWorkflow({
  draft,
  workflowState,
  reviewers: _reviewers,
  auditLogs,
  currentUser,
  onApprove,
  onReject,
  onRequestRevision,
  onFlagForLegal,
}: ApprovalWorkflowProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gates: ApprovalGate[] = ['content_editor', 'compliance_officer', 'publishing_manager'];
  const canReview = workflowState.currentGate === currentUser.role && draft.status === 'pending_review';

  const handleAction = async (action: 'approve' | 'reject' | 'revision' | 'legal') => {
    if (action !== 'approve' && !notes.trim()) {
      return; // Notes required for non-approve actions
    }

    setIsSubmitting(true);
    try {
      switch (action) {
        case 'approve':
          await onApprove(notes || undefined);
          break;
        case 'reject':
          await onReject(notes);
          break;
        case 'revision':
          await onRequestRevision(notes);
          break;
        case 'legal':
          await onFlagForLegal?.(notes);
          break;
      }
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Goedkeuringsproces</h2>
            <p className="text-sm text-white/50 mt-1">
              {workflowState.isEscalated
                ? 'Geëscaleerd - extra review vereist'
                : workflowState.currentGate
                ? `Wacht op ${gateLabels[workflowState.currentGate].title}`
                : 'Workflow niet gestart'}
            </p>
          </div>
          <StatusBadge status={draft.status} size="lg" />
        </div>

        {/* Gate Timeline */}
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />
          <div className="space-y-6">
            {gates.map((gate, index) => {
              const isPassed = workflowState.passedGates.includes(gate);
              const isCurrent = workflowState.currentGate === gate;
              const gateInfo = gateLabels[gate];

              return (
                <div key={gate} className="relative flex items-start gap-4">
                  {/* Dot */}
                  <div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                      isPassed
                        ? 'bg-green-500'
                        : isCurrent
                        ? 'bg-blue-500 ring-4 ring-blue-500/30'
                        : 'bg-white/10'
                    }`}
                  >
                    {isPassed ? (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-xs font-medium text-white">{index + 1}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <h3 className={`font-medium ${isCurrent ? 'text-white' : isPassed ? 'text-green-400' : 'text-white/50'}`}>
                      {gateInfo.title}
                    </h3>
                    <p className="text-sm text-white/40">{gateInfo.description}</p>

                    {/* Show last review for this gate */}
                    {isPassed && (
                      <div className="mt-2 text-xs text-white/50">
                        Goedgekeurd door{' '}
                        {auditLogs.find((l) => l.gate === gate && l.action === 'approve')?.reviewerName || 'Onbekend'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Review Actions */}
      {canReview && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Jouw review</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-white/60 mb-2">
              Opmerkingen {currentUser.role !== 'publishing_manager' && '(verplicht bij afwijzing)'}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Voeg opmerkingen toe..."
              rows={3}
              className="w-full px-4 py-3 text-sm text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <ActionButton
              variant="success"
              onClick={() => handleAction('approve')}
              loading={isSubmitting}
            >
              Goedkeuren
            </ActionButton>

            {currentUser.role === 'content_editor' && (
              <ActionButton
                variant="warning"
                onClick={() => handleAction('revision')}
                loading={isSubmitting}
                disabled={!notes.trim()}
              >
                Revisie aanvragen
              </ActionButton>
            )}

            {currentUser.role === 'compliance_officer' && onFlagForLegal && (
              <ActionButton
                variant="warning"
                onClick={() => handleAction('legal')}
                loading={isSubmitting}
                disabled={!notes.trim()}
              >
                Markeren voor juridisch
              </ActionButton>
            )}

            <ActionButton
              variant="danger"
              onClick={() => handleAction('reject')}
              loading={isSubmitting}
              disabled={!notes.trim()}
            >
              Afwijzen
            </ActionButton>
          </div>

          {workflowState.revisionCount > 0 && (
            <p className="mt-4 text-sm text-yellow-400">
              Let op: Dit is revisie #{workflowState.revisionCount} van max. 3
            </p>
          )}
        </div>
      )}

      {/* Audit Log */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Review geschiedenis</h3>

        {auditLogs.length > 0 ? (
          <div className="space-y-4">
            {auditLogs
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                  <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {log.reviewerName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{log.reviewerName}</span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          log.action === 'approve'
                            ? 'bg-green-500/20 text-green-300'
                            : log.action === 'reject'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}
                      >
                        {actionLabels[log.action]}
                      </span>
                    </div>
                    <p className="text-sm text-white/50">{gateLabels[log.gate].title}</p>
                    {log.notes && <p className="mt-2 text-sm text-white/70">{log.notes}</p>}
                    <p className="mt-1 text-xs text-white/40">{formatDate(log.createdAt)}</p>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-sm text-white/50">Nog geen reviews.</p>
        )}
      </div>
    </div>
  );
}
