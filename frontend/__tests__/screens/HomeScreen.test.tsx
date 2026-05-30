import React from 'react';
import { render } from '@testing-library/react-native';
import Home from '../../app/(tabs)/home';

jest.mock('../../lib/auth', () => ({
  useAuth: jest.fn((selector) =>
    selector?.({
      user: { id: 'user-1', fullName: 'Ahmed Benali', email: 'ahmed@ensa.uit.ac.ma', school: 'ENSA', role: 'STUDENT' },
      accessToken: 'tok', refreshToken: 'rtok',
    }) ?? {
      user: { id: 'user-1', fullName: 'Ahmed Benali', email: 'ahmed@ensa.uit.ac.ma', school: 'ENSA', role: 'STUDENT' },
    },
  ),
}));

const mockUseQuery = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useQuery: (opts) => mockUseQuery(opts),
}));

describe('Home screen', () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
  });

  it('shows loading indicator when data is loading', () => {
    mockUseQuery.mockReturnValue({
      isLoading: true,
      data: undefined,
      refetch: jest.fn(),
    });

    const { getByText, queryByText, UNSAFE_getAllByType } = render(<Home />);

    expect(queryByText('Bonjour, Ahmed.')).toBeTruthy();
  });

  it('shows empty notification message', () => {
    mockUseQuery.mockImplementation((opts) => {
      if (opts.queryKey[0] === 'courses') {
        return { isLoading: false, data: [], refetch: jest.fn() };
      }
      if (opts.queryKey[0] === 'workload') {
        return { isLoading: false, data: null, refetch: jest.fn() };
      }
      if (opts.queryKey[0] === 'notifications') {
        return { isLoading: false, data: [], refetch: jest.fn() };
      }
      return { isLoading: false, data: undefined, refetch: jest.fn() };
    });

    const { queryByText, getByText } = render(<Home />);

    expect(queryByText('Aucune notification récente.')).toBeTruthy();
  });

  it('renders workload status', () => {
    mockUseQuery.mockImplementation((opts) => {
      if (opts.queryKey[0] === 'courses') {
        return { isLoading: false, data: [{ id: 'c1', title: 'Maths', lmsSource: 'MOODLE', school: 'ENSA', semester: 'S1', isActive: true }], refetch: jest.fn() };
      }
      if (opts.queryKey[0] === 'workload') {
        return { isLoading: false, data: { wdScore: 0.25, status: 'MODERATE', breakdown: [], history: [], calculatedAt: new Date().toISOString() }, refetch: jest.fn() };
      }
      if (opts.queryKey[0] === 'notifications') {
        return { isLoading: false, data: [{ id: 'n1', message: 'Devoir à rendre', type: 'DEADLINE_REMINDER', isRead: false, sentAt: new Date().toISOString() }], refetch: jest.fn() };
      }
      return { isLoading: false, data: undefined, refetch: jest.fn() };
    });

    const { getByText } = render(<Home />);

    expect(getByText(/Charge équilibrée/)).toBeTruthy();
    expect(getByText('Devoir à rendre')).toBeTruthy();
  });

  it('shows critical workload status', () => {
    mockUseQuery.mockImplementation((opts) => {
      if (opts.queryKey[0] === 'courses') {
        return { isLoading: false, data: [], refetch: jest.fn() };
      }
      if (opts.queryKey[0] === 'workload') {
        return { isLoading: false, data: { wdScore: 0.35, status: 'CRITICAL', breakdown: [], history: [], calculatedAt: new Date().toISOString() }, refetch: jest.fn() };
      }
      if (opts.queryKey[0] === 'notifications') {
        return { isLoading: false, data: [], refetch: jest.fn() };
      }
      return { isLoading: false, data: undefined, refetch: jest.fn() };
    });

    const { getByText } = render(<Home />);

    expect(getByText(/Charge soutenue/)).toBeTruthy();
  });
});
