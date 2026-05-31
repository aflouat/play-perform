import { test, expect } from '@playwright/test';

test.describe('Sélection d\'avatar', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
  });

  test('affiche la page d\'accueil avec le titre', async ({ page }) => {
    await expect(page.getByText('Bonjour, Omar !')).toBeVisible();
  });

  test('affiche le sélecteur d\'avatar', async ({ page }) => {
    await expect(page.getByText('Choisis ton avatar')).toBeVisible();
  });

  test('affiche au moins 3 avatars disponibles', async ({ page }) => {
    const avatarButtons = page.getByRole('button', { name: /Choisir l'avatar/ });
    const count = await avatarButtons.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('sélectionne un avatar déverrouillé', async ({ page }) => {
    await page.getByRole('button', { name: /Astronaute/ }).first().click();
    await expect(page.getByText('Actif')).toBeVisible();
    await expect(page.getByText('Tu joues en tant que Astronaute')).toBeVisible();
  });

  test('les avatars verrouillés affichent la condition de déverrouillage', async ({ page }) => {
    await expect(page.getByText(/XP requis/)).toBeVisible();
  });

  test('un avatar verrouillé ne peut pas être sélectionné', async ({ page }) => {
    const lockedButton = page.getByRole('button', { name: /Verrouillé/ }).first();
    if (await lockedButton.count() > 0) {
      await lockedButton.click();
      await expect(page.getByText('Actif')).not.toBeVisible();
    }
  });

  test('affiche le score XP', async ({ page }) => {
    await expect(page.getByText('Niveau 1')).toBeVisible();
    await expect(page.getByText('0 XP total')).toBeVisible();
  });

  test('les matières de quiz sont listées', async ({ page }) => {
    await expect(page.getByText('Mathématiques')).toBeVisible();
    await expect(page.getByText('Français')).toBeVisible();
    await expect(page.getByText('SVT')).toBeVisible();
  });
});
