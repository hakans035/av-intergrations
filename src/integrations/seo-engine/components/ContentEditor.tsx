'use client';

import { useState, useMemo } from 'react';
import type { ContentDraft } from '../types';
import { StatusBadge, ActionButton, LanguageSelector } from './shared';

interface ContentEditorProps {
  draft: ContentDraft;
  isEditing?: boolean;
  onSave?: (draft: ContentDraft) => void;
  onSubmitForReview?: (draft: ContentDraft) => void;
  onChange?: (field: keyof ContentDraft, value: string) => void;
}

interface HeadingInfo {
  level: number;
  text: string;
  position: number;
}

export function ContentEditor({
  draft,
  isEditing = false,
  onSave,
  onSubmitForReview,
  onChange,
}: ContentEditorProps) {
  const [editMode, setEditMode] = useState(isEditing);
  const [localDraft, setLocalDraft] = useState(draft);

  // Extract headings from content
  const headings = useMemo((): HeadingInfo[] => {
    const regex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
    const matches: HeadingInfo[] = [];
    let match;
    let position = 0;

    while ((match = regex.exec(localDraft.body)) !== null) {
      matches.push({
        level: parseInt(match[1]),
        text: match[2].replace(/<[^>]*>/g, ''),
        position: position++,
      });
    }

    return matches;
  }, [localDraft.body]);

  // Calculate word count
  const wordCount = useMemo(() => {
    const textContent = localDraft.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return textContent.split(' ').filter((word: string) => word.length > 0).length;
  }, [localDraft.body]);

  // Calculate keyword density
  const keywordDensity = useMemo(() => {
    if (!localDraft.keyword) return 0;
    const textContent = localDraft.body.toLowerCase().replace(/<[^>]*>/g, ' ');
    const keywordRegex = new RegExp(localDraft.keyword.toLowerCase(), 'gi');
    const matches = textContent.match(keywordRegex);
    const keywordCount = matches ? matches.length : 0;
    return wordCount > 0 ? Math.round((keywordCount / wordCount) * 100 * 100) / 100 : 0;
  }, [localDraft.body, localDraft.keyword, wordCount]);

  // Check for disclaimers
  const hasDisclaimer = useMemo(() => {
    const disclaimerPatterns = [
      /Dit artikel is uitsluitend bedoeld voor informatieve doeleinden/i,
      /This article is for informational purposes only/i,
      /Raadpleeg altijd een gekwalificeerde/i,
      /Always consult a qualified/i,
    ];
    return disclaimerPatterns.some((pattern) => pattern.test(localDraft.body));
  }, [localDraft.body]);

  // Extract links
  const links = useMemo(() => {
    const linkRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi;
    const result: { url: string; text: string; isExternal: boolean }[] = [];
    let match;

    while ((match = linkRegex.exec(localDraft.body)) !== null) {
      const url = match[1];
      const isExternal = url.startsWith('http') && !url.includes('ambitionvalley');
      result.push({
        url,
        text: match[2].replace(/<[^>]*>/g, ''),
        isExternal,
      });
    }

    return result;
  }, [localDraft.body]);

  const handleFieldChange = (field: keyof ContentDraft, value: string) => {
    setLocalDraft((prev) => ({ ...prev, [field]: value }));
    onChange?.(field, value);
  };

  const handleSave = () => {
    onSave?.(localDraft);
    setEditMode(false);
  };

  const handleSubmitForReview = () => {
    onSubmitForReview?.(localDraft);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <StatusBadge status={localDraft.status} size="lg" />
            <span className="text-sm text-white/50">
              {localDraft.language === 'nl' ? 'Nederlands' : 'English'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!editMode && draft.status === 'draft' && (
              <ActionButton variant="secondary" onClick={() => setEditMode(true)}>
                Bewerken
              </ActionButton>
            )}
            {editMode && (
              <>
                <ActionButton variant="ghost" onClick={() => setEditMode(false)}>
                  Annuleren
                </ActionButton>
                <ActionButton onClick={handleSave}>Opslaan</ActionButton>
              </>
            )}
            {draft.status === 'draft' && !editMode && (
              <ActionButton variant="success" onClick={handleSubmitForReview}>
                Indienen voor review
              </ActionButton>
            )}
          </div>
        </div>

        {/* Title */}
        {editMode ? (
          <input
            type="text"
            value={localDraft.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            className="w-full text-2xl font-bold text-white bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            placeholder="Titel"
          />
        ) : (
          <h1 className="text-2xl font-bold text-white">{localDraft.title}</h1>
        )}

        {/* Meta description */}
        <div className="mt-4">
          <label className="text-xs font-medium text-white/50 uppercase">Meta Description</label>
          {editMode ? (
            <textarea
              value={localDraft.metaDescription}
              onChange={(e) => handleFieldChange('metaDescription', e.target.value)}
              className="w-full mt-1 text-sm text-white/70 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              rows={2}
              placeholder="Meta beschrijving..."
            />
          ) : (
            <p className="mt-1 text-sm text-white/70">{localDraft.metaDescription}</p>
          )}
          <p className={`text-xs mt-1 ${localDraft.metaDescription.length > 160 ? 'text-red-400' : 'text-white/40'}`}>
            {localDraft.metaDescription.length}/160 tekens
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Content</h2>
            {editMode ? (
              <textarea
                value={localDraft.body}
                onChange={(e) => handleFieldChange('body', e.target.value)}
                className="w-full h-[600px] text-sm text-white bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none font-mono"
                placeholder="HTML content..."
              />
            ) : (
              <div
                className="prose prose-invert max-w-none text-white/80"
                dangerouslySetInnerHTML={{ __html: localDraft.body }}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Word Count & Stats */}
          <div className="glass rounded-2xl p-4">
            <h3 className="text-sm font-medium text-white mb-3">Statistieken</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Woorden</span>
                <span className={`font-medium ${wordCount >= 1500 ? 'text-green-400' : wordCount >= 800 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {wordCount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Keyword densiteit</span>
                <span className={`font-medium ${keywordDensity >= 0.5 && keywordDensity <= 2.5 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {keywordDensity}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Disclaimer</span>
                <span className={`font-medium ${hasDisclaimer ? 'text-green-400' : 'text-red-400'}`}>
                  {hasDisclaimer ? 'Aanwezig' : 'Ontbreekt'}
                </span>
              </div>
            </div>
          </div>

          {/* Heading Structure */}
          <div className="glass rounded-2xl p-4">
            <h3 className="text-sm font-medium text-white mb-3">Heading structuur</h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {headings.length > 0 ? (
                headings.map((heading, index) => (
                  <div
                    key={index}
                    className="text-xs text-white/70"
                    style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
                  >
                    <span className="text-white/40">H{heading.level}</span>{' '}
                    {heading.text.slice(0, 40)}
                    {heading.text.length > 40 && '...'}
                  </div>
                ))
              ) : (
                <p className="text-xs text-white/40">Geen headings gevonden</p>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="glass rounded-2xl p-4">
            <h3 className="text-sm font-medium text-white mb-3">Links ({links.length})</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {links.length > 0 ? (
                links.map((link, index) => (
                  <div key={index} className="text-xs">
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        link.isExternal ? 'bg-yellow-400' : 'bg-green-400'
                      }`}
                    />
                    <span className="text-white/70">
                      {link.text.slice(0, 30)}
                      {link.text.length > 30 && '...'}
                    </span>
                    <span className="text-white/40 ml-1">
                      ({link.isExternal ? 'extern' : 'intern'})
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-white/40">Geen links gevonden</p>
              )}
            </div>
          </div>

          {/* Focus Keyword */}
          <div className="glass rounded-2xl p-4">
            <h3 className="text-sm font-medium text-white mb-3">Focus Keyword</h3>
            <p className="text-sm text-white/70">
              {localDraft.keyword || <span className="text-white/40">Niet ingesteld</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
