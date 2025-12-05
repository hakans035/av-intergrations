import { z } from 'zod';

/**
 * Validation schemas for form inputs
 * Using Zod for runtime type safety and validation
 */

// Name validation - allows letters, spaces, hyphens, apostrophes
export const nameSchema = z
  .string()
  .min(2, 'Naam moet minimaal 2 karakters bevatten')
  .max(100, 'Naam mag maximaal 100 karakters bevatten')
  .regex(
    /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð\s'-]+$/,
    'Naam bevat ongeldige tekens'
  );

// Email validation
export const emailSchema = z
  .string()
  .email('Voer een geldig e-mailadres in')
  .max(254, 'E-mailadres is te lang');

// Dutch phone number validation
// Supports: +31, 0031, 06, etc.
export const phoneSchema = z
  .string()
  .regex(
    /^(\+31|0031|0)[1-9][0-9]{8,9}$/,
    'Voer een geldig Nederlands telefoonnummer in'
  )
  .transform((val) => {
    // Normalize to +31 format
    const cleaned = val.replace(/[\s\-()]/g, '');
    if (cleaned.startsWith('0031')) {
      return '+31' + cleaned.slice(4);
    }
    if (cleaned.startsWith('0')) {
      return '+31' + cleaned.slice(1);
    }
    return cleaned;
  });

// More lenient phone validation for international numbers
export const phoneSchemaLenient = z
  .string()
  .min(10, 'Telefoonnummer is te kort')
  .max(15, 'Telefoonnummer is te lang')
  .regex(/^[+]?[0-9\s\-()]+$/, 'Voer een geldig telefoonnummer in');

// Yes/No field validation
export const yesNoSchema = z.enum(['yes', 'no'], {
  message: 'Selecteer ja of nee',
});

// Multiple choice validation (single selection)
export const choiceSchema = z.string().min(1, 'Selecteer een optie');

// Multiple choice validation (multiple selections)
export const multipleChoiceSchema = z
  .array(z.string())
  .min(1, 'Selecteer minimaal één optie');

// Text input validation
export const shortTextSchema = z
  .string()
  .min(1, 'Dit veld is verplicht')
  .max(500, 'Tekst mag maximaal 500 karakters bevatten');

// Long text validation
export const longTextSchema = z
  .string()
  .min(1, 'Dit veld is verplicht')
  .max(5000, 'Tekst mag maximaal 5000 karakters bevatten');

// URL validation
export const urlSchema = z
  .string()
  .url('Voer een geldige URL in')
  .max(2048, 'URL is te lang');

// Form submission schema
export const formSubmissionSchema = z.object({
  formId: z.string().min(1),
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string()), z.boolean()])),
  sessionId: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

// Contact info extraction schema
export const contactInfoSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchemaLenient.optional(),
});

// API response schema
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional(),
  errors: z.array(z.object({
    field: z.string(),
    message: z.string(),
  })).optional(),
});

// Type exports
export type FormSubmission = z.infer<typeof formSubmissionSchema>;
export type ContactInfo = z.infer<typeof contactInfoSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;

// Validation helper functions
export function validateField(
  type: 'email' | 'phone' | 'name' | 'short_text' | 'long_text' | 'yes_no' | 'choice',
  value: unknown
): { success: boolean; error?: string } {
  const schemas: Record<string, z.ZodSchema> = {
    email: emailSchema,
    phone: phoneSchemaLenient,
    name: nameSchema,
    short_text: shortTextSchema,
    long_text: longTextSchema,
    yes_no: yesNoSchema,
    choice: choiceSchema,
  };

  const schema = schemas[type];
  if (!schema) {
    return { success: true };
  }

  const result = schema.safeParse(value);
  if (result.success) {
    return { success: true };
  }

  return {
    success: false,
    error: result.error.issues[0]?.message || 'Ongeldige invoer',
  };
}

// Sanitize string input
export function sanitizeInput(value: string): string {
  return value
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 10000); // Max length protection
}
