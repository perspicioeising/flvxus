/**
 * Ilustração decorativa do hero: um frame de celular em CSS/SVG mostrando um
 * "treino do dia" com séries e um mini-gráfico de barras emerald.
 *
 * MOCK ilustrativo — trocar por print real do app aqui.
 *
 * É puramente decorativo: todo o bloco tem aria-hidden para não poluir leitores
 * de tela. Server Component (sem interatividade).
 */
export function HeroMock() {
  const barras = [38, 52, 44, 66, 58, 78, 70];

  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-sm select-none">
      {/* brilho de acento atrás do device */}
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-primary/10 blur-2xl" />

      {/* Device frame mobile */}
      <div className="mx-auto w-full max-w-[18rem] rounded-[2rem] border border-border bg-card p-3 shadow-xl">
        <div className="overflow-hidden rounded-[1.4rem] border border-border bg-background">
          {/* barra de topo */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="h-2 w-16 rounded-full bg-muted" />
            <div className="h-5 w-5 rounded-full bg-primary/20" />
          </div>

          {/* conteúdo: treino do dia */}
          <div className="space-y-4 p-4">
            <div className="space-y-1">
              <div className="h-2 w-20 rounded-full bg-muted" />
              <div className="h-4 w-32 rounded bg-foreground/80" />
            </div>

            {/* séries */}
            <div className="space-y-2">
              {['Supino reto', 'Agachamento', 'Remada'].map((nome, i) => (
                <div
                  key={nome}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2"
                >
                  <div className="h-3 w-24 rounded bg-muted-foreground/30" />
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {3 + i}×{10 + i * 2}
                  </span>
                </div>
              ))}
            </div>

            {/* mini-gráfico de barras emerald */}
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="mb-2 h-2 w-16 rounded-full bg-muted" />
              <div className="flex h-20 items-end gap-1.5">
                {barras.map((altura, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-primary/80"
                    style={{ height: `${altura}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
