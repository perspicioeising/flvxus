import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * Cliente `service_role` (SO servidor) — architecture.md §4.4.
 *
 * O `service_role` IGNORA o RLS, entao seu uso e a excecao, nao a regra. Para que
 * o reforco de tenant nunca seja esquecido, este modulo NAO expoe o client cru:
 * so e possivel obte-lo atraves de `createAdminClient(tenantId)`, cuja API fina
 * ja filtra (`.eq('tenant_id', tenantId)`) nas leituras e carimba o `tenant_id`
 * nas escritas.
 *
 * REGRA INEGOCIAVEL (§4.4): toda query com `service_role` filtra explicitamente
 * por `tenant_id` (e por `trainer_id`/`student_id` quando aplicavel). Cada uso e
 * auditavel e coberto por teste de RLS (§12).
 *
 * A `SUPABASE_SERVICE_ROLE_KEY` so pode existir no servidor. Guardas abaixo
 * impedem que este modulo seja avaliado no bundle do browser.
 */

// Qualquer tabela do schema public que possua a coluna `tenant_id`.
type TenantScopedTable = {
  [K in keyof Database['public']['Tables']]: 'tenant_id' extends keyof Database['public']['Tables'][K]['Row']
    ? K
    : never;
}[keyof Database['public']['Tables']];

/**
 * Builder estrutural minimo para as escritas genericas por nome de tabela.
 *
 * `client.from(table)` tipado com `Database` retorna uma UNIAO de builders (um por
 * tabela) cujas assinaturas de `insert/update/delete` nao unificam quando a tabela
 * so e conhecida em runtime. Como o `tenant_id` ja e carimbado/filtrado aqui e cada
 * uso e coberto por teste de RLS (§12), expomos uma superficie estrutural enxuta e
 * fazemos o cast via `unknown`, sem recorrer a `any`.
 */
type Filterable = {
  eq(column: string, value: string): Filterable;
};
interface GenericTable {
  insert(values: Record<string, unknown>[]): Filterable;
  update(values: Record<string, unknown>): Filterable;
  delete(): Filterable;
}

function asGenericTable(builder: unknown): GenericTable {
  return builder as GenericTable;
}

function assertServerOnly() {
  if (typeof window !== 'undefined') {
    throw new Error(
      'lib/supabase/admin.ts (service_role) nao pode ser usado no browser. Use apenas no servidor.'
    );
  }
}

/**
 * API fina de acesso com `service_role` escopada a um unico tenant.
 *
 * `tenantId` e obrigatorio: nao ha como obter o client cru sem informa-lo.
 */
export function createAdminClient(tenantId: string) {
  assertServerOnly();

  if (!tenantId) {
    throw new Error(
      'createAdminClient exige tenantId (§4.4): toda operacao service_role deve ser escopada a um tenant.'
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sao obrigatorios para o cliente service_role.'
    );
  }

  const client: SupabaseClient<Database> = createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return {
    /** Tenant ao qual este client esta escopado. */
    tenantId,

    /**
     * Leitura ja filtrada por `tenant_id`. Encadeie os demais filtros/`.single()`
     * normalmente a partir do retorno.
     */
    from(table: TenantScopedTable) {
      return client.from(table).select('*').eq('tenant_id', tenantId);
    },

    /**
     * Insercao que carimba `tenant_id` em cada linha automaticamente. O `tenant_id`
     * informado no payload e sobrescrito pelo tenant do contexto.
     */
    insert(table: TenantScopedTable, values: Record<string, unknown> | Record<string, unknown>[]) {
      const rows = Array.isArray(values) ? values : [values];
      const stamped = rows.map((row) => ({ ...row, tenant_id: tenantId }));
      return asGenericTable(client.from(table)).insert(stamped);
    },

    /**
     * Atualizacao sempre restrita ao tenant do contexto (`.eq('tenant_id', tenantId)`).
     */
    update(table: TenantScopedTable, values: Record<string, unknown>) {
      return asGenericTable(client.from(table)).update(values).eq('tenant_id', tenantId);
    },

    /**
     * Remocao sempre restrita ao tenant do contexto (`.eq('tenant_id', tenantId)`).
     */
    delete(table: TenantScopedTable) {
      return asGenericTable(client.from(table)).delete().eq('tenant_id', tenantId);
    },

    /**
     * Escotilha de fuga para operacoes que legitimamente precisam do client cru
     * (ex.: `auth.admin` ao convidar aluno, §5.1). Nomeada de forma deliberada para
     * ser auditavel: quem a chama assume a responsabilidade de reforcar o tenant.
     */
    get authAdmin() {
      return client.auth.admin;
    },
  };
}

export type AdminClient = ReturnType<typeof createAdminClient>;
