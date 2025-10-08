/**
 * TemplateSelector Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TemplateSelector } from '../template-selector';
import type { Template, Channel } from '@/types/content-generator';

const createMockTemplate = (overrides?: Partial<Template>): Template => ({
  id: 'template-1',
  name: 'Modern Newsletter',
  description: 'A modern email newsletter template',
  style: 'modern',
  supported_channels: ['email'],
  variables: [],
  ...overrides,
});

describe('TemplateSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Template Display', () => {
    it('should render single template', () => {
      const template = createMockTemplate();

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Modern Newsletter')).toBeInTheDocument();
      expect(screen.getByText('A modern email newsletter template')).toBeInTheDocument();
    });

    it('should render multiple templates', () => {
      const templates = [
        createMockTemplate({ id: 't1', name: 'Template 1' }),
        createMockTemplate({ id: 't2', name: 'Template 2' }),
        createMockTemplate({ id: 't3', name: 'Template 3' }),
      ];

      render(
        <TemplateSelector
          templates={templates}
          selectedTemplate={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Template 1')).toBeInTheDocument();
      expect(screen.getByText('Template 2')).toBeInTheDocument();
      expect(screen.getByText('Template 3')).toBeInTheDocument();
    });

    it('should display template style', () => {
      const template = createMockTemplate({ style: 'classic' });

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('classic')).toBeInTheDocument();
    });
  });

  describe('Style Icons', () => {
    it('should display modern style icon', () => {
      const template = createMockTemplate({ style: 'modern' });

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('✨')).toBeInTheDocument();
    });

    it('should display classic style icon', () => {
      const template = createMockTemplate({ style: 'classic' });

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('📜')).toBeInTheDocument();
    });

    it('should display minimal style icon', () => {
      const template = createMockTemplate({ style: 'minimal' });

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('⚪')).toBeInTheDocument();
    });

    it('should display default icon for unknown style', () => {
      const template = createMockTemplate({ style: 'unknown' as any });

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('📄')).toBeInTheDocument();
    });
  });

  describe('Channel Icons', () => {
    it('should display email channel icon', () => {
      const template = createMockTemplate({
        supported_channels: ['email'],
      });

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('📧')).toBeInTheDocument();
    });

    it('should display multiple channel icons', () => {
      const template = createMockTemplate({
        supported_channels: ['email', 'website', 'social_twitter'],
      });

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('📧')).toBeInTheDocument();
      expect(screen.getByText('🌐')).toBeInTheDocument();
      expect(screen.getByText('🐦')).toBeInTheDocument();
    });

    it('should display all social channel icons', () => {
      const template = createMockTemplate({
        supported_channels: [
          'social_twitter',
          'social_linkedin',
          'social_facebook',
        ] as Channel[],
      });

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('🐦')).toBeInTheDocument();
      expect(screen.getByText('💼')).toBeInTheDocument();
      expect(screen.getByText('👥')).toBeInTheDocument();
    });
  });

  describe('Template Selection', () => {
    it('should highlight selected template', () => {
      const template = createMockTemplate();

      const { container } = render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={template}
          onChange={mockOnChange}
        />
      );

      const templateCard = container.querySelector('.border-blue-500');
      expect(templateCard).toBeInTheDocument();
    });

    it('should show checkmark on selected template', () => {
      const template = createMockTemplate();

      const { container } = render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={template}
          onChange={mockOnChange}
        />
      );

      const svg = container.querySelector('svg.text-blue-600');
      expect(svg).toBeInTheDocument();
    });

    it('should call onChange when template clicked', () => {
      const template = createMockTemplate();

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
        />
      );

      const templateCard = screen.getByText('Modern Newsletter').closest('div');
      fireEvent.click(templateCard!);

      expect(mockOnChange).toHaveBeenCalledWith(template);
    });

    it('should not highlight unselected template', () => {
      const templates = [
        createMockTemplate({ id: 't1', name: 'Template 1' }),
        createMockTemplate({ id: 't2', name: 'Template 2' }),
      ];

      const { container } = render(
        <TemplateSelector
          templates={templates}
          selectedTemplate={templates[0]}
          onChange={mockOnChange}
        />
      );

      // Should have one blue border and at least one gray border
      const blueBorder = container.querySelector('.border-blue-500');
      const grayBorders = container.querySelectorAll('.border-gray-300');
      expect(blueBorder).toBeInTheDocument();
      expect(grayBorders.length).toBeGreaterThan(0);
    });
  });

  describe('Variables Display', () => {
    it('should display variables count', () => {
      const template = createMockTemplate({
        variables: [
          { name: 'title', type: 'string', required: true },
          { name: 'content', type: 'text', required: false },
        ],
      });

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('2 variables')).toBeInTheDocument();
    });

    it('should display singular variable text', () => {
      const template = createMockTemplate({
        variables: [{ name: 'title', type: 'string', required: true }],
      });

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('1 variable')).toBeInTheDocument();
    });

    it('should not display variables count when empty', () => {
      const template = createMockTemplate({ variables: [] });

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.queryByText(/variable/)).not.toBeInTheDocument();
    });
  });

  describe('Channel Filtering', () => {
    it('should filter templates by channel', () => {
      const templates = [
        createMockTemplate({ id: 't1', name: 'Email Only', supported_channels: ['email'] }),
        createMockTemplate({ id: 't2', name: 'Website Only', supported_channels: ['website'] }),
        createMockTemplate({ id: 't3', name: 'Both', supported_channels: ['email', 'website'] }),
      ];

      render(
        <TemplateSelector
          templates={templates}
          selectedTemplate={null}
          onChange={mockOnChange}
          channelFilter={['email']}
        />
      );

      expect(screen.getByText('Email Only')).toBeInTheDocument();
      expect(screen.getByText('Both')).toBeInTheDocument();
      expect(screen.queryByText('Website Only')).not.toBeInTheDocument();
    });

    it('should show all templates when no filter', () => {
      const templates = [
        createMockTemplate({ id: 't1', name: 'Template 1' }),
        createMockTemplate({ id: 't2', name: 'Template 2' }),
      ];

      render(
        <TemplateSelector
          templates={templates}
          selectedTemplate={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Template 1')).toBeInTheDocument();
      expect(screen.getByText('Template 2')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no templates', () => {
      render(
        <TemplateSelector
          templates={[]}
          selectedTemplate={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('No templates found')).toBeInTheDocument();
      expect(screen.getByText('No templates available')).toBeInTheDocument();
    });

    it('should display channel filter message in empty state', () => {
      render(
        <TemplateSelector
          templates={[]}
          selectedTemplate={null}
          onChange={mockOnChange}
          channelFilter={['email']}
        />
      );

      expect(screen.getByText('No templates support the selected channels')).toBeInTheDocument();
    });

    it('should show empty state icon', () => {
      const { container } = render(
        <TemplateSelector
          templates={[]}
          selectedTemplate={null}
          onChange={mockOnChange}
        />
      );

      const svg = container.querySelector('svg.text-gray-400');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Preview Modal', () => {
    it('should show preview button when preview enabled', () => {
      const template = createMockTemplate({ preview_url: 'https://example.com/preview.jpg' });

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
          showPreview={true}
        />
      );

      expect(screen.getByText('👁 Preview')).toBeInTheDocument();
    });

    it('should not show preview button when preview disabled', () => {
      const template = createMockTemplate({ preview_url: 'https://example.com/preview.jpg' });

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
          showPreview={false}
        />
      );

      expect(screen.queryByText('👁 Preview')).not.toBeInTheDocument();
    });

    it('should open preview modal when preview button clicked', () => {
      const template = createMockTemplate({
        name: 'Test Template',
        preview_url: 'https://example.com/preview.jpg',
      });

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
          showPreview={true}
        />
      );

      fireEvent.click(screen.getByText('👁 Preview'));

      // Modal should be open with template name in header
      const modalHeaders = screen.getAllByText('Test Template');
      expect(modalHeaders.length).toBeGreaterThan(1); // One in grid, one in modal
    });

    it('should open preview modal when template clicked with preview enabled', () => {
      const template = createMockTemplate({ name: 'Clickable Template' });

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
          showPreview={true}
        />
      );

      const templateCard = screen.getByText('Clickable Template').closest('div');
      fireEvent.click(templateCard!);

      // Modal should be open
      const modalHeaders = screen.getAllByText('Clickable Template');
      expect(modalHeaders.length).toBeGreaterThan(1);
    });

    it('should close preview modal when close button clicked', () => {
      const template = createMockTemplate({ name: 'Closable Template' });

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
          showPreview={true}
        />
      );

      // Open modal
      const templateCard = screen.getByText('Closable Template').closest('div');
      fireEvent.click(templateCard!);

      // Close modal
      fireEvent.click(screen.getByText('Close'));

      // Modal should be closed
      const modalHeaders = screen.queryAllByText('Closable Template');
      expect(modalHeaders.length).toBe(1); // Only in grid, not in modal
    });

    it('should close preview modal when backdrop clicked', () => {
      const template = createMockTemplate({ name: 'Backdrop Template' });

      const { container } = render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
          showPreview={true}
        />
      );

      // Open modal
      const templateCard = screen.getByText('Backdrop Template').closest('div');
      fireEvent.click(templateCard!);

      // Click backdrop (fixed inset-0 is the backdrop)
      const backdrop = container.querySelector('.fixed.inset-0');
      fireEvent.click(backdrop!);

      // Modal should be closed
      const modalHeaders = screen.queryAllByText('Backdrop Template');
      expect(modalHeaders.length).toBe(1);
    });

    it('should display template details in modal', () => {
      const template = createMockTemplate({
        id: 'test-123',
        name: 'Detail Template',
        description: 'Detailed description',
        style: 'modern',
      });

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
          showPreview={true}
        />
      );

      // Open modal
      const templateCard = screen.getByText('Detail Template').closest('div');
      fireEvent.click(templateCard!);

      // Check modal content (description should be visible)
      expect(screen.getAllByText('Detailed description').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Detail Template').length).toBeGreaterThan(1);
    });

    it('should display template variables in modal', () => {
      const template = createMockTemplate({
        variables: [
          {
            name: 'title',
            type: 'string',
            required: true,
            description: 'The title',
          },
          {
            name: 'content',
            type: 'text',
            required: false,
            default_value: 'Default content',
          },
        ],
      });

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
          showPreview={true}
        />
      );

      // Open modal
      const templateCard = screen.getByText('Modern Newsletter').closest('div');
      fireEvent.click(templateCard!);

      // Check variable details
      expect(screen.getByText('title')).toBeInTheDocument();
      expect(screen.getByText('content')).toBeInTheDocument();
      expect(screen.getByText('The title')).toBeInTheDocument();
      expect(screen.getByText('Required')).toBeInTheDocument();
      expect(screen.getByText('Default: "Default content"')).toBeInTheDocument();
    });

    it('should call onChange when Select Template clicked in modal', () => {
      const template = createMockTemplate();

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
          showPreview={true}
        />
      );

      // Open modal
      const templateCard = screen.getByText('Modern Newsletter').closest('div');
      fireEvent.click(templateCard!);

      // Click Select Template button
      fireEvent.click(screen.getByText('Select Template'));

      expect(mockOnChange).toHaveBeenCalledWith(template);
    });

    it('should close modal after selecting template from modal', () => {
      const template = createMockTemplate({ name: 'Select Me' });

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
          showPreview={true}
        />
      );

      // Open modal
      const templateCard = screen.getByText('Select Me').closest('div');
      fireEvent.click(templateCard!);

      // Select template from modal
      fireEvent.click(screen.getByText('Select Template'));

      // Modal should be closed
      const modalHeaders = screen.queryAllByText('Select Me');
      expect(modalHeaders.length).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should not show preview button without preview_url', () => {
      const template = createMockTemplate({ preview_url: undefined });

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
          showPreview={true}
        />
      );

      expect(screen.queryByText('👁 Preview')).not.toBeInTheDocument();
    });

    it('should stop propagation when preview button clicked', () => {
      const template = createMockTemplate({ preview_url: 'https://example.com/preview.jpg' });

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
          showPreview={true}
        />
      );

      // Click preview button (should not trigger template selection due to stopPropagation)
      mockOnChange.mockClear();
      fireEvent.click(screen.getByText('👁 Preview'));

      // onChange should NOT have been called (stopPropagation prevents template click)
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should handle variable without description', () => {
      const template = createMockTemplate({
        variables: [
          { name: 'test', type: 'string', required: false },
        ],
      });

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
          showPreview={true}
        />
      );

      // Open modal
      const templateCard = screen.getByText('Modern Newsletter').closest('div');
      fireEvent.click(templateCard!);

      expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('should handle variable without default value', () => {
      const template = createMockTemplate({
        variables: [
          { name: 'nodefault', type: 'string', required: true },
        ],
      });

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplate={null}
          onChange={mockOnChange}
          showPreview={true}
        />
      );

      // Open modal
      const templateCard = screen.getByText('Modern Newsletter').closest('div');
      fireEvent.click(templateCard!);

      expect(screen.queryByText(/Default:/)).not.toBeInTheDocument();
    });
  });
});
