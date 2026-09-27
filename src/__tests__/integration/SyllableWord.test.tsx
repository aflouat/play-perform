import { render, screen, fireEvent } from '@testing-library/react';
import { SyllableWord } from '@/components/reading/SyllableWord';

jest.mock('@/lib/reading/reading-font', () => ({ readingFont: { className: 'font-reading' } }));

describe('SyllableWord', () => {
  it('alterne bleu / rouge entre les syllabes', () => {
    render(<SyllableWord word={{ id: 'ecole', text: 'É-co-le', emoji: '🏫', level: 2 }} onSyllableTap={() => {}} />);
    expect(screen.getByText('É')).toHaveClass('text-blue-700');
    expect(screen.getByText('co')).toHaveClass('text-red-600');
    expect(screen.getByText('le')).toHaveClass('text-blue-700');
  });

  it('affiche les lettres muettes en gris', () => {
    render(<SyllableWord word={{ id: 'blanc', text: 'blan(c)', emoji: '⬜', level: 4 }} />);
    expect(screen.getByText('c')).toHaveClass('text-slate-400');
    expect(screen.getByText('c')).toHaveAttribute('data-silent', 'true');
    expect(screen.getByText('blan')).toHaveClass('text-blue-700');
    expect(screen.getByRole('group', { name: 'blanc' })).toBeInTheDocument();
  });

  it('signale la syllabe touchée avec sa prononciation', () => {
    const onTap = jest.fn();
    render(<SyllableWord word={{ id: 'oiseau', text: 'oi-seau', emoji: '🐦', level: 3, say: ['oi', 'zo'] }} onSyllableTap={onTap} />);
    fireEvent.click(screen.getByRole('button', { name: 'Syllabe seau' }));
    expect(onTap).toHaveBeenCalledWith(1, expect.objectContaining({ spoken: 'zo' }));
  });

  it('peut afficher le mot sans couleurs', () => {
    render(<SyllableWord word={{ id: 'moto', text: 'mo-to', emoji: '🏍️', level: 1 }} colored={false} />);
    expect(screen.getByText('mo')).toHaveClass('text-slate-800');
  });
});
