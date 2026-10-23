import Link from 'next/link';
import {
  Dumbbell,
  LineChart,
  PlayCircle,
  Plus,
  Utensils,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/** Um atalho do hub: rota de destino + rótulo + ícone + descrição curta. */
interface Atalho {
  href: string;
  titulo: string;
  descricao: string;
  icone: typeof Dumbbell;
}

/**
 * Hub de atalhos da ficha do aluno (lado professor). Agrupa, num único bloco,
 * links para as telas que o personal mais usa a partir do cadastro do aluno,
 * pré-contextualizando o aluno quando a rota de destino aceita (`?aluno=<id>`).
 *
 * É só navegação: todas as rotas já existem. Atalhos para seções que já estão
 * nesta mesma página (Treinos, Evolução) são âncoras internas, evitando
 * duplicar conteúdo. "Treinar com o aluno" leva à seção de Treinos, onde o
 * botão por ficha liberada já vive.
 */
export function AtalhosAluno({ alunoId }: { alunoId: string }) {
  const atalhos: Atalho[] = [
    {
      href: `/professor/treinos/nova?aluno=${alunoId}`,
      titulo: 'Criar treino',
      descricao: 'Montar uma nova ficha já com o aluno selecionado.',
      icone: Plus,
    },
    {
      href: '#treinos',
      titulo: 'Treinar com o aluno',
      descricao: 'Registrar a execução presencial a partir de uma ficha liberada.',
      icone: PlayCircle,
    },
    {
      href: `/professor/avaliacoes/nova?aluno=${alunoId}`,
      titulo: 'Nova avaliação',
      descricao: 'Lançar uma avaliação física com o aluno pré-selecionado.',
      icone: LineChart,
    },
    {
      href: '/professor/dietas',
      titulo: 'Dieta',
      descricao: 'Gerar, revisar e liberar o plano alimentar do aluno.',
      icone: Utensils,
    },
    {
      href: '#evolucao',
      titulo: 'Ver evolução',
      descricao: 'Progressão de carga, volume, frequência e composição.',
      icone: Dumbbell,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Atalhos</CardTitle>
        <CardDescription>
          Acesse rápido as funcionalidades deste aluno.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {atalhos.map((atalho) => {
            const Icone = atalho.icone;
            return (
              <li key={atalho.titulo}>
                <Link
                  href={atalho.href}
                  className="flex min-h-16 items-start gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icone className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="space-y-0.5">
                    <span className="block text-sm font-medium text-foreground">
                      {atalho.titulo}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {atalho.descricao}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
