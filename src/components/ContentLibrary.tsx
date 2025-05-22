'use client';

import { useState, useEffect } from 'react';
import { Content, ContentSource, Insight } from '@/types/content';
import { processTranscript } from '@/utils/contentProcessor';
import { getContent, addContent, updateContent } from '@/lib/content';

// Helper function to convert Json to Insight
function convertJsonToInsight(json: any): Insight {
  return {
    id: json.id || crypto.randomUUID(),
    content: json.content || '',
    timestamp: json.timestamp,
    type: json.type
  };
}

export default function ContentLibrary() {
  const [content, setContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

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

  const toggleSelection = (id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === content.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(content.map(item => item.id)));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
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
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selection Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={toggleSelectAll}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {selectedItems.size === content.length ? 'Deselect All' : 'Select All'}
        </button>
        <span className="text-sm text-gray-600">
          {selectedItems.size} selected
        </span>
      </div>

      {/* Content Grid */}
      <div className="grid gap-4">
        {content.map((item) => (
          <div
            key={item.id}
            className={`border rounded-lg p-4 transition-colors ${
              selectedItems.has(item.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={selectedItems.has(item.id)}
                onChange={() => toggleSelection(item.id)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{item.source}</p>
                {item.topics.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.topics.map((topic) => (
                      <span
                        key={topic}
                        className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
                {item.summary && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {item.summary}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Start Review Button */}
      {selectedItems.size > 0 && (
        <div className="fixed bottom-[76px] left-0 right-0 bg-white border-t border-gray-200 p-4">
          <button
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Start Review ({selectedItems.size} episodes)
          </button>
        </div>
      )}
    </div>
  );
} 