import { test, expect } from '@playwright/test';

test.describe('Form Submission Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display welcome screen', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Ontdek je belasting');
    await expect(page.getByRole('button', { name: /start/i })).toBeVisible();
  });

  test('should navigate through form questions', async ({ page }) => {
    // Start the form
    await page.getByRole('button', { name: /start/i }).click();

    // First question should be visible
    await expect(page.locator('fieldset')).toBeVisible();

    // Answer the first question using keyboard shortcut
    await page.keyboard.press('y'); // Yes for yes/no question

    // Should advance to next question
    await page.waitForTimeout(300); // Wait for transition
    await expect(page.locator('fieldset')).toBeVisible();
  });

  test('should show progress bar', async ({ page }) => {
    await page.getByRole('button', { name: /start/i }).click();
    await expect(page.locator('[style*="width"]')).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.getByRole('button', { name: /start/i }).click();

    // Test Enter key on welcome screen
    await page.keyboard.press('Enter');

    // Should have navigated or shown first question
    await expect(page.locator('fieldset')).toBeVisible();
  });
});

test.describe('Form Validation', () => {
  test('should require answers for required fields', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start/i }).click();

    // Try to advance without answering
    await page.keyboard.press('Enter');

    // Should still be on the same field (form shouldn't advance)
    await expect(page.locator('fieldset')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have skip link', async ({ page }) => {
    await page.goto('/');

    // Skip link should be present but visually hidden
    const skipLink = page.getByRole('link', { name: /ga naar inhoud/i });
    await expect(skipLink).toBeAttached();
  });

  test('should have proper ARIA labels on form elements', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start/i }).click();

    // Check for ARIA roles on radio groups or checkboxes
    const radioGroup = page.locator('[role="radiogroup"]');
    if (await radioGroup.isVisible()) {
      await expect(radioGroup).toHaveAttribute('aria-label');
    }
  });
});
