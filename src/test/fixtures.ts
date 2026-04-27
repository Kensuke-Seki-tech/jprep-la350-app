import type { Word } from '@/types/word'

export const mockWords: Word[] = [
  {
    id: 'w1', english: 'sapling', japanese: '苗木',
    englishDef: 'a young tree', partOfSpeech: 'n',
    ipa: '/ˈsæplɪŋ/', katakana: 'サプリング', emoji: '🌱',
    exampleEn: 'We planted a sapling.', exampleJa: '苗木を植えた。',
  },
  {
    id: 'w2', english: 'abolish', japanese: '廃止する',
    englishDef: 'to officially end or annul', partOfSpeech: 'v',
    exampleEn: 'They abolished the law.', exampleJa: '法律を廃止した。',
  },
  {
    id: 'w3', english: 'languid', japanese: 'けだるい',
    englishDef: 'weak and drooping from exhaustion', partOfSpeech: 'adj',
    exampleEn: 'A languid afternoon.', exampleJa: 'けだるい午後。',
  },
  {
    id: 'w4', english: 'pirouette', japanese: '回転',
    englishDef: 'to spin on the tip of one foot', partOfSpeech: 'v',
    exampleEn: 'She pirouetted gracefully.', exampleJa: '優雅に回転した。',
  },
  {
    id: 'w5', english: 'supple', japanese: 'しなやかな',
    englishDef: 'easily bent; flexible and not stiff', partOfSpeech: 'adj',
    exampleEn: 'Supple leather.', exampleJa: 'しなやかな革。',
  },
  {
    id: 'w6', english: 'intrepid', japanese: '勇敢な',
    englishDef: 'fearlessly bold and brave', partOfSpeech: 'adj',
    exampleEn: 'An intrepid explorer.', exampleJa: '勇敢な探検家。',
  },
]

export const mockQuizData = {
  weekId: 'week05',
  match: [
    { word: 'sapling', def: 'a young tree' },
    { word: 'abolish', def: 'to officially end or annul' },
    { word: 'languid', def: 'weak and drooping from exhaustion' },
    { word: 'pirouette', def: 'to spin on the tip of one foot' },
    { word: 'supple', def: 'easily bent; flexible and not stiff' },
    { word: 'intrepid', def: 'fearlessly bold and brave' },
    { word: 'fortify', def: 'to strengthen' },
    { word: 'tranquil', def: 'calm and peaceful' },
    { word: 'vigilant', def: 'keeping careful watch' },
    { word: 'rigid', def: 'unable to bend or be forced out of shape' },
  ],
  gap: [
    { answer: 'sapling', sentence: 'We planted a sapling in the garden.', ja: '苗木を植えた。' },
    { answer: 'abolish', sentence: 'They abolish the rule.', ja: '規則を廃止する。' },
    { answer: 'languid', sentence: 'A languid afternoon.', ja: 'けだるい午後。' },
    { answer: 'pirouette', sentence: 'She pirouettes on stage.', ja: '舞台で回転する。' },
    { answer: 'supple', sentence: 'The leather is supple.', ja: '革はしなやかだ。' },
  ],
  bank: ['sapling', 'abolish', 'languid', 'pirouette', 'supple', 'intrepid', 'fortify', 'tranquil', 'vigilant', 'rigid'],
  mc: [
    { q: 'What does "sapling" mean?', opts: ['a tree', 'a young tree', 'a flower', 'a leaf'], answer: 1, word: 'sapling' },
    { q: 'What does "abolish" mean?', opts: ['to start', 'to delay', 'to end', 'to extend'], answer: 2, word: 'abolish' },
    { q: 'What does "languid" mean?', opts: ['energetic', 'weak', 'angry', 'happy'], answer: 1, word: 'languid' },
    { q: 'What does "intrepid" mean?', opts: ['shy', 'lazy', 'brave', 'cruel'], answer: 2, word: 'intrepid' },
    { q: 'What does "tranquil" mean?', opts: ['noisy', 'calm', 'busy', 'angry'], answer: 1, word: 'tranquil' },
  ],
  dict: [
    { text: 'we planted a sapling in the garden last spring', word: 'sapling' },
    { text: 'they abolished the law', word: 'abolish' },
    { text: 'a languid afternoon by the river', word: 'languid' },
    { text: 'an intrepid explorer crossed the desert', word: 'intrepid' },
    { text: 'tranquil waters reflect the sky', word: 'tranquil' },
  ],
}

export const UA_IPHONE  = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
export const UA_ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
export const UA_DESKTOP = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
