import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PairChat } from '@/modules/collab/ui/PairChat';
import { ChatAudit } from '@/modules/collab/ui/ChatAudit';
import * as client from '@/modules/collab/infra/chat-client';
import * as audit from '@/modules/collab/infra/audit-client';

jest.mock('@/modules/collab/infra/chat-client');
jest.mock('@/modules/collab/infra/audit-client');

const view = (state: 'open' | 'archived') => ({
  thread: { id: 't1', closesAt: '2026-10-12T00:00:00Z', state, members: [{ nickname: 'Lynx', me: true }, { nickname: 'Orque', me: false }] },
  messages: [
    { id: 'm1', mine: false, author: 'Orque', body: 'On commence par les dilutions ?', createdAt: '2026-10-06T10:00:00Z', reported: false },
    { id: 'm2', mine: true, author: 'Lynx', body: 'Oui !', createdAt: '2026-10-06T10:01:00Z', reported: false },
  ],
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(window, 'confirm').mockReturnValue(true);
  jest.mocked(client.sendChatMessage).mockResolvedValue(null);
  jest.mocked(client.reportChatMessage).mockResolvedValue(true);
});

describe('pair chat', () => {
  it('shows the project with the partner, the audit notice, and sends a message', async () => {
    jest.mocked(client.fetchChat).mockResolvedValue(view('open'));
    render(<PairChat />);
    expect(await screen.findByRole('heading', { name: /Projet de la semaine avec Orque/ })).toBeInTheDocument();
    expect(screen.getByText(/conservé par Play Perform/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Message à ton binôme'), { target: { value: 'Je prépare la gamme' } });
    fireEvent.click(screen.getByRole('button', { name: 'Envoyer' }));
    await waitFor(() => expect(client.sendChatMessage).toHaveBeenCalledWith('t1', 'Je prépare la gamme'));
  });

  it('reports the partner’s message, never my own', async () => {
    jest.mocked(client.fetchChat).mockResolvedValue(view('open'));
    render(<PairChat />);
    const buttons = await screen.findAllByRole('button', { name: 'Signaler' });
    expect(buttons).toHaveLength(1);
    fireEvent.click(buttons[0]);
    await waitFor(() => expect(client.reportChatMessage).toHaveBeenCalledWith('m1'));
  });

  it('is read-only once the project is over (archived)', async () => {
    jest.mocked(client.fetchChat).mockResolvedValue(view('archived'));
    render(<PairChat />);
    expect(await screen.findByText(/ce chat est archivé/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Message à ton binôme')).toBeNull();
  });

  it('stays hidden without a pair this week', async () => {
    jest.mocked(client.fetchChat).mockResolvedValue({ thread: null, messages: [] });
    const { container } = render(<PairChat />);
    await waitFor(() => expect(client.fetchChat).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });
});

describe('audit of the chats (parent company)', () => {
  it('lists the reported chats and opens a transcript with real names', async () => {
    jest.mocked(audit.fetchAuditThreads).mockResolvedValue([{ id: 't1', project: '2026-W41', state: 'archived', opensAt: '', closesAt: '', messageCount: 2, reportCount: 1,
      members: [{ id: 'p1', nickname: 'Lynx', name: 'Léa Martin' }, { id: 'p2', nickname: 'Orque', name: 'Tom Durand' }] }]);
    jest.mocked(audit.fetchAuditTranscript).mockResolvedValue({ thread: { id: 't1', project: '2026-W41', members: [] },
      messages: [{ id: 'm1', author: { nickname: 'Orque', name: 'Tom Durand' }, body: 'Message problématique', createdAt: '2026-10-06T10:00:00Z', reportedAt: '2026-10-06T11:00:00Z' }] });
    render(<ChatAudit />);
    expect(audit.fetchAuditThreads).toHaveBeenCalledWith(true);
    fireEvent.click(await screen.findByRole('button', { name: /Léa Martin/ }));
    expect(await screen.findByText(/Message problématique/)).toBeInTheDocument();
    expect(screen.getByText(/signalé le/)).toBeInTheDocument();
  });
});
