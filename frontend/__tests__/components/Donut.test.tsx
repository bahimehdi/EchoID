import React from 'react';
import { render } from '@testing-library/react-native';
import Donut from '../../components/Donut';

describe('Donut', () => {
  it('renders percentage text', () => {
    const { getByText } = render(<Donut pct={75} />);
    expect(getByText('75%')).toBeTruthy();
  });

  it('renders caption when provided', () => {
    const { getByText } = render(<Donut pct={50} caption="Travail" />);
    expect(getByText('50%')).toBeTruthy();
    expect(getByText('Travail')).toBeTruthy();
  });

  it('clamps pct to 0 when negative', () => {
    const { getByText } = render(<Donut pct={-10} />);
    expect(getByText('0%')).toBeTruthy();
  });

  it('clamps pct to 100 when exceeding', () => {
    const { getByText } = render(<Donut pct={150} />);
    expect(getByText('100%')).toBeTruthy();
  });

  it('renders with default size', () => {
    const { getByText } = render(<Donut pct={0} />);
    expect(getByText('0%')).toBeTruthy();
  });
});
