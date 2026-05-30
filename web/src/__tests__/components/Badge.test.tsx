import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../../components/Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>ACTIF</Badge>);
    expect(screen.getByText('ACTIF')).toBeInTheDocument();
  });

  it('renders with primary tone by default', () => {
    const { container } = render(<Badge>Default</Badge>);
    expect(container.querySelector('span')).toBeInTheDocument();
  });

  it('renders with all tones', () => {
    const tones = ['primary', 'orange', 'red', 'green', 'gray', 'blue', 'purple'] as const;
    for (const tone of tones) {
      const { unmount } = render(<Badge tone={tone}>{tone}</Badge>);
      expect(screen.getByText(tone)).toBeInTheDocument();
      unmount();
    }
  });
});
