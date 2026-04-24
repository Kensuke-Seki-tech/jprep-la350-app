import { useState, useCallback, useRef } from 'react';
import type { AudioSpeed } from '../types/word';

// Google TTS URL builder — en-US を明示指定（バイブコーディング版の教訓）
function buildTTSUrl(text: string, speed: AudioSpeed): string {
  const encoded = encodeURIComponent(text);
  // Google Translate TTS: hl=en-US, slow パラメータは 0.5x 相当の遅読みに使用
  const slow = speed < 1.0 ? 'true' : 'false';
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=en-US&slow=${slow}&client=tw-ob`;
}

export interface UseAudioReturn {
  isPlaying: boolean;
  currentSpeed: AudioSpeed;
  setSpeed: (speed: AudioSpeed) => void;
  speak: (text: string, speed?: AudioSpeed) => void;
  stop: () => void;
}

export function useAudio(): UseAudioReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState<AudioSpeed>(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const speak = useCallback(
    (text: string, speed?: AudioSpeed) => {
      const targetSpeed = speed ?? currentSpeed;
      stop();

      const url = buildTTSUrl(text, targetSpeed);
      const audio = new Audio(url);
      audioRef.current = audio;

      // playback rate で細かい速度調整（Google TTS の slow=true は 0.7倍相当）
      // 0.5倍（ディクテーション用）は slow=true + playbackRate でさらにゆっくりに
      if (targetSpeed === 0.5) {
        audio.playbackRate = 0.75; // slow=true(約0.7x) × 0.75 ≈ 0.5x 相当
      } else {
        audio.playbackRate = 1.0;
      }

      setIsPlaying(true);

      audio.play().catch(() => {
        // CORS 等でブロックされた場合は Web Speech API へフォールバック
        setIsPlaying(false);
        fallbackWebSpeech(text, targetSpeed);
      });

      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setIsPlaying(false);
        audioRef.current = null;
        fallbackWebSpeech(text, targetSpeed);
      };
    },
    [currentSpeed, stop]
  );

  const setSpeed = useCallback((speed: AudioSpeed) => {
    setCurrentSpeed(speed);
  }, []);

  return { isPlaying, currentSpeed, setSpeed, speak, stop };
}

/** Web Speech API フォールバック（en-US 優先） */
function fallbackWebSpeech(text: string, speed: AudioSpeed) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';

  // en-US 音声を優先して選択
  const voices = window.speechSynthesis.getVoices();
  const enUSVoice = voices.find(
    (v) => v.lang === 'en-US' && !v.name.toLowerCase().includes('google')
  ) || voices.find((v) => v.lang.startsWith('en'));
  if (enUSVoice) utterance.voice = enUSVoice;

  // 速度マッピング: 1.0x→rate 1.0、0.7x→rate 0.7、0.5x→rate 0.5
  utterance.rate = speed;
  window.speechSynthesis.speak(utterance);
}
