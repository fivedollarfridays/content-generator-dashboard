/**
 * Campaigns Page
 * Campaign management and planning interface
 */

'use client';

import React, { useState, useMemo } from 'react';
import type { Campaign, CampaignStatus } from '@/types/campaigns';
import { generateMockCampaigns } from '@/lib/utils/mock-campaigns';
import { format } from 'date-fns';

const CampaignsPage = (): React.ReactElement => {
  const [campaigns] = useState<Campaign[]>(generateMockCampaigns());
  const [selectedStatus, setSelectedStatus] = useState<CampaignStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      // Status filter
      if (selectedStatus !== 'all' && campaign.status !== selectedStatus) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          campaign.name.toLowerCase().includes(query) ||
          campaign.description.toLowerCase().includes(query) ||
          campaign.tags?.some(tag => tag.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [campaigns, selectedStatus, searchQuery]);

  const getStatusColor = (status: CampaignStatus): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'archived':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const statuses: Array<{ value: CampaignStatus | 'all'; label: string }> = [
    { value: 'all', label: 'All Campaigns' },
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
            <p className="mt-2 text-sm text-gray-600">
              Plan, schedule, and track multi-channel content campaigns
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Campaign</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="space-y-4">
            {/* Search */}
            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search campaigns by name, description, or tags..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              {statuses.map(status => (
                <button
                  key={status.value}
                  onClick={() => setSelectedStatus(status.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === status.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>

            {/* Results Count */}
            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {filteredCampaigns.length} of {campaigns.length} campaigns
              </p>
            </div>
          </div>
        </div>

        {/* Campaign List */}
        <div className="space-y-4">
          {filteredCampaigns.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-lg font-medium text-gray-900">No campaigns found</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchQuery || selectedStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first campaign to get started'}
              </p>
            </div>
          ) : (
            filteredCampaigns.map(campaign => (
              <div
                key={campaign.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer"
              >
                {/* Campaign Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {campaign.name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          campaign.status
                        )}`}
                      >
                        {campaign.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{campaign.description}</p>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Campaign Dates */}
                <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>
                      {format(new Date(campaign.startDate), 'MMM d, yyyy')} -{' '}
                      {format(new Date(campaign.endDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span>{campaign.tags?.join(', ')}</span>
                  </div>
                </div>

                {/* Metrics Grid */}
                {campaign.metrics && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Batches</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {campaign.metrics.completedBatches}/{campaign.metrics.totalBatches}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Success Rate</p>
                      <p className="text-lg font-semibold text-green-600">
                        {campaign.metrics.successRate.toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Goals</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {campaign.metrics.goalsAchieved}/{campaign.metrics.totalGoals}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Total Jobs</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {campaign.metrics.totalJobs}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Sources</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {campaign.sources.length}
                      </p>
                    </div>
                  </div>
                )}

                {/* Content Sources Preview */}
                <div className="mt-4 flex items-center space-x-2">
                  <span className="text-xs text-gray-600">Content Sources:</span>
                  <div className="flex items-center space-x-1">
                    {campaign.sources.slice(0, 3).map(source => (
                      <span
                        key={source.id}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                        title={source.name}
                      >
                        {source.type}
                      </span>
                    ))}
                    {campaign.sources.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{campaign.sources.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignsPage;
