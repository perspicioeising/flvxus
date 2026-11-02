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
import type { GamificationLeaderboard } from '@/types/database.types';

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
  /** `user_id` do próprio aluno — para destacar sua linha no ranking. */
  meuUserId: string;
  /** Missões do dia/semana com estado resolvido. */
  missoes: Missao[];
  /** Conquistas do tenant com o estado de obtenção resolvido. */
  conquistas: AgregacaoConquistas;
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

  return { perfil, ranking, meuUserId: userId, missoes, conquistas };
}
