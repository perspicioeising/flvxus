import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { DataList } from './data-list';

afterEach(cleanup);

describe('DataList', () => {
  it('mostra o estado de carregamento', () => {
    render(
      <DataList
        items={[]}
        loading
        getKey={(i: string) => i}
        renderItem={(i: string) => <span>{i}</span>}
      />
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('mostra o estado vazio quando não há itens', () => {
    render(
      <DataList
        items={[]}
        empty={{ title: 'Nada aqui' }}
        getKey={(i: string) => i}
        renderItem={(i: string) => <span>{i}</span>}
      />
    );
    expect(screen.getByText('Nada aqui')).toBeInTheDocument();
  });

  it('renderiza os itens quando preenchido', () => {
    render(
      <DataList
        items={['a', 'b']}
        getKey={(i) => i}
        renderItem={(i) => <span>item-{i}</span>}
      />
    );
    expect(screen.getByText('item-a')).toBeInTheDocument();
    expect(screen.getByText('item-b')).toBeInTheDocument();
  });
});
