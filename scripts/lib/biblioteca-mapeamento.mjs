// =============================================================================
// Flvxus — Funções PURAS do gerador de seed da biblioteca global (pt-BR).
//
// Tudo aqui é determinístico e sem efeitos colaterais (sem rede, sem disco),
// para ser testável com vitest. O orquestrador (gerar-seed-biblioteca-ptbr.mjs)
// importa estas funções.
//
// Cobre:
//   - De-para de body_parts/target/secondary -> GRUPOS_MUSCULARES canônicos.
//   - De-para de equipments -> EQUIPAMENTOS canônicos.
//   - Escape seguro de strings pt-BR (apóstrofos) e montagem de arrays text[].
//   - Montagem do INSERT idempotente (mesmo padrão do seed já existente).
//   - Parser dos arquivos supabase/catalogo/*.sql (fonte de fallback).
// =============================================================================

/** Valores canônicos (espelham schemas/exercicio.ts). */
export const GRUPOS_MUSCULARES = [
  'Peito',
  'Costas',
  'Pernas',
  'Ombros',
  'Braços',
  'Core',
  'Corpo Inteiro',
  'Cardio',
];

export const EQUIPAMENTOS = [
  'Peso Livre',
  'Máquina',
  'Cabo',
  'Peso Corporal',
  'Elástico',
  'Kettlebell',
  'TRX',
  'Outros',
];

/**
 * Normaliza um termo em pt-BR: remove acentos, baixa caixa e colapsa espaços.
 * O catálogo mistura caixas ("Abdômen" vs "abdômen", "Smith" vs "smith"),
 * então o de-para precisa ser case/acento-insensível.
 */
export function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Mapeia UM termo muscular (body_part ou músculo-alvo) para o grupo canônico.
 * Retorna `null` quando não há regra (o chamador aplica o fallback só se a
 * lista inteira ficar vazia). Regras conforme o briefing.
 */
export function mapearGrupoMuscular(termo) {
  const t = normalizar(termo);
  if (!t) return null;

  const contem = (...palavras) => palavras.some((p) => t.includes(p));

  // Ordem importa: "corpo inteiro" e "cardio" antes dos grupos específicos.
  if (contem('corpo inteiro')) return 'Corpo Inteiro';
  if (contem('cardio', 'sistema cardiovascular')) return 'Cardio';

  if (contem('peito', 'peitorais', 'peitoral')) return 'Peito';

  if (
    contem(
      'costas',
      'latissimo',
      'dorsal',
      'dorsais',
      'trapezio',
      'eretores',
      'romboides',
    )
  ) {
    return 'Costas';
  }

  if (
    contem(
      'coxa',
      'coxas',
      'panturrilha',
      'gluteo',
      'quadriceps',
      'posteriores',
      'abdutor',
      'adutor',
      'perna',
      'pernas',
      'isquiotibiais',
    )
  ) {
    return 'Pernas';
  }

  if (contem('ombro', 'ombros', 'deltoide', 'deltoides')) return 'Ombros';

  if (
    contem('braco', 'bracos', 'biceps', 'triceps', 'antebraco', 'antebracos')
  ) {
    return 'Braços';
  }

  if (
    contem(
      'abdomen',
      'abdominais',
      'obliquo',
      'obliquos',
      'core',
      'flexores do quadril',
      'lombar',
    )
  ) {
    return 'Core';
  }

  return null;
}

/**
 * Mapeia a lista de termos musculares (body_parts + target + secondary) para a
 * lista de grupos canônicos: deduplica preservando a ordem canônica e garante
 * ao menos um grupo (fallback 'Corpo Inteiro').
 */
export function mapearGruposMusculares(termos) {
  const encontrados = new Set();
  for (const termo of termos ?? []) {
    const grupo = mapearGrupoMuscular(termo);
    if (grupo) encontrados.add(grupo);
  }
  if (encontrados.size === 0) encontrados.add('Corpo Inteiro');
  // Ordena pela ordem canônica para saída estável.
  return GRUPOS_MUSCULARES.filter((g) => encontrados.has(g));
}

/**
 * Mapeia UM equipamento do catálogo para o valor canônico do Flvxus.
 * Retorna `null` quando não bate nenhuma regra conhecida (o chamador decide o
 * fallback 'Outros' só se a lista inteira ficar vazia).
 */
export function mapearEquipamento(termo) {
  const t = normalizar(termo);
  if (!t) return null;

  const contem = (...palavras) => palavras.some((p) => t.includes(p));

  // Peso corporal / assistido antes de "barra" para não confundir "barra fixa".
  if (contem('peso corporal', 'assistido', 'barra fixa')) return 'Peso Corporal';
  if (contem('kettlebell')) return 'Kettlebell';
  if (contem('trx')) return 'TRX';
  if (contem('elastico', 'faixa', 'band')) return 'Elástico';
  if (contem('cabo', 'polia')) return 'Cabo';
  if (
    contem(
      'maquina',
      'smith',
      'leg press',
      'articulada',
      'alavanca',
      'sled',
    )
  ) {
    return 'Máquina';
  }
  if (contem('barra', 'halter', 'halteres', 'com peso', 'anilha', 'ez'))
    return 'Peso Livre';

  return null;
}

/**
 * Mapeia a lista de equipamentos do catálogo. Deduplica preservando a ordem
 * canônica. Se nada bater, usa 'Outros'. Se a lista de entrada vier vazia,
 * também usa 'Outros' (para nunca retornar lista vazia, como o exemplo-modelo).
 */
export function mapearEquipamentos(termos) {
  const lista = termos ?? [];
  const encontrados = new Set();
  for (const termo of lista) {
    const eq = mapearEquipamento(termo);
    if (eq) encontrados.add(eq);
  }
  // Fallback 'Outros' quando nada casa (lista vazia ou termos desconhecidos).
  if (encontrados.size === 0) encontrados.add('Outros');
  return EQUIPAMENTOS.filter((e) => encontrados.has(e));
}

/**
 * Escapa uma string para literal SQL (dobra aspas simples). NÃO adiciona as
 * aspas externas — use via `sqlString`.
 */
export function escaparSql(valor) {
  return String(valor ?? '').replace(/'/g, "''");
}

/** Monta um literal string SQL seguro ('...') ou `null`. */
export function sqlString(valor) {
  if (valor === null || valor === undefined) return 'null';
  return `'${escaparSql(valor)}'`;
}

/**
 * Monta um literal de array text[] no formato ARRAY['a','b']. Lista vazia vira
 * `ARRAY[]::text[]` (cast explícito para o Postgres inferir o tipo).
 */
export function sqlTextArray(itens) {
  const lista = (itens ?? []).filter((x) => x !== null && x !== undefined && String(x).length > 0);
  if (lista.length === 0) return `ARRAY[]::text[]`;
  const partes = lista.map((x) => sqlString(x));
  return `ARRAY[${partes.join(',')}]`;
}

/**
 * Monta UMA tupla do VALUES para o INSERT, na ordem:
 *   (name, muscle_groups, equipment, instructions, tips, common_errors, thumbnail_url)
 * `registro` deve ter: name, muscleGroups[], equipment[], instructions(string),
 * tips[], commonErrors[], thumbnailUrl(string|null).
 * Indentada para leitura; o INSERT completo é montado por `montarSeedSql`.
 */
export function montarTuplaValues(registro) {
  const name = sqlString(registro.name);
  const muscleGroups = sqlTextArray(registro.muscleGroups);
  const equipment = sqlTextArray(registro.equipment);
  const instructions = sqlString(registro.instructions ?? null);
  const tips = sqlTextArray(registro.tips);
  const commonErrors = sqlTextArray(registro.commonErrors);
  const thumbnail = sqlString(registro.thumbnailUrl ?? null);

  return (
    `  (${name},\n` +
    `   ${muscleGroups},\n` +
    `   ${equipment},\n` +
    `   ${instructions},\n` +
    `   ${tips},\n` +
    `   ${commonErrors},\n` +
    `   ${thumbnail})`
  );
}

const CABECALHO_SEED =
  `-- =============================================================================\n` +
  `-- Flvxus — Seed da BIBLIOTECA GLOBAL de exercícios (pt-BR) gerado por IA.\n` +
  `-- Gerado por scripts/gerar-seed-biblioteca-ptbr.mjs. NÃO editar à mão.\n` +
  `--\n` +
  `-- Insere SOMENTE linhas GLOBAIS (tenant_id null, created_by null, source null).\n` +
  `-- Idempotente: WHERE NOT EXISTS por (tenant_id is null + name). Rodar de novo\n` +
  `-- não duplica. instructions/tips/common_errors em pt-BR (gerados por IA sobre\n` +
  `-- os passos reais do catálogo). thumbnail_url = GIF público do bucket; video_url null.\n`;

/**
 * Monta o arquivo SQL de seed completo (idempotente) a partir dos registros.
 * `registros` já deve estar com os campos finais (pt-BR + de-para aplicado).
 */
export function montarSeedSql(registros, { total } = {}) {
  const qtd = registros.length;
  const cabecalho =
    CABECALHO_SEED +
    `-- Registros neste arquivo: ${qtd}${total ? ` (de ${total} no catálogo)` : ''}.\n` +
    `-- =============================================================================\n\n`;

  if (qtd === 0) {
    return cabecalho + `-- (nenhum registro gerado)\n`;
  }

  const tuplas = registros.map((r) => montarTuplaValues(r)).join(',\n');

  const corpo =
    `insert into public.exercises (\n` +
    `  tenant_id, created_by, source_exercise_id, name, muscle_groups, equipment,\n` +
    `  instructions, tips, common_errors, video_url, thumbnail_url\n` +
    `)\n` +
    `select\n` +
    `  null,                 -- tenant_id: GLOBAL\n` +
    `  null,                 -- created_by\n` +
    `  null,                 -- source_exercise_id\n` +
    `  v.name,\n` +
    `  v.muscle_groups,\n` +
    `  v.equipment,\n` +
    `  v.instructions,\n` +
    `  v.tips,\n` +
    `  v.common_errors,\n` +
    `  null,                 -- video_url: sempre null nos globais\n` +
    `  v.thumbnail_url\n` +
    `from (values\n` +
    `${tuplas}\n` +
    `) as v(name, muscle_groups, equipment, instructions, tips, common_errors, thumbnail_url)\n` +
    `where not exists (\n` +
    `  select 1 from public.exercises e\n` +
    `  where e.tenant_id is null and e.name = v.name\n` +
    `);\n`;

  return cabecalho + corpo;
}

/**
 * Monta o SQL de ROLLBACK: apaga os globais inseridos por este seed, usando um
 * critério seguro — tenant_id null E thumbnail_url apontando para o bucket
 * exercise-gifs/catalogo (os GIFs do catálogo). Não toca linhas de tenant.
 */
export function montarRollbackSql() {
  return (
    `-- =============================================================================\n` +
    `-- ROLLBACK do seed da biblioteca global (pt-BR).\n` +
    `-- Apaga APENAS globais (tenant_id null) cujo GIF vem do bucket do catálogo.\n` +
    `-- NÃO afeta exercícios de nenhum tenant. Revise antes de rodar.\n` +
    `-- =============================================================================\n\n` +
    `delete from public.exercises\n` +
    `where tenant_id is null\n` +
    `  and thumbnail_url like '%/exercise-gifs/catalogo/%';\n`
  );
}

// ---------------------------------------------------------------------------
// Parser dos arquivos supabase/catalogo/*.sql (fonte de fallback, opção b).
// ---------------------------------------------------------------------------

/** Faz o parse de um literal ARRAY['a','b'] (ou ARRAY[]) para string[]. */
function parseSqlArray(literal) {
  const trecho = literal.trim();
  const m = trecho.match(/^ARRAY\s*\[(.*)\]$/is);
  if (!m) return [];
  const inner = m[1].trim();
  if (inner === '') return [];
  const itens = [];
  // Divide por vírgulas que estão FORA de aspas simples. Trata '' como escape.
  let atual = '';
  let dentro = false;
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (c === "'") {
      if (dentro && inner[i + 1] === "'") {
        atual += "'";
        i++;
        continue;
      }
      dentro = !dentro;
      continue;
    }
    if (c === ',' && !dentro) {
      itens.push(atual);
      atual = '';
      continue;
    }
    if (dentro) atual += c;
  }
  // Empurra o último item coletado, se houver.
  if (atual.length > 0) itens.push(atual);
  return itens.map((s) => s.trim()).filter((s) => s.length > 0);
}

/** Faz o parse de um literal string SQL '...' (com '' escapado). */
function parseSqlString(literal) {
  const t = literal.trim();
  if (/^null$/i.test(t)) return null;
  const m = t.match(/^'([\s\S]*)'$/);
  if (!m) return t;
  return m[1].replace(/''/g, "'");
}

/**
 * Faz o parse dos passos de `instructions` do catálogo, que vêm como um literal
 * SQL cujo conteúdo é um JSON array de strings "Step:N ...". Retorna string[]
 * (os passos, SEM o prefixo "Step:N").
 */
export function parseInstructionSteps(literal) {
  const raw = parseSqlString(literal);
  if (!raw) return [];
  let arr;
  try {
    arr = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .map((s) => String(s).replace(/^\s*Step:\s*\d+\s*/i, '').trim())
    .filter((s) => s.length > 0);
}

/**
 * Divide a lista de argumentos de um VALUES(...) em literais top-level,
 * respeitando aspas simples (com '' escapado) e colchetes de ARRAY[...].
 */
function dividirArgumentos(conteudo) {
  const args = [];
  let atual = '';
  let dentro = false;
  let prof = 0;
  for (let i = 0; i < conteudo.length; i++) {
    const c = conteudo[i];
    if (c === "'") {
      if (dentro && conteudo[i + 1] === "'") {
        atual += "''";
        i++;
        continue;
      }
      dentro = !dentro;
      atual += c;
      continue;
    }
    if (!dentro) {
      if (c === '[' || c === '(') prof++;
      else if (c === ']' || c === ')') prof--;
      if (c === ',' && prof === 0) {
        args.push(atual);
        atual = '';
        continue;
      }
    }
    atual += c;
  }
  if (atual.trim().length > 0) args.push(atual);
  return args;
}

/**
 * Faz o parse do conteúdo de um arquivo supabase/catalogo/*.sql e devolve a
 * lista de registros do catálogo. Robusto a múltiplos VALUES(...) por INSERT.
 *
 * Colunas esperadas (na ordem do INSERT do catálogo):
 *   exercise_id, name_pt, name_original, slug, gif_url_source, storage_path,
 *   thumbnail_url, body_parts, equipments, target_muscles, secondary_muscles,
 *   instructions, created_at, updated_at
 */
export function parseCatalogoSql(texto) {
  const registros = [];
  // Captura cada tupla VALUES (...) — o conteúdo entre o '(' após VALUES/',' e o ')'.
  // Varredura manual para respeitar aspas e colchetes.
  const src = texto;
  let i = 0;
  const n = src.length;
  while (i < n) {
    // acha o próximo '(' que inicia uma tupla; aceita qualquer '(' top-level
    if (src[i] !== '(') {
      i++;
      continue;
    }
    // coleta até o ')' correspondente, respeitando aspas e colchetes
    let j = i + 1;
    let atual = '';
    let dentro = false;
    let prof = 0;
    let fechou = false;
    while (j < n) {
      const c = src[j];
      if (c === "'") {
        if (dentro && src[j + 1] === "'") {
          atual += "''";
          j += 2;
          continue;
        }
        dentro = !dentro;
        atual += c;
        j++;
        continue;
      }
      if (!dentro) {
        if (c === '[' || c === '(') {
          prof++;
          atual += c;
          j++;
          continue;
        }
        if (c === ']') {
          prof--;
          atual += c;
          j++;
          continue;
        }
        if (c === ')') {
          if (prof === 0) {
            fechou = true;
            j++;
            break;
          }
          prof--;
          atual += c;
          j++;
          continue;
        }
      }
      atual += c;
      j++;
    }

    if (!fechou) break;

    const args = dividirArgumentos(atual);
    // Só aceita tuplas com o nº esperado de colunas do catálogo (14).
    if (args.length >= 12) {
      const [
        exercise_id,
        name_pt,
        name_original,
        slug,
        _gif_url_source,
        _storage_path,
        thumbnail_url,
        body_parts,
        equipments,
        target_muscles,
        secondary_muscles,
        instructions,
      ] = args;

      // Uma tupla de DADOS do catálogo tem exercise_id e name_pt como literais
      // string ('...'). A lista de COLUNAS do INSERT tem identificadores nus
      // (exercise_id, name_pt, …) — rejeita essas exigindo literais entre aspas.
      const ehLiteral = (s) => /^\s*'/.test(s) || /^\s*null\s*$/i.test(s);
      if (!ehLiteral(exercise_id) || !ehLiteral(name_pt)) {
        i = j;
        continue;
      }
      const id = parseSqlString(exercise_id);
      const nome = parseSqlString(name_pt);
      if (id && nome) {
        registros.push({
          exercise_id: id,
          name_pt: nome,
          name_original: parseSqlString(name_original),
          slug: parseSqlString(slug),
          thumbnail_url: parseSqlString(thumbnail_url),
          body_parts: parseSqlArray(body_parts),
          equipments: parseSqlArray(equipments),
          target_muscles: parseSqlArray(target_muscles),
          secondary_muscles: parseSqlArray(secondary_muscles),
          instructionSteps: parseInstructionSteps(instructions),
        });
      }
    }
    i = j;
  }

  return registros;
}

/** Deduplica registros do catálogo por exercise_id, preservando o primeiro. */
export function dedupPorExerciseId(registros) {
  const vistos = new Set();
  const saida = [];
  for (const r of registros ?? []) {
    if (!r?.exercise_id || vistos.has(r.exercise_id)) continue;
    vistos.add(r.exercise_id);
    saida.push(r);
  }
  return saida;
}
