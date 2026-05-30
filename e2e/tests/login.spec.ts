import { test, expect } from '@playwright/test';

test.describe('Login flow', () => {
  test('shows login page with email and password fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Console UIT')).toBeVisible();
    await expect(page.getByPlaceholder('prenom.nom@uit.ac.ma')).toBeVisible();
    await expect(page.getByText('Se connecter')).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'wrong@test.com');
    await page.fill('input[type="password"]', 'wrong');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/Connexion/)).toBeVisible({ timeout: 10000 });
  });

  test('SSO button is visible', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Continuer avec SSO UIT')).toBeVisible();
  });
});
