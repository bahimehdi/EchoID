import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import Card from '../../components/Card';

describe('Card', () => {
  it('renders children', () => {
    const { getByText } = render(<Card><Text>Hello</Text></Card>);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('renders with accent', () => {
    const { getByText } = render(<Card accent="primary"><Text>Accented</Text></Card>);
    expect(getByText('Accented')).toBeTruthy();
  });

  it('renders with custom padding', () => {
    const { getByText } = render(<Card padding={32}><Text>Padded</Text></Card>);
    expect(getByText('Padded')).toBeTruthy();
  });
});
