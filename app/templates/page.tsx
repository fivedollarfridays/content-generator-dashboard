'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TemplateSelector from '@/app/components/features/template-selector';
import type { Template, Channel } from '@/types/content-generator';

/**
 * Templates Page
 * Browse and manage content generation templates
 *
 * Features:
 * - Template browsing with preview
 * - Filter by channel compatibility
 * - Search templates by name/description
 * - Navigate to generate page with selected template
 *
 * @returns Templates page component
 */
const TemplatesPage = (): React.ReactElement => {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [channelFilter, setChannelFilter] = useState<Channel[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Get API configuration from environment
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  /**
   * Fetch templates from API
   * TODO: Replace with actual API call when endpoint is available
   */
  useEffect(() => {
    const fetchTemplates = async (): Promise<void> => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`${API_URL}/api/templates`);
        // const data = await response.json();
        // setTemplates(data.templates);

        // Mock data for now
        const mockTemplates: Template[] = [
          {
            id: 'modern-email-1',
            name: 'Modern Email Newsletter',
            description:
              'Clean, modern email template with responsive design and engaging layout',
            style: 'modern',
            supported_channels: ['email'],
            preview_url:
              'https://via.placeholder.com/600x400?text=Modern+Email',
            variables: [
              {
                name: 'title',
                type: 'string',
                required: true,
                description: 'Newsletter title',
              },
              {
                name: 'subtitle',
                type: 'string',
                required: false,
                description: 'Optional subtitle',
              },
            ],
          },
          {
            id: 'classic-blog-1',
            name: 'Classic Blog Post',
            description:
              'Traditional blog post template with timeless typography',
            style: 'classic',
            supported_channels: ['website'],
            preview_url:
              'https://via.placeholder.com/600x400?text=Classic+Blog',
          },
          {
            id: 'minimal-social-1',
            name: 'Minimal Social Media',
            description: 'Clean, minimal design optimized for social platforms',
            style: 'minimal',
            supported_channels: [
              'social_twitter',
              'social_linkedin',
              'social_facebook',
            ],
            preview_url:
              'https://via.placeholder.com/600x400?text=Minimal+Social',
          },
          {
            id: 'modern-website-1',
            name: 'Modern Website Article',
            description: 'Contemporary web article with rich media support',
            style: 'modern',
            supported_channels: ['website'],
            preview_url:
              'https://via.placeholder.com/600x400?text=Modern+Website',
          },
          {
            id: 'classic-email-1',
            name: 'Classic Email Announcement',
            description: 'Professional email template for announcements',
            style: 'classic',
            supported_channels: ['email'],
            preview_url:
              'https://via.placeholder.com/600x400?text=Classic+Email',
          },
        ];

        setTemplates(mockTemplates);
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [API_URL]);

  /**
   * Handle template selection
   */
  const handleTemplateChange = useCallback((template: Template): void => {
    setSelectedTemplate(template);
  }, []);

  /**
   * Use selected template for content generation
   */
  const useTemplate = useCallback((): void => {
    if (selectedTemplate) {
      // Navigate to generate page with template pre-selected
      router.push(
        `/generate?template=${selectedTemplate.id}&style=${selectedTemplate.style}`
      );
    }
  }, [selectedTemplate, router]);

  /**
   * Toggle channel filter
   */
  const toggleChannelFilter = useCallback((channel: Channel): void => {
    setChannelFilter(prev =>
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  }, []);

  /**
   * Filter templates by search query
   */
  const filteredTemplates = templates.filter(
    template =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableChannels: { value: Channel; label: string; icon: string }[] = [
    { value: 'email', label: 'Email', icon: '📧' },
    { value: 'website', label: 'Website', icon: '🌐' },
    { value: 'social_twitter', label: 'Twitter', icon: '🐦' },
    { value: 'social_linkedin', label: 'LinkedIn', icon: '💼' },
    { value: 'social_facebook', label: 'Facebook', icon: '👥' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Content Templates
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Browse and select templates for your content generation
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Search Templates
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name or description..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Channel Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Channel
            </label>
            <div className="flex flex-wrap gap-2">
              {availableChannels.map(channel => (
                <button
                  key={channel.value}
                  onClick={() => toggleChannelFilter(channel.value)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    channelFilter.includes(channel.value)
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <span className="mr-2">{channel.icon}</span>
                  {channel.label}
                </button>
              ))}
              {channelFilter.length > 0 && (
                <button
                  onClick={() => setChannelFilter([])}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No templates found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <TemplateSelector
            templates={filteredTemplates}
            selectedTemplate={selectedTemplate || undefined}
            onChange={handleTemplateChange}
            showPreview={true}
            channelFilter={channelFilter.length > 0 ? channelFilter : undefined}
          />
        )}

        {/* Selected Template Action */}
        {selectedTemplate && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Selected Template: {selectedTemplate.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedTemplate.description}
                </p>
              </div>
              <button
                onClick={useTemplate}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition-colors"
              >
                Use This Template →
              </button>
            </div>
          </div>
        )}

        {/* Template Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Total Templates
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {templates.length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Filtered Results
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {filteredTemplates.length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Active Filters
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {channelFilter.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;
