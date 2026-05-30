import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, unwrap, rawGet, session } from '../../lib/api';

describe('api instance', () => {
  it('has correct baseURL', () => {
    expect(api.defaults.baseURL).toBe('/');
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });
});

describe('unwrap', () => {
  it('extracts data when success is true', async () => {
    const promise = Promise.resolve({ data: { success: true, data: 'hello' } });
    await expect(unwrap(promise)).resolves.toBe('hello');
  });

  it('throws when success is false', async () => {
    const promise = Promise.resolve({ data: { success: false, message: 'fail' } });
    await expect(unwrap(promise)).rejects.toThrow('fail');
  });

  it('uses default message', async () => {
    const promise = Promise.resolve({ data: { success: false } });
    await expect(unwrap(promise)).rejects.toThrow('API error');
  });
});

describe('rawGet', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('handles raw JSON response', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: ['item1', 'item2'] });

    const result = await rawGet<string[]>('/test');
    expect(result).toEqual(['item1', 'item2']);
  });

  it('handles envelope response', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: { success: true, data: ['item1'] } });

    const result = await rawGet<string[]>('/test');
    expect(result).toEqual(['item1']);
  });

  it('throws on failed envelope', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: { success: false, message: 'error' } });

    await expect(rawGet('/test')).rejects.toThrow('error');
  });
});

describe('session', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and reads token', () => {
    session.save('token123', { id: 'u1', email: 'test@test.com', role: 'STUDENT' });
    expect(session.token()).toBe('token123');
  });

  it('returns user', () => {
    const user = { id: 'u1', email: 'test@test.com', role: 'STUDENT' as const };
    session.save('tok', user);
    expect(session.user()).toEqual(user);
  });

  it('clears session', () => {
    session.save('tok', { id: 'u1', email: 'test@test.com', role: 'STUDENT' });
    session.clear();
    expect(session.token()).toBeNull();
    expect(session.user()).toBeNull();
  });
});
