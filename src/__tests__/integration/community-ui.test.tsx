import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PairCard } from '@/modules/competition/ui/PairCard';
import { ActivityFeed } from '@/modules/competition/ui/ActivityFeed';
import { ClassicTraps } from '@/modules/community/ui/ClassicTraps';
import * as client from '@/modules/competition/infra/competition-client';
import * as stats from '@/modules/community/infra/community-client';

jest.mock('@/modules/competition/infra/competition-client');
jest.mock('@/modules/community/infra/community-client');

const pair = (over = {}) => ({
  week: '2026-W41', status: 'waiting' as const, bonusXp: 50, claimable: false, claimed: false,
  me: { played: true, mention: true }, partners: [{ nickname: 'LynxMalin2', played: false, mention: false }], ...over,
});
const event = (over = {}) => ({
  id: 'e1', nickname: 'LynxMalin2', skillName: 'Logique', skillEmoji: '🧩', level: 5, createdAt: '2026-10-08T10:00:00Z', cheers: 1, cheeredByMe: false, isMine: false, ...over,
});

beforeEach(() => jest.resetAllMocks());

describe('pair card', () => {
  it('states the contract and the state of each member, by pseudonym', async () => {
    jest.mocked(client.fetchPair).mockResolvedValue(pair());
    render(<PairCard profileId="p1" onBonus={jest.fn()} />);
    expect(await screen.findByText(/Avec LynxMalin2/)).toBeInTheDocument();
    expect(screen.getByText(/tous les deux la mention/)).toBeInTheDocument();
    expect(screen.getByText(/LynxMalin2 : 🎯 pas encore joué/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Récupérer le bonus/ })).toBeNull();
  });

  it('lets the pair collect the bonus, adding the XP on the device', async () => {
    jest.mocked(client.fetchPair).mockResolvedValue(pair({ status: 'won', claimable: true, partners: [{ nickname: 'LynxMalin2', played: true, mention: true }] }));
    jest.mocked(client.claimPairBonus).mockResolvedValue({ xp: 50 });
    const onBonus = jest.fn();
    render(<PairCard profileId="p1" onBonus={onBonus} />);
    await userEvent.click(await screen.findByRole('button', { name: /Récupérer le bonus/ }));
    await waitFor(() => expect(onBonus).toHaveBeenCalledWith(50));
  });

  it('explains when nobody can be paired yet', async () => {
    jest.mocked(client.fetchPair).mockResolvedValue(null);
    render(<PairCard profileId="p1" onBonus={jest.fn()} />);
    expect(await screen.findByText(/Pas encore de binôme/)).toBeInTheDocument();
  });
});

describe('activity feed', () => {
  it('celebrates successes and lets a friend cheer, not the author', async () => {
    jest.mocked(client.fetchFeed).mockResolvedValue([event(), event({ id: 'e2', nickname: 'Moi_Meme', level: 4, isMine: true, cheers: 3 })]);
    jest.mocked(client.sendCheer).mockResolvedValue(true);
    render(<ActivityFeed profileId="p1" />);
    expect(await screen.findAllByText(/vient de maîtriser/)).not.toHaveLength(0);
    await userEvent.click(screen.getByRole('button', { name: 'Bravo à LynxMalin2' }));
    expect(client.sendCheer).toHaveBeenCalledWith('p1', 'e1');
    expect(screen.getByRole('button', { name: 'Bravo à LynxMalin2' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Bravo à Moi_Meme' })).toBeNull();
  });

  it('shows masteries on the trophy wall, and moderation only to a teacher', async () => {
    jest.mocked(client.fetchFeed).mockResolvedValue([event()]);
    const { unmount } = render(<ActivityFeed profileId="p1" />);
    expect(await screen.findByRole('region', { name: 'Mur des trophées' })).toHaveTextContent('LynxMalin2');
    expect(screen.queryByRole('button', { name: 'Retirer du fil' })).toBeNull();
    unmount();
    render(<ActivityFeed profileId="p1" moderator />);
    expect(await screen.findByRole('button', { name: 'Retirer du fil' })).toBeInTheDocument();
  });
});

describe('wall of classic mistakes', () => {
  const q = { id: 'q1', subject: 'maths', question: 'Combien font 1/2 + 1/3 ?', emoji: '', correctOptionId: 'C', explanation: 'On met au même dénominateur.',
    options: [{ id: 'A', text: '2/5' }, { id: 'B', text: '1/5' }, { id: 'C', text: '5/6' }, { id: 'D', text: '2/6' }], difficulty: 2, xpReward: 15 } as never;

  it('reassures with the share of learners who fell into the same trap', async () => {
    jest.mocked(stats.fetchDistributions).mockResolvedValue({ q1: { A: 12, B: 2, C: 5, D: 1 } });
    render(<ClassicTraps questions={[q]} />);
    expect(await screen.findByText(/60 % ont répondu « 2\/5 »/)).toBeInTheDocument();
    expect(screen.getByText(/ce n’est pas toi le problème/)).toBeInTheDocument();
  });

  it('shows nothing until there are enough answers', async () => {
    jest.mocked(stats.fetchDistributions).mockResolvedValue({ q1: { A: 1, C: 2 } });
    const { container } = render(<ClassicTraps questions={[q]} />);
    await waitFor(() => expect(stats.fetchDistributions).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });
});
