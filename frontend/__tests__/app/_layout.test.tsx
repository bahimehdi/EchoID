import React from 'react';
import { render } from '@testing-library/react-native';

const mockUseAuth = jest.fn();
jest.mock('../../lib/auth', () => ({
  useAuth: (selector) => mockUseAuth(selector),
}));

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }) => children,
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('@tanstack/react-query', () => ({
  QueryClientProvider: ({ children }) => children,
}));

jest.mock('expo-router', () => {
  const MockStack = ({ children }) => children || null;
  MockStack.Screen = () => null;
  return {
    Stack: MockStack,
    useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
    useSegments: () => [],
  };
});

describe('RootLayout', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it('renders without crashing', () => {
    mockUseAuth.mockReturnValue({
      hydrated: true,
      accessToken: null,
      hydrate: jest.fn(),
    });

    const RootLayout = require('../../app/_layout').default;
    const { toJSON } = render(<RootLayout />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with authenticated state', () => {
    mockUseAuth.mockReturnValue({
      hydrated: true,
      accessToken: 'tok',
      hydrate: jest.fn(),
    });

    const RootLayout = require('../../app/_layout').default;
    const { toJSON } = render(<RootLayout />);
    expect(toJSON()).toBeTruthy();
  });
});
