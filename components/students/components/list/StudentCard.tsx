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
      {/* Hover glow effect com cores do sistema */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-app-text-accent/30 via-app-achievement-workout/30 to-app-text-accent/30 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
      
      <Card className="relative h-full card-app transition-all duration-500 rounded-2xl overflow-hidden cursor-pointer group-hover:transform group-hover:scale-[1.01]"
        onClick={() => onViewProfile(student.id)}
      >
        
        {/* Background pattern otimizado */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Grid pattern sutil */}
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.008]" 
               style={{
                 backgroundImage: `
                   linear-gradient(rgb(var(--text-accent)) 1px, transparent 1px),
                   linear-gradient(90deg, rgb(var(--text-accent)) 1px, transparent 1px)
                 `,
                 backgroundSize: '20px 20px'
               }}>
          </div>
          
          {/* Elementos geométricos - Desktop only */}
          <div className="hidden lg:block absolute top-4 right-6 w-8 h-8 border border-app-border-accent rounded-lg rotate-12 group-hover:rotate-45 transition-transform duration-1000"></div>
          <div className="hidden lg:block absolute bottom-6 left-8 w-6 h-6 border border-app-border-accent rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="hidden lg:block absolute top-12 left-1/3 w-4 h-4 bg-app-text-accent/10 rounded-sm rotate-45 group-hover:rotate-90 transition-transform duration-1000"></div>
          
          {/* Linhas de visualização de dados - Desktop only */}
          <div className="hidden lg:block absolute bottom-8 right-12 flex gap-1">
            <div className="w-1 h-8 bg-gradient-to-t from-app-text-accent/20 to-transparent rounded-full"></div>
            <div className="w-1 h-6 bg-gradient-to-t from-app-text-accent/20 to-transparent rounded-full"></div>
            <div className="w-1 h-10 bg-gradient-to-t from-app-achievement-workout/20 to-transparent rounded-full"></div>
            <div className="w-1 h-4 bg-gradient-to-t from-app-text-accent/20 to-transparent rounded-full"></div>
          </div>
        </div>

        {/* Elementos UX adicionais */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Indicadores de ação rápida - Desktop only */}
          <div className="hidden lg:flex absolute top-3 right-3 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-2 h-2 bg-app-text-accent/60 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-app-text-accent/60 rounded-full animate-pulse delay-100"></div>
          </div>

          {/* Indicador de progresso */}
          <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-app-text-accent/0 via-app-text-accent/40 to-app-text-accent/0 w-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>

          {/* Indicador de qualidade de dados */}
          <div className="absolute top-3 right-3 lg:top-3 lg:left-3 opacity-50">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-app-text-accent/80 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-app-text-accent/80 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-app-text-accent/80 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-app-achievement-workout/80 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-app-border-muted rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Accent superior sutil */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-app-text-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <CardContent className="relative p-4 sm:p-6">

          {/* Layout Mobile */}
          <div className="lg:hidden space-y-4">
            {/* Header Mobile */}
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                {/* Avatar com efeito multi-camada */}
                <div className="absolute inset-0 bg-gradient-to-br from-app-text-accent/20 via-app-text-accent/20 to-app-achievement-workout/20 rounded-2xl blur-sm group-hover:blur-md transition-all duration-500"></div>
                
                <div className="relative w-14 h-14 bg-achievement-workout rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-app-medium group-hover:shadow-app-large transition-all duration-300">
                  {student.full_name?.substring(0, 2).toUpperCase()}
                  
                  {/* Brilho interno */}
                  <div className="absolute inset-1 border border-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                {/* Indicador de status pulsante */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5">
                  <div className="absolute inset-0 bg-app-achievement-consecutive rounded-full animate-ping opacity-20"></div>
                  <div className="relative w-5 h-5 bg-achievement-consecutive border-2 border-app-card rounded-full flex items-center justify-center shadow-app-medium">
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
                  <h3 className="text-lg font-bold text-app-text-primary truncate group-hover:text-app-text-accent transition-colors duration-300 pr-2">
                    {student.full_name}
                  </h3>
                  
                  {/* Indicador de tipo de avaliação */}
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${student.status === 'active' ? 'bg-app-achievement-consecutive' : 'bg-app-text-muted'}`}></div>
                    <span className={`text-xs font-medium ${student.status === 'active' ? 'text-achievement-consecutive' : 'text-app-text-muted'}`}>
                      {student.status === 'active' ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </div>
                </div>
                
                <p className="text-app-text-secondary text-sm truncate mb-3 flex items-center gap-1.5">
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{student.email}</span>
                </p>
                
                {/* Preview de métricas rápidas */}
                <div className="flex items-center gap-3 mb-3">
                  {student.phone && (
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-app-text-accent rounded-full"></div>
                      <span className="text-xs text-app-text-secondary font-medium">Tel: {student.phone.slice(-4)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-app-achievement-weight rounded-full"></div>
                    <span className="text-xs text-app-text-secondary font-medium">
                      {student.goals?.length || 0} objetivos
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-app-text-accent/10 text-achievement-workout border border-app-border-accent text-xs px-2.5 py-1 font-medium hover:bg-app-text-accent/20 transition-colors duration-200">
                    <CalendarDays className="h-3 w-3 mr-1.5" />
                    {format(new Date(student.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </Badge>
                  {student.experience_level && (
                    <Badge className="bg-app-achievement-exercise/10 text-achievement-exercise border border-app-border-accent text-xs px-2.5 py-1 font-medium hover:bg-app-achievement-exercise/20 transition-colors duration-200 capitalize">
                      <Target className="h-3 w-3 mr-1.5" />
                      {student.experience_level}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Layout Desktop */}
          <div className="hidden lg:flex lg:items-center lg:gap-6">
            {/* Info do Estudante - Desktop */}
            <div className="flex items-center gap-5 flex-1">
              <div className="relative">
                {/* Avatar multi-camada aprimorado */}
                <div className="w-16 h-16 sm:w-18 sm:h-18 bg-achievement-workout rounded-2xl flex items-center justify-center shadow-app-medium">
                  <span className="text-white font-bold text-xl">
                    {student.full_name?.substring(0, 2).toUpperCase()}
                  </span>
           
                  {/* Detalhes internos sofisticados */}
                  <div className="absolute inset-2 border border-white/15 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-3xl"></div>
                </div>
                
                {/* Indicador de status avançado */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6">
                  <div className="absolute inset-0 bg-app-achievement-consecutive rounded-full animate-ping opacity-25"></div>
                  <div className="absolute inset-0.5 bg-app-achievement-consecutive rounded-full animate-pulse opacity-40"></div>
                  <div className="relative w-6 h-6 bg-achievement-consecutive border-3 border-app-card rounded-full flex items-center justify-center shadow-app-xl">
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
                  <h3 className="text-xl font-bold text-app-text-primary group-hover:text-app-text-accent transition-colors duration-300">
                    {student.full_name}
                  </h3>
                  
                  {/* Indicador de completude da avaliação */}
                  <div className="flex items-center gap-2 ml-4">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${student.status === 'active' ? 'bg-app-achievement-consecutive' : 'bg-app-text-muted'}`}></div>
                      <span className={`text-xs font-semibold ${student.status === 'active' ? 'text-achievement-consecutive' : 'text-app-text-muted'}`}>
                        {student.status === 'active' ? 'ATIVO' : 'INATIVO'}
                      </span>
                    </div>
                    {student.experience_level && (
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3 text-achievement-exercise" />
                        <span className="text-xs text-achievement-exercise font-medium capitalize">
                          {student.experience_level}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-app-text-secondary mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span>{student.email}</span>
                </p>
                
                <div className="flex flex-wrap gap-2.5">
                  <Badge className="bg-app-text-accent/10 text-achievement-workout border border-app-border-accent text-xs px-3 py-1.5 font-medium hover:bg-app-text-accent/20 hover:shadow-app-light transition-all duration-200">
                    <CalendarDays className="h-3 w-3 mr-2" />
                    {format(new Date(student.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </Badge>
                  {student.phone && (
                    <Badge className="bg-app-achievement-consecutive/10 text-achievement-consecutive border border-app-border-accent text-xs px-3 py-1.5 font-medium hover:bg-app-achievement-consecutive/20 hover:shadow-app-light transition-all duration-200">
                      <Phone className="h-3 w-3 mr-2" />
                      {student.phone}
                    </Badge>
                  )}
                  <Badge className="bg-app-achievement-weight/10 text-achievement-weight border border-app-border-accent text-xs px-3 py-1.5 font-medium hover:bg-app-achievement-weight/20 hover:shadow-app-light transition-all duration-200">
                    <Target className="h-3 w-3 mr-2" />
                    {student.goals?.length || 0} objetivos
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Destaque inferior elegante */}
        <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-app-text-accent/40 via-app-text-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
      </Card>
    </div>
  );
}