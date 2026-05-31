import type { Subject } from '@/types';
import type { DbQuestion } from '@/lib/db';
import { splitRow, opt, req, type RowError, type ParseResult } from '@/lib/csv-tokenizer';

export type { RowError, ParseResult } from '@/lib/csv-tokenizer';

const SUBJECTS: Subject[] = [
  'maths', 'francais', 'svt', 'histoire', 'physique',
  'it', 'culture', 'espace', 'meteo', 'chimie',
  'mecanique', 'geo', 'anglais', 'espagnol', 'informatique', 'telecom',
];

const VALID_DIFFICULTY = new Set(['1', '2', '3', '4']);
const VALID_OPTION_ID = new Set(['A', 'B', 'C', 'D']);

export function parseAndValidateCsv(
  csvText: string,
  existingIds: Set<string>,
): ParseResult {
  const lines = csvText.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return { valid: [], errors: [] };

  const errors: RowError[] = [];
  const valid: DbQuestion[] = [];
  const batchIds = new Set<string>();

  // Skip header (line 0)
  for (let i = 1; i < lines.length; i++) {
    const row = i + 1; // 1-based for user display
    const cols = splitRow(lines[i]);
    const rowErrors: RowError[] = [];

    const [
      rawId, rawSubject, rawCategory, rawDifficulty, rawXp,
      rawEmoji, rawImageUrl, rawQuestion, rawQuestionAssisted,
      rawOptA, rawOptB, rawOptC, rawOptD,
      rawOptAA, rawOptBA, rawOptCA, rawOptDA,
      rawCorrect, rawExplanation, rawExplanationAssisted,
    ] = cols.map((c) => c ?? '');

    const id = req(rawId, row, 'id', rowErrors);
    const subject = req(rawSubject, row, 'subject', rowErrors);
    const difficulty = req(rawDifficulty, row, 'difficulty', rowErrors);
    const xpRaw = req(rawXp, row, 'xpReward', rowErrors);
    const question = req(rawQuestion, row, 'question', rowErrors);
    const optA = req(rawOptA, row, 'optionA', rowErrors);
    const optB = req(rawOptB, row, 'optionB', rowErrors);
    const optC = req(rawOptC, row, 'optionC', rowErrors);
    const optD = req(rawOptD, row, 'optionD', rowErrors);
    const correct = req(rawCorrect, row, 'correctOptionId', rowErrors);
    const explanation = req(rawExplanation, row, 'explanation', rowErrors);

    if (id) {
      if (!/^[a-z0-9-]+$/.test(id)) {
        rowErrors.push({ row, column: 'id', message: 'Format invalide (a-z, 0-9, tiret uniquement).' });
      } else if (batchIds.has(id)) {
        rowErrors.push({ row, column: 'id', message: 'ID dupliqué dans le batch.' });
      } else if (existingIds.has(id)) {
        rowErrors.push({ row, column: 'id', message: 'ID déjà existant dans la base.' });
      } else {
        batchIds.add(id);
      }
    }

    if (subject && !SUBJECTS.includes(subject as Subject)) {
      rowErrors.push({ row, column: 'subject', message: `Matière inconnue : "${subject}".` });
    }

    if (difficulty && !VALID_DIFFICULTY.has(difficulty)) {
      rowErrors.push({ row, column: 'difficulty', message: 'Doit être 1, 2, 3 ou 4.' });
    }

    const xpReward = xpRaw ? parseInt(xpRaw, 10) : NaN;
    if (xpRaw && (isNaN(xpReward) || xpReward <= 0)) {
      rowErrors.push({ row, column: 'xpReward', message: 'Doit être un entier positif.' });
    }

    if (correct && !VALID_OPTION_ID.has(correct)) {
      rowErrors.push({ row, column: 'correctOptionId', message: 'Doit être A, B, C ou D.' });
    }

    if (rawImageUrl?.trim() && rawImageUrl.trim() !== '') {
      const img = rawImageUrl.trim();
      if (!img.startsWith('/') && !/^https?:\/\//.test(img)) {
        rowErrors.push({ row, column: 'imageUrl', message: 'Doit commencer par / ou être une URL absolue.' });
      }
    }

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
      continue;
    }

    valid.push({
      id: id!,
      subject: subject!,
      category: opt(rawCategory),
      difficulty: parseInt(difficulty!, 10),
      xp_reward: xpReward,
      emoji: opt(rawEmoji),
      image_url: opt(rawImageUrl),
      question: question!,
      question_assisted: opt(rawQuestionAssisted),
      option_a: optA!,
      option_b: optB!,
      option_c: optC!,
      option_d: optD!,
      option_a_assisted: opt(rawOptAA),
      option_b_assisted: opt(rawOptBA),
      option_c_assisted: opt(rawOptCA),
      option_d_assisted: opt(rawOptDA),
      correct_option_id: correct!,
      explanation: explanation!,
      explanation_assisted: opt(rawExplanationAssisted),
    });
  }

  return { valid, errors };
}
