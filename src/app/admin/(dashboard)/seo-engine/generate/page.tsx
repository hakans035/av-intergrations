'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface KeywordQueueItem {
  id: string
  keyword: string
  language: string
  priority: number
  status: string
  scheduled_date: string | null
  metadata: {
    category?: string
    trending_score?: number
    suggested_angle?: string
  }
}

interface GeneratedPost {
  title: string
  slug: string
  body: string
  summary: string
  metaTitle: string
  metaDescription: string
}

export default function GeneratePostPage() {
  const [keywords, setKeywords] = useState<KeywordQueueItem[]>([])
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordQueueItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'select' | 'preview' | 'success'>('select')
  const [publishedItemId, setPublishedItemId] = useState<string | null>(null)

  // Fetch pending keywords from queue
  useEffect(() => {
    async function fetchKeywords() {
      try {
        const response = await fetch('/api/seo-engine/keywords/queue?status=pending', {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin'}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setKeywords(data.data?.keywords || [])
        }
      } catch (err) {
        console.error('Failed to fetch keywords:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchKeywords()
  }, [])

  const handleGenerate = async () => {
    if (!selectedKeyword) {
      setError('Selecteer een keyword')
      return
    }

    setError(null)
    setIsGenerating(true)

    try {
      const response = await fetch('/api/seo-engine/content/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin'}`,
        },
        body: JSON.stringify({
          keyword: selectedKeyword.keyword,
          keywordId: selectedKeyword.id,
          language: selectedKeyword.language || 'nl',
          contentType: 'long',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate content')
      }

      const data = await response.json()
      setGeneratedPost(data.data)
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePublishToDraft = async () => {
    if (!generatedPost || !selectedKeyword) return

    setIsPublishing(true)
    setError(null)

    try {
      // Call the cron generate endpoint to publish to Webflow
      const response = await fetch('/api/seo-engine/cron/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin'}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Publiceren mislukt')
      }

      const data = await response.json()
      setPublishedItemId(data.itemId)
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publiceren mislukt')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/admin/seo-engine"
          className="inline-flex items-center text-sm text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Terug naar overzicht
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Blog Genereren</h1>
        <p className="mt-1 text-sm text-white/60">
          Selecteer een keyword uit de queue om een blog te genereren
        </p>
      </div>

      {/* Step: Select Keyword */}
      {step === 'select' && (
        <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Selecteer een keyword uit de queue
              </label>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="w-6 h-6 animate-spin text-white/50" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : keywords.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/50 mb-4">Geen keywords in queue</p>
                  <Link
                    href="/admin/seo-engine/queue"
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    Ga naar Queue om keywords te ontdekken
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {keywords.map((kw) => (
                    <button
                      key={kw.id}
                      onClick={() => setSelectedKeyword(kw)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        selectedKeyword?.id === kw.id
                          ? 'bg-white/20 border-white/40'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-white">{kw.keyword}</div>
                          {kw.metadata?.suggested_angle && (
                            <div className="text-xs text-white/50 mt-1">
                              {kw.metadata.suggested_angle}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {kw.metadata?.category && (
                            <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-white/60 capitalize">
                              {kw.metadata.category}
                            </span>
                          )}
                          {kw.metadata?.trending_score && (
                            <span className="text-xs px-2 py-1 bg-green-500/20 rounded-full text-green-300">
                              Score: {kw.metadata.trending_score}/10
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Link
                href="/admin/seo-engine"
                className="px-6 py-3 text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Annuleren
              </Link>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !selectedKeyword}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed rounded-xl text-sm font-medium text-white transition-all duration-200 flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Content genereren...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Genereer Blog
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step: Preview */}
      {step === 'preview' && generatedPost && (
        <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {/* Selected Keyword Info */}
          <div className="glass rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-white/50">Keyword:</span>
              <span className="ml-2 text-white font-medium">{selectedKeyword?.keyword}</span>
            </div>
          </div>

          {/* Meta Info */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Meta Informatie</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/50 mb-1">Titel</label>
                <div className="text-white">{generatedPost.title}</div>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Slug</label>
                <div className="text-white/70">/{generatedPost.slug}</div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-white/50 mb-1">Summary (max 140 tekens)</label>
                <div className="text-white/70">{generatedPost.summary}</div>
                <div className="text-xs text-white/40 mt-1">{generatedPost.summary.length} tekens</div>
              </div>
            </div>
          </div>

          {/* Content Preview */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Content Preview</h2>
            <div
              className="prose prose-invert prose-sm max-w-none bg-white/5 rounded-xl p-6 max-h-96 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: generatedPost.body }}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                setStep('select')
                setGeneratedPost(null)
              }}
              className="px-6 py-3 text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Terug naar selectie
            </button>
            <div className="flex gap-4">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-6 py-3 text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Opnieuw genereren
              </button>
              <button
                onClick={handlePublishToDraft}
                disabled={isPublishing}
                className="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 disabled:bg-green-500/10 disabled:cursor-not-allowed rounded-xl text-sm font-medium text-green-300 transition-all duration-200 flex items-center gap-2"
              >
                {isPublishing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Opslaan...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Opslaan als Draft in Webflow
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step: Success */}
      {step === 'success' && (
        <div className="glass rounded-2xl p-8 text-center animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Blog Opgeslagen!</h2>
          <p className="text-white/60 mb-6">
            De blog is opgeslagen als draft in Webflow. Je kunt de post nu reviewen en publiceren.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setStep('select')
                setGeneratedPost(null)
                setSelectedKeyword(null)
              }}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium text-white transition-all duration-200"
            >
              Nog een blog maken
            </button>
            {publishedItemId && (
              <Link
                href={`/admin/seo-engine/${publishedItemId}`}
                className="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 rounded-xl text-sm font-medium text-green-300 transition-all duration-200"
              >
                Bekijk in Webflow
              </Link>
            )}
            <Link
              href="/admin/seo-engine"
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium text-white transition-all duration-200"
            >
              Terug naar overzicht
            </Link>
          </div>
        </div>
      )}
    </main>
  )
}
