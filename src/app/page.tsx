import ContentLibrary from '@/components/ContentLibrary';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 pt-safe">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Content Library</h1>
        </div>
      </header>
      <main className="px-4 py-4">
        <ContentLibrary />
      </main>
    </div>
  );
}
