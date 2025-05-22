import { Content, Insight } from '@/types/content';

export function processTranscript(rawTranscript: string): Partial<Content> {
  // Extract metadata from the transcript
  const titleMatch = rawTranscript.match(/Episode Name:(.*?)(?:\n|$)/);

  // Extract the main conversation
  const conversationStart = rawTranscript.indexOf('\n\n');
  const conversation = rawTranscript.slice(conversationStart).trim();

  // Split into segments (each exchange between speakers)
  const segments = conversation.split(/\n\n/).filter(Boolean);

  // Process segments into insights
  const insights: Insight[] = segments.map((segment, index) => {
    const [speaker, content] = segment.split(':').map(s => s.trim());
    return {
      id: `insight-${index}`,
      content: `${speaker}: ${content}`,
      importance: 1, // Default importance
      topics: [], // Topics will be extracted by AI
      reviewSchedule: {
        nextReview: new Date().toISOString(),
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0
      }
    };
  });

  // Extract topics from the conversation
  const topics = extractTopics(conversation);

  return {
    title: titleMatch?.[1]?.trim() || 'Untitled',
    source: 'podcast',
    source_url: '',
    transcript: rawTranscript,
    summary: generateSummary(conversation), // Will be enhanced with AI
    insights,
    topics,
    created_at: new Date().toISOString(),
    processed_at: new Date().toISOString()
  };
}

function extractTopics(conversation: string): string[] {
  // TODO: Implement AI-powered topic extraction
  // For now, return basic topics based on common themes
  const topics = new Set<string>();
  
  // Add basic topic detection
  if (conversation.toLowerCase().includes('ai')) topics.add('Artificial Intelligence');
  if (conversation.toLowerCase().includes('economy')) topics.add('Economics');
  if (conversation.toLowerCase().includes('government')) topics.add('Government');
  if (conversation.toLowerCase().includes('technology')) topics.add('Technology');
  
  return Array.from(topics);
}

function generateSummary(conversation: string): string {
  // TODO: Implement AI-powered summary generation
  // For now, return a basic summary
  const firstParagraph = conversation.split('\n\n')[0];
  return firstParagraph.length > 200 
    ? firstParagraph.slice(0, 200) + '...'
    : firstParagraph;
} 