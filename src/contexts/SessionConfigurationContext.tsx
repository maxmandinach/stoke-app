'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ContentWithTopics } from './ContentSelectionContext';

// Session configuration types
export type SessionType = 'summaries' | 'testing' | 'both';
export type SessionLength = 'quick' | 'medium' | 'extended';

export interface SessionTimeEstimate {
  summaries: number; // minutes
  testing: number; // minutes
  total: number; // minutes
}

export interface SessionStructure {
  totalContent: number;
  summariesCount: number;
  questionsCount: number;
  estimatedDuration: SessionTimeEstimate;
}

export interface SessionConfigurationState {
  sessionType: SessionType;
  sessionLength: SessionLength;
  selectedContent: ContentWithTopics[];
  sessionStructure: SessionStructure;
  isConfiguring: boolean;
  canStartSession: boolean;
  timeConstraints: {
    quick: { min: 1, max: 3 };
    medium: { min: 3, max: 5 };
    extended: { min: 5, max: 15 };
  };
}

type SessionConfigurationAction =
  | { type: 'SET_SESSION_TYPE'; payload: SessionType }
  | { type: 'SET_SESSION_LENGTH'; payload: SessionLength }
  | { type: 'SET_SELECTED_CONTENT'; payload: ContentWithTopics[] }
  | { type: 'START_CONFIGURATION' }
  | { type: 'RESET_CONFIGURATION' }
  | { type: 'CALCULATE_SESSION_STRUCTURE' };

const initialState: SessionConfigurationState = {
  sessionType: 'both',
  sessionLength: 'medium',
  selectedContent: [],
  sessionStructure: {
    totalContent: 0,
    summariesCount: 0,
    questionsCount: 0,
    estimatedDuration: { summaries: 0, testing: 0, total: 0 }
  },
  isConfiguring: false,
  canStartSession: false,
  timeConstraints: {
    quick: { min: 1, max: 3 },
    medium: { min: 3, max: 5 },
    extended: { min: 5, max: 15 }
  }
};

// Time estimation functions
function calculateSummaryTime(content: ContentWithTopics[], sessionLength: SessionLength): number {
  if (content.length === 0) return 0;
  
  // Base reading time per summary (in minutes)
  const baseTimePerSummary = {
    quick: 0.5, // 30 seconds per summary
    medium: 0.75, // 45 seconds per summary  
    extended: 1.0 // 1 minute per summary
  };
  
  return Math.round(content.length * baseTimePerSummary[sessionLength] * 10) / 10;
}

function calculateTestingTime(content: ContentWithTopics[], sessionLength: SessionLength): number {
  if (content.length === 0) return 0;
  
  const totalQuestions = content.reduce((sum, item) => sum + (item.total_questions || 0), 0);
  
  // Time per question based on session length (in minutes)
  const timePerQuestion = {
    quick: 0.25, // 15 seconds per question
    medium: 0.35, // 21 seconds per question
    extended: 0.5 // 30 seconds per question
  };
  
  // Apply length constraints to limit total questions
  const maxQuestions = {
    quick: 8, // Max 8 questions for quick sessions
    medium: 12, // Max 12 questions for medium sessions
    extended: 25 // Max 25 questions for extended sessions
  };
  
  const constrainedQuestions = Math.min(totalQuestions, maxQuestions[sessionLength]);
  return Math.round(constrainedQuestions * timePerQuestion[sessionLength] * 10) / 10;
}

function calculateSessionStructure(
  content: ContentWithTopics[],
  sessionType: SessionType,
  sessionLength: SessionLength
): SessionStructure {
  const summariesTime = sessionType !== 'testing' ? calculateSummaryTime(content, sessionLength) : 0;
  const testingTime = sessionType !== 'summaries' ? calculateTestingTime(content, sessionLength) : 0;
  const totalTime = summariesTime + testingTime;
  
  const totalQuestions = content.reduce((sum, item) => sum + (item.total_questions || 0), 0);
  
  return {
    totalContent: content.length,
    summariesCount: sessionType !== 'testing' ? content.length : 0,
    questionsCount: sessionType !== 'summaries' ? totalQuestions : 0,
    estimatedDuration: {
      summaries: summariesTime,
      testing: testingTime,
      total: totalTime
    }
  };
}

function sessionConfigurationReducer(
  state: SessionConfigurationState,
  action: SessionConfigurationAction
): SessionConfigurationState {
  switch (action.type) {
    case 'SET_SESSION_TYPE':
      const newSessionStructureForType = calculateSessionStructure(
        state.selectedContent,
        action.payload,
        state.sessionLength
      );
      return {
        ...state,
        sessionType: action.payload,
        sessionStructure: newSessionStructureForType,
        canStartSession: state.selectedContent.length > 0
      };

    case 'SET_SESSION_LENGTH':
      const newSessionStructureForLength = calculateSessionStructure(
        state.selectedContent,
        state.sessionType,
        action.payload
      );
      return {
        ...state,
        sessionLength: action.payload,
        sessionStructure: newSessionStructureForLength
      };

    case 'SET_SELECTED_CONTENT':
      const newSessionStructureForContent = calculateSessionStructure(
        action.payload,
        state.sessionType,
        state.sessionLength
      );
      return {
        ...state,
        selectedContent: action.payload,
        sessionStructure: newSessionStructureForContent,
        canStartSession: action.payload.length > 0
      };

    case 'START_CONFIGURATION':
      return {
        ...state,
        isConfiguring: true
      };

    case 'RESET_CONFIGURATION':
      return {
        ...initialState,
        selectedContent: state.selectedContent,
        sessionStructure: calculateSessionStructure(
          state.selectedContent,
          initialState.sessionType,
          initialState.sessionLength
        ),
        canStartSession: state.selectedContent.length > 0
      };

    case 'CALCULATE_SESSION_STRUCTURE':
      const recalculatedStructure = calculateSessionStructure(
        state.selectedContent,
        state.sessionType,
        state.sessionLength
      );
      return {
        ...state,
        sessionStructure: recalculatedStructure
      };

    default:
      return state;
  }
}

// Context creation
const SessionConfigurationContext = createContext<{
  state: SessionConfigurationState;
  dispatch: React.Dispatch<SessionConfigurationAction>;
} | null>(null);

// Context provider
export function SessionConfigurationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sessionConfigurationReducer, initialState);

  // Persist session configuration to localStorage
  useEffect(() => {
    const configData = {
      sessionType: state.sessionType,
      sessionLength: state.sessionLength
    };
    localStorage.setItem('stoke-session-config', JSON.stringify(configData));
  }, [state.sessionType, state.sessionLength]);

  // Restore session configuration from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('stoke-session-config');
    if (savedConfig) {
      try {
        const { sessionType, sessionLength } = JSON.parse(savedConfig);
        if (sessionType) {
          dispatch({ type: 'SET_SESSION_TYPE', payload: sessionType });
        }
        if (sessionLength) {
          dispatch({ type: 'SET_SESSION_LENGTH', payload: sessionLength });
        }
      } catch (error) {
        console.warn('Failed to restore session configuration:', error);
        localStorage.removeItem('stoke-session-config');
      }
    }
  }, []);

  return (
    <SessionConfigurationContext.Provider value={{ state, dispatch }}>
      {children}
    </SessionConfigurationContext.Provider>
  );
}

// Custom hook for using the context
export function useSessionConfiguration() {
  const context = useContext(SessionConfigurationContext);
  if (!context) {
    throw new Error('useSessionConfiguration must be used within a SessionConfigurationProvider');
  }
  return context;
}

// Action creators for cleaner component code
export const sessionConfigurationActions = {
  setSessionType: (sessionType: SessionType) => ({ type: 'SET_SESSION_TYPE' as const, payload: sessionType }),
  setSessionLength: (sessionLength: SessionLength) => ({ type: 'SET_SESSION_LENGTH' as const, payload: sessionLength }),
  setSelectedContent: (content: ContentWithTopics[]) => ({ type: 'SET_SELECTED_CONTENT' as const, payload: content }),
  startConfiguration: () => ({ type: 'START_CONFIGURATION' as const }),
  resetConfiguration: () => ({ type: 'RESET_CONFIGURATION' as const }),
  calculateSessionStructure: () => ({ type: 'CALCULATE_SESSION_STRUCTURE' as const })
}; 