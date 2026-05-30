import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Donut from '../../components/Donut';

describe('Donut', () => {
  it('renders percentage text', () => {
    render(<Donut pct={75} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('renders caption when provided', () => {
    render(<Donut pct={50} caption="similarité" />);
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('similarité')).toBeInTheDocument();
  });

  it('clamps pct to 0 when negative', () => {
    render(<Donut pct={-10} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('clamps pct to 100 when exceeding', () => {
    render(<Donut pct={150} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
