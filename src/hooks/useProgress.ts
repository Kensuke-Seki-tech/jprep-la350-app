import { useState, useCallback } from 'react';
import { getItem, setItem, userKey } from '@/utils/storage';
import type { QuizMode } from '@/utils/quiz';

export interface QuizAnswer {
  wordId: string;
  correct: boolean;
}

export interface QuizScore {
  scoreId: string;
  weekId: string;
  score: number;
  total: number;
  percentage: number;
  mode: 'en_to_ja' | 'ja_to_en' | 'en_to_en';
  timestamp: string;
  durationSec: number;
  answers?: QuizAnswer[];
}

export interface FlashcardResult {
  wordId: string;
  result: 'correct' | 'incorrect' | 'skipped';
}

export interface FlashcardScore {
  sessionId: string;
  weekId: string;
  correctCount: number;
  totalCount: number;
  results: FlashcardResult[];
  timestamp: string;
}

export interface PredictedQuizScore {
  sessionId: string;
  weekId: string;
  timestamp: string;
  score: number;
  maxScore: number;
  wrongItems: {
    match: string[];
    gap: string[];
    mc: string[];
    dict: string[];
  };
}

export function useProgress(userId: string | null) {
  const [_refresh, setRefresh] = useState(0);
  const refresh = useCallback(() => setRefresh(n => n + 1), []);

  const getQuizScores = useCallback((): QuizScore[] => {
    if (!userId) return [];
    return getItem<QuizScore[]>(userKey(userId, 'quiz_scores')) ?? [];
  }, [userId, _refresh]); // eslint-disable-line

  const getFlashcardScores = useCallback((): FlashcardScore[] => {
    if (!userId) return [];
    return getItem<FlashcardScore[]>(userKey(userId, 'flashcard_scores')) ?? [];
  }, [userId, _refresh]); // eslint-disable-line

  const getPredictedQuizScores = useCallback((): PredictedQuizScore[] => {
    if (!userId) return [];
    return getItem<PredictedQuizScore[]>(userKey(userId, 'predicted_quiz_scores')) ?? [];
  }, [userId, _refresh]); // eslint-disable-line

  const getWeekBestScore = useCallback((weekId: string): number | null => {
    const scores = getQuizScores().filter(s => s.weekId === weekId);
    if (scores.length === 0) return null;
    return Math.max(...scores.map(s => s.percentage));
  }, [getQuizScores]);

  const getWeekFlashcardCount = useCallback((weekId: string): number => {
    return getFlashcardScores().filter(s => s.weekId === weekId).length;
  }, [getFlashcardScores]);

  const getLastStudied = useCallback((weekId: string): string | null => {
    const quizDates = getQuizScores()
      .filter(s => s.weekId === weekId)
      .map(s => s.timestamp);
    const fcDates = getFlashcardScores()
      .filter(s => s.weekId === weekId)
      .map(s => s.timestamp);
    const all = [...quizDates, ...fcDates].sort().reverse();
    return all[0] ?? null;
  }, [getQuizScores, getFlashcardScores]);

  const getLastQuizWrongWordIds = useCallback((weekId: string, mode: QuizMode): string[] => {
    const scores = getQuizScores()
      .filter(s => s.weekId === weekId && s.mode === mode)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    if (scores.length === 0) return [];
    return (scores[0]!.answers ?? [])
      .filter(a => !a.correct)
      .map(a => a.wordId);
  }, [getQuizScores]);

  const getLastFlashcardWrongWordIds = useCallback((weekId: string): string[] => {
    const scores = getFlashcardScores()
      .filter(s => s.weekId === weekId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    if (scores.length === 0) return [];
    return scores[0]!.results
      .filter(r => r.result === 'incorrect')
      .map(r => r.wordId);
  }, [getFlashcardScores]);

  const getLastPredictedQuizWrong = useCallback((weekId: string): PredictedQuizScore['wrongItems'] | null => {
    const scores = getPredictedQuizScores()
      .filter(s => s.weekId === weekId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    if (scores.length === 0) return null;
    return scores[0]!.wrongItems;
  }, [getPredictedQuizScores]);

  const saveQuizResult = useCallback((
    result: Omit<QuizScore, 'scoreId' | 'timestamp'>
  ) => {
    if (!userId) return;
    const scores = getItem<QuizScore[]>(userKey(userId, 'quiz_scores')) ?? [];
    const newScore: QuizScore = {
      ...result,
      scoreId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    setItem(userKey(userId, 'quiz_scores'), [...scores, newScore]);
    refresh();
  }, [userId, refresh]);

  const saveFlashcardResult = useCallback((
    result: Omit<FlashcardScore, 'sessionId' | 'timestamp'>
  ) => {
    if (!userId) return;
    const scores = getItem<FlashcardScore[]>(userKey(userId, 'flashcard_scores')) ?? [];
    const newScore: FlashcardScore = {
      ...result,
      sessionId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    setItem(userKey(userId, 'flashcard_scores'), [...scores, newScore]);
    refresh();
  }, [userId, refresh]);

  const savePredictedQuizResult = useCallback((
    result: Omit<PredictedQuizScore, 'sessionId' | 'timestamp'>
  ) => {
    if (!userId) return;
    const scores = getItem<PredictedQuizScore[]>(userKey(userId, 'predicted_quiz_scores')) ?? [];
    const newScore: PredictedQuizScore = {
      ...result,
      sessionId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    setItem(userKey(userId, 'predicted_quiz_scores'), [...scores, newScore]);
    refresh();
  }, [userId, refresh]);

  return {
    getQuizScores,
    getFlashcardScores,
    getPredictedQuizScores,
    getWeekBestScore,
    getWeekFlashcardCount,
    getLastStudied,
    getLastQuizWrongWordIds,
    getLastFlashcardWrongWordIds,
    getLastPredictedQuizWrong,
    saveQuizResult,
    saveFlashcardResult,
    savePredictedQuizResult,
  };
}
