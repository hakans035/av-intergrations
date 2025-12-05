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
    className: 'bg-green-100 text-green-800',
  },
  disqualified: {
    label: 'Niet gekwalificeerd',
    className: 'bg-red-100 text-red-800',
  },
  partial: {
    label: 'Gedeeltelijk',
    className: 'bg-yellow-100 text-yellow-800',
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
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Geen inzendingen</h3>
        <p className="mt-1 text-sm text-gray-500">Er zijn nog geen formulierinzendingen.</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bron
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acties</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map((submission) => {
                const qualification = qualificationLabels[submission.qualification_result] || {
                  label: submission.qualification_result,
                  className: 'bg-gray-100 text-gray-800',
                }

                return (
                  <tr
                    key={submission.id}
                    onClick={() => handleRowClick(submission)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-[#307cf1] rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {(submission.name || 'A')[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {submission.name || 'Onbekend'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {submission.email || 'Geen e-mail'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${qualification.className}`}>
                        {qualification.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {submission.utm_source || 'Direct'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatRelativeTime(submission.created_at)}</div>
                      <div className="text-xs text-gray-500">{formatDate(submission.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRowClick(submission)
                        }}
                        className="text-[#307cf1] hover:text-[#2563eb] transition-colors"
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
    className: 'bg-gray-100 text-gray-800',
  }

  const answers = submission.answers as Record<string, unknown>

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-[#307cf1] rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-lg">
                    {(submission.name || 'A')[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {submission.name || 'Onbekend'}
                  </h3>
                  <p className="text-sm text-gray-500">{submission.email || 'Geen e-mail'}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-4 max-h-[60vh] overflow-y-auto">
            {/* Status & Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 uppercase">Status</p>
                <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${qualification.className}`}>
                  {qualification.label}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 uppercase">Telefoon</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {submission.phone || 'Niet ingevuld'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 uppercase">Bron</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {submission.utm_source || 'Direct'}
                  {submission.utm_medium && ` / ${submission.utm_medium}`}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 uppercase">Datum</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {formatDate(submission.created_at)}
                </p>
              </div>
            </div>

            {/* Answers */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Antwoorden</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {Object.entries(answers).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-200 last:border-0 pb-3 last:pb-0">
                    <p className="text-xs text-gray-500 truncate" title={key}>{key}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* UTM Parameters */}
            {(submission.utm_campaign || submission.utm_content || submission.utm_term) && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">UTM Parameters</h4>
                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-3 gap-4">
                  {submission.utm_campaign && (
                    <div>
                      <p className="text-xs text-gray-500">Campaign</p>
                      <p className="text-sm font-medium text-gray-900">{submission.utm_campaign}</p>
                    </div>
                  )}
                  {submission.utm_content && (
                    <div>
                      <p className="text-xs text-gray-500">Content</p>
                      <p className="text-sm font-medium text-gray-900">{submission.utm_content}</p>
                    </div>
                  )}
                  {submission.utm_term && (
                    <div>
                      <p className="text-xs text-gray-500">Term</p>
                      <p className="text-sm font-medium text-gray-900">{submission.utm_term}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sluiten
            </button>
            {submission.email && (
              <a
                href={`mailto:${submission.email}`}
                className="px-4 py-2 text-sm font-medium text-white bg-[#307cf1] rounded-lg hover:bg-[#2563eb] transition-colors"
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
