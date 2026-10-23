// =============================================================================
// Flvxus — Importar GIFs de demonstração dos exercícios (Opção B: hospedar)
// =============================================================================
// Para CADA exercício do tenant, este script:
//   1. Busca o GIF na API pública oss.exercisedb.dev (pelo termo em inglês do
//      de-para abaixo) e pega o `gifUrl` (ex.: https://static.exercisedb.dev/media/<id>.gif).
//   2. Baixa o GIF.
//   3. Faz upload para o bucket PÚBLICO `exercise-gifs` do SEU Supabase Storage.
//   4. Grava a URL pública resultante em `exercises.thumbnail_url` (casando por
//      nome + tenant). O GIF vai no thumbnail_url (NÃO video_url) porque a UI
//      (ExerciseVideoPlayer) renderiza thumbnailUrl como <img>, que toca GIF;
//      video_url é renderizado como <video>, que NÃO toca .gif.
//
// É IDEMPOTENTE: upsert no Storage (upsert:true) + UPDATE no banco; rodar de novo
// apenas sobrescreve. Loga um resumo (ok / não encontrado / erro) no fim.
//
// PRÉ-REQUISITOS:
//   - Rodar antes: supabase/criar-bucket-exercise-gifs.sql (cria o bucket público).
//   - Node 18+ (fetch nativo).
//   - @supabase/supabase-js já está nas dependências do projeto.
//
// COMO RODAR (a partir da raiz do projeto):
//   PowerShell:
//     $env:NEXT_PUBLIC_SUPABASE_URL="https://SEU-PROJ.supabase.co"
//     $env:SUPABASE_SERVICE_ROLE_KEY="<sua service_role key>"
//     node scripts/importar-gifs-exercicios.mjs
//   bash:
//     NEXT_PUBLIC_SUPABASE_URL="https://SEU-PROJ.supabase.co" \
//     SUPABASE_SERVICE_ROLE_KEY="<service_role>" \
//     node scripts/importar-gifs-exercicios.mjs
//
// ⚠️ A service_role key é SECRETA — nunca commite. Use só no seu terminal.
//
// REDE CORPORATIVA (proxy TLS com certificado self-signed): se o fetch falhar com
// "SELF_SIGNED_CERT_IN_CHAIN", rode com NODE_TLS_REJECT_UNAUTHORIZED=0 (aceita o
// cert do proxy — OK para um script pontual na sua máquina; NUNCA em produção):
//   bash:
//     NODE_TLS_REJECT_UNAUTHORIZED=0 \
//     NEXT_PUBLIC_SUPABASE_URL="https://SEU-PROJ.supabase.co" \
//     SUPABASE_SERVICE_ROLE_KEY="<service_role>" \
//     node importar-gifs-exercicios.mjs
//   (Alternativa limpa: NODE_EXTRA_CA_CERTS=caminho/do/cert-corporativo.pem)
//
// LICENÇA: os GIFs vêm do projeto ExerciseDB OSS (AGPL-3.0). Aqui apenas os
// BAIXAMOS e servimos como mídia a partir do seu Storage — não hospedamos a API
// deles. Avalie a conformidade conforme sua necessidade.
// =============================================================================

import { createClient } from '@supabase/supabase-js';

const TENANT_ID = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d'; // Treinador Eising
const BUCKET = 'exercise-gifs';
const API = 'https://oss.exercisedb.dev/api/v1/exercises';

const SUPABASE_URL = 'https://nltoaiiquuryjlnikyxy.supabase.co';
const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sdG9haWlxdXVyeWpsbmlreXh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjQ2MDg3NCwiZXhwIjoyMTA4MDM2ODc0fQ.YmUb-XQpEsZq7PxBrZ7QB6qXmjyh6GJWal0mfFRQo2c';

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// De-para: nome EXATO do exercício no banco (pt-BR) -> termo de busca em inglês.
// Vários exercícios compartilham o mesmo termo — ok, cada um recebe o mesmo GIF.
const DE_PARA = [
  ['Abdominal crunch (tradicional)', 'Crunch'],
  ['Abdominal infra na torre', "Captain's chair knee raise"],
  ['Abdominal na polia (Crunch)', 'Cable crunch'],
  ['Abdominal oblíquo (crunch com rotação)', 'Oblique crunch'],
  ['Abdominal supra na prancha declinada', 'Decline sit-up'],
  ['Abdominal supra no solo', 'Crunch'],
  ['Abdução de quadril na máquina', 'Hip abduction machine'],
  ['Abdutor (Cadeira Abdutora)', 'Hip abduction machine'],
  ['Adutor (Cadeira Adutora)', 'Hip adduction machine'],
  ['Afundo no Smith com step', 'Smith machine split squat'],
  ['Agachamento livre', 'Barbell back squat'],
  ['Agachamento livre com barra', 'Barbell back squat'],
  ['Avanço (passada) com halteres', 'Dumbbell lunge'],
  ['Cadeira extensora', 'Leg extension'],
  ['Cross over', 'Cable crossover'],
  ['Crucifixo com halteres (banco reto)', 'Dumbbell fly'],
  ['Crucifixo inclinado cabo', 'Incline cable fly'],
  ['Crucifixo inverso (posterior de ombro)', 'Reverse dumbbell fly'],
  ['Desenvolvimento com barra (militar)', 'Barbell overhead press'],
  ['Desenvolvimento com halteres', 'Dumbbell shoulder press'],
  ['Elevação de pernas (deitado)', 'Lying leg raise'],
  ['Elevação de quadril', 'Barbell hip thrust'],
  ['Elevação frontal com halteres', 'Dumbbell front raise'],
  ['Elevação frontal corda ou halteres', 'Cable front raise'],
  ['Elevação lateral com halteres', 'Dumbbell lateral raise'],
  ['Elevação lateral máquina ou unilateral no cabo', 'Cable lateral raise'],
  ['Elevação lateral sentado com halteres', 'Seated dumbbell lateral raise'],
  ['Elevação unilateral cabo', 'Cable lateral raise'],
  ['Extensor (Cadeira Extensora)', 'Leg extension'],
  ['Face pull na polia', 'Cable face pull'],
  ['Flexor deitado (Mesa Flexora)', 'Lying leg curl'],
  ['Flexor sentado (Cadeira Flexora)', 'Seated leg curl'],
  ['Glúteo no cabo ou máquina (Coice)', 'Cable glute kickback'],
  ['Hack machine', 'Hack squat'],
  ['Hip thrust (elevação pélvica) com barra', 'Barbell hip thrust'],
  ['Hiper extensão no banco romano', 'Back extension'],
  ['Leg 45', 'Leg press'],
  ['Leg press 45°', 'Leg press'],
  ['Levantamento terra (deadlift convencional)', 'Deadlift'],
  ['Meio Terra', 'Rack pull'],
  ['Mergulho no banco (dips no banco)', 'Bench dip'],
  ['Mesa flexora (cadeira flexora)', 'Lying leg curl'],
  ['Panturrilha em pé na máquina ou no smith', 'Standing calf raise'],
  ['Panturrilha no leg press (ou em pé na máquina)', 'Leg press calf raise'],
  ['Panturrilha sentada', 'Seated calf raise'],
  ['Paralela (peso do corpo)', 'Parallel bar dip'],
  ['Passada andando com halteres (Walking Lunges)', 'Dumbbell walking lunge'],
  ['Prancha (plank) isométrica', 'Plank'],
  ['Prancha frontal', 'Plank'],
  ['Pull down com corda', 'Rope straight arm pulldown'],
  ['Pulley frente aberto', 'Wide grip lat pulldown'],
  ['Pulley frente triângulo', 'V-bar lat pulldown'],
  ['Pullover na polia', 'Cable pullover'],
  ['Remada baixa pegada aberta', 'Wide grip seated cable row'],
  ['Remada baixa triângulo', 'Seated cable row'],
  ['Remada curvada com barra', 'Bent over barbell row'],
  ['Remada sentada na polia (cabo)', 'Seated cable row'],
  ['Remada unilateral com halter', 'One arm dumbbell row'],
  ['Rosca alternada com halteres', 'Alternating dumbbell curl'],
  ['Rosca concentrada (sentado)', 'Concentration curl'],
  ['Rosca direta banco 45 graus', 'Incline dumbbell curl'],
  ['Rosca direta barra livre ou cabo com barra', 'Barbell curl'],
  ['Rosca direta cabo', 'Cable curl'],
  ['Rosca direta com barra reta', 'Barbell curl'],
  ['Rosca direta com barra W (EZ)', 'EZ bar curl'],
  ['Rosca direta corda', 'Cable rope curl'],
  ['Rosca direta sentado com halteres', 'Seated dumbbell curl'],
  ['Rosca martelo', 'Dumbbell hammer curl'],
  ['Rosca martelo com halteres', 'Dumbbell hammer curl'],
  ['Rosca scott máquina ou cabo', 'Preacher curl'],
  ['Serrote', 'One arm dumbbell row'],
  ['Stiff', 'Stiff leg deadlift'],
  ['Stiff (levantamento terra romeno)', 'Romanian deadlift'],
  ['Supino declinado com barra', 'Decline barbell bench press'],
  ['Supino inclinado com barra', 'Incline barbell bench press'],
  ['Supino inclinado com halteres', 'Incline dumbbell bench press'],
  ['Supino reto com barra', 'Barbell bench press'],
  ['Supino reto com halteres', 'Dumbbell bench press'],
  ['Tríceps corda', 'Triceps rope pushdown'],
  ['Tríceps corda unilateral', 'Single arm triceps pushdown'],
  ['Tríceps francês com halter (sentado)', 'Seated overhead dumbbell triceps extension'],
  ['Tríceps francês na corda', 'Cable overhead triceps extension'],
  ['Tríceps pulley (puxada na polia alta)', 'Triceps pushdown'],
  ['Tríceps testa com barra W', 'EZ bar skull crusher'],
  ['Tríceps testa corda', 'Cable skull crusher'],
  ['Tríceps testa corda banco 35 graus', 'Cable skull crusher'],
  ['Voador (Peck Deck)', 'Pec deck fly'],
  ['Voador inverso (Peck Deck Inverso)', 'Reverse pec deck fly'],
];

/** Pausa por `ms` milissegundos. */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Intervalo base entre chamadas à API (para não estourar o rate limit / 429).
const DELAY_MS = 1500;
// Tentativas por exercício quando a API responde 429 (rate limit).
const MAX_RETRIES = 6;

/**
 * Busca o gifUrl do primeiro resultado da API para um termo, com retry e
 * back-off exponencial quando a API responde 429 (rate limit).
 */
async function buscarGifUrl(termo) {
  let espera = 3000;
  for (let tentativa = 1; tentativa <= MAX_RETRIES; tentativa++) {
    const url = `${API}?search=${encodeURIComponent(termo)}&limit=1`;
    const res = await fetch(url);

    if (res.status === 429) {
      // Respeita Retry-After se vier; senão usa back-off exponencial.
      const retryAfter = Number(res.headers.get('retry-after'));
      const wait = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : espera;
      console.log(`   … 429 (rate limit) em "${termo}" — aguardando ${Math.round(wait / 1000)}s (tentativa ${tentativa}/${MAX_RETRIES})`);
      await sleep(wait);
      espera = Math.min(espera * 2, 30000);
      continue;
    }

    if (!res.ok) throw new Error(`API ${res.status} para "${termo}"`);
    const json = await res.json();
    const item = json?.data?.[0];
    return item?.gifUrl ?? null;
  }
  throw new Error(`API 429 persistente para "${termo}" após ${MAX_RETRIES} tentativas`);
}

/** Baixa um GIF e retorna um Buffer. */
async function baixarGif(gifUrl) {
  const res = await fetch(gifUrl);
  if (!res.ok) throw new Error(`Download ${res.status} de ${gifUrl}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/** Normaliza o nome do exercício em um nome de arquivo seguro. */
function slug(nome) {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  const resumo = { ok: 0, naoEncontrado: [], erro: [] };

  let primeiro = true;
  for (const [nome, termo] of DE_PARA) {
    // Espaça as chamadas para não estourar o rate limit da API pública.
    if (!primeiro) await sleep(DELAY_MS);
    primeiro = false;
    try {
      const gifUrl = await buscarGifUrl(termo);
      if (!gifUrl) {
        resumo.naoEncontrado.push(`${nome}  (termo: ${termo})`);
        console.log(`x GIF nao encontrado: ${nome}  [${termo}]`);
        continue;
      }

      const buffer = await baixarGif(gifUrl);
      const path = `${slug(nome)}.gif`;

      const up = await supabase.storage.from(BUCKET).upload(path, buffer, {
        contentType: 'image/gif',
        upsert: true,
      });
      if (up.error) throw up.error;

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const publicUrl = pub.publicUrl;

      const upd = await supabase
        .from('exercises')
        .update({ thumbnail_url: publicUrl })
        .eq('tenant_id', TENANT_ID)
        .eq('name', nome);
      if (upd.error) throw upd.error;

      resumo.ok += 1;
      console.log(`ok ${nome}  ->  ${publicUrl}`);
    } catch (e) {
      resumo.erro.push(`${nome}: ${e?.message ?? e}`);
      console.log(`! Erro em ${nome}: ${e?.message ?? e}`);
    }
  }

  console.log('\n===== RESUMO =====');
  console.log(`OK: ${resumo.ok}/${DE_PARA.length}`);
  if (resumo.naoEncontrado.length) {
    console.log(`\nSem GIF (${resumo.naoEncontrado.length}):`);
    resumo.naoEncontrado.forEach((x) => console.log('  - ' + x));
  }
  if (resumo.erro.length) {
    console.log(`\nErros (${resumo.erro.length}):`);
    resumo.erro.forEach((x) => console.log('  - ' + x));
  }
  console.log('\nFeito. Confira os sem GIF e ajuste o termo no DE_PARA se quiser.');
}

main();
