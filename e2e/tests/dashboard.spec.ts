import { test, expect } from '@playwright/test';

test.describe('Professor dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login with professor credentials
    await page.goto('/login');
    await page.fill('input[type="email"]', 'prof.demo@uit.ac.ma');
    await page.fill('input[type="password"]', 'Demo!2026');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/professor/, { timeout: 10000 });
  });

  test('renders bottleneck panel', async ({ page }) => {
    await expect(page.getByText(/Concept/i)).toBeVisible({ timeout: 10000 });
  });

  test('renders at-risk student section', async ({ page }) => {
    await expect(page.getByText(/Risque|risque|risk/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Admin dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin.demo@uit.ac.ma');
    await page.fill('input[type="password"]', 'Demo!2026');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 10000 });
  });

  test('renders KPI strip', async ({ page }) => {
    await expect(page.getByText(/étudiants|actifs|Actif/i)).toBeVisible({ timeout: 10000 });
  });
});
