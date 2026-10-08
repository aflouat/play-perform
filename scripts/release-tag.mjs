#!/usr/bin/env node
/**
 * Creates a git release: semantic version x.y.z, release notes, CHANGELOG.md, commit and annotated tag.
 *
 * Usage: npm run release:tag -- <patch|minor|major|x.y.z> [--dry-run] [--push] [--github]
 *   --dry-run  print the next version and the notes, change nothing
 *   --push     push the release commit and the tag to origin
 *   --github   also create a GitHub Release (requires the `gh` CLI)
 *   --no-db    do not insert the release note into the Supabase `release_notes` table
 *
 * The release note shown on /releases is persisted twice: in src/lib/release-notes-generated.json
 * (committed with the release, used as fallback) and in Supabase when NEXT_PUBLIC_SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY are set (environment or .env.local).
 *
 * Notes are built from the commits since the previous tag (vX.Y.Z), grouped by
 * Conventional Commit type (feat, fix, …).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
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

const GENERATED_NOTES = 'src/lib/release-notes-generated.json';

/** Release note in the shape of the `release_notes` table / the /releases page. */
export function buildReleaseNote(version, commits, deployedAt = new Date().toISOString()) {
  const features = commits.filter((c) => c.type === 'feat');
  const tags = [...new Set(commits.map((c) => c.type).filter((t) => t !== 'other'))];
  return {
    id: `generated-v${version}`,
    version,
    deployed_at: deployedAt,
    title: `Version ${version}`,
    summary: `${features.length} nouveauté(s), ${commits.filter((c) => c.type === 'fix').length} correction(s)${features.length > 0 ? ` — dont : ${features.slice(0, 3).map((c) => c.text).join(' ; ')}` : ''}.`,
    changes: commits.length > 0 ? commits.map((c) => `${c.type !== 'other' ? `${c.type} : ` : ''}${c.text}`) : ['Aucun changement notable'],
    tags,
    deployed_by: process.env.USER ?? 'release:tag',
  };
}

function persistNoteFile(note) {
  const previous = existsSync(GENERATED_NOTES) ? JSON.parse(readFileSync(GENERATED_NOTES, 'utf8')) : [];
  mkdirSync(path.dirname(GENERATED_NOTES), { recursive: true });
  writeFileSync(GENERATED_NOTES, JSON.stringify([note, ...previous.filter((n) => n.version !== note.version)], null, 2) + '\n');
}

function syncReadmeVersion(version) {
  if (!existsSync('README.md')) return;
  const lines = readFileSync('README.md', 'utf8').split('\n');
  lines[0] = lines[0].replace(/v\d+\.\d+\.\d+/, `v${version}`);
  writeFileSync('README.md', lines.join('\n'));
}

async function insertIntoDatabase(note) {
  try { process.loadEnvFile('.env.local'); } catch { /* no .env.local: rely on the environment */ }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return console.warn('⚠ Note non insérée en base (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY absents). Elle reste dans le fichier généré.');
  const { id: _id, ...row } = note;
  try {
    const res = await fetch(`${url}/rest/v1/release_notes`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(row),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
    console.log('✓ Release note insérée en base (visible sur /releases)');
  } catch (error) {
    console.warn(`⚠ Release note non insérée en base : ${error.message}`);
  }
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
const commits = collectCommits(lastTag);
const notes = buildNotes(version, commits);
console.log(`📦 ${current} → ${tag}${lastTag ? ` (changements depuis ${lastTag})` : ''}\n\n${notes}`);
if (flags.has('--dry-run')) { console.log('(dry-run : rien n’a été modifié)'); process.exit(0); }

bumpJsonVersion('package.json', version);
bumpJsonVersion('package-lock.json', version);
prependChangelog(notes);
const releaseNote = buildReleaseNote(version, commits);
persistNoteFile(releaseNote);
syncReadmeVersion(version);
git('add', 'package.json', 'CHANGELOG.md', GENERATED_NOTES,
  ...['package-lock.json', 'README.md'].filter((f) => existsSync(f)));
git('commit', '-q', '-m', `chore(release): ${tag}`);
const notesFile = path.join(mkdtempSync(path.join(tmpdir(), 'release-')), 'notes.md');
writeFileSync(notesFile, notes);
git('tag', '-a', tag, '-F', notesFile);
console.log(`✓ Commit « chore(release): ${tag} » et tag ${tag} créés`);

if (!flags.has('--no-db')) await insertIntoDatabase(releaseNote);

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
