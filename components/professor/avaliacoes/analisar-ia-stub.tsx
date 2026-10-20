import { Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Gancho de IA da Fase 6 (architecture.md — ganchos de IA). Stub claramente
 * marcado como "em breve": o botão fica DESABILITADO e não dispara nenhuma
 * chamada. Serve para sinalizar a funcionalidade futura sem acoplar nada agora.
 */
export function AnalisarIaStub() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* `span` embrulha o botão desabilitado para o tooltip abrir no hover/foco. */}
          <span className="inline-flex" tabIndex={0}>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled
              aria-disabled="true"
            >
              <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
              Analisar avaliação com IA
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                em breve
              </span>
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          Análise por IA chega em uma próxima atualização.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
