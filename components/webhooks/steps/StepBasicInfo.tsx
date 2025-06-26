'use client';

import { useState } from 'react';
import { Globe, Eye, EyeOff } from 'lucide-react';

interface StepBasicInfoProps {
  formData: {
    name: string;
    url: string;
    description?: string;
  };
  onUpdateField: (field: string, value: any) => void;
  isLoading?: boolean;
}

export function StepBasicInfo({ formData, onUpdateField, isLoading }: StepBasicInfoProps) {
  const [showUrlPreview, setShowUrlPreview] = useState(false);

  const urlExamples = [
    'https://meucrm.com/webhooks/flvxus',
    'https://api.meusite.com/integrations/webhook',
    'https://sistema.empresa.com/api/webhook',
    'https://webhook.site/unique-id'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-achievement-workout rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-app-large">
          <Globe className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-app-heading mb-2">
          Informações Básicas
        </h2>
        <p className="text-app-text-secondary">
          Configure o nome e a URL do seu webhook
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Nome */}
        <div>
          <label className="block text-sm font-bold text-app-text-primary mb-3">
            Nome do Webhook *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onUpdateField('name', e.target.value)}
            placeholder="Ex: Sistema CRM, Plataforma Marketing..."
            disabled={isLoading}
            className="w-full p-4 border-2 border-app-border-muted rounded-xl focus:ring-2 focus:ring-app-text-accent focus:border-app-text-accent bg-app-card text-app-text-primary placeholder-app-text-muted transition-all duration-200 font-medium"
          />
          <p className="text-xs text-app-text-secondary mt-2">
            Um nome descritivo para identificar facilmente este webhook
          </p>
        </div>

        {/* URL */}
        <div>
          <label className="block text-sm font-bold text-app-text-primary mb-3">
            URL do Endpoint *
          </label>
          <div className="relative">
            <input
              type="url"
              value={formData.url}
              onChange={(e) => onUpdateField('url', e.target.value)}
              placeholder="https://meucrm.com/webhooks/flvxus"
              disabled={isLoading}
              className="w-full p-4 border-2 border-app-border-muted rounded-xl focus:ring-2 focus:ring-app-text-accent focus:border-app-text-accent bg-app-card text-app-text-primary placeholder-app-text-muted transition-all duration-200 font-medium pr-12"
            />
            <button
              type="button"
              onClick={() => setShowUrlPreview(!showUrlPreview)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-app-text-secondary hover:text-app-text-primary transition-colors duration-200"
            >
              {showUrlPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-app-text-secondary mt-2">
            A URL completa onde os dados do webhook serão enviados
          </p>
          
          {/* URL Examples */}
          {showUrlPreview && (
            <div className="mt-4 p-4 bg-app-bg-secondary/50 rounded-xl border border-app-border-muted">
              <p className="text-sm font-medium text-app-text-primary mb-3">Exemplos de URLs:</p>
              <div className="space-y-2">
                {urlExamples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => onUpdateField('url', example)}
                    className="block w-full text-left text-sm text-app-text-secondary hover:text-app-text-accent bg-app-card hover:bg-app-overlay p-3 rounded-lg transition-all duration-200 border border-transparent hover:border-app-border-accent"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Descrição (Opcional) */}
        <div>
          <label className="block text-sm font-bold text-app-text-primary mb-3">
            Descrição (Opcional)
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => onUpdateField('description', e.target.value)}
            placeholder="Descreva para que serve este webhook..."
            disabled={isLoading}
            rows={3}
            className="w-full p-4 border-2 border-app-border-muted rounded-xl focus:ring-2 focus:ring-app-text-accent focus:border-app-text-accent bg-app-card text-app-text-primary placeholder-app-text-muted transition-all duration-200 font-medium resize-none"
          />
          <p className="text-xs text-app-text-secondary mt-2">
            Uma descrição opcional para documentar o uso deste webhook
          </p>
        </div>
      </div>

      {/* Requirements Check */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
        <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Requisitos
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li className={`flex items-center gap-2 ${formData.name.trim() ? 'text-green-600' : ''}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${formData.name.trim() ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            Nome do webhook preenchido
          </li>
          <li className={`flex items-center gap-2 ${formData.url.trim() && formData.url.startsWith('http') ? 'text-green-600' : ''}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${formData.url.trim() && formData.url.startsWith('http') ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            URL válida começando com https://
          </li>
        </ul>
      </div>
    </div>
  );
}