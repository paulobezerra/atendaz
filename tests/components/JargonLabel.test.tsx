import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { JargonLabel } from '@/components/JargonLabel';

describe('JargonLabel', () => {
  it('renderiza o rótulo e o botão de ajuda quando há hint', () => {
    render(<JargonLabel hint="texto de ajuda">Segmento</JargonLabel>);
    expect(screen.getByText('Segmento')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ajuda' })).toBeInTheDocument();
  });

  it('sem hint, não renderiza o botão de ajuda', () => {
    render(<JargonLabel>Simples</JargonLabel>);
    expect(
      screen.queryByRole('button', { name: 'Ajuda' })
    ).not.toBeInTheDocument();
  });
});
