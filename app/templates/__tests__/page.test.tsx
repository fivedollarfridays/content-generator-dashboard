/**
 * Templates Page Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/app/contexts', () => ({
  useAuth: jest.fn(() => ({ apiKey: 'test-key', isAuthenticated: true })),
}));

jest.mock('@/app/components/features/template-selector', () => {
  return function MockTemplateSelector() {
    return <div data-testid="template-selector">Template Selector</div>;
  };
});

import TemplatesPage from '../page';

describe('TemplatesPage', () => {
  it('should render templates page', () => {
    render(<TemplatesPage />);
    expect(screen.getByTestId('template-selector')).toBeInTheDocument();
  });

  it('should render page title', () => {
    render(<TemplatesPage />);
    expect(screen.getByText(/Templates/i)).toBeInTheDocument();
  });

  it('should render template selector', () => {
    render(<TemplatesPage />);
    expect(screen.getByTestId('template-selector')).toBeInTheDocument();
  });
});
