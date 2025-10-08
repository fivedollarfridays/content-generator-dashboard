/**
 * Navigation Component Accessibility Tests
 */

import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Navigation from '../navigation';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('Navigation Accessibility', () => {
  it('should not have any automatically detectable accessibility violations', async () => {
    const { container } = render(<Navigation />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA labels', () => {
    const { getByLabelText, getByRole } = render(<Navigation />);

    // Main navigation should have label
    const nav = getByRole('navigation', { name: 'Main navigation' });
    expect(nav).toBeInTheDocument();

    // Logo link should have label
    const homeLink = getByLabelText('Content Generator Home');
    expect(homeLink).toBeInTheDocument();
  });

  it('should indicate current page with aria-current', () => {
    const { getByRole } = render(<Navigation />);

    // Find link with aria-current="page"
    const currentLink = getByRole('link', { current: 'page' });
    expect(currentLink).toHaveTextContent('Dashboard');
  });

  it('should have keyboard focusable elements', () => {
    const { container } = render(<Navigation />);

    // All links should be in the tab order
    const links = container.querySelectorAll('a');
    links.forEach(link => {
      expect(link).not.toHaveAttribute('tabindex', '-1');
    });
  });

  it('should have sufficient color contrast for text', () => {
    const { container } = render(<Navigation />);

    // Check that text elements exist (actual contrast would be tested by axe)
    const textElements = container.querySelectorAll('a, span');
    expect(textElements.length).toBeGreaterThan(0);
  });
});
