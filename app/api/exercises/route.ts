// app/api/exercises/route.ts - VERSÃO ATUALIZADA

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { searchParams } = new URL(request.url);
  
  // Verificar se é requisição para buscar todos os exercícios
  const fetchAll = searchParams.get('all') === 'true';
  
  // Get pagination parameters (para compatibilidade)
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;

  // Filtros (para caso precise no futuro)
  const search = searchParams.get('search') || '';
  const muscle = searchParams.get('muscle') || '';
  const equipment = searchParams.get('equipment') || '';

  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    if (fetchAll) {
      // BUSCAR TODOS OS EXERCÍCIOS (para filtros locais)
      console.log('🔍 API: Buscando todos os exercícios...');
      
      let query = supabase
        .from('exercises')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('name');

      // Aplicar filtros se fornecidos (opcional - pode ser removido)
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (muscle && muscle !== 'all') {
        query = query.contains('muscle_group', [muscle]);
      }

      if (equipment && equipment !== 'all') {
        query = query.contains('equipment', [equipment]);
      }

      const { data: exercises, error } = await query;

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      console.log(`📊 API: Retornando ${exercises?.length || 0} exercícios`);

      // Retornar array simples para compatibilidade
      return NextResponse.json(exercises || []);
      
    } else {
      // PAGINAÇÃO TRADICIONAL (para compatibilidade com código antigo)
      console.log(`📄 API: Buscando página ${page} (${limit} itens)...`);
      
      // Get total count
      const { count: totalCount, error: countError } = await supabase
        .from('exercises')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', profile.tenant_id);

      if (countError) {
        return NextResponse.json(
          { error: countError.message },
          { status: 500 }
        );
      }

      // Get paginated exercises
      let query = supabase
        .from('exercises')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('name')
        .range(offset, offset + limit - 1);

      // Aplicar filtros se fornecidos
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (muscle && muscle !== 'all') {
        query = query.contains('muscle_group', [muscle]);
      }

      if (equipment && equipment !== 'all') {
        query = query.contains('equipment', [equipment]);
      }

      const { data: exercises, error } = await query;

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        exercises,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil((totalCount || 0) / limit),
          hasMore: page < Math.ceil((totalCount || 0) / limit)
        }
      });
    }
  } catch (error: any) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching exercises' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'trainer') {
      return NextResponse.json(
        { error: 'Access restricted to trainers' },
        { status: 403 }
      );
    }

    const data = await request.json();

    const { data: exercise, error } = await supabase
      .from('exercises')
      .insert({
        name: data.name,
        description: data.description,
        muscle_group: data.muscle_group,
        equipment: data.equipment,
        variations: data.variations,
        video_url: data.video_url,
        audio_url: data.audio_url,
        tips: data.tips,
        common_errors: data.common_errors,
        tenant_id: profile.tenant_id
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(exercise);
  } catch (error: any) {
    console.error('❌ API Create Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while creating the exercise' },
      { status: 500 }
    );
  }
}