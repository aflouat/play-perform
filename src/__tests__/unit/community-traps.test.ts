import { trapSummary, trapMessage, constructiveFeedback, MIN_SAMPLE } from '@/modules/community';

describe('trapSummary (anonymous statistics of a question)', () => {
  it('needs enough answers before saying anything', () => {
    expect(trapSummary({ A: 3, B: 4, C: 2 }, 'C')).toBeNull();
    expect(MIN_SAMPLE).toBe(10);
  });

  it('gives the share of wrong answers and the most chosen trap', () => {
    const summary = trapSummary({ A: 2, B: 6, C: 10, D: 2 }, 'C');
    expect(summary).toEqual({ sample: 20, correctShare: 50, wrongShare: 50, trap: { optionId: 'B', share: 30 } });
  });

  it('has no trap when everyone answered right or the errors are spread out', () => {
    expect(trapSummary({ A: 0, B: 0, C: 12, D: 0 }, 'C')).toMatchObject({ wrongShare: 0, trap: null });
    expect(trapSummary({ A: 4, B: 4, C: 12, D: 4 }, 'C')?.trap).toBeNull(); // 20 % each: no clear trap
  });
});

describe('messages', () => {
  const trap = { sample: 40, correctShare: 40, wrongShare: 60, trap: { optionId: 'B', share: 45 } };

  it('reassures a learner who fell into the classic trap, without naming anyone', () => {
    const text = trapMessage(trap, 'B', 'C');
    expect(text).toMatch(/45 %/);
    expect(text).toMatch(/piège/i);
    expect(text).not.toMatch(/nul|raté|faux/i);
  });

  it('is calm for other wrong answers, and silent for a right one', () => {
    expect(trapMessage(trap, 'A', 'C')).toMatch(/60 %/);
    expect(trapMessage(trap, 'C', 'C')).toBeNull();
    expect(trapMessage(null, 'A', 'C')).toBeNull();
  });
});

describe('constructiveFeedback (failure is a lesson)', () => {
  it('turns a wrong answer into what was learned', () => {
    const f = constructiveFeedback(false, 'La division se fait avant l’addition.');
    expect(f.title).toMatch(/Presque/);
    expect(f.body).toContain('La division se fait avant l’addition.');
    expect(JSON.stringify(f)).not.toMatch(/Faux|Échec|Raté|nul/i);
  });
  it('congratulates a right answer', () => {
    expect(constructiveFeedback(true, 'x').title).toMatch(/Bravo/);
  });
});

import { rankTraps, type TrapQuestion } from '@/modules/community';

describe('rankTraps (wall of classic mistakes)', () => {
  const q = (id: string): TrapQuestion => ({
    id, question: `Question ${id}`, correctOptionId: 'C', explanation: `Parce que ${id}`,
    options: [{ id: 'A', text: 'a' }, { id: 'B', text: 'b' }, { id: 'C', text: 'c' }, { id: 'D', text: 'd' }],
  });
  const dist = {
    q1: { A: 2, B: 5, C: 10, D: 3 },   // trap B: 25 %
    q2: { A: 0, B: 14, C: 5, D: 1 },   // trap B: 70 %
    q3: { A: 3, B: 3, C: 20, D: 4 },   // no clear trap
    q4: { A: 1, B: 1, C: 1, D: 1 },    // too few answers
  };

  it('keeps the questions with a clear trap, the biggest trap first', () => {
    const ranked = rankTraps([q('q1'), q('q2'), q('q3'), q('q4'), q('q5')], dist);
    expect(ranked.map((r) => r.question.id)).toEqual(['q2', 'q1']);
    expect(ranked[0]).toMatchObject({ trapOptionText: 'b', correctOptionText: 'c' });
    expect(ranked[0].summary.trap?.share).toBe(70);
  });
  it('shows at most the requested number', () => {
    expect(rankTraps([q('q1'), q('q2')], dist, 1)).toHaveLength(1);
  });
  it('is empty without statistics', () => {
    expect(rankTraps([q('q1')], {})).toEqual([]);
  });
});
