#!/usr/bin/env node
/**
 * Creates a git release: semantic version x.y.z, release notes, CHANGELOG.md, commit and annotated tag.
 *
 * Usage: npm run release:tag -- <patch|minor|major|x.y.z> [--dry-run] [--push] [--github]
 *   --dry-run  print the next version and the notes, change nothing
 *   --push     push the release commit and the tag to origin
 *   --github   also create a GitHub Release (requires the `gh` CLI)
 *
 * Notes are built from the commits since the previous tag (vX.Y.Z), grouped by
 * Conventional Commit type (feat, fix, …).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const SECTIONS = [
  { types: ['feat'], title: '✨ Nouveautés' },
  { types: ['fix'], title: '🐛 Corrections' },
  { types: ['perf', 'refactor'], title: '♻️ Améliorations' },
  { types: ['docs'], title: '📝 Documentation' },
];
const OTHER_TITLE = '🔧 Autres changements';

function fail(message) { console.error(`✗ ${message}`); process.exit(1); }
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const tryGit = (...args) => { try { return git(...args); } catch { return null; } };

const parse = (v) => v.split('.').map(Number);
const isSemver = (v) => /^\d+\.\d+\.\d+$/.test(v);
const compare = (a, b) => { const [x, y] = [parse(a), parse(b)]; for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i]; return 0; };

export function nextVersion(current, bump) {
  const [major, minor, patch] = parse(current);
  if (bump === 'major') return `${major + 1}.0.0`;
  if (bump === 'minor') return `${major}.${minor + 1}.0`;
  if (bump === 'patch') return `${major}.${minor}.${patch + 1}`;
  if (isSemver(bump) && compare(bump, current) > 0) return bump;
  return null;
}

function collectCommits(lastTag) {
  const range = lastTag ? [`${lastTag}..HEAD`] : [];
  const log = git('log', ...range, '--no-merges', '--pretty=format:%h%x09%s');
  return log.split('\n').filter(Boolean).map((line) => {
    const [hash, subject] = line.split('\t');
    const match = subject.match(/^(\w+)(\([^)]*\))?!?:\s*(.+)$/);
    return { hash, type: match ? match[1].toLowerCase() : 'other', text: match ? match[3] : subject, subject };
  }).filter((c) => !c.subject.startsWith('chore(release)'));
}

export function buildNotes(version, commits, date = new Date().toISOString().slice(0, 10)) {
  const lines = [`## v${version} — ${date}`, ''];
  const used = new Set();
  const section = (title, items) => {
    if (items.length === 0) return;
    lines.push(`### ${title}`, ...items.map((c) => `- ${c.text} (${c.hash})`), '');
    items.forEach((c) => used.add(c));
  };
  for (const s of SECTIONS) section(s.title, commits.filter((c) => s.types.includes(c.type)));
  section(OTHER_TITLE, commits.filter((c) => !used.has(c)));
  if (commits.length === 0) lines.push('- Aucun changement notable', '');
  return lines.join('\n');
}

function bumpJsonVersion(file, version) {
  if (!existsSync(file)) return;
  const json = JSON.parse(readFileSync(file, 'utf8'));
  json.version = version;
  if (json.packages?.['']) json.packages[''].version = version;
  writeFileSync(file, JSON.stringify(json, null, 2) + '\n');
}

function prependChangelog(notes) {
  const header = '# Changelog\n\nToutes les versions de Play Perform (générées par `npm run release:tag`).\n\n';
  const previous = existsSync('CHANGELOG.md') ? readFileSync('CHANGELOG.md', 'utf8').replace(header, '') : '';
  writeFileSync('CHANGELOG.md', header + notes + '\n' + previous);
}

// ── main ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const bump = args.find((a) => !a.startsWith('--'));
const flags = new Set(args.filter((a) => a.startsWith('--')));
if (!bump) fail('Précise le type de version : patch, minor, major ou x.y.z');

const current = JSON.parse(readFileSync('package.json', 'utf8')).version;
const version = nextVersion(current, bump);
if (!version) fail(`« ${bump} » invalide : attendu patch, minor, major ou une version x.y.z supérieure à ${current}`);
const tag = `v${version}`;
if (tryGit('rev-parse', '-q', '--verify', `refs/tags/${tag}`)) fail(`Le tag ${tag} existe déjà`);
if (!flags.has('--dry-run') && git('status', '--porcelain') !== '') {
  fail('Des modifications ne sont pas commitées : commite-les avant de créer une release');
}

const lastTag = tryGit('describe', '--tags', '--abbrev=0', '--match', 'v[0-9]*');
const notes = buildNotes(version, collectCommits(lastTag));
console.log(`📦 ${current} → ${tag}${lastTag ? ` (changements depuis ${lastTag})` : ''}\n\n${notes}`);
if (flags.has('--dry-run')) { console.log('(dry-run : rien n’a été modifié)'); process.exit(0); }

bumpJsonVersion('package.json', version);
bumpJsonVersion('package-lock.json', version);
prependChangelog(notes);
git('add', 'package.json', 'CHANGELOG.md', ...(existsSync('package-lock.json') ? ['package-lock.json'] : []));
git('commit', '-q', '-m', `chore(release): ${tag}`);
const notesFile = path.join(mkdtempSync(path.join(tmpdir(), 'release-')), 'notes.md');
writeFileSync(notesFile, notes);
git('tag', '-a', tag, '-F', notesFile);
console.log(`✓ Commit « chore(release): ${tag} » et tag ${tag} créés`);

if (flags.has('--push')) {
  git('push', 'origin', 'HEAD');
  git('push', 'origin', tag);
  console.log(`✓ Poussé sur origin (${tag})`);
}
if (flags.has('--github')) {
  try {
    execFileSync('gh', ['release', 'create', tag, '--title', tag, '--notes-file', notesFile], { stdio: 'inherit' });
  } catch {
    console.warn('⚠ Release GitHub non créée (CLI `gh` absente ou tag non poussé). Le tag git est bien créé.');
  }
}
if (!flags.has('--push')) console.log(`→ Pour publier : git push origin HEAD && git push origin ${tag}`);
