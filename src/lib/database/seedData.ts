import { supabase } from '@/lib/supabase'
import { sharedContentAPI } from './sharedContent'
import type { 
  Question, 
  ContentSource, 
  QuestionType, 
  DifficultyLevel,
  ConfidenceLevel 
} from '@/types/database.types'

// ============================================================================
// SAMPLE DATA GENERATORS
// ============================================================================

/**
 * Generate sample questions for content
 */
function generateSampleQuestions(
  contentTitle: string,
  durationHours: number,
  topicArea: string
): Question[] {
  const questionsPerHour = 12;
  const totalQuestions = Math.ceil(durationHours * questionsPerHour);
  const questions: Question[] = [];

  const questionTypes: QuestionType[] = ['conceptual', 'factual', 'application', 'reflection'];
  const difficulties: DifficultyLevel[] = [1, 2, 3, 4, 5];
  const confidenceLevels: ConfidenceLevel[] = ['high', 'medium', 'low'];

  for (let i = 0; i < totalQuestions; i++) {
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const confidence = confidenceLevels[Math.floor(Math.random() * confidenceLevels.length)];

    // Generate contextual questions based on topic area
    const questionContent = generateQuestionContent(questionType, topicArea, contentTitle, i + 1);

    questions.push({
      id: `q_${Date.now()}_${i}`,
      content: questionContent,
      type: questionType,
      difficulty_level: difficulty,
      estimated_time_seconds: 20 + (difficulty * 10) + Math.floor(Math.random() * 20),
      created_by_ai: true,
      confidence: confidence,
      metadata: {
        timestamp: `${Math.floor(durationHours * (i / totalQuestions) * 60)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        keywords: generateKeywords(topicArea, questionType),
        concept_area: topicArea
      }
    });
  }

  return questions;
}

/**
 * Generate question content based on type and topic
 */
function generateQuestionContent(
  type: QuestionType,
  topicArea: string,
  contentTitle: string,
  questionNumber: number
): string {
  const templates = {
    conceptual: [
      `What is the core concept behind ${topicArea} discussed in "${contentTitle}"?`,
      `How does the main idea in this content relate to broader ${topicArea} principles?`,
      `What underlying framework explains the ${topicArea} approach mentioned?`
    ],
    factual: [
      `What specific data point was mentioned regarding ${topicArea}?`,
      `Who was cited as an expert in ${topicArea} during this discussion?`,
      `What year/statistic was referenced when discussing ${topicArea}?`
    ],
    application: [
      `How could you apply the ${topicArea} strategy in your own context?`,
      `What steps would you take to implement the ${topicArea} approach?`,
      `In what situations would the ${topicArea} method be most effective?`
    ],
    reflection: [
      `What surprised you most about the ${topicArea} perspective shared?`,
      `How does this ${topicArea} insight challenge your previous assumptions?`,
      `What questions does this ${topicArea} discussion raise for you?`
    ]
  };

  const templateOptions = templates[type];
  return templateOptions[Math.floor(Math.random() * templateOptions.length)];
}

/**
 * Generate keywords for questions
 */
function generateKeywords(topicArea: string, questionType: QuestionType): string[] {
  const baseKeywords = topicArea.toLowerCase().split(' ');
  const typeKeywords = {
    conceptual: ['theory', 'framework', 'principle', 'concept'],
    factual: ['data', 'evidence', 'research', 'study'],
    application: ['practice', 'implementation', 'strategy', 'method'],
    reflection: ['insight', 'perspective', 'learning', 'growth']
  };

  return [...baseKeywords, ...typeKeywords[questionType].slice(0, 2)];
}

/**
 * Generate content summaries
 */
function generateContentSummaries(
  title: string,
  durationHours: number,
  topicArea: string
): { quick_summary: string; full_summary: string } {
  const bulletsPerHour = 4;
  const paragraphsPerHour = 2;

  const totalBullets = Math.ceil(durationHours * bulletsPerHour);
  const totalParagraphs = Math.ceil(durationHours * paragraphsPerHour);

  // Generate quick summary (bullet points)
  const bulletPoints = [];
  for (let i = 0; i < totalBullets; i++) {
    bulletPoints.push(`• Key insight ${i + 1} about ${topicArea} from "${title}"`);
  }

  // Generate full summary (paragraphs)
  const paragraphs = [];
  for (let i = 0; i < totalParagraphs; i++) {
    paragraphs.push(
      `This ${topicArea} discussion in "${title}" explores important concepts that shape our understanding of the field. ` +
      `The speaker provides valuable insights and practical applications that can be applied in various contexts. ` +
      `Key takeaways include actionable strategies and evidence-based approaches to ${topicArea.toLowerCase()}.`
    );
  }

  return {
    quick_summary: bulletPoints.join('\n'),
    full_summary: paragraphs.join('\n\n')
  };
}

// ============================================================================
// SAMPLE CONTENT DATA
// ============================================================================

export const SAMPLE_CONTENT = [
  {
    title: "The Future of Artificial Intelligence and Machine Learning",
    source: 'podcast' as ContentSource,
    source_url: "https://example.com/ai-future-podcast",
    transcript: "In this comprehensive discussion about artificial intelligence and machine learning, we explore the current state of AI technology, emerging trends, and potential future applications. The conversation covers neural networks, deep learning, natural language processing, and the ethical implications of AI development. We discuss how AI is transforming industries from healthcare to finance, and what this means for the future of work and society.",
    duration_hours: 1.5,
    topicArea: "Technology"
  },
  {
    title: "Building Resilient Organizations in Times of Change",
    source: 'interview' as ContentSource,
    source_url: "https://example.com/resilient-organizations",
    transcript: "This interview focuses on organizational resilience and how companies can adapt to rapid change. We discuss leadership strategies, team dynamics, and cultural transformation. The guest shares insights from their experience building and scaling organizations through various market conditions, including economic downturns and technological disruptions.",
    duration_hours: 0.75,
    topicArea: "Business"
  },
  {
    title: "The Science of Sleep and Cognitive Performance",
    source: 'lecture' as ContentSource,
    source_url: "https://example.com/sleep-science",
    transcript: "A detailed examination of sleep science and its impact on cognitive performance. This lecture covers sleep stages, circadian rhythms, the glymphatic system, and how sleep affects memory consolidation, creativity, and decision-making. We explore evidence-based strategies for optimizing sleep quality and managing sleep disorders.",
    duration_hours: 2.0,
    topicArea: "Health & Wellness"
  },
  {
    title: "Quantum Computing: Principles and Applications",
    source: 'video' as ContentSource,
    source_url: "https://example.com/quantum-computing",
    transcript: "An introduction to quantum computing principles, including quantum bits, superposition, entanglement, and quantum algorithms. The discussion covers current quantum computing research, potential applications in cryptography, drug discovery, and financial modeling, as well as the challenges facing quantum computer development.",
    duration_hours: 1.25,
    topicArea: "Science"
  },
  {
    title: "Effective Learning Strategies for Skill Development",
    source: 'podcast' as ContentSource,
    source_url: "https://example.com/learning-strategies",
    transcript: "This episode explores evidence-based learning strategies including spaced repetition, active recall, deliberate practice, and metacognition. We discuss how to design effective learning experiences, overcome learning plateaus, and maintain motivation during skill development. The conversation includes practical tips for both individual learners and educators.",
    duration_hours: 1.0,
    topicArea: "Personal Development"
  }
];

// ============================================================================
// SEED DATA FUNCTIONS
// ============================================================================

/**
 * Seed the database with sample topics, content, and user data
 */
export async function seedDatabase(options?: {
  includeUserData?: boolean;
  testUserId?: string;
  contentCount?: number;
}) {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Ensure topics exist (should be created by migration)
    const topics = await sharedContentAPI.getActiveTopics();
    console.log(`✅ Found ${topics.length} topics`);

    // 2. Create sample content
    const contentCount = options?.contentCount || SAMPLE_CONTENT.length;
    const createdContent = [];

    for (let i = 0; i < contentCount; i++) {
      const sampleData = SAMPLE_CONTENT[i % SAMPLE_CONTENT.length];
      
      console.log(`📝 Creating content: ${sampleData.title}`);
      
      // Create content
      const content = await sharedContentAPI.createSharedContent({
        title: sampleData.title,
        source: sampleData.source,
        source_url: sampleData.source_url,
        transcript: sampleData.transcript,
        duration_hours: sampleData.duration_hours
      });

      // Find matching topic
      const matchingTopic = topics.find(t => 
        t.name.toLowerCase().includes(sampleData.topicArea.toLowerCase()) ||
        sampleData.topicArea.toLowerCase().includes(t.name.toLowerCase())
      );

      // Generate processed variants
      const summaries = generateContentSummaries(
        sampleData.title,
        sampleData.duration_hours,
        sampleData.topicArea
      );

      const questions = generateSampleQuestions(
        sampleData.title,
        sampleData.duration_hours,
        sampleData.topicArea
      );

      // Update content with processed variants
      const processedContent = await sharedContentAPI.updateContentWithProcessedVariants(
        content.id,
        {
          quick_summary: summaries.quick_summary,
          full_summary: summaries.full_summary,
          questions: questions
        },
        matchingTopic ? [matchingTopic.id] : undefined
      );

      createdContent.push(processedContent);
      console.log(`✅ Processed content: ${questions.length} questions generated`);
    }

    // 3. Create sample user data if requested
    if (options?.includeUserData && options?.testUserId) {
      console.log('👤 Creating sample user data...');
      await seedUserData(options.testUserId, createdContent.slice(0, 3)); // Add first 3 content items
    }

    console.log('🎉 Database seeding completed successfully!');
    return {
      topics: topics.length,
      content: createdContent.length,
      userDataCreated: !!options?.includeUserData
    };

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

/**
 * Create sample user data for testing
 */
async function seedUserData(userId: string, contentItems: any[]) {
  for (const content of contentItems) {
    try {
      // Add content to user library
      await sharedContentAPI.addContentToUserLibrary(userId, content.id);
      console.log(`📚 Added "${content.title}" to user library`);

      // Simulate some learning progress
      const questions = content.questions.slice(0, 5); // First 5 questions
      const questionResponses = questions.map((question: Question) => ({
        content_id: content.id,
        question_id: question.id,
        feedback: Math.random() > 0.3 ? 'got_it' : 'revisit' as any,
        response_time_seconds: 15 + Math.floor(Math.random() * 30)
      }));

      // Create a mock session
      const sessionPlan = {
        content_ids: [content.id],
        selected_questions: questions.map((q: Question) => ({
          content_id: content.id,
          question_id: q.id,
          question: q,
          estimated_time_seconds: q.estimated_time_seconds
        })),
        estimated_total_time_minutes: 10,
        difficulty_distribution: { '1': 1, '2': 1, '3': 2, '4': 1, '5': 0 } as any
      };

      const session = await sharedContentAPI.createLearningSession(
        userId,
        sessionPlan,
        'test_knowledge'
      );

      // Update progress
      await sharedContentAPI.updateUserProgress(
        userId,
        session.id,
        questionResponses
      );

      console.log(`📈 Created learning progress for "${content.title}"`);
    } catch (error) {
      console.warn(`⚠️ Failed to create user data for "${content.title}":`, error);
    }
  }
}

/**
 * Clean up all seeded data (for testing)
 */
export async function cleanupSeedData() {
  console.log('🧹 Cleaning up seed data...');

  try {
    // Delete all content (cascade deletes will handle related data)
    const { error: contentError } = await supabase
      .from('content')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except non-existent ID

    if (contentError && contentError.code !== 'PGRST116') { // PGRST116 = no rows found, which is ok
      throw contentError;
    }

    console.log('✅ Cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  const stats = await Promise.all([
    supabase.from('topics').select('*', { count: 'exact', head: true }),
    supabase.from('content').select('*', { count: 'exact', head: true }),
    supabase.from('user_content_library').select('*', { count: 'exact', head: true }),
    supabase.from('user_question_progress').select('*', { count: 'exact', head: true }),
    supabase.from('learning_sessions').select('*', { count: 'exact', head: true }),
    supabase.from('episode_topics').select('*', { count: 'exact', head: true })
  ]);

  return {
    topics: stats[0].count || 0,
    content: stats[1].count || 0,
    userContentLibrary: stats[2].count || 0,
    userQuestionProgress: stats[3].count || 0,
    learningSessions: stats[4].count || 0,
    episodeTopics: stats[5].count || 0
  };
}

// ============================================================================
// VALIDATION AND TESTING
// ============================================================================

/**
 * Validate the database schema and test basic operations
 */
export async function validateDatabaseSchema() {
  console.log('🔍 Validating database schema...');

  const tests = [
    {
      name: 'Topics table accessible',
      test: () => sharedContentAPI.getActiveTopics()
    },
    {
      name: 'Content creation',
      test: async () => {
        const content = await sharedContentAPI.createSharedContent({
          title: 'Test Content',
          source: 'podcast',
          source_url: 'https://test.com',
          transcript: 'Test transcript',
          duration_hours: 1.0
        });
        
        // Clean up
        await supabase.from('content').delete().eq('id', content.id);
        return content;
      }
    },
    {
      name: 'Database functions available',
      test: async () => {
        // Test calculate_sm2_review function
        const { data, error } = await supabase.rpc('calculate_sm2_review', {
          current_ease_factor: 2.5,
          current_interval_days: 1,
          current_repetitions: 0,
          performance_quality: 4
        });
        
        if (error) throw error;
        return data;
      }
    }
  ];

  const results = [];
  for (const test of tests) {
    try {
      await test.test();
      results.push({ name: test.name, status: 'PASS' });
      console.log(`✅ ${test.name}: PASS`);
    } catch (error) {
      results.push({ name: test.name, status: 'FAIL', error: String(error) });
      console.log(`❌ ${test.name}: FAIL - ${String(error)}`);
    }
  }

  return results;
}

// ============================================================================
// EXPORT
// ============================================================================

export const seedDataAPI = {
  seedDatabase,
  cleanupSeedData,
  getDatabaseStats,
  validateDatabaseSchema,
  generateSampleQuestions,
  SAMPLE_CONTENT
}; 