import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  X,
  Save,
  Trophy,
  Star,
  ArrowRight,
  SkipForward
} from 'lucide-react';
import { DIFFICULTY_LEVELS } from '../../constants';

interface ExerciseNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: string, difficulty: number) => void;
  exerciseName: string;
}

export function ExerciseNotesModal({ isOpen, onClose, onSave, exerciseName }: ExerciseNotesModalProps) {
  const [notes, setNotes] = useState('');
  const [difficultyRating, setDifficultyRating] = useState(0);

  const handleSave = () => {
    onSave(notes, difficultyRating);
    // Reset form
    setNotes('');
    setDifficultyRating(0);
  };

  const handleSkip = () => {
    onSave('', 0); // Save empty notes
    setNotes('');
    setDifficultyRating(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/90 to-slate-900/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/50 rounded-3xl w-full max-w-md shadow-app-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h3 className="text-xl font-bold text-app-heading">
            Exercício Concluído! 🎉
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-app-text-muted hover:text-app-text-primary hover:bg-app-bg-secondary rounded-xl transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-6">
          
          {/* Celebration */}
          <div className="text-center">
            <div className="w-16 h-16 bg-app-achievement-consecutive rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-app-large">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h4 className="font-bold text-app-heading mb-2">
              {exerciseName}
            </h4>
            <p className="text-sm text-app-text-secondary">
              Parabéns! Como foi este exercício?
            </p>
          </div>

          {/* Difficulty Rating */}
          <div>
            <label className="text-sm font-semibold text-app-heading mb-3 block text-center">
              Como foi a dificuldade?
            </label>
            <div className="flex gap-2 justify-center">
              {DIFFICULTY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setDifficultyRating(level.value)}
                  className={`w-14 h-14 rounded-xl border-2 transition-all duration-200 ${
                    difficultyRating === level.value 
                      ? 'bg-app-achievement-workout text-white border-app-achievement-workout scale-110' 
                      : 'border-app-border-muted hover:bg-app-bg-secondary hover:scale-105'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg">{level.emoji}</div>
                    <div className="text-xs font-bold">{level.value}</div>
                  </div>
                </button>
              ))}
            </div>
            {difficultyRating > 0 && (
              <p className="text-center text-xs text-app-text-secondary mt-2">
                {DIFFICULTY_LEVELS.find(d => d.value === difficultyRating)?.label}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-semibold text-app-heading mb-2 block">
              Observações pessoais (opcional):
            </label>
            <Textarea
              placeholder="Como foi este exercício? Dificuldades, melhorias, sensações..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[60px] max-h-[80px] bg-app-card border-app-border-muted focus:border-app-achievement-workout rounded-xl text-sm resize-none"
            />
          </div>

          {/* Achievement Stars */}
          <div className="text-center">
            <div className="flex justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className="h-5 w-5 text-yellow-400 fill-yellow-400" 
                />
              ))}
            </div>
            <p className="text-xs text-app-text-secondary">
              +5 XP por completar o exercício
            </p>
          </div>

          {/* Action Buttons - Mais destacados */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleSave}
              className="w-full bg-app-achievement-workout hover:bg-app-achievement-workout/90 text-white font-bold rounded-2xl py-4 text-lg shadow-app-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Save className="h-5 w-5 mr-3" />
              Salvar e Próximo Exercício
              <ArrowRight className="h-5 w-5 ml-3" />
            </Button>
            
            <Button
              variant="outline"
              onClick={handleSkip}
              className="w-full bg-app-card border-2 border-app-border-muted hover:bg-app-bg-secondary rounded-2xl font-semibold py-3 transition-all duration-300"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Pular e Continuar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}