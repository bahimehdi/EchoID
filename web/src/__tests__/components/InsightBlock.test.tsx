import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InsightBlock from '../../components/InsightBlock';

const mockInsight = {
  headline: 'Adoption en hausse',
  body: 'Le volume augmente de 72 %.',
  action: 'Prevoir augmentation de quota.',
  confidence: 0.79,
};

describe('InsightBlock', () => {
  it('renders headline, body, action and confidence', () => {
    render(<InsightBlock insight={mockInsight} />);
    expect(screen.getByText('Adoption en hausse')).toBeInTheDocument();
    expect(screen.getByText('Le volume augmente de 72 %.')).toBeInTheDocument();
    expect(screen.getByText('Prevoir augmentation de quota.')).toBeInTheDocument();
    expect(screen.getByText(/Confiance 79/)).toBeInTheDocument();
  });

  it('renders with accent', () => {
    const { container } = render(<InsightBlock insight={mockInsight} accent="green" />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('renders confidence badge with correct percentage', () => {
    const highConfidence = { ...mockInsight, confidence: 0.88 };
    render(<InsightBlock insight={highConfidence} />);
    expect(screen.getByText(/Confiance 88/)).toBeInTheDocument();
  });
});
