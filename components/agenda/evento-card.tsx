'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Ban,
  CalendarClock,
  ClipboardCheck,
  Droplets,
  Dumbbell,
  Repeat,
  User,
  Users,
  Utensils,
  Video,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { rotuloHorario } from '@/components/agenda/formatar';
import { SeloResponsavelDesativado } from '@/components/agenda/selo-responsavel-desativado';
import type { AppointmentKind, EventoAgenda, OrigemEvento, StatusEvento } from '@/lib/agenda/tipos';

const ICONE_ORIGEM: Record<Exclude<OrigemEvento, 'compromisso'>, LucideIcon> = {
  treino: Dumbbell,
  refeicao: Utensils,
  agua: Droplets,
};

const ICONE_TIPO: Record<AppointmentKind, LucideIcon> = {
  in_person: Users,
  online: Video,
  assessment: ClipboardCheck,
  personal: User,
  block: Ban,
};

const ROTULO_ORIGEM: Record<OrigemEvento, string> = {
  compromisso: 'Compromisso',
  treino: 'Treino',
  refeicao: 'Refeição',
  agua: 'Água',
};

/** Retorna as classes de cor do container do ícone, por origem/kind. */
function corIcone(origem: OrigemEvento, kind: AppointmentKind | undefined): string {
  if (origem === 'treino') return 'bg-primary/10 text-primary';
  if (origem === 'refeicao') return 'bg-warning/10 text-warning';
  if (origem === 'agua') return 'bg-info/10 text-info';
  // compromisso
  if (kind === 'block') return 'bg-destructive/10 text-destructive';
  if (kind === 'personal') return 'bg-muted text-muted-foreground';
  return 'bg-chart-4/10 text-chart-4';
}

const ROTULO_STATUS: Record<StatusEvento, string> = {
  pendente: 'Pendente',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  previsto: 'Previsto',
  atrasado: 'Atrasado',
};

const VARIANTE_STATUS: Record<StatusEvento, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pendente: 'secondary',
  concluido: 'default',
  cancelado: 'destructive',
  previsto: 'outline',
  atrasado: 'secondary',
};

export interface EventoCardProps {
  evento: EventoAgenda;
  /** Fuso do espectador (exibição dos horários). */
  tz: string;
  /** Instante atual (ISO), para marcar compromissos passados como somente leitura. */
  agoraIso: string;
  onEditar?: (evento: EventoAgenda) => void;
  onCancelar?: (evento: EventoAgenda) => void;
  onConcluir?: (evento: EventoAgenda) => void;
  /** Ação em andamento (desabilita os botões). */
  ocupado?: boolean;
}

/** Texto do botão de concluir conforme a ação do módulo de origem. */
function rotuloAcao(evento: EventoAgenda): string {
  const acao = evento.acao;
  if (!acao) return '';
  if (acao.tipo === 'link') return acao.rotulo;
  if (acao.tipo === 'concluir_refeicao') return evento.status === 'concluido' ? 'Desmarcar' : 'Concluir';
  return 'Concluir';
}

/**
 * Card de um evento da agenda. Ícone + texto diferenciam a origem (sem cores
 * novas). Compromisso de terceiro (não dono, nem trainer do atendimento, nem
 * master) e compromisso passado ficam SOMENTE LEITURA (§17 M3). Alvos ≥ 44px.
 */
export function EventoCard({
  evento,
  tz,
  agoraIso,
  onEditar,
  onCancelar,
  onConcluir,
  ocupado = false,
}: EventoCardProps) {
  const meta = evento.meta;
  const kind = (meta.kind as AppointmentKind | undefined) ?? undefined;
  const Icone = evento.origem === 'compromisso' ? ICONE_TIPO[kind ?? 'personal'] : ICONE_ORIGEM[evento.origem];
  const horario = rotuloHorario(evento.inicio, evento.fim, tz);
  const referencia = evento.fim ?? evento.inicio;
  const passado = evento.origem === 'compromisso' && referencia !== null && referencia < agoraIso;
  const editavel =
    evento.origem === 'compromisso' &&
    meta.podeEditar === true &&
    !passado &&
    evento.status !== 'cancelado';
  const local = typeof meta.local === 'string' && meta.local ? meta.local : null;
  const divisao = typeof meta.divisao === 'string' && meta.divisao ? meta.divisao : null;
  const prevista = meta.prevista === true;

  return (
    <article
      className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3"
      aria-label={`${ROTULO_ORIGEM[evento.origem]}: ${evento.titulo}`}
    >
      <div className="flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${corIcone(evento.origem, kind)}`}>
          <Icone className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="break-words text-sm font-semibold text-foreground">{evento.titulo}</p>
          <p className="text-xs text-muted-foreground">
            {ROTULO_ORIGEM[evento.origem]}
            {horario ? ` · ${horario}` : ''}
            {divisao ? ` · Divisão ${divisao}` : ''}
            {prevista ? ' · prevista' : ''}
            {local ? ` · ${local}` : ''}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={VARIANTE_STATUS[evento.status]}>{ROTULO_STATUS[evento.status]}</Badge>
            {meta.recorrente === true ? (
              <Badge variant="outline" className="gap-1">
                <Repeat className="h-3 w-3" aria-hidden="true" />
                Recorrente
              </Badge>
            ) : null}
            {meta.responsavelDesativado === true ? <SeloResponsavelDesativado /> : null}
            {passado ? (
              <Badge variant="outline" className="gap-1">
                <CalendarClock className="h-3 w-3" aria-hidden="true" />
                Somente leitura
              </Badge>
            ) : null}
          </div>
        </div>
      </div>
      {evento.acao || editavel ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {evento.acao?.tipo === 'link' ? (
            <Button asChild size="sm" className="min-h-11">
              <Link href={evento.acao.href}>{evento.acao.rotulo}</Link>
            </Button>
          ) : evento.acao ? (
            <Button
              type="button"
              size="sm"
              className="min-h-11"
              disabled={ocupado}
              onClick={() => onConcluir?.(evento)}
            >
              {rotuloAcao(evento)}
            </Button>
          ) : null}
          {editavel ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-11"
                disabled={ocupado}
                onClick={() => onEditar?.(evento)}
              >
                Editar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-h-11"
                disabled={ocupado}
                onClick={() => onCancelar?.(evento)}
              >
                Cancelar
              </Button>
            </>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
