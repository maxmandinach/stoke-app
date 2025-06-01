'use client';

import { useState, useEffect, useMemo } from 'react';
import { Content, ContentSource, Insight } from '@/types/content';
import { processTranscript } from '@/utils/contentProcessor';
import { getContent, addContent } from '@/lib/content';
import type { Database } from '@/types/database.types';
import { AIInsight, AIProcessingStatus, AIContentBadge } from './AIIndicators';
import { TopicFilterBar, TopicList, TopicGroupHeader, getAllTopics, groupContentByTopics } from './TopicComponents';
import { ContentMetadata } from './ContentTypeIndicator';
import StartReviewButton from './StartReviewButton';
import { PageSkeleton } from './SkeletonComponents';
import StokeLogo from './StokeLogo';

type Json = Database['public']['Tables']['content']['Row']['insights'][number];

// Helper function to convert Json to Insight
function convertJsonToInsight(json: Json): Insight {
  if (typeof json !== 'object' || json === null) {
    return {
      id: crypto.randomUUID(),
      content: '',
      timestamp: new Date().toISOString(),
      type: 'unknown',
      isAiGenerated: false,
      confidence: undefined,
      processingStatus: 'completed'
    };
  }
  
  const insight = json as { 
    id?: string; 
    content?: string; 
    timestamp?: string; 
    type?: string;
    isAiGenerated?: boolean;
    confidence?: 'high' | 'medium' | 'low';
    processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  };
  
  return {
    id: insight.id || crypto.randomUUID(),
    content: insight.content || '',
    timestamp: insight.timestamp || new Date().toISOString(),
    type: insight.type || 'unknown',
    isAiGenerated: insight.isAiGenerated || false,
    confidence: insight.confidence,
    processingStatus: insight.processingStatus || 'completed'
  };
}

// Helper function to validate URL format
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export default function ContentLibrary() {
  const [content, setContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('list');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [newContent, setNewContent] = useState({
    title: '',
    source: 'podcast' as ContentSource,
    sourceUrl: '',
    transcript: ''
  });

  // Get all unique topics from content
  const allTopics = useMemo(() => getAllTopics(content), [content]);

  // Filter content based on selected topics
  const filteredContent = useMemo(() => {
    if (selectedTopics.length === 0) {
      return content;
    }
    return content.filter((item) =>
      selectedTopics.some((topic) => item.topics.includes(topic))
    );
  }, [content, selectedTopics]);

  // Group content by topics if in grouped view mode
  const groupedContent = useMemo(() => {
    if (viewMode === 'list') {
      return null;
    }
    return groupContentByTopics(filteredContent);
  }, [filteredContent, viewMode]);

  // Fetch content from Supabase
  useEffect(() => {
    async function fetchContent() {
      try {
        const data = await getContent();
        // Convert Json insights to Insight type
        const convertedData = data.map(item => ({
          ...item,
          insights: item.insights.map(convertJsonToInsight)
        }));
        setContent(convertedData);
      } catch (err) {
        setError('Failed to load content');
        console.error('Error loading content:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchContent();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const processedContent = processTranscript(text);
    
    setNewContent({
      title: processedContent.title || '',
      source: processedContent.source || 'podcast',
      sourceUrl: processedContent.source_url || '',
      transcript: text
    });
  };

  const handleAddContent = async () => {
    if (!newContent.transcript) return;

    setIsSubmitting(true);
    try {
      const processedContent = processTranscript(newContent.transcript);
      
      // Simulate AI processing with confidence levels for insights
      const enhancedInsights = (processedContent.insights || []).map(insight => ({
        id: insight.id,
        content: insight.content,
        timestamp: insight.timestamp,
        type: insight.type,
        isAiGenerated: true,
        confidence: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
        processingStatus: 'completed' as const
      }));
      
      const newItem = await addContent({
        title: processedContent.title || newContent.title,
        source: processedContent.source || newContent.source,
        source_url: newContent.sourceUrl,
        transcript: newContent.transcript,
        summary: processedContent.summary || '',
        insights: enhancedInsights,
        topics: processedContent.topics || [],
        created_at: new Date().toISOString(),
        processed_at: new Date().toISOString(),
        isAiProcessed: true,
        processingStatus: 'completed'
      });

      // Convert Json insights to Insight type
      const convertedItem = {
        ...newItem,
        insights: newItem.insights.map(convertJsonToInsight)
      };

      setContent(prev => [convertedItem, ...prev]);
      setIsAddingContent(false);
      setNewContent({
        title: '',
        source: 'podcast',
        sourceUrl: '',
        transcript: ''
      });
    } catch (err) {
      setError('Failed to add content');
      console.error('Error adding content:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditContent = async (id: string) => {
    const item = content.find(c => c.id === id);
    if (!item) return;

    setNewContent({
      title: item.title,
      source: item.source,
      sourceUrl: item.source_url,
      transcript: item.transcript
    });
    setIsAddingContent(true);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleClearAllTopics = () => {
    setSelectedTopics([]);
  };

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleStartReview = () => {
    // TODO: Implement review session navigation
    console.log(`Starting review with ${selectedIds.length} selected items:`, selectedIds);
    // This will be implemented when the review session is created
    // For now, just log the selected items
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <main className="stoke-container" role="main" aria-labelledby="error-heading">
        <div className="stoke-card border-l-4 border-l-red-500 bg-red-50" role="alert">
          <h1 id="error-heading" className="stoke-title text-red-700 mb-2">Error loading content</h1>
          <p className="stoke-body text-red-600">{error}</p>
        </div>
      </main>
    );
  }

  if (!content.length) {
    return (
      <main className="stoke-container" role="main" aria-labelledby="library-heading">
        {/* Enhanced Empty State Header */}
        <div className="stoke-header relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute top-4 left-8 w-32 h-32">
              <div className="absolute inset-0 rounded-full border border-gray-300 opacity-30"></div>
              <div className="absolute inset-4 rounded-full border border-gray-400 opacity-40"></div>
              <div className="absolute inset-8 rounded-full border border-gray-500 opacity-50"></div>
              <div className="absolute inset-12 rounded-full bg-gray-600 opacity-60"></div>
            </div>
          </div>
          
          <div className="relative">
            <div className="flex items-center gap-4 mb-3">
              <div className="relative">
                <StokeLogo size="xl" className="text-[#2563EB] drop-shadow-sm" />
                <div className="absolute inset-0 animate-pulse-slow opacity-20">
                  <StokeLogo size="xl" className="text-[#2563EB]" />
                </div>
              </div>
              <div>
                <h1 id="library-heading" className="stoke-display bg-gradient-to-r from-[#1E293B] to-[#475569] bg-clip-text text-transparent">
                  Memory Waves
                </h1>
                <p className="stoke-caption text-[#64748B] -mt-1">
                  Your Knowledge Sanctuary
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Empty State Content */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 px-4">
          {/* Central Memory Waves Illustration */}
          <div className="relative">
            <div className="w-32 h-32 relative">
              {/* Animated concentric circles */}
              <div className="absolute inset-0 rounded-full border-2 border-blue-200 opacity-30 animate-pulse-slow"></div>
              <div className="absolute inset-4 rounded-full border-2 border-blue-300 opacity-50 animate-pulse-slow" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute inset-8 rounded-full border-2 border-blue-400 opacity-70 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
              <div className="absolute inset-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 opacity-90 animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
              
              {/* Floating particles */}
              <div className="absolute -top-2 left-8 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="absolute top-6 -right-1 w-1.5 h-1.5 bg-blue-300 rounded-full opacity-50 animate-bounce" style={{ animationDelay: '0.8s' }}></div>
              <div className="absolute bottom-4 -left-1 w-1 h-1 bg-blue-200 rounded-full opacity-40 animate-bounce" style={{ animationDelay: '1.2s' }}></div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-md space-y-6">
            <h2 className="stoke-title text-[#1E293B]">
              Begin Your Knowledge Journey
            </h2>
            <p className="stoke-body text-[#64748B] leading-relaxed">
              Transform insights from podcasts, interviews, and lectures into lasting understanding. 
              Each piece of content creates ripples of knowledge through gentle, mindful review.
            </p>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col gap-4 w-full max-w-sm">
            <button
              onClick={() => setIsAddingContent(true)}
              className="relative overflow-hidden group stoke-btn bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] text-white shadow-xl shadow-blue-500/25 transform hover:scale-[1.02] transition-all duration-300"
              aria-label="Add new content to start building your library"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center">
                <div className="w-5 h-5 mr-3 relative">
                  <div className="absolute inset-0 rounded-full border border-white/30"></div>
                  <div className="absolute inset-1 rounded-full border border-white/50"></div>
                  <div className="absolute inset-[6px] rounded-full bg-white"></div>
                </div>
                Create Your First Wave
              </div>
            </button>
            
            <label className="relative overflow-hidden group stoke-btn bg-white border-2 border-gray-200 text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB] cursor-pointer transform hover:scale-[1.02] transition-all duration-300">
              <input type="file" accept=".txt,.pdf" onChange={handleFileUpload} className="sr-only" />
              <div className="relative flex items-center justify-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Transcript
              </div>
            </label>
          </div>

          {/* Subtle guidance */}
          <div className="mt-12 space-y-3 max-w-xs">
            <p className="stoke-small text-[#94A3B8] text-center">
              Start with any content format
            </p>
            <div className="flex justify-center gap-4 text-[#CBD5E1]">
              <span className="stoke-small">Podcasts</span>
              <span>•</span>
              <span className="stoke-small">Interviews</span>
              <span>•</span>
              <span className="stoke-small">Lectures</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="stoke-container pb-24" role="main" aria-labelledby="library-heading">
      {/* Professional Header with Enhanced Memory Waves Integration */}
      <div className="stoke-header relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute top-4 left-8 w-32 h-32">
            <div className="absolute inset-0 rounded-full border border-gray-300 opacity-30"></div>
            <div className="absolute inset-4 rounded-full border border-gray-400 opacity-40"></div>
            <div className="absolute inset-8 rounded-full border border-gray-500 opacity-50"></div>
            <div className="absolute inset-12 rounded-full bg-gray-600 opacity-60"></div>
          </div>
          <div className="absolute bottom-2 right-12 w-24 h-24">
            <div className="absolute inset-0 rounded-full border border-blue-200 opacity-25"></div>
            <div className="absolute inset-3 rounded-full border border-blue-300 opacity-35"></div>
            <div className="absolute inset-6 rounded-full bg-blue-400 opacity-45"></div>
          </div>
        </div>
        
        <div className="relative">
          <div className="flex items-center gap-4 mb-3">
            <div className="relative">
              <StokeLogo size="xl" className="text-[#2563EB] drop-shadow-sm" />
              <div className="absolute inset-0 animate-pulse-slow opacity-20">
                <StokeLogo size="xl" className="text-[#2563EB]" />
              </div>
            </div>
            <div>
              <h1 id="library-heading" className="stoke-display bg-gradient-to-r from-[#1E293B] to-[#475569] bg-clip-text text-transparent">
                Memory Waves
              </h1>
              <p className="stoke-caption text-[#64748B] -mt-1">
                Your Knowledge Sanctuary
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="stoke-caption">
              {content.length} {content.length === 1 ? 'insight' : 'insights'} cultivated
              {selectedTopics.length > 0 && ` • ${filteredContent.length} in view`}
              {selectedIds.length > 0 && ` • ${selectedIds.length} selected`}
            </p>
            
            {/* Enhanced Header Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'grouped' : 'list')}
                className="stoke-btn stoke-btn-tertiary stoke-btn-sm backdrop-blur-sm bg-white/80 border border-gray-200/50 hover:bg-white/90 transition-all duration-300"
                aria-label={`Switch to ${viewMode === 'list' ? 'grouped' : 'list'} view`}
              >
                <div className="w-4 h-4 mr-1.5 relative">
                  {viewMode === 'list' ? (
                    <svg fill="currentColor" viewBox="0 0 20 20" className="w-4 h-4">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                    </svg>
                  ) : (
                    <svg fill="currentColor" viewBox="0 0 20 20" className="w-4 h-4">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  )}
                </div>
                {viewMode === 'list' ? 'Cluster' : 'Flow'}
              </button>
              
              <button
                onClick={() => setIsAddingContent(true)}
                className="stoke-btn stoke-btn-primary stoke-btn-sm bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] shadow-lg shadow-blue-500/25 transition-all duration-300"
                aria-label="Add new content"
              >
                <div className="w-4 h-4 mr-1.5 relative">
                  <div className="absolute inset-0 rounded-full border border-white/30"></div>
                  <div className="absolute inset-1 rounded-full border border-white/50"></div>
                  <div className="absolute inset-[6px] rounded-full bg-white"></div>
                </div>
                Capture
              </button>
            </div>
          </div>
        </div>
      </div>

      {isAddingContent && (
        <section 
          className="mb-8 relative overflow-hidden bg-gradient-to-br from-white to-blue-50/30 border-2 border-blue-200/50 rounded-3xl shadow-lg shadow-blue-500/10 backdrop-blur-sm transition-all duration-500"
          aria-labelledby="add-content-heading"
        >
          {/* Subtle Memory Waves background pattern */}
          <div className="absolute top-0 right-0 w-48 h-48 opacity-[0.03] pointer-events-none">
            <div className="w-full h-full relative">
              <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-pulse-slow"></div>
              <div className="absolute inset-6 rounded-full border-2 border-blue-500 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
              <div className="absolute inset-12 rounded-full border-2 border-blue-600 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
              <div className="absolute inset-18 rounded-full bg-blue-700 animate-pulse-slow" style={{ animationDelay: '3s' }}></div>
            </div>
          </div>

          <div className="relative p-8">
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 relative">
                  <div className="absolute inset-0 rounded-full border border-blue-400 opacity-40"></div>
                  <div className="absolute inset-1.5 rounded-full border border-blue-500 opacity-60"></div>
                  <div className="absolute inset-3 rounded-full bg-blue-600 opacity-80"></div>
                </div>
                <h2 id="add-content-heading" className="stoke-title text-[#1E293B]">
                  Capture New Knowledge
                </h2>
              </div>
              <p className="stoke-caption text-[#64748B] ml-11">
                Transform your content into lasting insights through mindful processing
              </p>
            </header>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title Field */}
                <div className="space-y-2">
                  <label htmlFor="content-title" className="block stoke-caption font-medium text-[#1E293B] mb-3">
                    Content Title <span className="text-[#DC2626]" aria-label="required">*</span>
                  </label>
                  <input
                    id="content-title"
                    type="text"
                    value={newContent.title}
                    onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full bg-white/70 backdrop-blur-sm border-2 rounded-xl px-4 py-4 text-[16px] leading-[24px] font-normal transition-all duration-300 ease-out shadow-inner ${
                      !newContent.title.trim() 
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-400' 
                        : 'border-blue-200 focus:border-blue-400 focus:ring-blue-400'
                    } focus:ring-2 focus:ring-offset-2 hover:border-blue-300`}
                    placeholder="Enter a meaningful title for your content"
                    required
                    aria-describedby={!newContent.title.trim() ? "title-error" : undefined}
                  />
                  {!newContent.title.trim() && (
                    <p id="title-error" className="mt-2 text-[12px] leading-[16px] text-[#DC2626] flex items-center gap-1" role="alert">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Title helps organize your knowledge waves
                    </p>
                  )}
                </div>

                {/* Content Type Field */}
                <div className="space-y-2">
                  <label htmlFor="content-source" className="block stoke-caption font-medium text-[#1E293B] mb-3">
                    Content Type
                  </label>
                  <select
                    id="content-source"
                    value={newContent.source}
                    onChange={(e) => setNewContent(prev => ({ ...prev, source: e.target.value as ContentSource }))}
                    className="w-full bg-white/70 backdrop-blur-sm border-2 border-blue-200 rounded-xl px-4 py-4 text-[16px] leading-[24px] font-normal focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:border-blue-400 transition-all duration-300 ease-out hover:border-blue-300 shadow-inner"
                  >
                    <option value="podcast">🎧 Podcast</option>
                    <option value="interview">🎤 Interview</option>
                    <option value="lecture">🎓 Lecture</option>
                    <option value="article">📄 Article</option>
                    <option value="video">🎥 Video</option>
                    <option value="other">💭 Other</option>
                  </select>
                </div>
              </div>

              {/* Source URL Field */}
              <div className="space-y-2">
                <label htmlFor="content-url" className="block stoke-caption font-medium text-[#1E293B] mb-3">
                  Source URL <span className="text-[#64748B] font-normal">(optional)</span>
                </label>
                <input
                  id="content-url"
                  type="url"
                  value={newContent.sourceUrl}
                  onChange={(e) => setNewContent(prev => ({ ...prev, sourceUrl: e.target.value }))}
                  className={`w-full bg-white/70 backdrop-blur-sm border-2 rounded-xl px-4 py-4 text-[16px] leading-[24px] font-normal transition-all duration-300 ease-out shadow-inner ${
                    newContent.sourceUrl && !isValidUrl(newContent.sourceUrl) 
                      ? 'border-amber-300 focus:border-amber-400 focus:ring-amber-400' 
                      : 'border-blue-200 focus:border-blue-400 focus:ring-blue-400'
                  } focus:ring-2 focus:ring-offset-2 hover:border-blue-300`}
                  placeholder="https://example.com (helps track original source)"
                  aria-describedby={newContent.sourceUrl && !isValidUrl(newContent.sourceUrl) ? "url-error" : undefined}
                />
                {newContent.sourceUrl && !isValidUrl(newContent.sourceUrl) && (
                  <p id="url-error" className="mt-2 text-[12px] leading-[16px] text-[#D97706] flex items-center gap-1" role="alert">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Please enter a valid URL format
                  </p>
                )}
              </div>

              {/* Transcript Field */}
              <div className="space-y-2">
                <label htmlFor="content-transcript" className="block stoke-caption font-medium text-[#1E293B] mb-3">
                  Content Transcript <span className="text-[#DC2626]" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <textarea
                    id="content-transcript"
                    value={newContent.transcript}
                    onChange={(e) => setNewContent(prev => ({ ...prev, transcript: e.target.value }))}
                    className={`w-full bg-white/70 backdrop-blur-sm border-2 rounded-xl px-4 py-4 text-[16px] leading-[24px] font-normal transition-all duration-300 ease-out resize-y shadow-inner ${
                      !newContent.transcript.trim() 
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-400' 
                        : 'border-blue-200 focus:border-blue-400 focus:ring-blue-400'
                    } focus:ring-2 focus:ring-offset-2 hover:border-blue-300`}
                    rows={8}
                    placeholder="Paste your transcript content here... This will be transformed into meaningful insights through our AI processing."
                    required
                    aria-describedby={!newContent.transcript.trim() ? "transcript-error" : "transcript-help"}
                  />
                  <div className="absolute bottom-3 right-3 text-[#94A3B8] stoke-small">
                    {newContent.transcript.length > 0 && `${newContent.transcript.length} characters`}
                  </div>
                </div>
                {!newContent.transcript.trim() ? (
                  <p id="transcript-error" className="mt-2 text-[12px] leading-[16px] text-[#DC2626] flex items-center gap-1" role="alert">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Transcript content is required for processing
                  </p>
                ) : (
                  <p id="transcript-help" className="mt-2 text-[12px] leading-[16px] text-[#64748B] flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    AI will extract key insights and create knowledge connections
                  </p>
                )}
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-blue-100/50">
              <button
                onClick={handleAddContent}
                disabled={!newContent.title.trim() || !newContent.transcript.trim() || isSubmitting}
                className="relative overflow-hidden group flex-1 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] text-white px-8 py-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-[#2563EB] disabled:hover:to-[#3B82F6] transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Create new content with AI processing"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center">
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 mr-3 relative">
                        <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-pulse-slow"></div>
                        <div className="absolute inset-1 rounded-full border-2 border-white/50 animate-pulse-slow" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute inset-2 rounded-full bg-white animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                      </div>
                      Creating Memory Waves...
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 mr-3 relative">
                        <div className="absolute inset-0 rounded-full border border-white/30"></div>
                        <div className="absolute inset-1 rounded-full border border-white/50"></div>
                        <div className="absolute inset-[6px] rounded-full bg-white"></div>
                      </div>
                      Begin Processing
                    </>
                  )}
                </div>
              </button>
              
              <button
                onClick={() => {
                  setIsAddingContent(false);
                  setNewContent({ title: '', source: 'podcast', sourceUrl: '', transcript: '' });
                }}
                className="sm:flex-initial bg-white/80 backdrop-blur-sm text-[#64748B] border-2 border-gray-200 px-8 py-4 rounded-xl hover:bg-white hover:border-gray-300 hover:text-[#475569] active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-[16px] leading-[24px] font-medium transform hover:scale-[1.02]"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="px-4 pb-4">
        {/* Topic filtering */}
        {allTopics.length > 0 && (
          <TopicFilterBar
            allTopics={allTopics}
            selectedTopics={selectedTopics}
            onTopicToggle={handleTopicToggle}
            onClearAll={handleClearAllTopics}
          />
        )}

        {/* Content Display */}
        {viewMode === 'grouped' && groupedContent ? (
          // Grouped view
          <div className="space-y-12">
            {groupedContent.map(({ topic, items }) => (
              <div key={topic}>
                <TopicGroupHeader topic={topic} count={items.length} />
                <div className="space-y-6">
                  {items.map((item) => renderContentCard(item))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List view
          <div className="space-y-6">
            {filteredContent.map((item) => renderContentCard(item))}
          </div>
        )}
      </div>

      {/* Start Review Button - positioned outside main content container */}
      <StartReviewButton 
        selectedCount={selectedIds.length}
        onStartReview={handleStartReview}
      />
    </main>
  );

  // Helper function to render content cards with enhanced Memory Waves design
  function renderContentCard(item: Content) {
    const isExpanded = expandedCards.has(item.id);
    const isSelected = selectedIds.includes(item.id);
    const hasInsights = item.insights.length > 0;
    const visibleInsights = isExpanded ? item.insights : item.insights.slice(0, 2);
    
    return (
      <article
        key={item.id}
        className={`group relative overflow-hidden transition-all duration-300 ease-out ${
          isSelected 
            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-lg shadow-blue-200/50 scale-[1.01]' 
            : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/50 hover:scale-[1.005]'
        } rounded-2xl p-6 cursor-pointer`}
        role="button"
        tabIndex={0}
        aria-selected={isSelected}
        aria-label={`${item.title} - ${isSelected ? 'Selected' : 'Not selected'}. Press Enter or Space to toggle selection.`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleSelection(item.id);
          }
        }}
      >
        {/* Subtle Memory Waves pattern overlay */}
        <div className="absolute top-4 right-4 opacity-[0.05] pointer-events-none">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border border-current opacity-30"></div>
            <div className="absolute inset-2 rounded-full border border-current opacity-50"></div>
            <div className="absolute inset-4 rounded-full border border-current opacity-70"></div>
            <div className="absolute inset-6 rounded-full bg-current opacity-90"></div>
          </div>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-t-2xl"></div>
        )}

        {/* Header Section - Always Visible */}
        <div onClick={() => toggleSelection(item.id)}>
          {/* Title and AI Badge Row */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h3 className="stoke-title text-[#1E293B] group-hover:text-[#2563EB] transition-colors duration-200">
                {item.title}
              </h3>
              <AIContentBadge isAiProcessed={item.isAiProcessed} />
            </div>
            <div className="flex items-center gap-3 ml-3">
              {item.processingStatus && (
                <AIProcessingStatus status={item.processingStatus} />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditContent(item.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                aria-label={`Edit ${item.title}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Metadata Row with enhanced styling */}
          <div className="mb-4">
            <ContentMetadata 
              source={item.source}
              createdAt={item.created_at}
              processedAt={item.processed_at}
              className="text-[#64748B]"
            />
          </div>

          {/* Summary Section with enhanced typography */}
          <div className="mb-5">
            <p className="stoke-body text-[#475569] leading-relaxed">
              {item.summary}
            </p>
          </div>

          {/* Topics Row with enhanced styling */}
          <div className="mb-4">
            <TopicList topics={item.topics} size="sm" maxDisplay={4} className="gap-2" />
          </div>
        </div>

        {/* Enhanced Visual Separator */}
        {hasInsights && (
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-white px-4">
                <div className="w-6 h-6 relative opacity-20">
                  <div className="absolute inset-0 rounded-full border border-blue-300"></div>
                  <div className="absolute inset-1.5 rounded-full border border-blue-400"></div>
                  <div className="absolute inset-[6px] rounded-full bg-blue-500"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insights Section - Progressive Disclosure */}
        {hasInsights && (
          <div className="space-y-4">
            {/* Insights Header */}
            <div className="flex items-center justify-between">
              <h4 className="stoke-subtitle text-[#1E293B] flex items-center gap-2">
                <div className="w-4 h-4 relative opacity-60">
                  <div className="absolute inset-0 rounded-full border border-blue-400"></div>
                  <div className="absolute inset-1 rounded-full bg-blue-500"></div>
                </div>
                Knowledge Ripples ({item.insights.length})
              </h4>
              {item.insights.length > 2 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCardExpansion(item.id);
                  }}
                  className="stoke-btn-tertiary stoke-btn-sm text-[#2563EB] hover:bg-blue-50 border border-blue-200 hover:border-blue-300 transition-all duration-200"
                  aria-label={isExpanded ? 'Show fewer insights' : 'Show all insights'}
                >
                  {isExpanded ? (
                    <>
                      <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                      Collapse
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Expand All
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Insights Content with enhanced styling */}
            <div className="space-y-5">
              {visibleInsights.map((insight, index) => (
                <div key={insight.id} className="relative">
                  <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 rounded-xl p-4 border border-blue-100/50">
                    <AIInsight
                      isAiGenerated={insight.isAiGenerated}
                      confidence={insight.confidence}
                    >
                      <div className="stoke-body text-[#334155] leading-relaxed">
                        {insight.content}
                      </div>
                    </AIInsight>
                  </div>
                  {/* Connection line between insights */}
                  {index < visibleInsights.length - 1 && (
                    <div className="flex justify-center py-2">
                      <div className="w-px h-4 bg-gradient-to-b from-blue-200 to-transparent"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Collapsed state indicator */}
            {!isExpanded && item.insights.length > 2 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="stoke-small text-[#64748B] mb-2">
                    +{item.insights.length - 2} more insights await
                  </p>
                  <div className="flex justify-center">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse"></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state for no insights */}
        {!hasInsights && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="text-center py-6">
              <div className="w-12 h-12 mx-auto mb-3 opacity-20">
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 rounded-full border border-gray-300"></div>
                  <div className="absolute inset-2 rounded-full border border-gray-400"></div>
                  <div className="absolute inset-4 rounded-full bg-gray-500"></div>
                </div>
              </div>
              <p className="stoke-caption text-[#94A3B8]">
                Insights are cultivating...
              </p>
            </div>
          </div>
        )}
      </article>
    );
  }
} 