# Visão geral das funcionalidades (estado atual)

> Doc de visão consolidada do produto na reta final. Descreve o que **existe** hoje, do ponto
> de vista de funcionalidade, para servir de referência a quem escreve copy, ajuda ou onboarding.
> Não inventa processos. Para detalhes de implementação/segurança, ver os docs específicos
> referenciados ao longo do texto (`roadmap-reta-final.md`, `billing.md`, `plano-gamificacao.md`,
> `architecture.md`).

## Papéis

O Flvxus atende dois públicos com três papéis de uso:

- **Personal (profissional)** — gerencia alunos, avaliações, exercícios, modelos, treinos e
  dietas. Monta o conteúdo e **libera** para cada aluno. Também usa o painel de desafios da turma.
- **Aluno vinculado** — recebe convite de um personal, usa a área do aluno (treino do dia,
  execução, dieta, hábitos, evolução, Arena). Vê apenas o que foi **liberado** para ele.
- **Aluno autônomo (self_managed)** — treina por conta própria (plano Individual). Usa a mesma
  área do aluno, mas **cria o próprio conteúdo** (treinos, dietas, avaliações), que **já nasce
  disponível para ele** — não há etapa de "liberar". Participa da Arena e dos rankings globais.

A regra de **liberação** ("liberar é o que entrega o conteúdo ao aluno") vale para o fluxo
personal↔aluno vinculado. Para o autônomo **não existe liberação**: o que ele cria aparece na hora.

## Hábitos do dia a dia

- **Hidratação** — registro de consumo de água com atalhos rápidos e **meta diária**. A meta é
  editável pelo próprio aluno (no card de hidratação) e, no fluxo com personal, também pode ser
  definida pelo professor na ficha do aluno.
- **Aderência à dieta** — botão **"cumpri hoje"** por refeição na tela da dieta.
- **Check-in diário** — confirmação simples, idempotente (uma vez por dia).

Esses hábitos alimentam a consistência medida pela Flvxus Arena.

## Flvxus Arena (gamificação)

Motor baseado em eventos imutáveis; premia **consistência**, não esforço absoluto. Ver
`docs/plano-gamificacao.md` e `docs/roadmap-reta-final.md` §Fase G.

- **XP por consistência** — ganho ao concluir treino planejado, cumprir a dieta do dia, bater a
  meta de água, registrar evolução, progredir carga e fazer check-in. Antifraude: 1 evento = 1 XP,
  limites por categoria, sem premiar excesso.
- **Níveis permanentes** — de Iniciante a Lenda; o XP acumulado nunca zera.
- **Streak** — respeita o plano (descanso programado não quebra; faltar a dia de treino, sim).
- **Missões** diárias/semanais e **conquistas** (catálogo de marcos).
- **Ranking da academia** — entre alunos do mesmo tenant; liga ativa a partir de um mínimo de
  participantes. O autônomo (tenant de 1) não vê esse ranking (esperado).
- **Rankings globais** (onda G2) — mensal e anual, cross-tenant; incluem o aluno autônomo.

### Social e desafios (onda G3)

- **Amigos** — adicionar por **@handle** (solicitação → o outro aceita); ranking entre amigos.
  O autônomo também pode ter amigos e participar de desafios cross-tenant (canal social opt-in,
  separado do isolamento B2B; expõe só XP/posição/nome público).
- **Desafios entre amigos (duelos)** — desafiar um amigo por **7, 15 ou 30 dias**. O duelo só
  **começa a valer quando os dois aceitam**; a partir daí conta o XP de cada um pelo período.
  **Vence quem somar mais XP.** A recompensa é a **medalha "Campeão de desafio"**; o duelo **não dá
  XP de bônus** (reconhecimento, não atalho). Enquanto o convite não é aceito, fica pendente
  ("aguardando aceite") e nada é contabilizado.
- **Painel de desafios do personal** — o professor cria desafios de XP para a turma (título,
  duração 7/15/30, seleção de alunos, meta e recompensa em texto livre) e acompanha o placar.

## Planos, trial e franquia de IA

Modelo comercial atual (ver `docs/roadmap-reta-final.md` §B2–B3; valores sujeitos a confirmação):

- **Individual** — para quem treina por conta própria.
- **Personal** — para o profissional.
- **Assessoria** — para equipes/academias (vários profissionais no mesmo espaço).
- **Trial de 14 dias** com acesso a todas as funcionalidades.
- **Franquia de uso de IA** por plano: limite de uso dos recursos de IA no período, com aviso/
  bloqueio ao exceder.

A mecânica de billing (Stripe, checkout, webhook, enforcement de limites) está descrita em
`docs/billing.md`. O mapeamento entre os nomes comerciais acima e o naming interno
`solo`/`team`/`gym` está anotado na nota do topo daquele doc.

## Onde isso aparece para o usuário

- **Landing pública** — `app/(marketing)/page.tsx` e FAQ em `components/marketing/landing-faq.tsx`.
- **Ajuda** (fonte única) — `components/ajuda/conteudo-ajuda.tsx`, consumida pela ajuda do
  professor, ajuda do aluno e pela documentação pública (`/documentacao`).
