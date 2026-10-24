import Link from 'next/link';
import {
  Award,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  ListChecks,
  Minus,
  Star,
  TrendingDown,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/patterns';
import {
  formatarDuracao,
  formatarVolumeKg,
  type ComparacaoSessoes,
} from '@/lib/treino/resumo';

/** Mapeia o nome do ícone (achievements.icon) para um ícone lucide. */
const ICONES_CONQUISTA: Record<string, LucideIcon> = {
  Trophy,
  CalendarCheck,
  Flame,
  Star,
  Award,
};

function iconeConquista(nome: string | null): LucideIcon {
  if (nome && ICONES_CONQUISTA[nome]) return ICONES_CONQUISTA[nome];
  return Award;
}

/** Um exercício executado na sessão (para a lista). */
export interface ExercicioResumo {
  /** Chave estável (plan_item_id ou similar). */
  id: string;
  nome: string;
  /** Séries concluídas deste exercício. */
  seriesConcluidas: number;
}

/** Uma conquista desbloqueada nesta sessão. */
export interface ConquistaResumo {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  points: number;
}

/**
 * Estado da comparação com a última sessão comparável do mesmo treino/divisão.
 * - `primeira`        → não há nenhuma sessão anterior deste treino/divisão;
 * - `sem-comparavel`  → há anteriores, mas nenhuma com ≥ 1 série concluída;
 * - `comparavel`      → há base; `deltas` carrega as diferenças.
 */
export type ComparacaoEstado =
  | { tipo: 'primeira' }
  | { tipo: 'sem-comparavel' }
  | { tipo: 'comparavel'; deltas: ComparacaoSessoes };

export interface ResumoSessaoProps {
  /** Nome da ficha (contexto). */
  fichaNome: string;
  /** Rótulo da divisão/dia executado (ex.: 'A' ou 'Terça-feira'). */
  grupoLabel: string | null;
  /** Instantes ISO da sessão (para a duração em destaque). */
  inicioISO: string | null;
  fimISO: string | null;
  /** Volume total (kg) das séries concluídas. */
  volumeKg: number;
  /** Total de séries concluídas na sessão. */
  seriesConcluidas: number;
  /** Exercícios executados (com ≥ 1 série concluída), ordenados. */
  exercicios: ExercicioResumo[];
  /** Estado/deltas da comparação com a última sessão comparável. */
  comparacao: ComparacaoEstado;
  /** Conquistas desbloqueadas nesta sessão (pode ser vazio). */
  conquistas: ConquistaResumo[];
  /** Destino do botão "Voltar aos treinos". */
  href: string;
}

/** Formata um delta com sinal explícito (+/−) e separador pt-BR (1 casa). */
function formatarDelta(valor: number): string {
  const sinal = valor > 0 ? '+' : valor < 0 ? '−' : '';
  const abs = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
  }).format(Math.abs(valor));
  return `${sinal}${abs}`;
}

/** Linha de delta formatada (duração/volume/séries) com sinal e ícone. */
function LinhaDelta({
  label,
  valor,
  sufixo,
  percentual,
}: {
  label: string;
  valor: number;
  sufixo: string;
  percentual?: number | null;
}) {
  const positivo = valor > 0;
  const negativo = valor < 0;
  const Icon = positivo ? TrendingUp : negativo ? TrendingDown : Minus;
  const cor = positivo
    ? 'text-primary'
    : negativo
      ? 'text-destructive'
      : 'text-muted-foreground';

  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn('flex items-center gap-1.5 text-sm font-semibold', cor)}>
        <Icon className="h-4 w-4" aria-hidden="true" />
        {formatarDelta(valor)}
        {sufixo}
        {percentual !== null && percentual !== undefined
          ? ` (${percentual > 0 ? '+' : ''}${percentual}%)`
          : ''}
      </span>
    </div>
  );
}

/**
 * Apresentação do resumo pós-treino: herói de celebração com a duração em
 * destaque, cartões de métricas (volume, séries, exercícios), a comparação com
 * a última sessão comparável e as conquistas desbloqueadas. Puramente
 * apresentacional (RSC-safe). Tom de conquista, pt-BR, mobile-first (≥ 44px).
 */
export function ResumoSessao({
  fichaNome,
  grupoLabel,
  inicioISO,
  fimISO,
  volumeKg,
  seriesConcluidas,
  exercicios,
  comparacao,
  conquistas,
  href,
}: ResumoSessaoProps) {
  const duracao = formatarDuracao(inicioISO, fimISO);

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      {/* Herói de celebração. */}
      <div className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-app-glow">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-90">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Treino concluído
        </p>
        <p className="mt-3 text-sm opacity-90">
          {fichaNome}
          {grupoLabel ? ` · ${grupoLabel}` : ''}
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <Clock className="h-7 w-7 shrink-0 opacity-90" aria-hidden="true" />
          <span className="text-5xl font-black leading-none tabular-nums md:text-6xl">
            {duracao}
          </span>
        </div>
        <p className="mt-2 text-sm opacity-90">Mandou bem. Bora pra próxima!</p>
      </div>

      {/* Métricas principais. */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Volume levantado"
          value={formatarVolumeKg(volumeKg)}
          icon={Dumbbell}
          tone="emphasis"
          radius="2xl"
        />
        <StatCard
          label="Séries concluídas"
          value={seriesConcluidas}
          icon={ListChecks}
          radius="2xl"
        />
        <StatCard
          label="Exercícios"
          value={exercicios.length}
          icon={Dumbbell}
          radius="2xl"
        />
      </div>

      {/* Comparação com a última sessão comparável. */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          Comparação
        </p>
        {comparacao.tipo === 'primeira' ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Esta é a sua primeira sessão deste treino. A próxima já terá com o
            que comparar.
          </p>
        ) : comparacao.tipo === 'sem-comparavel' ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Sem sessão recente comparável deste treino.
          </p>
        ) : (
          <div className="mt-2 divide-y divide-border">
            <LinhaDelta
              label="Duração vs. última"
              valor={comparacao.deltas.duracaoSegundos}
              sufixo="s"
            />
            <LinhaDelta
              label="Volume vs. última"
              valor={comparacao.deltas.volumeKg}
              sufixo=" kg"
              percentual={comparacao.deltas.volumePercentual}
            />
            <LinhaDelta
              label="Séries vs. última"
              valor={comparacao.deltas.seriesConcluidas}
              sufixo=""
            />
          </div>
        )}
      </div>

      {/* Exercícios executados. */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          Exercícios executados
        </p>
        {exercicios.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Nenhuma série concluída nesta sessão.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {exercicios.map((ex) => (
              <li
                key={ex.id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <span className="min-w-0 flex-1 truncate font-semibold text-foreground">
                  {ex.nome}
                </span>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {ex.seriesConcluidas}{' '}
                  {ex.seriesConcluidas === 1 ? 'série' : 'séries'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Conquistas desbloqueadas (omitido quando vazio). */}
      {conquistas.length > 0 ? (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
            <Trophy className="h-4 w-4" aria-hidden="true" />
            Conquistas desbloqueadas
          </p>
          <ul className="space-y-3">
            {conquistas.map((c) => {
              const Icon = iconeConquista(c.icon);
              return (
                <li
                  key={c.id}
                  className="flex items-start gap-3 rounded-2xl bg-primary p-4 text-primary-foreground shadow-app-glow"
                >
                  <span className="mt-0.5 shrink-0 rounded-full bg-background/20 p-2">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-base font-bold">{c.name}</span>
                      {c.points > 0 ? (
                        <span className="shrink-0 text-sm font-bold">
                          +{c.points}
                        </span>
                      ) : null}
                    </div>
                    {c.description ? (
                      <p className="mt-0.5 text-xs opacity-90">
                        {c.description}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <Button asChild size="xl" className="w-full">
        <Link href={href}>Voltar aos treinos</Link>
      </Button>
    </section>
  );
}
