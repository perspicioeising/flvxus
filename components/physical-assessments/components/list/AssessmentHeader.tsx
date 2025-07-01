
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Book } from "lucide-react";

interface AssessmentHeaderComponentProps { 
  userRole: string | null;
  stats: { total: number };
  onCreateNew: () => void;
}

export function AssessmentHeader({ 
  userRole, 
  stats, 
  onCreateNew 
}: AssessmentHeaderComponentProps) {
  return (
    <div className="relative mb-8">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-btn-primary/10 to-app-achievement-workout/10 rounded-3xl blur-2xl"></div>
      
      <div className="relative card-app backdrop-blur-xl border border-app-border-accent rounded-3xl overflow-hidden shadow-app-xl">
        
        {/* Subtle decorative elements */}
        <div className="absolute inset-0 opacity-5">
          {/* Top right circle */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-app-achievement-workout to-app-btn-primary rounded-full transform translate-x-16 -translate-y-16"></div>
          
          {/* Bottom left smaller circle */}
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-app-achievement-workout to-app-btn-secondary rounded-full transform -translate-x-8 translate-y-8"></div>
          
          {/* Subtle line accent */}
          <div className="absolute top-1/2 right-12 w-20 h-px bg-gradient-to-r from-transparent via-app-achievement-workout/40 to-transparent transform -translate-y-1/2"></div>
        </div>

        <div className="relative p-6 lg:p-8">
          <div className="flex items-center justify-between gap-6">
            
            {/* Left side - Icon and content */}
            <div className="flex items-center gap-5 min-w-0 flex-1">
              
              {/* Clean icon container */}
              <div className="relative shrink-0">
                <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-app-achievement-workout to-app-btn-primary rounded-2xl flex items-center justify-center shadow-app-large">
                  <Book className="h-8 w-8 sm:h-9 sm:w-9 text-white" />
                </div>
                
                {/* Small accent badge */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-2.5 w-2.5 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-app-heading mb-1">
                  Avaliações Físicas
                </h1>
                
                <p className="text-app-text-secondary text-sm sm:text-base">
                  <span className="font-semibold text-app-achievement-workout">{stats.total}</span> avaliações registradas
                </p>
              </div>
            </div>

            {/* Right side - Action button */}
            {(userRole === 'trainer' || userRole === null) && (
              <Button
                onClick={onCreateNew}
                className="h-12 w-12 sm:h-14 sm:w-14 bg-gradient-to-br from-app-achievement-workout to-app-btn-primary hover:shadow-app-achievement-workout/25 border-0 rounded-xl shadow-app-large hover:shadow-app-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shrink-0"
              >
                <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </Button>
            )}
          </div>
        </div>

        {/* Subtle bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-app-achievement-workout/30 to-transparent"></div>
      </div>
    </div>
  );
}
