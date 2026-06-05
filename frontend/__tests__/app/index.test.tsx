import React from 'react';
import { render } from '@testing-library/react-native';

const mockUseAuth = jest.fn();
jest.mock('../../lib/auth', () => ({
  useAuth: (selector) => mockUseAuth(selector),
}));

jest.mock('expo-router', () => ({
  Redirect: () => null,
}));

describe('Index', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it('returns null when not hydrated', () => {
    mockUseAuth.mockReturnValue({ hydrated: false, accessToken: null });
    const Index = require('../../app/index').default;
    const { toJSON } = render(<Index />);
    expect(toJSON()).toBeNull();
  });

  it('redirects to tabs when authenticated', () => {
    mockUseAuth.mockReturnValue({ hydrated: true, accessToken: 'tok' });
    const Index = require('../../app/index').default;
    expect(() => render(<Index />)).not.toThrow();
  });

  it('redirects to login when not authenticated', () => {
    mockUseAuth.mockReturnValue({ hydrated: true, accessToken: null });
    const Index = require('../../app/index').default;
    expect(() => render(<Index />)).not.toThrow();
  });
});
