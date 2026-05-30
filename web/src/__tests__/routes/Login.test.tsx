import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../routes/Login';

beforeEach(() => {
  localStorage.clear();
});

describe('Login', () => {
  it('renders email and password fields', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );
    expect(screen.getByPlaceholderText('prenom.nom@uit.ac.ma')).toBeInTheDocument();
    expect(screen.getByText('Se connecter')).toBeInTheDocument();
  });

  it('shows error on empty form submission', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText('Se connecter'));
    await waitFor(() => {
      expect(screen.getByText(/Connexion/)).toBeInTheDocument();
    });
  });

  it('renders SSO button', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );
    expect(screen.getByText('Continuer avec SSO UIT')).toBeInTheDocument();
  });
});
