/**
 * FilterPresets Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FilterPresets } from '../filter-presets';
import type { JobFilterState } from '@/types/content-generator';
import type { FilterPreset } from '@/types/preferences';

// Mock PreferencesContext
const mockAddFilterPreset = jest.fn();
const mockRemoveFilterPreset = jest.fn();
const mockPreferences = {
  filterPresets: [] as FilterPreset[],
  notifications: {
    enabled: true,
    onSuccess: true,
    onFailure: true,
    onPartial: true,
    realTimeUpdates: false,
  },
  display: {
    tableDensity: 'comfortable' as const,
    refreshInterval: 30000,
    pageSize: 20,
    showTimestamps: true,
    showChannelIcons: true,
  },
  theme: 'light' as const,
};

jest.mock('@/app/context/preferences-context', () => ({
  usePreferences: () => ({
    preferences: mockPreferences,
    addFilterPreset: mockAddFilterPreset,
    removeFilterPreset: mockRemoveFilterPreset,
    updateNotificationPreferences: jest.fn(),
    updateDisplayPreferences: jest.fn(),
    setTheme: jest.fn(),
  }),
}));

describe('FilterPresets', () => {
  const mockCurrentFilters: JobFilterState = {
    search: '',
    status: 'all',
    channels: [],
    dateRange: { from: '', to: '' },
  };

  const mockOnApplyPreset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockPreferences.filterPresets = [];
    // Mock window.alert
    window.alert = jest.fn();
  });

  // ========== Rendering Tests ==========

  describe('Rendering', () => {
    it('should render filter presets header', () => {
      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      expect(screen.getByText('Filter Presets')).toBeInTheDocument();
      expect(screen.getByText('Save Current')).toBeInTheDocument();
    });

    it('should display preset count when presets exist', () => {
      mockPreferences.filterPresets = [
        {
          id: 'preset-1',
          name: 'Test Preset',
          filters: mockCurrentFilters,
          createdAt: '2025-10-07T00:00:00.000Z',
        },
        {
          id: 'preset-2',
          name: 'Another Preset',
          filters: mockCurrentFilters,
          createdAt: '2025-10-07T00:00:00.000Z',
        },
      ];

      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      expect(screen.getByText('(2)')).toBeInTheDocument();
    });

    it('should not show expand button when no presets exist', () => {
      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const expandButton = screen.queryByLabelText(/expand presets/i);
      expect(expandButton).not.toBeInTheDocument();
    });

    it('should show empty state when expanded with no presets', () => {
      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const saveButton = screen.getByText('Save Current');
      fireEvent.click(saveButton);

      expect(screen.getByText('Save Filter Preset')).toBeInTheDocument();
    });
  });

  // ========== Empty State Tests ==========

  describe('Empty State', () => {
    it('should display empty state when expanded with no presets', () => {
      mockPreferences.filterPresets = [];

      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      // Since there are no presets, clicking save should open the dialog
      const saveButton = screen.getByText('Save Current');
      expect(saveButton).toBeInTheDocument();
    });
  });

  // ========== Preset List Tests ==========

  describe('Preset List', () => {
    beforeEach(() => {
      mockPreferences.filterPresets = [
        {
          id: 'preset-1',
          name: 'Failed Jobs',
          filters: { ...mockCurrentFilters, status: 'failed' },
          createdAt: '2025-10-07T00:00:00.000Z',
        },
        {
          id: 'preset-2',
          name: 'Email Jobs',
          filters: { ...mockCurrentFilters, channels: ['email'] },
          createdAt: '2025-10-06T00:00:00.000Z',
        },
      ];
    });

    it('should display preset list when expanded', () => {
      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const expandButton = screen.getByLabelText(/expand presets/i);
      fireEvent.click(expandButton);

      expect(screen.getByText('Failed Jobs')).toBeInTheDocument();
      expect(screen.getByText('Email Jobs')).toBeInTheDocument();
    });

    it('should collapse preset list when clicking collapse button', () => {
      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const expandButton = screen.getByLabelText(/expand presets/i);
      fireEvent.click(expandButton);

      expect(screen.getByText('Failed Jobs')).toBeInTheDocument();

      const collapseButton = screen.getByLabelText(/collapse presets/i);
      fireEvent.click(collapseButton);

      expect(screen.queryByText('Failed Jobs')).not.toBeInTheDocument();
    });

    it('should format preset creation dates correctly', () => {
      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const expandButton = screen.getByLabelText(/expand presets/i);
      fireEvent.click(expandButton);

      // Check that both presets show creation dates (exact date may vary by timezone)
      const dateElements = screen.getAllByText(/Created .+, 2025/);
      expect(dateElements).toHaveLength(2);
    });
  });

  // ========== Save Functionality Tests ==========

  describe('Save Functionality', () => {
    it('should open save dialog when clicking Save Current button', () => {
      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const saveButton = screen.getByText('Save Current');
      fireEvent.click(saveButton);

      expect(screen.getByText('Save Filter Preset')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/e.g., Failed Jobs Last Week/i)
      ).toBeInTheDocument();
    });

    it('should save preset with valid name', async () => {
      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const saveButton = screen.getByText('Save Current');
      fireEvent.click(saveButton);

      const nameInput = screen.getByPlaceholderText(
        /e.g., Failed Jobs Last Week/i
      );
      fireEvent.change(nameInput, { target: { value: 'New Preset' } });

      const savePresetButton = screen.getByRole('button', {
        name: /Save Preset/i,
      });
      fireEvent.click(savePresetButton);

      await waitFor(() => {
        expect(mockAddFilterPreset).toHaveBeenCalledWith({
          name: 'New Preset',
          filters: mockCurrentFilters,
          createdAt: expect.any(String),
        });
      });
    });

    it('should trim whitespace from preset name', async () => {
      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const saveButton = screen.getByText('Save Current');
      fireEvent.click(saveButton);

      const nameInput = screen.getByPlaceholderText(
        /e.g., Failed Jobs Last Week/i
      );
      fireEvent.change(nameInput, { target: { value: '  Trimmed Name  ' } });

      const savePresetButton = screen.getByRole('button', {
        name: /Save Preset/i,
      });
      fireEvent.click(savePresetButton);

      await waitFor(() => {
        expect(mockAddFilterPreset).toHaveBeenCalledWith({
          name: 'Trimmed Name',
          filters: mockCurrentFilters,
          createdAt: expect.any(String),
        });
      });
    });

    it('should not save preset with empty name', () => {
      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const saveButton = screen.getByText('Save Current');
      fireEvent.click(saveButton);

      const savePresetButton = screen.getByRole('button', {
        name: /Save Preset/i,
      });
      expect(savePresetButton).toBeDisabled();
    });

    it('should show alert when saving duplicate preset name', () => {
      mockPreferences.filterPresets = [
        {
          id: 'preset-1',
          name: 'Existing Preset',
          filters: mockCurrentFilters,
          createdAt: '2025-10-07T00:00:00.000Z',
        },
      ];

      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const saveButton = screen.getByText('Save Current');
      fireEvent.click(saveButton);

      const nameInput = screen.getByPlaceholderText(
        /e.g., Failed Jobs Last Week/i
      );
      fireEvent.change(nameInput, { target: { value: 'Existing Preset' } });

      const savePresetButton = screen.getByRole('button', {
        name: /Save Preset/i,
      });
      fireEvent.click(savePresetButton);

      expect(window.alert).toHaveBeenCalledWith(
        'A preset with this name already exists'
      );
      expect(mockAddFilterPreset).not.toHaveBeenCalled();
    });

    it('should check for duplicate names case-insensitively', () => {
      mockPreferences.filterPresets = [
        {
          id: 'preset-1',
          name: 'Test Preset',
          filters: mockCurrentFilters,
          createdAt: '2025-10-07T00:00:00.000Z',
        },
      ];

      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const saveButton = screen.getByText('Save Current');
      fireEvent.click(saveButton);

      const nameInput = screen.getByPlaceholderText(
        /e.g., Failed Jobs Last Week/i
      );
      fireEvent.change(nameInput, { target: { value: 'TEST PRESET' } });

      const savePresetButton = screen.getByRole('button', {
        name: /Save Preset/i,
      });
      fireEvent.click(savePresetButton);

      expect(window.alert).toHaveBeenCalledWith(
        'A preset with this name already exists'
      );
    });

    it('should close dialog when clicking Cancel button', () => {
      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const saveButton = screen.getByText('Save Current');
      fireEvent.click(saveButton);

      expect(screen.getByText('Save Filter Preset')).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(screen.queryByText('Save Filter Preset')).not.toBeInTheDocument();
    });

    it('should close dialog when pressing Escape key', () => {
      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const saveButton = screen.getByText('Save Current');
      fireEvent.click(saveButton);

      const nameInput = screen.getByPlaceholderText(
        /e.g., Failed Jobs Last Week/i
      );
      fireEvent.keyDown(nameInput, { key: 'Escape' });

      expect(screen.queryByText('Save Filter Preset')).not.toBeInTheDocument();
    });

    it('should save preset when pressing Enter key with valid name', async () => {
      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const saveButton = screen.getByText('Save Current');
      fireEvent.click(saveButton);

      const nameInput = screen.getByPlaceholderText(
        /e.g., Failed Jobs Last Week/i
      );
      fireEvent.change(nameInput, { target: { value: 'Quick Save' } });
      fireEvent.keyDown(nameInput, { key: 'Enter' });

      await waitFor(() => {
        expect(mockAddFilterPreset).toHaveBeenCalledWith({
          name: 'Quick Save',
          filters: mockCurrentFilters,
          createdAt: expect.any(String),
        });
      });
    });
  });

  // ========== Apply Functionality Tests ==========

  describe('Apply Functionality', () => {
    beforeEach(() => {
      mockPreferences.filterPresets = [
        {
          id: 'preset-1',
          name: 'Failed Jobs',
          filters: { ...mockCurrentFilters, status: 'failed' },
          createdAt: '2025-10-07T00:00:00.000Z',
        },
      ];
    });

    it('should apply preset when clicking apply button', () => {
      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const expandButton = screen.getByLabelText(/expand presets/i);
      fireEvent.click(expandButton);

      const applyButton = screen.getByTitle(/Apply this preset/i);
      fireEvent.click(applyButton);

      expect(mockOnApplyPreset).toHaveBeenCalledWith({
        ...mockCurrentFilters,
        status: 'failed',
      });
    });

    it('should not show apply button for active preset', () => {
      const activeFilters: JobFilterState = {
        ...mockCurrentFilters,
        status: 'failed',
      };

      render(
        <FilterPresets
          currentFilters={activeFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const expandButton = screen.getByLabelText(/expand presets/i);
      fireEvent.click(expandButton);

      const applyButton = screen.queryByTitle(/Apply this preset/i);
      expect(applyButton).not.toBeInTheDocument();
    });

    it('should show active indicator for current preset', () => {
      const activeFilters: JobFilterState = {
        ...mockCurrentFilters,
        status: 'failed',
      };

      render(
        <FilterPresets
          currentFilters={activeFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const expandButton = screen.getByLabelText(/expand presets/i);
      fireEvent.click(expandButton);

      expect(screen.getByText('(active)')).toBeInTheDocument();
    });
  });

  // ========== Delete Functionality Tests ==========

  describe('Delete Functionality', () => {
    beforeEach(() => {
      mockPreferences.filterPresets = [
        {
          id: 'preset-1',
          name: 'To Delete',
          filters: mockCurrentFilters,
          createdAt: '2025-10-07T00:00:00.000Z',
        },
      ];
    });

    it('should show confirmation buttons when clicking delete', () => {
      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const expandButton = screen.getByLabelText(/expand presets/i);
      fireEvent.click(expandButton);

      const deleteButton = screen.getByTitle(/Delete preset/i);
      fireEvent.click(deleteButton);

      expect(screen.getByText('Confirm')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should delete preset when clicking Confirm button', () => {
      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const expandButton = screen.getByLabelText(/expand presets/i);
      fireEvent.click(expandButton);

      const deleteButton = screen.getByTitle(/Delete preset/i);
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);

      expect(mockRemoveFilterPreset).toHaveBeenCalledWith('preset-1');
    });

    it('should cancel delete when clicking Cancel button', () => {
      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const expandButton = screen.getByLabelText(/expand presets/i);
      fireEvent.click(expandButton);

      const deleteButton = screen.getByTitle(/Delete preset/i);
      fireEvent.click(deleteButton);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockRemoveFilterPreset).not.toHaveBeenCalled();
      expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
    });
  });

  // ========== Rename Functionality Tests ==========

  describe('Rename Functionality', () => {
    beforeEach(() => {
      mockPreferences.filterPresets = [
        {
          id: 'preset-1',
          name: 'Original Name',
          filters: mockCurrentFilters,
          createdAt: '2025-10-07T00:00:00.000Z',
        },
        {
          id: 'preset-2',
          name: 'Another Preset',
          filters: mockCurrentFilters,
          createdAt: '2025-10-06T00:00:00.000Z',
        },
      ];
    });

    it('should show input field when clicking edit button', () => {
      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const expandButton = screen.getByLabelText(/expand presets/i);
      fireEvent.click(expandButton);

      const editButtons = screen.getAllByTitle(/Rename preset/i);
      fireEvent.click(editButtons[0]);

      const input = screen.getByDisplayValue('Original Name');
      expect(input).toBeInTheDocument();
      expect(input).toHaveFocus();
    });

    it('should rename preset when pressing Enter with valid name', async () => {
      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const expandButton = screen.getByLabelText(/expand presets/i);
      fireEvent.click(expandButton);

      const editButtons = screen.getAllByTitle(/Rename preset/i);
      fireEvent.click(editButtons[0]);

      const input = screen.getByDisplayValue('Original Name');
      fireEvent.change(input, { target: { value: 'New Name' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(mockRemoveFilterPreset).toHaveBeenCalledWith('preset-1');
        expect(mockAddFilterPreset).toHaveBeenCalledWith({
          name: 'New Name',
          filters: mockCurrentFilters,
          createdAt: '2025-10-07T00:00:00.000Z',
        });
      });
    });

    it('should rename preset when input loses focus', async () => {
      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const expandButton = screen.getByLabelText(/expand presets/i);
      fireEvent.click(expandButton);

      const editButtons = screen.getAllByTitle(/Rename preset/i);
      fireEvent.click(editButtons[0]);

      const input = screen.getByDisplayValue('Original Name');
      fireEvent.change(input, { target: { value: 'Renamed' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(mockRemoveFilterPreset).toHaveBeenCalledWith('preset-1');
        expect(mockAddFilterPreset).toHaveBeenCalledWith({
          name: 'Renamed',
          filters: mockCurrentFilters,
          createdAt: '2025-10-07T00:00:00.000Z',
        });
      });
    });

    it('should cancel rename when pressing Escape', () => {
      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const expandButton = screen.getByLabelText(/expand presets/i);
      fireEvent.click(expandButton);

      const editButtons = screen.getAllByTitle(/Rename preset/i);
      fireEvent.click(editButtons[0]);

      const input = screen.getByDisplayValue('Original Name');
      fireEvent.change(input, { target: { value: 'Should Not Save' } });
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(mockRemoveFilterPreset).not.toHaveBeenCalled();
      expect(mockAddFilterPreset).not.toHaveBeenCalled();
    });

    it('should show alert when renaming to duplicate name', () => {
      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const expandButton = screen.getByLabelText(/expand presets/i);
      fireEvent.click(expandButton);

      const editButtons = screen.getAllByTitle(/Rename preset/i);
      fireEvent.click(editButtons[0]);

      const input = screen.getByDisplayValue('Original Name');
      fireEvent.change(input, { target: { value: 'Another Preset' } });
      fireEvent.blur(input);

      expect(window.alert).toHaveBeenCalledWith(
        'A preset with this name already exists'
      );
      expect(mockRemoveFilterPreset).not.toHaveBeenCalled();
    });

    it('should trim whitespace when renaming', async () => {
      render(
        <FilterPresets
          currentFilters={mockCurrentFilters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const expandButton = screen.getByLabelText(/expand presets/i);
      fireEvent.click(expandButton);

      const editButtons = screen.getAllByTitle(/Rename preset/i);
      fireEvent.click(editButtons[0]);

      const input = screen.getByDisplayValue('Original Name');
      fireEvent.change(input, { target: { value: '  Trimmed Name  ' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(mockAddFilterPreset).toHaveBeenCalledWith({
          name: 'Trimmed Name',
          filters: mockCurrentFilters,
          createdAt: '2025-10-07T00:00:00.000Z',
        });
      });
    });
  });

  // ========== Active Preset Detection Tests ==========

  describe('Active Preset Detection', () => {
    it('should detect active preset by deep equality', () => {
      const filters: JobFilterState = {
        search: 'test',
        status: 'completed',
        channels: ['email', 'website'],
        dateRange: { from: '2025-10-01', to: '2025-10-07' },
      };

      mockPreferences.filterPresets = [
        {
          id: 'preset-1',
          name: 'Complex Filter',
          filters: filters,
          createdAt: '2025-10-07T00:00:00.000Z',
        },
      ];

      render(
        <FilterPresets
          currentFilters={filters}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const expandButton = screen.getByLabelText(/expand presets/i);
      fireEvent.click(expandButton);

      expect(screen.getByText('(active)')).toBeInTheDocument();
    });

    it('should not mark preset as active when filters differ', () => {
      mockPreferences.filterPresets = [
        {
          id: 'preset-1',
          name: 'Failed Jobs',
          filters: { ...mockCurrentFilters, status: 'failed' },
          createdAt: '2025-10-07T00:00:00.000Z',
        },
      ];

      render(
        <FilterPresets
          currentFilters={{ ...mockCurrentFilters, status: 'completed' }}
          onApplyPreset={mockOnApplyPreset}
        />
      );

      const expandButton = screen.getByLabelText(/expand presets/i);
      fireEvent.click(expandButton);

      expect(screen.queryByText('(active)')).not.toBeInTheDocument();
    });
  });
});
