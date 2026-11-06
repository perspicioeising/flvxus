'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check, Target, Trophy, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CATALOGO, formatarBRL, type TierOfertado } from '@/lib/billing/catalogo';
import { queryIntencao } from '@/lib/billing/intencao';

const ICONES: Record<TierOfertado, typeof Target> = {
  individual: Target,
  personal: Users,
  assessoria: Trophy,
};

type Ciclo = 'monthly' | 'yearly';

/**
 * Seção de planos da landing (pública). Alternância Mensal/Anual; dois CTAs por
 * plano: "Testar 14 dias grátis" (cadastro com o plano pré-selecionado) e
 * "Assinar agora" (`/assinar`, que leva ao cadastro se visitante ou direto ao
 * checkout se logado). Price IDs nunca chegam ao cliente. Links para `/assinar`
 * usam `prefetch={false}` (a rota tem efeito colateral para logados).
 */
export function PlanosSection() {
  const [ciclo, setCiclo] = React.useState<Ciclo>('monthly');
  return (
    <section id="planos" className="mx-auto w-full max-w-6xl px-4 py-12 md:py-24">
      <div className="mb-8 max-w-2xl">
        <h2 className="text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl md:text-4xl">
          Planos para cada objetivo
        </h2>
        <p className="mt-2 text-muted-foreground">
          Comece com 14 dias de teste grátis, com acesso a todas as funcionalidades. Sem cartão e
          sem compromisso.
        </p>
        <div role="radiogroup" aria-label="Ciclo de cobrança" className="mt-4 inline-flex gap-2">
          {(['monthly', 'yearly'] as const).map((c) => (
            <Button
              key={c}
              type="button"
              role="radio"
              aria-checked={ciclo === c}
              variant={ciclo === c ? 'default' : 'outline'}
              className="min-h-11"
              onClick={() => setCiclo(c)}
            >
              {c === 'monthly' ? 'Mensal' : 'Anual'}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {CATALOGO.map((plano) => {
          const Icon = ICONES[plano.tier];
          const destaque = plano.tier === 'personal';
          const centavos = ciclo === 'yearly' ? plano.anualCentavos : plano.mensalCentavos;
          const query = queryIntencao({ plano: plano.tier, ciclo });
          return (
            <Card key={plano.tier} className={destaque ? 'border-primary shadow-md' : undefined}>
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  {destaque ? (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                      Mais popular
                    </span>
                  ) : null}
                </div>
                <CardTitle className="text-lg">{plano.nome}</CardTitle>
                <p className="text-sm text-muted-foreground">{plano.publico}</p>
                <div>
                  <p className="text-foreground">
                    <span className="text-3xl font-black tabular-nums">{formatarBRL(centavos)}</span>
                    <span className="text-sm text-muted-foreground">
                      {ciclo === 'yearly' ? '/ano' : '/mês'}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {ciclo === 'yearly'
                      ? `Equivale a ${formatarBRL(Math.round(plano.anualCentavos / 12))}/mês`
                      : `ou ${formatarBRL(plano.anualCentavos)}/ano no plano anual`}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {plano.itens.map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-2">
                  <Button asChild size="lg" variant={destaque ? 'default' : 'outline'} className="w-full">
                    <Link href={`/register?${query}`}>Testar 14 dias grátis</Link>
                  </Button>
                  <Button asChild size="lg" variant="secondary" className="w-full">
                    <Link href={`/assinar?${query}`} prefetch={false}>
                      Assinar agora
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        No plano anual você economiza em relação ao mensal. Cada plano tem uma franquia de uso dos
        recursos de IA.
      </p>
    </section>
  );
}
