# Calculators Integration

An embeddable calculator platform for Ambition Valley. This integration provides financial calculators that can be embedded via iFrame with auto-resize support.

## Features

- Multiple calculator types (savings, pension, investments)
- iFrame embedding with auto-resize
- URL-based theming customization
- Report generation via email
- Two-panel UI (inputs left, results right)
- Mobile-responsive design
- Calculator registry for dynamic loading

## Structure

```
calculators/
├── calculators/
│   ├── sparen-vs-beleggen/   # Savings vs Investing calculator
│   │   ├── config.ts         # Calculator metadata
│   │   ├── types.ts          # Input/output types
│   │   ├── logic.ts          # Calculation functions
│   │   ├── validation.ts     # Zod validation schemas
│   │   ├── ui.tsx            # Calculator UI component
│   │   └── index.ts          # Module exports
│   ├── pensioenbeleggen/     # Pension investing calculator
│   │   └── ...
│   └── index.ts              # Calculator registration
├── components/
│   ├── ui/
│   │   ├── Input.tsx         # Text input component
│   │   ├── Slider.tsx        # Range slider component
│   │   └── index.ts
│   ├── CalculatorClient.tsx  # Dynamic calculator loader
│   ├── CalculatorShell.tsx   # Calculator wrapper with header
│   ├── CalculatorError.tsx   # Error display component
│   ├── CalculatorLoading.tsx # Loading skeleton
│   └── ReportModal.tsx       # Email report modal
├── config/
│   └── calculators.ts        # Enable/disable calculators
├── lib/
│   ├── registry.ts           # Calculator registry (singleton)
│   ├── registry-types.ts     # Registry type definitions
│   ├── utils.ts              # formatCurrency, cn helper
│   ├── constants.ts          # App constants
│   └── iframe/
│       ├── messenger.ts      # iFrame postMessage API
│       ├── resizer.ts        # Auto-resize observer
│       └── index.ts
├── types/
│   ├── calculator.ts         # Calculator type definitions
│   └── iframe.ts             # iFrame message types
└── index.ts                  # Public exports
```

## Usage

### App Routes

Calculators are available at:
- `/calculators` - Redirects to first enabled calculator
- `/calculators/[slug]` - Individual calculator pages

### iFrame Embedding

```html
<iframe
  src="https://your-domain.com/calculators/sparen-vs-beleggen"
  width="100%"
  height="600"
  frameborder="0"
></iframe>
```

### URL Theming

Customize colors via URL parameters:
```
/calculators/sparen-vs-beleggen?bg=ffffff&accent=307cf1&text=333333
```

## Available Calculators

| Slug | Name | Status |
|------|------|--------|
| `sparen-vs-beleggen` | Sparen vs Beleggen | Active |
| `pensioenbeleggen` | Pensioenbeleggen | Active |
| `vastgoedbelegging` | Vastgoedbelegging | Disabled |

## Configuration

Enable/disable calculators in `config/calculators.ts`:

```typescript
export const CALCULATOR_CONFIG = {
  'sparen-vs-beleggen': { enabled: true, order: 1 },
  'pensioenbeleggen': { enabled: true, order: 2 },
  'vastgoedbelegging': { enabled: false, order: 3 },
} as const;
```

## Adding a New Calculator

1. Create folder in `calculators/[slug]/`
2. Add required files: `config.ts`, `types.ts`, `logic.ts`, `ui.tsx`, `index.ts`
3. Register in `calculators/index.ts`
4. Enable in `config/calculators.ts`

## Types

```typescript
interface CalculatorConfig {
  slug: string;
  name: string;
  description: string;
  version: string;
  status: 'active' | 'beta' | 'disabled';
  category: string;
  defaults: Record<string, unknown>;
}

interface CalculatorUIProps<TInput, TResult> {
  config: CalculatorConfig;
  defaults: TInput;
  onCalculate: (input: TInput) => TResult;
}
```

## iFrame Communication

The calculator sends messages to parent windows:

| Message | Description |
|---------|-------------|
| `READY` | Calculator loaded and ready |
| `RESIZE` | Content height changed |
| `ERROR` | Error occurred |
| `RESULT` | Calculation completed |
