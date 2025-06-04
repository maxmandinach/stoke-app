import { ContentSelectionProvider } from '@/contexts/ContentSelectionContext';
import { SessionConfigurationProvider } from '@/contexts/SessionConfigurationContext';
import ContentLibrary from '@/components/ContentLibrary';

export default function Home() {
  return (
    <ContentSelectionProvider>
      <SessionConfigurationProvider>
        <ContentLibrary />
      </SessionConfigurationProvider>
    </ContentSelectionProvider>
  );
}
