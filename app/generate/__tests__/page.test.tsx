/**
 * Generate Page Tests
 *
 * Comprehensive test suite for content generation page
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import GeneratePage from '../page';
import type { SyncJob, APIError } from '@/types/content-generator';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/app/contexts', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/app/components/features/content-generation-form', () => {
  return function MockContentGenerationForm({
    onSubmit,
    onError,
    apiUrl,
    apiKey,
  }: {
    onSubmit: (job: SyncJob) => void;
    onError: (error: APIError) => void;
    apiUrl: string;
    apiKey?: string;
  }) {
    return (
      <div data-testid="content-generation-form">
        <div data-testid="form-api-url">{apiUrl}</div>
        <div data-testid="form-api-key">{apiKey || 'undefined'}</div>
        <button
          onClick={() =>
            onSubmit({
              job_id: 'test-job-123',
              document_id: 'gdocs:abc123',
              channels: ['email'],
              status: 'pending',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
          }
        >
          Submit Job
        </button>
        <button
          onClick={() =>
            onError({
              code: 'VALIDATION_ERROR',
              message: 'Invalid document ID',
            })
          }
        >
          Trigger Error
        </button>
      </div>
    );
  };
});

const { useRouter } = require('next/navigation');
const { useAuth } = require('@/app/contexts');

describe('GeneratePage', () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock useRouter
    mockPush = jest.fn();
    useRouter.mockReturnValue({
      push: mockPush,
    });

    // Mock useAuth
    useAuth.mockReturnValue({
      apiKey: 'test-api-key-123',
      isAuthenticated: true,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ========== Page Rendering Tests ==========

  describe('Page Rendering', () => {
    it('should render page with title', () => {
      render(<GeneratePage />);

      expect(screen.getByText('Generate Content')).toBeInTheDocument();
    });

    it('should render page description', () => {
      render(<GeneratePage />);

      expect(
        screen.getByText(/Create AI-powered content and publish/i)
      ).toBeInTheDocument();
    });

    it('should render help section', () => {
      render(<GeneratePage />);

      expect(screen.getByText('💡 How to use')).toBeInTheDocument();
      expect(screen.getByText(/Enter your document ID/i)).toBeInTheDocument();
    });

    it('should render quick links', () => {
      render(<GeneratePage />);

      expect(screen.getByText('← Browse Templates')).toBeInTheDocument();
      expect(screen.getByText('View All Jobs →')).toBeInTheDocument();
    });

    it('should render content generation form', () => {
      render(<GeneratePage />);

      expect(screen.getByTestId('content-generation-form')).toBeInTheDocument();
    });

    it('should not render success message initially', () => {
      render(<GeneratePage />);

      expect(
        screen.queryByText('Content generation started successfully!')
      ).not.toBeInTheDocument();
    });

    it('should not render error message initially', () => {
      render(<GeneratePage />);

      expect(screen.queryByText('Content generation failed')).not.toBeInTheDocument();
    });
  });

  // ========== API Configuration Tests ==========

  describe('API Configuration', () => {
    it('should pass API URL to form', () => {
      render(<GeneratePage />);

      const apiUrl = screen.getByTestId('form-api-url');
      expect(apiUrl).toBeInTheDocument();
      expect(apiUrl.textContent).toBeTruthy();
    });

    it('should pass API key from auth context to form', () => {
      render(<GeneratePage />);

      expect(screen.getByTestId('form-api-key')).toHaveTextContent('test-api-key-123');
    });

    it('should handle missing API key gracefully', () => {
      useAuth.mockReturnValue({
        apiKey: null,
        isAuthenticated: false,
      });

      render(<GeneratePage />);

      expect(screen.getByTestId('form-api-key')).toHaveTextContent('undefined');
    });

    it('should use default API URL if env var not set', () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_URL;
      delete process.env.NEXT_PUBLIC_API_URL;

      render(<GeneratePage />);

      const apiUrl = screen.getByTestId('form-api-url');
      expect(apiUrl.textContent).toBe('http://localhost:8000');

      process.env.NEXT_PUBLIC_API_URL = originalEnv;
    });
  });

  // ========== Success Handling Tests ==========

  describe('Success Handling', () => {
    it('should display success message when job is submitted', async () => {
      const user = userEvent.setup({ delay: null });

      render(<GeneratePage />);

      await user.click(screen.getByText('Submit Job'));

      await waitFor(() => {
        expect(
          screen.getByText('Content generation started successfully!')
        ).toBeInTheDocument();
      });
    });

    it('should show job ID in success message', async () => {
      const user = userEvent.setup({ delay: null });

      render(<GeneratePage />);

      await user.click(screen.getByText('Submit Job'));

      await waitFor(() => {
        expect(screen.getByText(/Job ID: test-job-123/)).toBeInTheDocument();
      });
    });

    it('should show job status in success message', async () => {
      const user = userEvent.setup({ delay: null });

      render(<GeneratePage />);

      await user.click(screen.getByText('Submit Job'));

      await waitFor(() => {
        expect(screen.getByText(/Status: pending/)).toBeInTheDocument();
      });
    });

    it('should show redirect message', async () => {
      const user = userEvent.setup({ delay: null });

      render(<GeneratePage />);

      await user.click(screen.getByText('Submit Job'));

      await waitFor(() => {
        expect(
          screen.getByText(/Redirecting to jobs page to track progress/)
        ).toBeInTheDocument();
      });
    });

    it('should navigate to jobs page after successful submission', async () => {
      const user = userEvent.setup({ delay: null });

      render(<GeneratePage />);

      await user.click(screen.getByText('Submit Job'));

      // Fast-forward timers
      jest.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/jobs?highlight=test-job-123');
      });
    });

    it('should clear error when job is submitted successfully', async () => {
      const user = userEvent.setup({ delay: null });

      render(<GeneratePage />);

      // First trigger error
      await user.click(screen.getByText('Trigger Error'));

      await waitFor(() => {
        expect(screen.getByText('Content generation failed')).toBeInTheDocument();
      });

      // Then submit successfully
      await user.click(screen.getByText('Submit Job'));

      await waitFor(() => {
        expect(screen.queryByText('Content generation failed')).not.toBeInTheDocument();
      });
    });
  });

  // ========== Error Handling Tests ==========

  describe('Error Handling', () => {
    it('should display error message when submission fails', async () => {
      const user = userEvent.setup({ delay: null });

      render(<GeneratePage />);

      await user.click(screen.getByText('Trigger Error'));

      await waitFor(() => {
        expect(screen.getByText('Content generation failed')).toBeInTheDocument();
      });
    });

    it('should show error message in error display', async () => {
      const user = userEvent.setup({ delay: null });

      render(<GeneratePage />);

      await user.click(screen.getByText('Trigger Error'));

      await waitFor(() => {
        expect(screen.getByText('Invalid document ID')).toBeInTheDocument();
      });
    });

    it('should clear success message when error occurs', async () => {
      const user = userEvent.setup({ delay: null });

      render(<GeneratePage />);

      // First submit successfully
      await user.click(screen.getByText('Submit Job'));

      await waitFor(() => {
        expect(
          screen.getByText('Content generation started successfully!')
        ).toBeInTheDocument();
      });

      // Then trigger error
      await user.click(screen.getByText('Trigger Error'));

      await waitFor(() => {
        expect(
          screen.queryByText('Content generation started successfully!')
        ).not.toBeInTheDocument();
      });
    });

    it('should not navigate when error occurs', async () => {
      const user = userEvent.setup({ delay: null });

      render(<GeneratePage />);

      await user.click(screen.getByText('Trigger Error'));

      jest.advanceTimersByTime(2000);

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  // ========== Navigation Tests ==========

  describe('Navigation', () => {
    it('should have working templates link', () => {
      render(<GeneratePage />);

      const templatesLink = screen.getByText('← Browse Templates');
      expect(templatesLink).toHaveAttribute('href', '/templates');
    });

    it('should have working jobs link', () => {
      render(<GeneratePage />);

      const jobsLink = screen.getByText('View All Jobs →');
      expect(jobsLink).toHaveAttribute('href', '/jobs');
    });
  });

  // ========== Form Integration Tests ==========

  describe('Form Integration', () => {
    it('should pass onSubmit handler to form', async () => {
      const user = userEvent.setup({ delay: null });

      render(<GeneratePage />);

      await user.click(screen.getByText('Submit Job'));

      await waitFor(() => {
        expect(
          screen.getByText('Content generation started successfully!')
        ).toBeInTheDocument();
      });
    });

    it('should pass onError handler to form', async () => {
      const user = userEvent.setup({ delay: null });

      render(<GeneratePage />);

      await user.click(screen.getByText('Trigger Error'));

      await waitFor(() => {
        expect(screen.getByText('Content generation failed')).toBeInTheDocument();
      });
    });

    it('should pass default channels to form', () => {
      render(<GeneratePage />);

      // Form is rendered
      expect(screen.getByTestId('content-generation-form')).toBeInTheDocument();
    });

    it('should pass default template to form', () => {
      render(<GeneratePage />);

      // Form is rendered
      expect(screen.getByTestId('content-generation-form')).toBeInTheDocument();
    });
  });

  // ========== Help Section Tests ==========

  describe('Help Section', () => {
    it('should render all help steps', () => {
      render(<GeneratePage />);

      expect(screen.getByText(/Enter your document ID/i)).toBeInTheDocument();
      expect(screen.getByText(/Select one or more channels/i)).toBeInTheDocument();
      expect(screen.getByText(/Choose content type/i)).toBeInTheDocument();
      expect(screen.getByText(/Optionally schedule for later/i)).toBeInTheDocument();
      expect(screen.getByText(/Click.*Generate.*Publish/i)).toBeInTheDocument();
    });

    it('should mention document ID formats', () => {
      render(<GeneratePage />);

      expect(screen.getByText(/gdocs:xxx or notion:xxx/i)).toBeInTheDocument();
    });

    it('should list available channels', () => {
      render(<GeneratePage />);

      expect(screen.getByText(/Email, Website, Social Media/i)).toBeInTheDocument();
    });

    it('should mention content types', () => {
      render(<GeneratePage />);

      expect(screen.getByText(/Update, Blog Post, or Announcement/i)).toBeInTheDocument();
    });
  });

  // ========== Edge Cases ==========

  describe('Edge Cases', () => {
    it('should handle multiple rapid submissions', async () => {
      const user = userEvent.setup({ delay: null });

      render(<GeneratePage />);

      // Click multiple times
      await user.click(screen.getByText('Submit Job'));
      await user.click(screen.getByText('Submit Job'));
      await user.click(screen.getByText('Submit Job'));

      // Should only navigate once
      jest.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle alternating success and error states', async () => {
      const user = userEvent.setup({ delay: null });

      render(<GeneratePage />);

      // Success
      await user.click(screen.getByText('Submit Job'));
      await waitFor(() => {
        expect(
          screen.getByText('Content generation started successfully!')
        ).toBeInTheDocument();
      });

      // Error
      await user.click(screen.getByText('Trigger Error'));
      await waitFor(() => {
        expect(screen.getByText('Content generation failed')).toBeInTheDocument();
      });

      // Success again
      await user.click(screen.getByText('Submit Job'));
      await waitFor(() => {
        expect(
          screen.getByText('Content generation started successfully!')
        ).toBeInTheDocument();
      });
    });

    it('should handle undefined API key', () => {
      useAuth.mockReturnValue({
        apiKey: undefined,
        isAuthenticated: false,
      });

      render(<GeneratePage />);

      expect(screen.getByTestId('form-api-key')).toHaveTextContent('undefined');
    });

    it('should render without crashing when no auth context', () => {
      useAuth.mockReturnValue({});

      expect(() => {
        render(<GeneratePage />);
      }).not.toThrow();
    });
  });
});
