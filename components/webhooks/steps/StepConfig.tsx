
'use client';

import { useState } from 'react';
import { Settings, Code, Eye, EyeOff, Info } from 'lucide-react';

interface StepConfigProps {
  formData: {
    retry_attempts: number;
    timeout_seconds: number;
    headers: string;
  };
  onUpdateField: (field: string, value: any) => void;
}

export function StepConfig({ formData, onUpdateField }: StepConfigProps) {
  const [showHeaders, setShowHeaders] = useState(false);
  const [headersError, setHeadersError] = useState('');

  const validateHeaders = (headersString: string) => {
    if (!headersString.trim()) {
      setHeadersError('');
      return;
    }
    
    try {
      JSON.parse(headersString);
      setHeadersError('');
    } catch (error) {
      setHeadersError('JSON inválido');
    }
  };

  const handleHeadersChange = (value: string) => {
    onUpdateField('headers', value);
    validateHeaders(value);
  };

  const headerExamples = {
    'Authorization Bearer': '{"Authorization": "Bearer seu_token_aqui"}',
    'API Key': '{"X-API-Key": "sua_api_key_aqui"}',
    'Basic Auth': '{"Authorization": "Basic dXNlcjpwYXNz"}',
    'Custom Headers': '{"X-Custom": "value", "User-Agent": "MeuApp/1.0"}'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-achievement-weight rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-app-large">
          <Settings className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-app-heading mb-2">
          Configurações Avançadas
        </h2>
        <p className="text-app-text-secondary">
          Configure timeout, retry e headers de autenticação
        </p>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Retry Attempts */}
        <div>
          <label className="block text-sm font-bold text-app-text-primary mb-3">
            Tentativas de Retry
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.retry_attempts}
            onChange={(e) => onUpdateField('retry_attempts', parseInt(e.target.value) || 1)}
            className="w-full p-4 border-2 border-app-border-muted rounded-xl focus:ring-2 focus:ring-app-text-accent focus:border-app-text-accent bg-app-card text-app-text-primary transition-all duration-200 font-medium"
          />
          <p className="text-xs text-app-text-secondary mt-2">
            Número de tentativas em caso de falha (1-10)
          </p>
        </div>

        {/* Timeout */}
        <div>
          <label className="block text-sm font-bold text-app-text-primary mb-3">
            Timeout (segundos)
          </label>
          <input
            type="number"
            min="5"
            max="120"
            value={formData.timeout_seconds}
            onChange={(e) => onUpdateField('timeout_seconds', parseInt(e.target.value) || 30)}
            className="w-full p-4 border-2 border-app-border-muted rounded-xl focus:ring-2 focus:ring-app-text-accent focus:border-app-text-accent bg-app-card text-app-text-primary transition-all duration-200 font-medium"
          />
          <p className="text-xs text-app-text-secondary mt-2">
            Tempo limite para resposta (5-120 segundos)
          </p>
        </div>
      </div>

      {/* Headers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-bold text-app-text-primary">
            Headers Customizados (JSON)
          </label>
          <button
            type="button"
            onClick={() => setShowHeaders(!showHeaders)}
            className="flex items-center gap-2 text-sm text-app-text-secondary hover:text-app-text-primary transition-colors duration-200"
          >
            {showHeaders ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showHeaders ? 'Ocultar' : 'Ver exemplos'}
          </button>
        </div>

        <div className="relative">
          <Code className="absolute left-4 top-4 h-5 w-5 text-app-text-muted" />
          <textarea
            value={formData.headers}
            onChange={(e) => handleHeadersChange(e.target.value)}
            placeholder='{"Authorization": "Bearer token", "X-Custom": "value"}'
            rows={4}
            className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-app-text-accent bg-app-card text-app-text-primary placeholder-app-text-muted transition-all duration-200 font-mono text-sm resize-none ${
              headersError ? 'border-red-500 focus:border-red-500' : 'border-app-border-muted focus:border-app-text-accent'
            }`}
          />
        </div>
        
        {headersError && (
          <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
            <Info className="h-3 w-3" />
            {headersError}
          </p>
        )}
        
        <p className="text-xs text-app-text-secondary mt-2">
          Headers de autenticação e customização em formato JSON
        </p>

        {/* Header Examples */}
        {showHeaders && (
          <div className="mt-4 p-4 bg-app-bg-secondary/50 rounded-xl border border-app-border-muted">
            <p className="text-sm font-medium text-app-text-primary mb-3">Exemplos comuns:</p>
            <div className="space-y-3">
              {Object.entries(headerExamples).map(([name, example]) => (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-app-text-primary">{name}</span>
                    <button
                      onClick={() => handleHeadersChange(example)}
                      className="text-xs text-app-text-accent hover:text-app-text-accent/80 font-medium"
                    >
                      Usar
                    </button>
                  </div>
                  <code className="block text-xs text-app-text-secondary bg-app-card p-2 rounded border font-mono">
                    {example}
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="p-4 bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-xl border border-yellow-200/50 dark:border-yellow-700/50">
        <h4 className="font-bold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
          <Info className="h-4 w-4" />
          Segurança
        </h4>
        <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
          <li>• Todos os webhooks são assinados com HMAC SHA-256</li>
          <li>• Headers sensíveis são criptografados no banco de dados</li>
          <li>• Use HTTPS sempre que possível</li>
          <li>• Evite expor tokens em URLs ou logs</li>
        </ul>
      </div>

      {/* Configuration Summary */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
        <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Resumo da Configuração</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-700 dark:text-blue-400 font-medium">Retry:</span>
            <span className="ml-2 text-blue-800 dark:text-blue-300">{formData.retry_attempts} tentativas</span>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-400 font-medium">Timeout:</span>
            <span className="ml-2 text-blue-800 dark:text-blue-300">{formData.timeout_seconds}s</span>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-400 font-medium">Headers:</span>
            <span className="ml-2 text-blue-800 dark:text-blue-300">
              {formData.headers.trim() ? 'Configurados' : 'Padrão'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
