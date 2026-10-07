/**
 * @jest-environment node
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const SCRIPT = path.join(process.cwd(), 'scripts/release-tag.mjs');
let repo: string;

const git = (...args: string[]) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim();
const commit = (message: string) => {
  writeFileSync(path.join(repo, `${Date.now()}-${Math.random()}.txt`), message);
  git('add', '.');
  git('commit', '-q', '-m', message);
};
const release = (...args: string[]) => spawnSync(process.execPath, [SCRIPT, ...args], { cwd: repo, encoding: 'utf8' });
const pkgVersion = () => (JSON.parse(readFileSync(path.join(repo, 'package.json'), 'utf8')) as { version: string }).version;

beforeEach(() => {
  repo = mkdtempSync(path.join(tmpdir(), 'release-test-'));
  git('init', '-q', '-b', 'main');
  git('config', 'user.email', 'test@example.com');
  git('config', 'user.name', 'Test');
  writeFileSync(path.join(repo, 'package.json'), JSON.stringify({ name: 'demo', version: '0.1.0' }, null, 2) + '\n');
  writeFileSync(path.join(repo, 'package-lock.json'),
    JSON.stringify({ name: 'demo', version: '0.1.0', packages: { '': { name: 'demo', version: '0.1.0' } } }, null, 2) + '\n');
  git('add', '.');
  git('commit', '-q', '-m', 'chore: init');
});
afterEach(() => rmSync(repo, { recursive: true, force: true }));

describe('release-tag', () => {
  it('dry-run prints the next version and grouped notes without changing anything', () => {
    commit('feat(landing): page d’accueil visiteur');
    commit('fix: lien cassé');
    const result = release('minor', '--dry-run');
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('v0.2.0');
    expect(result.stdout).toMatch(/Nouveautés[\s\S]*page d’accueil visiteur/);
    expect(result.stdout).toMatch(/Corrections[\s\S]*lien cassé/);
    expect(pkgVersion()).toBe('0.1.0');
    expect(git('tag')).toBe('');
  });

  it('bumps the version, writes the changelog, commits and creates an annotated tag', () => {
    commit('fix: correction');
    const result = release('patch');
    expect(result.status).toBe(0);
    expect(pkgVersion()).toBe('0.1.1');
    const lock = JSON.parse(readFileSync(path.join(repo, 'package-lock.json'), 'utf8')) as { version: string; packages: Record<string, { version: string }> };
    expect([lock.version, lock.packages[''].version]).toEqual(['0.1.1', '0.1.1']);
    expect(readFileSync(path.join(repo, 'CHANGELOG.md'), 'utf8')).toMatch(/## v0\.1\.1[\s\S]*correction/);
    expect(git('tag')).toBe('v0.1.1');
    expect(git('cat-file', '-t', 'v0.1.1')).toBe('tag');
    expect(git('log', '-1', '--pretty=%s')).toBe('chore(release): v0.1.1');
  });

  it('only lists commits since the previous tag', () => {
    commit('feat: première');
    release('minor');
    commit('feat: seconde');
    const result = release('minor', '--dry-run');
    expect(result.stdout).toContain('v0.3.0');
    expect(result.stdout).toContain('seconde');
    expect(result.stdout).not.toContain('première');
    expect(result.stdout).not.toContain('chore(release)');
  });

  it('accepts an explicit x.y.z version greater than the current one', () => {
    commit('feat: x');
    expect(release('1.0.0').status).toBe(0);
    expect(pkgVersion()).toBe('1.0.0');
  });

  it.each([['an invalid argument', ['banana']], ['a lower version', ['0.0.9']], ['no argument', []]])('refuses %s', (_label, args) => {
    const result = release(...args);
    expect(result.stderr).toContain('✗');
    expect(result.status).toBe(1);
    expect(pkgVersion()).toBe('0.1.0');
  });

  it('refuses to release with uncommitted changes', () => {
    writeFileSync(path.join(repo, 'dirty.txt'), 'wip');
    const result = release('patch');
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/pas commit/i);
  });
});
