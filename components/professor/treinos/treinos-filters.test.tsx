import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { TreinosFilters } from './treinos-filters';

// `push` inspecionável para checar a URL destino. `useSearchParams` devolve os
// params atuais (controlados por `currentParams`) para simular o estado da URL.
const push = vi.fn();
let currentParams = '';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(currentParams),
}));

beforeEach(() => {
  push.mockClear();
  currentParams = '';
});

afterEach(cleanup);

/** Extrai só a querystring da URL passada ao `push`. */
function queryDo(url: string): URLSearchParams {
  return new URLSearchParams(url.split('?')[1] ?? '');
}

describe('TreinosFilters', () => {
  it('submit com termo escreve q na URL', () => {
    render(<TreinosFilters initialQuery="" />);
    const input = screen.getByLabelText('Buscar treino ou aluno');
    fireEvent.change(input, { target: { value: 'supino' } });
    fireEvent.submit(input.closest('form')!);

    expect(push).toHaveBeenCalledTimes(1);
    expect(queryDo(push.mock.calls[0][0]).get('q')).toBe('supino');
  });

  it('submit com termo só de espaços remove q (após trim)', () => {
    currentParams = 'q=antigo';
    render(<TreinosFilters initialQuery="antigo" />);
    const input = screen.getByLabelText('Buscar treino ou aluno');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.submit(input.closest('form')!);

    expect(push).toHaveBeenCalledTimes(1);
    expect(queryDo(push.mock.calls[0][0]).has('q')).toBe(false);
  });

  it('aplicar q remove page', () => {
    currentParams = 'page=3';
    render(<TreinosFilters initialQuery="" />);
    const input = screen.getByLabelText('Buscar treino ou aluno');
    fireEvent.change(input, { target: { value: 'peito' } });
    fireEvent.submit(input.closest('form')!);

    expect(push).toHaveBeenCalledTimes(1);
    const params = queryDo(push.mock.calls[0][0]);
    expect(params.get('q')).toBe('peito');
    expect(params.has('page')).toBe(false);
  });
});
