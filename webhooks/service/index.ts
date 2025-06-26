import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { WebhookConfig, WebhookPayload, WebhookResponse } from '../types';

export const WEBHOOK_EVENTS = {
  // Estudantes
  STUDENT_CREATED: 'student.created',
  STUDENT_UPDATED: 'student.updated',
  STUDENT_STATUS_CHANGED: 'student.status_changed',

  // Dietas
  DIET_CREATED: 'diet.created',
  DIET_UPDATED: 'diet.updated',

  // Treinos
  WORKOUT_CREATED: 'workout.created',
  WORKOUT_COMPLETED: 'workout.completed',

  // Avaliações
  ASSESSMENT_CREATED: 'assessment.created',

  // Sistema
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',

  // WhatsApp
  WHATSAPP_MESSAGE_SENT: 'whatsapp.message_sent',
  WHATSAPP_MESSAGE_RECEIVED: 'whatsapp.message_received'
} as const;

export class WebhookService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  // Gerar assinatura HMAC para segurança
  private generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  // Enviar webhook individual
  async sendWebhook(
    config: WebhookConfig, 
    payload: WebhookPayload, 
    attempt: number = 1
  ): Promise<WebhookResponse> {
    try {
      const payloadString = JSON.stringify(payload);
      const signature = this.generateSignature(payloadString, config.secret_key);
      
      const headers = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': `sha256=${signature}`,
        'X-Webhook-Event': payload.event,
        'X-Webhook-Timestamp': payload.timestamp,
        'X-Webhook-Source': 'flvxus-system',
        'User-Agent': 'Flvxus-Webhook/1.0',
        ...config.headers
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout_seconds * 1000);

      const response = await fetch(config.url, {
        method: 'POST',
        headers,
        body: payloadString,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      const success = response.ok;

      // Log no banco
      await this.logWebhook({
        webhook_config_id: config.id,
        event_type: payload.event,
        payload: payload,
        response_status: response.status,
        response_body: responseText,
        error_message: success ? null : `HTTP ${response.status}: ${responseText}`,
        attempt_count: attempt,
        success
      });

      return {
        success,
        status: response.status,
        response: responseData,
        attempt
      };

    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      
      // Log erro no banco
      await this.logWebhook({
        webhook_config_id: config.id,
        event_type: payload.event,
        payload: payload,
        response_status: 0,
        response_body: null,
        error_message: errorMessage,
        attempt_count: attempt,
        success: false
      });

      return {
        success: false,
        status: 0,
        error: errorMessage,
        attempt
      };
    }
  }

  // Enviar webhook com retry automático
  async sendWebhookWithRetry(config: WebhookConfig, payload: WebhookPayload): Promise<WebhookResponse> {
    let lastResponse: WebhookResponse;

    for (let attempt = 1; attempt <= config.retry_attempts; attempt++) {
      lastResponse = await this.sendWebhook(config, payload, attempt);
      
      if (lastResponse.success) {
        return lastResponse;
      }

      // Aguardar antes do próximo attempt (backoff exponencial)
      if (attempt < config.retry_attempts) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return lastResponse!;
  }

  // Disparar webhooks para todos os sistemas configurados
  async triggerWebhooks(event: string, data: any, tenantId: string): Promise<void> {
    try {
      // Buscar configurações ativas para este evento
      const { data: configs, error } = await this.supabase
        .from('webhook_configurations')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .contains('events', [event]);

      if (error) {
        console.error('Erro ao buscar configurações de webhook:', error);
        return;
      }

      if (!configs || configs.length === 0) {
        console.log(`Nenhum webhook configurado para evento: ${event}`);
        return;
      }

      const payload: WebhookPayload = {
        event,
        data,
        timestamp: new Date().toISOString(),
        tenant_id: tenantId,
        source: 'flvxus-api'
      };

      // Enviar para todos os webhooks configurados (em paralelo)
      const promises = configs.map(config => 
        this.sendWebhookWithRetry(config, {
          ...payload,
          webhook_id: config.id
        })
      );

      await Promise.allSettled(promises);
      
      console.log(`Webhooks enviados para evento: ${event} (${configs.length} destinos)`);

    } catch (error) {
      console.error('Erro ao disparar webhooks:', error);
    }
  }

  // Log no banco
  private async logWebhook(logData: any) {
    try {
      await this.supabase
        .from('webhook_logs')
        .insert(logData);
    } catch (error) {
      console.error('Erro ao salvar log de webhook:', error);
    }
  }

  // Buscar configurações
  async getWebhookConfigs(tenantId: string): Promise<WebhookConfig[]> {
    const { data, error } = await this.supabase
      .from('webhook_configurations')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar configurações: ${error.message}`);
    }

    return data || [];
  }

  // Criar nova configuração
  async createWebhookConfig(config: Partial<WebhookConfig>): Promise<WebhookConfig> {
    const { data, error } = await this.supabase
      .from('webhook_configurations')
      .insert({
        ...config,
        secret_key: config.secret_key || crypto.randomBytes(32).toString('hex')
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar webhook: ${error.message}`);
    }

    return data;
  }

  // Testar webhook
  async testWebhook(configId: string): Promise<WebhookResponse> {
    const { data: config, error } = await this.supabase
      .from('webhook_configurations')
      .select('*')
      .eq('id', configId)
      .single();

    if (error || !config) {
      throw new Error('Configuração não encontrada');
    }

    const testPayload: WebhookPayload = {
      event: 'webhook.test',
      data: {
        message: 'Este é um teste de webhook',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      tenant_id: config.tenant_id,
      source: 'flvxus-test',
      webhook_id: config.id
    };

    return this.sendWebhook(config, testPayload);
  }
}

const webhookService = new WebhookService();
export { webhookService };
