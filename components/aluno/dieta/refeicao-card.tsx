import { Clock } from 'lucide-react';

import { totaisRefeicao, type TotaisRefeicao } from '@/lib/dieta/totais';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/** Alimento de uma refeição exibido no card (somente leitura). */
export interface AlimentoRefeicao {
  id: string;
  food_name: string;
  quantity: number | null;
  unit: string | null;
  kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
}

/** Refeição liberada com seus alimentos. */
export interface RefeicaoResumo {
  id: string;
  name: string;
  time: string | null;
  alimentos: AlimentoRefeicao[];
}

/** Formata a quantidade + unidade de um alimento (ex.: "100 g"). */
function formatarQuantidade(quantity: number | null, unit: string | null): string | null {
  if (quantity == null && !unit) {
    return null;
  }
  const qtd = quantity != null ? String(quantity) : '';
  const un = unit ?? '';
  return `${qtd}${qtd && un ? ' ' : ''}${un}`.trim() || null;
}

/** Formata a hora `HH:MM:SS`/`HH:MM` para `HH:MM`. */
function formatarHora(time: string | null): string | null {
  if (!time) {
    return null;
  }
  const match = /^(\d{2}):(\d{2})/.exec(time);
  return match ? `${match[1]}:${match[2]}` : time;
}

function arredondar(valor: number): string {
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(1);
}

/**
 * Card de uma refeição da dieta (horário, alimentos e subtotal). Somente
 * leitura. Mantido para o painel do professor (lista de refeições em cards).
 */
export function RefeicaoCard({ refeicao }: { refeicao: RefeicaoResumo }) {
  const totais: TotaisRefeicao = totaisRefeicao(refeicao.alimentos);
  const hora = formatarHora(refeicao.time);

  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{refeicao.name}</CardTitle>
          {hora ? (
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
              {hora}
            </span>
          ) : null}
        </div>
        <CardDescription>
          {arredondar(totais.kcal)} kcal · P {arredondar(totais.protein_g)} g · C{' '}
          {arredondar(totais.carbs_g)} g · G {arredondar(totais.fat_g)} g
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {refeicao.alimentos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem alimentos cadastrados.</p>
        ) : (
          <ul className="divide-y divide-border">
            {refeicao.alimentos.map((alimento) => {
              const quantidade = formatarQuantidade(alimento.quantity, alimento.unit);
              return (
                <li key={alimento.id} className="flex items-start justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {alimento.food_name}
                    </p>
                    {quantidade ? (
                      <p className="text-xs text-muted-foreground">{quantidade}</p>
                    ) : null}
                  </div>
                  {alimento.kcal != null ? (
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {arredondar(alimento.kcal)} kcal
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Refeição da dieta como item de accordion: horário em destaque + kcal/macros
 * no cabeçalho; os alimentos aparecem ao expandir. Somente leitura.
 */
export function RefeicaoLinha({ refeicao }: { refeicao: RefeicaoResumo }) {
  const totais: TotaisRefeicao = totaisRefeicao(refeicao.alimentos);
  const hora = formatarHora(refeicao.time);

  return (
    <AccordionItem
      value={refeicao.id}
      className="rounded-2xl border border-border bg-card px-4"
    >
      <AccordionTrigger className="hover:no-underline">
        <div className="flex min-w-0 flex-1 items-center gap-3 text-left">
          {hora ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-sm font-bold text-primary-soft-foreground">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {hora}
            </span>
          ) : null}
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-foreground">
              {refeicao.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {arredondar(totais.kcal)} kcal · P {arredondar(totais.protein_g)} g · C{' '}
              {arredondar(totais.carbs_g)} g · G {arredondar(totais.fat_g)} g
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {refeicao.alimentos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem alimentos cadastrados.</p>
        ) : (
          <ul className="divide-y divide-border">
            {refeicao.alimentos.map((alimento) => {
              const quantidade = formatarQuantidade(alimento.quantity, alimento.unit);
              return (
                <li key={alimento.id} className="flex items-start justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {alimento.food_name}
                    </p>
                    {quantidade ? (
                      <p className="text-xs text-muted-foreground">{quantidade}</p>
                    ) : null}
                  </div>
                  {alimento.kcal != null ? (
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {arredondar(alimento.kcal)} kcal
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
