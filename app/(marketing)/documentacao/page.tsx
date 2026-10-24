import type { Metadata } from 'next';

import { ConteudoAjuda } from '@/components/ajuda/conteudo-ajuda';

export const metadata: Metadata = {
  title: 'Documentação — Flvxus',
  description:
    'Documentação pública do Flvxus: como funciona a plataforma para o professor e para o aluno.',
};

/**
 * Página pública de documentação (/documentacao). Server Component sem gate de
 * login: reaproveita o conteúdo da ajuda interna (`ConteudoAjuda`) para os dois
 * papéis, professor e aluno, em pt-BR. O conteúdo é apresentação pura, então
 * pode ser renderizado numa rota pública sem refatoração.
 */
export default function DocumentacaoPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <header className="space-y-3">
        <h1 className="text-4xl font-black uppercase leading-[0.95] tracking-tight text-foreground md:text-5xl">
          Documentação do Flvxus
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Entenda como o Flvxus funciona e todas as funções disponíveis. A
          documentação está dividida por papel: o professor, que gerencia alunos,
          avaliações e treinos; e o aluno, que treina e acompanha a própria
          evolução.
        </p>
        <nav aria-label="Índice da documentação">
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
            <li>
              <a
                href="#para-o-professor"
                className="rounded px-2 py-1 text-emerald-700 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-emerald-400"
              >
                Para o professor
              </a>
            </li>
            <li>
              <a
                href="#para-o-aluno"
                className="rounded px-2 py-1 text-emerald-700 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-emerald-400"
              >
                Para o aluno
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <section id="para-o-professor" className="mt-12 scroll-mt-20">
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">
          Para o professor
        </h2>
        <ConteudoAjuda role="trainer" />
      </section>

      <section id="para-o-aluno" className="mt-16 scroll-mt-20">
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">
          Para o aluno
        </h2>
        <ConteudoAjuda role="student" />
      </section>
    </div>
  );
}
