'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Copy } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { criarFichaMultiModelo } from '@/actions/treinos';
import type { AlunoOpcao } from './ficha-form';

export interface ModeloOpcao {
  id: string;
  name: string;
}

/** Rótulos posicionais padrão de divisão, na ordem de seleção dos modelos. */
const ROTULOS_PADRAO = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;

/**
 * Rótulo efetivo de um modelo selecionado: o valor digitado pelo professor
 * (com trim); se vazio, o rótulo posicional padrão da ordem de seleção
 * (1º = "A", 2º = "B", …). Nunca retorna string vazia — se o padrão posicional
 * acabar, cai para o nome do modelo (ou o id, como último recurso).
 */
function rotuloEfetivo(
  digitado: string | undefined,
  posicao: number,
  modelo: ModeloOpcao
): string {
  const limpo = (digitado ?? '').trim();
  if (limpo) return limpo;
  return ROTULOS_PADRAO[posicao] ?? (modelo.name.trim() || modelo.id);
}

/**
 * Diálogo para criar uma FICHA a partir de UM OU MAIS MODELOS, cada um virando
 * uma divisão (A/B/C/D/E). A ordem de seleção define o rótulo padrão; o
 * professor pode renomear cada divisão. A Server Action copia os itens de cada
 * modelo para a nova ficha carimbando a divisão. A ficha nasce como rascunho.
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
  // Ordem de marcação (define o rótulo posicional padrão).
  const [selecionados, setSelecionados] = React.useState<string[]>([]);
  // Rótulo editável por modelo (vazio => usa o padrão posicional).
  const [rotulos, setRotulos] = React.useState<Record<string, string>>({});
  const [studentId, setStudentId] = React.useState('');
  const [nome, setNome] = React.useState('');
  const [salvando, setSalvando] = React.useState(false);

  const desabilitado = selecionados.length === 0 || !studentId || !nome.trim() || salvando;

  // Motivo de o gatilho ficar indisponível, para explicar ao professor em vez
  // de só exibir um botão "apagado" sem contexto.
  const semModelos = modelos.length === 0;
  const semAlunos = alunos.length === 0;
  const motivoIndisponivel = semModelos
    ? 'Crie um modelo de treino primeiro.'
    : semAlunos
      ? 'Cadastre um aluno primeiro para montar a ficha dele.'
      : undefined;

  function alternarModelo(id: string, marcado: boolean) {
    setSelecionados((atual) =>
      marcado ? [...atual, id] : atual.filter((m) => m !== id)
    );
  }

  async function criar() {
    if (selecionados.length === 0 || !studentId || !nome.trim()) return;

    const modeloPorId = new Map(modelos.map((m) => [m.id, m]));
    const payloadModelos = selecionados.map((id, i) => ({
      source_workout_id: id,
      division: rotuloEfetivo(rotulos[id], i, modeloPorId.get(id) as ModeloOpcao),
    }));

    setSalvando(true);
    try {
      const r = await criarFichaMultiModelo({
        student_id: studentId,
        name: nome.trim(),
        modelos: payloadModelos,
      });
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
          disabled={Boolean(motivoIndisponivel)}
          title={motivoIndisponivel}
          aria-label={
            motivoIndisponivel
              ? `Criar a partir de modelo — indisponível: ${motivoIndisponivel}`
              : undefined
          }
        >
          <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
          Criar a partir de modelo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar ficha a partir de modelos</DialogTitle>
          <DialogDescription>
            Marque um ou mais modelos. Cada modelo vira uma divisão (A, B, C…) da
            ficha do aluno. Você poderá ajustar os exercícios depois.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Modelos (um por divisão)</Label>
            <ul className="space-y-2">
              {modelos.map((m) => {
                const marcado = selecionados.includes(m.id);
                const posicao = selecionados.indexOf(m.id);
                return (
                  <li
                    key={m.id}
                    className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
                  >
                    <Checkbox
                      id={`modelo-${m.id}`}
                      checked={marcado}
                      onCheckedChange={(v) => alternarModelo(m.id, v === true)}
                    />
                    <Label
                      htmlFor={`modelo-${m.id}`}
                      className="min-w-0 flex-1 cursor-pointer truncate font-normal"
                    >
                      {m.name}
                    </Label>
                    {marcado ? (
                      <Input
                        aria-label={`Rótulo da divisão para ${m.name}`}
                        className="h-9 w-24"
                        value={rotulos[m.id] ?? ''}
                        onChange={(e) =>
                          setRotulos((atual) => ({ ...atual, [m.id]: e.target.value }))
                        }
                        placeholder={ROTULOS_PADRAO[posicao] ?? 'Divisão'}
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
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
            <Label htmlFor="origem-nome">Nome da ficha</Label>
            <Input
              id="origem-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Treino ABC - Hipertrofia"
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
