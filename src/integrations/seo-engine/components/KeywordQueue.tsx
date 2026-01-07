'use client';

import { useState, useMemo } from 'react';
import type { Keyword, Language, KeywordIntent, KeywordStatus } from '../types';
import { ActionButton, LanguageSelector, EmptyState, LoadingState } from './shared';

interface KeywordQueueProps {
  keywords: Keyword[];
  isLoading?: boolean;
  onSelectKeyword: (keyword: Keyword) => void;
  onApproveKeyword: (keywordId: string) => void;
  onRejectKeyword: (keywordId: string) => void;
  onGenerateContent: (keyword: Keyword) => void;
}

type SortField = 'volume' | 'difficulty' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const intentLabels: Record<KeywordIntent, { label: string; className: string }> = {
  informational: {
    label: 'Informatief',
    className: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
  },
  transactional: {
    label: 'Transactioneel',
    className: 'bg-green-500/20 text-green-300 border-green-400/30',
  },
  local: {
    label: 'Lokaal',
    className: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
  },
};

const statusLabels: Record<KeywordStatus, { label: string; className: string }> = {
  new: {
    label: 'Nieuw',
    className: 'bg-gray-500/20 text-gray-300 border-gray-400/30',
  },
  approved: {
    label: 'Goedgekeurd',
    className: 'bg-green-500/20 text-green-300 border-green-400/30',
  },
  in_progress: {
    label: 'In behandeling',
    className: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
  },
  used: {
    label: 'Gebruikt',
    className: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
  },
  rejected: {
    label: 'Afgewezen',
    className: 'bg-red-500/20 text-red-300 border-red-400/30',
  },
  expired: {
    label: 'Verlopen',
    className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  },
};

export function KeywordQueue({
  keywords,
  isLoading = false,
  onSelectKeyword,
  onApproveKeyword,
  onRejectKeyword,
  onGenerateContent,
}: KeywordQueueProps) {
  const [languageFilter, setLanguageFilter] = useState<Language | 'all'>('all');
  const [intentFilter, setIntentFilter] = useState<KeywordIntent | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<KeywordStatus | 'all'>('new');
  const [sortField, setSortField] = useState<SortField>('volume');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedKeyword, setSelectedKeyword] = useState<Keyword | null>(null);

  const filteredAndSortedKeywords = useMemo(() => {
    let result = [...keywords];

    // Apply filters
    if (languageFilter !== 'all') {
      result = result.filter((k) => k.language === languageFilter);
    }
    if (intentFilter !== 'all') {
      result = result.filter((k) => k.intent === intentFilter);
    }
    if (statusFilter !== 'all') {
      result = result.filter((k) => k.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sortField) {
        case 'volume':
          aVal = a.volume ?? 0;
          bVal = b.volume ?? 0;
          break;
        case 'difficulty':
          aVal = a.difficulty ?? 0;
          bVal = b.difficulty ?? 0;
          break;
        case 'createdAt':
          aVal = a.createdAt;
          bVal = b.createdAt;
          break;
        default:
          aVal = 0;
          bVal = 0;
      }

      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      }
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    });

    return result;
  }, [keywords, languageFilter, intentFilter, statusFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleKeywordClick = (keyword: Keyword) => {
    setSelectedKeyword(keyword);
    onSelectKeyword(keyword);
  };

  if (isLoading) {
    return <LoadingState message="Keywords laden..." />;
  }

  if (keywords.length === 0) {
    return (
      <EmptyState
        title="Geen keywords gevonden"
        message="Er zijn nog geen keywords ontdekt. Start een nieuwe discovery om keywords te vinden."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1">Taal</label>
            <div className="flex rounded-lg bg-white/5 p-0.5 border border-white/10">
              {(['all', 'nl', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguageFilter(lang)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    languageFilter === lang
                      ? 'bg-white/20 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {lang === 'all' ? 'Alle' : lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1">Intent</label>
            <select
              value={intentFilter}
              onChange={(e) => setIntentFilter(e.target.value as KeywordIntent | 'all')}
              className="px-3 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-white appearance-none cursor-pointer hover:bg-white/10"
            >
              <option value="all" className="bg-gray-900">Alle intents</option>
              {Object.entries(intentLabels).map(([key, { label }]) => (
                <option key={key} value={key} className="bg-gray-900">{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as KeywordStatus | 'all')}
              className="px-3 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-white appearance-none cursor-pointer hover:bg-white/10"
            >
              <option value="all" className="bg-gray-900">Alle statussen</option>
              {Object.entries(statusLabels).map(([key, { label }]) => (
                <option key={key} value={key} className="bg-gray-900">{label}</option>
              ))}
            </select>
          </div>

          <div className="ml-auto text-sm text-white/50">
            {filteredAndSortedKeywords.length} van {keywords.length} keywords
          </div>
        </div>
      </div>

      {/* Keyword Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Keyword
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Intent
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider cursor-pointer hover:text-white"
                  onClick={() => handleSort('volume')}
                >
                  <div className="flex items-center gap-1">
                    Volume
                    {sortField === 'volume' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider cursor-pointer hover:text-white"
                  onClick={() => handleSort('difficulty')}
                >
                  <div className="flex items-center gap-1">
                    Moeilijkheid
                    {sortField === 'difficulty' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-white/60 uppercase tracking-wider">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAndSortedKeywords.map((keyword) => {
                const intent = intentLabels[keyword.intent];
                const status = statusLabels[keyword.status];

                return (
                  <tr
                    key={keyword.id}
                    onClick={() => handleKeywordClick(keyword)}
                    className={`hover:bg-white/5 cursor-pointer transition-colors ${
                      selectedKeyword?.id === keyword.id ? 'bg-white/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">{keyword.keyword}</div>
                        <div className="text-xs text-white/50">
                          {keyword.language.toUpperCase()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${intent.className}`}
                      >
                        {intent.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {keyword.volume?.toLocaleString() ?? '-'}
                    </td>
                    <td className="px-6 py-4">
                      {keyword.difficulty != null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                keyword.difficulty < 30
                                  ? 'bg-green-400'
                                  : keyword.difficulty < 60
                                  ? 'bg-yellow-400'
                                  : 'bg-red-400'
                              }`}
                              style={{ width: `${keyword.difficulty}%` }}
                            />
                          </div>
                          <span className="text-xs text-white/60">{keyword.difficulty}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-white/40">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {keyword.status === 'new' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onApproveKeyword(keyword.id);
                              }}
                              className="p-1.5 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                              title="Goedkeuren"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRejectKeyword(keyword.id);
                              }}
                              className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Afwijzen"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        )}
                        {keyword.status === 'approved' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onGenerateContent(keyword);
                            }}
                            className="px-3 py-1 text-xs font-medium text-blue-300 bg-blue-500/20 border border-blue-400/30 rounded-lg hover:bg-blue-500/30 transition-colors"
                          >
                            Content genereren
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAndSortedKeywords.length === 0 && (
        <div className="text-center py-8">
          <p className="text-white/50">Geen keywords gevonden met de huidige filters.</p>
        </div>
      )}
    </div>
  );
}
