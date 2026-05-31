import React from 'react';
import { render, screen } from '@testing-library/react';
import { ScoreBadge } from '@/components/ui/ScoreBadge';

describe('ScoreBadge', () => {
  it('renders level and XP', () => {
    render(<ScoreBadge xp={150} level={2} xpToNext={50} />);
    expect(screen.getByText('Niveau 2')).toBeInTheDocument();
    expect(screen.getByText('150 XP total')).toBeInTheDocument();
  });

  it('renders xpToNext', () => {
    render(<ScoreBadge xp={60} level={1} xpToNext={40} />);
    expect(screen.getByText('40 XP')).toBeInTheDocument();
    expect(screen.getByText('pour le niveau suivant')).toBeInTheDocument();
  });

  it('renders compact version', () => {
    render(<ScoreBadge xp={50} level={1} xpToNext={50} compact />);
    expect(screen.getByText('Niv.1')).toBeInTheDocument();
    expect(screen.getByText('50 XP')).toBeInTheDocument();
  });

  it('renders progress bar with correct percentage', () => {
    render(<ScoreBadge xp={75} level={1} xpToNext={25} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '75');
  });

  it('shows 0% progress at start of level', () => {
    render(<ScoreBadge xp={100} level={2} xpToNext={100} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
  });
});
