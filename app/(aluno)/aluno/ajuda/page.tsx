import { ConteudoAjuda } from '@/components/ajuda/conteudo-ajuda';
import { PageHeader } from '@/components/patterns';

/**
 * Página de Ajuda do aluno. Server Component simples: monta o cabeçalho e
 * delega o conteúdo ao componente compartilhado, com o papel `student`. O gate
 * de acesso é herdado de `app/(aluno)/layout.tsx` (`requireRole('student')`).
 */
export default function AlunoAjudaPage() {
  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader
        emphasis="caps"
        title="Ajuda"
        subtitle="Como usar o Flvxus: ativar sua conta, ver e executar treinos, acompanhar a dieta, a evolução e as conquistas."
      />

      <ConteudoAjuda role="student" />
    </section>
  );
}
