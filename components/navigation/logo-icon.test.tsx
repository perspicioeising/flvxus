import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';

import { LogoIcon } from './logo-icon';

afterEach(cleanup);

describe('LogoIcon', () => {
  it('não aplica glow por padrão', () => {
    const { container } = render(<LogoIcon />);
    const box = container.firstElementChild as HTMLElement;
    expect(box.className).not.toContain('shadow-app-glow');
  });

  it('aplica glow quando a prop é true', () => {
    const { container } = render(<LogoIcon glow />);
    const box = container.firstElementChild as HTMLElement;
    expect(box.className).toContain('shadow-app-glow');
  });
});
