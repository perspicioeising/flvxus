import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Brain, Activity, Calendar, Users, TrendingUp, Book } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock interfaces - replace with actual types
interface AssessmentCardProps {
  assessment: {
    id: string;
    profiles: {
      full_name: string;
      email: string;
    };
    weight: number;
    height: number;
    fat_percentage: number;
    gender: string;
    date: string;
    protocol: string;
    ai_analysis?: any;
  };
  onView: (id: string) => void;
  onViewAnalysis: (id: string) => void;
}

// Mock constants - replace with actual constants
const PROTOCOLS = {
  jackson_pollock_3: 'Jackson & Pollock (3 dobras)',
  jackson_pollock_7: 'Jackson & Pollock (7 dobras)',
};

export function AssessmentCard({
  assessment,
  onView,
  onViewAnalysis
}: AssessmentCardProps) {

  const getClassificationBadge = (fatPercentage: number, gender: string) => {
    // Mock classification logic
    let classification = "Normal";
    let colorClass = "bg-app-achievement-workout/10 text-app-achievement-workout border border-app-border-accent";
    
    if (gender === "male") {
      if (fatPercentage < 6) {
        classification = "Essencial";
        colorClass = "bg-blue-500/10 text-blue-600 border border-blue-200";
      } else if (fatPercentage <= 13) {
        classification = "Atlético";
        colorClass = "bg-app-achievement-workout/10 text-app-achievement-workout border border-app-border-accent";
      } else if (fatPercentage <= 17) {
        classification = "Fitness";
        colorClass = "bg-yellow-500/10 text-yellow-600 border border-yellow-200";
      } else {
        classification = "Acima";
        colorClass = "bg-red-500/10 text-red-600 border border-red-200";
      }
    }
    
    return (
      <Badge className={`${colorClass} font-semibold text-xs`}>
        {classification}
      </Badge>
    );
  };

  return (
    <div className="relative group">
      {/* Sophisticated hover effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-app-achievement-workout via-app-btn-primary to-app-achievement-workout rounded-3xl blur opacity-0 group-hover:opacity-20 transition-all duration-700"></div>
      
      <Card className="relative h-full card-app border border-app-border-muted shadow-app-medium hover:shadow-app-xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:border-app-border-accent cursor-pointer"
        onClick={() => onView(assessment.id)}
      >
        
        {/* Innovative background pattern - Optimized for theme switching */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Grid pattern - More subtle */}
          <div className="absolute inset-0 opacity-[0.02]" 
               style={{
                 backgroundImage: `
                   linear-gradient(rgba(var(--app-achievement-workout-rgb), 0.3) 1px, transparent 1px),
                   linear-gradient(90deg, rgba(var(--app-achievement-workout-rgb), 0.3) 1px, transparent 1px)
                 `,
                 backgroundSize: '20px 20px'
               }}>
          </div>
          
          {/* Static geometric shapes - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:block absolute top-4 right-6 w-8 h-8 border border-app-achievement-workout/15 rounded-lg rotate-12 group-hover:rotate-45 transition-transform duration-1000"></div>
          <div className="hidden lg:block absolute bottom-6 left-8 w-6 h-6 border border-app-achievement-workout/15 rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="hidden lg:block absolute top-12 left-1/3 w-4 h-4 bg-app-achievement-workout/8 rounded-sm rotate-45 group-hover:rotate-90 transition-transform duration-1000"></div>
          
          {/* Data visualization inspired lines - Desktop only */}
          <div className="hidden lg:block absolute bottom-8 right-12 flex gap-1">
            <div className="w-1 h-8 bg-gradient-to-t from-app-achievement-workout/15 to-transparent rounded-full"></div>
            <div className="w-1 h-6 bg-gradient-to-t from-app-btn-primary/15 to-transparent rounded-full"></div>
            <div className="w-1 h-10 bg-gradient-to-t from-app-achievement-workout/15 to-transparent rounded-full"></div>
            <div className="w-1 h-4 bg-gradient-to-t from-app-btn-secondary/15 to-transparent rounded-full"></div>
          </div>
        </div>

        {/* Additional UX Elements - Separated for mobile/desktop */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Quick action indicators - Desktop only */}
          <div className="hidden lg:flex absolute top-3 right-3 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-2 h-2 bg-app-achievement-workout/60 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-app-btn-primary/60 rounded-full animate-pulse delay-100"></div>
          </div>

          {/* Progress indicator */}
          <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-app-achievement-workout/0 via-app-achievement-workout/40 to-app-achievement-workout/0 w-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>

          {/* Data quality indicator - Mobile: top-right, Desktop: top-left */}
          <div className="absolute top-3 right-3 lg:top-3 lg:left-3 opacity-50">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-app-achievement-workout/80 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-app-achievement-workout/80 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-app-achievement-workout/80 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-yellow-500/80 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-app-border-muted rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Subtle top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-app-achievement-workout/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <CardContent className="relative p-4 sm:p-6">

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-4">
            {/* Header Mobile */}
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                {/* Multi-layered avatar effect */}
                <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-app-achievement-workout to-app-btn-primary rounded-2xl flex items-center justify-center shadow-app-large">
                  <Book className="h-8 w-8 sm:h-9 sm:w-9 text-white" />
                  {/* Inner glow */}
                  <div className="absolute inset-1 border border-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                {/* Pulsing status indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5">
                  <div className="absolute inset-0 bg-app-achievement-workout rounded-full animate-ping opacity-20"></div>
                  <div className="relative w-5 h-5 bg-gradient-to-r from-app-achievement-workout to-app-btn-primary border-2 border-white rounded-full flex items-center justify-center shadow-app-large">
                    <Activity className="h-2.5 w-2.5 text-white" />
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-app-heading truncate group-hover:text-app-achievement-workout transition-colors duration-300 pr-2">
                    {assessment.profiles.full_name}
                  </h3>
                </div>
                
                <p className="text-sm text-app-text-secondary truncate mb-3 flex items-center gap-1.5">
                  <Users className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{assessment.profiles.email}</span>
                </p>
                
                {/* Quick metrics preview */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <span className="text-xs text-app-text-secondary font-medium">IMC: {(assessment.weight / Math.pow(assessment.height / 100, 2)).toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-app-achievement-workout rounded-full"></div>
                    <span className="text-xs text-app-text-secondary font-medium">BF: {assessment.fat_percentage?.toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-app-achievement-workout/10 text-app-achievement-workout border border-app-border-accent text-xs px-2.5 py-1 font-medium hover:bg-app-achievement-workout/20 transition-colors duration-200">
                    <Calendar className="h-3 w-3 mr-1.5" />
                    {format(new Date(assessment.date), 'dd/MM/yyyy', { locale: ptBR })}
                  </Badge>
                  <Badge className="bg-app-btn-primary/10 text-app-btn-primary border border-app-border-accent text-xs px-2.5 py-1 font-medium hover:bg-app-btn-primary/20 transition-colors duration-200">
                    <TrendingUp className="h-3 w-3 mr-1.5" />
                    {PROTOCOLS[assessment.protocol as keyof typeof PROTOCOLS]}
                  </Badge>
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
                <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-app-achievement-workout to-app-btn-primary rounded-2xl flex items-center justify-center shadow-app-large">
                  <Book className="h-8 w-8 sm:h-9 sm:w-9 text-white" />
                  {/* Sophisticated inner details */}
                  <div className="absolute inset-2 border border-white/15 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-3xl"></div>
                </div>
                
                {/* Advanced status indicator */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6">
                  <div className="absolute inset-0 bg-app-achievement-workout rounded-full animate-ping opacity-25"></div>
                  <div className="absolute inset-0.5 bg-app-achievement-workout rounded-full animate-pulse opacity-40"></div>
                  <div className="relative w-6 h-6 bg-gradient-to-r from-app-achievement-workout to-app-btn-primary border-3 border-white rounded-full flex items-center justify-center shadow-app-xl">
                    <Activity className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-app-heading group-hover:text-app-achievement-workout transition-colors duration-300">
                    {assessment.profiles.full_name}
                  </h3>
                  
                  {/* Assessment completeness indicator */}
                  <div className="flex items-center gap-2 ml-4">
                    {assessment.ai_analysis && (
                      <div className="flex items-center gap-1">
                        <Brain className="h-3 w-3 text-app-achievement-workout" />
                        <span className="text-xs text-app-achievement-workout font-medium"></span>
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-app-text-secondary mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span>{assessment.profiles.email}</span>
                </p>
                
                <div className="flex flex-wrap gap-2.5">
                  <Badge className="bg-app-achievement-workout/10 text-app-achievement-workout border border-app-border-accent text-xs px-3 py-1.5 font-medium hover:bg-app-achievement-workout/20 hover:shadow-app-medium transition-all duration-200">
                    <Calendar className="h-3 w-3 mr-2" />
                    {format(new Date(assessment.date), 'dd/MM/yyyy', { locale: ptBR })}
                  </Badge>
                  <Badge className="bg-purple-500/10 text-purple-600 border border-purple-200 text-xs px-3 py-1.5 font-medium hover:bg-purple-500/20 hover:shadow-app-medium transition-all duration-200">
                    <TrendingUp className="h-3 w-3 mr-2" />
                    {PROTOCOLS[assessment.protocol as keyof typeof PROTOCOLS]}
                  </Badge>
                  {getClassificationBadge(assessment.fat_percentage, assessment.gender)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Elegant bottom highlight */}
        <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-app-achievement-workout/40 via-app-btn-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
      </Card>
    </div>
  );
}
