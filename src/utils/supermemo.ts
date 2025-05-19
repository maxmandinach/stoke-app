import { SM2Data } from '../types';

const MIN_EASE_FACTOR = 1.3;
const INITIAL_EASE_FACTOR = 2.5;

export const calculateNextReview = (
  quality: number,
  currentData: SM2Data
): SM2Data => {
  let { repetitions, ease_factor, interval } = currentData;

  // Calculate new ease factor
  const new_ease_factor = Math.max(
    MIN_EASE_FACTOR,
    ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  // Calculate new interval
  let new_interval;
  if (repetitions === 0) {
    new_interval = 1;
  } else if (repetitions === 1) {
    new_interval = 6;
  } else {
    new_interval = Math.round(interval * new_ease_factor);
  }

  return {
    repetitions: repetitions + 1,
    ease_factor: new_ease_factor,
    interval: new_interval,
    quality,
  };
};

export const createInitialSM2Data = (): SM2Data => ({
  repetitions: 0,
  ease_factor: INITIAL_EASE_FACTOR,
  interval: 0,
  quality: 0,
});

export const getNextReviewDate = (interval: number): Date => {
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);
  return nextReview;
}; 