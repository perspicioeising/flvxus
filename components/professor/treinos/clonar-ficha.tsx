'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Copy } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { clonarFicha } from '@/actions/treinos';
import type { AlunoOpcao } from './ficha-form';

export interface ClonarFichaProps {
  /** Ficha de origem a ser clonada. */
  sourcePlanId: string;
  sourceName: string;
  /** Alunos do tenant disponíveis para receber a cópia. */
  alunos: AlunoOpcao[];
  /**
   * Aparência do gatilho: `'botao'` (outline, para o detalhe) ou `'item'`
   * (ícone ghost discreto, para o canto de cada card da listagem). Default
   * `'botao'`.
   */
  variant?: 'botao' | 'item';
}

/**
 * Diálogo para CLONAR uma ficha existente para um NOVO aluno. O professor
 * escolhe o aluno (obrigatório) e pode ajustar o nome (default
 * `"<nome> (cópia)"`). A cópia é completa (todos os itens) e nasce como
 * rascunho. Em sucesso, navega para a nova ficha.
 */
export function ClonarFicha({
  sourcePlanId,
  sourceName,
  alunos,
  variant = 'botao',
}: ClonarFichaProps) {
  const router = useRouter();
  const [aberto, setAberto] = React.useState(false);
  const [studentId, setStudentId] = React.useState('');
  const [nome, setNome] = React.useState('');
  const [salvando, setSalvando] = React.useState(false);

  const nomePadrao = `${sourceName} (cópia)`;

  // Ao abrir, pré-preenche o nome com o padrão e limpa o aluno selecionado.
  React.useEffect(() => {
    if (aberto) {
      setNome(nomePadrao);
      setStudentId('');
      setSalvando(false);
    }
  }, [aberto, nomePadrao]);

  const semAlunos = alunos.length === 0;
  const motivoIndisponivel = semAlunos
    ? 'Cadastre um aluno primeiro para clonar a ficha para ele.'
    : undefined;

  const desabilitado = !studentId || !nome.trim() || salvando;

  async function clonar() {
    if (!studentId || !nome.trim()) return;

    setSalvando(true);
    try {
      const r = await clonarFicha({
        source_plan_id: sourcePlanId,
        student_id: studentId,
        name: nome.trim(),
      });
      if (r.ok) {
        toast({ title: r.message ?? 'Ficha clonada.' });
        setAberto(false);
        router.push(r.id ? `/professor/treinos/${r.id}` : '/professor/treinos');
        router.refresh();
      } else {
        toast({ title: r.message ?? 'Não foi possível clonar.', variant: 'destructive' });
        setSalvando(false);
      }
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' });
      setSalvando(false);
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        {variant === 'item' ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-11 w-11 shrink-0 text-muted-foreground hover:text-foreground"
                disabled={Boolean(motivoIndisponivel)}
                title={motivoIndisponivel ?? 'Clonar'}
                aria-label={
                  motivoIndisponivel
                    ? `Clonar ficha — indisponível: ${motivoIndisponivel}`
                    : `Clonar a ficha ${sourceName}`
                }
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{motivoIndisponivel ?? 'Clonar'}</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={Boolean(motivoIndisponivel)}
            title={motivoIndisponivel}
            aria-label={
              motivoIndisponivel
                ? `Clonar ficha — indisponível: ${motivoIndisponivel}`
                : undefined
            }
          >
            <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
            Clonar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clonar ficha de treino</DialogTitle>
          <DialogDescription>
            Cria uma cópia completa de “{sourceName}” para outro aluno. A cópia
            nasce como rascunho e só fica visível ao aluno quando você a liberar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="clonar-aluno">Novo aluno</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger id="clonar-aluno">
                <SelectValue placeholder="Selecione o aluno" />
              </SelectTrigger>
              <SelectContent>
                {alunos.map((a) => (
                  <SelectItem key={a.user_id} value={a.user_id}>
                    {a.full_name ?? 'Aluno sem nome'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="clonar-nome">Nome da ficha</Label>
            <Input
              id="clonar-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder={nomePadrao}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" className="min-h-11" disabled={desabilitado} onClick={clonar}>
            {salvando ? 'Clonando…' : 'Clonar ficha'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
