'use client';

import React from 'react';
import ContentGeneratorHealth from '@/app/components/features/content-generator-health';

/**
 * Dashboard Page
 * Main dashboard view showing system health and metrics
 */
const DashboardPage = (): React.ReactElement => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Content Generator Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Monitor system health, manage content generation, and view analytics
          </p>
        </div>

        {/* Health Status Section */}
        <div className="mb-8">
          <ContentGeneratorHealth
            apiUrl={API_URL}
            refreshInterval={30000} // Refresh every 30 seconds
            onStatusChange={status => {
              console.log('Health status changed:', status);
              // You can add custom logic here (e.g., show notifications)
            }}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Generate Content
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Create new AI-powered content for your campaigns
            </p>
            <a
              href="/generate"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Start Generating
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              View Jobs
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Monitor active and completed content generation jobs
            </p>
            <a
              href="/jobs"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View Jobs
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Templates
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Browse and manage content generation templates
            </p>
            <a
              href="/templates"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Browse Templates
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
