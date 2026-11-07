import { LoadingState } from '@/components/patterns';

export default function Loading() {
  return (
    <section className="mx-auto w-full max-w-5xl space-y-4">
      <LoadingState rows={5} label="Carregando a agenda…" />
    </section>
  );
}
