import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle,
  X
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
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent rounded-2xl shadow-app-xl max-w-md w-full p-6">
        
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 text-app-text-muted hover:text-app-text-primary"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Content */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-lg font-bold text-app-heading">
              {title}
            </h3>
          </div>
          
          <p className="text-app-text-secondary leading-relaxed">
            {description}
          </p>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-app-card border-app-border-muted hover:bg-app-border-accent/20 rounded-xl font-semibold"
            >
              {cancelText}
            </Button>
            
            <Button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}