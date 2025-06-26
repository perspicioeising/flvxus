
export interface WebhookConfig {
  id: string;
  tenant_id: string;
  name: string;
  url: string;
  secret_key: string;
  events: string[];
  headers: Record<string, string>;
  is_active: boolean;
  retry_attempts: number;
  timeout_seconds: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  tenant_id: string;
  source: string;
  webhook_id?: string;
}

export interface WebhookResponse {
  success: boolean;
  status: number;
  response?: any;
  error?: string;
  attempt: number;
}

export interface WebhookLog {
  id: string;
  webhook_config_id: string;
  event_type: string;
  payload: any;
  response_status?: number;
  response_body?: string;
  error_message?: string;
  attempt_count: number;
  sent_at: string;
  success: boolean;
}
