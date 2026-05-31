import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AvatarPicker } from '@/components/shared/AvatarPicker';
import { AVATARS } from '@/lib/avatars';

describe('AvatarPicker', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('renders all avatars', () => {
    render(
      <AvatarPicker
        allAvatars={AVATARS}
        currentXp={0}
        selectedId={null}
        onSelect={mockOnSelect}
      />,
    );
    AVATARS.forEach((avatar) => {
      expect(screen.getByText(avatar.name)).toBeInTheDocument();
    });
  });

  it('shows locked state for avatars requiring more XP', () => {
    render(
      <AvatarPicker
        allAvatars={AVATARS}
        currentXp={0}
        selectedId={null}
        onSelect={mockOnSelect}
      />,
    );
    const lockedAvatar = AVATARS.find((a) => a.unlockXp > 0)!;
    expect(screen.getByText(`${lockedAvatar.unlockXp} XP`)).toBeInTheDocument();
  });

  it('calls onSelect when clicking an unlocked avatar', () => {
    render(
      <AvatarPicker
        allAvatars={AVATARS}
        currentXp={0}
        selectedId={null}
        onSelect={mockOnSelect}
      />,
    );
    const unlockedAvatar = AVATARS.find((a) => a.unlockXp === 0)!;
    fireEvent.click(screen.getByRole('button', { name: new RegExp(unlockedAvatar.name) }));
    expect(mockOnSelect).toHaveBeenCalledWith(unlockedAvatar.id);
  });

  it('does not call onSelect when clicking a locked avatar', () => {
    render(
      <AvatarPicker
        allAvatars={AVATARS}
        currentXp={0}
        selectedId={null}
        onSelect={mockOnSelect}
      />,
    );
    const lockedAvatar = AVATARS.find((a) => a.unlockXp > 0)!;
    const button = screen.getByRole('button', { name: new RegExp(lockedAvatar.name) });
    fireEvent.click(button);
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('shows selected indicator on selected avatar', () => {
    const firstAvatar = AVATARS[0];
    render(
      <AvatarPicker
        allAvatars={AVATARS}
        currentXp={1000}
        selectedId={firstAvatar.id}
        onSelect={mockOnSelect}
      />,
    );
    // The selected avatar has aria-pressed="true"
    const selectedBtn = screen.getByRole('button', { name: new RegExp(firstAvatar.name) });
    expect(selectedBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('unlocks avatars when XP threshold is met (no lock text visible)', () => {
    render(
      <AvatarPicker
        allAvatars={AVATARS}
        currentXp={1000}
        selectedId={null}
        onSelect={mockOnSelect}
      />,
    );
    // No avatar should show a lock indicator when XP is high enough
    AVATARS.filter((a) => a.unlockXp > 0).forEach((avatar) => {
      expect(screen.queryByText(`${avatar.unlockXp} XP`)).not.toBeInTheDocument();
    });
  });
});
