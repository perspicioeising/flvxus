/**
 * Montagem SERVER-SIDE dos dados da Arena do aluno (nível/XP, streak, ranking,
 * missões e conquistas). Casca de leitura sob RLS, no molde de
 * `lib/treino/resumo-dados.ts`: usa `createClient()` (RLS ativo), nunca
 * `service_role`, e DEGRADA POR BLOCO — o erro de um bloco (perfil, ranking,
 * missões, conquistas) não derruba os demais; é só logado no servidor e aquele
 * bloco cai no seu estado vazio/zero-default.
 *
 * As funções puras de `lib/arena/{niveis,streak,missoes}` são a referência da
 * lógica; aqui só alimentamos elas com as leituras. É server-side por
 * construção (só importada por RSCs, pois `createClient()` depende de
 * `cookies()`).
 */
import { createClient } from '@/lib/supabase/server';
import { diaSP } from '@/lib/arena/datas';
import { nivelPorXp, type NivelArena } from '@/lib/arena/niveis';
import {
  montarMissoes,
  type Missao,
} from '@/lib/arena/missoes';
import {
  agregarConquistas,
  type AgregacaoConquistas,
  type ConquistaDisponivel,
  type ConquistaObtida,
} from '@/lib/gamificacao/conquistas';
import type {
  GamificationLeaderboard,
  GamificationGlobalLeaderboard,
  FriendsList,
  FriendsLeaderboard,
  ChallengeScoreboard,
} from '@/types/database.types';

/** Perfil derivado da Arena (zero-default quando não há linha do perfil). */
export interface PerfilArena {
  /** XP acumulado (soma de todos os eventos). */
  xp: number;
  /** Progresso de nível resolvido a partir do XP. */
  nivel: NivelArena;
  /** Sequência atual de dias-SP consecutivos com aderência. */
  streakAtual: number;
  /** Maior sequência já observada. */
  streakRecorde: number;
}

/** Dados prontos para a tela da Arena (`/aluno/arena`). */
export interface DadosArena {
  perfil: PerfilArena;
  /** Ranking do tenant (ou `null` quando a leitura falhou/indisponível). */
  ranking: GamificationLeaderboard | null;
  /** Ranking global mensal cross-tenant (ou `null` quando falhou/indisponível). */
  rankingGlobalMensal: GamificationGlobalLeaderboard | null;
  /** Ranking global anual cross-tenant (ou `null` quando falhou/indisponível). */
  rankingGlobalAnual: GamificationGlobalLeaderboard | null;
  /** `user_id` do próprio aluno — para destacar sua linha no ranking. */
  meuUserId: string;
  /** `@handle` social do próprio aluno, ou `null` quando não definido/indisponível. */
  meuHandle: string | null;
  /** Missões do dia/semana com estado resolvido. */
  missoes: Missao[];
  /** Conquistas do tenant com o estado de obtenção resolvido. */
  conquistas: AgregacaoConquistas;
  /** Conexões sociais do atleta (ou `null` quando a leitura falhou/indisponível). */
  amigos: FriendsList | null;
  /** Ranking de amigos (conjunto fechado eu+amigos; `null` quando falhou). */
  rankingAmigos: FriendsLeaderboard | null;
  /** Placares dos duelos do atleta (ativos/recentes). Lista vazia quando falhou. */
  desafios: ChallengeScoreboard[];
}

/** Perfil zero-default: aluno sem linha em `gamification_profiles` (lazy). */
function perfilZero(): PerfilArena {
  return {
    xp: 0,
    nivel: nivelPorXp(0),
    streakAtual: 0,
    streakRecorde: 0,
  };
}

/**
 * Monta todos os blocos da Arena para `userId`. Cada bloco é independente: uma
 * falha degrada apenas aquele bloco (perfil zero-default, ranking `null`,
 * missões derivadas do que houver, conquistas vazias). Todas as leituras são
 * sob RLS (o aluno só enxerga o próprio perfil/eventos; o ranking vem da função
 * SECURITY DEFINER que filtra o tenant internamente).
 */
export async function montarDadosArena(userId: string): Promise<DadosArena> {
  const supabase = await createClient();

  // --- Perfil (XP/nível/streak) — leitura barata do perfil já calculado.
  let perfil = perfilZero();
  try {
    const { data, error } = await supabase
      .from('gamification_profiles')
      .select('total_xp, current_streak, longest_streak')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      console.error('[montarDadosArena] perfil:', error.message);
    } else if (data) {
      perfil = {
        xp: data.total_xp,
        nivel: nivelPorXp(data.total_xp),
        streakAtual: data.current_streak,
        streakRecorde: data.longest_streak,
      };
    }
  } catch (e) {
    console.error('[montarDadosArena] perfil (exceção):', e);
  }

  // --- Ranking do tenant (gate de 5 participantes na própria função).
  let ranking: GamificationLeaderboard | null = null;
  try {
    const { data, error } = await supabase.rpc('gamification_tenant_leaderboard', {
      p_season: null,
    });
    if (error) {
      console.error('[montarDadosArena] ranking:', error.message);
    } else if (data) {
      ranking = data as unknown as GamificationLeaderboard;
    }
  } catch (e) {
    console.error('[montarDadosArena] ranking (exceção):', e);
  }

  // --- Ranking global mensal (cross-tenant, sem gate; degrada para null).
  let rankingGlobalMensal: GamificationGlobalLeaderboard | null = null;
  try {
    const { data, error } = await supabase.rpc('gamification_global_leaderboard', {
      p_period: 'monthly',
    });
    if (error) {
      console.error('[montarDadosArena] ranking global mensal:', error.code, error.message);
    } else if (data) {
      rankingGlobalMensal = data as unknown as GamificationGlobalLeaderboard;
    }
  } catch (e) {
    console.error('[montarDadosArena] ranking global mensal (exceção):', e);
  }

  // --- Ranking global anual (cross-tenant, sem gate; degrada para null).
  let rankingGlobalAnual: GamificationGlobalLeaderboard | null = null;
  try {
    const { data, error } = await supabase.rpc('gamification_global_leaderboard', {
      p_period: 'yearly',
    });
    if (error) {
      console.error('[montarDadosArena] ranking global anual:', error.code, error.message);
    } else if (data) {
      rankingGlobalAnual = data as unknown as GamificationGlobalLeaderboard;
    }
  } catch (e) {
    console.error('[montarDadosArena] ranking global anual (exceção):', e);
  }

  // --- Missões do dia/semana: derivadas de eventos reais de aderência.
  // `treinos`  = dias-SP de sessões concluídas (evento workout_completed);
  // `descansos`= dias-SP de descansos programados cumpridos.
  let missoes: Missao[] = [];
  try {
    const hoje = diaSP(new Date());
    const [eventosRes, descansosRes, habitosRes] = await Promise.all([
      supabase
        .from('gamification_events')
        .select('occurred_on')
        .eq('user_id', userId)
        .eq('event_type', 'workout_completed'),
      supabase
        .from('workout_plan_rest_completions')
        .select('completed_at')
        .eq('student_id', userId),
      // Eventos de HÁBITO do dia-SP (G2): a presença de cada tipo conclui a
      // missão diária correspondente. `hoje` null (data inválida) degrada para
      // uma query que não casa nada → flags false.
      supabase
        .from('gamification_events')
        .select('event_type')
        .eq('user_id', userId)
        .in('event_type', ['water_goal', 'meal_logged', 'diet_day'])
        .eq('occurred_on', hoje ?? '0001-01-01'),
    ]);
    if (eventosRes.error) {
      console.error('[montarDadosArena] missões (eventos):', eventosRes.error.message);
    }
    if (descansosRes.error) {
      console.error('[montarDadosArena] missões (descansos):', descansosRes.error.message);
    }
    const treinos = (eventosRes.data ?? []).map((e) => e.occurred_on);
    const descansos = (descansosRes.data ?? []).map((d) => d.completed_at);

    // Degradação por bloco: se a query de hábitos falhar, os três flags caem
    // para false (missões pendentes), apenas logado.
    let habitos = { aguaMetaAtingida: false, refeicoesRegistradas: false, dietaCumprida: false };
    if (habitosRes.error) {
      console.error('[montarDadosArena] missões (hábitos):', habitosRes.error.message);
    } else {
      const tipos = new Set((habitosRes.data ?? []).map((h) => h.event_type));
      habitos = {
        aguaMetaAtingida: tipos.has('water_goal'),
        refeicoesRegistradas: tipos.has('meal_logged'),
        dietaCumprida: tipos.has('diet_day'),
      };
    }

    missoes = montarMissoes({ treinos, descansos, habitos });
  } catch (e) {
    console.error('[montarDadosArena] missões (exceção):', e);
    missoes = montarMissoes({ treinos: [], descansos: [] });
  }

  // --- Conquistas (catálogo único, reusa a agregação pura).
  let conquistas: AgregacaoConquistas = agregarConquistas([], []);
  try {
    const [achievementsRes, obtidasRes] = await Promise.all([
      supabase
        .from('achievements')
        .select('id, name, description, icon, points')
        .order('created_at', { ascending: true }),
      supabase
        .from('user_achievements')
        .select('achievement_id, earned_at')
        .eq('student_id', userId),
    ]);
    if (achievementsRes.error) {
      console.error('[montarDadosArena] conquistas (catálogo):', achievementsRes.error.message);
    }
    if (obtidasRes.error) {
      console.error('[montarDadosArena] conquistas (obtidas):', obtidasRes.error.message);
    }
    const disponiveis: ConquistaDisponivel[] = achievementsRes.data ?? [];
    const obtidas: ConquistaObtida[] = obtidasRes.data ?? [];
    conquistas = agregarConquistas(disponiveis, obtidas);
  } catch (e) {
    console.error('[montarDadosArena] conquistas (exceção):', e);
  }

  // --- SOCIAL (G3): cada bloco é independente e degrada para estado neutro.

  // Meu @handle (leitura barata da própria linha de profiles, sob RLS).
  let meuHandle: string | null = null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('social_handle')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      console.error('[montarDadosArena] meu handle:', error.message);
    } else if (data) {
      meuHandle = data.social_handle;
    }
  } catch (e) {
    console.error('[montarDadosArena] meu handle (exceção):', e);
  }

  // Amigos: conexões agrupadas (contrato público) via função SECURITY DEFINER.
  let amigos: FriendsList | null = null;
  try {
    const { data, error } = await supabase.rpc('gamification_list_friends');
    if (error) {
      console.error('[montarDadosArena] amigos:', error.message);
    } else if (data) {
      amigos = data as unknown as FriendsList;
    }
  } catch (e) {
    console.error('[montarDadosArena] amigos (exceção):', e);
  }

  // Ranking de amigos (conjunto fechado eu+amigos aceitos; mensal, sem gate).
  let rankingAmigos: FriendsLeaderboard | null = null;
  try {
    const { data, error } = await supabase.rpc('gamification_friends_leaderboard', {
      p_period: 'monthly',
    });
    if (error) {
      console.error('[montarDadosArena] ranking de amigos:', error.message);
    } else if (data) {
      rankingAmigos = data as unknown as FriendsLeaderboard;
    }
  } catch (e) {
    console.error('[montarDadosArena] ranking de amigos (exceção):', e);
  }

  // Desafios (duelos): descobre os duelos do atleta, liquida de forma
  // oportunística os que já encerraram (idempotente), e monta o placar de cada
  // um. Tudo protegido: falha aqui cai em lista vazia, nunca derruba a Arena.
  let desafios: ChallengeScoreboard[] = [];
  try {
    const hoje = diaSP(new Date());

    // IDs dos desafios em que sou membro (RLS libera só as minhas linhas).
    const { data: membros, error: erroMembros } = await supabase
      .from('gamification_challenge_members')
      .select('challenge_id')
      .eq('user_id', userId);
    if (erroMembros) {
      console.error('[montarDadosArena] desafios (membros):', erroMembros.message);
    }

    const ids = Array.from(
      new Set((membros ?? []).map((m) => m.challenge_id))
    );

    if (ids.length > 0) {
      // Metadados dos duelos (kind='duel') — status/ends_on para a liquidação.
      const { data: duelos, error: erroDuelos } = await supabase
        .from('gamification_challenges')
        .select('id, status, ends_on, created_at')
        .in('id', ids)
        .eq('kind', 'duel')
        .order('created_at', { ascending: false });
      if (erroDuelos) {
        console.error('[montarDadosArena] desafios (duelos):', erroDuelos.message);
      }

      const lista = duelos ?? [];

      // Passo oportunístico: liquida (idempotente) cada duelo active já vencido.
      // Protegido individualmente — uma liquidação que falhe não impede as demais
      // nem a montagem dos placares.
      if (hoje) {
        for (const d of lista) {
          if (d.status === 'active' && d.ends_on < hoje) {
            try {
              const { error: erroSettle } = await supabase.rpc(
                'gamification_settle_challenge',
                { p_challenge_id: d.id }
              );
              if (erroSettle) {
                console.warn(
                  '[montarDadosArena] liquidação de desafio:',
                  erroSettle.message
                );
              }
            } catch (e) {
              console.warn('[montarDadosArena] liquidação de desafio (exceção):', e);
            }
          }
        }
      }

      // Placar de cada duelo (recomputado do ledger pela função controlada).
      const placares: ChallengeScoreboard[] = [];
      for (const d of lista) {
        try {
          const { data: placar, error: erroPlacar } = await supabase.rpc(
            'gamification_challenge_scoreboard',
            { p_challenge_id: d.id }
          );
          if (erroPlacar) {
            console.error('[montarDadosArena] placar de desafio:', erroPlacar.message);
          } else if (placar) {
            const sb = placar as unknown as ChallengeScoreboard;
            if (sb.status === 'ok') {
              placares.push(sb);
            }
          }
        } catch (e) {
          console.error('[montarDadosArena] placar de desafio (exceção):', e);
        }
      }
      desafios = placares;
    }
  } catch (e) {
    console.error('[montarDadosArena] desafios (exceção):', e);
    desafios = [];
  }

  return {
    perfil,
    ranking,
    rankingGlobalMensal,
    rankingGlobalAnual,
    meuUserId: userId,
    meuHandle,
    missoes,
    conquistas,
    amigos,
    rankingAmigos,
    desafios,
  };
}
