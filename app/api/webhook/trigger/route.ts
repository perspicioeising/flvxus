import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { triggerWebhook } from '@/webhooks/helper';

export async function POST(request: Request) {
  try {
    const { event, data, tenant_id } = await request.json();
    
    if (!event || !data || !tenant_id) {
      return NextResponse.json(
        { error: 'event, data e tenant_id são obrigatórios' }, 
        { status: 400 }
      );
    }
    
    await triggerWebhook(event, data, tenant_id);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro no trigger webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}