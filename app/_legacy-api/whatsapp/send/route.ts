import { triggerWebhook } from '@/webhooks/helper';
import { WEBHOOK_EVENTS } from '@/webhooks/service';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';


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
      .select('id, tenant_id, full_name')
      .eq('user_id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { to, message, type = 'text', student_id } = await request.json();

    // Aqui você integraria com a API do WhatsApp Business
    // Por exemplo: Meta WhatsApp Business API, Twilio, etc.
    
    // Simular envio para exemplo
    const messageId = `msg_${Date.now()}`;
    const sentAt = new Date().toISOString();

    // Salvar no banco (opcional - criar tabela whatsapp_messages)
    /*
    const { data: messageRecord } = await supabase
      .from('whatsapp_messages')
      .insert({
        message_id: messageId,
        to: to,
        message: message,
        type: type,
        sent_by: profile.id,
        student_id: student_id,
        tenant_id: profile.tenant_id,
        sent_at: sentAt,
        status: 'sent'
      })
      .select()
      .single();
    */

    // Disparar webhook
    await triggerWebhook(
      WEBHOOK_EVENTS.WHATSAPP_MESSAGE_SENT,
      {
        message_id: messageId,
        to: to,
        message: message,
        type: type,
        sent_by: profile.full_name,
        student_id: student_id,
        sent_at: sentAt
      },
      profile.tenant_id
    );

    return NextResponse.json({
      message_id: messageId,
      status: 'sent',
      sent_at: sentAt
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}