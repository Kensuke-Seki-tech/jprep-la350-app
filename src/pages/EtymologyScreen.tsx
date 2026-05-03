import React, { useState, useCallback } from 'react';
import { useWeekStore, useWeeksConfig } from '@/hooks/useWeeks';
import { useWordData } from '@/hooks/useWordData';
import { useAudio } from '@/hooks/useAudio';
import { AudioButton } from '@/components/common/AudioButton';
import { SpeedControl } from '@/components/common/SpeedControl';
import type { Word, MorphemeType, AudioSpeed } from '@/types/word';

const MORPHEME_COLORS: Record<MorphemeType, { bg: string; text: string; border: string; label: string }> = {
  prefix: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    label: '接頭辞',
  },
  root: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
    label: '語根',
  },
  suffix: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-300',
    label: '接尾辞',
  },
};

export const EtymologyScreen: React.FC = () => {
  const { currentWeekId } = useWeekStore();
  const { data: weeksConfig, isLoading: weeksLoading } = useWeeksConfig();
  const availableWeeks = (weeksConfig ?? []).filter((w) => w.status === 'available');

  const [selectedWeekId, setSelectedWeekId] = useState(currentWeekId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);

  // 選択Weekの dataUrl を取得
  const selectedWeekConfig = (weeksConfig ?? []).find(w => w.weekId === selectedWeekId);
  const dataUrl = selectedWeekConfig?.dataUrl ?? null;

  const { data: words, isLoading, error } = useWordData(selectedWeekId, dataUrl);
  const { isPlaying, currentSpeed, setSpeed, speak, stop } = useAudio();

  const wordList: Word[] = words ?? [];
  const word: Word | undefined = wordList[currentIndex];

  const goTo = useCallback(
    (idx: number) => {
      stop();
      setCurrentIndex(Math.max(0, Math.min(idx, wordList.length - 1)));
      setShowMeaning(false);
    },
    [wordList.length, stop]
  );

  const handleSpeak = useCallback(
    (text: string, speed?: AudioSpeed) => {
      speak(text, speed);
    },
    [speak]
  );

  if (weeksLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 animate-pulse">読み込み中...</div>
      </div>
    );
  }

  if (error || !word) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-gray-500">
          <p className="text-lg mb-2">データを読み込めませんでした</p>
          <p className="text-sm">Weekを選択してください</p>
        </div>
      </div>
    );
  }

  const etym = word.etymology;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 overflow-x-hidden">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-bold text-gray-800">🔬 語源学習</h1>
            <SpeedControl
              currentSpeed={currentSpeed}
              onSpeedChange={setSpeed}
              showDictation={true}
            />
          </div>
          {/* Week選択 */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {availableWeeks.map((w) => (
              <button
                key={w.weekId}
                onClick={() => {
                  setSelectedWeekId(w.weekId);
                  setCurrentIndex(0);
                  setShowMeaning(false);
                  stop();
                }}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-all
                  ${selectedWeekId === w.weekId
                    ? 'bg-green-500 text-white font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 space-y-4">

        {/* 単語カード */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* 絵文字イラスト（フラッシュカードと共通） */}
          {word.emoji && (
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 flex justify-center items-center">
              <span className="text-8xl">{word.emoji}</span>
            </div>
          )}

          {/* 単語情報 */}
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="inline-block bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded mb-1">
                  {word.partOfSpeech}
                </span>
                <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                  {word.english}
                </h2>
                {/* IPA + 音声ボタン */}
                {word.ipa && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-blue-600 font-mono text-sm">{word.ipa}</span>
                    <AudioButton
                      text={word.english}
                      speed={currentSpeed}
                      isPlaying={isPlaying}
                      onSpeak={handleSpeak}
                      size="sm"
                    />
                    {word.katakana && (
                      <span className="text-gray-400 text-xs">→ {word.katakana}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <span className="text-sm text-gray-400">
                  {currentIndex + 1} / {wordList.length}
                </span>
              </div>
            </div>

            {/* 意味（タップで表示） */}
            <div className="mt-3">
              {showMeaning ? (
                <div className="space-y-1">
                  <p className="text-xl font-semibold text-gray-800">{word.japanese}</p>
                  <p className="text-sm text-gray-500 italic">{word.englishDef}</p>
                </div>
              ) : (
                <button
                  onClick={() => setShowMeaning(true)}
                  className="w-full py-2 rounded-lg bg-gray-50 border border-dashed border-gray-200
                    text-gray-400 text-sm hover:bg-gray-100 transition-colors"
                >
                  意味を表示 👆
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 語源分解パネル */}
        {etym && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
            <h3 className="text-base font-bold text-gray-700 flex items-center gap-1">
              🧩 語源分解
            </h3>

            {/* 形態素カラー表示 */}
            <div className="flex flex-wrap gap-3 items-start">
              {etym.morphemes.map((m, i) => {
                const color = MORPHEME_COLORS[m.type];
                return (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <span
                      className={`px-3 py-1.5 rounded-lg border font-bold text-lg
                        ${color.bg} ${color.text} ${color.border}`}
                    >
                      {m.part}
                    </span>
                    <span className={`text-xs ${color.text} opacity-80`}>
                      {color.label}
                    </span>
                    <span className="text-xs text-gray-500 max-w-24 text-center leading-tight">
                      {m.meaning}
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center mt-2">
                <span className="text-2xl text-gray-400 font-light px-1">=</span>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-800 border border-purple-300 font-bold text-base">
                    {word.english}
                  </span>
                  <span className="text-xs text-purple-700 opacity-80">完成形</span>
                </div>
              </div>
            </div>

            {/* 覚え方ヒント */}
            <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
              <p className="text-sm font-medium text-yellow-800 mb-1">💡 覚え方のコツ</p>
              <p className="text-sm text-yellow-700 whitespace-pre-line leading-relaxed">
                {etym.memoryTip}
              </p>
            </div>

            {/* 関連語 */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">🔗 同じ語根を持つ仲間</p>
              <div className="flex flex-wrap gap-2">
                {etym.relatedWords.map((rw, i) => (
                  <div key={i} className="flex items-center gap-1 bg-gray-50 rounded-full px-2 py-1 border border-gray-100">
                    <span className="text-sm text-gray-700">{rw}</span>
                    <AudioButton
                      text={rw}
                      speed={currentSpeed}
                      isPlaying={false}
                      onSpeak={handleSpeak}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 例文パネル */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          <h3 className="text-base font-bold text-gray-700">📝 例文</h3>
          <div className="space-y-1">
            <div className="flex items-start gap-2">
              <p className="text-sm text-gray-800 flex-1 leading-relaxed font-medium">
                {word.exampleEn}
              </p>
              <AudioButton
                text={word.exampleEn}
                speed={currentSpeed}
                isPlaying={isPlaying}
                onSpeak={handleSpeak}
                size="sm"
              />
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">{word.exampleJa}</p>
          </div>
        </div>

        {/* ナビゲーション */}
        <div className="flex items-center justify-between pb-6">
          <button
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="px-5 py-2.5 rounded-full bg-white border border-gray-200 text-gray-600
              hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm
              font-medium transition-all active:scale-95"
          >
            ← 前の単語
          </button>

          {/* ページインジケーター */}
          {wordList.length <= 10 ? (
            <div className="flex gap-1">
              {wordList.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all ${
                    i === currentIndex
                      ? 'w-4 h-3 bg-green-500'
                      : 'w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300'
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-200"
                  style={{ width: `${((currentIndex + 1) / wordList.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">{currentIndex + 1} / {wordList.length}</span>
            </div>
          )}

          <button
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex === wordList.length - 1}
            className="px-5 py-2.5 rounded-full bg-green-500 text-white
              hover:bg-green-600 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm
              font-medium transition-all active:scale-95"
          >
            次の単語 →
          </button>
        </div>
      </main>
    </div>
  );
};
