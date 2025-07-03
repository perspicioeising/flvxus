import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle,
  X,
  Save,
  Home
} from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop melhorado */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/90 to-slate-900/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/50 rounded-3xl shadow-app-xl max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 text-app-text-muted hover:text-app-text-primary hover:bg-app-bg-secondary rounded-xl transition-all duration-300"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Content */}
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl flex items-center justify-center border border-amber-200 dark:border-amber-800 shadow-app-medium">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-xl font-black text-app-heading mb-2">
                {title}
              </h3>
              <p className="text-app-text-secondary leading-relaxed font-medium">
                {description}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-app-card border-app-border-muted hover:bg-app-bg-secondary rounded-2xl font-bold py-3 transition-all duration-300 shadow-app-light"
            >
              <Home className="h-4 w-4 mr-2" />
              {cancelText}
            </Button>
            
            <Button
              onClick={onConfirm}
              className="flex-1 bg-app-achievement-workout hover:bg-app-achievement-workout/90 text-white font-bold rounded-2xl py-3 shadow-app-large hover:shadow-app-xl transition-all duration-300"
            >
              <Save className="h-4 w-4 mr-2" />
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}