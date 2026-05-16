import { useState, useCallback, useRef, useMemo } from 'react';
import type { Word } from '@/types/word';
import { shuffleArray, generateChoices, type QuizMode } from '@/utils/quiz';

interface QuizAnswer {
  wordId: string;
  selected: string;
  correct: boolean;
}

export function useQuizSession(words: Word[], mode: QuizMode, allWords?: Word[]) {
  const [questions, setQuestions] = useState(() => shuffleArray(words));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const startTimeRef = useRef(Date.now());

  const currentWord = questions[currentIndex];
  const choicePool = allWords ?? words;
  const choices = useMemo(
    () => currentWord ? generateChoices(currentWord, choicePool, mode) : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentWord?.id, mode]
  );

  const answerQuestion = useCallback((selected: string) => {
    if (!currentWord || isAnswered) return;
    const correctAnswer =
      mode === 'en_to_ja' ? currentWord.japanese :
      mode === 'ja_to_en' ? currentWord.english :
      currentWord.englishDef;
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

  const reset = useCallback(() => {
    setQuestions(shuffleArray(words));
    setCurrentIndex(0);
    setAnswers([]);
    setIsAnswered(false);
    setIsFinished(false);
    startTimeRef.current = Date.now();
  }, [words]);

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
    answers,
    answerQuestion,
    nextQuestion,
    reset,
    mode,
  };
}
