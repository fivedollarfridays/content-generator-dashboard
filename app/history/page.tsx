/**
 * History Page
 * Chronological timeline view of all job history
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ContentGeneratorAPI } from '@/lib/api/api-client';
import type { SyncJob, JobStatus } from '@/types/content-generator';
import { toast } from 'react-hot-toast';

// Code splitting: Dynamically import timeline components
const JobTimeline = dynamic(
  () => import('@/app/components/features/job-timeline'),
  {
    loading: () => (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-200 rounded"></div>
        ))}
      </div>
    ),
  }
);

const JobDetailModal = dynamic(
  () => import('@/app/components/features/job-detail-modal'),
  { ssr: false }
);

const HistoryPage = (): React.ReactElement => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const [jobs, setJobs] = useState<SyncJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<SyncJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<SyncJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');

  const pageSize = 20;

  // Load API key from localStorage
  useEffect(() => {
    const storedKey = localStorage.getItem('api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  // Fetch all jobs (using mock data)
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);

      // Use mock data for development/testing
      const { mockDataStore } = await import('@/lib/utils/mock-data-generator');
      const mockJobs = mockDataStore.getJobs(500);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      setJobs(mockJobs);
      setFilteredJobs(mockJobs);

      /* Uncomment when backend API is ready:
      const api = new ContentGeneratorAPI(API_URL, apiKey);
      const response = await api.listJobs({ limit: 500 });

      if (response.success && response.data) {
        const sortedJobs = response.data.jobs.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setJobs(sortedJobs);
        setFilteredJobs(sortedJobs);
      } else {
        toast.error('Failed to load job history');
      }
      */
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      toast.error('Error loading job history');
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Apply filters
  useEffect(() => {
    let filtered = jobs;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        job =>
          job.job_id.toLowerCase().includes(query) ||
          job.document_id.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    setFilteredJobs(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, statusFilter, jobs]);

  const handleJobClick = (job: SyncJob): void => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleRetry = async (jobId: string): Promise<void> => {
    if (!apiKey) {
      toast.error('No API key available');
      return;
    }

    try {
      const api = new ContentGeneratorAPI(API_URL, apiKey);
      const response = await api.retryJob(jobId);

      if (response.success) {
        toast.success('Job retried successfully');
        fetchJobs(); // Refresh jobs
      } else {
        toast.error(response.error?.message || 'Failed to retry job');
      }
    } catch (err) {
      toast.error('Error retrying job');
    }
  };

  const handleCancel = async (jobId: string): Promise<void> => {
    if (!apiKey) {
      toast.error('No API key available');
      return;
    }

    try {
      const api = new ContentGeneratorAPI(API_URL, apiKey);
      const response = await api.cancelJob(jobId);

      if (response.success) {
        toast.success('Job cancelled successfully');
        fetchJobs(); // Refresh jobs
      } else {
        toast.error(response.error?.message || 'Failed to cancel job');
      }
    } catch (err) {
      toast.error('Error cancelling job');
    }
  };

  const statuses: Array<{ value: JobStatus | 'all'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'partial', label: 'Partial' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job History</h1>
          <p className="mt-2 text-sm text-gray-600">
            Chronological view of all content generation jobs
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by job ID or document ID..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {statuses.map(status => (
                  <button
                    key={status.value}
                    onClick={() => setStatusFilter(status.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === status.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {filteredJobs.length} of {jobs.length} jobs
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <JobTimeline
              jobs={filteredJobs}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onJobClick={handleJobClick}
            />
          )}
        </div>

        {/* Job Detail Modal */}
        <JobDetailModal
          job={selectedJob}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onRetry={handleRetry}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default HistoryPage;
