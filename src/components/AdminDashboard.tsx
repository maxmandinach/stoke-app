'use client';

import React, { useState, useEffect } from 'react';
import CircularProgress from './CircularProgress';
import StokeLogo from './StokeLogo';
import type { ContentSource, SessionType, ProcessingStatus } from '@/types/database.types';

interface SystemHealthMetrics {
  totalUsers: number;
  activeUsersToday: number;
  activeUsersWeek: number;
  totalSessions: number;
  avgSessionDuration: number;
  totalContentItems: number;
  processingQueueSize: number;
  systemUptime: string;
  errorRate: number;
  responseTime: number;
}

interface ContentProcessingStats {
  totalProcessed: number;
  processingQueue: number;
  failedProcessing: number;
  avgProcessingTime: number;
  successRate: number;
  contentBySource: { source: ContentSource; count: number }[];
  recentProcessing: {
    id: string;
    title: string;
    status: ProcessingStatus;
    createdAt: string;
    processedAt?: string;
    duration?: number;
  }[];
}

interface UserEngagementMetrics {
  dailyActiveUsers: { date: string; users: number }[];
  sessionsByType: { type: SessionType; count: number; avgDuration: number }[];
  completionRates: { type: SessionType; rate: number }[];
  retentionMetrics: {
    day1: number;
    day7: number;
    day30: number;
  };
  topTopics: { name: string; sessions: number; avgAccuracy: number }[];
}

interface PerformanceMetrics {
  apiResponseTimes: { endpoint: string; avgTime: number; p95Time: number }[];
  databasePerformance: {
    queryTime: number;
    connectionPool: number;
    activeQueries: number;
  };
  errorLogs: {
    id: string;
    message: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    component: string;
  }[];
}

interface AdminDashboardProps {
  onExportData?: () => void;
  onViewLogs?: () => void;
}

export default function AdminDashboard({ onExportData, onViewLogs }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<'overview' | 'content' | 'users' | 'performance'>('overview');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Mock data - in production this would come from API calls
  const systemHealth: SystemHealthMetrics = {
    totalUsers: 1247,
    activeUsersToday: 89,
    activeUsersWeek: 456,
    totalSessions: 5432,
    avgSessionDuration: 4.2,
    totalContentItems: 234,
    processingQueueSize: 3,
    systemUptime: '99.8%',
    errorRate: 0.02,
    responseTime: 145
  };

  const contentStats: ContentProcessingStats = {
    totalProcessed: 231,
    processingQueue: 3,
    failedProcessing: 2,
    avgProcessingTime: 45,
    successRate: 98.3,
    contentBySource: [
      { source: 'podcast', count: 156 },
      { source: 'video', count: 45 },
      { source: 'article', count: 23 },
      { source: 'book', count: 9 }
    ],
    recentProcessing: [
      {
        id: '1',
        title: 'The Future of AI in Healthcare',
        status: 'completed',
        createdAt: '2024-01-15T10:30:00Z',
        processedAt: '2024-01-15T10:31:23Z',
        duration: 83
      },
      {
        id: '2',
        title: 'Understanding Quantum Computing',
        status: 'processing',
        createdAt: '2024-01-15T10:45:00Z'
      },
      {
        id: '3',
        title: 'Climate Change Solutions',
        status: 'pending',
        createdAt: '2024-01-15T11:00:00Z'
      }
    ]
  };

  const userEngagement: UserEngagementMetrics = {
    dailyActiveUsers: [
      { date: '2024-01-10', users: 78 },
      { date: '2024-01-11', users: 82 },
      { date: '2024-01-12', users: 91 },
      { date: '2024-01-13', users: 85 },
      { date: '2024-01-14', users: 89 }
    ],
    sessionsByType: [
      { type: 'read_summaries', count: 2341, avgDuration: 3.2 },
      { type: 'test_knowledge', count: 1876, avgDuration: 5.1 },
      { type: 'both', count: 1215, avgDuration: 6.8 }
    ],
    completionRates: [
      { type: 'read_summaries', rate: 0.94 },
      { type: 'test_knowledge', rate: 0.87 },
      { type: 'both', rate: 0.81 }
    ],
    retentionMetrics: {
      day1: 0.72,
      day7: 0.45,
      day30: 0.23
    },
    topTopics: [
      { name: 'Artificial Intelligence', sessions: 456, avgAccuracy: 0.78 },
      { name: 'Climate Science', sessions: 342, avgAccuracy: 0.82 },
      { name: 'Space Exploration', sessions: 298, avgAccuracy: 0.75 }
    ]
  };

  const performance: PerformanceMetrics = {
    apiResponseTimes: [
      { endpoint: '/api/content/process', avgTime: 145, p95Time: 280 },
      { endpoint: '/api/sessions/create', avgTime: 89, p95Time: 156 },
      { endpoint: '/api/progress/update', avgTime: 76, p95Time: 134 }
    ],
    databasePerformance: {
      queryTime: 12,
      connectionPool: 85,
      activeQueries: 3
    },
    errorLogs: [
      {
        id: '1',
        message: 'Failed to process content: timeout after 30s',
        timestamp: '2024-01-15T10:45:23Z',
        severity: 'medium',
        component: 'content-processor'
      },
      {
        id: '2',
        message: 'Rate limit exceeded for Gemini API',
        timestamp: '2024-01-15T09:12:45Z',
        severity: 'low',
        component: 'ai-service'
      }
    ]
  };

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
      // In production, fetch fresh data here
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => `${Math.round(seconds)}s`;
  const formatTime = (ms: number) => `${ms}ms`;

  const getStatusColor = (status: ProcessingStatus) => {
    switch (status) {
      case 'completed': return 'text-emerald-600 bg-emerald-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-amber-600 bg-amber-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getSeverityColor = (severity: PerformanceMetrics['errorLogs'][0]['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'medium': return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'low': return 'text-blue-700 bg-blue-100 border-blue-200';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Total Users</h3>
            <div className="text-lg">👥</div>
          </div>
          <div className="text-2xl font-bold text-slate-800">{systemHealth.totalUsers.toLocaleString()}</div>
          <div className="text-sm text-emerald-600">+12% this month</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Active Today</h3>
            <div className="text-lg">🔥</div>
          </div>
          <div className="text-2xl font-bold text-slate-800">{systemHealth.activeUsersToday}</div>
          <div className="text-sm text-slate-500">{Math.round((systemHealth.activeUsersToday / systemHealth.totalUsers) * 100)}% of total</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Total Sessions</h3>
            <div className="text-lg">📚</div>
          </div>
          <div className="text-2xl font-bold text-slate-800">{systemHealth.totalSessions.toLocaleString()}</div>
          <div className="text-sm text-slate-500">Avg {systemHealth.avgSessionDuration}min</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">System Health</h3>
            <div className="text-lg">💚</div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{systemHealth.systemUptime}</div>
          <div className="text-sm text-slate-500">Uptime</div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Response Time</h3>
          <div className="text-center">
            <CircularProgress 
              progress={Math.max(0, 100 - (systemHealth.responseTime / 500) * 100)} 
              size="lg" 
              className="mx-auto mb-2"
            />
            <div className="text-xl font-bold text-slate-800">{formatTime(systemHealth.responseTime)}</div>
            <div className="text-sm text-slate-500">Average response</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Error Rate</h3>
          <div className="text-center">
            <CircularProgress 
              progress={Math.max(0, 100 - (systemHealth.errorRate * 100))} 
              size="lg" 
              className="mx-auto mb-2"
            />
            <div className="text-xl font-bold text-slate-800">{(systemHealth.errorRate * 100).toFixed(2)}%</div>
            <div className="text-sm text-slate-500">Error rate</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Processing Queue</h3>
          <div className="text-center">
            <CircularProgress 
              progress={Math.max(0, 100 - (systemHealth.processingQueueSize / 10) * 100)} 
              size="lg" 
              className="mx-auto mb-2"
            />
            <div className="text-xl font-bold text-slate-800">{systemHealth.processingQueueSize}</div>
            <div className="text-sm text-slate-500">Items pending</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Content Processing</h3>
        <div className="space-y-3">
          {contentStats.recentProcessing.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-slate-800 text-sm">{item.title}</h4>
                <p className="text-xs text-slate-600">
                  {new Date(item.createdAt).toLocaleString()}
                  {item.duration && ` • Processed in ${formatDuration(item.duration)}`}
                </p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                {item.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContentStats = () => (
    <div className="space-y-6">
      {/* Processing Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-slate-800">{contentStats.totalProcessed}</div>
          <div className="text-sm text-slate-600">Total Processed</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-amber-600">{contentStats.processingQueue}</div>
          <div className="text-sm text-slate-600">In Queue</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-emerald-600">{contentStats.successRate}%</div>
          <div className="text-sm text-slate-600">Success Rate</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{formatDuration(contentStats.avgProcessingTime)}</div>
          <div className="text-sm text-slate-600">Avg Processing</div>
        </div>
      </div>

      {/* Content by Source */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Content by Source</h3>
        <div className="space-y-4">
          {contentStats.contentBySource.map((source) => (
            <div key={source.source} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-lg">
                  {source.source === 'podcast' ? '🎧' :
                   source.source === 'video' ? '📹' :
                   source.source === 'article' ? '📄' :
                   source.source === 'book' ? '📚' : '📝'}
                </div>
                <div>
                  <h4 className="font-medium text-slate-800 text-sm capitalize">{source.source}</h4>
                  <p className="text-xs text-slate-600">{source.count} items</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 bg-slate-200 rounded-full h-2">
                  <div 
                    className="h-full bg-purple-400 rounded-full"
                    style={{ width: `${(source.count / contentStats.totalProcessed) * 100}%` }}
                  />
                </div>
                <div className="text-sm font-medium text-slate-700 w-12 text-right">
                  {Math.round((source.count / contentStats.totalProcessed) * 100)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Processing History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Processing History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 text-slate-600">Title</th>
                <th className="text-left py-2 text-slate-600">Status</th>
                <th className="text-left py-2 text-slate-600">Created</th>
                <th className="text-left py-2 text-slate-600">Duration</th>
              </tr>
            </thead>
            <tbody>
              {contentStats.recentProcessing.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-2 font-medium text-slate-800">{item.title}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-2 text-slate-600">{new Date(item.createdAt).toLocaleString()}</td>
                  <td className="py-2 text-slate-600">
                    {item.duration ? formatDuration(item.duration) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUserEngagement = () => (
    <div className="space-y-6">
      {/* Retention Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{Math.round(userEngagement.retentionMetrics.day1 * 100)}%</div>
          <div className="text-sm text-slate-600">Day 1 Retention</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{Math.round(userEngagement.retentionMetrics.day7 * 100)}%</div>
          <div className="text-sm text-slate-600">Day 7 Retention</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{Math.round(userEngagement.retentionMetrics.day30 * 100)}%</div>
          <div className="text-sm text-slate-600">Day 30 Retention</div>
        </div>
      </div>

      {/* Session Types */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Session Types</h3>
        <div className="space-y-4">
          {userEngagement.sessionsByType.map((session) => (
            <div key={session.type} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-lg">
                  {session.type === 'read_summaries' ? '📖' :
                   session.type === 'test_knowledge' ? '🧠' : '🎯'}
                </div>
                <div>
                  <h4 className="font-medium text-slate-800 text-sm">
                    {session.type === 'read_summaries' ? 'Read Summaries' :
                     session.type === 'test_knowledge' ? 'Test Knowledge' : 'Combined Sessions'}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {session.count.toLocaleString()} sessions • Avg {session.avgDuration}min
                  </p>
                </div>
              </div>
              <div className="text-sm font-semibold text-slate-800">
                {Math.round((userEngagement.completionRates.find(c => c.type === session.type)?.rate || 0) * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Topics */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Popular Topics</h3>
        <div className="space-y-3">
          {userEngagement.topTopics.map((topic, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-slate-800 text-sm">{topic.name}</h4>
                <p className="text-xs text-slate-600">{topic.sessions} sessions</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-emerald-600">
                  {Math.round(topic.avgAccuracy * 100)}%
                </div>
                <div className="text-xs text-slate-500">accuracy</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      {/* API Performance */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">API Performance</h3>
        <div className="space-y-3">
          {performance.apiResponseTimes.map((api, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-800 text-sm">{api.endpoint}</h4>
                <p className="text-xs text-slate-600">Average response time</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-800">{formatTime(api.avgTime)}</div>
                <div className="text-xs text-slate-500">P95: {formatTime(api.p95Time)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Database Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{formatTime(performance.databasePerformance.queryTime)}</div>
          <div className="text-sm text-slate-600">Avg Query Time</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{performance.databasePerformance.connectionPool}%</div>
          <div className="text-sm text-slate-600">Connection Pool</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{performance.databasePerformance.activeQueries}</div>
          <div className="text-sm text-slate-600">Active Queries</div>
        </div>
      </div>

      {/* Error Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Recent Errors</h3>
          {onViewLogs && (
            <button 
              onClick={onViewLogs}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View All Logs →
            </button>
          )}
        </div>
        <div className="space-y-3">
          {performance.errorLogs.map((error) => (
            <div key={error.id} className={`p-3 rounded-lg border ${getSeverityColor(error.severity)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{error.message}</h4>
                  <p className="text-xs mt-1 opacity-75">
                    {error.component} • {new Date(error.timestamp).toLocaleString()}
                  </p>
                </div>
                <span className="text-xs font-semibold capitalize">{error.severity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StokeLogo className="w-8 h-8 text-slate-800" />
              <div>
                <h1 className="font-semibold text-slate-800">Admin Dashboard</h1>
                <p className="text-xs text-slate-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Export Button */}
              {onExportData && (
                <button
                  onClick={onExportData}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <div className="text-lg">📊</div>
                  <span>Export Data</span>
                </button>
              )}
              
              {/* View Toggle */}
              <div className="flex bg-slate-100 rounded-lg p-1">
                {(['overview', 'content', 'users', 'performance'] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setCurrentView(view)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                      currentView === view
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="max-w-6xl mx-auto">
          {currentView === 'overview' && renderOverview()}
          {currentView === 'content' && renderContentStats()}
          {currentView === 'users' && renderUserEngagement()}
          {currentView === 'performance' && renderPerformance()}
        </div>
      </div>
    </div>
  );
} 