import React from 'react';
import { render } from '@testing-library/react-native';
import VideoCard from '../../components/VideoCard';

const baseProps = {
  title: 'Test Video',
  channel: 'Test Channel',
  url: 'https://youtube.com/watch?v=test123',
};

describe('VideoCard', () => {
  it('renders title and channel', () => {
    const { getByText } = render(<VideoCard {...baseProps} />);
    expect(getByText('Test Video')).toBeTruthy();
    expect(getByText('Test Channel')).toBeTruthy();
  });

  it('renders duration', () => {
    const { getByText } = render(<VideoCard {...baseProps} durationSec={612} />);
    expect(getByText('10:12')).toBeTruthy();
  });

  it('renders view count compact', () => {
    const { getByText } = render(<VideoCard {...baseProps} viewCount={1500} />);
    expect(getByText('👁  1.5 k')).toBeTruthy();
  });

  it('renders pertinence score', () => {
    const { getByText } = render(<VideoCard {...baseProps} score={0.85} />);
    expect(getByText('🎯  Pertinence 85%')).toBeTruthy();
  });

  it('renders transcript excerpt', () => {
    const { getByText } = render(<VideoCard {...baseProps} transcriptExcerpt="lorem ipsum" />);
    expect(getByText('lorem ipsum')).toBeTruthy();
  });

  it('renders fallback thumbnail for youtu.be URLs', () => {
    const { getByText } = render(
      <VideoCard title="Short" channel="C" url="https://youtu.be/test123" />,
    );
    expect(getByText('Short')).toBeTruthy();
  });
});
