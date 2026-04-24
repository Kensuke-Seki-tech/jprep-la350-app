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

      // preload='auto': browser starts buffering immediately to prevent start cutoff
      audio.preload = 'auto';
      audioRef.current = audio;

      // playback rate adjustment (Google TTS slow=true is approx 0.7x)
      // 0.5x (dictation) = slow=true + playbackRate 0.75
      if (targetSpeed === 0.5) {
        audio.playbackRate = 0.75;
      } else {
        audio.playbackRate = 1.0;
      }

      setIsPlaying(true);

      // Play helper with double-execution guard
      let playStarted = false;
      const startPlay = () => {
        if (playStarted) return;
        playStarted = true;
        audio.play().catch(() => {
          // CORS block -> fallback to Web Speech API
          setIsPlaying(false);
          fallbackWebSpeech(text, targetSpeed);
        });
      };

      // canplaythrough: enough data buffered, play immediately
      audio.addEventListener('canplaythrough', startPlay, { once: true });

      // Fallback: if canplaythrough doesn't fire within 300ms, play anyway
      const fallbackTimer = setTimeout(startPlay, 300);

      audio.onended = () => {
        clearTimeout(fallbackTimer);
        setIsPlaying(false);
        audioRef.current = null;
      };

      audio.onerror = () => {
        clearTimeout(fallbackTimer);
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

/** Web Speech API fallback (en-US priority) */
function fallbackWebSpeech(text: string, speed: AudioSpeed) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';

  // Prefer en-US voice
  const voices = window.speechSynthesis.getVoices();
  const enUSVoice = voices.find(
    (v) => v.lang === 'en-US' && !v.name.toLowerCase().includes('google')
  ) || voices.find((v) => v.lang.startsWith('en'));
  if (enUSVoice) utterance.voice = enUSVoice;

  // Speed mapping: 1.0x->1.0, 0.7x->0.7, 0.5x->0.5
  utterance.rate = speed;
  window.speechSynthesis.speak(utterance);
}
