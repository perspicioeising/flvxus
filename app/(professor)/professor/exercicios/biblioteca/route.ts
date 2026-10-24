import { NextResponse, type NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { intervaloPagina, normalizarPagina } from '@/lib/paginacao';

/**
 * Route Handler de leitura do catálogo GLOBAL de exercícios (`tenant_id IS NULL`),
 * usado pelo drawer "Importar da biblioteca" (FEAT-003).
 *
 * Opera sob RLS via `createClient()` de lib/supabase/server.ts — a policy
 * `exercises_select` já libera a leitura do catálogo global; aqui apenas
 * restringimos a `tenant_id IS NULL` para não misturar os exercícios do tenant.
 *
 * Dois modos:
 *   - lista (padrão): paginado por 50 (tamanho fixo, pertence a TAMANHOS_PAGINA),
 *     ordenado por `name`, filtrável por `q`/`muscle_group`/`equipment`. Responde
 *     `{ itens, total, page, pageSize }`.
 *   - idsOnly (`?idsOnly=1`): mesma base de filtros, retorna só os IDs (teto de
 *     500, ordenados por `name`) para o "selecionar todos respeitando filtros".
 *     Responde `{ ids, truncado }`, onde `truncado` indica que havia mais de 500
 *     resultados para os filtros atuais.
 */

/** Tamanho de página fixo do catálogo global (pertence a TAMANHOS_PAGINA). */
const PAGE_SIZE = 50;
/** Teto de IDs retornados no modo idsOnly. */
const TETO_IDS = 500;

interface Filtros {
  q: string;
  muscleGroup: string;
  equipment: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const filtros: Filtros = {
    q: (searchParams.get('q') ?? '').trim(),
    muscleGroup: (searchParams.get('muscle_group') ?? '').trim(),
    equipment: (searchParams.get('equipment') ?? '').trim(),
  };
  const idsOnly = searchParams.get('idsOnly') === '1';

  const supabase = await createClient();

  if (idsOnly) {
    let query = supabase
      .from('exercises')
      .select('id', { count: 'exact' })
      .is('tenant_id', null);

    if (filtros.q) {
      query = query.ilike('name', `%${filtros.q}%`);
    }
    if (filtros.muscleGroup) {
      query = query.contains('muscle_groups', [filtros.muscleGroup]);
    }
    if (filtros.equipment) {
      query = query.contains('equipment', [filtros.equipment]);
    }

    const { data, count, error } = await query
      .order('name', { ascending: true })
      .range(0, TETO_IDS - 1);

    if (error) {
      return NextResponse.json(
        { error: 'Não foi possível carregar a biblioteca.' },
        { status: 500 }
      );
    }

    const ids = (data ?? []).map((linha) => linha.id);
    const truncado = (count ?? 0) > TETO_IDS;

    return NextResponse.json({ ids, truncado });
  }

  const page = normalizarPagina(searchParams.get('page'));
  const { from, to } = intervaloPagina(page, PAGE_SIZE);

  let query = supabase
    .from('exercises')
    .select('id, name, muscle_groups, equipment, thumbnail_url', {
      count: 'exact',
    })
    .is('tenant_id', null);

  if (filtros.q) {
    query = query.ilike('name', `%${filtros.q}%`);
  }
  if (filtros.muscleGroup) {
    query = query.contains('muscle_groups', [filtros.muscleGroup]);
  }
  if (filtros.equipment) {
    query = query.contains('equipment', [filtros.equipment]);
  }

  const { data, count, error } = await query
    .order('name', { ascending: true })
    .range(from, to);

  if (error) {
    return NextResponse.json(
      { error: 'Não foi possível carregar a biblioteca.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    itens: data ?? [],
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  });
}
