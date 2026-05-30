import React from 'react';
import { render } from '@testing-library/react-native';
import TabIcon from '../../components/TabIcon';

describe('TabIcon', () => {
  it('renders glyph for home', () => {
    const { getByText } = render(<TabIcon name="home" focused={false} />);
    expect(getByText('⌂')).toBeTruthy();
  });

  it('renders glyph for courses', () => {
    const { getByText } = render(<TabIcon name="courses" focused={false} />);
    expect(getByText('☱')).toBeTruthy();
  });

  it('renders glyph for profile', () => {
    const { getByText } = render(<TabIcon name="profile" focused={false} />);
    expect(getByText('◉')).toBeTruthy();
  });

  it('renders with focused color', () => {
    const { getByText } = render(<TabIcon name="home" focused={true} />);
    const glyph = getByText('⌂');
    expect(glyph.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: '#1E3A8A' })])
    );
  });
});
