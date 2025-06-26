
'use client';

import { useState } from 'react';
import { CheckCircle, TestTube, Webhook, RotateCcw, Eye, Settings, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AVAILABLE_EVENTS } from '../constants/webhook';

interface StepReviewProps {
  formData: {
    name: string;
    url: string;
    description?: string;
    events: string[];
    retry_attempts: number;
    timeout_seconds: number;
    headers: string;
  };
  onSave: () => void;
  isSaving: boolean;
}

export function StepReview({ formData, onSave, isSaving }: StepReviewProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const selectedEvents = AVAILABLE_EVENTS.filter(event => 
    formData.events.includes(event.key)
  );

  const testWebhook = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      // Simular teste do webhook
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aqui você faria uma chamada real para testar o endpoint
      const success = Math.random() > 0.3; // 70% de chance de sucesso para demo
      
      setTestResult({
        success,
        message: success 
          ? 'Webhook testado com sucesso! O endpoint está respondendo corretamente.'
          : 'Erro no teste: O endpoint não está acessível ou retornou erro 404.'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erro de rede: Não foi possível conectar ao endpoint.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getHeadersPreview = () => {
    try {
      if (!formData.headers.trim()) return 'Nenhum header customizado';
      const parsed = JSON.parse(formData.headers);
      return Object.keys(parsed).join(', ');
    } catch {
      return 'Headers inválidos';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-achievement-consecutive rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-app-large">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-app-heading mb-2">
          Revisar e Testar
        </h2>
        <p className="text-app-text-secondary">
          Confirme as configurações e teste antes de salvar
        </p>
      </div>

      {/* Review Sections */}
      <div className="space-y-6">
        
        {/* Basic Info */}
        <div className="card-app p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-achievement-workout rounded-xl flex items-center justify-center">
              <Webhook className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-app-text-primary">Informações Básicas</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-app-text-secondary">Nome</label>
              <p className="text-app-text-primary font-semibold">{formData.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-app-text-secondary">URL</label>
              <p className="text-app-text-primary font-mono text-sm break-all">{formData.url}</p>
            </div>
            {formData.description && (
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-app-text-secondary">Descrição</label>
                <p className="text-app-text-primary">{formData.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Events */}
        <div className="card-app p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-achievement-exercise rounded-xl flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-app-text-primary">
              Eventos ({selectedEvents.length})
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedEvents.map(event => (
              <div key={event.key} className="flex items-center gap-3 p-3 bg-app-bg-secondary/50 rounded-xl">
                <span className="text-lg">{event.icon}</span>
                <div>
                  <p className="font-semibold text-app-text-primary text-sm">{event.label}</p>
                  <p className="text-xs text-app-text-secondary">{event.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration */}
        <div className="card-app p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-achievement-weight rounded-xl flex items-center justify-center">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-app-text-primary">Configurações</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-app-text-secondary">Tentativas</label>
              <p className="text-app-text-primary font-semibold">{formData.retry_attempts}x</p>
            </div>
            <div>
              <label className="text-sm font-medium text-app-text-secondary">Timeout</label>
              <p className="text-app-text-primary font-semibold">{formData.timeout_seconds}s</p>
            </div>
            <div>
              <label className="text-sm font-medium text-app-text-secondary">Headers</label>
              <p className="text-app-text-primary font-semibold text-sm">{getHeadersPreview()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Section */}
      <div className="card-app p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <TestTube className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-app-text-primary">Testar Webhook</h3>
          </div>
          
          <button
            onClick={testWebhook}
            disabled={isTesting}
            className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
              isTesting
                ? 'bg-app-border-muted text-app-text-muted cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 shadow-app-medium hover:shadow-app-large'
            }`}
          >
            {isTesting ? (
              <>
                <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Testar Agora
              </>
            )}
          </button>
        </div>

        {testResult && (
          <div className={`p-4 rounded-xl border-l-4 ${
            testResult.success 
              ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10' 
              : 'border-red-500 bg-red-50/50 dark:bg-red-900/10'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Eye className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-semibold ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.success ? 'Teste bem-sucedido!' : 'Teste falhou'}
              </span>
            </div>
            <p className={`text-sm ${
              testResult.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {testResult.message}
            </p>
          </div>
        )}

        <p className="text-sm text-app-text-secondary mt-3">
          O teste enviará um payload de exemplo para verificar se o endpoint está funcionando.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-center pt-6">
        <button
          onClick={onSave}
          disabled={isSaving}
          className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
            isSaving
              ? 'bg-app-border-muted text-app-text-muted cursor-not-allowed'
              : 'btn-gradient-emerald text-white shadow-app-large hover:shadow-app-xl transform hover:scale-105'
          }`}
        >
          {isSaving ? (
            <>
              <RotateCcw className="h-5 w-5 mr-2 animate-spin" />
              Salvando Webhook...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Salvar Webhook
            </>
          )}
        </button>
      </div>
    </div>
  );
}