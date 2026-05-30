import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCard from '../../components/StatCard';

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Étudiants" value={47} />);
    expect(screen.getByText('Étudiants')).toBeInTheDocument();
    expect(screen.getByText('47')).toBeInTheDocument();
  });

  it('renders detail badge', () => {
    render(<StatCard label="Risque" value={5} detail="+3 cette semaine" accent="red" />);
    expect(screen.getByText('Risque')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('+3 cette semaine')).toBeInTheDocument();
  });

  it('does not render detail when not provided', () => {
    const { container } = render(<StatCard label="Simple" value={10} />);
    const elements = container.querySelectorAll('span');
    expect(elements.length).toBe(0); // Badge renders as span, no detail = no badge
  });

  it('renders with string value', () => {
    render(<StatCard label="Status" value="OK" />);
    expect(screen.getByText('OK')).toBeInTheDocument();
  });
});
