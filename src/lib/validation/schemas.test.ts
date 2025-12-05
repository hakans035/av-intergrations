import { describe, it, expect } from 'vitest';
import {
  nameSchema,
  emailSchema,
  phoneSchema,
  phoneSchemaLenient,
  yesNoSchema,
  validateField,
  sanitizeInput,
} from './schemas';

describe('nameSchema', () => {
  it('should accept valid names', () => {
    expect(nameSchema.safeParse('Jan').success).toBe(true);
    expect(nameSchema.safeParse('Jan de Vries').success).toBe(true);
    expect(nameSchema.safeParse("Jan-Pieter O'Brien").success).toBe(true);
    expect(nameSchema.safeParse('José García').success).toBe(true);
  });

  it('should reject names that are too short', () => {
    const result = nameSchema.safeParse('J');
    expect(result.success).toBe(false);
  });

  it('should reject names with invalid characters', () => {
    const result = nameSchema.safeParse('Jan123');
    expect(result.success).toBe(false);
  });

  it('should reject names that are too long', () => {
    const longName = 'A'.repeat(101);
    const result = nameSchema.safeParse(longName);
    expect(result.success).toBe(false);
  });
});

describe('emailSchema', () => {
  it('should accept valid emails', () => {
    expect(emailSchema.safeParse('test@example.com').success).toBe(true);
    expect(emailSchema.safeParse('user.name@domain.nl').success).toBe(true);
    expect(emailSchema.safeParse('user+tag@example.org').success).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(emailSchema.safeParse('invalid').success).toBe(false);
    expect(emailSchema.safeParse('missing@').success).toBe(false);
    expect(emailSchema.safeParse('@nodomain.com').success).toBe(false);
    expect(emailSchema.safeParse('spaces in@email.com').success).toBe(false);
  });
});

describe('phoneSchema', () => {
  it('should accept valid Dutch phone numbers', () => {
    expect(phoneSchema.safeParse('+31612345678').success).toBe(true);
    expect(phoneSchema.safeParse('0612345678').success).toBe(true);
    expect(phoneSchema.safeParse('0031612345678').success).toBe(true);
  });

  it('should normalize phone numbers to +31 format', () => {
    const result = phoneSchema.safeParse('0612345678');
    if (result.success) {
      expect(result.data).toBe('+31612345678');
    }
  });

  it('should reject invalid phone numbers', () => {
    expect(phoneSchema.safeParse('123').success).toBe(false);
    expect(phoneSchema.safeParse('abcdefghij').success).toBe(false);
  });
});

describe('phoneSchemaLenient', () => {
  it('should accept international phone numbers', () => {
    expect(phoneSchemaLenient.safeParse('+31612345678').success).toBe(true);
    expect(phoneSchemaLenient.safeParse('+49 123 456789').success).toBe(true);
    expect(phoneSchemaLenient.safeParse('(06) 12-34-56-78').success).toBe(true);
  });

  it('should reject numbers that are too short', () => {
    expect(phoneSchemaLenient.safeParse('12345').success).toBe(false);
  });

  it('should reject numbers with letters', () => {
    expect(phoneSchemaLenient.safeParse('06-ABC-1234').success).toBe(false);
  });
});

describe('yesNoSchema', () => {
  it('should accept yes and no', () => {
    expect(yesNoSchema.safeParse('yes').success).toBe(true);
    expect(yesNoSchema.safeParse('no').success).toBe(true);
  });

  it('should reject other values', () => {
    expect(yesNoSchema.safeParse('maybe').success).toBe(false);
    expect(yesNoSchema.safeParse('').success).toBe(false);
    expect(yesNoSchema.safeParse('YES').success).toBe(false);
  });
});

describe('validateField', () => {
  it('should validate email fields', () => {
    expect(validateField('email', 'test@example.com').success).toBe(true);
    expect(validateField('email', 'invalid').success).toBe(false);
  });

  it('should validate phone fields', () => {
    expect(validateField('phone', '0612345678').success).toBe(true);
    expect(validateField('phone', '123').success).toBe(false);
  });

  it('should validate name fields', () => {
    expect(validateField('name', 'Jan de Vries').success).toBe(true);
    expect(validateField('name', 'J').success).toBe(false);
  });

  it('should return error message on failure', () => {
    const result = validateField('email', 'invalid');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('sanitizeInput', () => {
  it('should trim whitespace', () => {
    expect(sanitizeInput('  test  ')).toBe('test');
  });

  it('should remove HTML-like tags', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
  });

  it('should handle empty strings', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('should truncate very long strings', () => {
    const longString = 'A'.repeat(15000);
    expect(sanitizeInput(longString).length).toBe(10000);
  });
});
