'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Trophy } from 'lucide-react';

import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { criarDesafioTurma } from '@/actions/professor-desafios';

/** Um aluno do tenant selecionável como membro do desafio. */
export interface AlunoDesafioOpcao {
  userId: string;
  nome: string;
}

export interface FormularioDesafioProps {
  /** Alunos do tenant elegíveis (role='student'). */
  alunos: AlunoDesafioOpcao[];
}

/** Durações de desafio permitidas (dias). */
const DURACOES = [7, 15, 30] as const;

/**
 * Formulário de criação de um desafio da TURMA (kind='coach'): título, duração
 * (7/15/30 dias), multi-seleção dos alunos do tenant, meta e recompensa em
 * texto livre. Chama a Server Action `criarDesafioTurma` e repassa o `{status}`
 * para o feedback. A validação definitiva (gate, tenant, teto) é do banco.
 */
export function FormularioDesafio({ alunos }: FormularioDesafioProps) {
  const router = useRouter();
  const [pendente, iniciar] = React.useTransition();
  const [titulo, setTitulo] = React.useState('');
  const [dias, setDias] = React.useState<7 | 15 | 30>(7);
  const [selecionados, setSelecionados] = React.useState<Set<string>>(new Set());
  const [meta, setMeta] = React.useState('');
  const [recompensa, setRecompensa] = React.useState('');

  function alternarAluno(userId: string) {
    setSelecionados((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(userId)) {
        proximo.delete(userId);
      } else {
        proximo.add(userId);
      }
      return proximo;
    });
  }

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const memberIds = Array.from(selecionados);
    if (memberIds.length === 0) {
      toast({
        title: 'Selecione pelo menos um aluno.',
        variant: 'destructive',
      });
      return;
    }
    iniciar(async () => {
      const r = await criarDesafioTurma({
        title: titulo.trim() || undefined,
        dias,
        memberIds,
        goalText: meta.trim() || undefined,
        rewardText: recompensa.trim() || undefined,
      });
      if (r.ok && r.status === 'created') {
        toast({ title: 'Desafio criado para a turma.' });
        router.push('/professor/desafios');
        router.refresh();
      } else if (r.status === 'too_many_members') {
        toast({
          title: 'Selecione no máximo 100 alunos.',
          variant: 'destructive',
        });
      } else if (r.status === 'member_outside_tenant') {
        toast({
          title: 'Há um aluno fora da sua academia na seleção.',
          variant: 'destructive',
        });
      } else if (r.status === 'forbidden') {
        toast({
          title: 'Apenas o personal pode criar desafios da turma.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: r.message ?? 'Não foi possível criar o desafio.',
          variant: 'destructive',
        });
      }
    });
  }

  return (
    <form onSubmit={enviar} className="space-y-6">
      <div className="space-y-1">
        <Label htmlFor="desafio-titulo">Título</Label>
        <Input
          id="desafio-titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex.: Desafio de outubro"
          maxLength={280}
          disabled={pendente}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Duração</Label>
        <div className="grid grid-cols-3 gap-2">
          {DURACOES.map((d) => (
            <Button
              key={d}
              type="button"
              variant={dias === d ? 'default' : 'outline'}
              className={cn('min-h-11')}
              onClick={() => setDias(d)}
              disabled={pendente}
            >
              {d} dias
            </Button>
          ))}
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">
          Alunos ({selecionados.size} selecionado
          {selecionados.size === 1 ? '' : 's'})
        </legend>
        {alunos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum aluno disponível na sua academia.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-2xl border border-border">
            {alunos.map((a) => {
              const marcado = selecionados.has(a.userId);
              const id = `aluno-${a.userId}`;
              return (
                <li key={a.userId} className="flex items-center gap-3 p-3">
                  <Checkbox
                    id={id}
                    checked={marcado}
                    onCheckedChange={() => alternarAluno(a.userId)}
                    disabled={pendente}
                  />
                  <Label
                    htmlFor={id}
                    className="min-w-0 flex-1 cursor-pointer truncate font-normal"
                  >
                    {a.nome}
                  </Label>
                </li>
              );
            })}
          </ul>
        )}
      </fieldset>

      <div className="space-y-1">
        <Label htmlFor="desafio-meta">Meta</Label>
        <Textarea
          id="desafio-meta"
          value={meta}
          onChange={(e) => setMeta(e.target.value)}
          placeholder="Ex.: treinar 4x por semana"
          maxLength={280}
          rows={2}
          disabled={pendente}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="desafio-recompensa">Recompensa</Label>
        <Textarea
          id="desafio-recompensa"
          value={recompensa}
          onChange={(e) => setRecompensa(e.target.value)}
          placeholder="Ex.: aula experimental grátis"
          maxLength={280}
          rows={2}
          disabled={pendente}
        />
      </div>

      <Button
        type="submit"
        className="min-h-11 w-full sm:w-auto"
        disabled={pendente || selecionados.size === 0}
      >
        <Trophy className="mr-1 h-4 w-4" aria-hidden="true" />
        {pendente ? 'Criando…' : 'Criar desafio'}
      </Button>
    </form>
  );
}
