import { ConteudoAjuda } from '@/components/ajuda/conteudo-ajuda';

/**
 * Página de Ajuda do aluno. Server Component simples: monta o cabeçalho e
 * delega o conteúdo ao componente compartilhado, com o papel `student`. O gate
 * de acesso é herdado de `app/(aluno)/layout.tsx` (`requireRole('student')`).
 */
export default function AlunoAjudaPage() {
  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Ajuda</h1>
        <p className="text-sm text-muted-foreground">
          Como usar o Flvxus: ativar sua conta, ver e executar treinos, acompanhar a
          dieta, a evolução e as conquistas.
        </p>
      </header>

      <ConteudoAjuda role="student" />
    </section>
  );
}
