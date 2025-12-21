/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimatedSpinner } from '../AnimatedSpinner';

describe('AnimatedSpinner', () => {
  it('should render with default props', () => {
    render(<AnimatedSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render with custom label', () => {
    render(<AnimatedSpinner label="Processing..." />);
    expect(screen.getByLabelText('Processing...')).toBeInTheDocument();
  });

  it('should render SVG element', () => {
    const { container } = render(<AnimatedSpinner />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should apply custom size', () => {
    const { container } = render(<AnimatedSpinner size={48} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '48');
    expect(svg).toHaveAttribute('height', '48');
  });

  it('should apply custom className', () => {
    render(<AnimatedSpinner className="custom-spinner" />);
    const status = screen.getByRole('status');
    expect(status).toHaveClass('custom-spinner');
  });

  it('should have accessible label for screen readers', () => {
    render(<AnimatedSpinner label="Loading data..." />);
    const srOnly = screen.getByText('Loading data...');
    expect(srOnly).toHaveClass('sr-only');
  });

  it('should render two circle elements for spinner effect', () => {
    const { container } = render(<AnimatedSpinner />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(2);
  });
});
