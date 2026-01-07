/**
 * Tests for Performance Monitoring Service
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  PerformanceMonitoringService,
  createPerformanceMonitoring,
  createMockSearchConsoleSource,
  createMockAnalyticsSource,
  type SearchConsoleData,
  type AnalyticsData,
} from '../../src/integrations/seo-engine/lib/performance-monitoring';
import type { PerformanceMetric, ContentDraft } from '../../src/integrations/seo-engine/types';

describe('PerformanceMonitoringService', () => {
  let service: PerformanceMonitoringService;

  beforeEach(() => {
    service = createPerformanceMonitoring();
  });

  // ===========================================================================
  // Metrics Storage
  // ===========================================================================

  describe('metrics storage', () => {
    const testMetric: PerformanceMetric = {
      postId: 'post-1',
      date: '2024-01-15',
      impressions: 1000,
      clicks: 50,
      position: 5.2,
      ctr: 5.0,
      pageViews: 100,
      timeOnPage: 120,
      bounceRate: 45,
      scrollDepth: 75,
      conversions: 3,
    };

    it('should store a metric', () => {
      service.storeMetric(testMetric);
      const metrics = service.getMetrics('post-1');
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toEqual(testMetric);
    });

    it('should store multiple metrics for same post', () => {
      service.storeMetric(testMetric);
      service.storeMetric({ ...testMetric, date: '2024-01-16', clicks: 60 });
      const metrics = service.getMetrics('post-1');
      expect(metrics).toHaveLength(2);
    });

    it('should update metric for same date', () => {
      service.storeMetric(testMetric);
      service.storeMetric({ ...testMetric, clicks: 100 });
      const metrics = service.getMetrics('post-1');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].clicks).toBe(100);
    });

    it('should filter by date range', () => {
      service.storeMetrics([
        { ...testMetric, date: '2024-01-10' },
        { ...testMetric, date: '2024-01-15' },
        { ...testMetric, date: '2024-01-20' },
      ]);
      const metrics = service.getMetrics('post-1', { from: '2024-01-12', to: '2024-01-18' });
      expect(metrics).toHaveLength(1);
      expect(metrics[0].date).toBe('2024-01-15');
    });

    it('should get latest metric', () => {
      service.storeMetrics([
        { ...testMetric, date: '2024-01-10', clicks: 40 },
        { ...testMetric, date: '2024-01-15', clicks: 50 },
        { ...testMetric, date: '2024-01-05', clicks: 30 },
      ]);
      const latest = service.getLatestMetric('post-1');
      expect(latest?.date).toBe('2024-01-15');
      expect(latest?.clicks).toBe(50);
    });

    it('should return null for unknown post', () => {
      const latest = service.getLatestMetric('unknown');
      expect(latest).toBeNull();
    });

    it('should return empty array for unknown post', () => {
      const metrics = service.getMetrics('unknown');
      expect(metrics).toEqual([]);
    });
  });

  // ===========================================================================
  // Data Sync
  // ===========================================================================

  describe('data sync', () => {
    it('should sync Search Console data', async () => {
      const scData: SearchConsoleData[] = [
        { postId: 'post-1', date: '2024-01-15', impressions: 1000, clicks: 50, position: 5.2, ctr: 5.0 },
      ];
      service.setSearchConsoleSource(createMockSearchConsoleSource(scData));

      const result = await service.syncData(['post-1'], { from: '2024-01-01', to: '2024-01-31' });
      expect(result.synced).toBe(1);
      expect(result.errors).toHaveLength(0);

      const metrics = service.getMetrics('post-1');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].impressions).toBe(1000);
    });

    it('should sync Analytics data', async () => {
      const analyticsData: AnalyticsData[] = [
        { postId: 'post-1', date: '2024-01-15', pageViews: 100, timeOnPage: 120, bounceRate: 45, scrollDepth: 75, conversions: 3 },
      ];
      service.setAnalyticsSource(createMockAnalyticsSource(analyticsData));

      const result = await service.syncData(['post-1'], { from: '2024-01-01', to: '2024-01-31' });
      expect(result.synced).toBe(1);

      const metrics = service.getMetrics('post-1');
      expect(metrics[0].pageViews).toBe(100);
      expect(metrics[0].conversions).toBe(3);
    });

    it('should merge Search Console and Analytics data', async () => {
      const scData: SearchConsoleData[] = [
        { postId: 'post-1', date: '2024-01-15', impressions: 1000, clicks: 50, position: 5.2, ctr: 5.0 },
      ];
      const analyticsData: AnalyticsData[] = [
        { postId: 'post-1', date: '2024-01-15', pageViews: 100, timeOnPage: 120, bounceRate: 45, scrollDepth: 75, conversions: 3 },
      ];
      service.setSearchConsoleSource(createMockSearchConsoleSource(scData));
      service.setAnalyticsSource(createMockAnalyticsSource(analyticsData));

      await service.syncData(['post-1'], { from: '2024-01-01', to: '2024-01-31' });

      const metrics = service.getMetrics('post-1');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].impressions).toBe(1000);
      expect(metrics[0].pageViews).toBe(100);
    });

    it('should handle sync errors gracefully', async () => {
      service.setSearchConsoleSource({
        type: 'search_console',
        fetchData: async () => {
          throw new Error('API error');
        },
      });

      const result = await service.syncData(['post-1'], { from: '2024-01-01', to: '2024-01-31' });
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Search Console sync failed');
    });

    it('should reject invalid data source type', () => {
      expect(() => {
        service.setSearchConsoleSource({ type: 'analytics' as 'search_console', fetchData: async () => [] });
      }).toThrow('Invalid data source type');
    });
  });

  // ===========================================================================
  // Performance Reports
  // ===========================================================================

  describe('performance reports', () => {
    beforeEach(() => {
      // Add test metrics
      service.storeMetrics([
        { postId: 'post-1', date: '2024-01-01', impressions: 100, clicks: 10, position: 5, ctr: 10, pageViews: 50, timeOnPage: 100, bounceRate: 40, scrollDepth: 60, conversions: 1 },
        { postId: 'post-1', date: '2024-01-02', impressions: 120, clicks: 15, position: 4, ctr: 12.5, pageViews: 60, timeOnPage: 110, bounceRate: 38, scrollDepth: 65, conversions: 2 },
        { postId: 'post-1', date: '2024-01-03', impressions: 150, clicks: 20, position: 3, ctr: 13.3, pageViews: 70, timeOnPage: 120, bounceRate: 35, scrollDepth: 70, conversions: 3 },
      ]);
    });

    it('should generate performance report', () => {
      const report = service.generateReport('post-1', { from: '2024-01-01', to: '2024-01-03' });

      expect(report.postId).toBe('post-1');
      expect(report.metrics).toHaveLength(3);
      expect(report.summary.totalImpressions).toBe(370);
      expect(report.summary.totalClicks).toBe(45);
    });

    it('should calculate average position', () => {
      const report = service.generateReport('post-1', { from: '2024-01-01', to: '2024-01-03' });
      expect(report.summary.avgPosition).toBe(4); // (5+4+3)/3 = 4
    });

    it('should detect upward trend', () => {
      const report = service.generateReport('post-1', { from: '2024-01-01', to: '2024-01-03' });
      expect(report.summary.trend).toBe('up');
    });

    it('should detect downward trend', () => {
      service.clearAll();
      service.storeMetrics([
        { postId: 'post-1', date: '2024-01-01', impressions: 200, clicks: 30, position: 3, ctr: 15, pageViews: 100, timeOnPage: 150, bounceRate: 30, scrollDepth: 80, conversions: 5 },
        { postId: 'post-1', date: '2024-01-02', impressions: 150, clicks: 20, position: 4, ctr: 13.3, pageViews: 80, timeOnPage: 130, bounceRate: 35, scrollDepth: 70, conversions: 3 },
        { postId: 'post-1', date: '2024-01-03', impressions: 100, clicks: 10, position: 5, ctr: 10, pageViews: 60, timeOnPage: 110, bounceRate: 40, scrollDepth: 60, conversions: 1 },
      ]);

      const report = service.generateReport('post-1', { from: '2024-01-01', to: '2024-01-03' });
      expect(report.summary.trend).toBe('down');
    });

    it('should return empty report for unknown post', () => {
      const report = service.generateReport('unknown', { from: '2024-01-01', to: '2024-01-03' });
      expect(report.metrics).toHaveLength(0);
      expect(report.summary.totalImpressions).toBe(0);
      expect(report.summary.trend).toBe('stable');
    });
  });

  // ===========================================================================
  // Update Triggers
  // ===========================================================================

  describe('update triggers', () => {
    it('should detect traffic decline trigger', () => {
      const currentMetrics: PerformanceMetric[] = [
        { postId: 'post-1', date: '2024-07-01', impressions: 100, clicks: 10, position: 5, ctr: 10, pageViews: 50, timeOnPage: 100, bounceRate: 40, scrollDepth: 60, conversions: 1 },
      ];
      const previousMetrics: PerformanceMetric[] = [
        { postId: 'post-1', date: '2024-01-01', impressions: 200, clicks: 50, position: 3, ctr: 25, pageViews: 150, timeOnPage: 150, bounceRate: 30, scrollDepth: 80, conversions: 5 },
      ];

      const triggers = service.detectUpdateTriggers('post-1', '2024-01-01', currentMetrics, previousMetrics);

      expect(triggers.length).toBeGreaterThan(0);
      const trafficTrigger = triggers.find((t) => t.reason === 'traffic_decline');
      expect(trafficTrigger).toBeDefined();
      expect(trafficTrigger?.severity).toBe('high');
    });

    it('should detect content age trigger', () => {
      // Set publish date 20 months ago (well over 18 threshold)
      const publishDate = new Date();
      publishDate.setFullYear(publishDate.getFullYear() - 2);
      publishDate.setMonth(publishDate.getMonth() + 4); // 20 months ago

      const triggers = service.detectUpdateTriggers('post-1', publishDate.toISOString());

      const ageTrigger = triggers.find((t) => t.reason === 'content_age');
      expect(ageTrigger).toBeDefined();
      expect(ageTrigger?.severity).toBe('high');
    });

    it('should flag post for update manually', () => {
      const trigger = service.flagForUpdate('post-1', 'factual_update', 'Tax law changed', 'high');

      expect(trigger.postId).toBe('post-1');
      expect(trigger.reason).toBe('factual_update');
      expect(trigger.severity).toBe('high');
    });

    it('should get active triggers', () => {
      service.flagForUpdate('post-1', 'user_feedback', 'Users confused', 'medium');
      service.flagForUpdate('post-1', 'keyword_opportunity', 'New keyword found', 'low');

      const triggers = service.getActiveTriggers('post-1');
      expect(triggers).toHaveLength(2);
    });

    it('should clear triggers', () => {
      service.flagForUpdate('post-1', 'user_feedback', 'Users confused', 'medium');
      service.clearTriggers('post-1');

      const triggers = service.getActiveTriggers('post-1');
      expect(triggers).toHaveLength(0);
    });
  });

  // ===========================================================================
  // Version Management
  // ===========================================================================

  describe('version management', () => {
    const mockDraft: ContentDraft = {
      id: 'draft-1',
      keywordId: 'kw-1',
      keyword: 'test keyword',
      title: 'Test Post',
      slug: 'test-post',
      body: 'Test content',
      summary: 'Test summary',
      metaTitle: 'Test Meta Title',
      metaDescription: 'Test description',
      schemaType: 'article',
      language: 'nl',
      contentType: 'long',
      status: 'published',
      generatedAt: '2024-01-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('should create initial version', () => {
      const version = service.createVersion('post-1', mockDraft, 'Initial version', 'author-1');

      expect(version.postId).toBe('post-1');
      expect(version.version).toBe('1.0');
      expect(version.majorVersion).toBe(1);
      expect(version.minorVersion).toBe(0);
    });

    it('should increment minor version for text edits', () => {
      service.createVersion('post-1', mockDraft, 'Initial', 'author-1');
      const version = service.createVersion('post-1', { ...mockDraft, body: 'Updated content' }, 'Text edit', 'author-1', false);

      expect(version.version).toBe('1.1');
      expect(version.minorVersion).toBe(1);
    });

    it('should increment major version for structural changes', () => {
      service.createVersion('post-1', mockDraft, 'Initial', 'author-1');
      const version = service.createVersion('post-1', { ...mockDraft, body: 'Restructured' }, 'Major restructure', 'author-1', true);

      expect(version.version).toBe('2.0');
      expect(version.majorVersion).toBe(2);
      expect(version.minorVersion).toBe(0);
    });

    it('should get version history', () => {
      service.createVersion('post-1', mockDraft, 'V1', 'author-1');
      service.createVersion('post-1', mockDraft, 'V1.1', 'author-1');
      service.createVersion('post-1', mockDraft, 'V2', 'author-1', true);

      const history = service.getVersionHistory('post-1');
      expect(history?.versions).toHaveLength(3);
      expect(history?.currentVersion).toBe('2.0');
    });

    it('should get specific version', () => {
      service.createVersion('post-1', mockDraft, 'V1', 'author-1');
      service.createVersion('post-1', { ...mockDraft, body: 'V1.1 content' }, 'V1.1', 'author-1');

      const version = service.getVersion('post-1', '1.0');
      expect(version?.changes).toBe('V1');
    });

    it('should get current version', () => {
      service.createVersion('post-1', mockDraft, 'V1', 'author-1');
      service.createVersion('post-1', { ...mockDraft, body: 'V1.1 content' }, 'V1.1', 'author-1');

      const current = service.getCurrentVersion('post-1');
      expect(current?.version).toBe('1.1');
      expect(current?.changes).toBe('V1.1');
    });

    it('should rollback to previous version', () => {
      service.createVersion('post-1', mockDraft, 'V1', 'author-1');
      service.createVersion('post-1', { ...mockDraft, body: 'V2 content' }, 'V2', 'author-1', true);

      const rolledBack = service.rollback('post-1', '1.0', 'admin');

      expect(rolledBack?.version).toBe('3.0'); // Major version bump on rollback
      expect(rolledBack?.changes).toContain('Rolled back to version 1.0');
    });

    it('should return null for unknown version rollback', () => {
      service.createVersion('post-1', mockDraft, 'V1', 'author-1');
      const result = service.rollback('post-1', '99.0', 'admin');
      expect(result).toBeNull();
    });

    it('should return null for unknown post history', () => {
      const history = service.getVersionHistory('unknown');
      expect(history).toBeNull();
    });
  });

  // ===========================================================================
  // Review Reports
  // ===========================================================================

  describe('review reports', () => {
    beforeEach(() => {
      // Current period metrics
      service.storeMetrics([
        { postId: 'post-1', date: '2024-02-01', impressions: 200, clicks: 20, position: 4, ctr: 10, pageViews: 100, timeOnPage: 120, bounceRate: 35, scrollDepth: 70, conversions: 3 },
        { postId: 'post-2', date: '2024-02-01', impressions: 50, clicks: 2, position: 15, ctr: 4, pageViews: 20, timeOnPage: 60, bounceRate: 60, scrollDepth: 40, conversions: 0 },
      ]);
      // Previous period metrics
      service.storeMetrics([
        { postId: 'post-1', date: '2024-01-01', impressions: 150, clicks: 15, position: 5, ctr: 10, pageViews: 80, timeOnPage: 100, bounceRate: 40, scrollDepth: 65, conversions: 2 },
        { postId: 'post-2', date: '2024-01-01', impressions: 100, clicks: 10, position: 10, ctr: 10, pageViews: 50, timeOnPage: 90, bounceRate: 45, scrollDepth: 55, conversions: 1 },
      ]);
    });

    it('should generate weekly review report', () => {
      const report = service.generateReviewReport(
        'weekly',
        ['post-1', 'post-2'],
        { from: '2024-02-01', to: '2024-02-07' },
        { from: '2024-01-25', to: '2024-01-31' }
      );

      expect(report.cadence).toBe('weekly');
      expect(report.totalPosts).toBe(2);
      expect(report.postSummaries).toHaveLength(2);
    });

    it('should identify top performers', () => {
      const report = service.generateReviewReport(
        'weekly',
        ['post-1', 'post-2'],
        { from: '2024-02-01', to: '2024-02-07' },
        { from: '2024-01-25', to: '2024-01-31' }
      );

      expect(report.topPerformers[0].postId).toBe('post-1');
    });

    it('should calculate performance summary', () => {
      const report = service.generateReviewReport(
        'monthly',
        ['post-1', 'post-2'],
        { from: '2024-02-01', to: '2024-02-28' },
        { from: '2024-01-01', to: '2024-01-31' }
      );

      const post1Summary = report.postSummaries.find((s) => s.postId === 'post-1');
      expect(post1Summary?.metrics.clicks.total).toBe(20);
      expect(post1Summary?.metrics.clicks.change).toBeGreaterThan(0);
    });

    it('should generate recommendations', () => {
      // Flag a post as needing attention
      service.flagForUpdate('post-2', 'traffic_decline', 'Significant traffic drop', 'high');

      const report = service.generateReviewReport(
        'weekly',
        ['post-1', 'post-2'],
        { from: '2024-02-01', to: '2024-02-07' },
        { from: '2024-01-25', to: '2024-01-31' }
      );

      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    it('should identify underperformers', () => {
      service.flagForUpdate('post-2', 'traffic_decline', 'Traffic declined', 'high');

      const report = service.generateReviewReport(
        'weekly',
        ['post-1', 'post-2'],
        { from: '2024-02-01', to: '2024-02-07' },
        { from: '2024-01-25', to: '2024-01-31' }
      );

      expect(report.underperformers.length).toBeGreaterThan(0);
      expect(report.underperformers[0].postId).toBe('post-2');
    });
  });

  // ===========================================================================
  // Utility Methods
  // ===========================================================================

  describe('utility methods', () => {
    it('should return sync schedule', () => {
      const schedule = service.getSyncSchedule();
      expect(schedule).toBe('0 7 * * *');
    });

    it('should get all post IDs', () => {
      service.storeMetric({
        postId: 'post-1',
        date: '2024-01-01',
        impressions: 100,
        clicks: 10,
        position: 5,
        ctr: 10,
        pageViews: 50,
        timeOnPage: 100,
        bounceRate: 40,
        scrollDepth: 60,
        conversions: 1,
      });
      service.storeMetric({
        postId: 'post-2',
        date: '2024-01-01',
        impressions: 50,
        clicks: 5,
        position: 8,
        ctr: 10,
        pageViews: 25,
        timeOnPage: 80,
        bounceRate: 50,
        scrollDepth: 50,
        conversions: 0,
      });

      const postIds = service.getAllPostIds();
      expect(postIds).toContain('post-1');
      expect(postIds).toContain('post-2');
    });

    it('should clear all data', () => {
      service.storeMetric({
        postId: 'post-1',
        date: '2024-01-01',
        impressions: 100,
        clicks: 10,
        position: 5,
        ctr: 10,
        pageViews: 50,
        timeOnPage: 100,
        bounceRate: 40,
        scrollDepth: 60,
        conversions: 1,
      });

      service.clearAll();

      expect(service.getAllPostIds()).toHaveLength(0);
    });
  });

  // ===========================================================================
  // Factory Function
  // ===========================================================================

  describe('factory function', () => {
    it('should create performance monitoring service', () => {
      const service = createPerformanceMonitoring();
      expect(service).toBeInstanceOf(PerformanceMonitoringService);
    });
  });
});
