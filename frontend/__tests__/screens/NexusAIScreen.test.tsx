import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NexusAI from '../../app/(tabs)/nexusai';

jest.mock('../../lib/auth', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'user-1', fullName: 'Ahmed Benali', email: 'ahmed@ensa.uit.ac.ma', school: 'ENSA', role: 'STUDENT' },
  })),
}));

const mockUseQuery = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useQuery: (opts) => mockUseQuery(opts),
}));

jest.mock('../../lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
  unwrap: jest.fn((p) => p),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(() => Promise.resolve({ canceled: true })),
}));

describe('NexusAI screen', () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
    mockUseQuery.mockReturnValue({
      isLoading: false,
      data: [
        { id: 'c1', title: 'Algèbre linéaire', lmsSource: 'MOODLE', school: 'ENSA', semester: 'S1', isActive: true },
      ],
      refetch: jest.fn(),
    });
  });

  it('shows loading text in module selector initially', () => {
    mockUseQuery.mockReturnValue({ isLoading: true, data: undefined });
    const { getByText } = render(<NexusAI />);

    expect(getByText('Chargement...')).toBeTruthy();
  });

  it('renders module selector with courses', () => {
    const { getByText } = render(<NexusAI />);

    expect(getByText('Algèbre linéaire')).toBeTruthy();
  });

  it('disables send button when busy', () => {
    const { getByText } = render(<NexusAI />);
  });
});
