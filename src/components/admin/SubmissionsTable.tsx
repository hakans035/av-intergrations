'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { FormSubmission } from '@/lib/supabase/types'
import { ambitionValleyForm } from '@/integrations/form/data/ambition-valley-form'

interface SubmissionsTableProps {
  submissions: FormSubmission[]
  onViewDetails?: (submission: FormSubmission) => void
}

// Build lookup maps from form definition
const fieldRefToTitle = new Map<string, string>()
const choiceRefToLabel = new Map<string, string>()
const fieldOrder = new Map<string, number>()
const fieldRefByType = new Map<string, string>()

ambitionValleyForm.fields.forEach((field, index) => {
  fieldRefToTitle.set(field.ref, field.title)
  fieldOrder.set(field.ref, index)

  // Track field refs by type for easy lookup
  if (field.type === 'email') fieldRefByType.set('email', field.ref)
  if (field.type === 'phone_number') fieldRefByType.set('phone', field.ref)
  if (field.title.toLowerCase().includes('naam')) fieldRefByType.set('name', field.ref)

  if (field.properties.choices) {
    field.properties.choices.forEach((choice) => {
      choiceRefToLabel.set(choice.ref, choice.label)
    })
  }
})

// Helper to extract contact info from answers
function getContactFromAnswers(submission: FormSubmission): { name: string; email: string; phone: string } {
  const answers = submission.answers as Record<string, unknown>

  // Get name - first from submission.name, then from answers
  let name = submission.name || ''
  if (!name) {
    const nameRef = fieldRefByType.get('name')
    if (nameRef && answers[nameRef]) {
      name = String(answers[nameRef])
    }
  }

  // Get email - first from submission.email, then from answers
  let email = submission.email || ''
  if (!email) {
    const emailRef = fieldRefByType.get('email')
    if (emailRef && answers[emailRef]) {
      email = String(answers[emailRef])
    }
  }

  // Get phone - first from submission.phone, then from answers
  let phone = submission.phone || ''
  if (!phone) {
    const phoneRef = fieldRefByType.get('phone')
    if (phoneRef && answers[phoneRef]) {
      phone = String(answers[phoneRef])
    }
  }

  return { name, email, phone }
}

// Helper to sort answers by form field order
function sortAnswersByFieldOrder(answers: Record<string, unknown>): [string, unknown][] {
  return Object.entries(answers).sort(([keyA], [keyB]) => {
    const orderA = fieldOrder.get(keyA) ?? 999
    const orderB = fieldOrder.get(keyB) ?? 999
    return orderA - orderB
  })
}

// Helper to format answer values
function formatAnswerValue(value: unknown): string {
  if (value === null || value === undefined) return '-'
  if (value === 'yes') return 'Ja'
  if (value === 'no') return 'Nee'
  if (value === true) return 'Ja'
  if (value === false) return 'Nee'

  if (typeof value === 'string') {
    // Check if it's a choice ref
    const label = choiceRefToLabel.get(value)
    if (label) return label
    return value
  }

  if (Array.isArray(value)) {
    // Array of choice refs
    return value
      .map((v) => {
        if (typeof v === 'string') {
          const label = choiceRefToLabel.get(v)
          return label || v
        }
        return String(v)
      })
      .join(', ')
  }

  return String(value)
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

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return '-'
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
                const contact = getContactFromAnswers(submission)
                const displayName = contact.name || 'Onbekend'
                const displayEmail = contact.email || 'Geen e-mail'
                const initials = displayName !== 'Onbekend'
                  ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  : 'A'

                return (
                  <tr
                    key={submission.id}
                    onClick={() => handleRowClick(submission)}
                    className="hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-semibold text-sm">
                            {initials}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-white">
                            {displayName}
                          </div>
                          <div className="text-sm text-white/60">
                            {displayEmail}
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const qualification = qualificationLabels[submission.qualification_result] || {
    label: submission.qualification_result,
    className: 'bg-white/10 text-white/70 border border-white/20',
  }

  const answers = submission.answers as Record<string, unknown>
  const contact = getContactFromAnswers(submission)
  const displayName = contact.name || 'Onbekend'
  const displayEmail = contact.email || 'Geen e-mail'
  const displayPhone = contact.phone || 'Niet ingevuld'
  const initials = displayName !== 'Onbekend'
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A'

  if (!mounted) return null

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative glass rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all my-8 max-w-2xl w-full mx-4">
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {initials}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {displayName}
                  </h3>
                  <p className="text-sm text-white/60">{displayEmail}</p>
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
                  {displayPhone}
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
                {sortAnswersByFieldOrder(answers).map(([key, value]) => {
                  const questionTitle = fieldRefToTitle.get(key) || key
                  const formattedValue = formatAnswerValue(value)

                  // Skip empty values
                  if (!formattedValue || formattedValue === '-') return null

                  return (
                    <div key={key} className="border-b border-white/10 last:border-0 pb-3 last:pb-0">
                      <p className="text-xs text-white/40">{questionTitle}</p>
                      <p className="text-sm font-medium text-white mt-0.5">
                        {formattedValue}
                      </p>
                    </div>
                  )
                })}
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
            {displayEmail !== 'Geen e-mail' && (
              <a
                href={`mailto:${displayEmail}`}
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

  return createPortal(modalContent, document.body)
}
