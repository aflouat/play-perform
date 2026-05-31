import { test, expect } from '@playwright/test';

test.describe('Parcours quiz', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
  });

  test('navigue vers la page quiz mathématiques', async ({ page }) => {
    await page.getByText('Mathématiques').click();
    await expect(page).toHaveURL('/quiz/maths');
    await expect(page.getByText('Mathématiques')).toBeVisible();
  });

  test('affiche une question avec 4 options', async ({ page }) => {
    await page.goto('/quiz/maths');
    await expect(page.getByText('Question 1 / 4')).toBeVisible();

    const optionButtons = page.getByRole('button').filter({ hasText: /^[A-D]\. / });
    expect(await optionButtons.count()).toBe(4);
  });

  test('répondre à une question révèle la correction', async ({ page }) => {
    await page.goto('/quiz/maths');
    const options = page.getByRole('button').filter({ hasText: /^[A-D]\. / });
    await options.first().click();
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('le score XP est affiché pendant le quiz', async ({ page }) => {
    await page.goto('/quiz/maths');
    await expect(page.getByText('Niv.1')).toBeVisible();
  });

  test('bouton retour navigue vers l\'accueil', async ({ page }) => {
    await page.goto('/quiz/maths');
    await page.getByText('← Retour').click();
    await expect(page).toHaveURL('/');
  });

  test('une matière invalide affiche un message d\'erreur', async ({ page }) => {
    await page.goto('/quiz/invalid-subject');
    await expect(page.getByText(/Matière introuvable/)).toBeVisible();
  });

  test('le bouton audio est visible sur les questions', async ({ page }) => {
    await page.goto('/quiz/maths');
    await expect(page.getByRole('button', { name: /Lire la question/i })).toBeVisible();
  });

  test('la barre de progression avance après chaque question', async ({ page }) => {
    await page.goto('/quiz/maths');

    const getProgress = async () => {
      const bar = page.locator('.bg-sky-500.rounded-full.transition-all');
      const style = await bar.getAttribute('style');
      return style;
    };

    const initialProgress = await getProgress();

    const options = page.getByRole('button').filter({ hasText: /^[A-D]\. / });
    await options.first().click();
    await page.waitForTimeout(1400);

    const newProgress = await getProgress();
    expect(newProgress).not.toBe(initialProgress);
  });
});
