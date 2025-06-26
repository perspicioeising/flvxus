
import { webhookService } from '../service';

export async function triggerWebhook(event: string, data: any, tenantId: string) {
  // Executar em background para não bloquear a resposta
  setImmediate(() => {
    webhookService.triggerWebhooks(event, data, tenantId);
  });
}

export { WEBHOOK_EVENTS } from '../service';
