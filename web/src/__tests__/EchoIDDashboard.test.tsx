import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EchoIDDashboard from '../EchoIDDashboard';

vi.mock('../lib/api', () => ({
  rawGet: vi.fn(),
  api: { get: vi.fn() },
}));

const mockUseQuery = vi.fn();
vi.mock('@tanstack/react-query', () => ({
  useQuery: (opts: any) => mockUseQuery(opts),
  QueryClientProvider: ({ children }: any) => children,
}));

describe('EchoIDDashboard', () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
  });

  it('shows loading spinner when data is loading', () => {
    mockUseQuery.mockReturnValue({ isLoading: true, data: undefined });

    render(<EchoIDDashboard />);

    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('renders professor tab by default', () => {
    mockUseQuery.mockReturnValue({ isLoading: false, data: [] });

    render(<EchoIDDashboard />);

    expect(screen.getByText('Tableaux de bord')).toBeTruthy();
    expect(screen.getByText('Professeur')).toBeTruthy();
    expect(screen.getByText('Administration')).toBeTruthy();
  });

  it('renders multiple empty data states when all queries empty', () => {
    mockUseQuery.mockReturnValue({ isLoading: false, data: [] });

    render(<EchoIDDashboard />);

    const emptyMessages = screen.getAllByText('Aucune donnée disponible pour le moment.');
    expect(emptyMessages.length).toBeGreaterThan(1);
  });

  it('renders professor dashboard with data', () => {
    const queryData: Record<string, any> = {
      bottlenecks: [{ conceptSlug: 'derivatives', queryCount: 42, uniqueStudents: 15 }],
      'at-risk': [{ studentId: 's1', fullName: 'Alice', riskScore: 0.85, reasons: ['Faible rendu'], school: 'ENSA' }],
      cheating: [{ clusterId: 'c1', assignmentTitle: 'Exam1', avgSimilarity: 0.85, students: [{ name: 'Alice' }], evidence: ['Similar answers'] }],
      interventions: [{ module: 'Maths', cohort: 'S1', suggestion: 'Extra tutoring', confidence: 0.8 }],
      'explain-history': { weeks: ['S1', 'S2'], requests: [10, 20] },
      'submission-stats': { tds: ['TD1', 'TD2'], onTime: [15, 12], late: [3, 5] },
      'module-kpis': { average: 14.5, submissionRate: 0.85, explainerUsage: 0.42, ocrDocs: 12, bottleneckIndex: 3 },
    };
    mockUseQuery.mockImplementation((opts: any) => ({
      isLoading: false,
      data: queryData[opts.queryKey[0]] ?? [],
    }));

    render(<EchoIDDashboard />);

    expect(screen.queryByText('Aucune donnée disponible pour le moment.')).toBeNull();
  });

  it('renders admin tab', async () => {
    const queryData: Record<string, any> = {
      bottlenecks: [{ conceptSlug: 'derivatives', queryCount: 42, uniqueStudents: 15 }],
      'at-risk': [],
      engagement: [{ day: 'Lun', count: 120 }],
      'cohort-submissions': { tds: ['TD1', 'TD2'], onTime: [15, 12], late: [3, 5] },
      'all-modules-history': { modules: [{ label: 'Maths', requests: [10, 20] }] },
    };
    mockUseQuery.mockImplementation((opts: any) => ({
      isLoading: false,
      data: queryData[opts.queryKey[0]] ?? [],
    }));

    render(<EchoIDDashboard />);

    const adminBtn = screen.getByText('Administration');
    fireEvent.click(adminBtn);

    await waitFor(() => {
      expect(screen.getByText('Vue plateforme')).toBeTruthy();
    });
  });
});
