import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import Login from '../../app/(auth)/login';

jest.mock('../../lib/api', () => ({
  api: { post: jest.fn() },
}));

jest.mock('../../lib/auth', () => ({
  useAuth: jest.fn((selector) =>
    selector?.({ setSession: jest.fn() }) ?? { setSession: jest.fn() }
  ),
}));

jest.mock('expo-router', () => ({
  Link: 'Text',
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSegments: () => [],
}));

const mockPost = jest.requireMock('../../lib/api').api.post;

describe('Login screen', () => {
  beforeEach(() => {
    mockPost.mockReset();
  });

  it('renders form fields', () => {
    const { getByPlaceholderText } = render(<Login />);
    expect(getByPlaceholderText('prenom.nom@uit.ac.ma')).toBeTruthy();
    expect(getByPlaceholderText('Ex: 240464')).toBeTruthy();
    expect(getByPlaceholderText('••••••••')).toBeTruthy();
  });

  it('renders submit button', () => {
    const { getByText } = render(<Login />);
    expect(getByText('Se connecter  →')).toBeTruthy();
  });

  it('shows loading indicator on submit', async () => {
    mockPost.mockImplementation(() => new Promise(() => {}));

    const { getByText, getByPlaceholderText, UNSAFE_getAllByType } = render(<Login />);
    fireEvent.changeText(getByPlaceholderText('prenom.nom@uit.ac.ma'), 'a@b.com');
    fireEvent.changeText(getByPlaceholderText('••••••••'), 'secret');
    fireEvent.press(getByText('Se connecter  →'));

    expect(UNSAFE_getAllByType(ActivityIndicator).length).toBeGreaterThan(0);
  });

  it('shows password visibility toggle', () => {
    const { getByText } = render(<Login />);
    expect(getByText('⊘')).toBeTruthy();
  });

  it('renders support link', () => {
    const { getByText } = render(<Login />);
    expect(getByText('Contacter le support IT')).toBeTruthy();
  });
});
