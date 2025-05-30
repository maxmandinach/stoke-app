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
      <div className="px-4 pt-4 pb-[84px] bg-white min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded-lg w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-100 rounded-xl border border-slate-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 pt-4 pb-[84px] bg-white min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
          <p className="font-medium">{error}</p>
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
            className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={selectedIds.length === content.length ? 'Deselect all content' : 'Select all content'}
          >
            {selectedIds.length === content.length ? 'Deselect All' : 'Select All'}
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
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 cursor-pointer transition-colors duration-200 min-h-[44px] inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Import Transcript
          </label>
          <button
            onClick={() => setIsAddingContent(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Add new content"
          >
            Add Content
          </button>
        </>
      </LibraryHeader>

      {isAddingContent && (
        <div className="mb-6 p-4 bg-white border border-slate-200 rounded-xl shadow-sm transition-all duration-200">
          <h2 className="text-[22px] leading-7 font-semibold text-slate-800 mb-4">Add New Content</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="content-title" className="block text-sm font-medium text-slate-800 mb-1">Title</label>
              <input
                id="content-title"
                type="text"
                value={newContent.title}
                onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                placeholder="Enter content title"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-3 text-base min-h-[44px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
            
            <div>
              <label htmlFor="content-source" className="block text-sm font-medium text-slate-800 mb-1">Source Type</label>
              <select
                id="content-source"
                value={newContent.source}
                onChange={(e) => setNewContent({ ...newContent, source: e.target.value as ContentSource })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-3 text-base min-h-[44px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="podcast">Podcast</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>

            <div>
              <label htmlFor="content-url" className="block text-sm font-medium text-slate-800 mb-1">Source URL (optional)</label>
              <input
                id="content-url"
                type="text"
                value={newContent.sourceUrl}
                onChange={(e) => setNewContent({ ...newContent, sourceUrl: e.target.value })}
                placeholder="Enter source URL"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-3 text-base min-h-[44px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>

            <div>
              <label htmlFor="content-transcript" className="block text-sm font-medium text-slate-800 mb-1">Transcript</label>
              <textarea
                id="content-transcript"
                value={newContent.transcript}
                onChange={(e) => setNewContent({ ...newContent, transcript: e.target.value })}
                placeholder="Paste transcript here"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-3 text-base min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddContent}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={!newContent.transcript}
              >
                Save Content
              </button>
              <button
                onClick={() => setIsAddingContent(false)}
                className="flex-1 bg-white text-slate-600 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors duration-200 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
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
            className={`p-4 bg-white border rounded-xl shadow-sm transition-all duration-200 cursor-pointer ${
              selectedIds.includes(item.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
            onClick={() => toggleSelection(item.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                toggleSelection(item.id);
              }
            }}
            aria-selected={selectedIds.includes(item.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-slate-800">{item.title}</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditContent(item.id);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors duration-200 p-1 rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                aria-label={`Edit ${item.title}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-2">{item.summary}</p>
            <div className="flex flex-wrap gap-2">
              {item.topics.map((topic) => (
                <span
                  key={topic}
                  className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 