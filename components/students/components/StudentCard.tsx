import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, Target, CalendarDays, Eye, MoreVertical, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Student } from '@/types/student';

interface StudentCardProps {
  student: Student;
  onViewProfile: (id: string) => void;
}

export function StudentCard({ student, onViewProfile }: StudentCardProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-blue-500/20 to-blue-600/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.01]">
        
        {/* Animated gradient border */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

        <CardContent className="relative p-6">
          
          {/* Mobile Layout */}
          <div className="lg:hidden space-y-4">
            {/* Header Mobile */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="w-14 h-14 rounded-2xl shadow-lg">
                  <AvatarImage src={student.avatar_url} alt={student.full_name} />
                  <AvatarFallback className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                    {student.full_name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {student.status === 'active' && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 border-2 border-white dark:border-gray-900 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
                  {student.full_name}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {student.email}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className={`px-2 py-1 text-xs font-medium rounded-full ${
                    student.status === 'active'
                      ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600'
                      : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-600'
                  }`}>
                    {student.status === 'active' ? '● Ativo' : '○ Inativo'}
                  </Badge>
                  {student.experience_level && (
                    <Badge className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600 capitalize">
                      {student.experience_level}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Info Grid Mobile */}
            <div className="grid grid-cols-1 gap-3">
              {student.phone && (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20 rounded-xl">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                    <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {student.phone}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                  <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Desde {format(new Date(student.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
            </div>

            {/* Goals Mobile */}
            {student.goals && student.goals.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Objetivos:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.goals.slice(0, 3).map((goal, goalIndex) => (
                    <Badge
                      key={goalIndex}
                      className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 rounded-full text-xs font-medium"
                    >
                      {goal}
                    </Badge>
                  ))}
                  {student.goals.length > 3 && (
                    <Badge className="px-3 py-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-0 rounded-full text-xs font-medium">
                      +{student.goals.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Actions Mobile */}
            <div className="flex gap-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
              <Button
                onClick={() => onViewProfile(student.id)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300 rounded-xl font-medium border-0 h-11"
              >
                <Eye className="h-4 w-4 mr-2" />
                <span className="text-sm">Ver Perfil</span>
              </Button>
              <Button
                variant="outline"
                className="px-4 bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 text-blue-600 dark:text-blue-400 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 h-11"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex lg:items-center lg:gap-6">
            {/* Student Info - Desktop */}
            <div className="flex items-center gap-4 flex-1">
              <div className="relative">
                <Avatar className="w-16 h-16 rounded-3xl shadow-lg">
                  <AvatarImage src={student.avatar_url} alt={student.full_name} />
                  <AvatarFallback className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center text-white font-black text-xl">
                    {student.full_name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {student.status === 'active' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 border-4 border-white dark:border-gray-900 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {student.full_name}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {student.email}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={`px-3 py-1 text-xs font-medium rounded-full ${
                    student.status === 'active'
                      ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600'
                      : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-600'
                  }`}>
                    {student.status === 'active' ? '● Ativo' : '○ Inativo'}
                  </Badge>
                  {student.experience_level && (
                  <Badge className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600 capitalize">
                      {student.experience_level}
                    </Badge>
                  )}
                  <Badge className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600">
                    Desde {format(new Date(student.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Info Cards - Desktop */}
            <div className="grid grid-cols-2 gap-3 w-80">
              <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                    <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider">
                      Telefone
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {student.phone || 'Não informado'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                    <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider">
                      Objetivos
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {student.goals?.length || 0} definidos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Desktop */}
            <div className="flex gap-3 flex-col w-36">
              <Button
                onClick={() => onViewProfile(student.id)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-xl hover:shadow-blue-500/25 transition-all duration-300 rounded-xl font-semibold border-0"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Perfil
              </Button>
              <Button
                variant="outline"
                className="bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 text-blue-600 dark:text-blue-400 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <MoreVertical className="h-4 w-4 mr-2" />
                Opções
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}