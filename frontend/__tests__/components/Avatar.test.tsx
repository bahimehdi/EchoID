import React from 'react';
import { render } from '@testing-library/react-native';
import Avatar from '../../components/Avatar';

describe('Avatar', () => {
  it('renders initials from name', () => {
    const { getByText } = render(<Avatar name="Mehdi Bahi" />);
    expect(getByText('MB')).toBeTruthy();
  });

  it('renders single initial', () => {
    const { getByText } = render(<Avatar name="Mehdi" />);
    expect(getByText('M')).toBeTruthy();
  });

  it('renders fallback for empty name', () => {
    const { getByText } = render(<Avatar />);
    expect(getByText('?')).toBeTruthy();
  });

  it('renders with custom size', () => {
    const { getByText } = render(<Avatar name="Test" size={48} />);
    expect(getByText('T')).toBeTruthy();
  });
});
