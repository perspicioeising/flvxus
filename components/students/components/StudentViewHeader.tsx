import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Send,
  User,
  Sparkles,
  MoreVertical,
  Edit,
  Share2,
  Download,
  Trash2,
  Calendar,
  Phone,
  Mail,
  Target,
  Activity,
  Crown,
  Shield,
  Users
} from "lucide-react";

interface StudentViewHeaderProps {
  student: {
    name: string;
    email: string;
    phone?: string;
    status: string;
    goals?: string[];
    experienceLevel?: string;
    birthDate?: string;
    gender?: string;
  };
  isResendingInvite: boolean;
  onEdit: () => void;
  onResendInvite: () => void;
  onBack: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  userRole?: string;
}

export function StudentViewHeader({
  student,
  isResendingInvite,
  onEdit,
  onResendInvite,
  onBack,
  onShare,
  onDownload,
  onDelete,
  userRole = 'trainer'
}: StudentViewHeaderProps) {

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return {
          label: 'Ativo',
          color: 'from-green-500 to-emerald-600',
          icon: Shield
        };
      case 'inactive':
        return {
          label: 'Inativo',
          color: 'from-gray-500 to-gray-600',
          icon: Shield
        };
      case 'pending':
        return {
          label: 'Pendente',
          color: 'from-yellow-500 to-orange-600',
          icon: Shield
        };
      default:
        return {
          label: 'Desconhecido',
          color: 'from-gray-500 to-gray-600',
          icon: Shield
        };
    }
  };

  const getExperienceBadge = (level: string) => {
    switch (level) {
      case 'beginner':
      case 'iniciante':
        return {
          label: 'Iniciante',
          color: 'from-green-400 to-green-500',
          icon: Target
        };
      case 'intermediate':
      case 'intermediario':
        return {
          label: 'Intermediário',
          color: 'from-blue-400 to-blue-500',
          icon: Activity
        };
      case 'advanced':
      case 'avancado':
        return {
          label: 'Avançado',
          color: 'from-purple-400 to-purple-500',
          icon: Crown
        };
      default:
        return {
          label: 'Não definido',
          color: 'from-gray-400 to-gray-500',
          icon: Target
        };
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const getGenderDisplay = (gender: string) => {
    switch (gender) {
      case 'male':
        return 'Masculino';
      case 'female':
        return 'Feminino';
      case 'other':
        return 'Outro';
      default:
        return gender;
    }
  };

  const statusBadge = getStatusBadge(student.status);
  const experienceBadge = getExperienceBadge(student.experienceLevel || '');
  const StatusIcon = statusBadge.icon;
  const ExperienceIcon = experienceBadge.icon;
  const age = calculateAge(student.birthDate || '');

  return (
    <div className="relative mb-8">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-blue-500/20 to-blue-600/20 dark:from-blue-500/10 dark:via-blue-400/10 dark:to-blue-500/10 rounded-3xl blur-xl"></div>

      {/* Main Header Card */}
      <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/30 rounded-3xl shadow-2xl">

        {/* Top Section with Actions */}
        <div className="p-6 sm:p-8 pb-0">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={onBack}
              className="h-12 w-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {/* Desktop Actions */}
            {userRole === 'trainer' && (
              <div className="hidden sm:flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={onEdit}
                  className="h-11 px-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 group"
                >
                  <Edit className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                  Editar
                </Button>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={onResendInvite}
                    disabled={isResendingInvite}
                    variant="outline"
                    className="h-11 px-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 group"
                  >
                    <Send className="h-5 w-5 mr-3" />
                    {isResendingInvite ? (
                      <>
                        <div className="h-4 w-4 mr-2 border-2 border-blue-400/30 border-t-blue-600 rounded-full animate-spin" />
                        Reenviando...
                      </>
                    ) : (
                      "Reenviar Convite"
                    )}
                  </Button>


                </div>

                <Button
                  variant="outline"
                  onClick={onDownload}
                  className="h-11 px-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 group"
                >
                  <Download className="h-4 w-4 mr-2 group-hover:translate-y-0.5 transition-transform" />
                  Relatório
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl shadow-lg transition-all duration-300"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-0 rounded-xl shadow-2xl">
                    <DropdownMenuItem onClick={onDelete} className="text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover Aluno
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Mobile Actions */}
            {userRole === 'trainer' && (
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 rounded-xl shadow-lg transition-all duration-300"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-0 rounded-xl shadow-2xl">
                    <DropdownMenuItem onClick={onEdit} className="rounded-lg">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onShare} className="rounded-lg">
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDownload} className="rounded-lg">
                      <Download className="h-4 w-4 mr-2" />
                      Relatório
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDelete} className="text-red-600 rounded-lg">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onResendInvite} className="text-red-600 rounded-lg">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Reenviar invite
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Title Section */}
          <div className="text-center mb-4">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="relative text-white font-bold text-3xl">
                  {student.name.substring(0, 2).toUpperCase()}
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Sparkles className="h-5 w-5 text-white" />
              </div>

              {/* Status Indicator */}
              <div className={`absolute -bottom-2 -left-2 w-10 h-10 bg-gradient-to-r ${statusBadge.color} rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-900`}>
                <StatusIcon className="h-4 w-4 text-white" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-white bg-clip-text text-transparent mb-3">
              {student.name || "Perfil do Aluno"}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-4 text-gray-600 dark:text-gray-300 mb-6">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm font-medium">{student.email}</span>
              </div>
              {/* {student.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm font-medium">{student.phone}</span>
                </div>
              )}
              {age && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">{age} anos</span>
                </div>
              )} */}
              {student.gender && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">{getGenderDisplay(student.gender)}</span>
                </div>
              )}
            </div>

            {/* Status Badges */}
            
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 sm:p-8 pt-0">

        </div>
      </div>
    </div>
  );
}