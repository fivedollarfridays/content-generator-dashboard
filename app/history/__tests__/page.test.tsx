/**
 * History Page Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/app/contexts', () => ({
  useAuth: jest.fn(() => ({ apiKey: 'test-key', isAuthenticated: true })),
}));

jest.mock('@/app/components/features/timeline-view', () => {
  return function MockTimelineView() {
    return <div data-testid="timeline-view">Timeline View</div>;
  };
});

import HistoryPage from '../page';

describe('HistoryPage', () => {
  it('should render history page', () => {
    render(<HistoryPage />);
    expect(screen.getByTestId('timeline-view')).toBeInTheDocument();
  });

  it('should render page title', () => {
    render(<HistoryPage />);
    expect(screen.getByText(/Job History/i)).toBeInTheDocument();
  });

  it('should render timeline component', () => {
    render(<HistoryPage />);
    expect(screen.getByTestId('timeline-view')).toBeInTheDocument();
  });
});
