import type { Subject } from '@/types';
import type { DbQuestion } from '@/lib/db';
import { splitRow, opt, req, type RowError, type ParseResult } from '@/lib/csv-tokenizer';
import { ALL_SUBJECT_IDS } from '@/lib/subjects';
import { buildIdx } from '@/lib/csv-headers';

export type { RowError, ParseResult } from '@/lib/csv-tokenizer';

const SUBJECTS: Subject[] = ALL_SUBJECT_IDS;
const VALID_DIFFICULTY = new Set(['1', '2', '3', '4']);
const VALID_OPTION_ID = new Set(['A', 'B', 'C', 'D']);
const VALID_STATUS = new Set(['draft', 'published']);

export function parseAndValidateCsv(
  csvText: string,
  existingIds: Set<string>,
): ParseResult {
  const lines = csvText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));

  if (lines.length < 2) return { valid: [], errors: [] };

  const idx = buildIdx(splitRow(lines[0]));

  function col(cols: string[], key: string): string {
    const i = idx.get(key);
    return i !== undefined ? (cols[i] ?? '') : '';
  }

  const errors: RowError[] = [];
  const valid: DbQuestion[] = [];
  const batchIds = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const row = i + 1;
    const cols = splitRow(lines[i]);
    const rowErrors: RowError[] = [];

    const rawSubject = col(cols, 'subject');
    const rawDifficulty = col(cols, 'difficulty');
    const rawXp = col(cols, 'xpReward');
    const rawQuestion = col(cols, 'question');
    const rawOptA = col(cols, 'optionA');
    const rawOptB = col(cols, 'optionB');
    const rawOptC = col(cols, 'optionC');
    const rawOptD = col(cols, 'optionD');
    const rawCorrect = col(cols, 'correctOptionId');
    const rawExplanation = col(cols, 'explanation');
    const rawImageUrl = col(cols, 'imageUrl');

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

    // id: use from CSV if present, otherwise auto-generate
    const rawId = col(cols, 'id').trim();
    const id = rawId || `${rawSubject.trim() || 'q'}-${i}`;

    if (!/^[a-z0-9-]+$/.test(id)) {
      rowErrors.push({ row, column: 'id', message: 'Format invalide (a-z, 0-9, tiret uniquement).' });
    } else if (batchIds.has(id)) {
      rowErrors.push({ row, column: 'id', message: 'ID dupliqué dans le batch.' });
    } else if (existingIds.has(id)) {
      rowErrors.push({ row, column: 'id', message: 'ID déjà existant dans la base.' });
    } else {
      batchIds.add(id);
    }

    if (subject && !SUBJECTS.includes(subject as Subject)) {
      rowErrors.push({ row, column: 'subject', message: `Matière inconnue : "${subject}". Valides : ${SUBJECTS.join(', ')}` });
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

    const status = col(cols, 'status').trim().toLowerCase() || 'published';
    if (!VALID_STATUS.has(status)) {
      rowErrors.push({ row, column: 'status', message: 'Doit être draft ou published.' });
    }

    if (rawImageUrl.trim()) {
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
      id,
      subject: subject!,
      category: opt(col(cols, 'category')),
      difficulty: parseInt(difficulty!, 10),
      xp_reward: xpReward,
      emoji: opt(col(cols, 'emoji')),
      image_url: opt(rawImageUrl),
      question: question!,
      question_assisted: opt(col(cols, 'questionAssisted')),
      option_a: optA!,
      option_b: optB!,
      option_c: optC!,
      option_d: optD!,
      option_a_assisted: opt(col(cols, 'optionAAssisted')),
      option_b_assisted: opt(col(cols, 'optionBAssisted')),
      option_c_assisted: opt(col(cols, 'optionCAssisted')),
      option_d_assisted: opt(col(cols, 'optionDAssisted')),
      correct_option_id: correct!,
      explanation: explanation!,
      explanation_assisted: opt(col(cols, 'explanationAssisted')),
      skill_id: opt(col(cols, 'skillId')),
      status: status as DbQuestion['status'],
      hint: opt(col(cols, 'hint')),
    });
  }

  return { valid, errors };
}
