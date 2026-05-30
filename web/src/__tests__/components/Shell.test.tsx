import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Shell from '../../components/Shell';

const mockUser = vi.hoisted(() => vi.fn());
vi.mock('../../lib/api', () => ({
  session: { user: mockUser, clear: vi.fn() },
}));

describe('Shell', () => {
  beforeEach(() => {
    mockUser.mockReset();
  });

  it('renders title and subtitle', () => {
    mockUser.mockReturnValue({ fullName: 'Ahmed', email: 'ahmed@uit.ac.ma', role: 'PROFESSOR' });

    render(
      <MemoryRouter>
        <Shell title="Dashboard" subtitle="Vue d’ensemble">
          <p>Content</p>
        </Shell>
      </MemoryRouter>,
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Vue d’ensemble')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders user info and sign out button', () => {
    mockUser.mockReturnValue({ fullName: 'Ahmed Benali', email: 'ahmed@uit.ac.ma', role: 'ADMIN' });

    render(
      <MemoryRouter>
        <Shell title="Admin" />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Ahmed Benali/)).toBeInTheDocument();
    expect(screen.getByText('Déconnexion')).toBeInTheDocument();
  });

  it('renders brand elements', () => {
    mockUser.mockReturnValue(null);

    render(
      <MemoryRouter>
        <Shell title="Test" />
      </MemoryRouter>,
    );

    expect(screen.getByText('UIT')).toBeInTheDocument();
    expect(screen.getByText('Portail UIT')).toBeInTheDocument();
    expect(screen.getByText('EchoID Nexus')).toBeInTheDocument();
  });
});
