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
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-achievement-consecutive/10 to-app-achievement-workout/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-2xl p-4 shadow-app-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-achievement-workout rounded-xl shadow-app-medium">
                  {(() => {
                    const StepIcon = STEP_ICONS[steps[currentStepIndex]?.icon as keyof typeof STEP_ICONS];
                    return StepIcon ? <StepIcon className="h-6 w-6 text-white" /> : null;
                  })()}
                </div>
                <div>
                  <h3 className="font-bold text-app-text-primary text-lg">
                    {steps[currentStepIndex]?.title}
                  </h3>
                  <p className="text-sm text-app-text-secondary">
                    {steps[currentStepIndex]?.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-app-text-muted uppercase tracking-wider">
                  Etapa
                </p>
                <p className="text-lg font-black text-app-achievement-workout">
                  {currentStepIndex + 1}/{steps.length}
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-app-text-secondary">
                <span>Progresso</span>
                <span>{Math.round(((currentStepIndex + 1) / steps.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-app-bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-achievement-workout rounded-full transition-all duration-700 ease-out"
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
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-achievement-consecutive/10 to-app-achievement-workout/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-2xl p-4 lg:p-6 shadow-app-xl">
            
            {/* Compact Progress Header */}
            <div className="text-center mb-4 lg:mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <h2 className="text-lg lg:text-xl font-bold text-app-text-primary">
                  Criação do Plano
                </h2>
                <div className="px-3 py-1 bg-app-achievement-workout/10 rounded-full">
                  <span className="text-sm font-semibold text-app-achievement-workout">
                    {currentStepIndex + 1}/{steps.length}
                  </span>
                </div>
              </div>
              <p className="text-sm text-app-text-secondary">
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
                          isCompleted ? 'bg-app-achievement-consecutive' : 'bg-app-bg-secondary'
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
                          ? 'bg-achievement-workout text-white shadow-app-xl scale-105'
                          : isCompleted
                          ? 'bg-app-achievement-consecutive text-white shadow-app-large'
                          : 'bg-app-card border-2 border-app-border-muted hover:border-app-border-accent shadow-app-medium'
                      }`}
                    >
                      {/* Icon */}
                      <div className="flex justify-center mb-2 lg:mb-3">
                        <div className={`relative p-2 lg:p-3 rounded-lg lg:rounded-xl ${
                          isActive || isCompleted 
                            ? 'bg-white/20' 
                            : 'bg-achievement-workout'
                        }`}>
                          {isCompleted && !isActive ? (
                            <CheckCircle2 className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                          ) : (
                            StepIcon && <StepIcon className={`h-5 w-5 lg:h-6 lg:w-6 ${
                              isActive || isCompleted ? 'text-white' : 'text-white'
                            }`} />
                          )}
                          {isActive && (
                            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 lg:w-4 lg:h-4 bg-app-achievement-consecutive rounded-full flex items-center justify-center">
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
                            : 'text-app-text-primary'
                        }`}>
                          {step.title}
                        </h3>
                        <p className={`text-xs leading-tight hidden lg:block ${
                          isActive || isCompleted 
                            ? 'text-white/80' 
                            : 'text-app-text-secondary'
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
              <div className="flex justify-between text-xs font-medium text-app-text-secondary">
                <span>Progresso Geral</span>
                <span>{Math.round(((currentStepIndex + 1) / steps.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-app-bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-achievement-workout rounded-full transition-all duration-1000 ease-out"
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