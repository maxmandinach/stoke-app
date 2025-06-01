import ContentLibrary from '@/components/ContentLibrary';
import { ContentSelectionProvider } from '@/contexts/ContentSelectionContext';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <main className="px-4 py-4">
        <ContentSelectionProvider>
          <ContentLibrary />
        </ContentSelectionProvider>
      </main>
    </div>
  );
}
