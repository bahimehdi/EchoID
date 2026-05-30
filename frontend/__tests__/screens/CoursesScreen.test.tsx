import React from 'react';
import { render } from '@testing-library/react-native';
import Courses from '../../app/(tabs)/courses';

jest.mock('../../lib/auth', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'user-1', fullName: 'Ahmed Benali', email: 'ahmed@ensa.uit.ac.ma', school: 'ENSA', role: 'STUDENT' },
    accessToken: 'tok',
  })),
}));

const mockUseQuery = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useQuery: (opts) => mockUseQuery(opts),
}));

describe('Courses screen', () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
  });

  it('shows loading state', () => {
    mockUseQuery.mockReturnValue({ isLoading: true, data: undefined, refetch: jest.fn() });

    const { getByText } = render(<Courses />);

    expect(getByText('Mes Cours')).toBeTruthy();
  });

  it('renders list of courses', () => {
    mockUseQuery.mockImplementation((opts) => {
      if (opts.queryKey[0] === 'courses') {
        return {
          isLoading: false,
          data: [
            { id: 'c1', title: 'Algèbre linéaire', lmsSource: 'MOODLE', school: 'ENSA', semester: 'S1', isActive: true },
            { id: 'c2', title: 'Physique', lmsSource: 'GOOGLE_CLASSROOM', school: 'ENSA', semester: 'S2', isActive: true },
          ],
          refetch: jest.fn(),
        };
      }
      if (opts.queryKey[0] === 'course-details') {
        return { isLoading: false, data: { c1: { id: 'c1', sections: [{ id: 's1', title: 'Chapitre 1', orderIndex: 0 }] } }, refetch: jest.fn() };
      }
      if (opts.queryKey[0] === 'assignments') {
        return { isLoading: false, data: { c1: [{ id: 'a1', courseId: 'c1', title: 'TD1', dueAt: new Date(Date.now() + 86400000).toISOString(), complexity: 2, assignmentType: 'HOMEWORK' }] }, refetch: jest.fn() };
      }
      return { isLoading: false, data: undefined, refetch: jest.fn() };
    });

    const { getByText } = render(<Courses />);

    expect(getByText('Algèbre linéaire')).toBeTruthy();
    expect(getByText('Physique')).toBeTruthy();
    expect(getByText('TD1')).toBeTruthy();
  });

  it('renders empty courses state', () => {
    mockUseQuery.mockReturnValue({ isLoading: false, data: [], refetch: jest.fn() });

    const { getByText } = render(<Courses />);

    expect(getByText('Mes Cours')).toBeTruthy();
  });
});
