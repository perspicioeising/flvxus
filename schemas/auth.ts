import { z } from 'zod';

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

/** Senha forte mínima: pelo menos 8 caracteres. */
const senha = z
  .string({ required_error: 'Informe a senha.' })
  .min(8, 'A senha deve ter pelo menos 8 caracteres.');

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
    businessName: z
      .string({ required_error: 'Informe o nome da empresa.' })
      .trim()
      .min(2, 'O nome da empresa deve ter pelo menos 2 caracteres.'),
    email: z
      .string({ required_error: 'Informe o e-mail.' })
      .trim()
      .min(1, 'Informe o e-mail.')
      .email('Por favor, insira um e-mail válido.'),
    password: senha,
    confirmPassword: z
      .string({ required_error: 'Confirme a senha.' })
      .min(1, 'Confirme a senha.'),
  })
  .refine((dados) => dados.password === dados.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
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

export type CadastroProfessorInput = z.infer<typeof cadastroProfessorSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
