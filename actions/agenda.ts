'use server';

import { revalidatePath } from 'next/cache';
import { getSessionUser, type SessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { requireEntitlement } from '@/lib/billing/guard';
import { erroDeCampo, type EstadoAcao } from '@/actions/_estado';
import { instanteDeLocal, validarTz } from '@/lib/agenda/fuso';
import { codigoErroAgenda, mensagemErroAgenda } from '@/lib/agenda/erros';
import { perfilAgenda, podeAgenda, type ContextoPermissao } from '@/lib/agenda/permissoes';
import type { AgendaScope, AppointmentKind, RecurFreq } from '@/lib/agenda/tipos';
import {
  atualizarFusoSchema,
  cancelarCompromissoSchema,
  criarCompromissoSchema,
  editarCompromissoSchema,
  type EscopoAgenda,
  type Repeticao,
} from '@/schemas/agenda';

/**
 * Server Actions da AGENDA (Fase 1). Ordem de cada escrita: `getSessionUser`
 * → `requireEntitlement(null, usuario)` INCONDICIONAL → Zod → permissões
 * (espelho de `lib/agenda/permissoes.ts`) → `supabase.rpc(agenda_*)` com o
 * cliente do usuário (RLS/JWT ativos; nunca `service_role`). A fronteira real
 * de autorização é das funções SQL `SECURITY DEFINER`; o gate de somente
 * leitura é a action. Design: §5.2 e §10.
 */

const FUSO_PADRAO = 'America/Sao_Paulo';
const MSG_SALVAR = 'Não foi possível salvar o compromisso.';
const MSG_CANCELAR = 'Não foi possível cancelar o compromisso.';

const ESCOPO_SQL: Record<EscopoAgenda, AgendaScope> = {
  ocorrencia: 'occurrence',
  seguintes: 'following',
  todos: 'all',
};

const FREQ_SQL: Record<Exclude<Repeticao, 'nenhuma'>, RecurFreq> = {
  diaria: 'daily',
  semanal: 'weekly',
  mensal: 'monthly',
};

function revalidarAgenda(): void {
  revalidatePath('/professor/agenda');
  revalidatePath('/aluno/agenda');
}

/** Resultado de erro de RPC: recuperável (código conhecido) ou genérico com log sem dados pessoais. */
function erroDeRpc(
  erro: { code?: string | null; message?: string | null },
  mensagemGenerica: string
): EstadoAcao {
  if (codigoErroAgenda(erro)) {
    return { ok: false, message: mensagemErroAgenda(erro) };
  }
  console.error('[agenda]', erro.code ?? 'desconhecido');
  return { ok: false, message: mensagemGenerica };
}

/** Regra de recorrência da entrada → parâmetros da RPC (`null` = sem regra / manter). */
function regraDeRepeticao(v: {
  repeticao?: Repeticao;
  diasSemana?: number[];
  ate?: string;
}): { freq: RecurFreq | null; dias: number[] | null; ate: string | null } {
  if (!v.repeticao || v.repeticao === 'nenhuma') return { freq: null, dias: null, ate: null };
  return {
    freq: FREQ_SQL[v.repeticao],
    dias: v.repeticao === 'semanal' ? [...(v.diasSemana ?? [])].sort((a, b) => a - b) : null,
    ate: v.ate ?? null,
  };
}

/** Converte `data` + `HH:mm` em instantes ISO no `tz` da série. `null` se a data/hora não resolver. */
function instantes(
  data: string,
  inicio: string,
  fim: string,
  tz: string
): { startsAt: string; endsAt: string } | null {
  try {
    return {
      startsAt: instanteDeLocal(data, inicio, tz).toISOString(),
      endsAt: instanteDeLocal(data, fim, tz).toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Cria um compromisso (avulso ou série). Professor: os 5 tipos; aluno e
 * autônomo: só `personal`. O fuso da série é `profiles.timezone` do criador.
 */
export async function criarCompromisso(input: unknown): Promise<EstadoAcao> {
  const usuario = await getSessionUser();
  if (!usuario) {
    return { ok: false, message: 'Sessão expirada.' };
  }
  const direito = await requireEntitlement(null, usuario);
  if (!direito.ok) {
    return { ok: false, message: direito.message ?? 'Assinatura inativa.' };
  }
  const parsed = criarCompromissoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Revise os dados do compromisso.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }
  const v = parsed.data;
  const perfil = perfilAgenda(usuario.role, usuario.accountType);
  if (!podeAgenda(perfil, v.tipo, 'criar')) {
    return { ok: false, message: 'Você não tem permissão para criar este tipo de compromisso.' };
  }

  const supabase = await createClient();
  const { data: perfilDb, error: erroPerfil } = await supabase
    .from('profiles')
    .select('timezone')
    .eq('user_id', usuario.userId)
    .single();
  if (erroPerfil || !perfilDb) {
    console.error('[agenda]', erroPerfil?.code ?? 'perfil');
    return { ok: false, message: MSG_SALVAR };
  }
  const tz = validarTz(perfilDb.timezone) ? perfilDb.timezone : FUSO_PADRAO;
  const quando = instantes(v.data, v.inicio, v.fim, tz);
  if (!quando) {
    return { ok: false, message: 'Data ou horário inválidos.', fieldErrors: { data: 'Data inválida.' } };
  }
  const regra = regraDeRepeticao(v);

  const { data, error } = await supabase.rpc('agenda_create', {
    p_kind: v.tipo as AppointmentKind,
    p_student_id: v.alunoId ?? null,
    p_title: v.titulo ?? null,
    p_notes: v.notas ?? null,
    p_location: v.local ?? null,
    p_starts_at: quando.startsAt,
    p_ends_at: quando.endsAt,
    p_recur_freq: regra.freq,
    p_recur_weekdays: regra.dias,
    p_recur_until: regra.ate,
  });
  if (error) return erroDeRpc(error, MSG_SALVAR);

  revalidarAgenda();
  return { ok: true, message: 'Compromisso criado.', id: data ?? undefined };
}

/** Linha mínima lida (sob RLS) para autorizar e resolver o fuso da série. */
interface LinhaAutorizacao {
  kind: AppointmentKind;
  owner_id: string;
  trainer_id: string | null;
  tz: string;
}

async function carregarLinha(
  id: string,
  usuario: SessionUser
): Promise<{ linha: LinhaAutorizacao; ctx: ContextoPermissao } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('appointments')
    .select('kind, owner_id, trainer_id, tz')
    .eq('id', id)
    .maybeSingle();
  if (!data) return null;
  return {
    linha: data as LinhaAutorizacao,
    ctx: {
      ehDono: data.owner_id === usuario.userId,
      ehMaster: usuario.isMaster,
      ehTrainerDoAtendimento: data.trainer_id === usuario.userId,
    },
  };
}

/**
 * Edita um compromisso. Horários são convertidos no `tz` DA SÉRIE (lido da
 * linha), nunca no do editor. `dataOcorrencia` é `meta.dataOriginal`.
 */
export async function editarCompromisso(input: unknown): Promise<EstadoAcao> {
  const usuario = await getSessionUser();
  if (!usuario) {
    return { ok: false, message: 'Sessão expirada.' };
  }
  const direito = await requireEntitlement(null, usuario);
  if (!direito.ok) {
    return { ok: false, message: direito.message ?? 'Assinatura inativa.' };
  }
  const parsed = editarCompromissoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Revise os dados do compromisso.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }
  const v = parsed.data;
  const alvo = await carregarLinha(v.id, usuario);
  if (!alvo) {
    return { ok: false, message: 'Compromisso não encontrado.' };
  }
  const perfil = perfilAgenda(usuario.role, usuario.accountType);
  if (!podeAgenda(perfil, alvo.linha.kind, 'editar', alvo.ctx)) {
    return { ok: false, message: 'Você não tem permissão para editar este compromisso.' };
  }
  const tz = validarTz(alvo.linha.tz) ? alvo.linha.tz : FUSO_PADRAO;
  const quando = instantes(v.data, v.inicio, v.fim, tz);
  if (!quando) {
    return { ok: false, message: 'Data ou horário inválidos.', fieldErrors: { data: 'Data inválida.' } };
  }
  // Em "somente esta ocorrência" a regra da série não muda.
  const regra =
    v.escopo === 'ocorrencia' ? { freq: null, dias: null, ate: null } : regraDeRepeticao(v);

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('agenda_update', {
    p_id: v.id,
    p_scope: ESCOPO_SQL[v.escopo],
    p_original_date: v.dataOcorrencia,
    p_title: v.titulo ?? null,
    p_notes: v.notas ?? null,
    p_location: v.local ?? null,
    p_starts_at: quando.startsAt,
    p_ends_at: quando.endsAt,
    p_recur_freq: regra.freq,
    p_recur_weekdays: regra.dias,
    p_recur_until: regra.ate,
  });
  if (error) return erroDeRpc(error, MSG_SALVAR);

  revalidarAgenda();
  return { ok: true, message: 'Compromisso atualizado.', id: data ?? v.id };
}

/** Cancela um compromisso (ocorrência, esta e seguintes, ou toda a série). */
export async function cancelarCompromisso(input: unknown): Promise<EstadoAcao> {
  const usuario = await getSessionUser();
  if (!usuario) {
    return { ok: false, message: 'Sessão expirada.' };
  }
  const direito = await requireEntitlement(null, usuario);
  if (!direito.ok) {
    return { ok: false, message: direito.message ?? 'Assinatura inativa.' };
  }
  const parsed = cancelarCompromissoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Revise os dados do cancelamento.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }
  const v = parsed.data;
  const alvo = await carregarLinha(v.id, usuario);
  if (!alvo) {
    return { ok: false, message: 'Compromisso não encontrado.' };
  }
  const perfil = perfilAgenda(usuario.role, usuario.accountType);
  if (!podeAgenda(perfil, alvo.linha.kind, 'cancelar', alvo.ctx)) {
    return { ok: false, message: 'Você não tem permissão para cancelar este compromisso.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc('agenda_cancel', {
    p_id: v.id,
    p_scope: ESCOPO_SQL[v.escopo],
    p_original_date: v.dataOcorrencia,
  });
  if (error) return erroDeRpc(error, MSG_CANCELAR);

  revalidarAgenda();
  return { ok: true, message: 'Compromisso cancelado.', id: v.id };
}

/**
 * Atualiza o fuso horário do PRÓPRIO perfil (isenta do gate: ação de conta).
 * O trigger do banco valida o nome IANA; o erro dele vira `fieldErrors.timezone`
 * (N6).
 */
export async function atualizarFusoHorario(timezone: string): Promise<EstadoAcao> {
  const usuario = await getSessionUser();
  if (!usuario) {
    return { ok: false, message: 'Sessão expirada.' };
  }
  const parsed = atualizarFusoSchema.safeParse({ timezone });
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Fuso horário inválido.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }
  const tz = parsed.data.timezone;
  if (!validarTz(tz)) {
    return {
      ok: false,
      message: 'Fuso horário inválido.',
      fieldErrors: { timezone: 'Fuso não suportado.' },
    };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ timezone: tz })
    .eq('user_id', usuario.userId);
  if (error) {
    // Erro do trigger de validação (nome IANA desconhecido pelo Postgres).
    if (error.code === '22023' || /time ?zone/i.test(error.message ?? '')) {
      return {
        ok: false,
        message: 'Fuso horário inválido.',
        fieldErrors: { timezone: 'Fuso não suportado.' },
      };
    }
    console.error('[agenda]', error.code ?? 'desconhecido');
    return { ok: false, message: 'Não foi possível salvar o fuso horário.' };
  }
  revalidarAgenda();
  revalidatePath('/aluno/perfil');
  revalidatePath('/professor/configuracoes');
  return { ok: true, message: 'Fuso horário atualizado.' };
}
