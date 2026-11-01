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
