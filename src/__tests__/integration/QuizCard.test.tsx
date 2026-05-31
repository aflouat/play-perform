import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { QuizCard } from '@/components/shared/QuizCard';
import type { QuizQuestion } from '@/types';

const MOCK_QUESTION: QuizQuestion = {
  id: 'q1',
  subject: 'maths',
  question: 'Combien font 2 + 2 ?',
  options: [
    { id: 'A', text: '3' },
    { id: 'B', text: '4' },
    { id: 'C', text: '5' },
    { id: 'D', text: '6' },
  ],
  correctOptionId: 'B',
  explanation: '2 + 2 = 4, c\'est une addition de base.',
  difficulty: 1,
  xpReward: 10,
};

describe('QuizCard', () => {
  const mockOnAnswer = jest.fn();

  beforeEach(() => {
    mockOnAnswer.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the question text', () => {
    render(
      <QuizCard
        question={MOCK_QUESTION}
        questionIndex={0}
        totalQuestions={4}
        onAnswer={mockOnAnswer}
      />,
    );
    expect(screen.getByText('Combien font 2 + 2 ?')).toBeInTheDocument();
  });

  it('renders all 4 answer options', () => {
    render(
      <QuizCard
        question={MOCK_QUESTION}
        questionIndex={0}
        totalQuestions={4}
        onAnswer={mockOnAnswer}
      />,
    );
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('accepts questionIndex and totalQuestions props without error', () => {
    const { container } = render(
      <QuizCard
        question={MOCK_QUESTION}
        questionIndex={1}
        totalQuestions={4}
        onAnswer={mockOnAnswer}
      />,
    );
    // QuizCard renders (question counter lives in the parent page)
    expect(container.firstChild).not.toBeNull();
  });

  it('shows XP reward', () => {
    render(
      <QuizCard
        question={MOCK_QUESTION}
        questionIndex={0}
        totalQuestions={4}
        onAnswer={mockOnAnswer}
      />,
    );
    expect(screen.getByText('+10 XP')).toBeInTheDocument();
  });

  it('calls onAnswer when an option is selected', () => {
    render(
      <QuizCard
        question={MOCK_QUESTION}
        questionIndex={0}
        totalQuestions={4}
        onAnswer={mockOnAnswer}
      />,
    );
    fireEvent.click(screen.getByText('4'));
    expect(mockOnAnswer).toHaveBeenCalledWith('B', expect.any(Number));
  });

  it('reveals correct answer after selection', () => {
    render(
      <QuizCard
        question={MOCK_QUESTION}
        questionIndex={0}
        totalQuestions={4}
        onAnswer={mockOnAnswer}
      />,
    );
    fireEvent.click(screen.getByText('4'));
    expect(screen.getByText(/Bravo/)).toBeInTheDocument();
    expect(screen.getByText(/2 \+ 2 = 4/)).toBeInTheDocument();
  });

  it('shows wrong answer feedback on incorrect choice', () => {
    render(
      <QuizCard
        question={MOCK_QUESTION}
        questionIndex={0}
        totalQuestions={4}
        onAnswer={mockOnAnswer}
      />,
    );
    fireEvent.click(screen.getByText('3'));
    expect(screen.getByText(/Pas tout à fait/)).toBeInTheDocument();
  });

  it('disables options after selection', () => {
    render(
      <QuizCard
        question={MOCK_QUESTION}
        questionIndex={0}
        totalQuestions={4}
        onAnswer={mockOnAnswer}
      />,
    );
    fireEvent.click(screen.getByText('3'));
    const buttons = screen.getAllByRole('button');
    const optionButtons = buttons.filter((b) => ['3', '4', '5', '6'].includes(b.textContent ?? ''));
    optionButtons.forEach((b) => expect(b).toBeDisabled());
  });

  it('renders speak button when onSpeak is provided', () => {
    const mockSpeak = jest.fn();
    render(
      <QuizCard
        question={MOCK_QUESTION}
        questionIndex={0}
        totalQuestions={4}
        onAnswer={mockOnAnswer}
        onSpeak={mockSpeak}
      />,
    );
    expect(screen.getByRole('button', { name: /Lire la question/i })).toBeInTheDocument();
  });

  it('calls onSpeak with question text when speak button clicked', () => {
    const mockSpeak = jest.fn();
    render(
      <QuizCard
        question={MOCK_QUESTION}
        questionIndex={0}
        totalQuestions={4}
        onAnswer={mockOnAnswer}
        onSpeak={mockSpeak}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Lire la question/i }));
    expect(mockSpeak).toHaveBeenCalledWith(MOCK_QUESTION.question);
  });

  it('does not call onAnswer twice if option clicked again after reveal', () => {
    render(
      <QuizCard
        question={MOCK_QUESTION}
        questionIndex={0}
        totalQuestions={4}
        onAnswer={mockOnAnswer}
      />,
    );
    fireEvent.click(screen.getByText('4'));
    fireEvent.click(screen.getByText('3'));
    expect(mockOnAnswer).toHaveBeenCalledTimes(1);
  });

  it('renders questionAssisted text in assisted mode when present', () => {
    const q = { ...MOCK_QUESTION, questionAssisted: 'Version assistée de la question' };
    render(
      <QuizCard
        question={q}
        questionIndex={0}
        totalQuestions={4}
        mode="assisted"
        onAnswer={mockOnAnswer}
      />,
    );
    expect(screen.getByText('Version assistée de la question')).toBeInTheDocument();
    expect(screen.queryByText('Combien font 2 + 2 ?')).not.toBeInTheDocument();
  });

  it('falls back to question when questionAssisted absent in assisted mode', () => {
    render(
      <QuizCard
        question={MOCK_QUESTION}
        questionIndex={0}
        totalQuestions={4}
        mode="assisted"
        onAnswer={mockOnAnswer}
      />,
    );
    expect(screen.getByText('Combien font 2 + 2 ?')).toBeInTheDocument();
  });
});
