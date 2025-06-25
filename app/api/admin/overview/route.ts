// app/api/admin/overview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verificar se é super admin
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (!adminProfile || adminProfile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized - Super admin access required' }, { status: 403 });
    }

    // Buscar estatísticas gerais
    const [
      { data: tenants, error: tenantsError },
      { data: users, error: usersError },
      { data: students, error: studentsError },
      { data: trainers, error: trainersError }
    ] = await Promise.all([
      supabase.from('tenants').select('*'),
      supabase.from('profiles').select('*'),
      supabase.from('profiles').select('*').eq('role', 'student'),
      supabase.from('profiles').select('*').eq('role', 'trainer')
    ]);

    if (tenantsError || usersError || studentsError || trainersError) {
      throw new Error('Error fetching admin data');
    }

    // Estatísticas por plano
    const planStats = tenants?.reduce((acc, tenant) => {
      acc[tenant.plan] = (acc[tenant.plan] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Tenants mais ativos (com mais alunos)
    const tenantsWithCounts = await Promise.all(
      (tenants || []).map(async (tenant) => {
        const { data: studentCount } = await supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('tenant_id', tenant.id)
          .eq('role', 'student');

        return {
          ...tenant,
          student_count: studentCount?.length || 0
        };
      })
    );

    const overview = {
      totals: {
        tenants: tenants?.length || 0,
        users: users?.length || 0,
        students: students?.length || 0,
        trainers: trainers?.length || 0
      },
      planDistribution: planStats,
      topTenants: tenantsWithCounts
        .sort((a, b) => b.student_count - a.student_count)
        .slice(0, 10),
      recentTenants: tenants
        ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5) || []
    };

    return NextResponse.json(overview);

  } catch (error: any) {
    console.error('Error in admin overview:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// app/api/admin/tenants/route.ts
export async function PUT(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verificar se é super admin
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (!adminProfile || adminProfile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { tenantId, updates } = body;

    // Atualizar tenant
    const { data: updatedTenant, error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', tenantId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      tenant: updatedTenant 
    });

  } catch (error: any) {
    console.error('Error updating tenant:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 400 });
  }
}