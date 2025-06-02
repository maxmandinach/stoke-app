import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    // Dynamic import to prevent build-time issues
    const { processingOrchestrator, contentProcessingDB } = await import('@/lib/database/contentProcessing');

    switch (action) {
      case 'stats':
        const overview = await processingOrchestrator.getProcessingOverview();
        return NextResponse.json(overview);

      case 'pending':
        const pending = await contentProcessingDB.getPendingContent();
        return NextResponse.json({ pending });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: stats, pending' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    // Dynamic import to prevent build-time issues
    const { processingOrchestrator, contentProcessingDB } = await import('@/lib/database/contentProcessing');
    
    const body = await request.json();

    switch (action) {
      case 'process':
        const { contentId } = body;
        if (!contentId) {
          return NextResponse.json(
            { error: 'contentId is required' },
            { status: 400 }
          );
        }
        const jobId = await processingOrchestrator.processContent(contentId);
        return NextResponse.json({ jobId, message: 'Processing started' });

      case 'process-all':
        const results = await processingOrchestrator.processAllPending();
        return NextResponse.json(results);

      case 'add-content':
        const { title, transcript, duration, source, sourceUrl, topics } = body;
        if (!title || !transcript || !duration) {
          return NextResponse.json(
            { error: 'title, transcript, and duration are required' },
            { status: 400 }
          );
        }

        const contentData = {
          title,
          transcript,
          duration_hours: duration,
          source: source || 'podcast',
          source_url: sourceUrl || `https://example.com/${Date.now()}`,
          topics: topics || [],
        };

        const result = await processingOrchestrator.addAndProcessContent(contentData);
        return NextResponse.json(result);

      case 'cleanup':
        const cleanupResult = await contentProcessingDB.cleanupStuckProcessing();
        return NextResponse.json(cleanupResult);

      case 'retry':
        const { retryContentId } = body;
        if (!retryContentId) {
          return NextResponse.json(
            { error: 'retryContentId is required' },
            { status: 400 }
          );
        }
        const retryJobId = await contentProcessingDB.retryFailedContent(retryContentId);
        return NextResponse.json({ jobId: retryJobId, message: 'Retry started' });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: process, process-all, add-content, cleanup, retry' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 