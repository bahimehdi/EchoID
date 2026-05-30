import React from 'react';
import { render } from '@testing-library/react-native';
import Header from '../../components/Header';

jest.mock('../../lib/auth', () => ({
  useAuth: jest.fn((selector) =>
    selector?.({ user: { fullName: 'Ahmed Benali' } }) ?? { user: { fullName: 'Ahmed Benali' } }
  ),
}));

describe('Header', () => {
  it('renders default title', () => {
    const { getByText } = render(<Header />);
    expect(getByText('Portail UIT')).toBeTruthy();
  });

  it('renders custom title', () => {
    const { getByText } = render(<Header title="Mon Profil" />);
    expect(getByText('Mon Profil')).toBeTruthy();
  });

  it('renders search button when onSearch provided', () => {
    const { getByText } = render(<Header onSearch={() => {}} />);
    expect(getByText('⌕')).toBeTruthy();
  });

  it('does not render search button when onSearch omitted', () => {
    const { queryByText } = render(<Header />);
    expect(queryByText('⌕')).toBeNull();
  });

  it('renders menu button', () => {
    const { getByText } = render(<Header />);
    expect(getByText('≡')).toBeTruthy();
  });
});
