'use client';

import Link from 'next/link';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

/**
 * Checkbox BLOQUEANTE de aceite dos documentos legais, reusado no cadastro do
 * professor (/register) e no primeiro acesso do aluno (/set-password).
 *
 * Os links abrem em nova aba (`target="_blank"` + `rel="noopener noreferrer"`)
 * para o usuário ler os documentos sem perder o formulário. O estado é
 * controlado pelo formulário pai.
 */
export function AceiteLegalCheckbox({
  checked,
  onCheckedChange,
  disabled,
  errorId,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Id do elemento de erro, para `aria-describedby`. */
  errorId?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Checkbox
        id="aceite-legal"
        checked={checked}
        onCheckedChange={(valor) => onCheckedChange(valor === true)}
        disabled={disabled}
        aria-describedby={errorId}
        className="mt-0.5"
      />
      <Label
        htmlFor="aceite-legal"
        className="text-sm font-normal leading-snug text-muted-foreground"
      >
        Li e concordo com os{' '}
        <Link
          href="/termos"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Termos de Uso
        </Link>{' '}
        e a{' '}
        <Link
          href="/privacidade"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Política de Privacidade
        </Link>
        .
      </Label>
    </div>
  );
}
