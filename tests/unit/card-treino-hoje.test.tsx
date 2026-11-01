import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { CardTreinoHoje } from '@/components/aluno/inicio/card-treino-hoje';

/**
 * Testes do cartão de "próximo treino" com o mini mapa muscular acoplado:
 * - com grupos, mostra o body-map aceso com os grupos da divisão;
 * - sem grupos (ex.: divisão ainda sem exercícios), não renderiza o mapa e NÃO
 *   quebra. O estado de DESCANSO da rotação é tratado fora deste cartão
 *   (`DescansoResumoCard`), então aqui basta garantir o caminho sem grupos.
 */
afterEach(cleanup);

describe('CardTreinoHoje', () => {
  it('mostra o mapa muscular com os grupos da divisão', () => {
    render(
      <CardTreinoHoje
        fichaNome="PPLUL"
        planId="p1"
        divisionLabel="A"
        grupos={['Peito', 'Ombros']}
        exercicios={[{ id: 'i1', nome: 'Supino', sets: 4, reps: '8-12' }]}
        href="/aluno/execucao/p1?divisao=A"
      />
    );
    expect(
      screen.getByRole('img', { name: 'Músculos trabalhados: Peito, Ombros' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /iniciar treino/i })).toBeInTheDocument();
  });

  it('não renderiza o mapa (nem quebra) quando não há grupos', () => {
    render(
      <CardTreinoHoje
        fichaNome="Treino sem grupos"
        planId="p1"
        divisionLabel="A"
        grupos={[]}
        exercicios={[]}
        href="/aluno/treinos/p1"
      />
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    // O cartão continua renderizando o restante do conteúdo.
    expect(screen.getByText('Próximo treino')).toBeInTheDocument();
  });
});
