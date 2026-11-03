import { z } from 'zod';

/** Formato canônico do nome de usuário — mesma regex da constraint do banco. */
const HANDLE_REGEX = /^[a-z0-9_]{3,30}$/;

/**
 * Schemas Zod do fluxo de autenticação (architecture.md §5).
 *
 * O MESMO schema valida no cliente (UX via react-hook-form + zodResolver) e
 * serve de contrato para o `supabase.auth.signUp`. As mensagens são em pt-BR.
 *
 * Cadastro de PROFESSOR: `supabase.auth.signUp({ email, password, options: {
 * data: { full_name, business_name } } })`. O trigger `handle_new_user()`
 * (migration 20261020090100) cria tenant + profile(role='trainer') lendo
 * `full_name` de `raw_user_meta_data`. Nenhum service_role é usado aqui.
 */

/**
 * Regra ÚNICA de senha da aplicação: pelo menos 8 caracteres. É reutilizada no
 * cadastro de professor (`signUp`) e na definição de senha do aluno convidado
 * (`updateUser`), garantindo que ambos os fluxos exijam exatamente o mesmo
 * critério. NÃO duplicar/alterar esta regra em outro lugar.
 */
export const senhaSchema = z
  .string({ required_error: 'Informe a senha.' })
  .min(8, 'A senha deve ter pelo menos 8 caracteres.');

/** Alias interno para manter a legibilidade dos schemas abaixo. */
const senha = senhaSchema;

/**
 * Cadastro de professor. `name` vira `full_name` (o trigger usa para nomear o
 * tenant e o profile); `businessName` é preservado em metadados para uso futuro.
 * `confirmPassword` garante que o usuário digitou a mesma senha.
 */
export const cadastroProfessorSchema = z
  .object({
    name: z
      .string({ required_error: 'Informe o nome completo.' })
      .trim()
      .min(2, 'O nome deve ter pelo menos 2 caracteres.'),
    // Fase B1: tipo de conta. 'professional' = personal que gerencia alunos;
    // 'self_managed' = aluno autônomo (treina por conta própria). Default
    // 'professional' para manter o contrato existente de cadastros sem o campo.
    accountType: z.enum(['professional', 'self_managed']).default('professional'),
    // Opcional no schema: o nome da empresa só é EXIGIDO para 'professional'
    // (validado no superRefine abaixo). Para 'self_managed' o campo é dispensado.
    businessName: z
      .string()
      .trim()
      .optional(),
    // Nome de usuário social (coluna profiles.social_handle). Opcional no shape
    // base: só é EXIGIDO para 'self_managed' (validado no superRefine abaixo).
    // O transform normaliza (trim, remove '@' inicial, lower) ANTES do refine,
    // espelhando definirHandleSchema; para 'professional' o campo é dispensado.
    socialHandle: z
      .string()
      .trim()
      .transform((v) => v.replace(/^@/, '').toLowerCase())
      .refine((v) => v === '' || HANDLE_REGEX.test(v), {
        message: 'Use 3 a 30 caracteres: letras minúsculas, números ou _.',
      })
      .optional(),
    email: z
      .string({ required_error: 'Informe o e-mail.' })
      .trim()
      .min(1, 'Informe o e-mail.')
      .email('Por favor, insira um e-mail válido.'),
    password: senha,
    confirmPassword: z
      .string({ required_error: 'Confirme a senha.' })
      .min(1, 'Confirme a senha.'),
    // Aceite BLOQUEANTE dos Termos e da Política (LGPD). `z.literal(true)` tipa o
    // campo como `true`, deixando no contrato que só o valor marcado é válido.
    aceiteLegal: z.literal(true, {
      errorMap: () => ({
        message: 'É necessário aceitar os Termos e a Política de Privacidade.',
      }),
    }),
  })
  .refine((dados) => dados.password === dados.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })
  // 'professional' PRECISA informar o nome da empresa (mín. 2 caracteres);
  // 'self_managed' (aluno autônomo) não tem empresa, então o campo é dispensado.
  .superRefine((dados, ctx) => {
    if (dados.accountType !== 'professional') return;
    const nome = dados.businessName?.trim() ?? '';
    if (nome.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'O nome da empresa deve ter pelo menos 2 caracteres.',
        path: ['businessName'],
      });
    }
  })
  // 'self_managed' (aluno autônomo) PRECISA informar o nome de usuário; o
  // 'professional' não é atleta social, então o campo é dispensado. O valor já
  // chega normalizado (ver transform acima): aqui só exigimos presença/formato.
  .superRefine((dados, ctx) => {
    if (dados.accountType !== 'self_managed') return;
    const username = dados.socialHandle ?? '';
    if (!HANDLE_REGEX.test(username)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Use 3 a 30 caracteres: letras minúsculas, números ou _.',
        path: ['socialHandle'],
      });
    }
  });

/** Login por e-mail e senha. */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Informe o e-mail.' })
    .trim()
    .min(1, 'Informe o e-mail.')
    .email('Por favor, insira um e-mail válido.'),
  password: z
    .string({ required_error: 'Informe a senha.' })
    .min(1, 'Informe a senha.'),
});

/**
 * Definição de senha do aluno convidado (tela /set-password). Usa a MESMA regra
 * de senha do cadastro de professor (`senhaSchema`) e confirma a digitação.
 */
export const definirSenhaSchema = z
  .object({
    password: senhaSchema,
    confirmPassword: z
      .string({ required_error: 'Confirme a senha.' })
      .min(1, 'Confirme a senha.'),
  })
  .refine((dados) => dados.password === dados.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

export type CadastroProfessorInput = z.infer<typeof cadastroProfessorSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type DefinirSenhaInput = z.infer<typeof definirSenhaSchema>;
