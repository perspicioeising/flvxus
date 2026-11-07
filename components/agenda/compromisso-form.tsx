'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { criarCompromisso, editarCompromisso } from '@/actions/agenda';
import { diaLocal, horaLocal, weekdayDeDia } from '@/lib/agenda/fuso';
import { tiposCriaveis, type PerfilAgenda } from '@/lib/agenda/permissoes';
import type { AppointmentKind, EventoAgenda } from '@/lib/agenda/tipos';
import {
  criarCompromissoSchema,
  editarCompromissoSchema,
  REPETICOES,
  type EscopoAgenda,
  type Repeticao,
} from '@/schemas/agenda';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DIAS_SEMANA_CURTO } from '@/components/agenda/formatar';

const ROTULO_TIPO: Record<AppointmentKind, string> = {
  in_person: 'Atendimento presencial',
  online: 'Atendimento online',
  assessment: 'Avaliação física',
  personal: 'Compromisso pessoal',
  block: 'Bloqueio de horário',
};

const ROTULO_REPETICAO: Record<Repeticao, string> = {
  nenhuma: 'Não repetir',
  diaria: 'Todos os dias',
  semanal: 'Toda semana',
  mensal: 'Todo mês',
};

export interface AlunoOpcao {
  id: string;
  nome: string;
}

export interface EdicaoCompromisso {
  evento: EventoAgenda;
  escopo: EscopoAgenda;
}

export interface CompromissoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  perfil: PerfilAgenda;
  /** Alunos ativos (só o professor escolhe aluno). */
  alunos: AlunoOpcao[];
  /** Dia sugerido na criação (`YYYY-MM-DD`). */
  diaPadrao: string;
  /** Presente = edição. */
  edicao?: EdicaoCompromisso;
}

interface Valores {
  tipo: AppointmentKind;
  alunoId: string;
  titulo: string;
  notas: string;
  local: string;
  data: string;
  inicio: string;
  fim: string;
  repeticao: Repeticao;
  diasSemana: number[];
  ate: string;
}

/** Valores iniciais: criação (padrão) ou edição (campos da ocorrência, no fuso da SÉRIE). */
function valoresIniciais(
  perfil: PerfilAgenda,
  diaPadrao: string,
  edicao?: EdicaoCompromisso
): Valores {
  if (edicao) {
    const m = edicao.evento.meta;
    const tzSerie = String(m.tzSerie);
    const inicio = edicao.evento.inicio;
    const fim = edicao.evento.fim;
    // "seguintes"/"todos" só mudam hora e texto: a data é a da ocorrência D (M2).
    const data =
      edicao.escopo === 'ocorrencia' && inicio
        ? diaLocal(inicio, tzSerie)
        : String(m.dataOriginal);
    return {
      tipo: m.kind as AppointmentKind,
      alunoId: typeof m.alunoId === 'string' ? m.alunoId : '',
      titulo: typeof m.tituloGravado === 'string' ? m.tituloGravado : '',
      notas: typeof m.notas === 'string' ? m.notas : '',
      local: typeof m.local === 'string' ? m.local : '',
      data,
      inicio: inicio ? horaLocal(inicio, tzSerie) : '',
      fim: fim ? horaLocal(fim, tzSerie) : '',
      repeticao: 'nenhuma',
      diasSemana: [],
      ate: '',
    };
  }
  return {
    tipo: tiposCriaveis(perfil)[0] ?? 'personal',
    alunoId: '',
    titulo: '',
    notas: '',
    local: '',
    data: diaPadrao,
    inicio: '09:00',
    fim: '10:00',
    repeticao: 'nenhuma',
    diasSemana: [],
    ate: '',
  };
}

function useDesktop(): boolean {
  const [desktop, setDesktop] = React.useState(true);
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(min-width: 768px)');
    const atualizar = () => setDesktop(mq.matches);
    atualizar();
    mq.addEventListener?.('change', atualizar);
    return () => mq.removeEventListener?.('change', atualizar);
  }, []);
  return desktop;
}

/**
 * Formulário de compromisso (react-hook-form + `schemas/agenda.ts`, o mesmo
 * schema do servidor). Dialog no desktop, Sheet inferior no mobile. Aluno e
 * autônomo só criam "Compromisso pessoal"; "Bloqueio" só tem título e horário;
 * nos escopos seguintes/todos a data fica desabilitada (M2).
 */
export function CompromissoForm({
  open,
  onOpenChange,
  perfil,
  alunos,
  diaPadrao,
  edicao,
}: CompromissoFormProps) {
  const desktop = useDesktop();
  const titulo = edicao ? 'Editar compromisso' : 'Novo compromisso';
  const descricao = edicao
    ? 'Os horários são os do fuso em que o compromisso foi criado.'
    : 'Preencha os dados do compromisso.';

  const corpo = (
    <FormularioCorpo
      key={edicao ? `${edicao.evento.chave}:${edicao.escopo}` : `novo:${diaPadrao}`}
      perfil={perfil}
      alunos={alunos}
      diaPadrao={diaPadrao}
      edicao={edicao}
      onFechar={() => onOpenChange(false)}
    />
  );

  if (desktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{titulo}</DialogTitle>
            <DialogDescription>{descricao}</DialogDescription>
          </DialogHeader>
          {corpo}
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle>{titulo}</SheetTitle>
          <SheetDescription>{descricao}</SheetDescription>
        </SheetHeader>
        {corpo}
      </SheetContent>
    </Sheet>
  );
}

function FormularioCorpo({
  perfil,
  alunos,
  diaPadrao,
  edicao,
  onFechar,
}: Omit<CompromissoFormProps, 'open' | 'onOpenChange'> & { onFechar: () => void }) {
  const router = useRouter();
  const [pendente, iniciar] = React.useTransition();

  const resolver = React.useMemo<Resolver<Valores>>(() => {
    if (!edicao) return zodResolver(criarCompromissoSchema) as unknown as Resolver<Valores>;
    const base = zodResolver(editarCompromissoSchema) as unknown as Resolver<Valores>;
    return (values, ctx, opts) =>
      base(
        {
          ...values,
          // Campo de data desabilitado não entra nos valores do RHF: usa a da ocorrência D.
          ...(edicao.escopo !== 'ocorrencia' ? { data: edicao.evento.meta.dataOriginal } : {}),
          id: edicao.evento.meta.compromissoId,
          escopo: edicao.escopo,
          dataOcorrencia: edicao.evento.meta.dataOriginal,
          // Edição não altera a regra de repetição (a série mantém a sua).
          repeticao: undefined,
          diasSemana: undefined,
          ate: undefined,
        } as unknown as Valores,
        ctx,
        opts
      );
  }, [edicao]);

  const form = useForm<Valores>({
    resolver,
    defaultValues: valoresIniciais(perfil, diaPadrao, edicao),
  });
  const { register, control, handleSubmit, watch, setValue, setError, formState } = form;
  const erros = formState.errors;
  const tipo = watch('tipo');
  const repeticao = watch('repeticao');
  const diasSemana = watch('diasSemana');
  const data = watch('data');
  const ehBloqueio = tipo === 'block';
  const ehAtendimento = tipo === 'in_person' || tipo === 'online' || tipo === 'assessment';
  const tipos = tiposCriaveis(perfil);
  const dataTravada = !!edicao && edicao.escopo !== 'ocorrencia';

  function aoMudarRepeticao(v: Repeticao) {
    setValue('repeticao', v);
    if (v === 'semanal' && diasSemana.length === 0 && /^\d{4}-\d{2}-\d{2}$/.test(data)) {
      setValue('diasSemana', [weekdayDeDia(data)]);
    }
  }

  function alternarDia(dia: number, marcado: boolean) {
    const atual = new Set(diasSemana);
    if (marcado) atual.add(dia);
    else atual.delete(dia);
    setValue('diasSemana', [...atual].sort((a, b) => a - b), { shouldValidate: formState.isSubmitted });
  }

  const enviar = handleSubmit((v) => {
    iniciar(async () => {
      const comuns = {
        titulo: v.titulo,
        notas: ehBloqueio ? '' : v.notas,
        local: ehBloqueio ? '' : v.local,
        data: dataTravada ? String(edicao?.evento.meta.dataOriginal) : v.data,
        inicio: v.inicio,
        fim: v.fim,
      };
      const r = edicao
        ? await editarCompromisso({
            ...comuns,
            id: edicao.evento.meta.compromissoId,
            escopo: edicao.escopo,
            dataOcorrencia: edicao.evento.meta.dataOriginal,
          })
        : await criarCompromisso({
            ...comuns,
            tipo: v.tipo,
            alunoId: ehAtendimento ? v.alunoId : undefined,
            repeticao: v.repeticao,
            diasSemana: v.repeticao === 'semanal' ? v.diasSemana : undefined,
            ate: v.repeticao === 'nenhuma' ? undefined : v.ate,
          });
      if (r.ok) {
        toast({ title: r.message ?? 'Compromisso salvo.' });
        onFechar();
        router.refresh();
        return;
      }
      for (const [campo, mensagem] of Object.entries(r.fieldErrors ?? {})) {
        setError(campo as keyof Valores, { message: mensagem });
      }
      toast({ title: r.message ?? 'Não foi possível salvar o compromisso.', variant: 'destructive' });
    });
  });

  const erro = (campo: keyof Valores) =>
    erros[campo]?.message ? (
      <p id={`erro-${campo}`} role="alert" className="text-sm text-destructive">
        {String(erros[campo]?.message)}
      </p>
    ) : null;

  return (
    <form onSubmit={enviar} className="space-y-4" noValidate>
      {/* Tipo */}
      {edicao ? null : tipos.length > 1 ? (
        <div className="space-y-1">
          <Label htmlFor="comp-tipo">Tipo</Label>
          <Controller
            control={control}
            name="tipo"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="comp-tipo" className="min-h-11">
                  <SelectValue placeholder="Tipo de compromisso" />
                </SelectTrigger>
                <SelectContent>
                  {tipos.map((t) => (
                    <SelectItem key={t} value={t}>
                      {ROTULO_TIPO[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {erro('tipo')}
        </div>
      ) : (
        <p className="text-sm font-medium text-foreground">{ROTULO_TIPO.personal}</p>
      )}

      {/* Aluno (atendimentos, só na criação) */}
      {!edicao && ehAtendimento ? (
        <div className="space-y-1">
          <Label htmlFor="comp-aluno">Aluno</Label>
          <Controller
            control={control}
            name="alunoId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="comp-aluno" className="min-h-11">
                  <SelectValue placeholder="Escolha o aluno" />
                </SelectTrigger>
                <SelectContent>
                  {alunos.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {erro('alunoId')}
        </div>
      ) : null}

      <div className="space-y-1">
        <Label htmlFor="comp-titulo">
          Título{ehAtendimento ? ' (opcional)' : ''}
        </Label>
        <Input
          id="comp-titulo"
          className="min-h-11"
          maxLength={120}
          aria-invalid={!!erros.titulo}
          aria-describedby={erros.titulo ? 'erro-titulo' : undefined}
          {...register('titulo')}
        />
        {erro('titulo')}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <Label htmlFor="comp-data">Data</Label>
          <Input
            id="comp-data"
            type="date"
            className="min-h-11"
            disabled={dataTravada}
            aria-invalid={!!erros.data}
            aria-describedby={erros.data ? 'erro-data' : dataTravada ? 'ajuda-data' : undefined}
            {...register('data')}
          />
          {dataTravada ? (
            <p id="ajuda-data" className="text-xs text-muted-foreground">
              Para mudar o dia, edite somente este evento ou cancele e crie outro.
            </p>
          ) : null}
          {erro('data')}
        </div>
        <div className="space-y-1">
          <Label htmlFor="comp-inicio">Início</Label>
          <Input
            id="comp-inicio"
            type="time"
            className="min-h-11"
            aria-invalid={!!erros.inicio}
            aria-describedby={erros.inicio ? 'erro-inicio' : undefined}
            {...register('inicio')}
          />
          {erro('inicio')}
        </div>
        <div className="space-y-1">
          <Label htmlFor="comp-fim">Término</Label>
          <Input
            id="comp-fim"
            type="time"
            className="min-h-11"
            aria-invalid={!!erros.fim}
            aria-describedby={erros.fim ? 'erro-fim' : undefined}
            {...register('fim')}
          />
          {erro('fim')}
        </div>
      </div>

      {!ehBloqueio ? (
        <>
          <div className="space-y-1">
            <Label htmlFor="comp-local">Local (opcional)</Label>
            <Input id="comp-local" className="min-h-11" maxLength={200} {...register('local')} />
            {erro('local')}
          </div>
          <div className="space-y-1">
            <Label htmlFor="comp-notas">Notas (opcional)</Label>
            <Textarea id="comp-notas" rows={3} maxLength={1000} {...register('notas')} />
            {erro('notas')}
          </div>
        </>
      ) : null}

      {/* Repetição (só na criação) */}
      {!edicao ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="comp-repeticao">Repetição</Label>
            <Select value={repeticao} onValueChange={(v) => aoMudarRepeticao(v as Repeticao)}>
              <SelectTrigger id="comp-repeticao" className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPETICOES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROTULO_REPETICAO[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {repeticao === 'semanal' ? (
            <fieldset className="space-y-1">
              <legend className="text-sm font-medium text-foreground">Dias da semana</legend>
              <div className="grid grid-cols-7 gap-1">
                {DIAS_SEMANA_CURTO.map((nome, dia) => (
                  <label
                    key={nome}
                    className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg border border-border text-xs"
                  >
                    <Checkbox
                      checked={diasSemana.includes(dia)}
                      onCheckedChange={(c) => alternarDia(dia, c === true)}
                      aria-label={nome}
                    />
                    {nome}
                  </label>
                ))}
              </div>
              {erro('diasSemana')}
            </fieldset>
          ) : null}
          {repeticao !== 'nenhuma' ? (
            <div className="space-y-1">
              <Label htmlFor="comp-ate">Repetir até (opcional)</Label>
              <Input id="comp-ate" type="date" className="min-h-11" {...register('ate')} />
              {erro('ate')}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" className="min-h-11" onClick={onFechar} disabled={pendente}>
          Cancelar
        </Button>
        <Button type="submit" className="min-h-11" disabled={pendente}>
          {pendente ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}
