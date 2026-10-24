import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { AuthScreen } from './auth-screen';

afterEach(cleanup);

describe('AuthScreen', () => {
  it('expõe exatamente um h1', () => {
    render(
      <AuthScreen title="Entrar" primaryAction={<button>Enviar</button>}>
        <input aria-label="E-mail" />
      </AuthScreen>
    );
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('renderiza a ação primária no formulário', () => {
    render(
      <AuthScreen title="Entrar" primaryAction={<button>Enviar</button>}>
        <input aria-label="E-mail" />
      </AuthScreen>
    );
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument();
  });
});
