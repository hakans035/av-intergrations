// App identification
export const APP_NAME = 'AV Calculators'
export const APP_VERSION = '1.0.0'
export const MESSAGE_SOURCE = 'av-calculator'
export const MESSAGE_VERSION = '1.0'

// iFrame settings
export const IFRAME_PADDING_BUFFER = 20
export const RESIZE_DEBOUNCE_MS = 100
export const PING_INTERVAL_MS = 30000
export const PING_TIMEOUT_MS = 5000

// Performance budgets
export const MAX_CALCULATOR_BUNDLE_KB = 50
export const MAX_RETRY_ATTEMPTS = 3

// Validation limits
export const SLUG_MIN_LENGTH = 3
export const SLUG_MAX_LENGTH = 50

// Default values
export const DEFAULT_LOCALE = 'en-US'
export const DEFAULT_CURRENCY = 'USD'

// Security
export const RESERVED_SLUGS = [
  'api',
  'admin',
  'new',
  'edit',
  'delete',
  'settings',
  'dashboard',
]

// Categories
export const CALCULATOR_CATEGORIES = [
  { slug: 'loans', name: 'Loans & Mortgages' },
  { slug: 'investments', name: 'Investments' },
  { slug: 'savings', name: 'Savings' },
  { slug: 'retirement', name: 'Retirement' },
  { slug: 'real-estate', name: 'Real Estate' },
  { slug: 'business', name: 'Business' },
  { slug: 'other', name: 'Other' },
] as const
