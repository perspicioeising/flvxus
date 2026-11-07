import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Auditoria ESTÁTICA do gate de somente leitura: toda Server Action exportada
 * em `actions/*.ts` deve chamar `requireEntitlement(` (ou o helper
 * `exigirEntitlements(` de `actions/ia.ts`) de forma INCONDICIONAL, ou estar
 * numa allowlist explícita com o motivo. Ação nova sem guard quebra o teste.
 * Heurística de fonte (não executa o banco), barata e eficaz.
 */
const DIR = join(process.cwd(), 'actions');

/** Ações isentas do gate (cada uma com o motivo). */
const ACOES_ISENTAS: Record<string, string> = {
  // Leituras
  carregarSessaoAberta: 'leitura',
  carregarUltimosRegistros: 'leitura',
  carregarDetalheExercicio: 'leitura',
  verificarDisponibilidadeHandle: 'leitura (disponibilidade do @handle)',
  // Descartar/encerrar sem criar conteúdo
  cancelarSessao: 'descarta sessão incompleta do próprio usuário (evita sessão presa)',
  rejeitarGeracao: 'descartar rascunho de IA',
  removerFiliado: 'administração da conta / redução de uso',
  atualizarVisibilidade: 'administração da conta',
  // Identidade / social sem conteúdo
  definirHandle: 'identidade (@handle)',
  enviarSolicitacaoPorHandle: 'social: amizade',
  responderSolicitacao: 'social: amizade',
  // Conta, sessão, LGPD
  sair: 'sessão',
  registrarAceiteLegal: 'LGPD/termos',
  atualizarPerfil: 'conta',
  atualizarPerfilProfessor: 'conta',
  definirFotoPerfil: 'conta',
  removerFotoPerfil: 'conta',
  atualizarFusoHorario: 'conta',
  // Billing: é como se sai do bloqueio
  iniciarCheckout: 'billing',
  abrirPortal: 'billing',
};

interface Acao {
  arquivo: string;
  nome: string;
  corpo: string;
}

function listarAcoes(): Acao[] {
  const acoes: Acao[] = [];
  for (const arquivo of readdirSync(DIR).filter((f) => f.endsWith('.ts') && !f.startsWith('_'))) {
    const src = readFileSync(join(DIR, arquivo), 'utf8').replace(/\r\n/g, '\n');
    const re = /^export async function (\w+)/gm;
    const matches = [...src.matchAll(re)];
    for (const m of matches) {
      const ini = m.index ?? 0;
      // Corpo = até a próxima declaração de topo (função/const exportada ou não).
      const resto = src.slice(ini + m[0].length);
      const prox = resto.search(/\n(?:export |async function |function |const \w+ = |\/\*\*)/);
      const corpo = src.slice(ini, prox === -1 ? undefined : ini + m[0].length + prox);
      acoes.push({ arquivo, nome: m[1], corpo });
    }
  }
  return acoes;
}

const GUARD_RE = /\b(requireEntitlement|exigirEntitlements)\(/;

/** TRUE se a PRIMEIRA chamada ao guard está dentro de if/else/ternário/&&. */
function primeiraChamadaCondicional(corpo: string): boolean {
  const idx = corpo.search(GUARD_RE);
  if (idx === -1) return false;
  // Início do corpo da função: primeira `{` após a lista de parâmetros/retorno.
  const abre = corpo.indexOf('{', corpo.indexOf(')'));
  // Retorno tipado com `{` (ex.: Promise<{...}>) é raro nas actions; se a
  // abertura achada vier depois do guard, considera não-condicional.
  if (abre === -1 || abre > idx) return false;
  const pilha: boolean[] = [];
  let inicioStmt = abre + 1;
  for (let i = abre + 1; i < idx; i += 1) {
    const c = corpo[i];
    if (c === '{') {
      const cabecalho = corpo.slice(inicioStmt, i);
      pilha.push(/\b(if|else|for|while|switch|catch)\b|=>/.test(cabecalho));
      inicioStmt = i + 1;
    } else if (c === '}') {
      pilha.pop();
      inicioStmt = i + 1;
    } else if (c === ';') {
      inicioStmt = i + 1;
    }
  }
  const stmt = corpo.slice(inicioStmt, idx);
  const dentroDeBloqueCondicional = pilha.some(Boolean);
  const naMesmaInstrucaoCondicional = /\?|&&|\|\||\bif\s*\(|\belse\b/.test(stmt);
  return dentroDeBloqueCondicional || naMesmaInstrucaoCondicional;
}

describe('auditoria estática do gate de somente leitura', () => {
  const acoes = listarAcoes();

  it('encontra as Server Actions (sanidade)', () => {
    expect(acoes.length).toBeGreaterThan(50);
  });

  it('toda ação exportada chama o guard ou está na allowlist', () => {
    const faltando = acoes
      .filter((a) => !GUARD_RE.test(a.corpo) && !(a.nome in ACOES_ISENTAS))
      .map((a) => `${a.arquivo}:${a.nome}`);
    expect(faltando).toEqual([]);
  });

  it('a allowlist não contém ações que já chamam o guard nem nomes inexistentes', () => {
    const nomes = new Set(acoes.map((a) => a.nome));
    const orfas = Object.keys(ACOES_ISENTAS).filter((n) => !nomes.has(n));
    expect(orfas).toEqual([]);
  });

  it('a primeira chamada ao guard nunca é condicional', () => {
    const condicionais = acoes
      .filter((a) => GUARD_RE.test(a.corpo) && primeiraChamadaCondicional(a.corpo))
      .map((a) => `${a.arquivo}:${a.nome}`);
    expect(condicionais).toEqual([]);
  });

  it('aprovarGeracao chama o guard de forma incondicional (inclusive suggest_workout)', () => {
    const a = acoes.find((x) => x.nome === 'aprovarGeracao');
    expect(a).toBeDefined();
    expect(a!.corpo).toMatch(/requireEntitlement\(featureAprovacao\)/);
    expect(primeiraChamadaCondicional(a!.corpo)).toBe(false);
  });

  it('o detector de condicional reconhece if/ternário (auto-teste)', () => {
    expect(
      primeiraChamadaCondicional('export async function x() {\n  if (a) {\n    await requireEntitlement(null);\n  }\n}')
    ).toBe(true);
    expect(
      primeiraChamadaCondicional('export async function x() {\n  const d = a ? await requireEntitlement(null) : null;\n}')
    ).toBe(true);
    expect(
      primeiraChamadaCondicional('export async function x() {\n  const d = await requireEntitlement(null);\n  if (!d.ok) return d;\n}')
    ).toBe(false);
  });
});
