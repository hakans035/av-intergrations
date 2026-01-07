/**
 * Compliance Checker Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ComplianceCheckerService,
  createComplianceChecker,
} from '../../src/integrations/seo-engine/lib/compliance-checker';
import { POST_DISCLAIMER } from '../../src/integrations/seo-engine/constants';

describe('ComplianceCheckerService', () => {
  let checker: ComplianceCheckerService;

  beforeEach(() => {
    checker = createComplianceChecker();
  });

  describe('checkContent', () => {
    it('should pass compliant content', () => {
      const content = `
        <p>Dit artikel gaat over belastingadvies voor ondernemers.</p>
        <h2>Wat is belastingadvies?</h2>
        <p>Belastingadvies helpt u om uw fiscale situatie te begrijpen, volgens de huidige regelgeving.</p>
        <p><em>${POST_DISCLAIMER.nl}</em></p>
      `;

      const result = checker.checkContent(content, { language: 'nl' });

      expect(result.passed).toBe(true);
      expect(result.violations.filter((v) => v.severity === 'error')).toHaveLength(0);
    });

    it('should detect missing disclaimer', () => {
      const content = `
        <p>Dit artikel gaat over belastingadvies.</p>
        <h2>Belangrijk</h2>
        <p>Meer informatie hier.</p>
      `;

      const result = checker.checkContent(content, { language: 'nl' });

      expect(result.passed).toBe(false);
      expect(result.violations.some((v) => v.type === 'missing_disclaimer')).toBe(true);
    });
  });

  describe('checkDisclaimer', () => {
    it('should detect Dutch disclaimer', () => {
      const content = `<p>Content here.</p><p><em>${POST_DISCLAIMER.nl}</em></p>`;
      const result = checker.checkDisclaimer(content, 'nl');

      expect(result.violations).toHaveLength(0);
    });

    it('should detect English disclaimer', () => {
      const content = `<p>Content here.</p><p><em>${POST_DISCLAIMER.en}</em></p>`;
      const result = checker.checkDisclaimer(content, 'en');

      expect(result.violations).toHaveLength(0);
    });

    it('should report missing disclaimer', () => {
      const content = '<p>Content without disclaimer.</p>';
      const result = checker.checkDisclaimer(content, 'nl');

      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].type).toBe('missing_disclaimer');
      expect(result.violations[0].severity).toBe('error');
    });
  });

  describe('checkProhibitedClaims', () => {
    describe('guaranteed returns', () => {
      it('should detect Dutch guaranteed returns', () => {
        const content = 'Met onze diensten krijgt u een gegarandeerde besparing van 20%.';
        const result = checker.checkProhibitedClaims(content);

        expect(result.violations.some((v) => v.type === 'guaranteed_returns')).toBe(true);
      });

      it('should detect English guaranteed returns', () => {
        const content = 'We offer guaranteed savings on your taxes.';
        const result = checker.checkProhibitedClaims(content);

        expect(result.violations.some((v) => v.type === 'guaranteed_returns')).toBe(true);
      });
    });

    describe('unqualified promises', () => {
      it('should detect specific savings promises', () => {
        const content = 'U bespaart exact 5000 euro met deze methode.';
        const result = checker.checkProhibitedClaims(content);

        expect(result.violations.some((v) => v.type === 'unqualified_promise')).toBe(true);
      });
    });

    describe('investment advice', () => {
      it('should detect investment recommendations', () => {
        const content = 'Investeer in deze aandelen voor optimaal rendement.';
        const result = checker.checkProhibitedClaims(content);

        expect(result.violations.some((v) => v.type === 'investment_advice')).toBe(true);
      });

      it('should detect English investment advice', () => {
        const content = 'Buy this stock for guaranteed returns.';
        const result = checker.checkProhibitedClaims(content);

        expect(result.violations.some((v) => v.type === 'investment_advice')).toBe(true);
      });
    });

    describe('urgency language', () => {
      it('should detect Dutch urgency', () => {
        const content = 'Nu handelen voordat het te laat is!';
        const result = checker.checkProhibitedClaims(content);

        expect(result.violations.some((v) => v.type === 'urgency_language')).toBe(true);
      });

      it('should detect English urgency', () => {
        const content = 'Act now before this limited time offer expires!';
        const result = checker.checkProhibitedClaims(content);

        expect(result.violations.some((v) => v.type === 'urgency_language')).toBe(true);
      });
    });

    describe('absolute statements', () => {
      it('should detect absolute tax statements', () => {
        const content = 'Deze kosten zijn altijd aftrekbaar.';
        const result = checker.checkProhibitedClaims(content);

        expect(result.violations.some((v) => v.type === 'absolute_statement')).toBe(true);
      });

      it('should detect never pay tax claims', () => {
        const content = 'You will never pay tax on this income.';
        const result = checker.checkProhibitedClaims(content);

        expect(result.violations.some((v) => v.type === 'absolute_statement')).toBe(true);
      });
    });

    describe('superiority claims', () => {
      it('should detect best advisor claims', () => {
        const content = 'Wij zijn de beste adviseur in Nederland.';
        const result = checker.checkProhibitedClaims(content);

        expect(result.violations.some((v) => v.type === 'superiority_claim')).toBe(true);
      });
    });

    describe('speculative content', () => {
      it('should detect cryptocurrency content', () => {
        const content = 'Investeer in Bitcoin voor hoge rendementen.';
        const result = checker.checkProhibitedClaims(content);

        expect(result.violations.some((v) => v.type === 'speculative_content')).toBe(true);
      });

      it('should detect NFT content', () => {
        const content = 'NFTs kunnen een goede investering zijn.';
        const result = checker.checkProhibitedClaims(content);

        expect(result.violations.some((v) => v.type === 'speculative_content')).toBe(true);
      });
    });

    it('should pass clean content', () => {
      const content = `
        Belastingadvies kan u helpen om uw fiscale positie te begrijpen.
        Afhankelijk van uw situatie kunnen bepaalde aftrekposten van toepassing zijn.
        Raadpleeg altijd een adviseur voor persoonlijk advies.
      `;
      const result = checker.checkProhibitedClaims(content);

      const errors = result.violations.filter((v) => v.severity === 'error');
      expect(errors).toHaveLength(0);
    });
  });

  describe('checkTone', () => {
    it('should detect exclamation marks', () => {
      const content = 'Dit is geweldig nieuws! U kunt veel besparen!';
      const result = checker.checkTone(content);

      expect(result.violations.some((v) => v.type === 'exclamation_marks')).toBe(true);
    });

    it('should detect rhetorical questions in headlines', () => {
      const content = '<h2>Wilt u geld besparen?</h2><p>Natuurlijk wilt u dat!</p>';
      const result = checker.checkTone(content);

      expect(result.violations.some((v) => v.type === 'rhetorical_question')).toBe(true);
    });

    it('should detect first-person partnership language', () => {
      const content = 'Wij helpen u met uw belastingaangifte.';
      const result = checker.checkTone(content);

      expect(result.violations.some((v) => v.type === 'first_person_partnership')).toBe(true);
    });

    it('should detect emotional appeals', () => {
      const content = 'Maak je geen zorgen over je belastingen.';
      const result = checker.checkTone(content);

      expect(result.violations.some((v) => v.type === 'emotional_appeal')).toBe(true);
    });

    it('should warn about superlatives', () => {
      const content = 'Dit is de beste manier om belasting te besparen.';
      const result = checker.checkTone(content);

      expect(result.warnings.some((w) => w.includes('superlative'))).toBe(true);
    });

    it('should pass professional tone', () => {
      const content = `
        <h2>Belastingadvies voor ondernemers</h2>
        <p>Dit artikel beschrijft de mogelijkheden voor fiscale optimalisatie.</p>
        <p>Afhankelijk van uw situatie kunnen verschillende regelingen van toepassing zijn.</p>
      `;
      const result = checker.checkTone(content);

      const toneErrors = result.violations.filter(
        (v) => v.type === 'exclamation_marks' || v.type === 'rhetorical_question'
      );
      expect(toneErrors).toHaveLength(0);
    });
  });

  describe('checkRiskControls', () => {
    it('should warn about tax figures without year', () => {
      const content = 'De vrijstelling bedraagt €50.000.';
      const result = checker.checkRiskControls(content, 'nl');

      expect(result.warnings.some((w) => w.includes('jaartal'))).toBe(true);
    });

    it('should pass tax figures with year', () => {
      const content = 'De vrijstelling bedraagt €50.000 in 2024, volgens de Belastingdienst.';
      const result = checker.checkRiskControls(content, 'nl');

      expect(result.warnings.filter((w) => w.includes('jaartal'))).toHaveLength(0);
    });

    it('should warn about missing source reference', () => {
      const content = 'Het tarief is 21% BTW.';
      const result = checker.checkRiskControls(content, 'nl');

      expect(result.warnings.some((w) => w.includes('bronvermelding'))).toBe(true);
    });

    it('should warn about tax statements without qualification', () => {
      const content = 'U moet deze belastingregel volgen.';
      const result = checker.checkRiskControls(content, 'nl');

      expect(result.violations.some((v) => v.type === 'missing_qualification')).toBe(true);
    });

    it('should pass qualified tax statements', () => {
      const content = 'Volgens de huidige regelgeving moet u deze aangifte doen, raadpleeg een adviseur voor uw specifieke situatie.';
      const result = checker.checkRiskControls(content, 'nl');

      expect(result.violations.filter((v) => v.type === 'missing_qualification')).toHaveLength(0);
    });

    it('should warn about optimization without legal clarification', () => {
      const content = 'U kunt belasting besparen door deze methode.';
      const result = checker.checkRiskControls(content, 'nl');

      expect(result.warnings.some((w) => w.includes('wettelijke grenzen'))).toBe(true);
    });

    it('should pass optimization with legal clarification', () => {
      const content = 'U kunt legaal belasting besparen door deze wettelijk toegestane methode.';
      const result = checker.checkRiskControls(content, 'nl');

      expect(result.warnings.filter((w) => w.includes('wettelijke grenzen'))).toHaveLength(0);
    });
  });

  describe('utility methods', () => {
    it('should return correct post disclaimer', () => {
      expect(checker.getPostDisclaimer('nl')).toBe(POST_DISCLAIMER.nl);
      expect(checker.getPostDisclaimer('en')).toBe(POST_DISCLAIMER.en);
    });

    it('should check if content has disclaimer', () => {
      const withDisclaimer = `<p>Content</p><p>${POST_DISCLAIMER.nl}</p>`;
      const withoutDisclaimer = '<p>Content only</p>';

      expect(checker.hasDisclaimer(withDisclaimer, 'nl')).toBe(true);
      expect(checker.hasDisclaimer(withoutDisclaimer, 'nl')).toBe(false);
    });

    it('should add disclaimer if missing', () => {
      const content = '<p>Content without disclaimer</p>';
      const result = checker.ensureDisclaimer(content, 'nl');

      expect(result).toContain(POST_DISCLAIMER.nl);
    });

    it('should not duplicate disclaimer', () => {
      const content = `<p>Content</p><p><em>${POST_DISCLAIMER.nl}</em></p>`;
      const result = checker.ensureDisclaimer(content, 'nl');

      const disclaimerCount = (result.match(/Disclaimer/gi) || []).length;
      expect(disclaimerCount).toBe(1);
    });
  });
});

describe('createComplianceChecker', () => {
  it('should create checker instance', () => {
    const checker = createComplianceChecker();
    expect(checker).toBeInstanceOf(ComplianceCheckerService);
  });
});
