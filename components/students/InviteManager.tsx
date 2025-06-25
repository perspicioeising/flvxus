// components/students/InviteManager.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Link as LinkIcon, 
  Send, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  UserPlus
} from 'lucide-react';

interface InviteManagerProps {
  studentId: string;
  studentEmail: string;
  studentName: string;
  studentStatus: 'active' | 'pending' | 'inactive';
  onInviteSuccess?: () => void;
}

export function InviteManager({ 
  studentId, 
  studentEmail, 
  studentName, 
  studentStatus,
  onInviteSuccess 
}: InviteManagerProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('invite');
  const [result, setResult] = useState<any>(null);

  const handleSendInvite = async () => {
    try {
      setIsLoading(true);
      setResult(null);

      console.log('📨 [INVITE MANAGER] Enviando convite...', { studentId, method: selectedMethod });

      const response = await fetch(`/api/students/${studentId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: selectedMethod
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar convite');
      }

      console.log('✅ [INVITE MANAGER] Convite enviado:', data);

      setResult(data);
      
      toast({
        title: "Convite enviado! 🎉",
        description: data.message,
      });

      onInviteSuccess?.();

    } catch (error: any) {
      console.error('❌ [INVITE MANAGER] Erro:', error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar convite",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyLinkToClipboard = () => {
    if (result?.action_link) {
      navigator.clipboard.writeText(result.action_link);
      toast({
        title: "Link copiado!",
        description: "Link de acesso copiado para a área de transferência.",
      });
    }
  };

  const getStatusInfo = () => {
    switch (studentStatus) {
      case 'active':
        return {
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          icon: CheckCircle,
          text: 'Ativo'
        };
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
          icon: AlertCircle,
          text: 'Pendente'
        };
      case 'inactive':
        return {
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
          icon: AlertCircle,
          text: 'Inativo'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
          icon: AlertCircle,
          text: 'Desconhecido'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={studentStatus === 'pending' ? 'default' : 'outline'}
          size="sm"
          className={`${
            studentStatus === 'pending' 
              ? 'bg-orange-600 hover:bg-orange-700 text-white' 
              : ''
          }`}
        >
          {studentStatus === 'pending' ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reenviar Convite
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Enviar Convite
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" />
            Gerenciar Convite
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do Estudante */}
          <Card className="bg-gray-50 dark:bg-gray-900/50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-gray-600 dark:text-gray-400">Estudante:</span>
                  <span className="font-semibold">{studentName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="text-sm">{studentEmail}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-gray-600 dark:text-gray-400">Status:</span>
                  <Badge className={`${statusInfo.color} border-0`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusInfo.text}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Método de Convite */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Método de Envio:</Label>
            
            <RadioGroup
              value={selectedMethod}
              onValueChange={setSelectedMethod}
              className="space-y-3"
            >
              {/* Email Automático */}
              <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50">
                <RadioGroupItem value="invite" id="invite" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="invite" className="flex items-center gap-2 font-medium cursor-pointer">
                    <Mail className="h-4 w-4 text-blue-600" />
                    Email Automático
                    <Badge variant="secondary" className="text-xs">Recomendado</Badge>
                  </Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    O Supabase envia o email automaticamente para o estudante
                  </p>
                </div>
              </div>

              {/* Link Manual */}
              <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50">
                <RadioGroupItem value="magiclink" id="magiclink" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="magiclink" className="flex items-center gap-2 font-medium cursor-pointer">
                    <LinkIcon className="h-4 w-4 text-purple-600" />
                    Link Manual
                  </Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Gera um link para você enviar por WhatsApp, SMS, etc.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Resultado do Convite */}
          {result && (
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-300">
                      {result.message}
                    </span>
                  </div>
                  
                  <div className="text-sm text-green-700 dark:text-green-400">
                    <strong>Método:</strong> {result.invite_method === 'invite' ? 'Email Automático' : 'Link Manual'}
                  </div>
                  
                  <div className="text-sm text-green-700 dark:text-green-400">
                    <strong>Instruções:</strong> {result.instructions}
                  </div>

                  {/* Link para copiar */}
                  {result.action_link && result.invite_method !== 'invite' && (
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-green-800 dark:text-green-300">
                        Link de Acesso:
                      </Label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 p-2 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded text-xs font-mono break-all max-h-20 overflow-y-auto">
                          {result.action_link}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={copyLinkToClipboard}
                          className="border-green-300 text-green-700 hover:bg-green-100"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSendInvite}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Convite
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook para usar o InviteManager facilmente
export function useInviteManager() {
  const { toast } = useToast();

  const sendQuickInvite = async (studentId: string, method: 'invite' | 'magiclink' = 'invite') => {
    try {
      const response = await fetch(`/api/students/${studentId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ method }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar convite');
      }

      toast({
        title: "Convite enviado! 🎉",
        description: data.message,
      });

      return data;

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar convite",
        description: error.message,
      });
      throw error;
    }
  };

  return { sendQuickInvite };
}

// Componente mais simples para ações rápidas
export function QuickInviteButton({ 
  studentId, 
  method = 'invite',
  size = 'sm',
  variant = 'outline',
  onSuccess 
}: {
  studentId: string;
  method?: 'invite' | 'magiclink';
  size?: 'sm' | 'default' | 'lg';
  variant?: 'outline' | 'default' | 'secondary';
  onSuccess?: (data: any) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { sendQuickInvite } = useInviteManager();

  const handleClick = async () => {
    try {
      setIsLoading(true);
      const result = await sendQuickInvite(studentId, method);
      onSuccess?.(result);
    } catch (error) {
      // Error já foi tratado no hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : method === 'invite' ? (
        <Mail className="w-4 h-4 mr-2" />
      ) : (
        <LinkIcon className="w-4 h-4 mr-2" />
      )}
      {isLoading ? 'Enviando...' : method === 'invite' ? 'Email' : 'Link'}
    </Button>
  );
}