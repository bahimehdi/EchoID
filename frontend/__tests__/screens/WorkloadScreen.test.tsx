import React from 'react';
import { render } from '@testing-library/react-native';
import Workload from '../../app/(tabs)/workload';

jest.mock('../../lib/auth', () => ({
  useAuth: jest.fn((selector) =>
    selector?.({
      user: { id: 'user-1', fullName: 'Ahmed Benali', email: 'ahmed@ensa.uit.ac.ma', school: 'ENSA', role: 'STUDENT' },
    }) ?? { user: { id: 'user-1', fullName: 'Ahmed Benali' } },
  ),
}));

const mockUseQuery = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useQuery: (opts) => mockUseQuery(opts),
}));

describe('Workload screen', () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
  });

  it('shows loading state', () => {
    mockUseQuery.mockReturnValue({ isLoading: true, data: undefined, error: null });

    const { UNSAFE_getAllByType } = render(<Workload />);
  });

  it('shows error state', () => {
    mockUseQuery.mockReturnValue({ isLoading: false, data: undefined, error: new Error('Network error') });

    const { getByText } = render(<Workload />);

    expect(getByText(/Impossible de charger/)).toBeTruthy();
  });

  it('renders workload data with LOW status', () => {
    mockUseQuery.mockReturnValue({
      isLoading: false,
      data: {
        wdScore: 0.03,
        status: 'LOW',
        breakdown: [{ courseTitle: 'Maths', assignmentTitle: 'TD1', ci: 2.5, ti: 10, contribution: 0.25 }],
        history: Array.from({ length: 14 }, (_, i) => ({ date: `2026-05-${i + 1}`, wdScore: 0.02 + i * 0.001 })),
        calculatedAt: new Date().toISOString(),
      },
      error: null,
    });

    const { getByText } = render(<Workload />);

    expect(getByText('Analyse de Charge de Travail')).toBeTruthy();
    expect(getByText('Optimale')).toBeTruthy();
  });

  it('renders workload data with HIGH status and warning', () => {
    mockUseQuery.mockReturnValue({
      isLoading: false,
      data: {
        wdScore: 0.20,
        status: 'HIGH',
        breakdown: [
          { courseTitle: 'Maths', assignmentTitle: 'Examen', ci: 5.0, ti: 2, contribution: 2.5 },
          { courseTitle: 'Physics', assignmentTitle: 'Projet', ci: 4.0, ti: 3, contribution: 1.33 },
        ],
        history: Array.from({ length: 14 }, (_, i) => ({ date: `2026-05-${i + 1}`, wdScore: 0.15 + i * 0.01 })),
        calculatedAt: new Date().toISOString(),
      },
      error: null,
    });

    const { getByText } = render(<Workload />);

    expect(getByText('Élevée')).toBeTruthy();
    expect(getByText(/plusieurs échéances rapprochées/)).toBeTruthy();
  });
});
