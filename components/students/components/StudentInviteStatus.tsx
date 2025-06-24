// /components/students/StudentInviteStatus.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  MailCheck, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle,
  Send,
  Eye
} from 'lucide-react';

interface StudentInviteStatusProps {
  studentId: string;
  studentName: string;
  studentEmail: string;
  inviteStatus: 'pending' | 'accepted' | 'expired';
  lastInviteSent?: string;
  onResendInvite?: () => void;
}

export function StudentInviteStatus({
  studentId,
  studentName,
  studentEmail,
  inviteStatus,
  lastInviteSent,
  onResendInvite
}: StudentInviteStatusProps) {
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  const handleResendInvite = async () => {
    try {
      setIsResending(true);
      
      const response = await fetch(`/api/students/${studentId}/resend-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Convite reenviado! 📧",
        description: "Um novo email de convite foi enviado para o aluno.",
      });

      if (onResendInvite) {
        onResendInvite();
      }

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao reenviar convite",
        description: error.message,
      });
    } finally {
      setIsResending(false);
    }
  };

  const getStatusConfig = () => {
    switch (inviteStatus) {
      case 'accepted':
        return {
          icon: CheckCircle,
          color: 'text-achievement-workout',
          bgColor: 'bg-app-achievement-workout/10',
          borderColor: 'border-app-border-accent',
          label: 'Ativo',
          description: 'Aluno já acessou a plataforma'
        };
      case 'expired':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          label: 'Expirado',
          description: 'Convite expirou, reenvie um novo'
        };
      default:
        return {
          icon: Clock,
          color: 'text-app-text-accent',
          bgColor: 'bg-app-text-accent/10',
          borderColor: 'border-app-border-accent',
          label: 'Pendente',
          description: 'Aguardando primeiro acesso'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <Card className={`border-0 ${statusConfig.bgColor} ${statusConfig.borderColor} rounded-xl`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${statusConfig.bgColor} rounded-xl flex items-center justify-center border ${statusConfig.borderColor}`}>
              <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-app-text-primary">{studentName}</h4>
                <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor} text-xs`}>
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-sm text-app-text-secondary">{statusConfig.description}</p>
              {lastInviteSent && (
                <p className="text-xs text-app-text-muted mt-1">
                  Último convite: {new Date(lastInviteSent).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>

          {inviteStatus !== 'accepted' && (
            <Button
              onClick={handleResendInvite}
              disabled={isResending}
              size="sm"
              className="bg-app-text-accent hover:bg-app-btn-primary-hover text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Reenviar
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}