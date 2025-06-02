'use client';

import { useState, useEffect } from 'react';

// Force dynamic rendering to prevent build-time issues
export const dynamic = 'force-dynamic';

interface ProcessingStats {
  total_content: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  total_questions_generated: number;
  avg_processing_time_hours: number;
}

interface SystemHealth {
  api_status: 'healthy' | 'warning' | 'error';
  queue_length: number;
  last_successful_processing?: string;
}

interface ProcessingJob {
  id: string;
  content_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  error_message?: string;
}

interface ProcessingOverview {
  stats: ProcessingStats;
  recent_jobs: ProcessingJob[];
  system_health: SystemHealth;
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<ProcessingOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/process?action=stats');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }
      
      const data = await response.json();
      setOverview(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const processAllPending = async () => {
    try {
      const response = await fetch('/api/process?action=process-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        await fetchStats(); // Refresh stats
        alert('Processing started for all pending content');
      } else {
        throw new Error('Failed to start processing');
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const cleanupStuck = async () => {
    try {
      const response = await fetch('/api/process?action=cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        await fetchStats(); // Refresh stats
        alert('Cleanup completed');
      } else {
        throw new Error('Failed to cleanup');
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !overview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!overview) {
    return null;
  }

  const stats = overview.stats;
  const health = overview.system_health;
  const completionRate = stats.total_content > 0 ? (stats.completed / stats.total_content) * 100 : 0;
  const failureRate = stats.total_content > 0 ? (stats.failed / stats.total_content) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Stoke Content Processing Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">System Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-4xl mb-2 ${health.api_status === 'healthy' ? 'text-green-500' : health.api_status === 'warning' ? 'text-yellow-500' : 'text-red-500'}`}>
                {health.api_status === 'healthy' ? '✅' : health.api_status === 'warning' ? '⚠️' : '❌'}
              </div>
              <p className="font-medium">Gemini API</p>
              <p className="text-sm text-gray-600">
                {health.api_status === 'healthy' ? 'Healthy' : health.api_status === 'warning' ? 'Warning' : 'Error'}
              </p>
            </div>
            
            <div className="text-center">
              <div className={`text-4xl mb-2 ${health.queue_length === 0 ? 'text-green-500' : health.queue_length < 10 ? 'text-yellow-500' : 'text-red-500'}`}>
                📋
              </div>
              <p className="font-medium">Queue Length</p>
              <p className="text-sm text-gray-600">{health.queue_length} items</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-2 text-blue-500">🕒</div>
              <p className="font-medium">Last Success</p>
              <p className="text-sm text-gray-600">
                {health.last_successful_processing ? new Date(health.last_successful_processing).toLocaleString() : 'Never'}
              </p>
            </div>
          </div>
        </div>

        {/* Processing Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-6">Content Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl text-blue-500 mr-4">📊</div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.total_content.toLocaleString()}</p>
                  <p className="text-gray-600">Total Content</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-green-600">{stats.completed}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-blue-600">{stats.processing}</p>
                  <p className="text-sm text-gray-600">Processing</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-red-600">{stats.failed}</p>
                  <p className="text-sm text-gray-600">Failed</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Processing Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Questions Generated:</span>
                <span className="font-medium">{stats.total_questions_generated.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Processing Time:</span>
                <span className="font-medium">{stats.avg_processing_time_hours.toFixed(2)} hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Success Rate:</span>
                <span className="font-medium text-green-600">{completionRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Failure Rate:</span>
                <span className="font-medium text-red-600">{failureRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {stats.total_content > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Overall Progress</h3>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{stats.completed} completed</span>
                <span>{stats.total_content} total</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex gap-4">
            <button
              onClick={processAllPending}
              disabled={stats.pending === 0}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Process All Pending ({stats.pending})
            </button>
            
            <button
              onClick={cleanupStuck}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Cleanup Stuck Jobs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 