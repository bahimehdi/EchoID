import { api, unwrap } from '../../lib/api';

jest.mock('../../lib/auth', () => ({
  readAccessToken: jest.fn(),
  useAuth: {
    getState: jest.fn(() => ({
      refreshToken: 'mock-refresh',
      setSession: jest.fn(),
      clear: jest.fn(),
    })),
  },
}));

describe('unwrap', () => {
  it('extracts data when success is true', async () => {
    const promise = Promise.resolve({ data: { success: true, data: 'hello' } });
    await expect(unwrap(promise)).resolves.toBe('hello');
  });

  it('throws when success is false', async () => {
    const promise = Promise.resolve({ data: { success: false, message: 'fail' } });
    await expect(unwrap(promise)).rejects.toThrow('fail');
  });

  it('throws with default message when success is false and no message', async () => {
    const promise = Promise.resolve({ data: { success: false } });
    await expect(unwrap(promise)).rejects.toThrow('API error');
  });
});

describe('api instance', () => {
  it('has correct baseURL', () => {
    expect(api.defaults.baseURL).toBeTruthy();
    expect(api.defaults.timeout).toBe(15000);
  });

  it('has JSON content type', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });
});
