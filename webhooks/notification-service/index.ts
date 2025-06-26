
import { createClient } from "@supabase/supabase-js";
import { triggerWebhook, WEBHOOK_EVENTS } from "../helper";

class NotificationService {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  // Enviar notificação automática quando dieta é criada
  async notifyDietCreated(dietData: any) {
    try {
      const { data: student } = await this.supabase
        .from('profiles')
        .select('phone, full_name, tenant_id')
        .eq('id', dietData.student_id)
        .single();

      if (student?.phone) {
        const message = `🥗 Olá ${student.full_name}! Sua nova dieta "${dietData.diet_name}" está pronta! Acesse o app para conferir seu plano nutricional personalizado com ${dietData.target_calories} kcal/dia.`;

        // Enviar WhatsApp
        await this.sendWhatsAppMessage(student.phone, message, student.tenant_id);
      }
    } catch (error) {
      console.error('Erro ao enviar notificação de dieta:', error);
    }
  }

  // Enviar notificação quando treino é completado
  async notifyWorkoutCompleted(workoutData: any) {
    try {
      const { data: trainer } = await this.supabase
        .from('profiles')
        .select('phone, full_name')
        .eq('id', workoutData.trainer_id)
        .single();

      if (trainer?.phone) {
        const message = `💪 ${workoutData.student_name} completou o treino em ${workoutData.duration_minutes} minutos! Total de exercícios: ${workoutData.exercises_completed}`;

        await this.sendWhatsAppMessage(trainer.phone, message, workoutData.tenant_id);
      }
    } catch (error) {
      console.error('Erro ao enviar notificação de treino:', error);
    }
  }

  // Lembrete automático de treino
  async sendWorkoutReminder(studentId: string) {
    try {
      const { data: student } = await this.supabase
        .from('profiles')
        .select('phone, full_name, tenant_id')
        .eq('id', studentId)
        .single();

      if (student?.phone) {
        const message = `🏋️‍♂️ Hora do treino, ${student.full_name}! Não esqueça de realizar seus exercícios hoje. Vamos conquistar seus objetivos juntos! 💪`;

        await this.sendWhatsAppMessage(student.phone, message, student.tenant_id);
      }
    } catch (error) {
      console.error('Erro ao enviar lembrete:', error);
    }
  }

  private async sendWhatsAppMessage(phone: string, message: string, tenantId: string) {
    // Implementar conforme seu provedor de WhatsApp
    // Exemplo com Meta WhatsApp Business API:
    
    const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!whatsappToken || !phoneNumberId) {
      console.warn('WhatsApp não configurado');
      return;
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: { body: message }
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        // Disparar webhook de mensagem enviada
        await triggerWebhook(
          WEBHOOK_EVENTS.WHATSAPP_MESSAGE_SENT,
          {
            message_id: result.messages[0].id,
            to: phone,
            message: message,
            type: 'text',
            sent_by: 'system',
            sent_at: new Date().toISOString()
          },
          tenantId
        );
      } else {
        console.error('Erro ao enviar WhatsApp:', result);
      }
    } catch (error) {
      console.error('Erro na API do WhatsApp:', error);
    }
  }
}

const notificationService = new NotificationService();
export default notificationService;
