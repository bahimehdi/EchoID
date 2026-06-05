import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('expo-router', () => {
  const MockTabs = ({ children, tabBar }) => <>{children}</>;
  MockTabs.Screen = () => null;
  return { Tabs: MockTabs };
});

jest.mock('../../../components/BottomTabBar', () => () => null);

describe('TabsLayout', () => {
  it('renders without crashing', () => {
    const TabsLayout = require('../../../app/(tabs)/_layout').default;
    const { toJSON } = render(<TabsLayout />);
    expect(toJSON()).toBeTruthy();
  });
});
