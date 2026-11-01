# Plano — Mapa Muscular (body map)

> Inspiração: projeto open-source openGym. Objetivo: upgrade de UX e valor percebido —
> ver de relance quais músculos um treino cobre (e, na Fase 2, onde há desequilíbrio).
> O dado-base já existe: `exercises.muscle_groups`.

## Fase 1 — Componente + 3 pontos de uso (APROVADA, próxima a implementar)
Status: a implementar **após** o merge do Grupo C (criação de ficha) e do ajuste do botão "Voltar",
para evitar conflito nos arquivos compartilhados (card de início do aluno, resumo pós-treino, montagem de ficha).

Entregáveis:
1. **Componente reutilizável** `components/muscle-map/` — um boneco (SVG, frente/costas) cujas regiões
   musculares "acendem" conforme uma lista de grupos musculares recebida por prop. Apresentacional,
   sem fetch. Tema claro/escuro por tokens. Acessível (aria-label descrevendo os grupos trabalhados).
2. **Card do próximo treino (aluno)** — mini body-map ao lado de "Próximo treino" mostrando os músculos
   da divisão. Arquivo: `components/aluno/inicio/card-treino-hoje.tsx` / `app/(aluno)/aluno/page.tsx`.
3. **Resumo pós-treino** — body-map dos músculos trabalhados na sessão, junto a volume/conquistas.
   Rota de resumo do aluno e a espelho do professor.
4. **Montagem da ficha (professor)** — body-map que atualiza conforme o professor adiciona exercícios,
   ajudando a não esquecer grupos (cobertura muscular da divisão/ficha).

Dado de entrada: união dos `muscle_groups` dos exercícios do conjunto (divisão/ficha/sessão).

### Ponto técnico a resolver na investigação
- **Granularidade dos `muscle_groups`**: mapear os valores reais usados hoje (amplos como "Pernas",
  "Costas", ou específicos como "quadríceps", "dorsal") para as regiões do SVG. Pode exigir uma
  tabela/constante de mapeamento valor→região. Se os valores forem amplos, o boneco acende regiões
  grandes (ainda útil); se forem específicos, fica mais rico. Investigar e normalizar o de-para.
- Sem mudança de schema esperada na Fase 1 (só leitura de muscle_groups já existente).

### De-para implementado (valor `muscle_groups` → região do SVG)
Granularidade confirmada na investigação (seeds `supabase/*seed*.sql` + rótulos das
telas + `schemas/exercicio.ts` / `components/exercices/.../constants/exercise.ts`): os
valores reais são AMPLOS, os 8 canônicos abaixo. O de-para vive em
`lib/muscle-map/regions.ts` (`normalizeGroup` + `regionsForGroups`), normaliza
acentos/caixa e IGNORA com segurança valores não mapeados (fallback conservador,
nunca quebra o render). Regiões do boneco (frente/costas): `chest`, `shoulders`,
`arms`, `core`, `quads`, `upperBack`, `glutes`, `hamstrings`.

| `muscle_groups` | Regiões acendidas |
| --- | --- |
| Peito | chest |
| Costas | upperBack |
| Ombros | shoulders |
| Braços | arms |
| Core | core |
| Pernas | quads + hamstrings + glutes |
| Corpo Inteiro | todas as regiões |
| Cardio | nenhuma (não é grupo localizado) |
| *(desconhecido)* | nenhuma (ignorado com segurança) |

Extras tolerados (aparecem em dados/rótulos reais, fora das 8 sugestões):
`Glúteos → glutes`, `Abdômen/Abdominal → core`.

Pontos de uso: (1) `components/aluno/inicio/card-treino-hoje.tsx` — mini mapa `sm`
`onPrimary` com os grupos da divisão (dia de descanso é tratado fora, por
`DescansoResumoCard`, então não quebra); (2) `components/aluno/execucao/resumo-sessao.tsx`
— mapa `md` com a união dos grupos executados na sessão (dado montado em
`lib/treino/resumo-dados.ts`), compartilhado pelas rotas de resumo do aluno e do
professor; (3) `components/professor/treinos/item-editor.tsx` — mapa de COBERTURA da
ficha/modelo inteiro sendo montado, reativo ao add/remove de exercícios.

## Fase 2 — Mapa de análise (3 modos) na tela de Evolução (futuro, não iniciada)
Mais pesada. Exige agregar histórico de sessões por grupo muscular ao longo do tempo. Três modos:
- **Volume**: onde o volume foi no período (grupos mais treinados).
- **Recuperação**: o que foi treinado recentemente (ainda "se recuperando").
- **Negligenciado**: o que está sem treinar há mais tempo.
Fica como etapa separada, a avaliar depois da Fase 1.

## Fora de escopo (do openGym, não adotar)
Self-host/sem-conta/sem-assinatura (oposto do modelo SaaS do Flvxus), import Strong/Hevy/FitNotes,
Apple Watch.
