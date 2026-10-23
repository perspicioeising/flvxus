import { ConteudoAjuda } from '@/components/ajuda/conteudo-ajuda';

/**
 * Página de Ajuda do professor. Server Component simples: monta o cabeçalho e
 * delega o conteúdo ao componente compartilhado, com o papel `trainer`. O gate
 * de acesso é herdado de `app/(professor)/layout.tsx` (`requireRole('trainer')`).
 */
export default function ProfessorAjudaPage() {
  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Ajuda</h1>
        <p className="text-sm text-muted-foreground">
          Como usar o Flvxus: cadastro de alunos, avaliações, exercícios, modelos,
          montagem e liberação de treinos, dietas e evolução.
        </p>
      </header>

      <ConteudoAjuda role="trainer" />
    </section>
  );
}
