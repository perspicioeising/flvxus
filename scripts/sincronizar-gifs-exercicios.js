
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// ============================================
// CONFIGURAÇÕES
// ============================================

const NEXT_PUBLIC_SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const TENANT_ID = "ae4e4d12-7d48-4e23-8ef1-ccab78144d5d";

const BUCKET = "exercise-gifs";

const CATALOGO_PATH =
  "C:\\Users\\b.hsantos\\Documents\\flvxus\\flvxus\\scripts\\exercisedb-catalogo.json";

const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

// ============================================
// MAPA: ID DO EXERCÍCIO NO SUPABASE -> GIF ID
// ============================================

const exercicios = [
  ["ea73b38c-9adb-4945-ae34-2c3bdd294a9d", "0MlxeMn"],
  ["06f00396-07fa-4894-8cfd-94fa4b215a72", "4c9BhzB"],
  ["05dfc2cc-259c-4040-9c07-3901b53cab43", "DT14T9T"],
  ["b9b6d34a-bf20-439a-8953-7de28d898fe9", "A3P4O0R"],
  ["8317bb61-2c05-407e-86d6-0f40097c2e81", "BU15nH4"],
  ["368d17bf-177f-40c2-8f8c-3df63d977de3", "o6LqKKP"],
  ["997fe57d-3c38-44d0-a7ca-d85ba23763f1", "myfUsKf"],
  ["191c27ad-9781-42c6-836c-e6ac25c82cf1", "za9Ni4z"],
  ["d774ed1c-ac54-45f0-86e5-bfe90c490261", "Qa55kX1"],
  ["2a3b96db-5bdb-4e65-b0ce-bfe5fa5a82d4", "qKBpF7I"],
  ["3a972d6e-294f-49c0-bfa3-72f85322b113", "v3xmPAR"],
  ["3c315fed-70d5-4c48-a721-d4b9181e8539", "x69MAlq"],
  ["524046f9-7558-4f27-9737-83152ccf0612", "hvV79Si"],
  ["63d367ad-1757-485d-8ee5-858829169d24", "C0MA9bC"],
  ["f587f2b6-e008-42a7-93f9-f76b718ede7a", "v2DfH14"],
  ["56e96517-c663-45f9-b92f-3fdf437b5150", "dU605di"],
  ["f346567d-ffc1-46cf-b8d0-12d417ad8983", "qRZ5S1N"],
  ["9c0ea61c-3388-4367-8d63-03574d62b1f4", "3ZflifB"],
  ["8e780d78-0200-4a1c-9c18-77d3b9d81740", "uxJcFUU"],
  ["760fb7df-1c80-44c1-a058-e0966a2391bf", "ZujAdR9"],
  ["b729784b-0003-43ab-9711-933673ef83bb", "kont8Ut"],
  ["2f3a4fe5-d290-4052-8b49-d9b467ff884c", "6CKUx7o"],
  ["f2ccfb80-122b-4e6c-aba8-527a1cc60ff1", "qg2PGl6"],
  ["f2531c0c-6726-4c72-9cf4-324b0e4c5580", "hrVQWvE"],
  ["38568203-031f-466e-a293-d836d28a4d7d", "7858za8"],
  ["849a7499-0413-4b91-a109-cb82575ca0d2", "weoDEpH"],
  ["7486c00c-ae1e-4392-89ba-85cde93c062d", "VBAWRPG"],
  ["996ce08a-4703-4cc4-b673-5ad293b88a61", "drfGhTV"],
  ["5a9a56d4-c1b8-43f3-9669-ccf122964fc4", "9WTm7dq"],
  ["a89c7ee1-b147-41e6-b47e-0c9fe84d40c2", "IZVHb27"],
  ["439c3d4a-5e36-4958-b476-6f650f0e8678", "Kpajagk"],
  ["6267fe01-7244-4e30-9f26-ef73233444ce", "eZ79rbI"],
  ["541589d7-f5e3-4878-88fb-7358a94f2cd6", "hCjGsRQ"],
];

// ============================================
// CARREGAR CATÁLOGO
// ============================================

function carregarCatalogo() {
  if (!fs.existsSync(CATALOGO_PATH)) {
    throw new Error(`Catálogo não encontrado: ${CATALOGO_PATH}`);
  }

  const conteudo = JSON.parse(
    fs.readFileSync(CATALOGO_PATH, "utf8")
  );

  const lista = Array.isArray(conteudo)
    ? conteudo
    : conteudo.data || conteudo.exercises || [];

  if (!Array.isArray(lista) || lista.length === 0) {
    throw new Error("Não foi possível localizar exercícios no catálogo.");
  }

  const mapa = new Map();

  for (const item of lista) {
    const gifId = item.exerciseId || item.id;
    const gifUrl = item.gifUrl || item.gif_url;

    if (gifId && gifUrl) {
      mapa.set(gifId, gifUrl);
    }
  }

  console.log(`Catálogo carregado: ${mapa.size} GIFs encontrados.`);

  return mapa;
}

// ============================================
// BAIXAR GIF
// ============================================

async function baixarGif(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erro HTTP ${response.status} ao baixar GIF.`);
  }

  return Buffer.from(await response.arrayBuffer());
}

// ============================================
// PROCESSAR EXERCÍCIOS
// ============================================

async function sincronizar() {
  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const catalogo = carregarCatalogo();

  let enviados = 0;
  let atualizados = 0;
  let ignorados = 0;
  let erros = 0;

  console.log("\nIniciando sincronização dos GIFs...\n");

  for (const [exerciseId, gifId] of exercicios) {
    try {
      const gifUrl = catalogo.get(gifId);

      if (!gifUrl) {
        console.log(`⚠️ GIF ${gifId} não encontrado no catálogo.`);
        ignorados++;
        continue;
      }

      // Baixa o GIF do ExerciseDB
      const arquivo = await baixarGif(gifUrl);

      // Envia para o Supabase Storage
      const storagePath = `${gifId}.gif`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, arquivo, {
          contentType: "image/gif",
          upsert: true,
          cacheControl: "31536000",
        });

      if (uploadError) {
        throw new Error(`Upload: ${uploadError.message}`);
      }

      enviados++;

      // Gera URL pública
      const { data: publicData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(storagePath);

      const thumbnailUrl = publicData.publicUrl;

      // Atualiza somente se thumbnail_url estiver NULL
      const { data, error: updateError } = await supabase
        .from("exercises")
        .update({
          thumbnail_url: thumbnailUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", exerciseId)
        .eq("tenant_id", TENANT_ID)
        .is("thumbnail_url", null)
        .select("id");

      if (updateError) {
        throw new Error(`Update: ${updateError.message}`);
      }

      if (data && data.length > 0) {
        console.log(`✅ Atualizado: ${exerciseId} | GIF: ${gifId}`);
        atualizados++;
      } else {
        console.log(
          `ℹ️ Sem atualização: ${exerciseId} (já possui thumbnail ou não pertence ao tenant)`
        );
      }
    } catch (error) {
      console.error(
        `❌ Erro no exercício ${exerciseId}:`,
        error.message
      );
      erros++;
    }
  }

  console.log("\n================================");
  console.log("       RESULTADO FINAL");
  console.log("================================");
  console.log(`GIFs enviados:       ${enviados}`);
  console.log(`Exercícios atualizados: ${atualizados}`);
  console.log(`Ignorados:           ${ignorados}`);
  console.log(`Erros:               ${erros}`);
  console.log("================================\n");
}

sincronizar().catch((error) => {
  console.error("\nFalha na sincronização:", error.message);
  process.exit(1);
});
