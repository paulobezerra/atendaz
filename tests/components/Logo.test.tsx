import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Logo from '@/components/Logo';

describe('Logo', () => {
  it('usa a variante clara (fundo claro) por padrão', () => {
    render(<Logo />);
    expect(screen.getByAltText('AtendAZ')).toHaveAttribute(
      'src',
      '/atendaz-logo.svg'
    );
  });

  it('usa a variante invertida em fundo escuro', () => {
    render(<Logo variant="dark" />);
    expect(screen.getByAltText('AtendAZ')).toHaveAttribute(
      'src',
      '/atendaz-logo-inverted.svg'
    );
  });
});
