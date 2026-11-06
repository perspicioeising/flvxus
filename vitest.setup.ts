import '@testing-library/jest-dom';

// jsdom não implementa `matchMedia`. A lib do mapa muscular
// (`@mjcdev/react-body-highlighter`) o usa para detectar tema; sem este stub os
// testes que montam o boneco quebrariam. Default: tema claro (matches=false).
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

// Billing: o gate de somente leitura (`requireEntitlement`) consulta o banco via
// RPC. Nos testes de unidade das actions, o padrão é "com direito"; testes que
// exercitam o gate sobrescrevem este mock (`vi.mock` no próprio arquivo) ou usam
// `vi.importActual('@/lib/billing/guard')`.
import { vi } from 'vitest';
vi.mock('@/lib/billing/guard', () => ({
  requireEntitlement: vi.fn().mockResolvedValue({ ok: true }),
  MSG_SEM_DIREITO: 'Seu plano atual não inclui este recurso. Revise sua assinatura para liberá-lo.',
}));
