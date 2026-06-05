import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('expo-router', () => {
  const MockStack = ({ children }) => <>{children}</>;
  MockStack.Screen = () => null;
  return { Stack: MockStack };
});

describe('AuthLayout', () => {
  it('renders without crashing', () => {
    const AuthLayout = require('../../../app/(auth)/_layout').default;
    const { toJSON } = render(<AuthLayout />);
    expect(toJSON()).toBeTruthy();
  });
});
