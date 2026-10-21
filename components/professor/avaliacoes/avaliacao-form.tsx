'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ANAMNESE_TEXTO_PADRAO,
  CIRCUNFERENCIAS,
  criarAvaliacaoSchema,
  DOBRAS_POR_PROTOCOLO,
  PROTOCOLOS,
  type DobraKey,
} from '@/schemas/avaliacao';
import { OBJETIVO_LABEL } from '@/components/professor/alunos/labels';
import type { GoalType } from '@/types/database.types';
import type { EstadoAcao } from '@/actions/avaliacoes';
import {
  CAMPO_LABEL,
  CIRCUNFERENCIA_LABEL,
  DOBRA_LABEL,
  GENERO_LABEL,
  PROTOCOLO_LABEL,
} from './labels';

const OBJETIVOS: GoalType[] = [
  'weight_loss',
  'muscle_gain',
  'maintenance',
  'conditioning',
  'rehabilitation',
  'performance',
];

/** Opção de aluno para o select da etapa 1. */
export interface OpcaoAluno {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

/** Valores do formulário (todos string: inputs/selects guardam texto). */
export type AvaliacaoFormValues = Record<string, string> & {
  student_id: string;
  protocol: string;
  photos_consent: string; // 'true' | 'false'
};

export interface AvaliacaoFormProps {
  modo: 'criar' | 'editar';
  alunos: OpcaoAluno[];
  onSubmitAction: (formData: FormData) => Promise<EstadoAcao>;
  /** Upload opcional de fotos (só quando há consentimento). Recebe a avaliação já criada. */
  onUploadFoto?: (formData: FormData) => Promise<EstadoAcao>;
  valoresIniciais?: Partial<AvaliacaoFormValues>;
  /** Aluno fixo (ex.: criar avaliação a partir da ficha do aluno). */
  alunoFixo?: string;
  redirecionarPara: string;
}

const ETAPAS = ['Dados básicos', 'Protocolo', 'Medidas', 'Fotos'] as const;

function valoresPadrao(
  modo: 'criar' | 'editar',
  iniciais?: Partial<AvaliacaoFormValues>,
  alunoFixo?: string
): AvaliacaoFormValues {
  const base: Record<string, string> = {
    student_id: alunoFixo ?? iniciais?.student_id ?? '',
    assessed_at: iniciais?.assessed_at ?? '',
    age: iniciais?.age ?? '',
    gender: iniciais?.gender ?? '',
    protocol: iniciais?.protocol ?? '',
    weight_kg: iniciais?.weight_kg ?? '',
    height_cm: iniciais?.height_cm ?? '',
    body_fat_pct: iniciais?.body_fat_pct ?? '',
    inbody_score: iniciais?.inbody_score ?? '',
    goal: iniciais?.goal ?? '',
    // No modo criar a anamnese vem pré-preenchida com o roteiro padrão; no modo
    // editar carrega o valor salvo (sem sobrescrever o que o professor digitou).
    anamnesis: iniciais?.anamnesis ?? (modo === 'criar' ? ANAMNESE_TEXTO_PADRAO : ''),
    // LGPD adiado por decisão de escopo: fotos liberadas por padrão (sem gate de
    // consentimento). Reintroduzir a checkbox se o LGPD voltar.
    photos_consent: iniciais?.photos_consent ?? 'true',
  };
  for (const c of CIRCUNFERENCIAS) base[c] = iniciais?.[c] ?? '';
  for (const d of Object.keys(DOBRA_LABEL)) base[d] = iniciais?.[d] ?? '';
  return base as AvaliacaoFormValues;
}

export function AvaliacaoForm({
  modo,
  alunos,
  onSubmitAction,
  onUploadFoto,
  valoresIniciais,
  alunoFixo,
  redirecionarPara,
}: AvaliacaoFormProps) {
  const router = useRouter();
  const [etapa, setEtapa] = React.useState(0);
  const [enviando, setEnviando] = React.useState(false);
  const [arquivos, setArquivos] = React.useState<File[]>([]);

  const form = useForm<AvaliacaoFormValues>({
    resolver: zodResolver(criarAvaliacaoSchema) as never,
    defaultValues: valoresPadrao(modo, valoresIniciais, alunoFixo),
    mode: 'onBlur',
  });

  const protocolo = form.watch('protocol');
  const genero = form.watch('gender') as 'male' | 'female' | '';

  /** Dobras exigidas pelo protocolo/gênero selecionados (para a etapa 3). */
  const dobrasExigidas: DobraKey[] = React.useMemo(() => {
    if (!protocolo || protocolo === 'manual') return [];
    if (!genero) return [];
    return [...DOBRAS_POR_PROTOCOLO[protocolo as keyof typeof DOBRAS_POR_PROTOCOLO][genero]];
  }, [protocolo, genero]);

  async function onSubmit(values: AvaliacaoFormValues) {
    // Guarda: só permite submit na última etapa (Fotos). Barra qualquer
    // disparo fora dela (inclusive Enter).
    if (etapa !== ETAPAS.length - 1) return;
    setEnviando(true);
    try {
      const fd = new FormData();
      for (const [chave, valor] of Object.entries(values)) {
        if (chave === 'photos_consent') {
          fd.append('photos_consent', valor === 'true' ? 'true' : 'false');
        } else if (valor !== '' && valor != null) {
          fd.append(chave, valor);
        }
      }

      const resultado = await onSubmitAction(fd);

      if (!resultado.ok) {
        if (resultado.fieldErrors) {
          for (const [campo, mensagem] of Object.entries(resultado.fieldErrors)) {
            form.setError(campo as keyof AvaliacaoFormValues, { message: mensagem });
          }
          // Leva o professor de volta à etapa com o primeiro erro.
          irParaEtapaComErro(resultado.fieldErrors);
        }
        toast({
          title: resultado.message ?? 'Não foi possível salvar.',
          variant: 'destructive',
        });
        return;
      }

      // Upload de fotos (LGPD adiado: sem gate de consentimento).
      if (arquivos.length > 0 && onUploadFoto && resultado.id) {
        for (const arquivo of arquivos) {
          const fotoFd = new FormData();
          fotoFd.append('foto', arquivo);
          fotoFd.append('__assessmentId', resultado.id);
          const r = await onUploadFoto(fotoFd);
          if (!r.ok) {
            toast({ title: r.message ?? 'Falha ao enviar foto.', variant: 'destructive' });
          }
        }
      }

      toast({ title: resultado.message ?? 'Avaliação salva.' });
      router.push(redirecionarPara);
      router.refresh();
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setEnviando(false);
    }
  }

  /** Mapeia campos → etapa para navegar até o primeiro erro. */
  function irParaEtapaComErro(fieldErrors: Record<string, string>) {
    const campos = Object.keys(fieldErrors);
    const etapa1 = ['student_id', 'assessed_at', 'age', 'gender', 'weight_kg', 'height_cm', 'goal', 'anamnesis'];
    const etapa2 = ['protocol', 'body_fat_pct'];
    if (campos.some((c) => etapa1.includes(c))) setEtapa(0);
    else if (campos.some((c) => etapa2.includes(c))) setEtapa(1);
    else setEtapa(2);
  }

  async function avancar() {
    // Valida os campos da etapa atual antes de avançar.
    const camposEtapa = camposDaEtapa(etapa, dobrasExigidas, protocolo);
    const ok = await form.trigger(camposEtapa as never, { shouldFocus: true });
    if (ok) setEtapa((e) => Math.min(e + 1, ETAPAS.length - 1));
  }

  function voltar() {
    setEtapa((e) => Math.max(e - 1, 0));
  }

  const ehUltima = etapa === ETAPAS.length - 1;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          // Fora da etapa Fotos, Enter não deve submeter o formulário.
          // Preserva Enter dentro de <textarea> (quebra de linha).
          if (e.target instanceof HTMLTextAreaElement) return;
          if (e.key === 'Enter' && !ehUltima) e.preventDefault();
        }}
        className="space-y-6"
        noValidate
      >
        <ol className="flex flex-wrap gap-2" aria-label="Etapas da avaliação">
          {ETAPAS.map((rotulo, i) => (
            <li key={rotulo}>
              <span
                className={[
                  'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm',
                  i === etapa
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border text-muted-foreground',
                ].join(' ')}
                aria-current={i === etapa ? 'step' : undefined}
              >
                <span className="font-medium">{i + 1}.</span> {rotulo}
              </span>
            </li>
          ))}
        </ol>

        {/* Etapa 1 — Dados básicos */}
        <div hidden={etapa !== 0} className="space-y-5">
          {!alunoFixo ? (
            <FormField
              control={form.control}
              name="student_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aluno</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger disabled={modo === 'editar'}>
                        <SelectValue placeholder="Selecione o aluno" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {alunos.map((a) => (
                        <SelectItem key={a.user_id} value={a.user_id}>
                          {a.full_name ?? a.email ?? a.user_id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="assessed_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data da avaliação (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idade</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" inputMode="numeric" min={1} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gênero</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">{GENERO_LABEL.male}</SelectItem>
                      <SelectItem value="female">{GENERO_LABEL.female}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Necessário para os protocolos de dobras.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objetivo (opcional)</FormLabel>
                  <Select value={field.value || 'none'} onValueChange={(v) => field.onChange(v === 'none' ? '' : v)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Não informado</SelectItem>
                      {OBJETIVOS.map((o) => (
                        <SelectItem key={o} value={o}>
                          {OBJETIVO_LABEL[o]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="weight_kg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peso em kg</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" inputMode="decimal" step="0.1" min={1} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="height_cm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Altura em cm</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" inputMode="decimal" step="0.1" min={1} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="anamnesis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anamnese (opcional)</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={4} placeholder="Histórico, queixas, observações…" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Etapa 2 — Protocolo */}
        <div hidden={etapa !== 1} className="space-y-5">
          <FormField
            control={form.control}
            name="protocol"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Protocolo</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o protocolo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PROTOCOLOS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {PROTOCOLO_LABEL[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  O %gordura é calculado no servidor conforme o protocolo escolhido.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {protocolo === 'manual' ? (
            <FormField
              control={form.control}
              name="body_fat_pct"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>% de gordura (manual)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" inputMode="decimal" step="0.1" min={1} max={75} />
                  </FormControl>
                  <FormDescription>Informe diretamente o percentual de gordura.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
        </div>

        {/* Etapa 3 — Medidas (InBody + dobras + circunferências) */}
        <div hidden={etapa !== 2} className="space-y-6">
          <fieldset className="space-y-4">
            <legend className="text-sm font-medium text-foreground">
              Composição corporal (opcional)
            </legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="inbody_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{CAMPO_LABEL.inbody_score}</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" inputMode="decimal" step="0.1" min={0} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </fieldset>

          {dobrasExigidas.length > 0 ? (
            <fieldset className="space-y-4">
              <legend className="text-sm font-medium text-foreground">
                Dobras cutâneas exigidas (mm)
              </legend>
              <div className="grid gap-5 sm:grid-cols-2">
                {dobrasExigidas.map((dobra) => (
                  <FormField
                    key={dobra}
                    control={form.control}
                    name={dobra}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{DOBRA_LABEL[dobra]}</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" inputMode="decimal" step="0.1" min={0} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </fieldset>
          ) : protocolo && protocolo !== 'manual' ? (
            <p className="text-sm text-muted-foreground">
              Selecione o gênero na etapa 1 para exibir as dobras do protocolo.
            </p>
          ) : null}

          <fieldset className="space-y-4">
            <legend className="text-sm font-medium text-foreground">
              Circunferências (cm, opcionais)
            </legend>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {CIRCUNFERENCIAS.map((campo) => (
                <FormField
                  key={campo}
                  control={form.control}
                  name={campo}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{CIRCUNFERENCIA_LABEL[campo]}</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" inputMode="decimal" step="0.1" min={0} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </fieldset>
        </div>

        {/* Etapa 4 — Fotos (LGPD adiado: sem gate de consentimento) */}
        <div hidden={etapa !== 3} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fotos">Fotos da avaliação (opcional)</Label>
            <Input
              id="fotos"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setArquivos(Array.from(e.target.files ?? []))}
            />
            <p className="text-sm text-muted-foreground">
              As fotos ficam em bucket privado e só são exibidas por link temporário.
              {arquivos.length > 0 ? ` ${arquivos.length} arquivo(s) selecionado(s).` : ''}
            </p>
          </div>
        </div>

        {/* Navegação */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => (etapa === 0 ? router.push(redirecionarPara) : voltar())}
            disabled={enviando}
          >
            {etapa === 0 ? 'Cancelar' : 'Voltar'}
          </Button>

          {ehUltima ? (
            <Button key="salvar" type="submit" className="min-h-11" disabled={enviando}>
              {enviando ? 'Salvando…' : modo === 'criar' ? 'Salvar avaliação' : 'Salvar alterações'}
            </Button>
          ) : (
            <Button key="proxima" type="button" className="min-h-11" onClick={avancar} disabled={enviando}>
              Próxima
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

/** Campos (nomes RHF) que pertencem a cada etapa, para validação parcial. */
function camposDaEtapa(
  etapa: number,
  dobrasExigidas: DobraKey[],
  protocolo: string
): string[] {
  if (etapa === 0) {
    return ['student_id', 'assessed_at', 'age', 'gender', 'weight_kg', 'height_cm', 'goal', 'anamnesis'];
  }
  if (etapa === 1) {
    return protocolo === 'manual' ? ['protocol', 'body_fat_pct'] : ['protocol'];
  }
  if (etapa === 2) {
    return ['inbody_score', ...dobrasExigidas];
  }
  return [];
}
