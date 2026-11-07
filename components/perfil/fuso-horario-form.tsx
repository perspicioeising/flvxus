'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { atualizarFusoHorario } from '@/actions/agenda';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/** Fusos do Brasil primeiro (o público do produto). */
const FUSOS_BRASIL = [
  'America/Sao_Paulo',
  'America/Manaus',
  'America/Cuiaba',
  'America/Fortaleza',
  'America/Belem',
  'America/Bahia',
  'America/Recife',
  'America/Porto_Velho',
  'America/Rio_Branco',
  'America/Noronha',
] as const;

/** Demais fusos suportados pelo runtime (sem os do Brasil). */
function outrosFusos(): string[] {
  try {
    const lista = (
      Intl as unknown as { supportedValuesOf?: (chave: string) => string[] }
    ).supportedValuesOf?.('timeZone');
    if (!lista) return [];
    return lista.filter((f) => !(FUSOS_BRASIL as readonly string[]).includes(f));
  } catch {
    return [];
  }
}

export interface FusoHorarioFormProps {
  /** Fuso atual (`profiles.timezone`). */
  fusoAtual: string;
}

/**
 * Seleção do fuso horário do perfil. A Agenda exibe tudo neste fuso; a
 * gamificação (dias de XP) continua em America/Sao_Paulo.
 */
export function FusoHorarioForm({ fusoAtual }: FusoHorarioFormProps) {
  const router = useRouter();
  const [pendente, iniciar] = React.useTransition();
  const [valor, setValor] = React.useState(fusoAtual);
  const [erro, setErro] = React.useState<string | null>(null);
  const outros = React.useMemo(() => outrosFusos(), []);
  const jaListado =
    (FUSOS_BRASIL as readonly string[]).includes(fusoAtual) || outros.includes(fusoAtual);

  function salvar() {
    setErro(null);
    iniciar(async () => {
      const r = await atualizarFusoHorario(valor);
      if (r.ok) {
        toast({ title: r.message ?? 'Fuso horário atualizado.' });
        router.refresh();
      } else {
        setErro(r.fieldErrors?.timezone ?? r.message ?? 'Não foi possível salvar.');
      }
    });
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="fuso-horario">Fuso horário</Label>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Select value={valor} onValueChange={setValor} disabled={pendente}>
            <SelectTrigger id="fuso-horario" className="min-h-11" aria-describedby={erro ? 'fuso-erro' : undefined}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectGroup>
                <SelectLabel>Brasil</SelectLabel>
                {FUSOS_BRASIL.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectGroup>
              {outros.length > 0 ? (
                <SelectGroup>
                  <SelectLabel>Outros</SelectLabel>
                  {outros.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ) : null}
              {!jaListado ? <SelectItem value={fusoAtual}>{fusoAtual}</SelectItem> : null}
            </SelectContent>
          </Select>
        </div>
        <Button type="button" className="min-h-11" onClick={salvar} disabled={pendente || valor === fusoAtual}>
          {pendente ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
      {erro ? (
        <p id="fuso-erro" role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">Usado para exibir os horários da sua agenda.</p>
      )}
    </div>
  );
}
