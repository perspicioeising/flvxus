import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { StatusBadge, type StatusTone } from './status-badge';

afterEach(cleanup);

const CASES: Array<[StatusTone, string]> = [
  ['brand', 'bg-primary-soft'],
  ['success', 'bg-primary-soft'],
  ['warning', 'bg-warning'],
  ['danger', 'bg-destructive'],
  ['neutral', 'bg-muted'],
  ['info', 'bg-info'],
];

describe('StatusBadge', () => {
  it.each(CASES)('tone="%s" resolve a classe esperada', (tone, expected) => {
    render(<StatusBadge tone={tone}>Rótulo</StatusBadge>);
    const badge = screen.getByText('Rótulo');
    expect(badge.className).toContain(expected);
  });
});
