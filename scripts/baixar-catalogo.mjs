// =============================================================================
// Passo 1: baixa o catálogo completo do ExerciseDB V1 (free) para um JSON local.
//
//   node baixar-catalogo.mjs
//
// A API gratuita não documenta a paginação, então o script descobre sozinho:
//   1. Se a resposta traz metadata.nextPage, segue esse link até acabar.
//   2. Senão, testa offset=, page= e skip= e usa o que devolver itens novos.
// Mostra o "metadata" da primeira resposta para diagnóstico.
//
// Variáveis opcionais: LIMIT (padrão 100), BASE_URL
// =============================================================================
import { writeFileSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'https://oss.exercisedb.dev/api/v1/exercises';
const LIMIT = Number(process.env.LIMIT ?? 100);
const OUT = 'exercisedb-catalogo.json';
const DELAY_MS = 1500;
const MAX_RETRIES = 8;
const MAX_PAGINAS = 300; // trava de segurança

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function pedir(url) {
  let espera = 3000;
  for (let tentativa = 1; tentativa <= MAX_RETRIES; tentativa++) {
    let res;
    try {
      res = await fetch(url);
    } catch (e) {
      const code = e?.cause?.code ?? e?.cause?.message ?? e.message;
      if (/CERT|SELF_SIGNED|UNABLE_TO_VERIFY/i.test(String(code))) {
        throw new Error(
          `Certificado TLS rejeitado (${code}). Rode com NODE_EXTRA_CA_CERTS=caminho/do/cert.pem ` +
          `ou, só para este download público, com NODE_TLS_REJECT_UNAUTHORIZED=0.`,
        );
      }
      console.log(`   … falha de rede (${code}) — aguardando ${Math.round(espera / 1000)}s (${tentativa}/${MAX_RETRIES})`);
      await sleep(espera);
      espera = Math.min(espera * 2, 30000);
      continue;
    }
    if ([429, 502, 503, 504].includes(res.status)) {
      const ra = Number(res.headers.get('retry-after'));
      const wait = Number.isFinite(ra) && ra > 0 ? ra * 1000 : espera;
      console.log(`   … ${res.status} — aguardando ${Math.round(wait / 1000)}s (${tentativa}/${MAX_RETRIES})`);
      await sleep(wait);
      espera = Math.min(espera * 2, 30000);
      continue;
    }
    if (!res.ok) throw new Error(`API ${res.status} em ${url}`);
    return res.json();
  }
  throw new Error(`API instável em ${url}. Tente de novo em alguns minutos.`);
}


// Termos usados no fallback (os mesmos do de-para do importador, sem repetição).
const TERMOS = [
  "Crunch",
  "Captain's chair knee raise",
  "Cable crunch",
  "Oblique crunch",
  "Decline sit-up",
  "Hip abduction machine",
  "Hip adduction machine",
  "Smith machine split squat",
  "Barbell back squat",
  "Dumbbell lunge",
  "Leg extension",
  "Cable crossover",
  "Dumbbell fly",
  "Incline cable fly",
  "Reverse dumbbell fly",
  "Barbell overhead press",
  "Dumbbell shoulder press",
  "Lying leg raise",
  "Barbell hip thrust",
  "Dumbbell front raise",
  "Cable front raise",
  "Dumbbell lateral raise",
  "Cable lateral raise",
  "Seated dumbbell lateral raise",
  "Cable face pull",
  "Lying leg curl",
  "Seated leg curl",
  "Cable glute kickback",
  "Hack squat",
  "Back extension",
  "Leg press",
  "Deadlift",
  "Rack pull",
  "Bench dip",
  "Standing calf raise",
  "Leg press calf raise",
  "Seated calf raise",
  "Parallel bar dip",
  "Dumbbell walking lunge",
  "Plank",
  "Rope straight arm pulldown",
  "Wide grip lat pulldown",
  "V-bar lat pulldown",
  "Cable pullover",
  "Wide grip seated cable row",
  "Seated cable row",
  "Bent over barbell row",
  "One arm dumbbell row",
  "Alternating dumbbell curl",
  "Concentration curl",
  "Incline dumbbell curl",
  "Barbell curl",
  "Cable curl",
  "EZ bar curl",
  "Cable rope curl",
  "Seated dumbbell curl",
  "Dumbbell hammer curl",
  "Preacher curl",
  "Stiff leg deadlift",
  "Romanian deadlift",
  "Decline barbell bench press",
  "Incline barbell bench press",
  "Incline dumbbell bench press",
  "Barbell bench press",
  "Dumbbell bench press",
  "Triceps rope pushdown",
  "Single arm triceps pushdown",
  "Seated overhead dumbbell triceps extension",
  "Cable overhead triceps extension",
  "Triceps pushdown",
  "EZ bar skull crusher",
  "Cable skull crusher",
  "Pec deck fly",
  "Reverse pec deck fly"
];
const PALAVRAS = ["crunch", "sit-up", "leg raise", "hip abduction", "hip adduction", "squat", "lunge", "leg extension", "crossover", "fly", "press", "raise", "hip thrust", "leg curl", "face pull", "kickback", "back extension", "deadlift", "rack pull", "dip", "calf raise", "plank", "pulldown", "pullover", "row", "curl", "skull crusher", "pushdown", "triceps extension", "pec deck"];
const SEARCH = BASE.replace(/\/exercises\/?$/, '/exercises/search');

/** Fallback: monta o catálogo a partir de buscas por termo (até ~25 resultados cada). */
async function montarPorBusca() {
  console.log(`\nMontando o catálogo por busca (${TERMOS.length} termos + ${PALAVRAS.length} palavras-chave). Leva alguns minutos...`);
  const buscas = [...TERMOS, ...PALAVRAS];
  for (const [i, termo] of buscas.entries()) {
    await sleep(2000);
    try {
      const json = await pedir(`${SEARCH}?search=${encodeURIComponent(termo)}&threshold=0.3`);
      const novos = adicionar(json?.data);
      console.log(`(${i + 1}/${buscas.length}) "${termo}": ${json?.data?.length ?? 0} resultados, ${novos} novos | total ${catalogo.length}`);
    } catch (e) {
      console.log(`(${i + 1}/${buscas.length}) "${termo}": falhou (${e.message})`);
    }
  }
}

import { readFileSync, existsSync } from 'node:fs';
const catalogo = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : [];
const ids = new Set(catalogo.map((e) => e.exerciseId));
if (catalogo.length) console.log(`Catálogo existente carregado: ${catalogo.length} exercícios (os novos serão somados).`);

/** Adiciona itens novos ao catálogo e devolve quantos eram realmente novos. */
function adicionar(data) {
  let novos = 0;
  for (const e of data ?? []) {
    if (e?.exerciseId && !ids.has(e.exerciseId)) {
      ids.add(e.exerciseId);
      catalogo.push(e);
      novos++;
    }
  }
  if (novos) writeFileSync(OUT, JSON.stringify(catalogo, null, 2));
  return novos;
}

function urlNextPage(np) {
  if (typeof np === 'string' && np.trim()) return new URL(np, BASE).href;
  return null;
}

async function main() {
  const primeira = await pedir(`${BASE}?limit=${LIMIT}`);
  const dados1 = primeira?.data ?? [];
  console.log('chaves da 1ª resposta:', Object.keys(primeira ?? {}).join(', '));
  const meta = primeira?.meta ?? primeira?.metadata ?? null;
  console.log('meta da 1ª resposta:', JSON.stringify(meta));
  console.log(`itens na 1ª página: ${dados1.length}`);
  adicionar(dados1);
  const total = meta?.totalExercises ?? meta?.total ?? meta?.totalCount ?? null;
  if (total) console.log(`total declarado pela API: ${total}`);
  if (!dados1.length) throw new Error('A API não devolveu itens em "data". Veja o metadata acima.');

  // ---- Estratégia 1: seguir metadata.nextPage ----
  let proxima = urlNextPage(meta?.nextPage ?? meta?.next);
  if (proxima) {
    console.log('Paginação: seguindo metadata.nextPage');
    for (let i = 0; proxima && i < MAX_PAGINAS; i++) {
      await sleep(DELAY_MS);
      const json = await pedir(proxima);
      const novos = adicionar(json?.data);
      console.log(`ok ${catalogo.length}${total ? '/' + total : ''}`);
      if (!novos) break;
      proxima = urlNextPage((json?.meta ?? json?.metadata)?.nextPage ?? (json?.meta ?? json?.metadata)?.next);
    }
  } else if (meta?.nextCursor ?? meta?.next_cursor) {
    // O nome do parâmetro do cursor não é documentado: descobrimos testando.
    const cursor0 = meta.nextCursor ?? meta.next_cursor;
    const idsPag1 = new Set(dados1.map((e) => e.exerciseId));
    const metaDe = (j) => j?.meta ?? j?.metadata ?? {};
    const nomes = ['cursor', 'after', 'nextCursor', 'startAfter', 'next'];
    let achado = null;
    busca: for (const nome of nomes) {
      for (const comLimit of [true, false]) {
        await sleep(DELAY_MS);
        const qs = `${comLimit ? `limit=${LIMIT}&` : ''}${nome}=${encodeURIComponent(cursor0)}`;
        const json = await pedir(`${BASE}?${qs}`);
        const d = json?.data ?? [];
        if (d.length && !idsPag1.has(d[0].exerciseId)) {
          achado = { nome, comLimit, json };
          break busca;
        }
        console.log(`   cursor via "${nome}"${comLimit ? ' + limit' : ''}: voltou a mesma página`);
      }
    }
    if (!achado) {
      console.warn('\nNenhum nome de parâmetro avançou o cursor. Usando o fallback por busca.');
      console.warn(`Me mande o resultado de: curl -sk "${BASE}?cursor=${cursor0}" (só o começo)`);
      await montarPorBusca();
    } else {
      console.log(`Paginação: cursor via "${achado.nome}"${achado.comLimit ? ' + limit' : ''}`);
      let json = achado.json;
      for (let i = 0; i < MAX_PAGINAS; i++) {
        adicionar(json?.data);
        console.log(`ok ${catalogo.length}${total ? '/' + total : ''} (páginas novas no catálogo)`);
        const m = metaDe(json);
        const prox = m.nextCursor ?? m.next_cursor ?? null;
        if (!prox || m.hasNextPage === false) break;
        await sleep(DELAY_MS);
        const qs = `${achado.comLimit ? `limit=${LIMIT}&` : ''}${achado.nome}=${encodeURIComponent(prox)}`;
        const proxima = await pedir(`${BASE}?${qs}`);
        if (!proxima?.data?.length || proxima.data[0].exerciseId === json.data[0].exerciseId) break;
        json = proxima;
      }
    }
  } else {
    // ---- Estratégia 2: descobrir o parâmetro de paginação ----
    const tam = dados1.length;
    const candidatos = [
      { nome: 'offset', url: (n) => `${BASE}?offset=${n * tam}&limit=${LIMIT}` },
      { nome: 'page', url: (n) => `${BASE}?page=${n + 1}&limit=${LIMIT}` },
      { nome: 'skip', url: (n) => `${BASE}?skip=${n * tam}&limit=${LIMIT}` },
    ];
    let escolhido = null;
    for (const c of candidatos) {
      await sleep(DELAY_MS);
      const json = await pedir(c.url(1));
      if (adicionar(json?.data) > 0) {
        escolhido = c;
        console.log(`Paginação: parâmetro "${c.nome}" funciona`);
        break;
      }
      console.log(`   parâmetro "${c.nome}" não paginou`);
    }
    if (!escolhido) {
      console.warn('\nNenhum parâmetro de paginação funcionou (offset/page/skip).');
      await montarPorBusca();
    } else {
      for (let n = 2; n < MAX_PAGINAS; n++) {
        await sleep(DELAY_MS);
        const json = await pedir(escolhido.url(n));
        const novos = adicionar(json?.data);
        console.log(`ok ${catalogo.length}${total ? '/' + total : ''}`);
        if (!novos) break;
        if (total && catalogo.length >= total) break;
      }
    }
  }

  console.log(`\nFeito: ${catalogo.length} exercícios salvos em ${OUT}`);
  if (total && catalogo.length < total) {
    console.log(`Atenção: a API declara ${total}, mas só consegui ${catalogo.length}.`);
  }
}

main().catch((e) => {
  console.error('Erro:', e.message);
  process.exit(1);
});
