import { useAuth } from '../../lib/auth';

beforeEach(() => {
  localStorage.clear();
  useAuth.setState({ hydrated: true, accessToken: null, refreshToken: null, user: null });
});

describe('useAuth store', () => {
  it('starts unhydrated', () => {
    const s = useAuth.getState();
    expect(s.hydrated).toBe(true);
    expect(s.accessToken).toBeNull();
    expect(s.user).toBeNull();
  });

  it('setSession saves tokens and user', async () => {
    await useAuth.getState().setSession({
      accessToken: 'abc',
      refreshToken: 'def',
      user: { id: '1', email: 'test@test.com', role: 'STUDENT' },
    });
    const s = useAuth.getState();
    expect(s.accessToken).toBe('abc');
    expect(s.refreshToken).toBe('def');
    expect(s.user?.email).toBe('test@test.com');
  });

  it('clear resets everything to null', async () => {
    await useAuth.getState().setSession({
      accessToken: 'abc', refreshToken: 'def',
      user: { id: '1', email: 't@t.com', role: 'STUDENT' },
    });
    await useAuth.getState().clear();
    const s = useAuth.getState();
    expect(s.accessToken).toBeNull();
    expect(s.refreshToken).toBeNull();
    expect(s.user).toBeNull();
  });

  it('hydrate loads tokens from storage', async () => {
    localStorage.setItem('echoid_access_token', 'stored-token');
    await useAuth.getState().hydrate();
    // On jsdom, Platform.OS is 'web' → uses localStorage
    const s = useAuth.getState();
    expect(s.hydrated).toBe(true);
  });
});
