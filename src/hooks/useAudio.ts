import { useState, useCallback, useRef } from 'react';
import type { AudioSpeed } from '../types/word';

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

function buildTTSUrl(text: string, speed: AudioSpeed): string {
  const encoded = encodeURIComponent(text);
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
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  const speak = useCallback(
    (text: string, speed?: AudioSpeed) => {
      const targetSpeed = speed ?? currentSpeed;
      stop();

      // Mobile browsers block cross-origin audio (Google TTS) reliably.
      // Use Web Speech API directly — it runs natively and respects the user gesture.
      if (isMobile) {
        webSpeechSpeak(text, targetSpeed, () => setIsPlaying(false));
        return;
      }

      const url = buildTTSUrl(text, targetSpeed);
      const audio = new Audio(url);
      audio.preload = 'auto';
      audioRef.current = audio;

      if (targetSpeed === 0.5) {
        audio.playbackRate = 0.75;
      }

      setIsPlaying(true);

      audio.play().catch(() => {
        setIsPlaying(false);
        audioRef.current = null;
        webSpeechSpeak(text, targetSpeed, () => setIsPlaying(false));
      });

      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setIsPlaying(false);
        audioRef.current = null;
        webSpeechSpeak(text, targetSpeed, () => setIsPlaying(false));
      };
    },
    [currentSpeed, stop]
  );

  const setSpeed = useCallback((speed: AudioSpeed) => {
    setCurrentSpeed(speed);
  }, []);

  return { isPlaying, currentSpeed, setSpeed, speak, stop };
}

function webSpeechSpeak(text: string, speed: AudioSpeed, onEnd: () => void) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = speed;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;

  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find(v => v.lang === 'en-US') || voices.find(v => v.lang.startsWith('en'));
  if (enVoice) utterance.voice = enVoice;

  window.speechSynthesis.speak(utterance);
}
