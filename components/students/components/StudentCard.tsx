import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, Target, CalendarDays, Eye, MoreVertical, MapPin, Users, Activity } from "lucide-react";
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
      {/* Sophisticated hover effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 rounded-3xl blur opacity-0 group-hover:opacity-20 transition-all duration-700"></div>
      
      <Card className="relative h-full bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:border-gray-300/80 dark:group-hover:border-gray-700/80 cursor-pointer"
        onClick={() => onViewProfile(student.id)}
      >
        
        {/* Innovative background pattern - Optimized for theme switching */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Grid pattern - More subtle in dark mode */}
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.008]" 
               style={{
                 backgroundImage: `
                   linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                   linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
                 `,
                 backgroundSize: '20px 20px'
               }}>
          </div>
          
          {/* Static geometric shapes - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:block absolute top-4 right-6 w-8 h-8 border border-green-400/15 dark:border-green-500/20 rounded-lg rotate-12 group-hover:rotate-45 transition-transform duration-1000"></div>
          <div className="hidden lg:block absolute bottom-6 left-8 w-6 h-6 border border-green-400/15 dark:border-green-500/20 rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="hidden lg:block absolute top-12 left-1/3 w-4 h-4 bg-emerald-400/8 dark:bg-emerald-500/10 rounded-sm rotate-45 group-hover:rotate-90 transition-transform duration-1000"></div>
          
          {/* Data visualization inspired lines - Desktop only */}
          <div className="hidden lg:block absolute bottom-8 right-12 flex gap-1">
            <div className="w-1 h-8 bg-gradient-to-t from-green-400/15 dark:from-green-500/20 to-transparent rounded-full"></div>
            <div className="w-1 h-6 bg-gradient-to-t from-green-400/15 dark:from-green-500/20 to-transparent rounded-full"></div>
            <div className="w-1 h-10 bg-gradient-to-t from-emerald-400/15 dark:from-emerald-500/20 to-transparent rounded-full"></div>
            <div className="w-1 h-4 bg-gradient-to-t from-green-400/15 dark:from-green-500/20 to-transparent rounded-full"></div>
          </div>
        </div>

        {/* Additional UX Elements - Separated for mobile/desktop */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Quick action indicators - Desktop only */}
          <div className="hidden lg:flex absolute top-3 right-3 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-2 h-2 bg-green-500/60 dark:bg-green-400/70 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-500/60 dark:bg-green-400/70 rounded-full animate-pulse delay-100"></div>
          </div>

          {/* Progress indicator - More subtle in dark mode */}
          <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-green-500/0 via-green-500/40 dark:via-green-400/30 to-green-500/0 w-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>

          {/* Data quality indicator - Mobile: top-right, Desktop: top-left */}
          <div className="absolute top-3 right-3 lg:top-3 lg:left-3 opacity-50 dark:opacity-40">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500/80 dark:bg-green-400/90 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-green-500/80 dark:bg-green-400/90 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-green-500/80 dark:bg-green-400/90 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-yellow-500/80 dark:bg-yellow-400/90 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-gray-300/80 dark:bg-gray-500/60 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Subtle top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <CardContent className="relative p-4 sm:p-6">

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-4">
            {/* Header Mobile */}
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                {/* Multi-layered avatar effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-green-500/20 to-emerald-500/20 rounded-2xl blur-sm group-hover:blur-md transition-all duration-500"></div>
                
                <div className="relative w-14 h-14 bg-gradient-to-br from-green-600 via-green-600 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-all duration-300">
                  {student.full_name?.substring(0, 2).toUpperCase()}
                  
                  {/* Inner glow */}
                  <div className="absolute inset-1 border border-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                {/* Pulsing status indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5">
                  <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
                  <div className="relative w-5 h-5 bg-gradient-to-r from-emerald-400 to-green-500 border-2 border-white dark:border-gray-900 rounded-full flex items-center justify-center shadow-lg">
                    {student.status === 'active' ? (
                      <Activity className="h-2.5 w-2.5 text-white" />
                    ) : (
                      <div className="w-2 h-2 bg-white rounded-full opacity-50"></div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300 pr-2">
                    {student.full_name}
                  </h3>
                  
                  {/* Assessment type indicator - Moved to avoid overlap */}
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${student.status === 'active' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-gray-400'}`}></div>
                    <span className={`text-xs font-medium ${student.status === 'active' ? 'text-emerald-600 dark:text-emerald-300' : 'text-gray-500'}`}>
                      {student.status === 'active' ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-3 flex items-center gap-1.5">
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{student.email}</span>
                </p>
                
                {/* Quick metrics preview - Better contrast for dark mode */}
                <div className="flex items-center gap-3 mb-3">
                  {student.phone && (
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">Tel: {student.phone.slice(-4)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                      {student.goals?.length || 0} objetivos
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-50 text-green-700 border border-green-200/70 dark:bg-green-950/60 dark:text-green-200 dark:border-green-800/60 text-xs px-2.5 py-1 font-medium hover:bg-green-100 dark:hover:bg-green-900/70 transition-colors duration-200">
                    <CalendarDays className="h-3 w-3 mr-1.5" />
                    {format(new Date(student.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </Badge>
                  {student.experience_level && (
                    <Badge className="bg-purple-50 text-purple-700 border border-purple-200/70 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-800/60 text-xs px-2.5 py-1 font-medium hover:bg-purple-100 dark:hover:bg-purple-900/70 transition-colors duration-200 capitalize">
                      <Target className="h-3 w-3 mr-1.5" />
                      {student.experience_level}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex lg:items-center lg:gap-6">
            {/* Student Info - Desktop */}
            <div className="flex items-center gap-5 flex-1">
              <div className="relative">
                {/* Enhanced multi-layer avatar */}
                <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">
                    {student.full_name?.substring(0, 2).toUpperCase()}
                  </span>
           
                  {/* Sophisticated inner details */}
                  <div className="absolute inset-2 border border-white/15 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-3xl"></div>
                </div>
                
                {/* Advanced status indicator */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6">
                  <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-25"></div>
                  <div className="absolute inset-0.5 bg-emerald-400 rounded-full animate-pulse opacity-40"></div>
                  <div className="relative w-6 h-6 bg-gradient-to-r from-emerald-400 to-green-500 border-3 border-white dark:border-gray-900 rounded-full flex items-center justify-center shadow-xl">
                    {student.status === 'active' ? (
                      <Activity className="h-3 w-3 text-white" />
                    ) : (
                      <div className="w-2 h-2 bg-white rounded-full opacity-50"></div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">
                    {student.full_name}
                  </h3>
                  
                  {/* Assessment completeness indicator */}
                  <div className="flex items-center gap-2 ml-4">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${student.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                      <span className={`text-xs font-semibold ${student.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`}>
                        {student.status === 'active' ? 'ATIVO' : 'INATIVO'}
                      </span>
                    </div>
                    {student.experience_level && (
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-medium capitalize">
                          {student.experience_level}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span>{student.email}</span>
                </p>
                
                <div className="flex flex-wrap gap-2.5">
                  <Badge className="bg-green-50 text-blue-700 border border-blue-200/70 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/50 text-xs px-3 py-1.5 font-medium hover:bg-green-100 dark:hover:bg-green-900/60 hover:shadow-sm transition-all duration-200">
                    <CalendarDays className="h-3 w-3 mr-2" />
                    {format(new Date(student.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </Badge>
                  {student.phone && (
                    <Badge className="bg-green-50 text-green-700 border border-green-200/70 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800/50 text-xs px-3 py-1.5 font-medium hover:bg-green-100 dark:hover:bg-green-900/60 hover:shadow-sm transition-all duration-200">
                      <Phone className="h-3 w-3 mr-2" />
                      {student.phone}
                    </Badge>
                  )}
                  <Badge className="bg-purple-50 text-purple-700 border border-purple-200/70 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/50 text-xs px-3 py-1.5 font-medium hover:bg-purple-100 dark:hover:bg-purple-900/60 hover:shadow-sm transition-all duration-200">
                    <Target className="h-3 w-3 mr-2" />
                    {student.goals?.length || 0} objetivos
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Elegant bottom highlight */}
        <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-green-500/40 via-green-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
      </Card>
    </div>
  );
}