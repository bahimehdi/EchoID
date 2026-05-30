import React from 'react';
import { render } from '@testing-library/react-native';
import Badge from '../../components/Badge';

describe('Badge', () => {
  it('renders children text', () => {
    const { getByText } = render(<Badge>MOODLE</Badge>);
    expect(getByText('MOODLE')).toBeTruthy();
  });

  it('renders with default primary tone', () => {
    const { getByText } = render(<Badge>default</Badge>);
    expect(getByText('default')).toBeTruthy();
  });

  it('renders with green tone', () => {
    const { getByText } = render(<Badge tone="green">OK</Badge>);
    expect(getByText('OK')).toBeTruthy();
  });

  it('renders with red tone', () => {
    const { getByText } = render(<Badge tone="red">FAIL</Badge>);
    expect(getByText('FAIL')).toBeTruthy();
  });
});
