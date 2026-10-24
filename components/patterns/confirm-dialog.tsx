'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export interface ConfirmDialogProps {
  /** Estado controlado pelo chamador. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Título da confirmação. */
  title: React.ReactNode;
  /** Descrição opcional. */
  description?: React.ReactNode;
  /** Rótulo do botão de confirmação. */
  confirmLabel?: string;
  /** Rótulo do botão de cancelar. */
  cancelLabel?: string;
  /** Confirmação é destrutiva (botão vermelho). */
  destructive?: boolean;
  /** Carregamento controlado pelo chamador. */
  loading?: boolean;
  /**
   * Executado ao confirmar. O chamador controla loading e trata erro no catch;
   * em caso de rejeição, o diálogo NÃO fecha e o erro NÃO é relançado aqui.
   */
  onConfirm: () => void | Promise<void>;
}

/**
 * Diálogo de confirmação controlado. O chamador controla open/loading e fecha
 * só no sucesso (onOpenChange(false)); em erro mantém aberto e exibe o toast.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  async function handleConfirm() {
    try {
      await onConfirm();
    } catch {
      // Chamador trata o erro (toast) e mantém o diálogo aberto.
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (loading) return;
        onOpenChange(next);
      }}
    >
      <AlertDialogContent className="sm:rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? 'destructive' : 'default'}
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
