
import { useState, useEffect, useCallback, useRef } from 'react';
import type { PlaybackState } from '../types';

export const useSpeechSynthesis = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [progress, setProgress] = useState(0);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const populateVoiceList = useCallback(() => {
    const newVoices = window.speechSynthesis.getVoices();
    setVoices(newVoices);
    // Prefer a US English voice if available
    const preferredVoice = newVoices.find(voice => voice.lang === 'en-US' && voice.name.includes('Google')) || newVoices.find(voice => voice.lang === 'en-US') || newVoices[0];
    if (preferredVoice) {
      setSelectedVoice(preferredVoice);
    }
  }, []);

  useEffect(() => {
    populateVoiceList();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populateVoiceList;
    }
  }, [populateVoiceList]);

  const handleEnd = () => {
    setPlaybackState('ended');
    setProgress(100);
  };
  
  const handleBoundary = (event: SpeechSynthesisEvent) => {
      if (utteranceRef.current) {
          const totalLength = utteranceRef.current.text.length;
          const spokenLength = event.charIndex + event.charLength;
          setProgress((spokenLength / totalLength) * 100);
      }
  };

  const play = useCallback((text: string, voice: SpeechSynthesisVoice | null) => {
    if (!voice || !text) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.onend = handleEnd;
    utterance.onboundary = handleBoundary;
    utterance.onerror = (event) => {
      console.error("SpeechSynthesisUtterance.onerror", event);
      setPlaybackState('idle');
      setProgress(0);
    };
    
    utteranceRef.current = utterance;

    window.speechSynthesis.speak(utterance);
    setPlaybackState('playing');
    setProgress(0);
  }, []);

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setPlaybackState('paused');
    }
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPlaybackState('playing');
    }
  }, []);

  const cancel = useCallback(() => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setPlaybackState('idle');
        setProgress(0);
        utteranceRef.current = null;
    }
  }, []);

  return {
    voices,
    selectedVoice,
    setSelectedVoice,
    play,
    pause,
    resume,
    cancel,
    playbackState,
    progress
  };
};
