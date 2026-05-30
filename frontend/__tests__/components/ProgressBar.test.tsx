import React from 'react';
import { render } from '@testing-library/react-native';
import ProgressBar from '../../components/ProgressBar';

describe('ProgressBar', () => {
  it('renders label and percentage', () => {
    const { getByText } = render(<ProgressBar pct={75} label="TD 1" />);
    expect(getByText('TD 1')).toBeTruthy();
    expect(getByText('75%')).toBeTruthy();
  });

  it('clamps values below 0', () => {
    const { getByText } = render(<ProgressBar pct={-10} />);
    expect(getByText('0%')).toBeTruthy();
  });

  it('clamps values above 100', () => {
    const { getByText } = render(<ProgressBar pct={150} />);
    expect(getByText('100%')).toBeTruthy();
  });

  it('rounds percentage', () => {
    const { getByText } = render(<ProgressBar pct={75.7} />);
    expect(getByText('76%')).toBeTruthy();
  });
});
