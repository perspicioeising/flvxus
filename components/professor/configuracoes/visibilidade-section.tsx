'use client';

import * as React from 'react';

import { toast } from '@/hooks/use-toast';
import { atualizarVisibilidade } from '@/actions/filiados';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { VisibilityModule } from '@/types/database.types';

/** Rótulo pt-BR por módulo de visibilidade. */
const MODULO_LABEL: Record<VisibilityModule, string> = {
  students: 'Alunos',
  workouts: 'Treinos',
  assessments: 'Avaliações',
  diets: 'Dietas',
  exercises: 'Exercícios',
};

/** Ordem de exibição dos módulos. */
const ORDEM: VisibilityModule[] = ['students', 'workouts', 'assessments', 'diets', 'exercises'];

export interface VisibilidadeSectionProps {
  /** Estado atual por módulo (is_open: liberado/bloqueado). */
  valores: Record<VisibilityModule, boolean>;
}

/**
 * Seção de VISIBILIDADE por módulo (master-only). Um toggle por módulo:
 * LIBERADO (todos veem tudo) vs BLOQUEADO (cada filiado vê só o que cadastrou).
 * O enforcement real é na RLS; aqui apenas persistimos a config via action.
 */
export function VisibilidadeSection({ valores }: VisibilidadeSectionProps) {
  const [estado, setEstado] = React.useState<Record<VisibilityModule, boolean>>(valores);
  const [salvando, setSalvando] = React.useState<VisibilityModule | null>(null);

  async function aoAlternar(module: VisibilityModule, proximo: boolean) {
    const anterior = estado[module];
    setEstado((e) => ({ ...e, [module]: proximo }));
    setSalvando(module);

    const fd = new FormData();
    fd.append('module', module);
    fd.append('is_open', String(proximo));

    try {
      const r = await atualizarVisibilidade(undefined, fd);
      if (r.ok) {
        toast({ title: r.message ?? 'Visibilidade atualizada.' });
      } else {
        setEstado((e) => ({ ...e, [module]: anterior })); // reverte
        toast({ title: r.message ?? 'Não foi possível salvar.', variant: 'destructive' });
      }
    } catch {
      setEstado((e) => ({ ...e, [module]: anterior }));
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setSalvando(null);
    }
  }

  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-base">Visibilidade por módulo</CardTitle>
        <CardDescription>
          Liberado: todos os personais veem tudo do módulo. Bloqueado: cada filiado vê
          apenas o que ele mesmo cadastrou. Você (master) sempre vê tudo.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <ul className="divide-y divide-border">
          {ORDEM.map((module) => {
            const aberto = estado[module];
            const switchId = `visibilidade-${module}`;
            return (
              <li key={module} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <Label htmlFor={switchId} className="text-sm font-medium">
                    {MODULO_LABEL[module]}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {aberto ? 'Liberado (visão geral)' : 'Bloqueado (só o próprio autor)'}
                  </p>
                </div>
                <Switch
                  id={switchId}
                  checked={aberto}
                  disabled={salvando === module}
                  onCheckedChange={(v) => aoAlternar(module, v)}
                  aria-label={`Visibilidade de ${MODULO_LABEL[module]}`}
                />
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
