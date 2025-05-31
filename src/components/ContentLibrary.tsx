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
import { PageSkeleton, InlineProcessing } from './SkeletonComponents';
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
        {/* Empty State Header */}
        <div className="stoke-header">
          <h1 id="library-heading" className="stoke-display">Your Content Library</h1>
        </div>

        {/* Empty State Content */}
        <div className="text-center space-y-8 mt-16">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="stoke-title mb-4">Start building your content library</h2>
            <p className="stoke-body text-gray-600 mb-8">
              Add podcasts, interviews, lectures, and more to create personalized study sessions.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            <button
              onClick={() => setIsAddingContent(true)}
              className="stoke-btn stoke-btn-primary"
              aria-label="Add new content to start building your library"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Content
            </button>
            
            <label className="stoke-btn stoke-btn-secondary cursor-pointer">
              <input type="file" accept=".txt,.pdf" onChange={handleFileUpload} className="sr-only" />
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Transcript
            </label>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="stoke-container pb-24" role="main" aria-labelledby="library-heading">
      {/* Professional Header */}
      <div className="stoke-header">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <StokeLogo size="lg" className="text-[#2563EB]" />
            <h1 id="library-heading" className="stoke-display">Stoke</h1>
          </div>
          <p className="stoke-caption">
            {content.length} {content.length === 1 ? 'item' : 'items'}
            {selectedTopics.length > 0 && ` • ${filteredContent.length} filtered`}
            {selectedIds.length > 0 && ` • ${selectedIds.length} selected`}
          </p>
        </div>
        
        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grouped' : 'list')}
            className="stoke-btn stoke-btn-tertiary stoke-btn-sm"
            aria-label={`Switch to ${viewMode === 'list' ? 'grouped' : 'list'} view`}
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            {viewMode === 'list' ? 'Group' : 'List'}
          </button>
          
          <button
            onClick={() => setIsAddingContent(true)}
            className="stoke-btn stoke-btn-primary stoke-btn-sm"
            aria-label="Add new content"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add
          </button>
        </div>
      </div>

      {isAddingContent && (
        <section 
          className="mb-6 p-6 bg-white border border-[#E2E8F0] rounded-xl transition-all duration-200"
          aria-labelledby="add-content-heading"
        >
          <div className="space-y-6">
            <header>
              <h2 id="add-content-heading" className="text-[22px] leading-[28px] font-semibold text-[#1E293B] mb-6">Add New Content</h2>
            </header>

            <div className="space-y-4">
              <div>
                <label htmlFor="content-title" className="block text-[14px] leading-[20px] font-medium text-[#1E293B] mb-2">
                  Title <span className="text-[#DC2626]" aria-label="required">*</span>
                </label>
                <input
                  id="content-title"
                  type="text"
                  value={newContent.title}
                  onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full bg-[#F8FAFC] border rounded-lg px-3 py-3 text-[16px] leading-[24px] font-normal transition-all duration-200 ease-out touch-target ${
                    !newContent.title.trim() 
                      ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]' 
                      : 'border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]'
                  } focus:ring-2 focus:ring-offset-2`}
                  placeholder="Enter content title"
                  required
                  aria-describedby={!newContent.title.trim() ? "title-error" : undefined}
                />
                {!newContent.title.trim() && (
                  <p id="title-error" className="mt-1 text-[12px] leading-[16px] text-[#DC2626]" role="alert">Title is required</p>
                )}
              </div>

              <div>
                <label htmlFor="content-source" className="block text-[14px] leading-[20px] font-medium text-[#1E293B] mb-2">
                  Content Type
                </label>
                <select
                  id="content-source"
                  value={newContent.source}
                  onChange={(e) => setNewContent(prev => ({ ...prev, source: e.target.value as ContentSource }))}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-3 text-[16px] leading-[24px] font-normal focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 focus:border-[#2563EB] transition-all duration-200 ease-out touch-target"
                >
                  <option value="podcast">Podcast</option>
                  <option value="interview">Interview</option>
                  <option value="lecture">Lecture</option>
                  <option value="article">Article</option>
                  <option value="video">Video</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="content-url" className="block text-[14px] leading-[20px] font-medium text-[#1E293B] mb-2">
                  Source URL (optional)
                </label>
                <input
                  id="content-url"
                  type="url"
                  value={newContent.sourceUrl}
                  onChange={(e) => setNewContent(prev => ({ ...prev, sourceUrl: e.target.value }))}
                  className={`w-full bg-[#F8FAFC] border rounded-lg px-3 py-3 text-[16px] leading-[24px] font-normal transition-all duration-200 ease-out touch-target ${
                    newContent.sourceUrl && !isValidUrl(newContent.sourceUrl) 
                      ? 'border-[#D97706] focus:border-[#D97706] focus:ring-[#D97706]' 
                      : 'border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]'
                  } focus:ring-2 focus:ring-offset-2`}
                  placeholder="https://example.com"
                  aria-describedby={newContent.sourceUrl && !isValidUrl(newContent.sourceUrl) ? "url-error" : undefined}
                />
                {newContent.sourceUrl && !isValidUrl(newContent.sourceUrl) && (
                  <p id="url-error" className="mt-1 text-[12px] leading-[16px] text-[#D97706]" role="alert">Please enter a valid URL</p>
                )}
              </div>

              <div>
                <label htmlFor="content-transcript" className="block text-[14px] leading-[20px] font-medium text-[#1E293B] mb-2">
                  Transcript <span className="text-[#DC2626]" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <textarea
                    id="content-transcript"
                    value={newContent.transcript}
                    onChange={(e) => setNewContent(prev => ({ ...prev, transcript: e.target.value }))}
                    className={`w-full bg-[#F8FAFC] border rounded-lg px-3 py-3 text-[16px] leading-[24px] font-normal transition-all duration-200 ease-out resize-y ${
                      !newContent.transcript.trim() 
                        ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]' 
                        : 'border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]'
                    } focus:ring-2 focus:ring-offset-2`}
                    rows={8}
                    placeholder="Paste your transcript content here..."
                    required
                    aria-describedby={`transcript-count ${!newContent.transcript.trim() ? 'transcript-error' : ''}`}
                  />
                  <div className="absolute bottom-3 right-3 text-[12px] leading-[16px] text-[#64748B]" id="transcript-count" aria-live="polite">
                    {newContent.transcript.length} characters
                  </div>
                </div>
                {!newContent.transcript.trim() && (
                  <p id="transcript-error" className="mt-1 text-[12px] leading-[16px] text-[#DC2626]" role="alert">Transcript is required</p>
                )}
                <p className="mt-1 text-[12px] leading-[16px] text-[#64748B]">
                  Your transcript will be automatically processed to extract insights and topics.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-[#F1F5F9]">
              <button
                onClick={handleAddContent}
                disabled={isSubmitting || !newContent.title.trim() || !newContent.transcript.trim()}
                className="bg-[#2563EB] text-white px-6 py-3 rounded-lg hover:bg-[#1D4ED8] hover:-translate-y-0.5 active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#2563EB] disabled:hover:transform-none transition-all duration-200 ease-out touch-target focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 text-[16px] leading-[24px] font-medium inline-flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <InlineProcessing />
                    Processing...
                  </>
                ) : (
                  'Add Content'
                )}
              </button>
              
              <button
                onClick={() => {
                  setIsAddingContent(false);
                  setNewContent({ title: '', source: 'podcast', sourceUrl: '', transcript: '' });
                }}
                className="bg-white text-[#64748B] border border-[#94A3B8] px-6 py-3 rounded-lg hover:bg-[#F8FAFC] hover:-translate-y-0.5 active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-out touch-target focus:outline-none focus:ring-2 focus:ring-[#94A3B8] focus:ring-offset-2 text-[16px] leading-[24px] font-medium"
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

  // Helper function to render content cards with new design
  function renderContentCard(item: Content) {
    const isExpanded = expandedCards.has(item.id);
    const isSelected = selectedIds.includes(item.id);
    const hasInsights = item.insights.length > 0;
    const visibleInsights = isExpanded ? item.insights : item.insights.slice(0, 2);
    
    return (
      <article
        key={item.id}
        className={`stoke-card stoke-card-selectable ${isSelected ? 'stoke-card-selected' : ''}`}
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
        {/* Header Section - Always Visible */}
        <div onClick={() => toggleSelection(item.id)}>
          {/* Title and AI Badge Row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3 className="stoke-title truncate">{item.title}</h3>
              <AIContentBadge isAiProcessed={item.isAiProcessed} />
            </div>
            <div className="flex items-center gap-2 ml-2">
              {item.processingStatus && (
                <AIProcessingStatus status={item.processingStatus} />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditContent(item.id);
                }}
                className="stoke-btn-tertiary p-2 min-h-0"
                aria-label={`Edit ${item.title}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Metadata Row */}
          <ContentMetadata 
            source={item.source}
            createdAt={item.created_at}
            processedAt={item.processed_at}
            className="mb-4"
          />

          {/* Summary Section */}
          <p className="stoke-body text-gray-600 mb-4">{item.summary}</p>

          {/* Topics Row */}
          <TopicList topics={item.topics} size="sm" maxDisplay={4} className="mb-4" />
        </div>

        {/* Visual Separator */}
        {hasInsights && (
          <div className="border-t border-gray-100 my-4" />
        )}

        {/* Insights Section - Progressive Disclosure */}
        {hasInsights && (
          <div>
            {/* Insights Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="stoke-subtitle">
                Key Insights ({item.insights.length})
              </h4>
              {item.insights.length > 2 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCardExpansion(item.id);
                  }}
                  className="stoke-btn-tertiary stoke-btn-sm"
                  aria-label={isExpanded ? 'Show fewer insights' : 'Show all insights'}
                >
                  {isExpanded ? (
                    <>
                      Show less
                      <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  ) : (
                    <>
                      Show all
                      <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Insights Content */}
            <div className="space-y-4">
              {visibleInsights.map((insight, index) => (
                <div key={insight.id}>
                  <AIInsight
                    isAiGenerated={insight.isAiGenerated}
                    confidence={insight.confidence}
                  >
                    <div className="stoke-body">
                      {insight.content}
                    </div>
                  </AIInsight>
                  {/* Subtle separator between insights */}
                  {index < visibleInsights.length - 1 && (
                    <div className="border-t border-gray-50 mt-4" />
                  )}
                </div>
              ))}
            </div>

            {/* Collapsed state indicator */}
            {!isExpanded && item.insights.length > 2 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="stoke-small text-center">
                  +{item.insights.length - 2} more insights • Click "Show all" to expand
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty state for no insights */}
        {!hasInsights && (
          <div className="border-t border-gray-100 pt-4">
            <p className="stoke-caption text-center py-4">
              No insights available for this content
            </p>
          </div>
        )}
      </article>
    );
  }
} 