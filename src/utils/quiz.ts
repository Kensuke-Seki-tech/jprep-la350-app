import type { Word } from '@/types/word';

export type QuizMode = 'en_to_ja' | 'ja_to_en';

export function generateChoices(
  correct: Word,
  allWords: Word[],
  mode: QuizMode
): string[] {
  const getAnswer = (w: Word) => mode === 'en_to_ja' ? w.japanese : w.english;
  const correctAnswer = getAnswer(correct);
  const pool = allWords
    .filter(w => w.id !== correct.id)
    .map(getAnswer)
    .filter((v, i, a) => a.indexOf(v) === i); // dedupe

  const shuffledPool = pool.sort(() => Math.random() - 0.5);
  const distractors = shuffledPool.slice(0, 3);
  const choices = [...distractors, correctAnswer].sort(() => Math.random() - 0.5);
  return choices;
}

export function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}
