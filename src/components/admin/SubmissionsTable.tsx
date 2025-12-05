'use client'

import { useState } from 'react'
import type { FormSubmission } from '@/lib/supabase/types'

interface SubmissionsTableProps {
  submissions: FormSubmission[]
  onViewDetails?: (submission: FormSubmission) => void
}

const qualificationLabels: Record<string, { label: string; className: string }> = {
  qualified: {
    label: 'Gekwalificeerd',
    className: 'bg-green-500/20 text-green-300 border border-green-400/30',
  },
  disqualified: {
    label: 'Niet gekwalificeerd',
    className: 'bg-red-500/20 text-red-300 border border-red-400/30',
  },
  partial: {
    label: 'Gedeeltelijk',
    className: 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30',
  },
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Zojuist'
  if (diffMins < 60) return `${diffMins} min geleden`
  if (diffHours < 24) return `${diffHours} uur geleden`
  if (diffDays < 7) return `${diffDays} dagen geleden`
  return formatDate(dateString)
}

export function SubmissionsTable({ submissions, onViewDetails }: SubmissionsTableProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null)

  const handleRowClick = (submission: FormSubmission) => {
    setSelectedSubmission(submission)
    onViewDetails?.(submission)
  }

  if (submissions.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="text-white/40 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white">Geen inzendingen</h3>
        <p className="mt-1 text-sm text-white/50">Er zijn nog geen formulierinzendingen.</p>
      </div>
    )
  }

  return (
    <>
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Bron
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Datum
                </th>
                <th scope="col" className="relative px-6 py-4">
                  <span className="sr-only">Acties</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {submissions.map((submission) => {
                const qualification = qualificationLabels[submission.qualification_result] || {
                  label: submission.qualification_result,
                  className: 'bg-white/10 text-white/70 border border-white/20',
                }

                return (
                  <tr
                    key={submission.id}
                    onClick={() => handleRowClick(submission)}
                    className="hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {(submission.name || 'A')[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {submission.name || 'Onbekend'}
                          </div>
                          <div className="text-sm text-white/50">
                            {submission.email || 'Geen e-mail'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${qualification.className}`}>
                        {qualification.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                      {submission.utm_source || 'Direct'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{formatRelativeTime(submission.created_at)}</div>
                      <div className="text-xs text-white/40">{formatDate(submission.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRowClick(submission)
                        }}
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        Bekijken
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSubmission && (
        <SubmissionDetailModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </>
  )
}

interface SubmissionDetailModalProps {
  submission: FormSubmission
  onClose: () => void
}

function SubmissionDetailModal({ submission, onClose }: SubmissionDetailModalProps) {
  const qualification = qualificationLabels[submission.qualification_result] || {
    label: submission.qualification_result,
    className: 'bg-white/10 text-white/70 border border-white/20',
  }

  const answers = submission.answers as Record<string, unknown>

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom glass rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-lg">
                    {(submission.name || 'A')[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {submission.name || 'Onbekend'}
                  </h3>
                  <p className="text-sm text-white/50">{submission.email || 'Geen e-mail'}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/40 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            {/* Status & Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-xs font-medium text-white/50 uppercase">Status</p>
                <span className={`mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${qualification.className}`}>
                  {qualification.label}
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-xs font-medium text-white/50 uppercase">Telefoon</p>
                <p className="mt-1 text-sm font-medium text-white">
                  {submission.phone || 'Niet ingevuld'}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-xs font-medium text-white/50 uppercase">Bron</p>
                <p className="mt-1 text-sm font-medium text-white">
                  {submission.utm_source || 'Direct'}
                  {submission.utm_medium && ` / ${submission.utm_medium}`}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-xs font-medium text-white/50 uppercase">Datum</p>
                <p className="mt-1 text-sm font-medium text-white">
                  {formatDate(submission.created_at)}
                </p>
              </div>
            </div>

            {/* Answers */}
            <div>
              <h4 className="text-sm font-medium text-white mb-3">Antwoorden</h4>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
                {Object.entries(answers).map(([key, value]) => (
                  <div key={key} className="border-b border-white/10 last:border-0 pb-3 last:pb-0">
                    <p className="text-xs text-white/40 truncate" title={key}>{key}</p>
                    <p className="text-sm font-medium text-white mt-0.5">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* UTM Parameters */}
            {(submission.utm_campaign || submission.utm_content || submission.utm_term) && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-white mb-3">UTM Parameters</h4>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 grid grid-cols-3 gap-4">
                  {submission.utm_campaign && (
                    <div>
                      <p className="text-xs text-white/40">Campaign</p>
                      <p className="text-sm font-medium text-white">{submission.utm_campaign}</p>
                    </div>
                  )}
                  {submission.utm_content && (
                    <div>
                      <p className="text-xs text-white/40">Content</p>
                      <p className="text-sm font-medium text-white">{submission.utm_content}</p>
                    </div>
                  )}
                  {submission.utm_term && (
                    <div>
                      <p className="text-xs text-white/40">Term</p>
                      <p className="text-sm font-medium text-white">{submission.utm_term}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-white/70 bg-white/5 border border-white/20 rounded-xl hover:bg-white/10 hover:text-white transition-all"
            >
              Sluiten
            </button>
            {submission.email && (
              <a
                href={`mailto:${submission.email}`}
                className="px-4 py-2.5 text-sm font-medium text-[#1062eb] bg-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                E-mail sturen
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
