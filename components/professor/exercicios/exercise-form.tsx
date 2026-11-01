'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  criarExercicioSchema,
  editarExercicioSchema,
  EQUIPAMENTOS,
  GRUPOS_MUSCULARES,
  type CriarExercicioInput,
} from '@/schemas/exercicio';
import {
  criarUploadUrlMidiaExercicio,
  confirmarMidiaExercicio,
  type EstadoAcao,
} from '@/actions/exercicios';
import { createClient } from '@/lib/supabase/browser';
import {
  EXERCISE_MEDIA_BUCKET,
  limiteMidiaExercicio,
  prefixoMimePermitido,
  type ExerciseMediaKind,
} from '@/lib/storage/exercise-media';

/** Valores do formulário: listas ficam como arrays no cliente. */
export interface ExerciseFormValues {
  name: string;
  muscle_groups: string[];
  equipment: string[];
  instructions: string;
  tips: string[];
  common_errors: string[];
}

export interface ExerciseFormProps {
  modo: 'criar' | 'editar';
  onSubmitAction: (formData: FormData) => Promise<EstadoAcao>;
  valoresIniciais?: Partial<ExerciseFormValues>;
  redirecionarPara: string;
  rotuloEnvio?: string;
}

function valoresPadrao(iniciais?: Partial<ExerciseFormValues>): ExerciseFormValues {
  return {
    name: iniciais?.name ?? '',
    muscle_groups: iniciais?.muscle_groups ?? [],
    equipment: iniciais?.equipment ?? [],
    instructions: iniciais?.instructions ?? '',
    tips: iniciais?.tips ?? [],
    common_errors: iniciais?.common_errors ?? [],
  };
}

/**
 * Seletor de múltiplas opções (grupos/equipamentos) com sugestões em chips e
 * campo para adicionar valores livres. Acessível por teclado (chips são botões).
 */
function SeletorChips({
  id,
  valor,
  onChange,
  sugestoes,
  placeholderLivre,
}: {
  id: string;
  valor: string[];
  onChange: (lista: string[]) => void;
  sugestoes: readonly string[];
  placeholderLivre: string;
}) {
  const [novo, setNovo] = React.useState('');

  const alterna = (item: string) => {
    if (valor.includes(item)) onChange(valor.filter((v) => v !== item));
    else onChange([...valor, item]);
  };

  const adicionarLivre = () => {
    const limpo = novo.trim();
    if (limpo && !valor.includes(limpo)) {
      onChange([...valor, limpo]);
    }
    setNovo('');
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2" role="group" aria-labelledby={`${id}-label`}>
        {sugestoes.map((item) => {
          const ativo = valor.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => alterna(item)}
              aria-pressed={ativo}
              className="min-h-11 rounded-full border px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[ativo=true]:border-primary data-[ativo=true]:bg-primary data-[ativo=true]:text-primary-foreground"
              data-ativo={ativo}
            >
              {item}
            </button>
          );
        })}
      </div>

      {/* Itens livres já adicionados que não estão nas sugestões. */}
      {valor.filter((v) => !sugestoes.includes(v)).length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {valor
            .filter((v) => !sugestoes.includes(v))
            .map((item) => (
              <Badge key={item} variant="secondary" className="gap-1">
                {item}
                <button
                  type="button"
                  onClick={() => alterna(item)}
                  aria-label={`Remover ${item}`}
                  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </Badge>
            ))}
        </div>
      ) : null}

      <div className="flex gap-2">
        <Input
          id={id}
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              adicionarLivre();
            }
          }}
          placeholder={placeholderLivre}
        />
        <Button
          type="button"
          variant="outline"
          className="min-h-11 shrink-0"
          onClick={adicionarLivre}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Adicionar</span>
        </Button>
      </div>
    </div>
  );
}

/** Editor de lista de textos (dicas, erros comuns). */
function EditorLista({
  id,
  valor,
  onChange,
  placeholder,
}: {
  id: string;
  valor: string[];
  onChange: (lista: string[]) => void;
  placeholder: string;
}) {
  const [novo, setNovo] = React.useState('');

  const adicionar = () => {
    const limpo = novo.trim();
    if (limpo) onChange([...valor, limpo]);
    setNovo('');
  };

  const remover = (indice: number) => {
    onChange(valor.filter((_, i) => i !== indice));
  };

  return (
    <div className="space-y-2">
      {valor.length > 0 ? (
        <ul className="space-y-2">
          {valor.map((item, indice) => (
            <li
              key={`${item}-${indice}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
            >
              <span className="min-w-0 flex-1 break-words text-sm text-foreground">
                {item}
              </span>
              <button
                type="button"
                onClick={() => remover(indice)}
                aria-label={`Remover: ${item}`}
                className="shrink-0 rounded-full p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex gap-2">
        <Input
          id={id}
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              adicionar();
            }
          }}
          placeholder={placeholder}
        />
        <Button
          type="button"
          variant="outline"
          className="min-h-11 shrink-0"
          onClick={adicionar}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Adicionar</span>
        </Button>
      </div>
    </div>
  );
}

/** Formata um limite em bytes como "N MB" para mensagens em pt-BR. */
function limiteEmMB(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}

const CONFIG_MIDIA: Record<ExerciseMediaKind, { label: string; accept: string; inputId: string }> = {
  video: { label: 'Vídeo demonstrativo (opcional)', accept: 'video/*', inputId: 'criar-video' },
  thumbnail: { label: 'Imagem (thumbnail) (opcional)', accept: 'image/*', inputId: 'criar-thumbnail' },
};

/**
 * Valida tamanho/tipo de um arquivo escolhido para mídia (mesmas regras do
 * servidor e de `exercise-media-upload.tsx`). Retorna a mensagem de erro em
 * pt-BR ou `null` quando válido.
 */
function validarMidia(file: File, kind: ExerciseMediaKind): string | null {
  const limite = limiteMidiaExercicio(kind);
  if (file.size > limite) {
    const alvo = kind === 'video' ? 'O vídeo' : 'A imagem';
    return `${alvo} excede o limite de ${limiteEmMB(limite)}.`;
  }
  if (!file.type.startsWith(prefixoMimePermitido(kind))) {
    const esperado = kind === 'video' ? 'um vídeo' : 'uma imagem';
    return `Envie ${esperado} em um formato válido.`;
  }
  return null;
}

/**
 * Faz o upload DIRETO de um arquivo recém-escolhido ao bucket privado, reusando
 * o MESMO pipeline de `exercise-media-upload.tsx` (signed upload URL → upload
 * direto → confirmação). Lança em caso de falha, para o chamador avisar o
 * usuário sem bloquear o fluxo de criação.
 */
async function enviarMidiaCriacao(
  exerciseId: string,
  kind: ExerciseMediaKind,
  file: File
): Promise<void> {
  const assinada = await criarUploadUrlMidiaExercicio(exerciseId, kind, {
    name: file.name,
    size: file.size,
    type: file.type,
  });
  if (!assinada.ok || !assinada.url || !assinada.token || !assinada.path) {
    throw new Error(assinada.message ?? 'Falha ao preparar o envio da mídia.');
  }

  const supabase = createClient();
  const { error: erroUpload } = await supabase.storage
    .from(assinada.bucket ?? EXERCISE_MEDIA_BUCKET)
    .uploadToSignedUrl(assinada.path, assinada.token, file, {
      contentType: file.type,
    });
  if (erroUpload) {
    throw new Error(`Falha ao enviar o arquivo: ${erroUpload.message}`);
  }

  const confirmada = await confirmarMidiaExercicio(exerciseId, kind, assinada.path);
  if (!confirmada.ok) {
    throw new Error(confirmada.message ?? 'Falha ao salvar a mídia.');
  }
}

/** Campo de seleção de arquivo de mídia (não envia nada: só guarda o File). */
function SeletorMidia({
  kind,
  arquivo,
  onChange,
  disabled,
}: {
  kind: ExerciseMediaKind;
  arquivo: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}) {
  const { label, accept, inputId } = CONFIG_MIDIA[kind];
  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      {arquivo ? (
        <p className="text-xs text-muted-foreground">Selecionado: {arquivo.name}</p>
      ) : null}
    </div>
  );
}

/**
 * Formulário de exercício (criar/editar). Valida no cliente com o MESMO schema
 * Zod da Server Action. As listas (arrays) são serializadas em JSON no FormData,
 * exatamente como o schema espera. Mobile-first e acessível.
 */
export function ExerciseForm({
  modo,
  onSubmitAction,
  valoresIniciais,
  redirecionarPara,
  rotuloEnvio,
}: ExerciseFormProps) {
  const router = useRouter();
  const [enviando, setEnviando] = React.useState(false);
  // Mídia escolhida no modo criar (enviada via signed URL após o exercício
  // existir). No modo editar a mídia é gerida pelo bloco inline da página.
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = React.useState<File | null>(null);
  const schema = modo === 'criar' ? criarExercicioSchema : editarExercicioSchema;

  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: valoresPadrao(valoresIniciais),
  });

  async function onSubmit(values: ExerciseFormValues) {
    // Valida a mídia escolhida (modo criar) ANTES de criar o exercício, para
    // não deixar um registro sem a mídia por um arquivo inválido.
    if (modo === 'criar') {
      for (const [file, kind] of [
        [videoFile, 'video'],
        [thumbnailFile, 'thumbnail'],
      ] as const) {
        if (!file) continue;
        const erro = validarMidia(file, kind);
        if (erro) {
          toast({ title: erro, variant: 'destructive' });
          return;
        }
      }
    }

    setEnviando(true);
    try {
      const fd = new FormData();
      fd.append('name', values.name);
      fd.append('muscle_groups', JSON.stringify(values.muscle_groups));
      fd.append('equipment', JSON.stringify(values.equipment));
      fd.append('tips', JSON.stringify(values.tips));
      fd.append('common_errors', JSON.stringify(values.common_errors));
      // `instructions` é opcional: o schema transforma '' em `undefined`, então
      // o valor pode chegar ausente aqui — usamos optional chaining para não
      // quebrar o submit quando o campo fica vazio.
      const instrucoes = values.instructions?.trim();
      if (instrucoes) {
        fd.append('instructions', instrucoes);
      }

      const resultado = await onSubmitAction(fd);

      if (resultado.ok) {
        // Create-then-upload: com o id recém-criado, sobe a mídia escolhida pelo
        // MESMO pipeline de signed URL. Uma falha de mídia NÃO desfaz o
        // exercício — avisamos e seguimos para o detalhe, onde dá para reenviar.
        if (modo === 'criar' && resultado.id && (videoFile || thumbnailFile)) {
          const pendentes: Array<[File, ExerciseMediaKind]> = [];
          if (videoFile) pendentes.push([videoFile, 'video']);
          if (thumbnailFile) pendentes.push([thumbnailFile, 'thumbnail']);

          let falhouAlguma = false;
          for (const [file, kind] of pendentes) {
            try {
              await enviarMidiaCriacao(resultado.id, kind, file);
            } catch {
              falhouAlguma = true;
            }
          }

          if (falhouAlguma) {
            toast({
              title:
                'Exercício criado, mas o envio de alguma mídia falhou. Reenvie na tela do exercício.',
              variant: 'destructive',
            });
          } else {
            toast({ title: resultado.message ?? 'Salvo com sucesso.' });
          }
        } else {
          toast({ title: resultado.message ?? 'Salvo com sucesso.' });
        }

        router.push(redirecionarPara);
        router.refresh();
        return;
      }

      if (resultado.fieldErrors) {
        for (const [campo, mensagem] of Object.entries(resultado.fieldErrors)) {
          form.setError(campo as keyof ExerciseFormValues, { message: mensagem });
        }
      }
      toast({
        title: resultado.message ?? 'Não foi possível salvar.',
        variant: 'destructive',
      });
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do exercício</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Controller
          control={form.control}
          name="muscle_groups"
          render={({ field, fieldState }) => (
            <div className="space-y-2">
              <Label id="muscle_groups-label" htmlFor="muscle_groups-livre">
                Grupos musculares
              </Label>
              <SeletorChips
                id="muscle_groups-livre"
                valor={field.value}
                onChange={field.onChange}
                sugestoes={GRUPOS_MUSCULARES}
                placeholderLivre="Outro grupo e Enter"
              />
              {fieldState.error ? (
                <p className="text-sm font-medium text-destructive">
                  {fieldState.error.message}
                </p>
              ) : null}
            </div>
          )}
        />

        <Controller
          control={form.control}
          name="equipment"
          render={({ field }) => (
            <div className="space-y-2">
              <Label id="equipment-label" htmlFor="equipment-livre">
                Equipamentos (opcional)
              </Label>
              <SeletorChips
                id="equipment-livre"
                valor={field.value}
                onChange={field.onChange}
                sugestoes={EQUIPAMENTOS}
                placeholderLivre="Outro equipamento e Enter"
              />
            </div>
          )}
        />

        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instruções (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={4}
                  placeholder="Como executar o movimento corretamente."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Controller
          control={form.control}
          name="tips"
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="tips-novo">Dicas (opcional)</Label>
              <EditorLista
                id="tips-novo"
                valor={field.value}
                onChange={field.onChange}
                placeholder="Adicione uma dica e Enter"
              />
            </div>
          )}
        />

        <Controller
          control={form.control}
          name="common_errors"
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="common_errors-novo">Erros comuns (opcional)</Label>
              <EditorLista
                id="common_errors-novo"
                valor={field.value}
                onChange={field.onChange}
                placeholder="Adicione um erro comum e Enter"
              />
            </div>
          )}
        />

        {modo === 'criar' ? (
          <div className="space-y-4 rounded-xl border border-border p-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-foreground">Mídia demonstrativa</h2>
              <p className="text-sm text-muted-foreground">
                Escolha vídeo e/ou imagem agora: eles serão enviados junto com a criação. Você
                também pode adicionar ou trocar depois na tela do exercício.
              </p>
            </div>
            <SeletorMidia
              kind="video"
              arquivo={videoFile}
              onChange={setVideoFile}
              disabled={enviando}
            />
            <SeletorMidia
              kind="thumbnail"
              arquivo={thumbnailFile}
              onChange={setThumbnailFile}
              disabled={enviando}
            />
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => router.push(redirecionarPara)}
            disabled={enviando}
          >
            Cancelar
          </Button>
          <Button type="submit" className="min-h-11" disabled={enviando}>
            {enviando
              ? 'Salvando…'
              : rotuloEnvio ?? (modo === 'criar' ? 'Criar exercício' : 'Salvar alterações')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
