import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Admin from '../../routes/Admin';

const mockUseQuery = vi.fn();
vi.mock('@tanstack/react-query', () => ({
  useQuery: (opts: any) => mockUseQuery(opts),
}));

vi.mock('../../lib/api', () => ({
  api: { get: vi.fn() },
  unwrap: (p: Promise<any>) => p.then((r: any) => r.data.data),
  session: { user: () => ({ fullName: 'Admin', email: 'admin@uit.ac.ma', role: 'ADMIN' }) },
}));

describe('Admin', () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
  });

  it('renders title and badge', () => {
    mockUseQuery.mockReturnValue({ isLoading: true, data: undefined });

    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>,
    );

    expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
    expect(screen.getByText('Pilotage ENSAK')).toBeInTheDocument();
  });

  it('renders KPI row with health data', () => {
    mockUseQuery.mockReturnValue({
      isLoading: false,
      data: { totalActiveStudents: 47, totalUploadsThisWeek: 12, atRiskCount: 5, lmsStatus: 'operational', aiServiceStatus: 'operational', lastEventReceivedAt: new Date().toISOString() },
    });

    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>,
    );

    expect(screen.getByText('47')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getAllByText('operational').length).toBeGreaterThanOrEqual(1);
  });

  it('shows fallback values when health data is null', () => {
    mockUseQuery.mockReturnValue({ isLoading: false, data: null });

    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>,
    );

    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThanOrEqual(3);
  });

  it('renders chart cards', () => {
    mockUseQuery.mockReturnValue({ isLoading: false, data: null });

    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>,
    );

    expect(screen.getByText('Volume des requêtes NexusAI')).toBeInTheDocument();
    expect(screen.getByText('Soumissions vs deadlines')).toBeInTheDocument();
    expect(screen.getByText('Santé des cohortes ENSA')).toBeInTheDocument();
    expect(screen.getByText("Engagement par jour")).toBeInTheDocument();
    expect(screen.getByText('Top concepts difficiles')).toBeInTheDocument();
  });

  it('shows error banner when health fails', () => {
    mockUseQuery.mockReturnValue({
      isLoading: false,
      data: undefined,
      error: new Error('Network error'),
    });

    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>,
    );

    expect(screen.getByText(/api\/admin\/health a échoué/)).toBeInTheDocument();
  });
});
