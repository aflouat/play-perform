#!/usr/bin/env node
/**
 * Insère une release note dans Supabase après un déploiement.
 * Usage: npm run release -- --title "Titre" --changes "A,B,C" [--summary "..."] [--tags "feature,fix"] [--version 0.2.0]
 *
 * Requiert NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local
 * Utiliser : node --env-file=.env.local scripts/create-release.mjs (via npm run release)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Parse CLI args
const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}

// Read version from package.json
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const version = getArg('version') ?? pkg.version;
const title = getArg('title');
const summary = getArg('summary') ?? null;
const changesRaw = getArg('changes');
const tagsRaw = getArg('tags') ?? '';
const deployedBy = getArg('by') ?? process.env.USER ?? 'script';

if (!title || !changesRaw) {
  console.error('Usage: npm run release -- --title "Titre" --changes "A,B,C" [--summary "..."] [--tags "feature,fix"]');
  process.exit(1);
}

const changes = changesRaw.split(',').map((c) => c.trim()).filter(Boolean);
const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : [];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('❌  NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local');
  process.exit(1);
}

const db = createClient(url, key);

const note = {
  version,
  title,
  summary,
  changes,
  tags,
  deployed_by: deployedBy,
  deployed_at: new Date().toISOString(),
};

console.log(`📦  Release v${version} — ${title}`);
console.log(`📝  ${changes.length} changement(s) : ${changes.join(', ')}`);

const { error } = await db.from('release_notes').insert(note);

if (error) {
  console.error('❌  Erreur Supabase :', error.message);
  process.exit(1);
}

console.log(`✅  Release note insérée avec succès (visible sur /releases)`);
