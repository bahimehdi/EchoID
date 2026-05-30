import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from '../../components/Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Hello</Card>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders title and subtitle', () => {
    render(<Card title="TITLE" subtitle="Sub">Content</Card>);
    expect(screen.getByText('TITLE')).toBeInTheDocument();
    expect(screen.getByText('Sub')).toBeInTheDocument();
  });

  it('renders with accent', () => {
    const { container } = render(<Card accent="red">Red</Card>);
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('renders without header when no title', () => {
    const { container } = render(<Card>No Header</Card>);
    expect(container.querySelector('header')).toBeNull();
  });
});
