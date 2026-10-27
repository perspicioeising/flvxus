import Link from 'next/link';
import {
  Dumbbell,
  History,
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
import { TreinarAlunoSelector } from '@/components/professor/alunos/treinar-aluno-selector';

/** Um atalho do hub: rota de destino + rótulo + ícone + descrição curta. */
interface Atalho {
  href: string;
  titulo: string;
  descricao: string;
  icone: typeof Dumbbell;
}

/** Ficha liberada (status='released') usada para o atalho de treino presencial. */
interface FichaLiberada {
  id: string;
  name: string;
}

/** Classes compartilhadas pelo cartão de atalho (link, botão ou trigger do seletor). */
export const CARTAO_CLASSES =
  'flex min-h-16 items-start gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

/** Conteúdo interno do cartão de atalho (ícone + título + descrição). */
export function ConteudoAtalho({
  Icone,
  titulo,
  descricao,
}: {
  Icone: typeof Dumbbell;
  titulo: string;
  descricao: string;
}) {
  return (
    <>
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icone className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="space-y-0.5">
        <span className="block text-sm font-medium text-foreground">{titulo}</span>
        <span className="block text-xs text-muted-foreground">{descricao}</span>
      </span>
    </>
  );
}

/**
 * Hub de atalhos da ficha do aluno (lado professor). Agrupa, num único bloco,
 * links para as telas que o personal mais usa a partir do cadastro do aluno,
 * pré-contextualizando o aluno quando a rota de destino aceita (`?aluno=<id>`).
 *
 * É só navegação: todas as rotas já existem. Atalhos para seções que já estão
 * nesta mesma página (Treinos, Evolução) são âncoras internas, evitando
 * duplicar conteúdo.
 *
 * "Treinar com o aluno" é por aluno, mas a rota presencial exige uma ficha
 * liberada (`status='released'`). Resolvemos server-side com as fichas liberadas
 * recebidas da página (sem query nova), tratando três casos:
 * - 0 fichas liberadas: botão desabilitado com `title` explicando o porquê;
 * - 1 ficha liberada: link direto para o treino presencial daquela ficha;
 * - 2+ fichas liberadas: seletor (`TreinarAlunoSelector`) com um link direto para
 *   a rota presencial de cada ficha liberada, para o professor escolher qual usar.
 */
export function AtalhosAluno({
  alunoId,
  fichasLiberadas,
}: {
  alunoId: string;
  fichasLiberadas: FichaLiberada[];
}) {
  const atalhos: Atalho[] = [
    {
      href: `/professor/treinos/nova?aluno=${alunoId}`,
      titulo: 'Criar treino',
      descricao: 'Montar uma nova ficha já com o aluno selecionado.',
      icone: Plus,
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
    {
      href: '#historico',
      titulo: 'Histórico',
      descricao: 'Treinos concluídos com duração, volume e detalhes.',
      icone: History,
    },
  ];

  const descricaoTreinar =
    'Registrar a execução presencial a partir de uma ficha liberada.';

  // Link direto do "Treinar com o aluno" quando há exatamente 1 ficha liberada.
  // 0 → botão desabilitado; 2+ → seletor (ver JSX abaixo).
  const hrefTreinar =
    fichasLiberadas.length === 1
      ? `/professor/alunos/${alunoId}/treinar/${fichasLiberadas[0].id}`
      : null;

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
          {/* Treinar com o aluno — atalho especial (0 / 1 / 2+ fichas liberadas) */}
          <li>
            {fichasLiberadas.length >= 2 ? (
              <TreinarAlunoSelector
                alunoId={alunoId}
                fichasLiberadas={fichasLiberadas}
              />
            ) : hrefTreinar ? (
              <Link href={hrefTreinar} className={CARTAO_CLASSES}>
                <ConteudoAtalho
                  Icone={PlayCircle}
                  titulo="Treinar com o aluno"
                  descricao={descricaoTreinar}
                />
              </Link>
            ) : (
              <button
                type="button"
                disabled
                aria-disabled="true"
                title="Libere um treino para treinar presencialmente"
                className={`${CARTAO_CLASSES} w-full cursor-not-allowed text-left opacity-60 hover:border-border hover:bg-card`}
              >
                <ConteudoAtalho
                  Icone={PlayCircle}
                  titulo="Treinar com o aluno"
                  descricao={descricaoTreinar}
                />
              </button>
            )}
          </li>

          {atalhos.map((atalho) => {
            const Icone = atalho.icone;
            return (
              <li key={atalho.titulo}>
                <Link href={atalho.href} className={CARTAO_CLASSES}>
                  <ConteudoAtalho
                    Icone={Icone}
                    titulo={atalho.titulo}
                    descricao={atalho.descricao}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
