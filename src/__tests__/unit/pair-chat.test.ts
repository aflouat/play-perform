import { MESSAGES_PER_MINUTE, chatState, membersKey, validateMessage, weekWindow } from '@/modules/collab/domain/chat';

describe('project window of a weekly pair', () => {
  it('opens on the Monday of the ISO week and closes the next Monday', () => {
    expect(weekWindow('2026-W41')).toEqual({ opensAt: '2026-10-05T00:00:00.000Z', closesAt: '2026-10-12T00:00:00.000Z' });
    expect(weekWindow('2026-W01')).toEqual({ opensAt: '2025-12-29T00:00:00.000Z', closesAt: '2026-01-05T00:00:00.000Z' });
    expect(weekWindow('2026-W53').opensAt).toBe('2026-12-28T00:00:00.000Z');
  });

  it('archives the chat when the project ends', () => {
    const w = weekWindow('2026-W41');
    expect(chatState(w, new Date('2026-10-08T15:00:00Z'))).toBe('open');
    expect(chatState(w, new Date('2026-10-12T00:00:00Z'))).toBe('archived');
  });

  it('identifies the pair whatever the order of its members', () => {
    expect(membersKey(['p2', 'p1'])).toBe('p1,p2');
    expect(membersKey(['p1', 'p3', 'p2'])).toBe('p1,p2,p3');
  });
});

describe('messages', () => {
  it('keeps a trimmed text of 1 to 1000 characters', () => {
    expect(validateMessage('  On se cale jeudi ?  ')).toEqual({ ok: true, value: 'On se cale jeudi ?' });
    expect(validateMessage('   ').ok).toBe(false);
    expect(validateMessage('x'.repeat(1001)).ok).toBe(false);
    expect(validateMessage(42).ok).toBe(false);
  });

  it('limits the pace of messages', () => {
    expect(MESSAGES_PER_MINUTE).toBe(20);
  });
});
