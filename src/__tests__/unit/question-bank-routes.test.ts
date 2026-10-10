/** @jest-environment node */
import { NextRequest } from 'next/server';
import { GET as bank } from '@/app/api/question-bank/route';
import { GET as adminList } from '@/app/api/questions/route';
import { POST as seed } from '@/app/api/questions/seed/route';
import { POST as importCsv } from '@/app/api/questions/import/route';
import * as adminAuth from '@/lib/admin-auth';
import * as db from '@/lib/db';

jest.mock('@/lib/admin-auth');
jest.mock('@/lib/db');

const auth = jest.mocked(adminAuth);
const store = jest.mocked(db);
const row = (id: string, over: Partial<db.DbQuestion> = {}): db.DbQuestion => ({
  id, subject: 'maths', category: null, difficulty: 1, xp_reward: 10, emoji: null, image_url: null, question: 'Q', question_assisted: null,
  option_a: 'a', option_b: 'b', option_c: 'c', option_d: 'd', option_a_assisted: null, option_b_assisted: null, option_c_assisted: null, option_d_assisted: null,
  correct_option_id: 'A', explanation: 'e', explanation_assisted: null, skill_id: null, status: 'published', hint: null, ...over,
});
const post = (url: string, body?: BodyInit, headers: Record<string, string> = {}) => new NextRequest(url, { method: 'POST', body, headers });

beforeEach(() => { jest.resetAllMocks(); auth.isAdminAuthorized.mockResolvedValue(true); });

describe('GET /api/question-bank (public)', () => {
  it('serves published questions as quiz questions with their skill', async () => {
    store.fetchPublishedQuestions.mockResolvedValue([row('db-1', { skill_id: 'labo-securite', hint: 'EPI' })]);
    const body = await (await bank()).json();
    expect(body.questions).toHaveLength(1);
    expect(body.questions[0]).toMatchObject({ skillId: 'labo-securite', question: { id: 'db-1', hint: 'EPI', correctOptionId: 'A' } });
  });

  it('falls back to an empty list when the database fails (built-in banks keep working)', async () => {
    store.fetchPublishedQuestions.mockRejectedValue(new Error('down'));
    expect((await (await bank()).json()).questions).toEqual([]);
  });
});

describe('admin routes', () => {
  it('lists every question, drafts included, for the super admin only', async () => {
    store.fetchAllQuestionsFromDb.mockResolvedValue([row('d', { status: 'draft' })]);
    expect((await (await adminList(new NextRequest('http://x/api/questions'))).json()).questions[0].status).toBe('draft');
    auth.isAdminAuthorized.mockResolvedValue(false);
    expect((await adminList(new NextRequest('http://x/api/questions'))).status).toBe(401);
  });

  it('seeds the database from the built-in banks without overwriting edits', async () => {
    store.seedQuestions.mockImplementation(async (rows) => rows.length - 3);
    const body = await (await seed(post('http://x/api/questions/seed'))).json();
    const sent = store.seedQuestions.mock.calls[0][0];
    expect(body.total).toBe(sent.length);
    expect(body.added).toBe(sent.length - 3);
    expect(new Set(sent.map((r) => r.id)).size).toBe(sent.length);
    expect(sent.some((r) => r.skill_id === 'labo-securite')).toBe(true);
    expect(sent.every((r) => r.status === 'published')).toBe(true);
  });

  it('refuses to seed or import without admin rights', async () => {
    auth.isAdminAuthorized.mockResolvedValue(false);
    expect((await seed(post('http://x/api/questions/seed'))).status).toBe(401);
    expect((await importCsv(post('http://x/api/questions/import', '{}', { 'content-type': 'application/json' }))).status).toBe(401);
    expect(store.insertQuestions).not.toHaveBeenCalled();
    expect(store.seedQuestions).not.toHaveBeenCalled();
  });

  it('rejects an imported id that already exists as a draft in the database', async () => {
    store.fetchAllQuestionsFromDb.mockResolvedValue([row('mon-brouillon', { status: 'draft' })]);
    const csv = 'id,subject,difficulty,xpReward,question,optionA,optionB,optionC,optionD,correctOptionId,explanation\nmon-brouillon,maths,1,10,Q,a,b,c,d,A,e';
    const form = new FormData();
    form.append('csv', new File([csv], 'q.csv'));
    const body = await (await importCsv(post('http://x/api/questions/import', form))).json();
    expect(body.imported).toBe(0);
    expect(body.errors[0].message).toMatch(/existant/);
    expect(store.insertQuestions).not.toHaveBeenCalled();
  });
});
