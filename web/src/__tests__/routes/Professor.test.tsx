import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Professor from '../../routes/Professor';

const mockUseQuery = vi.fn();
vi.mock('@tanstack/react-query', () => ({
  useQuery: (opts: any) => mockUseQuery(opts),
}));

vi.mock('../../lib/api', () => ({
  api: { get: vi.fn() },
  unwrap: (p: Promise<any>) => p.then((r: any) => r.data.data),
  session: { user: () => ({ fullName: 'Prof', email: 'prof@uit.ac.ma', role: 'PROFESSOR' }) },
}));

describe('Professor', () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
  });

  it('shows loading state', () => {
    mockUseQuery.mockReturnValue({ isLoading: true, data: undefined });

    render(
      <MemoryRouter>
        <Professor />
      </MemoryRouter>,
    );

    expect(screen.getAllByText('Chargement...').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
  });

  it('renders bottlenecks chart when data loaded', () => {
    mockUseQuery.mockImplementation((opts: any) => {
      const key = opts.queryKey[0];
      if (key === 'bottlenecks') {
        return { isLoading: false, data: [{ conceptSlug: 'derivatives', queryCount: 42, uniqueStudents: 15 }] };
      }
      return { isLoading: false, data: undefined };
    });

    render(
      <MemoryRouter>
        <Professor />
      </MemoryRouter>,
    );

    expect(screen.getByText('Concepts les plus demandés')).toBeInTheDocument();
    expect(screen.getByText('derivatives')).toBeInTheDocument();
  });

  it('renders at-risk students when data loaded', () => {
    mockUseQuery.mockImplementation((opts: any) => {
      const key = opts.queryKey[0];
      if (key === 'atRisk') {
        return {
          isLoading: false,
          data: [
            { studentId: 's1', fullName: 'Alice', riskScore: 0.85, school: 'ENSA', lastSeen: new Date().toISOString(), reasons: ['Faible rendu', 'Absences'] },
          ],
        };
      }
      return { isLoading: false, data: undefined };
    });

    render(
      <MemoryRouter>
        <Professor />
      </MemoryRouter>,
    );

    expect(screen.getByText('Étudiants à risque')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Faible rendu')).toBeInTheDocument();
  });

  it('shows empty message when no at-risk students', () => {
    mockUseQuery.mockImplementation((opts: any) => {
      const key = opts.queryKey[0];
      if (key === 'atRisk') {
        return { isLoading: false, data: [] };
      }
      return { isLoading: false, data: undefined };
    });

    render(
      <MemoryRouter>
        <Professor />
      </MemoryRouter>,
    );

    expect(screen.getByText('Aucun étudiant à risque détecté cette semaine.')).toBeInTheDocument();
  });

  it('renders cheating clusters when data loaded', () => {
    mockUseQuery.mockImplementation((opts: any) => {
      const key = opts.queryKey[0];
      if (key === 'cheatingClusters') {
        return {
          isLoading: false,
          data: [
            { clusterId: 'c1', assignmentTitle: 'Exam1', module: 'Python', avgSimilarity: 0.85, submittedWithinMinutes: 5, students: [{ id: 's1', name: 'Alice' }], evidence: ['Code identique'], recommendation: 'Entretien' },
          ],
        };
      }
      return { isLoading: false, data: undefined };
    });

    render(
      <MemoryRouter>
        <Professor />
      </MemoryRouter>,
    );

    expect(screen.getByText('Soumissions à examiner')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText(/Cluster c1/)).toBeInTheDocument();
  });
});
