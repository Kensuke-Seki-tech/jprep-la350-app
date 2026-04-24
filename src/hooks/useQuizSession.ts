import { useState, useCallback, useRef } from 'react';
import type { Word } from '@/types/word';
import { shuffleArray, generateChoices, type QuizMode } from '@/utils/quiz';

interface QuizAnswer {
  wordId: string;
  selected: string;
  correct: boolean;
}

export function useQuizSession(words: Word[], mode: QuizMode) {
  const questions = useState(() => shuffleArray(words))[0];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const startTimeRef = useRef(Date.now());

  const currentWord = questions[currentIndex];
  const choices = currentWord
    ? generateChoices(currentWord, words, mode)
    : [];

  const answerQuestion = useCallback((selected: string) => {
    if (!currentWord || isAnswered) return;
    const correctAnswer = mode === 'en_to_ja'
      ? currentWord.japanese
      : currentWord.english;
    const correct = selected === correctAnswer;
    setAnswers(prev => [...prev, {
      wordId: currentWord.id,
      selected,
      correct,
    }]);
    setIsAnswered(true);
  }, [currentWord, isAnswered, mode]);

  const nextQuestion = useCallback(() => {
    if (currentIndex >= questions.length - 1) {
      setIsFinished(true);
    } else {
      setCurrentIndex(i => i + 1);
      setIsAnswered(false);
    }
  }, [currentIndex, questions.length]);

  const score = answers.filter(a => a.correct).length;
  const total = questions.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000);

  return {
    currentWord,
    choices,
    currentIndex,
    total,
    score,
    percentage,
    durationSec,
    isAnswered,
    isFinished,
    answerQuestion,
    nextQuestion,
    mode,
  };
}
