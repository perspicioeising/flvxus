import { triggerWebhook, WEBHOOK_EVENTS } from "@/webhooks/helper";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Verificar assinatura do WhatsApp (implementar conforme provedor)
    // const signature = request.headers.get('x-hub-signature-256');
    // if (!verifyWhatsAppSignature(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    // Processar mensagem recebida
    if (body.entry && body.entry[0] && body.entry[0].changes) {
      const change = body.entry[0].changes[0];
      
      if (change.value && change.value.messages) {
        const message = change.value.messages[0];
        const from = message.from;
        const text = message.text?.body || '';
        const messageId = message.id;

        // Buscar estudante pelo número de telefone
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: student } = await supabase
          .from('profiles')
          .select('id, full_name, tenant_id, phone')
          .eq('phone', from)
          .eq('role', 'student')
          .single();

        if (student) {
          // Salvar mensagem recebida
          /*
          await supabase
            .from('whatsapp_messages')
            .insert({
              message_id: messageId,
              from: from,
              message: text,
              type: 'received',
              student_id: student.id,
              tenant_id: student.tenant_id,
              received_at: new Date().toISOString()
            });
          */

          // Disparar webhook
          await triggerWebhook(
            WEBHOOK_EVENTS.WHATSAPP_MESSAGE_RECEIVED,
            {
              message_id: messageId,
              from: from,
              message: text,
              student_id: student.id,
              student_name: student.full_name,
              received_at: new Date().toISOString()
            },
            student.tenant_id
          );

          // Aqui você pode implementar respostas automáticas
          // if (text.toLowerCase().includes('treino')) {
          //   // Enviar informações sobre treinos
          // }
        }
      }
    }

    return NextResponse.json({ status: 'ok' });

  } catch (error: any) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Verificação para o WhatsApp (GET)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}