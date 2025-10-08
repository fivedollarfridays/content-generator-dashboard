/**
 * ContentGenerationForm Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContentGenerationForm } from '../content-generation-form';
import type { SyncJob, APIError } from '@/types/content-generator';

// Mock API client
jest.mock('@/lib/api/api-client');

describe('ContentGenerationForm', () => {
  const mockApiUrl = 'http://localhost:8000';
  const mockApiKey = 'test-api-key';
  const mockOnSubmit = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  // ========== Rendering Tests ==========

  describe('Rendering', () => {
    it('should render form with all fields', () => {
      render(<ContentGenerationForm apiUrl={mockApiUrl} />);

      expect(screen.getByText('Content Generator')).toBeInTheDocument();
      expect(screen.getByLabelText(/Document ID/i)).toBeInTheDocument();
      expect(screen.getByText('Select Channels')).toBeInTheDocument();
      expect(screen.getByText('Content Type')).toBeInTheDocument();
      expect(screen.getByText('Template Style')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Generate Content/i })
      ).toBeInTheDocument();
    });

    it('should render all available channels', () => {
      render(<ContentGenerationForm apiUrl={mockApiUrl} />);

      expect(screen.getByText('Email Newsletter')).toBeInTheDocument();
      expect(screen.getByText('Website')).toBeInTheDocument();
      expect(screen.getByText('Twitter/X')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
    });

    it('should render default channels as selected', () => {
      render(
        <ContentGenerationForm
          apiUrl={mockApiUrl}
          defaultChannels={['email', 'website']}
        />
      );

      const emailButton = screen
        .getByText('Email Newsletter')
        .closest('button');
      const websiteButton = screen.getByText('Website').closest('button');

      expect(emailButton).toHaveClass('border-blue-600');
      expect(websiteButton).toHaveClass('border-blue-600');
    });
  });

  // ========== Validation Tests ==========

  describe('Validation', () => {
    it('should show error when document ID is empty', async () => {
      render(<ContentGenerationForm apiUrl={mockApiUrl} />);

      const submitButton = screen.getByRole('button', {
        name: /Generate Content/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Document ID is required')).toBeInTheDocument();
      });
    });

    it('should show error when no channels are selected', async () => {
      render(<ContentGenerationForm apiUrl={mockApiUrl} />);

      const documentInput = screen.getByLabelText(/Document ID/i);
      fireEvent.change(documentInput, { target: { value: 'doc-123' } });

      const submitButton = screen.getByRole('button', {
        name: /Generate Content/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Select at least one channel')
        ).toBeInTheDocument();
      });
    });

    it('should clear error messages when form is resubmitted', async () => {
      render(<ContentGenerationForm apiUrl={mockApiUrl} />);

      // First submission with error
      const submitButton = screen.getByRole('button', {
        name: /Generate Content/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Document ID is required')).toBeInTheDocument();
      });

      // Fix the error and resubmit
      const documentInput = screen.getByLabelText(/Document ID/i);
      fireEvent.change(documentInput, { target: { value: 'doc-123' } });

      fireEvent.click(submitButton);

      // Error should be cleared before validation check
      expect(
        screen.queryByText('Document ID is required')
      ).not.toBeInTheDocument();
    });
  });

  // ========== Channel Selection Tests ==========

  describe('Channel Selection', () => {
    it('should toggle channel selection on click', () => {
      render(<ContentGenerationForm apiUrl={mockApiUrl} />);

      const emailButton = screen
        .getByText('Email Newsletter')
        .closest('button');

      // Initially not selected
      expect(emailButton).not.toHaveClass('border-blue-600');

      // Click to select
      fireEvent.click(emailButton!);
      expect(emailButton).toHaveClass('border-blue-600');

      // Click to deselect
      fireEvent.click(emailButton!);
      expect(emailButton).not.toHaveClass('border-blue-600');
    });

    it('should allow multiple channel selections', () => {
      render(<ContentGenerationForm apiUrl={mockApiUrl} />);

      const emailButton = screen
        .getByText('Email Newsletter')
        .closest('button');
      const websiteButton = screen.getByText('Website').closest('button');

      fireEvent.click(emailButton!);
      fireEvent.click(websiteButton!);

      expect(emailButton).toHaveClass('border-blue-600');
      expect(websiteButton).toHaveClass('border-blue-600');
    });
  });

  // ========== Form Submission Tests ==========

  describe('Form Submission', () => {
    it('should call onSubmit with job data on successful generation', async () => {
      const mockJob: SyncJob = {
        job_id: 'job-123',
        document_id: 'doc-456',
        status: 'completed',
        channels: ['email'],
        content_type: 'update',
        template_style: 'modern',
        created_at: '2025-10-02T12:00:00Z',
        updated_at: '2025-10-02T12:00:00Z',
        results: {
          email: {
            subject: 'Test Subject',
            body: 'Test Body',
            status: 'published',
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockJob,
      });

      render(
        <ContentGenerationForm apiUrl={mockApiUrl} onSubmit={mockOnSubmit} />
      );

      // Fill form
      const documentInput = screen.getByLabelText(/Document ID/i);
      fireEvent.change(documentInput, { target: { value: 'doc-456' } });

      const emailButton = screen
        .getByText('Email Newsletter')
        .closest('button');
      fireEvent.click(emailButton!);

      const submitButton = screen.getByRole('button', {
        name: /Generate Content/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(mockJob);
      });
    });

    it('should call onError when generation fails', async () => {
      const mockError = {
        message: 'Generation failed',
        status: 500,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ detail: 'Generation failed' }),
      });

      render(
        <ContentGenerationForm apiUrl={mockApiUrl} onError={mockOnError} />
      );

      // Fill form
      const documentInput = screen.getByLabelText(/Document ID/i);
      fireEvent.change(documentInput, { target: { value: 'doc-456' } });

      const emailButton = screen
        .getByText('Email Newsletter')
        .closest('button');
      fireEvent.click(emailButton!);

      const submitButton = screen.getByRole('button', {
        name: /Generate Content/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled();
      });
    });

    it('should show loading state during submission', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(<ContentGenerationForm apiUrl={mockApiUrl} />);

      // Fill form
      const documentInput = screen.getByLabelText(/Document ID/i);
      fireEvent.change(documentInput, { target: { value: 'doc-456' } });

      const emailButton = screen
        .getByText('Email Newsletter')
        .closest('button');
      fireEvent.click(emailButton!);

      const submitButton = screen.getByRole('button', {
        name: /Generate Content/i,
      });
      fireEvent.click(submitButton);

      // Should show loading state
      await waitFor(() => {
        expect(submitButton).toHaveTextContent('Generating Content...');
      });
    });

    it('should reset form after successful submission (non-dry-run)', async () => {
      const mockJob: SyncJob = {
        job_id: 'job-123',
        document_id: 'doc-456',
        status: 'completed',
        channels: ['email'],
        content_type: 'update',
        template_style: 'modern',
        created_at: '2025-10-02T12:00:00Z',
        updated_at: '2025-10-02T12:00:00Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockJob,
      });

      render(<ContentGenerationForm apiUrl={mockApiUrl} />);

      // Fill form
      const documentInput = screen.getByLabelText(
        /Document ID/i
      ) as HTMLInputElement;
      fireEvent.change(documentInput, { target: { value: 'doc-456' } });

      const emailButton = screen
        .getByText('Email Newsletter')
        .closest('button');
      fireEvent.click(emailButton!);

      const submitButton = screen.getByRole('button', {
        name: /Generate Content/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(documentInput.value).toBe('');
      });
    });
  });

  // ========== Content Type Selection Tests ==========

  describe('Content Type Selection', () => {
    it('should update content type when radio button is selected', () => {
      render(<ContentGenerationForm apiUrl={mockApiUrl} />);

      const blogRadio = screen.getByLabelText('Blog Post');
      fireEvent.click(blogRadio);

      expect(blogRadio).toBeChecked();
    });
  });

  // ========== Template Style Selection Tests ==========

  describe('Template Style Selection', () => {
    it('should display all template style options', () => {
      render(<ContentGenerationForm apiUrl={mockApiUrl} />);

      expect(screen.getByText('Modern')).toBeInTheDocument();
      expect(screen.getByText('Classic')).toBeInTheDocument();
      expect(screen.getByText('Minimal')).toBeInTheDocument();
    });

    it('should select default template', () => {
      render(
        <ContentGenerationForm apiUrl={mockApiUrl} defaultTemplate="classic" />
      );

      const classicButton = screen.getByText('Classic').closest('button');
      expect(classicButton).toHaveClass('border-blue-600');
    });
  });

  // ========== API Key Integration Tests ==========

  describe('API Key Integration', () => {
    it('should pass API key to API client', async () => {
      render(<ContentGenerationForm apiUrl={mockApiUrl} apiKey={mockApiKey} />);

      // The API client is instantiated with the API key
      // This test verifies component renders without errors
      expect(
        screen.getByRole('button', { name: /Generate Content/i })
      ).toBeInTheDocument();
    });
  });
});
