'use client';

import { Check } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  shortTitle: string;
  color: string;
}

interface StepNavigationProps {
  steps: Step[];
  activeStep: string;
  onStepChange: (stepId: string) => void;
  canAdvance: () => boolean;
}

export function StepNavigation({ steps, activeStep, onStepChange, canAdvance }: StepNavigationProps) {
  const currentIndex = steps.findIndex(s => s.id === activeStep);

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const canAccessStep = (stepIndex: number) => {
    return stepIndex <= currentIndex || (stepIndex === currentIndex + 1 && canAdvance());
  };

  return (
    <div className="mb-6 sm:mb-8">
      {/* Mobile Navigation */}
      <div className="block sm:hidden">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const canAccess = canAccessStep(index);
            
            return (
              <button
                key={step.id}
                onClick={() => canAccess && onStepChange(step.id)}
                disabled={!canAccess}
                className={`flex-1 relative ${!canAccess ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    status === 'completed' 
                      ? 'bg-achievement-exercise text-white shadow-app-medium' 
                      : status === 'active'
                      ? `${step.color} text-white shadow-app-medium scale-110`
                      : 'bg-app-border-muted text-app-text-muted'
                  }`}>
                    {status === 'completed' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs font-medium truncate w-full px-1 ${
                    status === 'active' ? 'text-app-text-primary' : 'text-app-text-secondary'
                  }`}>
                    {step.shortTitle}
                  </span>
                </div>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`absolute top-4 left-1/2 w-full h-0.5 transform -translate-y-1/2 translate-x-4 ${
                    index < currentIndex ? 'bg-achievement-exercise' : 'bg-app-border-muted'
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const canAccess = canAccessStep(index);
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => canAccess && onStepChange(step.id)}
                  disabled={!canAccess}
                  className={`flex items-center gap-4 group ${!canAccess ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'} transition-all duration-300`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    status === 'completed' 
                      ? 'bg-achievement-exercise text-white shadow-app-large' 
                      : status === 'active'
                      ? `${step.color} text-white shadow-app-large scale-110`
                      : 'bg-app-card border-2 border-app-border-muted text-app-text-muted group-hover:border-app-border-accent'
                  }`}>
                    {status === 'completed' ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <span className="text-lg font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className={`font-bold transition-colors duration-300 ${
                      status === 'active' ? 'text-app-text-primary' : 'text-app-text-secondary group-hover:text-app-text-primary'
                    }`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-app-text-secondary">{step.shortTitle}</p>
                  </div>
                </button>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-6">
                    <div className={`h-1 rounded-full transition-all duration-500 ${
                      index < currentIndex ? 'bg-achievement-exercise' : 'bg-app-border-muted'
                    }`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}