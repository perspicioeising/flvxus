import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Dumbbell, 
  Target, 
  Package, 
  AlertTriangle, 
  Lightbulb,
  Play,
  Volume2,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ExerciseDetailModalProps } from './types';

export function ExerciseDetailModal({ 
  exercise, 
  isOpen, 
  onClose 
}: ExerciseDetailModalProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    description: true,
    muscles: true,
    equipment: true,
    tips: false,
    errors: false,
    variations: false
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!exercise || !isOpen) return null;

  // Mobile Bottom Sheet
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={onClose}
        />
        
        {/* Bottom Sheet */}
        <div className="fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300 ease-out translate-y-0">
          <div className="bg-app-overlay backdrop-blur-xl rounded-t-3xl shadow-app-xl max-h-[90vh] flex flex-col">
            
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1.5 bg-app-text-muted rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between p-4 pb-2 border-b border-app-border-muted">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-12 h-12 bg-achievement-workout rounded-xl flex items-center justify-center shadow-app-medium flex-shrink-0">
                  <Dumbbell className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-app-text-heading truncate">
                    {exercise.name}
                  </h2>
                  <p className="text-sm text-app-text-muted">
                    Detalhes do exercício
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-10 w-10 rounded-xl hover:bg-app-bg-secondary"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <MobileContent 
                exercise={exercise} 
                expandedSections={expandedSections}
                toggleSection={toggleSection}
              />
            </div>

            {/* Footer Actions */}
            <div className="p-4 pt-2 border-t border-app-border-muted">
              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 h-12 border-2 border-app-border-accent hover:border-app-achievement-workout rounded-xl font-semibold"
                >
                  Fechar
                </Button>
                {exercise.video_url && (
                  <Button
                    onClick={() => window.open(exercise.video_url, '_blank')}
                    className="flex-1 h-12 bg-achievement-workout hover:bg-app-achievement-workout/90 text-white font-semibold rounded-xl shadow-app-medium"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Ver Vídeo
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop Modal - Usando um modal customizado sem Dialog do shadcn
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl max-h-[90vh] bg-app-overlay backdrop-blur-xl rounded-2xl shadow-app-xl border border-app-border-accent overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="p-6 pb-4 border-b border-app-border-muted bg-gradient-to-r from-app-card to-app-bg-secondary/30">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-achievement-workout rounded-xl flex items-center justify-center shadow-app-large">
                  <Dumbbell className="h-8 w-8 text-white" />
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-app-text-heading mb-2">
                    {exercise.name}
                  </h2>
                  {exercise.description && (
                    <p className="text-app-text-secondary leading-relaxed">
                      {exercise.description}
                    </p>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-10 w-10 rounded-xl hover:bg-app-bg-secondary"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <DesktopContent exercise={exercise} />
          </div>

          {/* Footer */}
          <div className="p-6 pt-4 border-t border-app-border-muted bg-gradient-to-r from-app-card to-app-bg-secondary/30">
            <div className="flex gap-3 justify-end">
              <Button
                onClick={onClose}
                variant="outline"
                className="min-w-[120px] border-2 border-app-border-accent hover:border-app-achievement-workout"
              >
                Fechar
              </Button>
              {exercise.video_url && (
                <Button
                  onClick={() => window.open(exercise.video_url, '_blank')}
                  className="min-w-[160px] bg-achievement-workout hover:bg-app-achievement-workout/90 shadow-app-medium"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Ver Vídeo Completo
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Mobile Content Component
function MobileContent({ 
  exercise, 
  expandedSections, 
  toggleSection 
}: {
  exercise: any;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
}) {
  return (
    <div className="space-y-4">

      {exercise.audio_url && (
        <div className="p-4 bg-gradient-to-r from-app-card to-app-bg-secondary/10 rounded-xl border border-app-border-muted">
          <h3 className="font-semibold text-app-text-heading mb-3 flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-app-achievement-workout" />
            Áudio Explicativo
          </h3>
          <audio
            src={exercise.audio_url}
            controls
            className="w-full"
          />
        </div>
      )}

      {exercise.video_url && (
        <div className="p-4 bg-gradient-to-r from-app-card to-app-bg-secondary/10 rounded-xl border border-app-border-muted">
          <h3 className="font-semibold text-app-text-heading mb-3 flex items-center gap-2">
            <Play className="h-4 w-4 text-app-achievement-workout" />
            Demonstração
          </h3>
          <div className="aspect-video bg-app-bg-secondary rounded-lg overflow-hidden">
            {exercise.video_url.includes('youtube') || exercise.video_url.includes('vimeo') ? (
              <iframe
                src={exercise.video_url}
                className="w-full h-full"
                allowFullScreen
                title={`Vídeo: ${exercise.name}`}
              />
            ) : (
              <video
                src={exercise.video_url}
                controls
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      )}
      {/* Description */}
      {exercise.description && (
        <CollapsibleSection
          title="Descrição"
          isExpanded={expandedSections.description}
          onToggle={() => toggleSection('description')}
          icon={<Dumbbell className="h-4 w-4" />}
          iconColor="text-app-achievement-workout"
        >
          <p className="text-app-text-secondary leading-relaxed">
            {exercise.description}
          </p>
        </CollapsibleSection>
      )}

      {/* Tips */}
      {exercise.tips && exercise.tips.length > 0 && (
        <CollapsibleSection
          title={`Dicas (${exercise.tips.length})`}
          isExpanded={expandedSections.tips}
          onToggle={() => toggleSection('tips')}
          icon={<Lightbulb className="h-4 w-4" />}
          iconColor="text-app-achievement-consecutive"
        >
          <div className="space-y-2">
            {exercise.tips.map((tip: string, index: number) => (
              <div key={index} className="flex gap-3 p-3 bg-app-achievement-consecutive/10 rounded-lg border border-app-border-accent">
                <span className="text-xs font-bold text-app-achievement-consecutive">{index + 1}</span>
                <p className="text-sm text-app-text-secondary">{tip}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Common Errors */}
      {exercise.common_errors && exercise.common_errors.length > 0 && (
        <CollapsibleSection
          title={`Erros Comuns (${exercise.common_errors.length})`}
          isExpanded={expandedSections.errors}
          onToggle={() => toggleSection('errors')}
          icon={<AlertTriangle className="h-4 w-4" />}
          iconColor="text-orange-600"
        >
          <div className="space-y-2">
            {exercise.common_errors.map((error: string, index: number) => (
              <div key={index} className="flex gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                <AlertTriangle className="h-3 w-3 text-orange-600 dark:text-orange-400 mt-1 flex-shrink-0" />
                <p className="text-sm text-app-text-secondary">{error}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}


      {/* Muscle Groups */}
      <CollapsibleSection
        title="Grupos Musculares"
        isExpanded={expandedSections.muscles}
        onToggle={() => toggleSection('muscles')}
        icon={<Target className="h-4 w-4" />}
        iconColor="text-app-achievement-workout"
      >
        <div className="flex flex-wrap gap-2">
          {exercise.muscle_group.map((muscle: string) => (
            <Badge
              key={muscle}
              className="bg-app-achievement-workout/10 text-app-achievement-workout border border-app-border-accent"
            >
              {muscle}
            </Badge>
          ))}
        </div>
      </CollapsibleSection>

      {/* Equipment */}
      {exercise.equipment && exercise.equipment.length > 0 && (
        <CollapsibleSection
          title="Equipamentos"
          isExpanded={expandedSections.equipment}
          onToggle={() => toggleSection('equipment')}
          icon={<Package className="h-4 w-4" />}
          iconColor="text-app-achievement-workout"
        >
          <div className="flex flex-wrap gap-2">
            {exercise.equipment.map((eq: string) => (
              <Badge
                key={eq}
                className="bg-app-bg-secondary text-app-text-secondary border border-app-border-muted"
              >
                {eq}
              </Badge>
            ))}
          </div>
        </CollapsibleSection>
      )}

      

      {/* Variations */}
      {exercise.variations && exercise.variations.length > 0 && (
        <CollapsibleSection
          title={`Variações (${exercise.variations.length})`}
          isExpanded={expandedSections.variations}
          onToggle={() => toggleSection('variations')}
          icon={<Target className="h-4 w-4" />}
          iconColor="text-app-achievement-exercise"
        >
          <div className="space-y-2">
            {exercise.variations.map((variation: string, index: number) => (
              <div key={index} className="flex gap-3 p-3 bg-app-achievement-exercise/10 rounded-lg border border-app-border-accent">
                <div className="w-6 h-6 bg-app-achievement-exercise rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">{index + 1}</span>
                </div>
                <p className="text-sm font-medium text-app-text-primary">{variation}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}

// Desktop Content Component
function DesktopContent({ exercise }: { exercise: any }) {
  return (
    <>
      {/* Video Section */}
      {exercise.video_url && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-app-text-heading flex items-center gap-2">
            <Play className="h-5 w-5 text-app-achievement-workout" />
            Demonstração
          </h3>
          <div className="aspect-video bg-app-bg-secondary rounded-xl overflow-hidden shadow-app-medium">
            {exercise.video_url.includes('youtube') || exercise.video_url.includes('vimeo') ? (
              <iframe
                src={exercise.video_url}
                className="w-full h-full"
                allowFullScreen
                title={`Vídeo: ${exercise.name}`}
              />
            ) : (
              <video
                src={exercise.video_url}
                controls
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      )}

      {/* Audio Section */}
      {exercise.audio_url && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-app-text-heading flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-app-achievement-workout" />
            Áudio Explicativo
          </h3>
          <audio src={exercise.audio_url} controls className="w-full" />
        </div>
      )}

      {/* Muscle Groups */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-app-text-heading flex items-center gap-2">
          <Target className="h-5 w-5 text-app-achievement-workout" />
          Grupos Musculares
        </h3>
        <div className="flex flex-wrap gap-2">
          {exercise.muscle_group.map((muscle: string) => (
            <Badge
              key={muscle}
              className="px-4 py-2 bg-app-achievement-workout/10 text-app-achievement-workout border border-app-border-accent text-base"
            >
              {muscle}
            </Badge>
          ))}
        </div>
      </div>

      {/* Equipment */}
      {exercise.equipment && exercise.equipment.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-app-text-heading flex items-center gap-2">
            <Package className="h-5 w-5 text-app-achievement-workout" />
            Equipamentos
          </h3>
          <div className="flex flex-wrap gap-2">
            {exercise.equipment.map((eq: string) => (
              <Badge key={eq} className="px-4 py-2 bg-app-bg-secondary text-app-text-secondary border border-app-border-muted text-base">
                {eq}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {exercise.tips && exercise.tips.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-app-text-heading flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-app-achievement-consecutive" />
            Dicas de Execução
          </h3>
          <div className="space-y-3">
            {exercise.tips.map((tip: string, index: number) => (
              <div key={index} className="flex gap-3 p-4 bg-app-achievement-consecutive/10 rounded-xl border border-app-border-accent">
                <div className="w-7 h-7 bg-app-achievement-consecutive rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-white">{index + 1}</span>
                </div>
                <p className="text-app-text-secondary">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Errors */}
      {exercise.common_errors && exercise.common_errors.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-app-text-heading flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Erros Comuns
          </h3>
          <div className="space-y-3">
            {exercise.common_errors.map((error: string, index: number) => (
              <div key={index} className="flex gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-700">
                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-1 flex-shrink-0" />
                <p className="text-app-text-secondary">{error}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Variations */}
      {exercise.variations && exercise.variations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-app-text-heading flex items-center gap-2">
            <Target className="h-5 w-5 text-app-achievement-exercise" />
            Variações
          </h3>
          <div className="space-y-2">
            {exercise.variations.map((variation: string, index: number) => (
              <div key={index} className="flex gap-3 p-3 bg-app-achievement-exercise/10 rounded-xl border border-app-border-accent">
                <div className="w-6 h-6 bg-app-achievement-exercise rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">{index + 1}</span>
                </div>
                <p className="font-medium text-app-text-primary">{variation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  iconColor: string;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  isExpanded,
  onToggle,
  icon,
  iconColor,
  children
}: CollapsibleSectionProps) {
  return (
    <div className="border border-app-border-muted rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-app-card to-app-bg-secondary/10 hover:from-app-bg-secondary/20 hover:to-app-bg-secondary/30 transition-all duration-300"
      >
        <div className="flex items-center gap-2">
          <span className={iconColor}>{icon}</span>
          <span className="font-semibold text-app-text-heading">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-app-text-muted" />
        ) : (
          <ChevronDown className="h-5 w-5 text-app-text-muted" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-4 bg-app-card">
          {children}
        </div>
      )}
    </div>
  );
}