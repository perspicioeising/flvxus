'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudentProfile } from '@/components/students/components/types/student';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Mail,
  Loader2,
  Calendar,
  Clock,
  MoreVertical,
  User,
  Phone
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface StudentDetailsHeaderProps {
  student: StudentProfile;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onResendInvite: () => void;
  isDeleting: boolean;
  isResendingInvite: boolean;
}

export function StudentDetailsHeader({
  student,
  onBack,
  onEdit,
  onDelete,
  onResendInvite,
  isDeleting,
  isResendingInvite
}: StudentDetailsHeaderProps) {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getAge = () => {
    if (!student.birth_date) return null;
    const birthDate = new Date(student.birth_date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      active: { 
        label: 'Ativo', 
        className: 'bg-achievement-consecutive/10 text-achievement-consecutive border-achievement-consecutive/30' 
      },
      inactive: { 
        label: 'Inativo', 
        className: 'bg-app-text-muted/10 text-app-text-muted border-app-text-muted/30' 
      },
      pending: { 
        label: 'Pendente', 
        className: 'bg-achievement-weight/10 text-achievement-weight border-achievement-weight/30' 
      }
    };
    return statusMap[status] || { 
      label: 'Desconhecido', 
      className: 'bg-app-bg-secondary text-app-text-secondary border-app-border-muted' 
    };
  };

  const statusInfo = getStatusInfo(student.status || 'active');

  return (
    <div className="relative mb-6">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-text-accent/10 to-app-achievement-workout/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
      
      <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-2xl sm:rounded-3xl shadow-app-xl">
        <div className="p-4 sm:p-6 lg:p-8">
          
          {/* Navigation and Actions */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <Button
              variant="ghost"
              onClick={onBack}
              className="h-10 w-10 sm:h-12 sm:w-auto sm:px-4 bg-app-card border-app-border-muted hover:border-app-border-accent rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline sm:ml-2 font-semibold">Voltar</span>
            </Button>

            {/* Mobile Actions Menu */}
            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 bg-app-card border-app-border-muted hover:border-app-border-accent rounded-xl"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-48 bg-app-overlay backdrop-blur-xl border border-app-border-default rounded-xl shadow-app-xl"
                >
                  <DropdownMenuItem onClick={onEdit} className="flex items-center gap-2 p-3">
                    <Edit className="h-4 w-4 text-achievement-workout" />
                    <span>Editar</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={onResendInvite} 
                    disabled={isResendingInvite}
                    className="flex items-center gap-2 p-3 text-achievement-weight"
                  >
                    {isResendingInvite ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    <span>{isResendingInvite ? 'Enviando...' : 'Reenviar Convite'}</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={onDelete} 
                    disabled={isDeleting}
                    className="flex items-center gap-2 p-3 text-red-600 dark:text-red-400"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span>{isDeleting ? 'Desativando...' : 'Desativar'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-3">
              <Button
                onClick={onEdit}
                className="h-10 px-4 bg-app-card border-app-border-accent text-app-text-primary hover:bg-app-border-accent/20 rounded-xl font-semibold transition-all duration-300"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              
              <Button
                onClick={onResendInvite}
                disabled={isResendingInvite}
                variant="outline"
                className="h-10 px-4 bg-app-card border-app-border-accent text-achievement-weight hover:bg-achievement-weight/10 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
              >
                {isResendingInvite ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                {isResendingInvite ? 'Enviando...' : 'Reenviar Convite'}
              </Button>
              
              <Button
                onClick={onDelete}
                disabled={isDeleting}
                variant="outline"
                className="h-10 px-4 bg-app-card border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                {isDeleting ? 'Desativando...' : 'Desativar'}
              </Button>
            </div>
          </div>

          {/* Student Profile Section */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-achievement-workout rounded-2xl flex items-center justify-center shadow-app-large">
                <User className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
            </div>
            
            {/* Student Info */}
            <div className="flex-1 min-w-0">
              {/* Name and Status */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-app-heading leading-tight">
                  {student.full_name}
                </h1>
                
                <Badge className={`px-3 py-1 rounded-full text-sm font-medium self-start ${statusInfo.className}`}>
                  {statusInfo.label}
                </Badge>
              </div>
       
              
              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-app-text-secondary">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Criado em {formatDate(student.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}