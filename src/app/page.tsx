import ContentLibrary from '@/components/ContentLibrary';
import { ContentSelectionProvider } from '@/contexts/ContentSelectionContext';
import { AppHeader } from '@/components/ui/AppHeader';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ContentSelectionProvider>
          <ContentLibrary />
        </ContentSelectionProvider>
      </main>
    </div>
  );
}
