import { test, expect, Page } from '@playwright/test';

/**
 * End-to-End Tests for Complete Stoke User Flow
 * 
 * This test suite validates the entire user journey from content selection
 * through session completion and analytics, ensuring all components work
 * together seamlessly with proper error handling and accessibility.
 */

// Test configuration
const TEST_CONFIG = {
  baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
  timeout: 30000,
  mockUserId: 'test-user-123',
  testContent: [
    {
      id: 'content-1',
      title: 'AI in Healthcare: Future Prospects',
      source: 'podcast',
      duration: 45,
      topics: ['Artificial Intelligence', 'Healthcare']
    },
    {
      id: 'content-2', 
      title: 'Climate Science Fundamentals',
      source: 'video',
      duration: 60,
      topics: ['Climate Science', 'Environment']
    }
  ]
};

test.describe('Complete User Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test environment
    await page.goto(TEST_CONFIG.baseURL);
    
    // Mock authentication if needed
    await page.evaluate((userId) => {
      localStorage.setItem('test-user-id', userId);
    }, TEST_CONFIG.mockUserId);
    
    // Wait for app to load
    await page.waitForSelector('[data-testid="stoke-logo"]', { timeout: 10000 });
  });

  test('Complete Read Summaries Session Flow', async ({ page }) => {
    // Stage 1: Content Selection
    await test.step('Select content for session', async () => {
      // Verify content selection interface loads
      await expect(page.locator('h1')).toContainText('Your Content Library');
      
      // Select first piece of content
      const firstContentCard = page.locator('[data-testid="content-card"]').first();
      await firstContentCard.click();
      
      // Verify selection indicator appears
      await expect(page.locator('[data-testid="selection-count"]')).toContainText('1 episode selected');
      
      // Verify auto-transition to configuration
      await page.waitForSelector('[data-testid="session-configuration"]', { timeout: 5000 });
    });

    // Stage 2: Session Configuration
    await test.step('Configure read summaries session', async () => {
      // Verify configuration interface
      await expect(page.locator('h1')).toContainText('Configure Your Session');
      
      // Select Read Summaries session type
      await page.locator('[data-testid="session-type-summaries"]').click();
      
      // Select session length
      await page.locator('[data-testid="session-length-medium"]').click();
      
      // Start session
      await page.locator('[data-testid="start-session-button"]').click();
      
      // Wait for session to begin
      await page.waitForSelector('[data-testid="active-session"]', { timeout: 5000 });
    });

    // Stage 3: Active Session
    await test.step('Complete read summaries session', async () => {
      // Verify session interface
      await expect(page.locator('[data-testid="session-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="progress-indicator"]')).toBeVisible();
      
      // Navigate through summaries
      let summaryCount = 0;
      const maxSummaries = 5; // Prevent infinite loop
      
      while (summaryCount < maxSummaries) {
        // Check if we're on a summary page
        const nextButton = page.locator('[data-testid="next-summary-button"]');
        
        if (await nextButton.isVisible()) {
          // Read summary content (simulate reading time)
          await page.waitForTimeout(2000);
          
          // Click next
          await nextButton.click();
          summaryCount++;
        } else {
          // Session might be complete
          break;
        }
      }
      
      // Wait for session completion
      await page.waitForSelector('[data-testid="session-complete"]', { timeout: 10000 });
    });

    // Stage 4: Session Completion
    await test.step('View session completion results', async () => {
      // Verify completion screen
      await expect(page.locator('h1')).toContainText('Session Complete');
      
      // Check performance metrics are displayed
      await expect(page.locator('[data-testid="completion-rate"]')).toBeVisible();
      await expect(page.locator('[data-testid="time-spent"]')).toBeVisible();
      
      // Test view switching
      await page.locator('[data-testid="insights-tab"]').click();
      await expect(page.locator('[data-testid="insights-content"]')).toBeVisible();
      
      await page.locator('[data-testid="guidance-tab"]').click();
      await expect(page.locator('[data-testid="guidance-content"]')).toBeVisible();
      
      // Return to library
      await page.locator('[data-testid="return-to-library"]').click();
      await page.waitForSelector('[data-testid="content-library"]', { timeout: 5000 });
    });
  });

  test('Complete Test Knowledge Session Flow', async ({ page }) => {
    // Stage 1: Content Selection (similar to above)
    await test.step('Select content for test session', async () => {
      const contentCard = page.locator('[data-testid="content-card"]').first();
      await contentCard.click();
      await page.waitForSelector('[data-testid="session-configuration"]', { timeout: 5000 });
    });

    // Stage 2: Configure Test Knowledge Session
    await test.step('Configure test knowledge session', async () => {
      await page.locator('[data-testid="session-type-testing"]').click();
      await page.locator('[data-testid="session-length-medium"]').click();
      await page.locator('[data-testid="start-session-button"]').click();
      await page.waitForSelector('[data-testid="active-session"]', { timeout: 5000 });
    });

    // Stage 3: Answer Questions
    await test.step('Answer knowledge questions', async () => {
      let questionCount = 0;
      const maxQuestions = 10;
      
      while (questionCount < maxQuestions) {
        // Check for question interface
        const gotItButton = page.locator('[data-testid="got-it-button"]');
        const revisitButton = page.locator('[data-testid="revisit-button"]');
        
        if (await gotItButton.isVisible() || await revisitButton.isVisible()) {
          // Simulate thinking time
          await page.waitForTimeout(1500);
          
          // Randomly answer (simulate real user behavior)
          const shouldAnswer = Math.random() > 0.3; // 70% got it rate
          
          if (shouldAnswer) {
            await gotItButton.click();
          } else {
            await revisitButton.click();
          }
          
          // Wait for feedback animation
          await page.waitForTimeout(800);
          questionCount++;
        } else {
          break;
        }
      }
      
      await page.waitForSelector('[data-testid="session-complete"]', { timeout: 10000 });
    });

    // Stage 4: Verify Results with Analytics Integration
    await test.step('Verify session results and analytics', async () => {
      // Check test-specific metrics
      await expect(page.locator('[data-testid="questions-answered"]')).toBeVisible();
      await expect(page.locator('[data-testid="accuracy-rate"]')).toBeVisible();
      
      // Verify next session guidance
      await page.locator('[data-testid="guidance-tab"]').click();
      await expect(page.locator('[data-testid="recommended-session"]')).toBeVisible();
      
      // Test starting recommended session
      const startRecommendedButton = page.locator('[data-testid="start-recommended-session"]');
      if (await startRecommendedButton.isVisible()) {
        await startRecommendedButton.click();
        await expect(page.locator('[data-testid="active-session"]')).toBeVisible();
        
        // Exit to complete flow
        await page.locator('[data-testid="exit-session"]').click();
      }
    });
  });

  test('Progress Analytics Flow', async ({ page }) => {
    await test.step('Access progress analytics', async () => {
      // Click analytics button from main interface
      await page.locator('[data-testid="analytics-button"]').click();
      await page.waitForSelector('[data-testid="progress-analytics"]', { timeout: 5000 });
    });

    await test.step('Navigate analytics views', async () => {
      // Test overview tab
      await expect(page.locator('[data-testid="analytics-overview"]')).toBeVisible();
      await expect(page.locator('[data-testid="learning-streak"]')).toBeVisible();
      
      // Test topics view
      await page.locator('[data-testid="topics-tab"]').click();
      await expect(page.locator('[data-testid="topic-mastery"]')).toBeVisible();
      
      // Test patterns view
      await page.locator('[data-testid="patterns-tab"]').click();
      await expect(page.locator('[data-testid="learning-patterns"]')).toBeVisible();
      
      // Test insights view
      await page.locator('[data-testid="insights-tab"]').click();
      await expect(page.locator('[data-testid="learning-insights"]')).toBeVisible();
    });

    await test.step('Test topic interaction', async () => {
      await page.locator('[data-testid="topics-tab"]').click();
      
      // Click on a topic to expand details
      const topicCard = page.locator('[data-testid="topic-card"]').first();
      await topicCard.click();
      
      // Verify expanded content
      await expect(page.locator('[data-testid="topic-details"]')).toBeVisible();
    });
  });

  test('Error Handling and Recovery', async ({ page }) => {
    await test.step('Test network error recovery', async () => {
      // Intercept network requests to simulate errors
      await page.route('**/api/**', (route) => {
        if (route.request().url().includes('/analytics')) {
          route.abort();
        } else {
          route.continue();
        }
      });
      
      // Try to access analytics
      await page.locator('[data-testid="analytics-button"]').click();
      
      // Should show error state or graceful degradation
      await page.waitForSelector('[data-testid="analytics-error"]', { timeout: 10000 });
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    });

    await test.step('Test session interruption recovery', async () => {
      // Start a session
      await page.locator('[data-testid="content-card"]').first().click();
      await page.waitForSelector('[data-testid="session-configuration"]');
      await page.locator('[data-testid="session-type-summaries"]').click();
      await page.locator('[data-testid="start-session-button"]').click();
      
      // Simulate browser refresh during session
      await page.reload();
      
      // Should recover gracefully or return to content selection
      await page.waitForSelector('[data-testid="content-library"], [data-testid="session-recovery"]', { timeout: 10000 });
    });
  });

  test('Accessibility Validation', async ({ page }) => {
    await test.step('Verify keyboard navigation', async () => {
      // Test tab navigation through content selection
      await page.keyboard.press('Tab');
      let focusedElement = await page.locator(':focus').getAttribute('data-testid');
      expect(focusedElement).toBeTruthy();
      
      // Continue tabbing through interface
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        // Verify focus is visible
        const focusedEl = page.locator(':focus');
        await expect(focusedEl).toBeVisible();
      }
    });

    await test.step('Verify ARIA labels and roles', async () => {
      // Check main navigation areas have proper ARIA labels
      await expect(page.locator('[role="main"]')).toBeVisible();
      await expect(page.locator('[role="navigation"]')).toBeVisible();
      
      // Check progress indicators have labels
      const progressIndicators = page.locator('[role="progressbar"]');
      if (await progressIndicators.count() > 0) {
        await expect(progressIndicators.first()).toHaveAttribute('aria-label');
      }
    });

    await test.step('Verify color contrast and readability', async () => {
      // This would typically use axe-core or similar tools
      // For now, we'll check that text elements are visible
      const textElements = page.locator('p, h1, h2, h3, span');
      const count = await textElements.count();
      
      for (let i = 0; i < Math.min(count, 10); i++) {
        const element = textElements.nth(i);
        if (await element.isVisible()) {
          // Check that text has sufficient contrast (simplified check)
          const styles = await element.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor
            };
          });
          
          // Basic check that text color is not same as background
          expect(styles.color).not.toBe(styles.backgroundColor);
        }
      }
    });
  });

  test('Performance Validation', async ({ page }) => {
    await test.step('Measure page load performance', async () => {
      const startTime = Date.now();
      await page.goto(TEST_CONFIG.baseURL);
      await page.waitForSelector('[data-testid="content-library"]');
      const loadTime = Date.now() - startTime;
      
      // Page should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    await test.step('Measure session transition performance', async () => {
      await page.locator('[data-testid="content-card"]').first().click();
      
      const transitionStart = Date.now();
      await page.waitForSelector('[data-testid="session-configuration"]');
      const transitionTime = Date.now() - transitionStart;
      
      // Transition should be smooth (under 1 second)
      expect(transitionTime).toBeLessThan(1000);
    });

    await test.step('Verify smooth animations', async () => {
      // Start session to test progress animations
      await page.locator('[data-testid="session-type-summaries"]').click();
      await page.locator('[data-testid="start-session-button"]').click();
      
      // Check that progress indicators animate smoothly
      const progressElement = page.locator('[data-testid="progress-indicator"]');
      await expect(progressElement).toBeVisible();
      
      // Verify no layout shifts during animations
      const initialBox = await progressElement.boundingBox();
      await page.waitForTimeout(500); // Wait for potential animations
      const finalBox = await progressElement.boundingBox();
      
      // Position should remain stable
      if (initialBox && finalBox) {
        expect(Math.abs(initialBox.x - finalBox.x)).toBeLessThan(5);
        expect(Math.abs(initialBox.y - finalBox.y)).toBeLessThan(5);
      }
    });
  });

  test('Mobile Optimization', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-specific test');
    
    await test.step('Verify mobile layout', async () => {
      // Check that touch targets are appropriately sized
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const box = await button.boundingBox();
          if (box) {
            // Touch targets should be at least 44px
            expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
          }
        }
      }
    });

    await test.step('Test mobile gestures', async () => {
      // Test swipe gestures if implemented
      const sessionArea = page.locator('[data-testid="session-content"]');
      if (await sessionArea.isVisible()) {
        // Simulate swipe
        await sessionArea.hover();
        await page.mouse.down();
        await page.mouse.move(100, 0);
        await page.mouse.up();
        
        // Should handle gracefully
        await expect(sessionArea).toBeVisible();
      }
    });
  });

  test('Data Export and Privacy', async ({ page }) => {
    await test.step('Test analytics data export', async () => {
      await page.locator('[data-testid="analytics-button"]').click();
      await page.waitForSelector('[data-testid="progress-analytics"]');
      
      // Look for export functionality
      const exportButton = page.locator('[data-testid="export-data-button"]');
      if (await exportButton.isVisible()) {
        // Mock download to avoid actual file operations
        const downloadPromise = page.waitForEvent('download');
        await exportButton.click();
        const download = await downloadPromise;
        
        // Verify download was initiated
        expect(download.suggestedFilename()).toContain('stoke-analytics');
      }
    });

    await test.step('Verify privacy controls', async () => {
      // Check for privacy-related controls
      const privacyControls = page.locator('[data-testid*="privacy"], [data-testid*="data-control"]');
      
      if (await privacyControls.count() > 0) {
        await expect(privacyControls.first()).toBeVisible();
      }
    });
  });
});

// Helper functions for test setup
async function setupTestData(page: Page) {
  // Mock API responses for consistent testing
  await page.route('**/api/content/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(TEST_CONFIG.testContent)
    });
  });
}

async function verifyMemoryWavesDesign(page: Page) {
  // Check for Memory Waves design elements
  const memoryWavesElements = page.locator('[data-testid*="memory-waves"], .memory-waves');
  
  if (await memoryWavesElements.count() > 0) {
    await expect(memoryWavesElements.first()).toBeVisible();
  }
  
  // Verify calm color scheme (no harsh reds, bright colors)
  const bodyStyles = await page.locator('body').evaluate((body) => {
    return window.getComputedStyle(body).backgroundColor;
  });
  
  // Should use calming colors (not pure white or bright colors)
  expect(bodyStyles).toMatch(/rgb\(248|249|250|251|252|253|254/); // Light grays/whites
}

// Performance helper
async function measurePageMetrics(page: Page) {
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0
    };
  });
  
  return metrics;
} 