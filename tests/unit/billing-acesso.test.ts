import { describe, expect, it } from 'vitest';
import { resolverAcesso } from '@/lib/billing/acesso';
import { mensagemBloqueio } from '@/lib/billing/mensagens';
import { lerIntencao, queryIntencao } from '@/lib/billing/intencao';

/**
 * Testes PUROS do estado de acesso (trial/assinatura), das mensagens de
 * bloqueio e da intenção de assinatura vinda da landing.
 */
const AGORA = new Date('2026-11-10T12:00:00.000Z');
const DIA = 24 * 60 * 60 * 1000;
const iso = (ms: number) => new Date(ms).toISOString();

const base = {
  tier: 'personal' as const,
  hasStripeSubscription: false,
  now: AGORA,
};

describe('resolverAcesso', () => {
  it('sem linha => sem_assinatura (somente leitura)', () => {
    const r = resolverAcesso({ ...base, status: null, trialEndsAt: null });
    expect(r).toMatchObject({ podeEscrever: false, motivo: 'sem_assinatura', tier: null });
  });

  it('trial vigente (D-1, D+13) escreve e conta os dias restantes', () => {
    const d13 = resolverAcesso({
      ...base,
      status: 'trialing',
      trialEndsAt: iso(AGORA.getTime() + 13 * DIA),
    });
    expect(d13).toMatchObject({ podeEscrever: true, motivo: 'trial_vigente', diasRestantesTrial: 13 });
    const ultimo = resolverAcesso({
      ...base,
      status: 'trialing',
      trialEndsAt: iso(AGORA.getTime() + 1000),
    });
    expect(ultimo).toMatchObject({ podeEscrever: true, motivo: 'trial_vigente', diasRestantesTrial: 1 });
  });

  it('trial expirado (borda == agora, passado, nulo) => somente leitura', () => {
    for (const trialEndsAt of [iso(AGORA.getTime()), iso(AGORA.getTime() - DIA), null]) {
      const r = resolverAcesso({ ...base, status: 'trialing', trialEndsAt });
      expect(r).toMatchObject({ podeEscrever: false, motivo: 'trial_expirado' });
    }
  });

  it('assinatura ativa escreve e ignora trial_ends_at', () => {
    const r = resolverAcesso({
      ...base,
      status: 'active',
      hasStripeSubscription: true,
      trialEndsAt: iso(AGORA.getTime() - 30 * DIA),
    });
    expect(r).toMatchObject({ podeEscrever: true, motivo: 'assinatura_ativa' });
  });

  it('trialing da Stripe (com id de assinatura) escreve como assinatura ativa', () => {
    const r = resolverAcesso({
      ...base,
      status: 'trialing',
      hasStripeSubscription: true,
      trialEndsAt: null,
    });
    expect(r).toMatchObject({ podeEscrever: true, motivo: 'assinatura_ativa' });
  });

  it('past_due e unpaid => pagamento_pendente (somente leitura, sem graça)', () => {
    for (const status of ['past_due', 'unpaid'] as const) {
      const r = resolverAcesso({ ...base, status, hasStripeSubscription: true, trialEndsAt: null });
      expect(r).toMatchObject({ podeEscrever: false, motivo: 'pagamento_pendente' });
    }
  });

  it('cancelada / incomplete_expired => cancelada; incomplete => incompleta', () => {
    for (const status of ['canceled', 'incomplete_expired'] as const) {
      expect(
        resolverAcesso({ ...base, status, hasStripeSubscription: true, trialEndsAt: null })
      ).toMatchObject({ podeEscrever: false, motivo: 'cancelada' });
    }
    expect(
      resolverAcesso({ ...base, status: 'incomplete', trialEndsAt: null })
    ).toMatchObject({ podeEscrever: false, motivo: 'incompleta' });
  });

  it('aluno vinculado herda o estado do tenant: mesma entrada => mesmo resultado', () => {
    // O estado vem da RPC do tenant (não do perfil do aluno): trial expirado do
    // personal bloqueia o aluno; trial vigente libera.
    const expirado = resolverAcesso({ ...base, status: 'trialing', trialEndsAt: iso(AGORA.getTime() - 1) });
    const vigente = resolverAcesso({ ...base, status: 'trialing', trialEndsAt: iso(AGORA.getTime() + DIA) });
    expect(expirado.podeEscrever).toBe(false);
    expect(vigente.podeEscrever).toBe(true);
  });
});

describe('mensagemBloqueio', () => {
  const motivos = [
    'trial_expirado',
    'pagamento_pendente',
    'cancelada',
    'incompleta',
    'sem_assinatura',
  ] as const;

  it('autônomo nunca fala em professor/personal', () => {
    for (const m of motivos) {
      const msg = mensagemBloqueio(m, 'autonomo');
      expect(msg).not.toMatch(/professor|personal/i);
      expect(msg.length).toBeGreaterThan(10);
    }
  });

  it('aluno vinculado e filiado não recebem detalhes de cobrança', () => {
    for (const m of motivos) {
      expect(mensagemBloqueio(m, 'aluno')).not.toMatch(/pagamento|cart|assine|R\$/i);
      expect(mensagemBloqueio(m, 'filiado')).not.toMatch(/cart|R\$/i);
    }
  });

  it('master recebe o caminho para assinar', () => {
    expect(mensagemBloqueio('trial_expirado', 'master')).toMatch(/Assine em Plano/);
    expect(mensagemBloqueio('pagamento_pendente', 'master')).toMatch(/forma de pagamento/);
  });
});

describe('intenção de assinatura (landing)', () => {
  it('aceita plano/ciclo válidos e usa mensal por padrão', () => {
    expect(lerIntencao(new URLSearchParams('plano=personal&ciclo=yearly&acao=assinar'))).toEqual({
      plano: 'personal',
      ciclo: 'yearly',
      acao: 'assinar',
    });
    expect(lerIntencao(new URLSearchParams('plano=individual'))).toMatchObject({
      plano: 'individual',
      ciclo: 'monthly',
    });
  });

  it('rejeita plano legado/inexistente, ciclo inválido e ação desconhecida', () => {
    expect(lerIntencao(new URLSearchParams('plano=team'))).toBeNull();
    expect(lerIntencao(new URLSearchParams('plano=personal&ciclo=weekly'))).toBeNull();
    expect(lerIntencao(new URLSearchParams('plano=personal&acao=hack'))).toBeNull();
    expect(lerIntencao(new URLSearchParams(''))).toBeNull();
  });

  it('ignora qualquer next/URL livre e só serializa plano/ciclo/acao', () => {
    const i = lerIntencao(new URLSearchParams('plano=personal&next=https://evil.test'));
    expect(i).not.toBeNull();
    expect(queryIntencao(i!, true)).toBe('plano=personal&ciclo=monthly&acao=assinar');
    expect(queryIntencao(i!)).not.toMatch(/evil|next/);
  });
});
