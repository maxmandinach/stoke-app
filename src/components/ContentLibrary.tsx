'use client';

import { useState, useEffect, useMemo } from 'react';
import { Content, ContentSource, Insight } from '@/types/content';
import { processTranscript } from '@/utils/contentProcessor';
import { getContent, addContent } from '@/lib/content';
import type { Database } from '@/types/database.types';
import LibraryHeader from './LibraryHeader';
import { AIInsight, AIProcessingStatus, AIContentBadge } from './AIIndicators';
import { TopicFilterBar, TopicList, TopicGroupHeader, getAllTopics, groupContentByTopics } from './TopicComponents';
import { ContentMetadata } from './ContentTypeIndicator';
import StartReviewButton from './StartReviewButton';
import { PageSkeleton, LoadingTransition, ProcessingSkeleton, InlineProcessing } from './SkeletonComponents';

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

  const toggleSelectAll = () => {
    setSelectedIds(prev => 
      prev.length === content.length 
        ? [] 
        : content.map(item => item.id)
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

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'list' ? 'grouped' : 'list');
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
    return <PageSkeleton cardCount={3} />;
  }

  if (error) {
    return (
      <div className="px-4 pt-4 pb-[84px] bg-white min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
          <p className="text-[16px] leading-[24px] font-normal">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-[84px] bg-white min-h-screen">
      <LibraryHeader>
        <>
          <button
            onClick={toggleSelectAll}
            className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 hover:-translate-y-0.5 active:opacity-90 transition-all duration-200 ease-out min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-[16px] leading-[24px] font-normal"
            aria-label={selectedIds.length === content.length ? 'Deselect all content' : 'Select all content'}
          >
            {selectedIds.length === content.length ? 'Deselect All' : 'Select All'}
          </button>
          <button
            onClick={toggleViewMode}
            className="bg-white text-purple-600 border border-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 hover:-translate-y-0.5 active:opacity-90 transition-all duration-200 ease-out min-h-[44px] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-[16px] leading-[24px] font-normal"
            aria-label={`Switch to ${viewMode === 'list' ? 'grouped' : 'list'} view`}
          >
            {viewMode === 'list' ? (
              <>
                <svg className="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                </svg>
                Group by Topics
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                List View
              </>
            )}
          </button>
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            aria-label="Import transcript file"
          />
          <label
            htmlFor="file-upload"
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 hover:-translate-y-0.5 active:opacity-90 cursor-pointer transition-all duration-200 ease-out min-h-[44px] inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-[16px] leading-[24px] font-normal"
          >
            Import Transcript
          </label>
          <button
            onClick={() => setIsAddingContent(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 hover:-translate-y-0.5 active:opacity-90 transition-all duration-200 ease-out min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-[16px] leading-[24px] font-normal"
            aria-label="Add new content"
          >
            Add Content
          </button>
        </>
      </LibraryHeader>

      {isAddingContent && (
        <div 
          className="mb-6 p-6 bg-white border border-[#E2E8F0] rounded-xl transition-all duration-200"
          style={{
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
          }}
        >
          <h2 className="text-[22px] leading-[28px] font-semibold text-slate-800 mb-6">Add New Content</h2>
          <div className="space-y-6">
            {/* Title Field */}
            <div>
              <label htmlFor="content-title" className="block text-[14px] leading-[20px] font-medium text-slate-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="content-title"
                type="text"
                value={newContent.title}
                onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                placeholder="Enter content title"
                className={`w-full bg-[#F8FAFC] border rounded-lg px-3 py-3 text-[16px] leading-[24px] font-normal transition-all duration-200 ease-out ${
                  newContent.title.trim() === '' && newContent.title !== ''
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]'
                } focus:ring-2 focus:ring-offset-2`}
                style={{ minHeight: '44px', borderRadius: '8px' }}
                required
              />
              {newContent.title.trim() === '' && newContent.title !== '' && (
                <p className="mt-1 text-[12px] leading-[16px] text-red-600">Title is required</p>
              )}
            </div>
            
            {/* Source Type Field */}
            <div>
              <label htmlFor="content-source" className="block text-[14px] leading-[20px] font-medium text-slate-700 mb-2">
                Source Type <span className="text-red-500">*</span>
              </label>
              <select
                id="content-source"
                value={newContent.source}
                onChange={(e) => setNewContent({ ...newContent, source: e.target.value as ContentSource })}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-3 text-[16px] leading-[24px] font-normal focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 focus:border-[#2563EB] transition-all duration-200 ease-out"
                style={{ minHeight: '44px', borderRadius: '8px' }}
                required
              >
                <option value="podcast">Podcast</option>
                <option value="video">Video</option>
                <option value="article">Article</option>
                <option value="book">Book</option>
                <option value="conversation">Conversation</option>
              </select>
            </div>

            {/* Source URL Field */}
            <div>
              <label htmlFor="content-url" className="block text-[14px] leading-[20px] font-medium text-slate-700 mb-2">
                Source URL <span className="text-slate-400">(optional)</span>
              </label>
              <input
                id="content-url"
                type="url"
                value={newContent.sourceUrl}
                onChange={(e) => setNewContent({ ...newContent, sourceUrl: e.target.value })}
                placeholder="https://example.com"
                className={`w-full bg-[#F8FAFC] border rounded-lg px-3 py-3 text-[16px] leading-[24px] font-normal transition-all duration-200 ease-out ${
                  newContent.sourceUrl && !isValidUrl(newContent.sourceUrl)
                    ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500'
                    : 'border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]'
                } focus:ring-2 focus:ring-offset-2`}
                style={{ minHeight: '44px', borderRadius: '8px' }}
              />
              {newContent.sourceUrl && !isValidUrl(newContent.sourceUrl) && (
                <p className="mt-1 text-[12px] leading-[16px] text-amber-600">Please enter a valid URL</p>
              )}
            </div>

            {/* Transcript Field */}
            <div>
              <label htmlFor="content-transcript" className="block text-[14px] leading-[20px] font-medium text-slate-700 mb-2">
                Transcript <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  id="content-transcript"
                  value={newContent.transcript}
                  onChange={(e) => setNewContent({ ...newContent, transcript: e.target.value })}
                  placeholder="Paste your transcript here..."
                  rows={8}
                  className={`w-full bg-[#F8FAFC] border rounded-lg px-3 py-3 text-[16px] leading-[24px] font-normal transition-all duration-200 ease-out resize-y ${
                    newContent.transcript.trim() === '' && newContent.transcript !== ''
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]'
                  } focus:ring-2 focus:ring-offset-2`}
                  style={{ 
                    minHeight: '120px',
                    borderRadius: '8px'
                  }}
                  required
                />
                <div className="absolute bottom-3 right-3 text-[12px] leading-[16px] text-slate-400">
                  {newContent.transcript.length} characters
                </div>
              </div>
              {newContent.transcript.trim() === '' && newContent.transcript !== '' && (
                <p className="mt-1 text-[12px] leading-[16px] text-red-600">Transcript is required</p>
              )}
              <p className="mt-1 text-[12px] leading-[16px] text-slate-500">
                Paste the full transcript content. AI will automatically extract insights and topics.
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddingContent(false);
                  setNewContent({
                    title: '',
                    source: 'podcast',
                    sourceUrl: '',
                    transcript: ''
                  });
                }}
                disabled={isSubmitting}
                className="flex-1 bg-white text-slate-700 border border-[#E2E8F0] px-4 py-3 rounded-lg font-medium text-[16px] leading-[24px] transition-all duration-200 ease-out hover:bg-slate-50 hover:-translate-y-0.5 active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                style={{ minHeight: '44px', borderRadius: '8px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleAddContent}
                disabled={!newContent.transcript.trim() || !newContent.title.trim() || isSubmitting}
                className="flex-1 bg-[#2563EB] text-white px-4 py-3 rounded-lg font-medium text-[16px] leading-[24px] transition-all duration-200 ease-out hover:bg-[#1D4ED8] hover:-translate-y-0.5 active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 flex items-center justify-center gap-2"
                style={{ minHeight: '44px', borderRadius: '8px' }}
              >
                {isSubmitting ? (
                  <InlineProcessing text="Processing..." size="sm" />
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Content
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Topic Filter Bar */}
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
    </div>
  );

  // Helper function to render content cards
  function renderContentCard(item: Content) {
    const isExpanded = expandedCards.has(item.id);
    const hasInsights = item.insights.length > 0;
    const visibleInsights = isExpanded ? item.insights : item.insights.slice(0, 2);
    
    return (
      <div
        key={item.id}
        className={`bg-white border rounded-xl transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          selectedIds.includes(item.id)
            ? 'border-2 border-[#2563EB] bg-[#EFF6FF] shadow-lg transform scale-[1.02]'
            : 'border border-[#F1F5F9] hover:border-[#E2E8F0] hover:shadow-lg hover:transform hover:scale-[1.01] hover:-translate-y-0.5'
        }`}
        style={{
          boxShadow: selectedIds.includes(item.id) 
            ? '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)' 
            : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          transition: 'border-color 150ms ease-out, transform 200ms ease-out, box-shadow 200ms ease-out'
        }}
        role="button"
        tabIndex={0}
        aria-selected={selectedIds.includes(item.id)}
      >
        {/* Header Section - Always Visible */}
        <div 
          className="p-4 cursor-pointer"
          onClick={() => toggleSelection(item.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              toggleSelection(item.id);
            }
          }}
        >
          {/* Title and AI Badge Row */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 truncate">{item.title}</h3>
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
                className="text-slate-400 hover:text-slate-600 hover:-translate-y-0.5 active:opacity-90 transition-all duration-200 ease-out p-1 rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                aria-label={`Edit ${item.title}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            className="mb-3"
          />

          {/* Summary Section */}
          <p className="text-base leading-relaxed text-slate-700 mb-4">{item.summary}</p>

          {/* Topics Row */}
          <TopicList topics={item.topics} size="sm" maxDisplay={4} className="mb-4" />
        </div>

        {/* Visual Separator */}
        {hasInsights && (
          <div className="border-t border-slate-100" />
        )}

        {/* Insights Section - Progressive Disclosure */}
        {hasInsights && (
          <div className="px-4 pb-4">
            {/* Insights Header */}
            <div className="flex items-center justify-between py-3">
              <h4 className="text-sm font-semibold text-slate-800">
                Key Insights ({item.insights.length})
              </h4>
              {item.insights.length > 2 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCardExpansion(item.id);
                  }}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 py-1 px-2 rounded-md hover:bg-blue-50"
                >
                  {isExpanded ? (
                    <>
                      <span>Show less</span>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>Show all insights</span>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Insights Content */}
            <div className="space-y-3">
              {visibleInsights.map((insight, index) => (
                <div key={insight.id}>
                  <AIInsight
                    isAiGenerated={insight.isAiGenerated}
                    confidence={insight.confidence}
                  >
                    <div className="text-sm leading-relaxed text-slate-700">
                      {insight.content}
                    </div>
                  </AIInsight>
                  {/* Subtle separator between insights */}
                  {index < visibleInsights.length - 1 && (
                    <div className="border-t border-slate-50 mt-3" />
                  )}
                </div>
              ))}
            </div>

            {/* Collapsed state indicator */}
            {!isExpanded && item.insights.length > 2 && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500 text-center">
                  +{item.insights.length - 2} more insights • Click "Show all insights" to expand
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty state for no insights */}
        {!hasInsights && (
          <div className="px-4 pb-4">
            <div className="border-t border-slate-100 pt-3">
              <p className="text-sm text-slate-500 text-center py-2">
                No insights available for this content
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
} 