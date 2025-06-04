import { ContentSelectionProvider } from '@/contexts/ContentSelectionContext';
import { SessionConfigurationProvider } from '@/contexts/SessionConfigurationContext';
import { AppCoordinator } from '@/components/modern/AppCoordinator';

export default function Home() {
  return (
    <ContentSelectionProvider>
      <SessionConfigurationProvider>
        <AppCoordinator />
      </SessionConfigurationProvider>
    </ContentSelectionProvider>
  );
}
