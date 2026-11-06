'use client';

import * as React from 'react';

import { CheckoutButton } from '@/components/professor/plano/checkout-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatarBRL } from '@/lib/billing/catalogo';
import type { PlanTier } from '@/types/database.types';

export interface PlanoCardItem {
  tier: PlanTier;
  name: string;
  descricao: string;
  mensalCentavos: number | null;
  anualCentavos: number | null;
  semPriceMensal: boolean;
  semPriceAnual: boolean;
  /** Plano atual com assinatura ativa. */
  atual: boolean;
}

/**
 * Cards de planos com seletor Mensal/Anual. Os price IDs ficam no servidor: o
 * botão só envia tier+ciclo à action. Em trial, o botão avisa que a cobrança
 * começa agora (assinar encerra os dias restantes do teste).
 */
export function PlanosGrid({
  planos,
  cicloInicial,
  emTrial,
}: {
  planos: PlanoCardItem[];
  cicloInicial: 'monthly' | 'yearly';
  emTrial: boolean;
}) {
  const [ciclo, setCiclo] = React.useState<'monthly' | 'yearly'>(cicloInicial);
  return (
    <div className="space-y-4">
      <div role="radiogroup" aria-label="Ciclo de cobrança" className="inline-flex gap-2">
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
      <div className="grid gap-4 sm:grid-cols-3">
        {planos.map((plano) => {
          const centavos = ciclo === 'yearly' ? plano.anualCentavos : plano.mensalCentavos;
          const semPrice = ciclo === 'yearly' ? plano.semPriceAnual : plano.semPriceMensal;
          return (
            <Card key={plano.tier} className="flex flex-col">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-base">{plano.name}</CardTitle>
                <CardDescription>{plano.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto space-y-2 p-4">
                {centavos != null ? (
                  <p className="text-sm font-semibold text-foreground">
                    {formatarBRL(centavos)}
                    <span className="text-xs font-normal text-muted-foreground">
                      {' '}
                      /{ciclo === 'yearly' ? 'ano' : 'mês'}
                    </span>
                  </p>
                ) : null}
                {semPrice ? (
                  <p className="text-xs text-muted-foreground">Preço ainda não configurado.</p>
                ) : null}
                {emTrial && !plano.atual ? (
                  <p className="text-xs text-muted-foreground">
                    A cobrança começa agora e os dias restantes do teste são encerrados.
                  </p>
                ) : null}
                <CheckoutButton
                  tier={plano.tier}
                  cycle={ciclo}
                  label={plano.atual ? 'Plano atual' : 'Assinar'}
                  disabled={plano.atual || semPrice}
                  variant={plano.atual ? 'outline' : 'default'}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
