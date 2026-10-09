import { hash32, seededRandom } from './seed';

export type Group = string[];

const pairKey = (a: string, b: string) => [a, b].sort().join('+');

function shuffled(ids: readonly string[], seed: string): string[] {
  const list = [...ids].sort();
  const random = seededRandom(hash32(seed));
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function split(list: string[]): Group[] {
  const groups: Group[] = [];
  for (let i = 0; i < list.length; i += 2) groups.push(list.slice(i, i + 2));
  if (groups.length > 1 && groups[groups.length - 1].length === 1) groups[groups.length - 2].push(...(groups.pop() as Group)); // odd one out joins a pair: a trio
  return groups;
}

/**
 * Random pairs of the week, the same for everyone who computes them (seeded by `seedKey`, e.g. "centre:week").
 * Tries to avoid partners of the previous week so that everyone works with different people over time.
 */
export function pairsFor(seedKey: string, ids: readonly string[], previous: readonly Group[] = []): Group[] {
  if (ids.length < 2) return [];
  const before = new Set(previous.flatMap((g) => g.flatMap((a, i) => g.slice(i + 1).map((b) => pairKey(a, b)))));
  let best: Group[] = [];
  let bestRepeats = Infinity;
  for (let attempt = 0; attempt < 40 && bestRepeats > 0; attempt++) {
    const groups = split(shuffled(ids, `${seedKey}#${attempt}`));
    const repeats = groups.flatMap((g) => g.flatMap((a, i) => g.slice(i + 1).map((b) => pairKey(a, b)))).filter((k) => before.has(k)).length;
    if (repeats < bestRepeats) { best = groups; bestRepeats = repeats; }
  }
  return best;
}

export const groupOf = (groups: readonly Group[], id: string): Group | null => groups.find((g) => g.includes(id)) ?? null;
