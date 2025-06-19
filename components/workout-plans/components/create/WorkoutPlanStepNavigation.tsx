// components/workout-plans/components/form/WorkoutPlanStepNavigation.tsx
import { CheckCircle2, Star, Calendar, Clock, Dumbbell, FileCheck } from "lucide-react";

interface WorkoutPlanStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  shortTitle: string;
}

interface WorkoutPlanStepNavigationProps {
  steps: WorkoutPlanStep[];
  activeStep: string;
  onStepChange: (stepId: string) => void;
  canAdvance: () => boolean;
}

const STEP_ICONS = {
  FileCheck,
  Clock,
  Dumbbell,
  CheckCircle2
} as const;

export const WorkoutPlanStepNavigation = ({ 
  steps, 
  activeStep, 
  onStepChange, 
  canAdvance 
}: WorkoutPlanStepNavigationProps) => {
  const currentStepIndex = steps.findIndex(step => step.id === activeStep);
  
  return (
    <div className="mb-6 sm:mb-8">
      {/* Mobile Version - Horizontal Scroll */}
      <div className="block sm:hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-amber-500/10 to-orange-600/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-orange-200/50 dark:border-orange-800/30 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 bg-gradient-to-br ${steps[currentStepIndex]?.color || 'from-orange-500 to-orange-600'} rounded-xl shadow-lg`}>
                  {(() => {
                    const StepIcon = STEP_ICONS[steps[currentStepIndex]?.icon as keyof typeof STEP_ICONS];
                    return StepIcon ? <StepIcon className="h-6 w-6 text-white" /> : null;
                  })()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                    {steps[currentStepIndex]?.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {steps[currentStepIndex]?.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Etapa
                </p>
                <p className="text-lg font-black text-orange-600 dark:text-orange-400">
                  {currentStepIndex + 1}/{steps.length}
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                <span>Progresso</span>
                <span>{Math.round(((currentStepIndex + 1) / steps.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${steps[currentStepIndex]?.color || 'from-orange-500 to-orange-600'} rounded-full transition-all duration-700 ease-out`}
                  style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Version - Optimized Grid */}
      <div className="hidden sm:block">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-amber-500/10 to-orange-600/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-orange-200/50 dark:border-orange-800/30 rounded-2xl p-4 lg:p-6 shadow-2xl">
            
            {/* Compact Progress Header */}
            <div className="text-center mb-4 lg:mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                  Criação do Plano
                </h2>
                <div className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                  <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                    {currentStepIndex + 1}/{steps.length}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(((currentStepIndex + 1) / steps.length) * 100)}% concluído
              </p>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-4 gap-2 lg:gap-4 mb-4 lg:mb-6">
              {steps.map((step, index) => {
                const StepIcon = STEP_ICONS[step.icon as keyof typeof STEP_ICONS];
                const isActive = activeStep === step.id;
                const isCompleted = index < currentStepIndex;
                const isClickable = isCompleted || isActive || (index === currentStepIndex + 1 && canAdvance());

                return (
                  <div key={step.id} className="relative">
                    {/* Connection Line */}
                    {index < steps.length - 1 && (
                      <div className="absolute top-6 lg:top-8 left-full w-full h-0.5 -translate-x-1/2 z-0">
                        <div className={`h-full rounded-full transition-all duration-700 ${
                          isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                        }`} />
                      </div>
                    )}

                    {/* Step Card */}
                    <button
                      onClick={() => isClickable && onStepChange(step.id)}
                      disabled={!isClickable}
                      className={`relative z-10 w-full p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all duration-300 transform ${
                        isClickable ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed opacity-75'
                      } ${
                        isActive
                          ? `bg-gradient-to-br ${step.color} text-white shadow-xl scale-105`
                          : isCompleted
                          ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg'
                          : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 shadow-md'
                      }`}
                    >
                      {/* Icon */}
                      <div className="flex justify-center mb-2 lg:mb-3">
                        <div className={`relative p-2 lg:p-3 rounded-lg lg:rounded-xl ${
                          isActive || isCompleted 
                            ? 'bg-white/20' 
                            : `bg-gradient-to-br ${step.color}`
                        }`}>
                          {isCompleted && !isActive ? (
                            <CheckCircle2 className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                          ) : (
                            StepIcon && <StepIcon className={`h-5 w-5 lg:h-6 lg:w-6 ${
                              isActive || isCompleted ? 'text-white' : 'text-white'
                            }`} />
                          )}
                          {isActive && (
                            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 lg:w-4 lg:h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                              <Star className="h-1.5 w-1.5 lg:h-2 lg:w-2 text-white" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="text-center">
                        <h3 className={`font-bold text-xs lg:text-sm mb-1 ${
                          isActive || isCompleted 
                            ? 'text-white' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {step.title}
                        </h3>
                        <p className={`text-xs leading-tight hidden lg:block ${
                          isActive || isCompleted 
                            ? 'text-white/80' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {step.description}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="flex justify-center mt-2 lg:mt-3">
                        {isCompleted && !isActive && (
                          <div className="px-2 py-0.5 bg-white/20 rounded-full">
                            <span className="text-xs font-semibold text-white">✓</span>
                          </div>
                        )}
                        {isActive && (
                          <div className="px-2 py-0.5 bg-white/20 rounded-full">
                            <span className="text-xs font-semibold text-white">•</span>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                <span>Progresso Geral</span>
                <span>{Math.round(((currentStepIndex + 1) / steps.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};