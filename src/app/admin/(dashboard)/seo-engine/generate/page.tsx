'use client'

import { useState } from 'react'
import Link from 'next/link'

interface GeneratedPost {
  title: string
  slug: string
  body: string
  summary: string
  metaTitle: string
  metaDescription: string
}

export default function GeneratePostPage() {
  const [keyword, setKeyword] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'input' | 'preview' | 'success'>('input')

  const handleGenerate = async () => {
    if (!keyword.trim()) {
      setError('Voer een keyword in')
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
          keyword: keyword.trim(),
          language: 'nl',
          contentType: 'long',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate content')
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
    if (!generatedPost) return

    setIsPublishing(true)
    setError(null)

    try {
      // In production, this would call an API to publish to Webflow
      // For now, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1500))
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
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Nieuwe Post Genereren</h1>
          <p className="mt-1 text-sm text-white/60">
            Voer een keyword in om AI-gegenereerde content te maken
          </p>
        </div>

        {/* Step: Input */}
        {step === 'input' && (
          <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="space-y-6">
              <div>
                <label htmlFor="keyword" className="block text-sm font-medium text-white mb-2">
                  Keyword / Onderwerp
                </label>
                <input
                  type="text"
                  id="keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="bijv. belastingaangifte 2025, hypotheekrenteaftrek, pensioen zzp"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                />
                <p className="mt-2 text-xs text-white/50">
                  Kies een relevant financieel of fiscaal onderwerp voor de Nederlandse markt
                </p>
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
                  disabled={isGenerating || !keyword.trim()}
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
                      Genereren
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
                  setStep('input')
                  setGeneratedPost(null)
                }}
                className="px-6 py-3 text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Opnieuw genereren
              </button>
              <div className="flex gap-4">
                <Link
                  href="/admin/seo-engine"
                  className="px-6 py-3 text-sm font-medium text-white/70 hover:text-white transition-colors"
                >
                  Annuleren
                </Link>
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
                      Opslaan als Draft
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
            <h2 className="text-xl font-semibold text-white mb-2">Post Opgeslagen!</h2>
            <p className="text-white/60 mb-6">
              De post is opgeslagen als draft in Webflow. Je kunt de post nu reviewen en publiceren.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setStep('input')
                  setGeneratedPost(null)
                  setKeyword('')
                }}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium text-white transition-all duration-200"
              >
                Nog een post maken
              </button>
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
