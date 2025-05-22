'use client';

import { useState, useEffect } from 'react';
import { Content, ContentSource, Insight } from '@/types/content';
import { processTranscript } from '@/utils/contentProcessor';
import { getContent, addContent, updateContent } from '@/lib/content';
import LibraryHeader from './LibraryHeader';

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
  const [isAddingContent, setIsAddingContent] = useState(false);
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

  if (isLoading) {
    return (
      <div className="p-4">
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
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <LibraryHeader>
        <>
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
        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Add New Content</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={newContent.title}
                onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                placeholder="Enter content title"
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Source Type</label>
              <select
                value={newContent.source}
                onChange={(e) => setNewContent({ ...newContent, source: e.target.value as ContentSource })}
                className="w-full p-2 border rounded"
              >
                <option value="podcast">Podcast</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Source URL (optional)</label>
              <input
                type="text"
                value={newContent.sourceUrl}
                onChange={(e) => setNewContent({ ...newContent, sourceUrl: e.target.value })}
                placeholder="Enter source URL"
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Transcript</label>
              <textarea
                value={newContent.transcript}
                onChange={(e) => setNewContent({ ...newContent, transcript: e.target.value })}
                placeholder="Paste transcript here"
                className="w-full p-2 border rounded h-48"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddContent}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Process
              </button>
              <button
                onClick={() => setIsAddingContent(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {content.map((item) => (
          <div key={item.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-gray-600">{item.source}</p>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                {item.topics.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.topics.map((topic) => (
                      <span
                        key={topic}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleEditContent(item.id)}
                className="text-blue-500 hover:text-blue-600"
              >
                Edit
              </button>
            </div>
            {item.summary && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Summary</h4>
                <p className="text-sm text-gray-700">{item.summary}</p>
              </div>
            )}
            <div className="mt-4">
              <h4 className="font-medium mb-2">Insights ({item.insights.length})</h4>
              <div className="space-y-2">
                {item.insights.slice(0, 3).map((insight) => (
                  <div key={insight.id} className="text-sm text-gray-700">
                    {insight.content}
                  </div>
                ))}
                {item.insights.length > 3 && (
                  <div className="text-sm text-blue-500">
                    +{item.insights.length - 3} more insights
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 