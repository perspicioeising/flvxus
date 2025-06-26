'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  Send, 
  CheckCircle, 
  XCircle, 
  Activity, 
  Clock, 
  Plus, 
  Settings, 
  Trash2, 
  TestTube, 
  Eye, 
  RotateCcw,
  Webhook,
  Zap,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Sparkles,
  BarChart4,
  Edit,
  Globe
} from 'lucide-react';

interface WebhookMetrics {
  totalSent: number;
  successRate: number;
  eventBreakdown: Record<string, { total: number; success: number }>;
  dailyStats: Array<{
    date: string;
    total: number;
    success: number;
    failed: number;
  }>;
  webhookPerformance: Array<{
    id: string;
    name: string;
    total: number;
    success: number;
    successRate: number;
  }>;
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  retry_attempts: number;
  timeout_seconds: number;
  created_at: string;
  description?: string;
}

interface WebhookLog {
  id: string;
  event_type: string;
  response_status: number;
  success: boolean;
  sent_at: string;
  attempt_count: number;
  error_message?: string;
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];

const AVAILABLE_EVENTS = [
  { key: 'student.created', label: 'Aluno Criado', description: 'Quando um novo aluno é cadastrado' },
  { key: 'student.updated', label: 'Aluno Atualizado', description: 'Quando dados de um aluno são alterados' },
  { key: 'diet.created', label: 'Dieta Criada', description: 'Quando uma nova dieta é gerada' },
  { key: 'workout.completed', label: 'Treino Completado', description: 'Quando um aluno completa um treino' },
  { key: 'assessment.created', label: 'Avaliação Criada', description: 'Quando uma avaliação física é feita' }
];

export function WebhookDashboard() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<WebhookMetrics | null>(null);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState(7);
  const [showLogs, setShowLogs] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMetrics(),
        fetchWebhooks()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`/api/webhook/metrics?days=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  };

  const fetchWebhooks = async () => {
    try {
      const response = await fetch('/api/webhook');
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data);
      }
    } catch (error) {
      console.error('Erro ao carregar webhooks:', error);
    }
  };

  const fetchLogs = async (webhookId: string) => {
    try {
      const response = await fetch(`/api/webhook/${webhookId}/logs`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    }
  };

  const testWebhook = async (webhookId: string) => {
    setTestingWebhook(webhookId);
    
    try {
      const response = await fetch(`/api/webhook/${webhookId}/test`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`Teste enviado com sucesso! Status: ${result.status}`);
      } else {
        alert(`Teste falhou: ${result.error}`);
      }
    } catch (error) {
      alert('Erro ao testar webhook');
    } finally {
      setTestingWebhook(null);
    }
  };

  const toggleWebhook = async (webhookId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/webhook/${webhookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive })
      });
      
      if (response.ok) {
        fetchWebhooks();
      }
    } catch (error) {
      alert('Erro ao atualizar webhook');
    }
  };

  const deleteWebhook = async (webhookId: string) => {
    if (!confirm('Tem certeza que deseja deletar este webhook?')) return;
    
    try {
      const response = await fetch(`/api/webhook/${webhookId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchWebhooks();
        alert('Webhook deletado com sucesso!');
      }
    } catch (error) {
      alert('Erro ao deletar webhook');
    }
  };

  const showWebhookLogs = (webhookId: string) => {
    setSelectedWebhook(webhookId);
    setShowLogs(true);
    fetchLogs(webhookId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-app-text-accent';
    if (rate >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-app-gradient flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-app-border-accent rounded-full animate-spin border-t-app-btn-primary"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-app-text-accent"></div>
          </div>
        </div>
      </div>
    );
  }

  const eventBreakdownData = metrics ? Object.entries(metrics.eventBreakdown).map(([event, data]) => ({
    name: event.replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    total: data.total,
    success: data.success,
    failed: data.total - data.success,
    successRate: data.total > 0 ? (data.success / data.total) * 100 : 0
  })) : [];

  const pieData = eventBreakdownData.map((item, index) => ({
    name: item.name,
    value: item.total,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-3 py-4 max-w-7xl">
        
        {/* Header - Seguindo padrão do dashboard */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/10 via-app-btn-primary/10 to-app-text-accent/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-2xl p-4 sm:p-6 shadow-app-large">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-achievement-consecutive rounded-2xl flex items-center justify-center shadow-app-large">
                    <Webhook className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div className="relative inline-block">
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-achievement-exercise rounded-full flex items-center justify-center">
                      <Zap className="h-3 w-3 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-app-heading leading-tight">
                    Webhooks & Integrações
                  </h1>
                  <p className="text-base sm:text-lg font-semibold text-app-text-accent">
                    Conecte com sistemas externos
                  </p>
                  <p className="text-app-text-secondary text-sm sm:text-base max-w-xl leading-relaxed">
                    Monitore e gerencie suas integrações automatizadas
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-app-card backdrop-blur-sm rounded-xl p-2 border border-app-border-muted">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(parseInt(e.target.value))}
                    className="bg-transparent border-0 text-xs sm:text-sm font-medium focus:ring-0 focus:outline-none text-app-text-primary"
                  >
                    <option value={7}>7 dias</option>
                    <option value={14}>14 dias</option>
                    <option value={30}>30 dias</option>
                  </select>
                </div>
                
                <button
                  onClick={fetchData}
                  className="p-2 sm:p-3 bg-app-card backdrop-blur-sm rounded-xl border border-app-border-muted hover:shadow-app-medium transition-all duration-200"
                  title="Atualizar dados"
                >
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-app-text-secondary" />
                </button>
                
                <Button 
                  onClick={() => router.push('/dashboard/webhooks/new')}
                  className="btn-gradient-emerald px-3 py-2 sm:px-6 sm:py-3 rounded-xl flex items-center gap-2 font-bold shadow-app-large transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Novo</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'overview', label: 'Visão Geral', icon: BarChart4 },
            { key: 'webhooks', label: 'Configurações', icon: Settings },
            { key: 'logs', label: 'Logs', icon: Eye }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-app-overlay border border-app-border-accent text-app-text-accent shadow-app-medium'
                  : 'text-app-text-secondary hover:bg-app-card hover:text-app-text-primary'
              }`}
            >
              <tab.icon size={16} />
              <span className="text-xs sm:text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Métricas Cards */}
            <div>
              <h2 className="text-xl font-bold text-app-heading mb-3 px-1">Principais Métricas</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {[
                  {
                    name: "Total Enviado",
                    value: metrics?.totalSent?.toLocaleString() || '0',
                    icon: Send,
                    color: "bg-achievement-workout",
                    stats: "+12% vs anterior",
                    gradient: "achievement-workout"
                  },
                  {
                    name: "Taxa Sucesso",
                    value: `${metrics?.successRate?.toFixed(1) || '0'}%`,
                    icon: CheckCircle,
                    color: metrics?.successRate && metrics.successRate >= 95 ? "bg-achievement-exercise" : metrics?.successRate && metrics.successRate >= 80 ? "bg-yellow-500" : "bg-red-500",
                    stats: metrics?.successRate && metrics.successRate >= 95 ? 'Excelente' : metrics?.successRate && metrics.successRate >= 80 ? 'Bom' : 'Atenção',
                    gradient: "achievement-exercise"
                  },
                  {
                    name: "Falhas",
                    value: metrics ? (metrics.totalSent - Math.round(metrics.totalSent * metrics.successRate / 100)).toLocaleString() : '0',
                    icon: XCircle,
                    color: "bg-red-500",
                    stats: `${metrics ? ((100 - metrics.successRate)).toFixed(1) : '0'}% do total`,
                    gradient: "achievement-weight"
                  },
                  {
                    name: "Média Diária",
                    value: metrics ? Math.round(metrics.totalSent / timeRange).toString() : '0',
                    icon: Activity,
                    color: "bg-achievement-consecutive",
                    stats: "webhooks/dia",
                    gradient: "achievement-consecutive"
                  }
                ].map((metric, index) => (
                  <div key={metric.name} className="group relative">
                    <div className={`absolute inset-0 bg-${metric.gradient}/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300`} />
                    <div className="relative card-app group-hover:scale-105 transition-all duration-300 p-3 sm:p-4">
                      <div className="text-center space-y-2 sm:space-y-3">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 ${metric.color} rounded-xl flex items-center justify-center mx-auto shadow-app-medium group-hover:shadow-app-large transition-all duration-300`}>
                          <metric.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-app-text-primary group-hover:text-app-text-accent transition-colors duration-300">
                            {metric.name}
                          </h3>
                          <p className="text-lg sm:text-xl font-black text-app-heading">
                            {metric.value}
                          </p>
                        </div>
                        <Badge className="px-2 py-1 bg-app-bg-secondary/50 border-app-border-muted text-app-text-secondary text-xs">
                          {metric.stats}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráficos */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-app-heading px-1">Análise Detalhada</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Linha */}
                <div className="card-app p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-bold text-app-text-primary">Evolução Temporal</h4>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-app-text-secondary">Sucessos</span>
                      <div className="w-3 h-3 bg-red-500 rounded-full ml-3"></div>
                      <span className="text-app-text-secondary">Falhas</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={metrics?.dailyStats || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        fontSize={12}
                        stroke="#6B7280"
                      />
                      <YAxis fontSize={12} stroke="#6B7280" />
                      <Tooltip 
                        labelFormatter={(value) => formatDate(value)}
                        formatter={(value, name) => [
                          value,
                          name === 'success' ? 'Sucessos' : 
                          name === 'failed' ? 'Falhas' : 'Total'
                        ]}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #E5E7EB',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="success" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        name="Sucessos"
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="failed" 
                        stroke="#EF4444" 
                        strokeWidth={3}
                        name="Falhas"
                        dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfico de Pizza */}
                <div className="card-app p-4 sm:p-6">
                  <h4 className="text-lg font-bold text-app-text-primary mb-6">Distribuição por Evento</h4>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[250px] text-app-text-secondary">
                      <div className="text-center">
                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhum evento registrado</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Performance por Webhook */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-app-heading px-1">Performance por Webhook</h3>
              
              {!metrics?.webhookPerformance?.length ? (
                <div className="card-app p-8 text-center">
                  <Webhook className="w-16 h-16 mx-auto mb-4 text-app-text-muted opacity-50" />
                  <h4 className="text-lg font-semibold text-app-text-primary mb-2">Nenhum webhook configurado</h4>
                  <p className="text-app-text-secondary mb-4">Configure seu primeiro webhook para começar</p>
                  <Button 
                    onClick={() => router.push('/dashboard/webhooks/new')}
                    className="btn-gradient-emerald px-6 py-2 rounded-xl font-semibold"
                  >
                    Criar Primeiro Webhook
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {metrics.webhookPerformance.map((webhook) => (
                    <div key={webhook.id} className="card-app p-3 sm:p-4 hover:shadow-app-medium transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-app-text-primary mb-1">{webhook.name}</h4>
                          <p className="text-sm text-app-text-secondary">
                            {webhook.success}/{webhook.total} sucessos
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className={`text-lg font-bold ${getSuccessRateColor(webhook.successRate)}`}>
                              {webhook.successRate.toFixed(1)}%
                            </div>
                            <div className="text-xs text-app-text-secondary">taxa de sucesso</div>
                          </div>
                          
                          <div className="w-24 bg-app-border-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                webhook.successRate >= 95 ? 'bg-achievement-exercise' :
                                webhook.successRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(webhook.successRate, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'webhooks' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-app-heading mb-3 px-1">Configurações</h2>
              
              {webhooks.length === 0 ? (
                <div className="card-app p-8 text-center">
                  <Webhook size={64} className="mx-auto text-app-text-muted opacity-50 mb-6" />
                  <h3 className="text-xl font-bold text-app-text-primary mb-3">Nenhum webhook configurado</h3>
                  <p className="text-app-text-secondary mb-6 max-w-md mx-auto">
                    Configure seu primeiro webhook para enviar dados para sistemas externos automaticamente
                  </p>
                  <Button
                    onClick={() => router.push('/dashboard/webhooks/new')}
                    className="btn-gradient-emerald px-6 py-3 rounded-xl font-bold"
                  >
                    Criar Primeiro Webhook
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {webhooks.map((webhook) => (
                    <div key={webhook.id} className="card-app p-4 sm:p-6 hover:shadow-app-medium transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-bold text-app-text-primary">{webhook.name}</h3>
                            <Badge className={`px-3 py-1 text-xs font-semibold ${
                              webhook.is_active 
                                ? 'bg-achievement-exercise/20 text-green-800 border-green-200' 
                                : 'bg-red-100 text-red-800 border-red-200'
                            }`}>
                              {webhook.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-app-text-secondary mb-4 space-y-1">
                            <p><span className="font-medium">URL:</span> {webhook.url}</p>
                            <p><span className="font-medium">Configuração:</span> {webhook.timeout_seconds}s timeout, {webhook.retry_attempts} tentativas</p>
                            {webhook.description && (
                              <p><span className="font-medium">Descrição:</span> {webhook.description}</p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {webhook.events.map((event) => {
                              const eventInfo = AVAILABLE_EVENTS.find(e => e.key === event);
                              return (
                                <Badge key={event} className="bg-app-btn-primary/20 text-app-text-accent border-app-border-accent px-3 py-1 text-xs font-medium">
                                  {eventInfo?.label || event}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-6">
                          <button
                            onClick={() => showWebhookLogs(webhook.id)}
                            className="p-2 text-app-text-secondary hover:text-app-text-accent hover:bg-app-card rounded-xl transition-all duration-200"
                            title="Ver Logs"
                          >
                            <Eye size={18} />
                          </button>
                          
                          <button
                            onClick={() => router.push(`/webhooks/${webhook.id}/edit`)}
                            className="p-2 text-app-text-secondary hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                            title="Editar Webhook"
                          >
                            <Edit size={18} />
                          </button>
                          
                          <button
                            onClick={() => testWebhook(webhook.id)}
                            disabled={testingWebhook === webhook.id}
                            className="p-2 text-app-text-secondary hover:text-green-600 hover:bg-green-50 rounded-xl disabled:opacity-50 transition-all duration-200"
                            title="Testar Webhook"
                          >
                            {testingWebhook === webhook.id ? (
                              <RotateCcw size={18} className="animate-spin" />
                            ) : (
                              <TestTube size={18} />
                            )}
                          </button>
                          
                          <button
                            onClick={() => toggleWebhook(webhook.id, webhook.is_active)}
                            className={`p-2 rounded-xl transition-all duration-200 ${
                              webhook.is_active 
                                ? 'text-green-600 hover:bg-green-50' 
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                            title={webhook.is_active ? 'Desativar' : 'Ativar'}
                          >
                            {webhook.is_active ? <CheckCircle size={18} /> : <XCircle size={18} />}
                          </button>
                          
                          <button
                            onClick={() => deleteWebhook(webhook.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                            title="Deletar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-app-heading mb-3 px-1">Logs de Todos os Webhooks</h2>
              
              {logs.length === 0 ? (
                <div className="card-app p-8 text-center">
                  <Eye size={64} className="mx-auto text-app-text-muted opacity-50 mb-6" />
                  <h3 className="text-xl font-bold text-app-text-primary mb-3">Nenhum log encontrado</h3>
                  <p className="text-app-text-secondary mb-6 max-w-md mx-auto">
                    Os logs dos webhooks aparecerão aqui quando eles forem executados
                  </p>
                  <Button
                    onClick={() => setActiveTab('webhooks')}
                    className="btn-gradient-emerald px-6 py-3 rounded-xl font-bold"
                  >
                    Ver Webhooks
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className={`card-app p-4 border-l-4 transition-all duration-200 hover:shadow-app-medium ${
                      log.success 
                        ? 'border-green-500 bg-green-50/10' 
                        : 'border-red-500 bg-red-50/10'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-app-text-primary">{log.event_type}</span>
                            <Badge className={`px-2 py-1 text-xs font-medium ${
                              log.success 
                                ? 'bg-achievement-exercise/20 text-green-800 border-green-200' 
                                : 'bg-red-100 text-red-800 border-red-200'
                            }`}>
                              {log.success ? 'Sucesso' : 'Falha'}
                            </Badge>
                          </div>
                          <div className="text-sm text-app-text-secondary mb-2">
                            <span className="font-medium">Status:</span> {log.response_status} | 
                            <span className="font-medium ml-2">Tentativa:</span> {log.attempt_count}
                          </div>
                          {log.error_message && (
                            <div className="text-sm text-red-600 bg-red-50/20 p-2 rounded-xl mt-2">
                              <span className="font-medium">Erro:</span> {log.error_message}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-app-text-secondary ml-4">
                          {new Date(log.sent_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal para logs */}
        {showLogs && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-2xl p-6 sm:p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-app-large">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-app-heading">Logs do Webhook</h2>
                <button
                  onClick={() => setShowLogs(false)}
                  className="text-app-text-secondary hover:text-app-text-primary p-2 hover:bg-app-card rounded-xl transition-all duration-200"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="space-y-3">
                {logs.length === 0 ? (
                  <div className="text-center py-12 text-app-text-secondary">
                    <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Nenhum log encontrado</p>
                    <p className="text-sm">Os logs aparecerão aqui quando o webhook for executado</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className={`p-4 rounded-xl border-l-4 transition-all duration-200 hover:shadow-app-medium ${
                      log.success 
                        ? 'border-green-500 bg-green-50/10 hover:bg-green-50/20' 
                        : 'border-red-500 bg-red-50/10 hover:bg-red-50/20'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-app-text-primary">{log.event_type}</span>
                            <Badge className={`px-2 py-1 text-xs font-medium ${
                              log.success 
                                ? 'bg-achievement-exercise/20 text-green-800 border-green-200' 
                                : 'bg-red-100 text-red-800 border-red-200'
                            }`}>
                              {log.success ? 'Sucesso' : 'Falha'}
                            </Badge>
                          </div>
                          <div className="text-sm text-app-text-secondary mb-2">
                            <span className="font-medium">Status:</span> {log.response_status} | 
                            <span className="font-medium ml-2">Tentativa:</span> {log.attempt_count}
                          </div>
                          {log.error_message && (
                            <div className="text-sm text-red-600 bg-red-50/20 p-2 rounded-xl mt-2">
                              <span className="font-medium">Erro:</span> {log.error_message}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-app-text-secondary ml-4">
                          {new Date(log.sent_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Alertas e Recomendações */}
        {metrics && metrics.successRate < 90 && (
          <div className="mt-8 bg-yellow-50/80 backdrop-blur-sm border border-yellow-200/50 rounded-2xl p-6 shadow-app-large">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-yellow-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-yellow-800 mb-2">
                  Atenção Necessária
                </h4>
                <p className="text-yellow-700 mb-3">
                  A taxa de sucesso dos webhooks está abaixo de 90%. Recomendamos verificar:
                </p>
                <ul className="text-yellow-700 space-y-1 list-disc list-inside text-sm">
                  <li>Se as URLs dos webhooks estão respondendo corretamente</li>
                  <li>Se os timeouts estão adequados para os sistemas de destino</li>
                  <li>Se há problemas de conectividade ou autenticação</li>
                  <li>Os logs detalhados para identificar padrões de falha</li>
                </ul>
                <div className="mt-4 flex gap-3">
                  <Button
                    onClick={() => setActiveTab('logs')}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-yellow-700 transition-colors duration-200"
                  >
                    Ver Logs Detalhados
                  </Button>
                  <Button
                    onClick={() => setActiveTab('webhooks')}
                    className="bg-white text-yellow-600 px-4 py-2 rounded-xl text-sm font-medium border border-yellow-200 hover:bg-yellow-50 transition-colors duration-200"
                  >
                    Configurar Webhooks
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions - Seguindo padrão do dashboard */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-app-heading px-1">Acesso Rápido</h3>
          
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard/webhooks/new')}
              className="flex-1 group bg-app-card backdrop-blur-sm border border-app-border-muted rounded-xl p-3 hover:shadow-app-medium transition-all duration-300 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-achievement-exercise rounded-lg flex items-center justify-center">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-app-text-primary group-hover:text-app-text-accent transition-colors duration-300">
                    Novo Webhook
                  </h4>
                  <p className="text-xs text-app-text-secondary">Configurar integração</p>
                </div>
                <ChevronRight className="h-4 w-4 text-app-text-muted group-hover:text-app-text-accent transition-colors duration-300" />
              </div>
            </button>
            
            <button
              onClick={fetchData}
              className="flex-1 group bg-app-card backdrop-blur-sm border border-app-border-muted rounded-xl p-3 hover:shadow-app-medium transition-all duration-300 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-achievement-workout rounded-lg flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-app-text-primary group-hover:text-app-text-accent transition-colors duration-300">
                    Atualizar
                  </h4>
                  <p className="text-xs text-app-text-secondary">Recarregar dados</p>
                </div>
                <ChevronRight className="h-4 w-4 text-app-text-muted group-hover:text-app-text-accent transition-colors duration-300" />
              </div>
            </button>

            <button
              onClick={() => window.open('https://docs.webhooks.com', '_blank')}
              className="flex-1 group bg-app-card backdrop-blur-sm border border-app-border-muted rounded-xl p-3 hover:shadow-app-medium transition-all duration-300 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-achievement-weight rounded-lg flex items-center justify-center">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-app-text-primary group-hover:text-app-text-accent transition-colors duration-300">
                    Documentação
                  </h4>
                  <p className="text-xs text-app-text-secondary">Guias e exemplos</p>
                </div>
                <ChevronRight className="h-4 w-4 text-app-text-muted group-hover:text-app-text-accent transition-colors duration-300" />
              </div>
            </button>
          </div>
        </div>

        {/* Premium Upgrade - Seguindo padrão do dashboard */}
        <div className="relative overflow-hidden rounded-xl bg-achievement-weight p-4 text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-emerald-400/20 blur-2xl"></div>
          <div className="relative text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="font-bold text-sm">Webhooks Premium</span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black mb-1">
                Integração Avançada
              </h3>
              <p className="text-sm opacity-90">
                Webhooks ilimitados, retry inteligente e analytics detalhados
              </p>
            </div>
            <Button className="btn-gradient-emerald px-6 py-2 rounded-xl font-bold shadow-app-large transition-all duration-300 transform hover:scale-105 text-sm">
              <Zap className="h-4 w-4 mr-2" />
              Fazer Upgrade
            </Button>
            <p className="text-xs opacity-75">
              A partir de R$ 19,90/mês
            </p>
          </div>
        </div>

        {/* Footer Statistics */}
        <div className="mt-8 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-app-text-accent">{webhooks.length}</div>
              <div className="text-xs text-app-text-secondary">Webhooks Configurados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-app-text-accent">{webhooks.filter(w => w.is_active).length}</div>
              <div className="text-xs text-app-text-secondary">Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-app-text-accent">{webhooks.reduce((acc, w) => acc + w.events.length, 0)}</div>
              <div className="text-xs text-app-text-secondary">Eventos Monitorados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-app-text-accent">{metrics?.totalSent || 0}</div>
              <div className="text-xs text-app-text-secondary">Total Enviados</div>
            </div>
          </div>
          
          <div className="mt-6 text-xs text-app-text-secondary">
            <p>Última atualização: {new Date().toLocaleString('pt-BR')}</p>
            <p className="mt-1">
              Sistema de webhooks seguro com assinatura HMAC SHA-256 e retry automático
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}