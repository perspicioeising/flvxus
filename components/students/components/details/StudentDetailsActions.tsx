'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StudentProfile } from '@/components/students/components/types/student';
import { 
  Edit, 
  Copy, 
  Trash2, 
  Loader2, 
  Share2, 
  Download, 
  BarChart3, 
  Info,
  Mail,
  User,
  Target,
  Heart,
  Activity,
  Calendar,
  Phone
} from 'lucide-react';

interface StudentDetailsActionsProps {
  student: StudentProfile;
  onEdit: () => void;
  onClone: () => void;
  onDelete: () => void;
  onResendInvite: () => void;
  isDeleting: boolean;
  isResendingInvite: boolean;
}

export function StudentDetailsActions({
  student,
  onEdit,
  onClone,
  onDelete,
  onResendInvite,
  isDeleting,
  isResendingInvite
}: StudentDetailsActionsProps) {

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Aluno: ${student.full_name}`,
          text: `Informações do aluno ${student.full_name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleExport = () => {
    const studentData = {
      name: student.full_name,
      email: student.email,
      phone: student.phone,
      birth_date: student.birth_date,
      gender: student.gender,
      height: student.height,
      weight: student.weight,
      goals: student.goals,
      medical_conditions: student.medical_conditions,
      emergency_contact: student.emergency_contact,
      preferred_training_time: student.preferred_training_time,
      experience_level: student.experience_level,
      notes: student.notes,
      created_at: student.created_at
    };

    const dataStr = JSON.stringify(studentData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `aluno-${student.full_name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  return (
    <div className="lg:hidden mt-6">
      <Card className="border-0 card-app">
        <CardContent className="p-4 sm:p-6">
          
          {/* Quick Stats */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-app-heading mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-app-text-accent" />
              Resumo do Aluno
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-achievement-workout/10 border border-app-border-accent rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-achievement-workout">
                  {getAge() || '--'}
                </div>
                <div className="text-xs text-app-text-secondary">Anos</div>
              </div>
              
              <div className="bg-achievement-consecutive/10 border border-app-border-accent rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-achievement-consecutive">
                  {student.goals?.length || 0}
                </div>
                <div className="text-xs text-app-text-secondary">Objetivos</div>
              </div>
              
              <div className="bg-achievement-weight/10 border border-app-border-accent rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-achievement-weight">
                  {student.height ? `${student.height}cm` : '--'}
                </div>
                <div className="text-xs text-app-text-secondary">Altura</div>
              </div>
              
              <div className="bg-achievement-exercise/10 border border-app-border-accent rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-achievement-exercise">
                  {student.weight ? `${student.weight}kg` : '--'}
                </div>
                <div className="text-xs text-app-text-secondary">Peso</div>
              </div>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="space-y-3 mb-6">
            <h4 className="text-base font-semibold text-app-text-primary mb-3">
              Ações Principais
            </h4>
            
            <div className="space-y-3">
              <Button
                onClick={onEdit}
                className="w-full btn-gradient-primary h-12 rounded-xl font-bold shadow-app-medium hover:shadow-app-large transition-all duration-300 transform active:scale-95"
              >
                <Edit className="h-5 w-5 mr-3" />
                Editar Aluno
              </Button>
              

              <Button
                onClick={onResendInvite}
                disabled={isResendingInvite}
                variant="outline"
                className="w-full h-12 bg-app-card border-app-border-accent text-achievement-weight hover:bg-achievement-weight/10 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResendingInvite ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    Enviando Convite...
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5 mr-3" />
                    Reenviar Convite
                  </>
                )}
              </Button>
              
              <Button
                onClick={onDelete}
                disabled={isDeleting}
                variant="outline"
                className="w-full h-12 bg-app-card border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    Desativando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-5 w-5 mr-3" />
                    Desativar Aluno
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-app-border-muted"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-app-bg-card text-app-text-muted">
                Ações Secundárias
              </span>
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              onClick={handleShare}
              variant="outline"
              className="h-11 bg-app-card border-app-border-muted text-app-text-primary hover:bg-app-border-accent/20 rounded-xl font-medium transition-all duration-300"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
            
            <Button
              onClick={handleExport}
              variant="outline"
              className="h-11 bg-app-card border-app-border-muted text-app-text-primary hover:bg-app-border-accent/20 rounded-xl font-medium transition-all duration-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          {/* Student Information Summary */}
          <div className="p-4 bg-app-bg-secondary rounded-xl border border-app-border-muted">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-app-text-accent" />
              <h5 className="text-sm font-semibold text-app-text-primary">
                Informações do Aluno
              </h5>
            </div>
            
            <div className="space-y-3">
              {/* Contact Info */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-achievement-workout/20 rounded-lg flex items-center justify-center">
                  <Mail className="h-4 w-4 text-achievement-workout" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-app-text-secondary">Email</div>
                  <div className="font-medium text-app-text-primary text-sm truncate">
                    {student.email}
                  </div>
                </div>
              </div>

              {student.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-achievement-consecutive/20 rounded-lg flex items-center justify-center">
                    <Phone className="h-4 w-4 text-achievement-consecutive" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-app-text-secondary">Telefone</div>
                    <div className="font-medium text-app-text-primary text-sm">
                      {student.phone}
                    </div>
                  </div>
                </div>
              )}

              {student.birth_date && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-achievement-weight/20 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-achievement-weight" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-app-text-secondary">Nascimento</div>
                    <div className="font-medium text-app-text-primary text-sm">
                      {new Date(student.birth_date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              )}

              {student.experience_level && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-achievement-exercise/20 rounded-lg flex items-center justify-center">
                    <Activity className="h-4 w-4 text-achievement-exercise" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-app-text-secondary">Experiência</div>
                    <div className="font-medium text-app-text-primary text-sm">
                      {student.experience_level === 'beginner' ? 'Iniciante' :
                       student.experience_level === 'intermediate' ? 'Intermediário' :
                       student.experience_level === 'advanced' ? 'Avançado' : student.experience_level}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Health Warning */}
            {student.medical_conditions && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-xs font-semibold text-red-700 dark:text-red-300">
                    Atenção: Condições Médicas
                  </span>
                </div>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Este aluno possui condições médicas registradas. Consulte os detalhes.
                </p>
              </div>
            )}

            {/* Emergency Contact Warning */}
            {student.emergency_contact && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
                    Contato de Emergência Cadastrado
                  </span>
                </div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  {student.emergency_contact}
                </p>
              </div>
            )}

            {/* Goals Summary */}
            {student.goals && student.goals.length > 0 && (
              <div className="mt-3 p-3 bg-achievement-weight/10 border border-app-border-accent rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-achievement-weight" />
                  <span className="text-xs font-semibold text-achievement-weight">
                    Objetivos ({student.goals.length})
                  </span>
                </div>
                <div className="text-xs text-app-text-secondary">
                  {student.goals.slice(0, 2).join(', ')}
                  {student.goals.length > 2 && ` e mais ${student.goals.length - 2}...`}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}