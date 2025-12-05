# Form Integration

A Typeform-compatible form renderer for Ambition Valley. This integration provides a fully styled, multi-step form experience with logic jumps, validation, and submission handling.

## Features

- Multi-step form navigation with progress indicator
- Typeform JSON format compatibility
- Field types: text, email, phone, multiple choice, yes/no, checkbox
- Conditional logic jumps between questions
- Welcome and thank you screens
- Form submission to API endpoint
- Mobile-responsive design
- Keyboard navigation support

## Structure

```
form/
├── components/
│   ├── Form.tsx           # Main form component
│   ├── WelcomeScreen.tsx  # Welcome screen
│   ├── ThankYouScreen.tsx # Thank you screen with social proof
│   ├── TextInput.tsx      # Text/email/phone input
│   ├── TextArea.tsx       # Long text input
│   ├── MultipleChoice.tsx # Multiple choice options
│   ├── YesNo.tsx          # Yes/No toggle
│   ├── Checkbox.tsx       # Checkbox field
│   └── FieldWrapper.tsx   # Field container with animations
├── data/
│   └── ambitionValleyForm.ts  # Form definition JSON
├── hooks/
│   ├── useFormSubmission.ts   # Submission handling hook
│   └── useFormAnalytics.ts    # Analytics tracking hook
├── lib/
│   └── formLogic.ts       # Logic jump evaluation
├── types.ts               # TypeScript definitions
└── index.ts               # Public exports
```

## Usage

```tsx
import { Form, ambitionValleyForm } from '@/integrations/form';

export default function Page() {
  return <Form definition={ambitionValleyForm} />;
}
```

## API Endpoint

Form submissions are sent to `/api/submissions` with the following payload:

```json
{
  "formId": "string",
  "answers": {
    "field_ref": "answer_value"
  },
  "submittedAt": "ISO date string"
}
```

## Types

```typescript
interface FormDefinition {
  id: string;
  title: string;
  settings: FormSettings;
  welcome_screens: WelcomeScreen[];
  thankyou_screens: ThankYouScreen[];
  fields: FormField[];
  logic: Logic[];
}

type FormAnswers = Record<string, string | string[] | boolean>;
```

## Customization

The form uses inline styles with CSS variables for theming. Key colors:
- Primary: `#307cf1` (Blue)
- Background: `#0a1d31` (Dark blue)
- Text: `#ffffff` (White)
