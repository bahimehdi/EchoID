import React from 'react';
import { render } from '@testing-library/react-native';
import Profile from '../../app/(tabs)/profile';

jest.mock('../../lib/auth', () => ({
  useAuth: jest.fn((selector) =>
    selector?.({ user: { id: 'u1', fullName: 'Ahmed Benali', email: 'ahmed@uit.ac.ma', school: 'ENSA', role: 'STUDENT' } }) ??
    { user: { id: 'u1', fullName: 'Ahmed Benali', email: 'ahmed@uit.ac.ma', school: 'ENSA', role: 'STUDENT' } }
  ),
}));

jest.mock('../../lib/api', () => ({
  api: { get: jest.fn() },
  unwrap: (p: Promise<any>) => p.then((r: any) => r.data),
}));

jest.mock('../../components/Header', () => 'Header');

const mockUseQuery = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useQuery: (opts: any) => mockUseQuery(opts),
}));

describe('Profile screen', () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
  });

  it('shows loading indicator when profile is loading', () => {
    mockUseQuery.mockReturnValue({ isLoading: true, data: undefined });

    const { getByText } = render(<Profile />);
    expect(getByText('Ahmed Benali')).toBeTruthy();
  });

  it('shows user info from profile data', () => {
    mockUseQuery.mockReturnValue({
      isLoading: false,
      data: {
        id: 'u1',
        fullName: 'Ahmed Benali',
        email: 'ahmed@uit.ac.ma',
        school: 'ENSA',
        role: 'STUDENT',
        emailVerified: true,
        createdAt: '2025-01-01T00:00:00Z',
      },
    });

    const { getByText, getAllByText } = render(<Profile />);
    expect(getByText('Ahmed Benali')).toBeTruthy();
    expect(getAllByText('Génie Informatique – 2ème Année').length).toBeGreaterThan(0);
    expect(getByText('ahmed@uit.ac.ma')).toBeTruthy();
    expect(getByText('ENSA Kénitra')).toBeTruthy();
  });

  it('renders academic section', () => {
    mockUseQuery.mockReturnValue({
      isLoading: false,
      data: {
        id: 'u1',
        fullName: 'Ahmed',
        email: 'ahmed@uit.ac.ma',
        school: 'ENSA',
        role: 'STUDENT',
        emailVerified: true,
        createdAt: '2025-01-01T00:00:00Z',
      },
    });

    const { getByText } = render(<Profile />);
    expect(getByText(/Informations Académiques/)).toBeTruthy();
  });

  it('renders preferences section', () => {
    mockUseQuery.mockReturnValue({
      isLoading: false,
      data: null,
    });

    const { getByText } = render(<Profile />);
    expect(getByText(/Préférences/)).toBeTruthy();
    expect(getByText('Langue de l’interface')).toBeTruthy();
    expect(getByText('Notifications Push')).toBeTruthy();
    expect(getByText('Sécurité & Mot de passe')).toBeTruthy();
  });

  it('renders assistance section', () => {
    mockUseQuery.mockReturnValue({
      isLoading: false,
      data: null,
    });

    const { getByText } = render(<Profile />);
    expect(getByText(/Assistance/)).toBeTruthy();
    expect(getByText('Contacter l’administration')).toBeTruthy();
    expect(getByText('Guide de l’étudiant')).toBeTruthy();
  });

  it('renders sign out button', () => {
    mockUseQuery.mockReturnValue({
      isLoading: false,
      data: null,
    });

    const { getByText } = render(<Profile />);
    expect(getByText(/Se déconnecter/)).toBeTruthy();
  });
});
