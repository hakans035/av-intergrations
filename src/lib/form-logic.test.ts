import { describe, it, expect } from 'vitest';
import { evaluateCondition, getNextFieldIndex, interpolateTemplate } from './form-logic';
import { FormDefinition, FormField, LogicCondition, FormAnswers } from './types';

describe('evaluateCondition', () => {
  const mockFields: FormField[] = [
    {
      id: '1',
      ref: 'eigenaar',
      type: 'yes_no',
      title: 'Ben je eigenaar?',
      properties: {},
      validations: { required: true },
    },
    {
      id: '2',
      ref: 'bouwjaar',
      type: 'multiple_choice',
      title: 'Bouwjaar?',
      properties: {
        choices: [
          { id: '1', ref: 'voor_2000', label: 'Voor 2000' },
          { id: '2', ref: 'na_2020', label: 'Na 2020' },
        ],
      },
      validations: { required: true },
    },
  ];

  it('should return true for "always" condition', () => {
    const condition: LogicCondition = { op: 'always', vars: [] };
    expect(evaluateCondition(condition, {}, mockFields)).toBe(true);
  });

  it('should evaluate "is" condition correctly for yes_no field', () => {
    const condition: LogicCondition = {
      op: 'is',
      vars: [
        { type: 'field', value: 'eigenaar' },
        { type: 'choice', value: 'yes' },
      ],
    };

    expect(evaluateCondition(condition, { eigenaar: 'yes' }, mockFields)).toBe(true);
    expect(evaluateCondition(condition, { eigenaar: 'no' }, mockFields)).toBe(false);
  });

  it('should evaluate "is_not" condition correctly', () => {
    const condition: LogicCondition = {
      op: 'is_not',
      vars: [
        { type: 'field', value: 'eigenaar' },
        { type: 'choice', value: 'yes' },
      ],
    };

    expect(evaluateCondition(condition, { eigenaar: 'no' }, mockFields)).toBe(true);
    expect(evaluateCondition(condition, { eigenaar: 'yes' }, mockFields)).toBe(false);
  });

  it('should evaluate "and" condition correctly', () => {
    const condition: LogicCondition = {
      op: 'and',
      vars: [
        {
          op: 'is',
          vars: [
            { type: 'field', value: 'eigenaar' },
            { type: 'choice', value: 'yes' },
          ],
        } as LogicCondition,
      ],
    };

    expect(evaluateCondition(condition, { eigenaar: 'yes' }, mockFields)).toBe(true);
  });

  it('should evaluate "or" condition correctly', () => {
    const condition: LogicCondition = {
      op: 'or',
      vars: [
        {
          op: 'is',
          vars: [
            { type: 'field', value: 'eigenaar' },
            { type: 'choice', value: 'yes' },
          ],
        } as LogicCondition,
        {
          op: 'is',
          vars: [
            { type: 'field', value: 'eigenaar' },
            { type: 'choice', value: 'no' },
          ],
        } as LogicCondition,
      ],
    };

    expect(evaluateCondition(condition, { eigenaar: 'yes' }, mockFields)).toBe(true);
    expect(evaluateCondition(condition, { eigenaar: 'no' }, mockFields)).toBe(true);
  });

  it('should return false for missing field value with "is" condition', () => {
    const condition: LogicCondition = {
      op: 'is',
      vars: [
        { type: 'field', value: 'eigenaar' },
        { type: 'choice', value: 'yes' },
      ],
    };

    expect(evaluateCondition(condition, {}, mockFields)).toBe(false);
  });
});

describe('interpolateTemplate', () => {
  const mockFields: FormField[] = [
    {
      id: '1',
      ref: 'naam',
      type: 'short_text',
      title: 'Naam',
      properties: {},
      validations: { required: true },
    },
    {
      id: '2',
      ref: 'email',
      type: 'email',
      title: 'Email',
      properties: {},
      validations: { required: true },
    },
  ];

  it('should replace field references with values', () => {
    const template = 'Hallo {{field:naam}}, bedankt voor je aanmelding!';
    const answers: FormAnswers = { naam: 'Jan' };

    expect(interpolateTemplate(template, answers, mockFields)).toBe(
      'Hallo Jan, bedankt voor je aanmelding!'
    );
  });

  it('should handle multiple field references', () => {
    const template = 'Naam: {{field:naam}}, Email: {{field:email}}';
    const answers: FormAnswers = { naam: 'Jan', email: 'jan@example.com' };

    expect(interpolateTemplate(template, answers, mockFields)).toBe(
      'Naam: Jan, Email: jan@example.com'
    );
  });

  it('should return empty string for missing field values', () => {
    const template = 'Hallo {{field:naam}}!';
    const answers: FormAnswers = {};

    expect(interpolateTemplate(template, answers, mockFields)).toBe('Hallo !');
  });

  it('should handle array values by joining with comma', () => {
    const template = 'Selecties: {{field:keuzes}}';
    const answers: FormAnswers = { keuzes: ['optie1', 'optie2', 'optie3'] };

    expect(interpolateTemplate(template, answers, mockFields)).toBe(
      'Selecties: optie1, optie2, optie3'
    );
  });

  it('should URL encode values when encodeForUrl is true', () => {
    const template = 'https://example.com?name={{field:naam}}';
    const answers: FormAnswers = { naam: 'Jan de Vries' };

    expect(interpolateTemplate(template, answers, mockFields, true)).toBe(
      'https://example.com?name=Jan%20de%20Vries'
    );
  });
});

describe('getNextFieldIndex', () => {
  const mockForm: FormDefinition = {
    id: 'test-form',
    title: 'Test Form',
    workspace: { href: '' },
    theme: { href: '' },
    settings: {
      language: 'nl',
      progress_bar: 'percentage',
      show_progress_bar: true,
      show_key_hint_on_choices: true,
    },
    welcome_screens: [],
    thankyou_screens: [
      {
        id: 'ty1',
        ref: 'qualified',
        type: 'thankyou_screen',
        title: 'Gefeliciteerd!',
        properties: {},
      },
      {
        id: 'ty2',
        ref: 'disqualified',
        type: 'thankyou_screen',
        title: 'Helaas',
        properties: {},
      },
    ],
    fields: [
      {
        id: '1',
        ref: 'eigenaar',
        type: 'yes_no',
        title: 'Ben je eigenaar?',
        properties: {},
        validations: { required: true },
      },
      {
        id: '2',
        ref: 'bouwjaar',
        type: 'multiple_choice',
        title: 'Bouwjaar?',
        properties: {
          choices: [
            { id: '1', ref: 'voor_2000', label: 'Voor 2000' },
            { id: '2', ref: 'na_2020', label: 'Na 2020' },
          ],
        },
        validations: { required: true },
      },
      {
        id: '3',
        ref: 'naam',
        type: 'short_text',
        title: 'Naam',
        properties: {},
        validations: { required: true },
      },
    ],
    logic: [
      {
        ref: 'eigenaar',
        type: 'field',
        actions: [
          {
            action: 'jump',
            details: {
              to: { type: 'thankyou', value: 'disqualified' },
            },
            condition: {
              op: 'is',
              vars: [
                { type: 'field', value: 'eigenaar' },
                { type: 'choice', value: 'no' },
              ],
            },
          },
        ],
      },
    ],
  };

  it('should return next field index when no logic matches', () => {
    const result = getNextFieldIndex('eigenaar', { eigenaar: 'yes' }, mockForm);
    expect(result).toEqual({ type: 'field', index: 1 });
  });

  it('should jump to thank you screen when logic matches', () => {
    const result = getNextFieldIndex('eigenaar', { eigenaar: 'no' }, mockForm);
    expect(result).toEqual({ type: 'thankyou', index: 1 });
  });

  it('should return default thank you screen at end of form', () => {
    const result = getNextFieldIndex('naam', { naam: 'Test' }, mockForm);
    expect(result).toEqual({ type: 'thankyou', index: 0 });
  });
});
