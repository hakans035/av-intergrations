/**
 * SEO Content Engine - Performance Monitoring
 *
 * Tracks content performance, detects underperforming content,
 * and manages content versioning with rollback support.
 */

import { performanceConfig } from '../config';
import type { PerformanceMetric, PerformanceReport, ContentDraft } from '../types';

// =============================================================================
// Types
// =============================================================================

export type ReviewCadence = 'weekly' | 'monthly' | 'quarterly';

export type UpdateTriggerReason =
  | 'traffic_decline'
  | 'content_age'
  | 'keyword_opportunity'
  | 'factual_update'
  | 'user_feedback';

export interface UpdateTrigger {
  postId: string;
  reason: UpdateTriggerReason;
  severity: 'low' | 'medium' | 'high';
  details: string;
  detectedAt: string;
  metrics?: {
    current: number;
    previous: number;
    changePercent: number;
  };
}

export interface ContentVersion {
  id: string;
  postId: string;
  version: string; // e.g., "1.0", "1.1", "2.0"
  majorVersion: number;
  minorVersion: number;
  content: ContentDraft;
  changes: string;
  createdAt: string;
  createdBy: string;
}

export interface VersionHistory {
  postId: string;
  currentVersion: string;
  versions: ContentVersion[];
  retainedUntil: string;
}

export interface PerformanceSummary {
  postId: string;
  period: ReviewCadence;
  dateRange: { from: string; to: string };
  metrics: {
    impressions: { total: number; change: number };
    clicks: { total: number; change: number };
    position: { avg: number; change: number };
    ctr: { avg: number; change: number };
    pageViews: { total: number; change: number };
    conversions: { total: number; change: number };
  };
  trend: 'up' | 'down' | 'stable';
  needsAttention: boolean;
  triggers: UpdateTrigger[];
}

export interface ReviewReport {
  cadence: ReviewCadence;
  generatedAt: string;
  dateRange: { from: string; to: string };
  totalPosts: number;
  performingSummary: {
    underperforming: number;
    stable: number;
    improving: number;
  };
  postSummaries: PerformanceSummary[];
  topPerformers: { postId: string; metric: string; value: number }[];
  underperformers: { postId: string; trigger: UpdateTrigger }[];
  recommendations: string[];
}

export interface SearchConsoleData {
  postId: string;
  date: string;
  impressions: number;
  clicks: number;
  position: number;
  ctr: number;
}

export interface AnalyticsData {
  postId: string;
  date: string;
  pageViews: number;
  timeOnPage: number;
  bounceRate: number;
  scrollDepth: number;
  conversions: number;
}

export interface DataSource {
  type: 'search_console' | 'analytics';
  fetchData(postIds: string[], dateRange: { from: string; to: string }): Promise<SearchConsoleData[] | AnalyticsData[]>;
}

// =============================================================================
// Performance Monitoring Service
// =============================================================================

export class PerformanceMonitoringService {
  private metricsStore: Map<string, PerformanceMetric[]> = new Map();
  private versionsStore: Map<string, VersionHistory> = new Map();
  private triggersStore: Map<string, UpdateTrigger[]> = new Map();
  private searchConsoleSource: DataSource | null = null;
  private analyticsSource: DataSource | null = null;

  // ===========================================================================
  // Data Source Configuration
  // ===========================================================================

  /**
   * Configure Google Search Console data source.
   */
  setSearchConsoleSource(source: DataSource): void {
    if (source.type !== 'search_console') {
      throw new Error('Invalid data source type for Search Console');
    }
    this.searchConsoleSource = source;
  }

  /**
   * Configure web analytics data source.
   */
  setAnalyticsSource(source: DataSource): void {
    if (source.type !== 'analytics') {
      throw new Error('Invalid data source type for Analytics');
    }
    this.analyticsSource = source;
  }

  // ===========================================================================
  // Data Sync
  // ===========================================================================

  /**
   * Sync performance data from all sources.
   */
  async syncData(
    postIds: string[],
    dateRange: { from: string; to: string }
  ): Promise<{ synced: number; errors: string[] }> {
    const errors: string[] = [];
    let synced = 0;

    // Fetch Search Console data
    let searchData: SearchConsoleData[] = [];
    if (this.searchConsoleSource) {
      try {
        searchData = (await this.searchConsoleSource.fetchData(postIds, dateRange)) as SearchConsoleData[];
      } catch (error) {
        errors.push(`Search Console sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Fetch Analytics data
    let analyticsData: AnalyticsData[] = [];
    if (this.analyticsSource) {
      try {
        analyticsData = (await this.analyticsSource.fetchData(postIds, dateRange)) as AnalyticsData[];
      } catch (error) {
        errors.push(`Analytics sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Merge data into metrics
    const mergedMetrics = this.mergeData(searchData, analyticsData);

    for (const metric of mergedMetrics) {
      this.storeMetric(metric);
      synced++;
    }

    return { synced, errors };
  }

  /**
   * Merge Search Console and Analytics data.
   */
  private mergeData(
    searchData: SearchConsoleData[],
    analyticsData: AnalyticsData[]
  ): PerformanceMetric[] {
    const metricMap = new Map<string, Partial<PerformanceMetric>>();

    // Add Search Console data
    for (const sc of searchData) {
      const key = `${sc.postId}_${sc.date}`;
      metricMap.set(key, {
        postId: sc.postId,
        date: sc.date,
        impressions: sc.impressions,
        clicks: sc.clicks,
        position: sc.position,
        ctr: sc.ctr,
      });
    }

    // Add Analytics data
    for (const an of analyticsData) {
      const key = `${an.postId}_${an.date}`;
      const existing = metricMap.get(key) || { postId: an.postId, date: an.date };
      metricMap.set(key, {
        ...existing,
        pageViews: an.pageViews,
        timeOnPage: an.timeOnPage,
        bounceRate: an.bounceRate,
        scrollDepth: an.scrollDepth,
        conversions: an.conversions,
      });
    }

    // Convert to full metrics with defaults
    return Array.from(metricMap.values()).map((partial) => ({
      postId: partial.postId!,
      date: partial.date!,
      impressions: partial.impressions ?? 0,
      clicks: partial.clicks ?? 0,
      position: partial.position ?? 0,
      ctr: partial.ctr ?? 0,
      pageViews: partial.pageViews ?? 0,
      timeOnPage: partial.timeOnPage ?? 0,
      bounceRate: partial.bounceRate ?? 0,
      scrollDepth: partial.scrollDepth ?? 0,
      conversions: partial.conversions ?? 0,
    }));
  }

  // ===========================================================================
  // Metrics Storage
  // ===========================================================================

  /**
   * Store a performance metric.
   */
  storeMetric(metric: PerformanceMetric): void {
    const existing = this.metricsStore.get(metric.postId) || [];

    // Remove existing metric for same date (update)
    const filtered = existing.filter((m) => m.date !== metric.date);
    filtered.push(metric);

    // Sort by date descending
    filtered.sort((a, b) => b.date.localeCompare(a.date));

    this.metricsStore.set(metric.postId, filtered);
  }

  /**
   * Store multiple metrics.
   */
  storeMetrics(metrics: PerformanceMetric[]): void {
    for (const metric of metrics) {
      this.storeMetric(metric);
    }
  }

  /**
   * Get metrics for a post.
   */
  getMetrics(
    postId: string,
    dateRange?: { from: string; to: string }
  ): PerformanceMetric[] {
    const metrics = this.metricsStore.get(postId) || [];

    if (!dateRange) {
      return metrics;
    }

    return metrics.filter(
      (m) => m.date >= dateRange.from && m.date <= dateRange.to
    );
  }

  /**
   * Get latest metric for a post.
   */
  getLatestMetric(postId: string): PerformanceMetric | null {
    const metrics = this.metricsStore.get(postId);
    return metrics && metrics.length > 0 ? metrics[0] : null;
  }

  // ===========================================================================
  // Performance Analysis
  // ===========================================================================

  /**
   * Generate a performance report for a post.
   */
  generateReport(
    postId: string,
    dateRange: { from: string; to: string }
  ): PerformanceReport {
    const metrics = this.getMetrics(postId, dateRange);

    const summary = this.calculateSummary(metrics);

    return {
      postId,
      dateRange,
      metrics,
      summary,
    };
  }

  /**
   * Calculate summary statistics.
   */
  private calculateSummary(metrics: PerformanceMetric[]): PerformanceReport['summary'] {
    if (metrics.length === 0) {
      return {
        totalImpressions: 0,
        totalClicks: 0,
        avgPosition: 0,
        avgCtr: 0,
        trend: 'stable',
      };
    }

    const totalImpressions = metrics.reduce((sum, m) => sum + m.impressions, 0);
    const totalClicks = metrics.reduce((sum, m) => sum + m.clicks, 0);
    const avgPosition = metrics.reduce((sum, m) => sum + m.position, 0) / metrics.length;
    const avgCtr = metrics.reduce((sum, m) => sum + m.ctr, 0) / metrics.length;

    // Determine trend by comparing first half to second half
    const midpoint = Math.floor(metrics.length / 2);
    const trend = this.determineTrend(metrics, midpoint);

    return {
      totalImpressions,
      totalClicks,
      avgPosition: Math.round(avgPosition * 10) / 10,
      avgCtr: Math.round(avgCtr * 100) / 100,
      trend,
    };
  }

  /**
   * Determine performance trend.
   */
  private determineTrend(
    metrics: PerformanceMetric[],
    midpoint: number
  ): 'up' | 'down' | 'stable' {
    if (metrics.length < 2) {
      return 'stable';
    }

    // Metrics are sorted descending by date, so recent is at start
    const recentHalf = metrics.slice(0, midpoint || 1);
    const olderHalf = metrics.slice(midpoint || 1);

    if (olderHalf.length === 0) {
      return 'stable';
    }

    const recentAvgClicks = recentHalf.reduce((sum, m) => sum + m.clicks, 0) / recentHalf.length;
    const olderAvgClicks = olderHalf.reduce((sum, m) => sum + m.clicks, 0) / olderHalf.length;

    const changePercent = olderAvgClicks > 0
      ? ((recentAvgClicks - olderAvgClicks) / olderAvgClicks) * 100
      : 0;

    if (changePercent > 10) return 'up';
    if (changePercent < -10) return 'down';
    return 'stable';
  }

  // ===========================================================================
  // Update Triggers
  // ===========================================================================

  /**
   * Detect update triggers for a post.
   */
  detectUpdateTriggers(
    postId: string,
    publishDate: string,
    currentMetrics?: PerformanceMetric[],
    previousMetrics?: PerformanceMetric[]
  ): UpdateTrigger[] {
    const triggers: UpdateTrigger[] = [];
    const now = new Date();
    const publishedAt = new Date(publishDate);

    // Check content age
    const ageMonths = this.getMonthsDifference(publishedAt, now);
    if (ageMonths >= performanceConfig.updateTriggers.ageMonths) {
      // Check traffic decline
      if (currentMetrics && previousMetrics) {
        const currentClicks = currentMetrics.reduce((sum, m) => sum + m.clicks, 0);
        const previousClicks = previousMetrics.reduce((sum, m) => sum + m.clicks, 0);

        if (previousClicks > 0) {
          const declinePercent = ((previousClicks - currentClicks) / previousClicks) * 100;

          if (declinePercent >= performanceConfig.updateTriggers.trafficDeclinePercent) {
            triggers.push({
              postId,
              reason: 'traffic_decline',
              severity: declinePercent >= 50 ? 'high' : declinePercent >= 30 ? 'medium' : 'low',
              details: `Traffic declined ${Math.round(declinePercent)}% over the period`,
              detectedAt: now.toISOString(),
              metrics: {
                current: currentClicks,
                previous: previousClicks,
                changePercent: -declinePercent,
              },
            });
          }
        }
      }

      // Flag old content regardless of traffic
      if (ageMonths >= 12) {
        triggers.push({
          postId,
          reason: 'content_age',
          severity: ageMonths >= 18 ? 'high' : 'medium',
          details: `Content is ${ageMonths} months old and may need updating`,
          detectedAt: now.toISOString(),
        });
      }
    }

    // Store triggers
    this.triggersStore.set(postId, triggers);

    return triggers;
  }

  /**
   * Flag post for update manually.
   */
  flagForUpdate(
    postId: string,
    reason: UpdateTriggerReason,
    details: string,
    severity: 'low' | 'medium' | 'high' = 'medium'
  ): UpdateTrigger {
    const trigger: UpdateTrigger = {
      postId,
      reason,
      severity,
      details,
      detectedAt: new Date().toISOString(),
    };

    const existing = this.triggersStore.get(postId) || [];
    existing.push(trigger);
    this.triggersStore.set(postId, existing);

    return trigger;
  }

  /**
   * Get active triggers for a post.
   */
  getActiveTriggers(postId: string): UpdateTrigger[] {
    return this.triggersStore.get(postId) || [];
  }

  /**
   * Clear triggers for a post.
   */
  clearTriggers(postId: string): void {
    this.triggersStore.delete(postId);
  }

  // ===========================================================================
  // Version Management
  // ===========================================================================

  /**
   * Create a new version for a post.
   */
  createVersion(
    postId: string,
    content: ContentDraft,
    changes: string,
    createdBy: string,
    isStructuralChange: boolean = false
  ): ContentVersion {
    const history = this.versionsStore.get(postId) || this.initializeVersionHistory(postId);

    // Parse current version
    const [major, minor] = history.currentVersion.split('.').map(Number);

    // Determine new version
    let newMajor: number;
    let newMinor: number;

    if (history.versions.length === 0) {
      // First version is always 1.0
      newMajor = 1;
      newMinor = 0;
    } else if (isStructuralChange) {
      // Major version bump: reset minor to 0
      newMajor = major + 1;
      newMinor = 0;
    } else {
      // Minor version bump
      newMajor = major;
      newMinor = minor + 1;
    }

    const newVersionString = `${newMajor}.${newMinor}`;

    const version: ContentVersion = {
      id: this.generateId('ver'),
      postId,
      version: newVersionString,
      majorVersion: newMajor,
      minorVersion: newMinor,
      content,
      changes,
      createdAt: new Date().toISOString(),
      createdBy,
    };

    history.versions.push(version);
    history.currentVersion = newVersionString;

    // Update retention date
    const retainedUntil = new Date();
    retainedUntil.setMonth(retainedUntil.getMonth() + performanceConfig.versionRetentionMonths);
    history.retainedUntil = retainedUntil.toISOString();

    this.versionsStore.set(postId, history);

    return version;
  }

  /**
   * Initialize version history for a new post.
   */
  private initializeVersionHistory(postId: string): VersionHistory {
    const retainedUntil = new Date();
    retainedUntil.setMonth(retainedUntil.getMonth() + performanceConfig.versionRetentionMonths);

    return {
      postId,
      currentVersion: '0.0',
      versions: [],
      retainedUntil: retainedUntil.toISOString(),
    };
  }

  /**
   * Get version history for a post.
   */
  getVersionHistory(postId: string): VersionHistory | null {
    return this.versionsStore.get(postId) || null;
  }

  /**
   * Get a specific version.
   */
  getVersion(postId: string, version: string): ContentVersion | null {
    const history = this.versionsStore.get(postId);
    if (!history) return null;

    return history.versions.find((v) => v.version === version) || null;
  }

  /**
   * Get the current version.
   */
  getCurrentVersion(postId: string): ContentVersion | null {
    const history = this.versionsStore.get(postId);
    if (!history || history.versions.length === 0) return null;

    return history.versions.find((v) => v.version === history.currentVersion) || null;
  }

  /**
   * Rollback to a previous version.
   */
  rollback(
    postId: string,
    targetVersion: string,
    rolledBackBy: string
  ): ContentVersion | null {
    const history = this.versionsStore.get(postId);
    if (!history) return null;

    const targetVersionData = history.versions.find((v) => v.version === targetVersion);
    if (!targetVersionData) return null;

    // Create a new version based on the rollback
    return this.createVersion(
      postId,
      targetVersionData.content,
      `Rolled back to version ${targetVersion}`,
      rolledBackBy,
      true // Structural change (major version bump)
    );
  }

  /**
   * Clean up expired versions.
   */
  cleanupExpiredVersions(): number {
    const now = new Date().toISOString();
    let cleaned = 0;

    for (const [postId, history] of this.versionsStore.entries()) {
      if (history.retainedUntil < now) {
        // Keep at least the current version
        const currentVersion = history.versions.find(
          (v) => v.version === history.currentVersion
        );

        if (currentVersion) {
          const originalCount = history.versions.length;
          history.versions = [currentVersion];
          cleaned += originalCount - 1;

          // Extend retention
          const newRetention = new Date();
          newRetention.setMonth(newRetention.getMonth() + performanceConfig.versionRetentionMonths);
          history.retainedUntil = newRetention.toISOString();

          this.versionsStore.set(postId, history);
        } else {
          this.versionsStore.delete(postId);
          cleaned += history.versions.length;
        }
      }
    }

    return cleaned;
  }

  // ===========================================================================
  // Review Reports
  // ===========================================================================

  /**
   * Generate a review report.
   */
  generateReviewReport(
    cadence: ReviewCadence,
    postIds: string[],
    dateRange: { from: string; to: string },
    previousDateRange: { from: string; to: string }
  ): ReviewReport {
    const postSummaries: PerformanceSummary[] = [];
    const topPerformers: ReviewReport['topPerformers'] = [];
    const underperformers: ReviewReport['underperformers'] = [];

    let improving = 0;
    let stable = 0;
    let underperforming = 0;

    for (const postId of postIds) {
      const summary = this.generatePostSummary(postId, cadence, dateRange, previousDateRange);
      postSummaries.push(summary);

      if (summary.trend === 'up') improving++;
      else if (summary.trend === 'down') underperforming++;
      else stable++;

      // Track top performers
      if (summary.metrics.clicks.total > 0) {
        topPerformers.push({
          postId,
          metric: 'clicks',
          value: summary.metrics.clicks.total,
        });
      }

      // Track underperformers
      if (summary.triggers.length > 0) {
        underperformers.push({
          postId,
          trigger: summary.triggers[0],
        });
      }
    }

    // Sort top performers
    topPerformers.sort((a, b) => b.value - a.value);

    // Generate recommendations
    const recommendations = this.generateRecommendations(postSummaries, cadence);

    return {
      cadence,
      generatedAt: new Date().toISOString(),
      dateRange,
      totalPosts: postIds.length,
      performingSummary: {
        underperforming,
        stable,
        improving,
      },
      postSummaries,
      topPerformers: topPerformers.slice(0, 10),
      underperformers,
      recommendations,
    };
  }

  /**
   * Generate summary for a single post.
   */
  private generatePostSummary(
    postId: string,
    period: ReviewCadence,
    dateRange: { from: string; to: string },
    previousDateRange: { from: string; to: string }
  ): PerformanceSummary {
    const currentMetrics = this.getMetrics(postId, dateRange);
    const previousMetrics = this.getMetrics(postId, previousDateRange);

    const current = this.aggregateMetrics(currentMetrics);
    const previous = this.aggregateMetrics(previousMetrics);

    const metrics = {
      impressions: {
        total: current.impressions,
        change: this.calculateChange(current.impressions, previous.impressions),
      },
      clicks: {
        total: current.clicks,
        change: this.calculateChange(current.clicks, previous.clicks),
      },
      position: {
        avg: current.avgPosition,
        change: this.calculateChange(current.avgPosition, previous.avgPosition),
      },
      ctr: {
        avg: current.avgCtr,
        change: this.calculateChange(current.avgCtr, previous.avgCtr),
      },
      pageViews: {
        total: current.pageViews,
        change: this.calculateChange(current.pageViews, previous.pageViews),
      },
      conversions: {
        total: current.conversions,
        change: this.calculateChange(current.conversions, previous.conversions),
      },
    };

    const trend = this.determineTrend(currentMetrics, Math.floor(currentMetrics.length / 2));
    const triggers = this.getActiveTriggers(postId);

    return {
      postId,
      period,
      dateRange,
      metrics,
      trend,
      needsAttention: triggers.length > 0 || trend === 'down',
      triggers,
    };
  }

  /**
   * Aggregate metrics.
   */
  private aggregateMetrics(metrics: PerformanceMetric[]): {
    impressions: number;
    clicks: number;
    avgPosition: number;
    avgCtr: number;
    pageViews: number;
    conversions: number;
  } {
    if (metrics.length === 0) {
      return {
        impressions: 0,
        clicks: 0,
        avgPosition: 0,
        avgCtr: 0,
        pageViews: 0,
        conversions: 0,
      };
    }

    return {
      impressions: metrics.reduce((sum, m) => sum + m.impressions, 0),
      clicks: metrics.reduce((sum, m) => sum + m.clicks, 0),
      avgPosition: metrics.reduce((sum, m) => sum + m.position, 0) / metrics.length,
      avgCtr: metrics.reduce((sum, m) => sum + m.ctr, 0) / metrics.length,
      pageViews: metrics.reduce((sum, m) => sum + m.pageViews, 0),
      conversions: metrics.reduce((sum, m) => sum + m.conversions, 0),
    };
  }

  /**
   * Calculate percentage change.
   */
  private calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * Generate recommendations based on performance.
   */
  private generateRecommendations(
    summaries: PerformanceSummary[],
    cadence: ReviewCadence
  ): string[] {
    const recommendations: string[] = [];

    const underperforming = summaries.filter((s) => s.trend === 'down');
    const needsAttention = summaries.filter((s) => s.needsAttention);

    if (underperforming.length > 0) {
      recommendations.push(
        `${underperforming.length} post(s) showing declining performance. Review content freshness and keyword relevance.`
      );
    }

    if (needsAttention.length > 0) {
      recommendations.push(
        `${needsAttention.length} post(s) flagged for attention. Check update triggers for specific issues.`
      );
    }

    const highClickPosts = summaries.filter((s) => s.metrics.clicks.total > 100);
    if (highClickPosts.length > 0 && cadence === 'monthly') {
      recommendations.push(
        `${highClickPosts.length} high-traffic post(s) identified. Consider creating related content to capture more traffic.`
      );
    }

    const lowCtrPosts = summaries.filter((s) => s.metrics.ctr.avg < 2 && s.metrics.impressions.total > 100);
    if (lowCtrPosts.length > 0) {
      recommendations.push(
        `${lowCtrPosts.length} post(s) with low CTR despite good impressions. Consider optimizing titles and meta descriptions.`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('All content performing within expected parameters.');
    }

    return recommendations;
  }

  // ===========================================================================
  // Helper Methods
  // ===========================================================================

  /**
   * Get months difference between two dates.
   */
  private getMonthsDifference(from: Date, to: Date): number {
    return (
      (to.getFullYear() - from.getFullYear()) * 12 +
      (to.getMonth() - from.getMonth())
    );
  }

  /**
   * Generate a unique ID.
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get all posts with metrics.
   */
  getAllPostIds(): string[] {
    return Array.from(this.metricsStore.keys());
  }

  /**
   * Get sync schedule (cron expression).
   */
  getSyncSchedule(): string {
    return performanceConfig.syncSchedule;
  }

  /**
   * Clear all data (for testing).
   */
  clearAll(): void {
    this.metricsStore.clear();
    this.versionsStore.clear();
    this.triggersStore.clear();
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a performance monitoring service.
 */
export function createPerformanceMonitoring(): PerformanceMonitoringService {
  return new PerformanceMonitoringService();
}

/**
 * Create a mock Search Console data source (for testing).
 */
export function createMockSearchConsoleSource(
  data: SearchConsoleData[]
): DataSource {
  return {
    type: 'search_console',
    fetchData: async () => data,
  };
}

/**
 * Create a mock Analytics data source (for testing).
 */
export function createMockAnalyticsSource(
  data: AnalyticsData[]
): DataSource {
  return {
    type: 'analytics',
    fetchData: async () => data,
  };
}
