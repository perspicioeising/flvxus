// /components/physical-assessments/components/list/AssessmentHeader.tsx

import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Book } from "lucide-react";
import { AssessmentHeaderComponentProps } from "@/components/physical-assessments/types/physical-assessment";

export function AssessmentHeader({ 
  userRole, 
  stats, 
  onCreateNew 
}: AssessmentHeaderComponentProps) {
  return (
    <div className="relative mb-8">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-cyan-600/10 dark:from-blue-500/5 dark:via-purple-400/5 dark:to-cyan-500/5 rounded-3xl blur-2xl"></div>
      
      <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/60 dark:border-gray-800/60 rounded-3xl overflow-hidden shadow-xl">
        
        {/* Subtle decorative elements */}
        <div className="absolute inset-0 opacity-5">
          {/* Top right circle */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full transform translate-x-16 -translate-y-16"></div>
          
          {/* Bottom left smaller circle */}
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500 to-cyan-500 rounded-full transform -translate-x-8 translate-y-8"></div>
          
          {/* Subtle line accent */}
          <div className="absolute top-1/2 right-12 w-20 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent transform -translate-y-1/2"></div>
        </div>

        <div className="relative p-6 lg:p-8">
          <div className="flex items-center justify-between gap-6">
            
            {/* Left side - Icon and content */}
            <div className="flex items-center gap-5 min-w-0 flex-1">
              
              {/* Clean icon container */}
              <div className="relative shrink-0">
                <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Book className="h-8 w-8 sm:h-9 sm:w-9 text-white" />
                </div>
                
                {/* Small accent badge */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-2.5 w-2.5 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-1">
                  Avaliações Físicas
                </h1>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{stats.total}</span> avaliações registradas
                </p>
              </div>
            </div>

            {/* Right side - Action button */}
            {(userRole === 'trainer' || userRole === null) && (
              <Button
                onClick={onCreateNew}
                className="h-12 w-12 sm:h-14 sm:w-14 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shrink-0"
              >
                <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </Button>
            )}
          </div>
        </div>

        {/* Subtle bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
      </div>
    </div>
  );
}