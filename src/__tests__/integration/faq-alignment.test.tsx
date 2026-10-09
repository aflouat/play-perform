import { readFileSync } from 'fs';
import { join } from 'path';
import { render } from '@testing-library/react';
import FaqPage from '@/app/faq/page';
import { AVATARS } from '@/lib/avatars';
import { XP_PER_LEVEL } from '@/lib/score-storage';
import { NAV_SUBJECTS } from '@/lib/subjects';
import { ALL_BADGES } from '@/lib/score-badges';
import { STATIC_RELEASE_NOTES } from '@/lib/release-notes-static';

const root = join(__dirname, '../../..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { version: string };
const readme = readFileSync(join(root, 'README.md'), 'utf8');

function renderFaq(): string {
  process.env.NEXT_PUBLIC_APP_VERSION = pkg.version;
  const { container } = render(<FaqPage />);
  return container.textContent ?? '';
}

describe('FAQ / README / version alignment', () => {
  const faq = renderFaq();

  it('package.json, README title, latest release note and FAQ share the same version', () => {
    expect(readme.split('\n')[0]).toContain(`v${pkg.version}`);
    expect(STATIC_RELEASE_NOTES[0].version).toBe(pkg.version);
    expect(faq).toContain(`v${pkg.version}`);
  });

  it('release notes are in descending order and each lists changes', () => {
    const versions = STATIC_RELEASE_NOTES.map((n) => n.version.split('.').map(Number));
    versions.slice(1).forEach((v, i) => {
      const prev = versions[i];
      expect(prev[0] * 1e6 + prev[1] * 1e3 + prev[2]).toBeGreaterThan(v[0] * 1e6 + v[1] * 1e3 + v[2]);
    });
    STATIC_RELEASE_NOTES.forEach((n) => expect(n.changes.length).toBeGreaterThan(0));
  });

  it('documents the XP needed per rank', () => {
    expect(faq).toContain(`${XP_PER_LEVEL} XP = 1 rang`);
  });

  it('lists every avatar with its unlock threshold', () => {
    AVATARS.forEach((a) => {
      expect(faq).toContain(`${a.name}${a.unlockXp}`);
    });
  });

  it('lists every badge the app can actually unlock', () => {
    const unlockable = ['first-quiz', 'streak-3', 'streak-7', 'perfect-quiz', 'knowledge-seeker'];
    ALL_BADGES.filter((b) => unlockable.includes(b.id)).forEach((b) => expect(faq).toContain(b.name));
  });

  it('announces the real number of subjects', () => {
    expect(faq).toContain(`Les matières (${NAV_SUBJECTS.length})`);
  });

  it('only references routes documented in the README', () => {
    const mentioned = faq.match(/\/(?:home|quiz|mots|keyboard|lecture)\b/g) ?? [];
    expect(mentioned.length).toBeGreaterThan(0);
    mentioned.forEach((route) => expect(readme).toContain(`\`${route}`));
  });

  it('covers the features of the current version (skill levels, pricing, reading)', () => {
    expect(faq).toMatch(/niveau d'avancement.*propre à chaque compétence/);
    expect(faq).toMatch(/1 mois.*1 an.*à vie/);
    expect(faq).toContain('Lecture par syllabes');
    ['code d\'accès', 'fiche du cours', 'validée automatiquement', 'effort quotidien', 'heure du rappel', 'SIREN', 'dépose un dossier', 'Revoir mes réponses', 'défi', 'pseudo', 'médaille', 'binôme', 'Bravo', 'piège classique', 'centre de formation', 'examinateurs'].forEach((t) => expect(faq).toContain(t));
    ['ville des compétences', 'objectif de date', 'château', 'Confidentialité'].forEach((t) => expect(faq).toContain(t));
    ['quiz', 'flashcards', 'évaluation'].forEach((a) => expect(faq).toContain(a));
  });

  it('links only to pages that exist', () => {
    ['/confidentialite', '/competences'].forEach((route) => expect(readme).toContain(`\`${route}`));
  });

  it('is described in the README routes table', () => {
    expect(readme).toContain('| `/faq` |');
  });
});
