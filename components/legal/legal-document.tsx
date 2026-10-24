import type { DocumentoLegal } from '@/lib/legal/documents';

/**
 * Apresentação de um documento legal (`/termos`, `/privacidade`).
 *
 * Container estreito (`max-w-3xl`) escolhido DE PROPÓSITO para legibilidade de
 * texto corrido — a `/documentacao` usa `max-w-6xl`, mas texto legal lê melhor
 * numa medida curta. Tom sóbrio, coerente com o grupo (marketing); sem card.
 */
export function LegalDocument({ documento }: { documento: DocumentoLegal }) {
  const dataFormatada = formatarData(documento.dataVigencia);

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12">
      <header className="mb-8 border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {documento.titulo}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Versão {documento.versao} · Vigente desde {dataFormatada}
        </p>
        <p className="mt-4 text-base text-muted-foreground">{documento.resumo}</p>
      </header>

      <div className="space-y-8">
        {documento.secoes.map((secao) => (
          <section key={secao.id} id={secao.id} className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">{secao.titulo}</h2>
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              {secao.conteudo}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}

/** Formata 'YYYY-MM-DD' como 'DD/MM/YYYY' (pt-BR), sem depender de timezone. */
function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-');
  if (!ano || !mes || !dia) {
    return iso;
  }
  return `${dia}/${mes}/${ano}`;
}
