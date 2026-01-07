'use client';

import { useState, useMemo } from 'react';
import type { PerformanceMetric, PerformanceReport, Language } from '../types';
import type { PerformanceSummary, ReviewReport } from '../lib/performance-monitoring';
import { MetricCard, ActionButton, LanguageSelector, LoadingState, EmptyState } from './shared';

interface PerformanceDashboardProps {
  reports: PerformanceReport[];
  reviewReport?: ReviewReport;
  isLoading?: boolean;
  onDateRangeChange?: (range: { from: string; to: string }) => void;
  onExport?: () => void;
}

type DateRange = '7d' | '30d' | '90d' | 'custom';

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(dateString));
}

export function PerformanceDashboard({
  reports,
  reviewReport,
  isLoading = false,
  onDateRangeChange,
  onExport,
}: PerformanceDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [languageFilter, setLanguageFilter] = useState<Language | 'all'>('all');

  // Calculate aggregate metrics
  const aggregateMetrics = useMemo(() => {
    const allMetrics = reports.flatMap((r) => r.metrics);

    if (allMetrics.length === 0) {
      return {
        totalImpressions: 0,
        totalClicks: 0,
        avgPosition: 0,
        avgCtr: 0,
        totalPageViews: 0,
        totalConversions: 0,
      };
    }

    return {
      totalImpressions: allMetrics.reduce((sum, m) => sum + m.impressions, 0),
      totalClicks: allMetrics.reduce((sum, m) => sum + m.clicks, 0),
      avgPosition: allMetrics.reduce((sum, m) => sum + m.position, 0) / allMetrics.length,
      avgCtr: allMetrics.reduce((sum, m) => sum + m.ctr, 0) / allMetrics.length,
      totalPageViews: allMetrics.reduce((sum, m) => sum + m.pageViews, 0),
      totalConversions: allMetrics.reduce((sum, m) => sum + m.conversions, 0),
    };
  }, [reports]);

  // Sort reports by performance
  const sortedReports = useMemo(() => {
    return [...reports].sort(
      (a, b) => b.summary.totalClicks - a.summary.totalClicks
    );
  }, [reports]);

  const topPerformers = sortedReports.slice(0, 5);
  const bottomPerformers = sortedReports
    .filter((r) => r.summary.trend === 'down')
    .slice(0, 5);

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);

    if (range === 'custom') return;

    const to = new Date();
    const from = new Date();

    switch (range) {
      case '7d':
        from.setDate(from.getDate() - 7);
        break;
      case '30d':
        from.setDate(from.getDate() - 30);
        break;
      case '90d':
        from.setDate(from.getDate() - 90);
        break;
    }

    onDateRangeChange?.({
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
    });
  };

  if (isLoading) {
    return <LoadingState message="Performance data laden..." />;
  }

  if (reports.length === 0) {
    return (
      <EmptyState
        title="Geen performance data"
        message="Er is nog geen performance data beschikbaar. Data wordt dagelijks gesynchroniseerd."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1">Periode</label>
              <div className="flex rounded-lg bg-white/5 p-0.5 border border-white/10">
                {(['7d', '30d', '90d'] as DateRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => handleDateRangeChange(range)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      dateRange === range
                        ? 'bg-white/20 text-white'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {range === '7d' ? '7 dagen' : range === '30d' ? '30 dagen' : '90 dagen'}
                  </button>
                ))}
              </div>
            </div>

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
          </div>

          {onExport && (
            <ActionButton variant="secondary" onClick={onExport}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exporteren
            </ActionButton>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Impressies"
          value={formatNumber(aggregateMetrics.totalImpressions)}
          icon={
            <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        />
        <MetricCard
          title="Clicks"
          value={formatNumber(aggregateMetrics.totalClicks)}
          icon={
            <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          }
        />
        <MetricCard
          title="Gem. positie"
          value={aggregateMetrics.avgPosition.toFixed(1)}
          icon={
            <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          }
        />
        <MetricCard
          title="Gem. CTR"
          value={`${aggregateMetrics.avgCtr.toFixed(2)}%`}
          icon={
            <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top presteerders</h3>
          {topPerformers.length > 0 ? (
            <div className="space-y-3">
              {topPerformers.map((report, index) => (
                <div
                  key={report.postId}
                  className="flex items-center gap-4 p-3 bg-white/5 rounded-xl"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{report.postId}</p>
                    <p className="text-sm text-white/50">
                      {formatNumber(report.summary.totalClicks)} clicks •{' '}
                      {formatNumber(report.summary.totalImpressions)} impressies
                    </p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      report.summary.trend === 'up'
                        ? 'bg-green-500/20 text-green-400'
                        : report.summary.trend === 'down'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {report.summary.trend === 'up' ? '↑' : report.summary.trend === 'down' ? '↓' : '→'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/50">Geen data beschikbaar</p>
          )}
        </div>

        {/* Needs Attention */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Aandacht nodig</h3>
          {bottomPerformers.length > 0 ? (
            <div className="space-y-3">
              {bottomPerformers.map((report) => (
                <div
                  key={report.postId}
                  className="flex items-center gap-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{report.postId}</p>
                    <p className="text-sm text-red-300">Dalende trend gedetecteerd</p>
                  </div>
                  <ActionButton variant="ghost" size="sm">
                    Bekijken
                  </ActionButton>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-white/50">Alle content presteert goed!</p>
            </div>
          )}
        </div>
      </div>

      {/* Review Report Summary */}
      {reviewReport && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {reviewReport.cadence === 'weekly' ? 'Wekelijkse' : reviewReport.cadence === 'monthly' ? 'Maandelijkse' : 'Kwartaal'} review
            </h3>
            <span className="text-sm text-white/50">
              {formatDate(reviewReport.dateRange.from)} - {formatDate(reviewReport.dateRange.to)}
            </span>
          </div>

          {/* Performance Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-500/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{reviewReport.performingSummary.improving}</p>
              <p className="text-sm text-white/60">Verbeterend</p>
            </div>
            <div className="bg-gray-500/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-400">{reviewReport.performingSummary.stable}</p>
              <p className="text-sm text-white/60">Stabiel</p>
            </div>
            <div className="bg-red-500/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-400">{reviewReport.performingSummary.underperforming}</p>
              <p className="text-sm text-white/60">Dalend</p>
            </div>
          </div>

          {/* Recommendations */}
          {reviewReport.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-white/70 mb-2">Aanbevelingen</h4>
              <ul className="space-y-2">
                {reviewReport.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-white/60">
                    <span className="text-blue-400">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
