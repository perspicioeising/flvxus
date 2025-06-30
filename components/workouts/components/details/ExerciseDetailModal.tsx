import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Activity, 
  Target, 
  Package, 
  AlertTriangle, 
  Lightbulb,
  Play,
  Volume2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Maximize2
} from 'lucide-react';
import { Exercise } from '../../types';

interface ExerciseDetailDrawerProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExerciseDetailDrawer({ 
  exercise, 
  isOpen, 
  onClose 
}: ExerciseDetailDrawerProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    description: true,
    muscles: true,
    equipment: true,
    tips: false,
    errors: false,
    variations: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!exercise || !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-[101] transition-transform duration-300 ease-out">
        <div className="bg-app-overlay backdrop-blur-xl rounded-t-3xl shadow-app-xl border-t border-app-border-accent max-h-[85vh] flex flex-col">
          
          {/* Handle */}
          <div className="flex justify-center py-3">
            <div className="w-12 h-1.5 bg-app-text-muted rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-2">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 bg-achievement-workout rounded-xl flex items-center justify-center shadow-app-medium flex-shrink-0">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
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
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            <div className="space-y-4">

              {/* Description */}
              {exercise.description && (
                <CollapsibleSection
                  title="Descrição"
                  isExpanded={expandedSections.description}
                  onToggle={() => toggleSection('description')}
                  icon={<Activity className="h-4 w-4 text-app-achievement-workout" />}
                >
                  <p className="text-app-text-secondary leading-relaxed">
                    {exercise.description}
                  </p>
                </CollapsibleSection>
              )}

              {/* Video - Priority */}
              {exercise.video_url && (
                <div className="p-4 bg-app-card rounded-xl border border-app-border-muted">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-app-text-primary flex items-center gap-2">
                      <Play className="h-4 w-4 text-app-achievement-workout" />
                      Demonstração
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(exercise.video_url, '_blank')}
                      className="border-app-border-accent text-app-achievement-workout"
                    >
                      <Maximize2 className="h-4 w-4 mr-1" />
                      Tela cheia
                    </Button>
                  </div>
                  
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
                        title={`Vídeo: ${exercise.name}`}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Audio */}
              {exercise.audio_url && (
                <div className="p-4 bg-app-card rounded-xl border border-app-border-muted">
                  <h3 className="font-semibold text-app-text-primary mb-3 flex items-center gap-2">
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

              {/* Muscle Groups */}
              <CollapsibleSection
                title="Grupos Musculares"
                isExpanded={expandedSections.muscles}
                onToggle={() => toggleSection('muscles')}
                icon={<Target className="h-4 w-4 text-app-achievement-workout" />}
              >
                <div className="flex flex-wrap gap-2">
                  {exercise.muscle_group.map((muscle) => (
                    <Badge
                      key={muscle}
                      className="px-3 py-1.5 bg-app-achievement-workout/10 text-app-achievement-workout border border-app-border-accent text-sm font-medium rounded-lg"
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
                  icon={<Package className="h-4 w-4 text-app-achievement-workout" />}
                >
                  <div className="flex flex-wrap gap-2">
                    {exercise.equipment.map((eq) => (
                      <Badge
                        key={eq}
                        className="px-3 py-1.5 bg-app-bg-secondary text-app-text-primary border border-app-border-muted text-sm font-medium rounded-lg"
                      >
                        {eq}
                      </Badge>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {/* Tips */}
              {exercise.tips && exercise.tips.length > 0 && (
                <CollapsibleSection
                  title={`Dicas de Execução (${exercise.tips.length})`}
                  isExpanded={expandedSections.tips}
                  onToggle={() => toggleSection('tips')}
                  icon={<Lightbulb className="h-4 w-4 text-app-achievement-consecutive" />}
                >
                  <div className="space-y-3">
                    {exercise.tips.map((tip, index) => (
                      <div
                        key={index}
                        className="flex gap-3 p-3 bg-app-achievement-consecutive/10 rounded-lg border border-app-border-accent"
                      >
                        <div className="w-6 h-6 bg-app-achievement-consecutive rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-white">{index + 1}</span>
                        </div>
                        <p className="text-sm text-app-text-secondary leading-relaxed">
                          {tip}
                        </p>
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
                  icon={<AlertTriangle className="h-4 w-4 text-orange-600" />}
                >
                  <div className="space-y-3">
                    {exercise.common_errors.map((error, index) => (
                      <div
                        key={index}
                        className="flex gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700"
                      >
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <AlertTriangle className="h-3 w-3 text-white" />
                        </div>
                        <p className="text-sm text-orange-800 dark:text-orange-200 leading-relaxed">
                          {error}
                        </p>
                      </div>
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
                  icon={<Target className="h-4 w-4 text-app-achievement-exercise" />}
                >
                  <div className="space-y-2">
                    {exercise.variations.map((variation, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-app-achievement-exercise/10 rounded-lg border border-app-border-accent"
                      >
                        <div className="w-6 h-6 bg-app-achievement-exercise rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-white">{index + 1}</span>
                        </div>
                        <p className="text-sm font-medium text-app-text-primary">
                          {variation}
                        </p>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 pt-2 border-t border-app-border-muted">
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 h-12 border-app-border-accent rounded-xl font-semibold"
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

// Componente auxiliar para seções recolhíveis
interface CollapsibleSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function CollapsibleSection({ 
  title, 
  isExpanded, 
  onToggle, 
  icon, 
  children 
}: CollapsibleSectionProps) {
  return (
    <div className="border border-app-border-muted rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-app-card hover:bg-app-bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-app-text-primary">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-app-text-muted" />
        ) : (
          <ChevronDown className="h-5 w-5 text-app-text-muted" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-4 pt-0 bg-app-card">
          {children}
        </div>
      )}
    </div>
  );
}