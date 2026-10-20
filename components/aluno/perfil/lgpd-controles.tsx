'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Download, Loader2, LogOut, Trash2 } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { registrarConsentimento, solicitarDados } from '@/actions/perfil';
import { sair } from '@/actions/auth';
import type {
  ConsentType,
  DataRequestStatus,
  DataRequestType,
} from '@/types/database.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

/** Rótulos/descrições pt-BR de cada tipo de consentimento (enum `consent_type`). */
const CONSENTIMENTO_INFO: Record<ConsentType, { titulo: string; descricao: string }> = {
  data_processing: {
    titulo: 'Tratamento de dados',
    descricao: 'Autorizo o tratamento dos meus dados cadastrais para uso no aplicativo.',
  },
  health_data: {
    titulo: 'Dados de saúde',
    descricao: 'Autorizo o uso dos meus dados de saúde (avaliações físicas, medidas).',
  },
  ai_processing: {
    titulo: 'Processamento por IA',
    descricao: 'Autorizo o uso de IA para sugerir treinos e dietas a partir dos meus dados.',
  },
  terms: {
    titulo: 'Termos de uso',
    descricao: 'Li e aceito os termos de uso e a política de privacidade.',
  },
};

/** Rótulos pt-BR do status das solicitações (enum `data_request_status`). */
const STATUS_SOLICITACAO_LABEL: Record<DataRequestStatus, string> = {
  requested: 'Solicitado',
  processing: 'Em processamento',
  completed: 'Concluído',
  rejected: 'Recusado',
};

/** Rótulos pt-BR do tipo de solicitação (enum `data_request_type`). */
const TIPO_SOLICITACAO_LABEL: Record<DataRequestType, string> = {
  export: 'Exportação',
  delete: 'Exclusão',
};

/** Estado atual de um consentimento (último registro por tipo). */
export interface ConsentimentoAtual {
  consent_type: ConsentType;
  granted: boolean;
}

/** Solicitação de dados existente (para mostrar o histórico). */
export interface SolicitacaoResumo {
  id: string;
  request_type: DataRequestType;
  status: DataRequestStatus;
  /** Data da solicitação já formatada no RSC (pt-BR). */
  requestedAtLabel: string;
}

export interface LgpdControlesProps {
  /** Consentimentos vigentes (último por tipo); ausente = nunca registrado. */
  consentimentos: ConsentimentoAtual[];
  /** Solicitações recentes de export/exclusão do aluno. */
  solicitacoes: SolicitacaoResumo[];
}

/** Ordem de exibição dos tipos de consentimento. */
const ORDEM_CONSENTIMENTO: ConsentType[] = [
  'terms',
  'data_processing',
  'health_data',
  'ai_processing',
];

/**
 * Controles de LGPD do aluno (Client Component):
 *   - switches de consentimento por tipo → `registrarConsentimento`;
 *   - botões "Exportar meus dados" / "Excluir meus dados" com AlertDialog →
 *     `solicitarDados` (apenas abre a solicitação; o processamento é pendência);
 *   - lista o status das solicitações existentes;
 *   - botão "Sair" → `sair()` (logout).
 *
 * Mobile-first: alvos ≥ 44px, sem depender de hover.
 */
export function LgpdControles({ consentimentos, solicitacoes }: LgpdControlesProps) {
  const router = useRouter();
  const [pendente, startTransition] = React.useTransition();

  // Mapa tipo → concedido, para o estado inicial dos switches.
  const [estados, setEstados] = React.useState<Record<ConsentType, boolean>>(() => {
    const base: Record<ConsentType, boolean> = {
      data_processing: false,
      health_data: false,
      ai_processing: false,
      terms: false,
    };
    for (const c of consentimentos) {
      base[c.consent_type] = c.granted;
    }
    return base;
  });

  const [solicitando, setSolicitando] = React.useState<DataRequestType | null>(null);
  const [saindo, setSaindo] = React.useState(false);

  function alternarConsentimento(tipo: ConsentType, granted: boolean) {
    const anterior = estados[tipo];
    setEstados((atual) => ({ ...atual, [tipo]: granted }));

    startTransition(async () => {
      const r = await registrarConsentimento(tipo, granted);
      if (r.ok) {
        toast({ title: r.message ?? 'Consentimento atualizado.' });
        router.refresh();
      } else {
        // Reverte o switch se a gravação falhar.
        setEstados((atual) => ({ ...atual, [tipo]: anterior }));
        toast({
          title: r.message ?? 'Não foi possível atualizar o consentimento.',
          variant: 'destructive',
        });
      }
    });
  }

  async function confirmarSolicitacao(tipo: DataRequestType) {
    setSolicitando(tipo);
    const r = await solicitarDados(tipo);
    setSolicitando(null);

    if (r.ok) {
      toast({ title: r.message ?? 'Solicitação registrada.' });
      router.refresh();
    } else {
      toast({
        title: r.message ?? 'Não foi possível registrar a solicitação.',
        variant: 'destructive',
      });
    }
  }

  async function sairDaConta() {
    setSaindo(true);
    await sair();
  }

  return (
    <div className="space-y-6">
      {/* Consentimentos */}
      <Card>
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base">Consentimentos</CardTitle>
          <CardDescription>
            Você pode conceder ou revogar cada autorização a qualquer momento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          {ORDEM_CONSENTIMENTO.map((tipo, indice) => {
            const info = CONSENTIMENTO_INFO[tipo];
            const idSwitch = `consentimento-${tipo}`;
            return (
              <React.Fragment key={tipo}>
                {indice > 0 ? <Separator /> : null}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <label htmlFor={idSwitch} className="text-sm font-medium text-foreground">
                      {info.titulo}
                    </label>
                    <p className="text-sm text-muted-foreground">{info.descricao}</p>
                  </div>
                  <Switch
                    id={idSwitch}
                    checked={estados[tipo]}
                    disabled={pendente}
                    onCheckedChange={(valor) => alternarConsentimento(tipo, valor)}
                    aria-label={info.titulo}
                  />
                </div>
              </React.Fragment>
            );
          })}
        </CardContent>
      </Card>

      {/* Solicitações de dados (LGPD) */}
      <Card>
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base">Seus dados</CardTitle>
          <CardDescription>
            Solicite uma cópia ou a exclusão dos seus dados. O time trata cada pedido e atualiza o
            status aqui.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <SolicitacaoBotao
              tipo="export"
              icone={<Download className="h-5 w-5" aria-hidden="true" />}
              rotulo="Exportar meus dados"
              tituloDialog="Solicitar exportação dos dados?"
              descricaoDialog="Vamos registrar seu pedido de cópia dos dados. Você verá o status abaixo assim que o processamento concluir."
              carregando={solicitando === 'export'}
              onConfirmar={() => confirmarSolicitacao('export')}
            />
            <SolicitacaoBotao
              tipo="delete"
              variante="destructive"
              icone={<Trash2 className="h-5 w-5" aria-hidden="true" />}
              rotulo="Excluir meus dados"
              tituloDialog="Solicitar exclusão dos dados?"
              descricaoDialog="Vamos registrar seu pedido de exclusão. Esta ação é irreversível após o processamento; o status aparece abaixo."
              carregando={solicitando === 'delete'}
              onConfirmar={() => confirmarSolicitacao('delete')}
            />
          </div>

          {solicitacoes.length > 0 ? (
            <ul className="space-y-2">
              {solicitacoes.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm"
                >
                  <div>
                    <span className="font-medium text-foreground">
                      {TIPO_SOLICITACAO_LABEL[s.request_type]}
                    </span>
                    <span className="block text-muted-foreground">{s.requestedAtLabel}</span>
                  </div>
                  <Badge variant="secondary">{STATUS_SOLICITACAO_LABEL[s.status]}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma solicitação registrada.</p>
          )}
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        type="button"
        variant="outline"
        className="min-h-11 w-full"
        disabled={saindo}
        onClick={sairDaConta}
      >
        {saindo ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        ) : (
          <LogOut className="h-5 w-5" aria-hidden="true" />
        )}
        Sair da conta
      </Button>
    </div>
  );
}

/** Botão + AlertDialog de confirmação para uma solicitação de dados. */
function SolicitacaoBotao({
  icone,
  rotulo,
  tituloDialog,
  descricaoDialog,
  carregando,
  onConfirmar,
  variante = 'outline',
}: {
  tipo: DataRequestType;
  icone: React.ReactNode;
  rotulo: string;
  tituloDialog: string;
  descricaoDialog: string;
  carregando: boolean;
  onConfirmar: () => void;
  variante?: 'outline' | 'destructive';
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant={variante} className="min-h-11 w-full" disabled={carregando}>
          {carregando ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : icone}
          {rotulo}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{tituloDialog}</AlertDialogTitle>
          <AlertDialogDescription>{descricaoDialog}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="min-h-11">Voltar</AlertDialogCancel>
          <AlertDialogAction
            className="min-h-11"
            onClick={(e) => {
              e.preventDefault();
              onConfirmar();
            }}
          >
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
