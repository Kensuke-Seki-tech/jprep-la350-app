export type PartOfSpeech = 'n' | 'adj' | 'v' | 'adv' | 'phrase' | 'other';
export type WeekStatus = 'available' | 'coming_soon';
export type MorphemeType = 'prefix' | 'root' | 'suffix';
export type AudioSpeed = 1.0 | 0.7 | 0.5;

export interface Morpheme {
  part: string;
  type: MorphemeType;
  meaning: string;
}

export interface Etymology {
  morphemes: Morpheme[];
  imageDescription: string;
  relatedWords: string[];
  memoryTip: string;
}

export interface Word {
  id: string;
  english: string;
  japanese: string;
  englishDef: string;
  partOfSpeech: PartOfSpeech;
  ipa?: string;
  katakana?: string;
  emoji?: string;
  exampleEn: string;
  exampleJa: string;
  etymology?: Etymology;
}

export interface SentenceToRemember {
  text: string;
  ja?: string;
}

export interface WeekData {
  weekId: string;
  weekNumber: number;
  words: Word[];
  sentencesToRemember?: SentenceToRemember[];
}

export interface WeekConfig {
  weekId: string;
  weekNumber: number;
  label: string;
  status: WeekStatus;
  dataUrl: string | null;
  wordCount: number;
}

export interface WeeksConfig {
  version: string;
  weeks: WeekConfig[];
}
