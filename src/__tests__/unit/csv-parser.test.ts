import { parseAndValidateCsv } from '@/lib/csv-parser';

const HEADER = 'id,subject,category,difficulty,xpReward,emoji,imageUrl,question,questionAssisted,optionA,optionB,optionC,optionD,optionAAssisted,optionBAssisted,optionCAssisted,optionDAssisted,correctOptionId,explanation,explanationAssisted';

function makeRow(overrides: Partial<Record<string, string>> = {}): string {
  const defaults: Record<string, string> = {
    id: 'test-001',
    subject: 'maths',
    category: 'fractions',
    difficulty: '2',
    xpReward: '15',
    emoji: '➗',
    imageUrl: '',
    question: 'Quel est 3/4 de 200 ?',
    questionAssisted: 'Si tu coupes 200 en 4 parts 3 parts font combien ?',
    optionA: '50',
    optionB: '100',
    optionC: '150',
    optionD: '200',
    optionAAssisted: '',
    optionBAssisted: '',
    optionCAssisted: '150 — trois quarts',
    optionDAssisted: '',
    correctOptionId: 'C',
    explanation: '3/4 de 200 = 150.',
    explanationAssisted: 'Chaque part = 50. Trois parts = 150 !',
  };
  const row = { ...defaults, ...overrides };
  return Object.values(row).join(',');
}

function csv(...rows: string[]): string {
  return [HEADER, ...rows].join('\n');
}

describe('parseAndValidateCsv', () => {
  it('parses a valid complete row without errors', () => {
    const { valid, errors } = parseAndValidateCsv(csv(makeRow()), new Set());
    expect(errors).toHaveLength(0);
    expect(valid).toHaveLength(1);
    expect(valid[0].id).toBe('test-001');
    expect(valid[0].difficulty).toBe(2);
    expect(valid[0].xp_reward).toBe(15);
    expect(valid[0].question_assisted).toBe('Si tu coupes 200 en 4 parts 3 parts font combien ?');
    expect(valid[0].option_c_assisted).toBe('150 — trois quarts');
  });

  it('returns RowError for missing required field "question"', () => {
    const { valid, errors } = parseAndValidateCsv(csv(makeRow({ question: '' })), new Set());
    expect(valid).toHaveLength(0);
    expect(errors.some((e) => e.column === 'question')).toBe(true);
  });

  it('returns RowError for invalid difficulty value "5"', () => {
    const { valid, errors } = parseAndValidateCsv(csv(makeRow({ difficulty: '5' })), new Set());
    expect(valid).toHaveLength(0);
    expect(errors.some((e) => e.column === 'difficulty')).toBe(true);
  });

  it('returns RowError for invalid correctOptionId "E"', () => {
    const { valid, errors } = parseAndValidateCsv(csv(makeRow({ correctOptionId: 'E' })), new Set());
    expect(valid).toHaveLength(0);
    expect(errors.some((e) => e.column === 'correctOptionId')).toBe(true);
  });

  it('returns RowError for ID duplicated within the batch', () => {
    const row = makeRow();
    const { valid, errors } = parseAndValidateCsv(csv(row, row), new Set());
    expect(valid).toHaveLength(1);
    expect(errors.some((e) => e.column === 'id' && /dupliqué/i.test(e.message))).toBe(true);
  });

  it('returns RowError for ID already in existingIds', () => {
    const { valid, errors } = parseAndValidateCsv(csv(makeRow()), new Set(['test-001']));
    expect(valid).toHaveLength(0);
    expect(errors.some((e) => e.column === 'id' && /existant/i.test(e.message))).toBe(true);
  });

  it('treats empty optional fields as null (not empty string)', () => {
    const { valid } = parseAndValidateCsv(csv(makeRow({ imageUrl: '', questionAssisted: '' })), new Set());
    expect(valid[0].image_url).toBeNull();
    expect(valid[0].question_assisted).toBeNull();
  });

  it('returns RowError for unknown subject', () => {
    const { valid, errors } = parseAndValidateCsv(csv(makeRow({ subject: 'magie' })), new Set());
    expect(valid).toHaveLength(0);
    expect(errors.some((e) => e.column === 'subject')).toBe(true);
  });

  it('returns RowError for invalid imageUrl format', () => {
    const { errors } = parseAndValidateCsv(csv(makeRow({ imageUrl: 'not-a-url' })), new Set());
    expect(errors.some((e) => e.column === 'imageUrl')).toBe(true);
  });

  it('accepts imageUrl starting with /', () => {
    const { valid, errors } = parseAndValidateCsv(csv(makeRow({ imageUrl: '/images/test.png' })), new Set());
    expect(errors).toHaveLength(0);
    expect(valid[0].image_url).toBe('/images/test.png');
  });

  it('returns empty result for CSV with only a header line', () => {
    const { valid, errors } = parseAndValidateCsv(HEADER, new Set());
    expect(valid).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });
});
