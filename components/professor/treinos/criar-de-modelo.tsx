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
import { criarFichaDeModelo } from '@/actions/treinos';
import type { AlunoOpcao } from './ficha-form';

export interface ModeloOpcao {
  id: string;
  name: string;
}

/**
 * Diálogo para criar uma FICHA a partir de um MODELO: escolhe o modelo de
 * origem e o aluno; a Server Action copia os itens do modelo para a nova ficha
 * (com `source_workout_id`). A ficha nasce como rascunho.
 */
export function CriarDeModelo({
  modelos,
  alunos,
}: {
  modelos: ModeloOpcao[];
  alunos: AlunoOpcao[];
}) {
  const router = useRouter();
  const [aberto, setAberto] = React.useState(false);
  const [modeloId, setModeloId] = React.useState('');
  const [studentId, setStudentId] = React.useState('');
  const [nome, setNome] = React.useState('');
  const [salvando, setSalvando] = React.useState(false);

  const desabilitado = !modeloId || !studentId || salvando;

  async function criar() {
    if (!modeloId || !studentId) return;
    setSalvando(true);
    try {
      const r = await criarFichaDeModelo(modeloId, studentId, nome);
      if (r.ok) {
        toast({ title: r.message ?? 'Ficha criada.' });
        setAberto(false);
        router.push(r.id ? `/professor/treinos/${r.id}` : '/professor/treinos');
        router.refresh();
      } else {
        toast({ title: r.message ?? 'Não foi possível criar.', variant: 'destructive' });
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
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={modelos.length === 0 || alunos.length === 0}
        >
          <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
          Criar a partir de modelo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar ficha a partir de modelo</DialogTitle>
          <DialogDescription>
            Os exercícios do modelo serão copiados para uma nova ficha do aluno.
            Você poderá ajustá-los depois.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="origem-modelo">Modelo de origem</Label>
            <Select value={modeloId} onValueChange={setModeloId}>
              <SelectTrigger id="origem-modelo">
                <SelectValue placeholder="Selecione o modelo" />
              </SelectTrigger>
              <SelectContent>
                {modelos.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="origem-aluno">Aluno</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger id="origem-aluno">
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
            <Label htmlFor="origem-nome">Nome da ficha (opcional)</Label>
            <Input
              id="origem-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Deixe em branco para usar o nome do modelo"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" className="min-h-11" disabled={desabilitado} onClick={criar}>
            {salvando ? 'Criando…' : 'Criar ficha'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
