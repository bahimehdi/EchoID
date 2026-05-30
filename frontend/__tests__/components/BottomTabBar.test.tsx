import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BottomTabBar from '../../components/BottomTabBar';

const createMockProps = (activeRoute = 'home') => ({
  state: {
    routes: [
      { key: 'home', name: 'home' },
      { key: 'courses', name: 'courses' },
      { key: 'nexusai', name: 'nexusai' },
      { key: 'workload', name: 'workload' },
      { key: 'profile', name: 'profile' },
    ],
    index: ['home', 'courses', 'nexusai', 'workload', 'profile'].indexOf(activeRoute),
  },
  navigation: {
    navigate: jest.fn(),
  },
  descriptors: {},
}) as any;

describe('BottomTabBar', () => {
  it('renders all tab labels', () => {
    const { getByText } = render(<BottomTabBar {...createMockProps('home')} />);
    expect(getByText('ACCUEIL')).toBeTruthy();
    expect(getByText('COURS')).toBeTruthy();
    expect(getByText('NEXUSAI')).toBeTruthy();
    expect(getByText('ANALYSE')).toBeTruthy();
    expect(getByText('PROFIL')).toBeTruthy();
  });

  it('navigates on tab press', () => {
    const props = createMockProps('home');
    const { getByText } = render(<BottomTabBar {...props} />);
    fireEvent.press(getByText('COURS'));
    expect(props.navigation.navigate).toHaveBeenCalledWith('courses');
  });

  it('does not navigate when pressing active tab', () => {
    const props = createMockProps('home');
    const { getByText } = render(<BottomTabBar {...props} />);
    fireEvent.press(getByText('ACCUEIL'));
    expect(props.navigation.navigate).not.toHaveBeenCalled();
  });
});
