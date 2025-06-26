
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { webhookService } from '@/webhooks/service';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('user_id', session.user.id)
      .single();

    if (!profile || profile.role !== 'trainer') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const configs = await webhookService.getWebhookConfigs(profile.tenant_id);
    return NextResponse.json(configs);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, tenant_id, role')
      .eq('user_id', session.user.id)
      .single();

    if (!profile || profile.role !== 'trainer') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const data = await request.json();
    
    const config = await webhookService.createWebhookConfig({
      ...data,
      tenant_id: profile.tenant_id,
      created_by: profile.id
    });

    return NextResponse.json(config);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}