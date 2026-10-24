/**
 * Versões correntes dos documentos legais do Flvxus (fonte única de verdade).
 *
 * O formato é semver curto MAJOR.MINOR (ex.: '1.0', '2.3'), validado no Zod
 * (schemas/legal.ts). Quando uma versão sobe, o índice único de
 * `terms_acceptances` garante que o novo aceite não colide com o antigo — o
 * histórico (prova de qual versão foi aceita e quando) é preservado. É também o
 * ponto único que faz `faltaAceiteDaVersaoCorrente` passar a exigir re-aceite
 * (gancho de re-consentimento documentado em design.md §2.9, fora de escopo).
 */
export const TERMS_VERSION = '1.0';
export const PRIVACY_VERSION = '1.0';

/**
 * Data de vigência exibida nos documentos.
 * TODO(jurídico): confirmar a data real de vigência com o advogado.
 */
export const LEGAL_EFFECTIVE_DATE = '2026-10-21';
