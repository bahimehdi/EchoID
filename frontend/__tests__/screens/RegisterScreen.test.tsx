import React from 'react';
import { render } from '@testing-library/react-native';
import Register from '../../app/(auth)/register';

jest.mock('../../lib/api', () => ({
  api: { post: jest.fn() },
}));

jest.mock('expo-router', () => ({
  Link: 'Text',
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSegments: () => [],
}));

describe('Register screen', () => {
  it('renders form fields', () => {
    const { getByPlaceholderText } = render(<Register />);
    expect(getByPlaceholderText('Nom complet')).toBeTruthy();
    expect(getByPlaceholderText('prenom.nom@uit.ac.ma')).toBeTruthy();
    expect(getByPlaceholderText('Mot de passe')).toBeTruthy();
    expect(getByPlaceholderText('École (ex. ENSAK)')).toBeTruthy();
  });

  it('renders submit button', () => {
    const { getByText } = render(<Register />);
    expect(getByText('Créer mon compte')).toBeTruthy();
  });

  it('renders link to login', () => {
    const { getByText } = render(<Register />);
    expect(getByText('Déjà un compte ? Se connecter')).toBeTruthy();
  });
});
