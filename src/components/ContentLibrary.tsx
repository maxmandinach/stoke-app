'use client';

import { useState, useEffect } from 'react';
import { Content, ContentSource, Insight } from '@/types/content';
import { processTranscript } from '@/utils/contentProcessor';
import { getContent, addContent } from '@/lib/content';
import type { Database } from '@/types/database.types';
import LibraryHeader from './LibraryHeader';

type Json = Database['public']['Tables']['content']['Row']['insights'][number];

// Helper function to convert Json to Insight
function convertJsonToInsight(json: Json): Insight {
  if (typeof json !== 'object' || json === null) {
    return {
      id: crypto.randomUUID(),
      content: '',
      timestamp: new Date().toISOString(),
      type: 'unknown'
    };
  }
  
  const insight = json as { id?: string; content?: string; timestamp?: string; type?: string };
  return {
    id: insight.id || crypto.randomUUID(),
    content: insight.content || '',
    timestamp: insight.timestamp || new Date().toISOString(),
    type: insight.type || 'unknown'
  };
}

export default function ContentLibrary() {
  const [content, setContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [newContent, setNewContent] = useState({
    title: '',
    source: 'podcast' as ContentSource,
    sourceUrl: '',
    transcript: ''
  });

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

    try {
      const processedContent = processTranscript(newContent.transcript);
      const newItem = await addContent({
        title: processedContent.title || newContent.title,
        source: processedContent.source || newContent.source,
        source_url: newContent.sourceUrl,
        transcript: newContent.transcript,
        summary: processedContent.summary || '',
        insights: (processedContent.insights || []).map(insight => ({
          id: insight.id,
          content: insight.content,
          timestamp: insight.timestamp,
          type: insight.type
        })),
        topics: processedContent.topics || [],
        created_at: new Date().toISOString(),
        processed_at: new Date().toISOString()
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

  if (isLoading) {
    return (
      <div className="px-4 pt-4 pb-[84px] bg-white">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 pt-4 pb-[84px] bg-white">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-[84px] bg-white">
      <LibraryHeader>
        <>
          <button
            onClick={toggleSelectAll}
            className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
          >
            {selectedIds.length === content.length ? 'Deselect All' : 'Select All'}
          </button>
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 cursor-pointer"
          >
            Import Transcript
          </label>
          <button
            onClick={() => setIsAddingContent(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Add Content
          </button>
        </>
      </LibraryHeader>

      {isAddingContent && (
        <div className="mb-6 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <h2 className="text-[22px] leading-7 font-semibold text-slate-800 mb-4">Add New Content</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">Title</label>
              <input
                type="text"
                value={newContent.title}
                onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                placeholder="Enter content title"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-3 text-base min-h-[44px] focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">Source Type</label>
              <select
                value={newContent.source}
                onChange={(e) => setNewContent({ ...newContent, source: e.target.value as ContentSource })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-3 text-base min-h-[44px] focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="podcast">Podcast</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">Source URL (optional)</label>
              <input
                type="text"
                value={newContent.sourceUrl}
                onChange={(e) => setNewContent({ ...newContent, sourceUrl: e.target.value })}
                placeholder="Enter source URL"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-3 text-base min-h-[44px] focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">Transcript</label>
              <textarea
                value={newContent.transcript}
                onChange={(e) => setNewContent({ ...newContent, transcript: e.target.value })}
                placeholder="Paste transcript here"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-3 text-base min-h-[44px] h-48 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddContent}
                className="bg-green-600 text-white rounded-lg px-4 py-3 font-medium min-h-[44px] hover:bg-green-700 flex items-center justify-center"
              >
                Process
              </button>
              <button
                onClick={() => setIsAddingContent(false)}
                className="bg-transparent text-slate-500 border border-slate-500 rounded-lg px-4 py-3 font-medium min-h-[44px] hover:bg-slate-100 flex items-center justify-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {content.map((item) => (
          <div
            key={item.id}
            className={`relative p-4 border rounded-xl shadow-sm transition-colors ${
              selectedIds.includes(item.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-12">
                <h3 className="text-lg font-semibold text-slate-800">{item.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{item.source}</p>
                {item.source_url && (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 mt-1 block"
                  >
                    View Source
                  </a>
                )}
                <div className="mt-2">
                  <span className="text-sm text-slate-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                {item.topics.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.topics.map((topic) => (
                      <span
                        key={topic}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
                {item.summary && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-slate-800 mb-1">Summary</h4>
                    <p className="text-sm text-slate-500">{item.summary}</p>
                  </div>
                )}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-slate-800 mb-1">Insights ({item.insights.length})</h4>
                  <div className="space-y-2">
                    {item.insights.slice(0, 3).map((insight) => (
                      <div key={insight.id} className="text-sm text-slate-500">
                        {insight.content}
                      </div>
                    ))}
                    {item.insights.length > 3 && (
                      <div className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                        +{item.insights.length - 3} more insights
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <button
                  onClick={() => handleEditContent(item.id)}
                  className="text-slate-500 hover:text-slate-600 p-2"
                  aria-label="Edit content"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => toggleSelection(item.id)}
                  className="w-11 h-11 flex items-center justify-center"
                  aria-label={selectedIds.includes(item.id) ? 'Deselect content' : 'Select content'}
                >
                  <div className={`w-6 h-6 border-2 rounded ${
                    selectedIds.includes(item.id)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-slate-300'
                  }`}>
                    {selectedIds.includes(item.id) && (
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
          <button
            className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 font-medium"
          >
            Start Review ({selectedIds.length} selected)
          </button>
        </div>
      )}
    </div>
  );
} 