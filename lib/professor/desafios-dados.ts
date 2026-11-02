/**
 * Montagem SERVER-SIDE do painel de desafios do PERSONAL (G3, B2B intra-tenant).
 * Casca de leitura sob RLS, no molde de `lib/arena/dados.ts`: usa
 * `createClient()` (RLS ativo, nunca `service_role`) e DEGRADA POR BLOCO — uma
 * falha cai em estado neutro (lista vazia) e só é logada no servidor, nunca
 * derruba a tela.
 *
 * Antes de montar, um passo oportunístico e protegido chama
 * `gamification_settle_challenge` para cada desafio `coach` `active` cujo
 * `ends_on` já passou (apuração lazy e idempotente — o padrão do projeto, sem
 * cron). Em seguida, lista os desafios `coach` do professor (sob RLS, via
 * `gamification_challenges` + membership) e monta o placar de cada um via
 * `gamification_challenge_scoreboard`.
 *
 * É server-side por construção (só importada por RSCs, pois `createClient()`
 * depende de `cookies()`).
 */
import { createClient } from '@/lib/supabase/server';
import { diaSP } from '@/lib/arena/datas';
import type { ChallengeScoreboard } from '@/types/database.types';

/** Metadados mínimos de um desafio da turma, para liquidação oportunística. */
interface DesafioMeta {
  id: string;
  status: string;
  ends_on: string;
  created_at: string;
}

/** Dados prontos para a tela do painel de desafios (`/professor/desafios`). */
export interface PainelDesafios {
  /** Placares dos desafios `coach` do professor (mais recentes primeiro). */
  desafios: ChallengeScoreboard[];
}

/**
 * Monta o painel de desafios da turma do professor autenticado. Cada bloco é
 * protegido: a falha de um desafio (ou do passo de liquidação) não impede os
 * demais nem derruba a tela — degradação por bloco, como na Arena do aluno.
 *
 * As leituras são sob RLS: o professor só enxerga os desafios que criou (policy
 * de `SELECT` de `gamification_challenges`); os XP dos membros vêm da função
 * `SECURITY DEFINER` que projeta só o contrato público de competição.
 */
export async function montarPainelDesafios(): Promise<PainelDesafios> {
  const supabase = await createClient();

  let desafios: ChallengeScoreboard[] = [];

  try {
    const hoje = diaSP(new Date());

    // Desafios `coach` que eu criei (RLS: creator_id = auth.uid()).
    const { data: lista, error: erroLista } = await supabase
      .from('gamification_challenges')
      .select('id, status, ends_on, created_at')
      .eq('kind', 'coach')
      .order('created_at', { ascending: false });
    if (erroLista) {
      console.error('[montarPainelDesafios] lista:', erroLista.message);
    }

    const desafiosMeta: DesafioMeta[] = (lista ?? []).map((d) => ({
      id: d.id,
      status: d.status,
      ends_on: d.ends_on,
      created_at: d.created_at,
    }));

    // Passo oportunístico: liquida (idempotente) cada desafio active já vencido.
    // Protegido individualmente — uma liquidação que falhe não impede as demais
    // nem a montagem dos placares.
    if (hoje) {
      for (const d of desafiosMeta) {
        if (d.status === 'active' && d.ends_on < hoje) {
          try {
            const { error: erroSettle } = await supabase.rpc(
              'gamification_settle_challenge',
              { p_challenge_id: d.id }
            );
            if (erroSettle) {
              console.warn(
                '[montarPainelDesafios] liquidação de desafio:',
                erroSettle.message
              );
            }
          } catch (e) {
            console.warn('[montarPainelDesafios] liquidação de desafio (exceção):', e);
          }
        }
      }
    }

    // Placar de cada desafio (recomputado do ledger pela função controlada).
    const placares: ChallengeScoreboard[] = [];
    for (const d of desafiosMeta) {
      try {
        const { data: placar, error: erroPlacar } = await supabase.rpc(
          'gamification_challenge_scoreboard',
          { p_challenge_id: d.id }
        );
        if (erroPlacar) {
          console.error('[montarPainelDesafios] placar de desafio:', erroPlacar.message);
        } else if (placar) {
          const sb = placar as unknown as ChallengeScoreboard;
          if (sb.status === 'ok') {
            placares.push(sb);
          }
        }
      } catch (e) {
        console.error('[montarPainelDesafios] placar de desafio (exceção):', e);
      }
    }
    desafios = placares;
  } catch (e) {
    console.error('[montarPainelDesafios] (exceção):', e);
    desafios = [];
  }

  return { desafios };
}

/**
 * Monta o placar de UM desafio da turma (tela de acompanhamento
 * `/professor/desafios/[id]`). Protegido: liquida de forma oportunística se já
 * venceu e devolve o placar via função controlada, ou `null` em falha/não
 * encontrado. A autorização real (ser o criador) é imposta pela própria função
 * `SECURITY DEFINER` (`forbidden` quando não é o criador/membro).
 */
export async function montarPlacarDesafio(
  challengeId: string
): Promise<ChallengeScoreboard | null> {
  const supabase = await createClient();

  try {
    const hoje = diaSP(new Date());

    // Metadados do desafio (status/ends_on) para a liquidação oportunística.
    const { data: meta, error: erroMeta } = await supabase
      .from('gamification_challenges')
      .select('status, ends_on')
      .eq('id', challengeId)
      .maybeSingle();
    if (erroMeta) {
      console.error('[montarPlacarDesafio] meta:', erroMeta.message);
    }

    if (hoje && meta && meta.status === 'active' && meta.ends_on < hoje) {
      try {
        const { error: erroSettle } = await supabase.rpc(
          'gamification_settle_challenge',
          { p_challenge_id: challengeId }
        );
        if (erroSettle) {
          console.warn('[montarPlacarDesafio] liquidação:', erroSettle.message);
        }
      } catch (e) {
        console.warn('[montarPlacarDesafio] liquidação (exceção):', e);
      }
    }

    const { data: placar, error: erroPlacar } = await supabase.rpc(
      'gamification_challenge_scoreboard',
      { p_challenge_id: challengeId }
    );
    if (erroPlacar) {
      console.error('[montarPlacarDesafio] placar:', erroPlacar.message);
      return null;
    }
    if (!placar) {
      return null;
    }
    const sb = placar as unknown as ChallengeScoreboard;
    return sb.status === 'ok' ? sb : null;
  } catch (e) {
    console.error('[montarPlacarDesafio] (exceção):', e);
    return null;
  }
}
