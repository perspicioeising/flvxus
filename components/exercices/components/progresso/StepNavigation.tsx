// components/exercises/StepNavigation.tsx
import { FileText, Video, Target, CheckCircle, Star, CheckCircle2 } from "lucide-react";

interface StepNavigationProps {
  steps: Array<{
    id: string;
    title: string;
    shortTitle: string;
    description: string;
    icon: string;
    color: string;
  }>;
  activeStep: string;
  onStepChange: (step: string) => void;
  canAdvance: () => boolean;
}

const STEP_ICONS = {
  FileText,
  Video,
  Target,
  CheckCircle
};

export const StepNavigation = ({ steps, activeStep, onStepChange, canAdvance }: StepNavigationProps) => {
  const currentStepIndex = steps.findIndex(step => step.id === activeStep);
  
  return (
    <div className="mb-6 sm:mb-8">
      {/* Mobile Version */}
      <div className="block sm:hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/10 via-app-btn-primary/10 to-app-text-accent/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-2xl p-4 shadow-app-xl">
            
            {/* Current Step Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`p-3 achievement-exercise rounded-xl shadow-app-large`}>
                  {(() => {
                    const StepIcon = STEP_ICONS[steps[currentStepIndex]?.icon as keyof typeof STEP_ICONS] || FileText;
                    return <StepIcon className="h-5 w-5 text-white" />;
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-app-text-primary text-base truncate">
                    {steps[currentStepIndex]?.title}
                  </h3>
                  <p className="text-sm text-app-text-secondary truncate">
                    {steps[currentStepIndex]?.description}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-xs font-semibold text-app-text-muted uppercase tracking-wider">
                  Etapa
                </p>
                <p className="text-lg font-black text-app-text-accent">
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
                  className={`h-full achievement-exercise rounded-full transition-all duration-700 ease-out`}
                  style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Mini Steps Indicator */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {steps.map((step, index) => {
                const isActive = activeStep === step.id;
                const isCompleted = index < currentStepIndex;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => onStepChange(step.id)}
                    disabled={!isCompleted && !isActive && !(index === currentStepIndex + 1 && canAdvance())}
                    className={`w-8 h-8 rounded-full transition-all duration-300 transform ${
                      isActive
                        ? `bg-gradient-to-br ${step.color} text-white shadow-app-medium scale-110`
                        : isCompleted
                        ? 'bg-achievement-consecutive text-white shadow-app-medium'
                        : 'bg-app-bg-secondary border-2 border-app-border-muted text-app-text-muted hover:border-app-border-accent'
                    } ${
                      (!isCompleted && !isActive && !(index === currentStepIndex + 1 && canAdvance()))
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:scale-105 cursor-pointer'
                    }`}
                  >
                    {isCompleted && !isActive ? (
                      <CheckCircle2 className="h-4 w-4 mx-auto" />
                    ) : isActive ? (
                      <Star className="h-4 w-4 mx-auto" />
                    ) : (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Version */}
      <div className="hidden sm:block">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/10 via-app-btn-primary/10 to-app-text-accent/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-2xl p-4 lg:p-6 shadow-app-xl">
            
            {/* Progress Header */}
            <div className="text-center mb-4 lg:mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <h2 className="text-lg lg:text-xl font-bold text-app-text-primary">
                  Criar Novo Exercício
                </h2>
                <div className="px-3 py-1 bg-app-text-accent/10 border border-app-border-accent rounded-full">
                  <span className="text-sm font-semibold text-app-text-accent">
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
                const StepIcon = STEP_ICONS[step.icon as keyof typeof STEP_ICONS] || FileText;
                const isActive = activeStep === step.id;
                const isCompleted = index < currentStepIndex;
                const isClickable = isCompleted || isActive || (index === currentStepIndex + 1 && canAdvance());

                return (
                  <div key={step.id} className="relative">
                    {/* Connection Line */}
                    {index < steps.length - 1 && (
                      <div className="absolute top-6 lg:top-8 left-full w-full h-0.5 -translate-x-1/2 z-0">
                        <div className={`h-full rounded-full transition-all duration-700 ${
                          isCompleted ? 'achievement-consecutive' : 'bg-app-border-muted'
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
                          ? `achievement-exercise text-white shadow-app-xl scale-105`
                          : isCompleted
                          ? 'achievement-consecutive text-white shadow-app-large'
                          : 'bg-app-card border-2 border-app-border-muted hover:border-app-border-accent shadow-app-medium'
                      }`}
                    >
                      {/* Icon */}
                      <div className="flex justify-center mb-2 lg:mb-3">
                        <div className={`relative p-2 lg:p-3 rounded-lg lg:rounded-xl ${
                          isActive || isCompleted 
                            ? 'bg-white/20' 
                            : `achievement-exercise`
                        }`}>
                          {isCompleted && !isActive ? (
                            <CheckCircle2 className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                          ) : (
                            <StepIcon className={`h-5 w-5 lg:h-6 lg:w-6 ${
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
                  className="h-full achievement-exercise rounded-full transition-all duration-1000 ease-out"
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