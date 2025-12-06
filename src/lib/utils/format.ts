/**
 * Utility functions for formatting
 */

/**
 * Format cents to Euro price string
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}
