// Form Integration - Public Exports

// Components
export { Form } from './components';

// Data
export { ambitionValleyForm } from './data';

// Types
export type { FormDefinition, FormField, FormAnswers, FormChoice } from './types';

// Note: Hooks (useFormSubmission, useFormAnalytics) should be imported directly
// from '@/integrations/form/hooks' to avoid server/client boundary issues
