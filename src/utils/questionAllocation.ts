import type { Question, DifficultyLevel } from '@/types/database.types';

export interface ContentQuestion {
  content_id: string;
  question_id: string;
  question: Question;
  estimated_time_seconds: number;
  content_title: string;
  content_duration_hours: number;
  priority_score: number;
}

export interface AllocationOptions {
  maxQuestions: number;
  targetDurationMinutes: number;
  difficultyPreference?: DifficultyLevel;
  balanceByDifficulty?: boolean;
  preventClustering?: boolean;
}

export interface AllocationResult {
  selected_questions: ContentQuestion[];
  content_distribution: Record<string, number>;
  difficulty_distribution: Record<DifficultyLevel, number>;
  estimated_total_time_minutes: number;
  allocation_strategy: string;
}

/**
 * Allocate questions across multiple content pieces with intelligent weighting
 */
export function allocateQuestions(
  availableQuestions: ContentQuestion[],
  options: AllocationOptions
): AllocationResult {
  const {
    maxQuestions,
    targetDurationMinutes,
    difficultyPreference,
    balanceByDifficulty = true,
    preventClustering = true
  } = options;

  // Sort questions by priority score (higher is better)
  const sortedQuestions = [...availableQuestions].sort((a, b) => b.priority_score - a.priority_score);

  // Calculate content weights based on duration
  const contentWeights = calculateContentWeights(sortedQuestions);

  // Apply weighted selection with difficulty balancing
  let selectedQuestions: ContentQuestion[] = [];
  
  if (balanceByDifficulty) {
    selectedQuestions = selectWithDifficultyBalance(
      sortedQuestions,
      maxQuestions,
      targetDurationMinutes,
      contentWeights,
      difficultyPreference
    );
  } else {
    selectedQuestions = selectByWeight(
      sortedQuestions,
      maxQuestions,
      targetDurationMinutes,
      contentWeights
    );
  }

  // Apply anti-clustering if requested
  if (preventClustering && selectedQuestions.length > 3) {
    selectedQuestions = preventQuestionClustering(selectedQuestions);
  }

  // Shuffle final selection for randomization
  selectedQuestions = shuffleArray(selectedQuestions);

  // Calculate distributions
  const contentDistribution = calculateContentDistribution(selectedQuestions);
  const difficultyDistribution = calculateDifficultyDistribution(selectedQuestions);
  const estimatedTime = selectedQuestions.reduce(
    (sum, q) => sum + q.estimated_time_seconds, 0
  ) / 60;

  return {
    selected_questions: selectedQuestions,
    content_distribution: contentDistribution,
    difficulty_distribution: difficultyDistribution,
    estimated_total_time_minutes: Math.round(estimatedTime * 10) / 10,
    allocation_strategy: balanceByDifficulty ? 'weighted-balanced' : 'weighted-priority'
  };
}

/**
 * Calculate content weights based on duration/insight density
 */
function calculateContentWeights(questions: ContentQuestion[]): Record<string, number> {
  const contentStats: Record<string, { duration: number; questionCount: number }> = {};

  // Aggregate content statistics
  questions.forEach(q => {
    if (!contentStats[q.content_id]) {
      contentStats[q.content_id] = {
        duration: q.content_duration_hours,
        questionCount: 0
      };
    }
    contentStats[q.content_id].questionCount++;
  });

  // Calculate weights (longer content + more questions = higher weight)
  const weights: Record<string, number> = {};
  const totalDuration = Object.values(contentStats).reduce((sum, stats) => sum + stats.duration, 0);

  Object.entries(contentStats).forEach(([contentId, stats]) => {
    // Base weight from content duration
    const durationWeight = stats.duration / totalDuration;
    
    // Insight density bonus (more questions per hour = higher quality)
    const insightDensity = stats.questionCount / stats.duration;
    const densityBonus = Math.min(insightDensity / 15, 1.0); // Cap at 15 questions/hour
    
    weights[contentId] = durationWeight * (1 + densityBonus * 0.3);
  });

  return weights;
}

/**
 * Select questions with difficulty distribution balancing
 */
function selectWithDifficultyBalance(
  questions: ContentQuestion[],
  maxQuestions: number,
  targetDurationMinutes: number,
  contentWeights: Record<string, number>,
  difficultyPreference?: DifficultyLevel
): ContentQuestion[] {
  const selected: ContentQuestion[] = [];
  const difficultyTargets: Record<DifficultyLevel, number> = {
    1: Math.round(maxQuestions * 0.1), // 10% easy
    2: Math.round(maxQuestions * 0.2), // 20% easy-medium
    3: Math.round(maxQuestions * 0.4), // 40% medium
    4: Math.round(maxQuestions * 0.2), // 20% medium-hard
    5: Math.round(maxQuestions * 0.1)  // 10% hard
  };

  // Adjust targets if user has difficulty preference
  if (difficultyPreference) {
    const preferredWeight = 0.5; // 50% of questions at preferred difficulty
    const otherWeight = 0.5 / 4; // Distribute remaining 50% across other levels
    
    Object.keys(difficultyTargets).forEach(level => {
      const diffLevel = parseInt(level) as DifficultyLevel;
      if (diffLevel === difficultyPreference) {
        difficultyTargets[diffLevel] = Math.round(maxQuestions * preferredWeight);
      } else {
        difficultyTargets[diffLevel] = Math.round(maxQuestions * otherWeight);
      }
    });
  }

  const difficultyQueues: Record<DifficultyLevel, ContentQuestion[]> = {
    1: questions.filter(q => q.question.difficulty_level === 1),
    2: questions.filter(q => q.question.difficulty_level === 2),
    3: questions.filter(q => q.question.difficulty_level === 3),
    4: questions.filter(q => q.question.difficulty_level === 4),
    5: questions.filter(q => q.question.difficulty_level === 5)
  };

  // Apply content weighting to each difficulty queue
  Object.keys(difficultyQueues).forEach(level => {
    const diffLevel = parseInt(level) as DifficultyLevel;
    difficultyQueues[diffLevel] = difficultyQueues[diffLevel].sort((a, b) => {
      const weightA = contentWeights[a.content_id] || 0;
      const weightB = contentWeights[b.content_id] || 0;
      return (weightB + b.priority_score) - (weightA + a.priority_score);
    });
  });

  let totalTimeSeconds = 0;
  const maxTimeSeconds = targetDurationMinutes * 60;

  // Select questions by difficulty targets
  Object.entries(difficultyTargets).forEach(([level, target]) => {
    const diffLevel = parseInt(level) as DifficultyLevel;
    const queue = difficultyQueues[diffLevel];
    let added = 0;

    for (const question of queue) {
      if (added >= target || selected.length >= maxQuestions) break;
      if (totalTimeSeconds + question.estimated_time_seconds > maxTimeSeconds) break;

      selected.push(question);
      totalTimeSeconds += question.estimated_time_seconds;
      added++;
    }
  });

  return selected;
}

/**
 * Select questions purely by weight and priority
 */
function selectByWeight(
  questions: ContentQuestion[],
  maxQuestions: number,
  targetDurationMinutes: number,
  contentWeights: Record<string, number>
): ContentQuestion[] {
  const selected: ContentQuestion[] = [];
  let totalTimeSeconds = 0;
  const maxTimeSeconds = targetDurationMinutes * 60;

  // Sort by combined weight and priority score
  const weightedQuestions = questions.sort((a, b) => {
    const scoreA = (contentWeights[a.content_id] || 0) + a.priority_score;
    const scoreB = (contentWeights[b.content_id] || 0) + b.priority_score;
    return scoreB - scoreA;
  });

  for (const question of weightedQuestions) {
    if (selected.length >= maxQuestions) break;
    if (totalTimeSeconds + question.estimated_time_seconds > maxTimeSeconds) break;

    selected.push(question);
    totalTimeSeconds += question.estimated_time_seconds;
  }

  return selected;
}

/**
 * Prevent clustering of questions from the same content
 */
function preventQuestionClustering(questions: ContentQuestion[]): ContentQuestion[] {
  const shuffled = [...questions];
  const maxConsecutive = 2; // Maximum consecutive questions from same content
  
  for (let i = 0; i < shuffled.length - maxConsecutive; i++) {
    let consecutiveCount = 1;
    const currentContentId = shuffled[i].content_id;
    
    // Count consecutive questions from same content
    for (let j = i + 1; j < shuffled.length && j < i + maxConsecutive + 1; j++) {
      if (shuffled[j].content_id === currentContentId) {
        consecutiveCount++;
      } else {
        break;
      }
    }
    
    // If too many consecutive, swap with a different content question
    if (consecutiveCount > maxConsecutive) {
      const swapIndex = findDifferentContentIndex(shuffled, i + maxConsecutive, currentContentId);
      if (swapIndex !== -1) {
        [shuffled[i + maxConsecutive], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[i + maxConsecutive]];
      }
    }
  }
  
  return shuffled;
}

/**
 * Find index of question from different content
 */
function findDifferentContentIndex(
  questions: ContentQuestion[], 
  startIndex: number, 
  excludeContentId: string
): number {
  for (let i = startIndex; i < questions.length; i++) {
    if (questions[i].content_id !== excludeContentId) {
      return i;
    }
  }
  return -1;
}

/**
 * Calculate content distribution
 */
function calculateContentDistribution(questions: ContentQuestion[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  
  questions.forEach(q => {
    distribution[q.content_id] = (distribution[q.content_id] || 0) + 1;
  });
  
  return distribution;
}

/**
 * Calculate difficulty distribution
 */
function calculateDifficultyDistribution(questions: ContentQuestion[]): Record<DifficultyLevel, number> {
  const distribution: Record<DifficultyLevel, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  };
  
  questions.forEach(q => {
    distribution[q.question.difficulty_level]++;
  });
  
  return distribution;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
} 