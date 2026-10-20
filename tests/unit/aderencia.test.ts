import { describe, expect, it } from 'vitest';

import { resumoAderencia, type SessaoAderencia } from '@/lib/treino/aderencia';

const REFERENCIA = new Date('2024-03-31T12:00:00Z');

function sessao(finished_at: string | null): SessaoAderencia {
  return { finished_at };
}

describe('resumoAderencia', () => {
  it('conta sessões concluídas no total e na janela de 30 dias', () => {
    const resumo = resumoAderencia(
      [
        sessao('2024-03-30T10:00:00Z'), // dentro da janela
        sessao('2024-03-10T10:00:00Z'), // dentro da janela
        sessao('2024-01-01T10:00:00Z'), // fora da janela (total conta)
      ],
      30,
      REFERENCIA
    );
    expect(resumo.concluidasTotal).toBe(3);
    expect(resumo.concluidasPeriodo).toBe(2);
    expect(resumo.dias).toBe(30);
  });

  it('ignora sessões sem finished_at', () => {
    const resumo = resumoAderencia(
      [sessao(null), sessao('2024-03-20T10:00:00Z')],
      30,
      REFERENCIA
    );
    expect(resumo.concluidasTotal).toBe(1);
    expect(resumo.concluidasPeriodo).toBe(1);
  });

  it('ignora datas inválidas', () => {
    const resumo = resumoAderencia([sessao('data-invalida')], 30, REFERENCIA);
    expect(resumo.concluidasTotal).toBe(0);
    expect(resumo.concluidasPeriodo).toBe(0);
  });

  it('não conta sessões no futuro na janela', () => {
    const resumo = resumoAderencia([sessao('2024-04-10T10:00:00Z')], 30, REFERENCIA);
    expect(resumo.concluidasTotal).toBe(1);
    expect(resumo.concluidasPeriodo).toBe(0);
  });

  it('retorna zeros para lista vazia', () => {
    const resumo = resumoAderencia([], 30, REFERENCIA);
    expect(resumo).toEqual({ concluidasTotal: 0, concluidasPeriodo: 0, dias: 30 });
  });
});
