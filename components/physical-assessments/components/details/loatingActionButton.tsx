// components/physical-assessments/components/details/FloatingActionButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Plus, X, Share2, Download, Trash2, Copy } from 'lucide-react';

interface FloatingActionButtonProps {
  userRole: string | null;
  onEdit: () => void;
  onShare: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

export function FloatingActionButton({
  userRole,
  onEdit,
  onShare,
  onDownload,
  onDelete
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (userRole !== 'trainer') {
    return null;
  }

  const actions = [
    {
      icon: Edit,
      label: 'Editar',
      action: onEdit,
      color: 'from-app-achievement-workout to-app-btn-primary',
      hoverColor: 'hover:from-app-achievement-workout hover:to-app-btn-primary'
    },
    {
      icon: Share2,
      label: 'Compartilhar',
      action: onShare,
      color: 'from-app-achievement-workout to-app-btn-secondary',
      hoverColor: 'hover:from-app-achievement-workout hover:to-app-btn-secondary'
    },
    {
      icon: Download,
      label: 'Relatório',
      action: onDownload,
      color: 'from-app-achievement-workout to-app-btn-accent',
      hoverColor: 'hover:from-app-achievement-workout hover:to-app-btn-accent'
    },
    {
      icon: Trash2,
      label: 'Deletar',
      action: onDelete,
      color: 'from-red-500 to-pink-500',
      hoverColor: 'hover:from-red-600 hover:to-pink-600'
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 sm:hidden">
      {/* Action Buttons */}
      <div className={`flex flex-col gap-3 mb-4 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div
              key={index}
              className={`flex items-center gap-3 transition-all duration-300 delay-${index * 50}`}
            >
              <div className="bg-app-overlay backdrop-blur-sm text-app-text-primary px-3 py-2 rounded-lg text-sm font-semibold shadow-app-large border border-app-border-accent">
                {action.label}
              </div>
              <Button
                onClick={() => {
                  action.action();
                  setIsOpen(false);
                }}
                className={`w-12 h-12 rounded-full bg-gradient-to-r ${action.color} ${action.hoverColor} text-white shadow-app-xl border-0 transition-all duration-300 transform hover:scale-110`}
              >
                <Icon className="h-5 w-5" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Main FAB */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-app-xl border-0 transition-all duration-300 transform hover:scale-110 ${
          isOpen 
            ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rotate-45' 
            : 'bg-gradient-to-r from-app-achievement-workout to-app-btn-primary hover:from-app-achievement-workout hover:to-app-btn-primary'
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Plus className="h-6 w-6 text-white" />
        )}
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}