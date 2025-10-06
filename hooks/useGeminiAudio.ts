
import { useState, useCallback, useRef } from 'react';
// FIX: The `LiveSession` type is not exported by the `@google/genai` library.
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import type { PlaybackState, GeminiVoice } from '../types';

// Audio Encoding/Decoding utilities based on Gemini documentation
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// FIX: The logic for converting float32 to int16 should match the Gemini API documentation.
function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


export const useGeminiAudio = () => {
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [error, setError] = useState<string | null>(null);

  // FIX: Since `LiveSession` is not exported, use `any` for the session ref type.
  const sessionRef = useRef<any | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const nextStartTimeRef = useRef(0);
  const turnCompleteRef = useRef(false);

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  const stop = useCallback(async () => {
    sourcesRef.current.forEach((source) => source.stop());
    sourcesRef.current.clear();
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      await audioContextRef.current.close();
    }
    audioContextRef.current = null;
    
    if (sessionRef.current) {
      sessionRef.current.close();
    }
    sessionRef.current = null;
    
    setPlaybackState('idle');
    turnCompleteRef.current = false;
  }, []);

  const play = useCallback(async (script: string, voice: GeminiVoice) => {
    if (sessionRef.current || audioContextRef.current) {
      await stop();
    }

    setPlaybackState('playing');
    setError(null);

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    audioContextRef.current = audioCtx;
    const outputNode = audioCtx.createGain();
    outputNode.connect(audioCtx.destination);
    
    nextStartTimeRef.current = 0;
    turnCompleteRef.current = false;

    try {
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            sessionPromise.then(session => {
              // Send the script text to the model to trigger the speech synthesis.
              session.sendRealtimeInput({ text: script });
            });
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
              const audioBuffer = await decodeAudioData(decode(audioData), audioContextRef.current, 24000, 1);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              
              sourcesRef.current.add(source);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (turnCompleteRef.current && sourcesRef.current.size === 0) {
                  setPlaybackState('ended');
                }
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
            }

            if (message.serverContent?.turnComplete) {
              turnCompleteRef.current = true;
              if (sourcesRef.current.size === 0) {
                 setPlaybackState('ended');
              }
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error("Gemini Live API Error:", e);
            setError("Failed to generate audio. Please try again.");
            stop();
          },
          onclose: () => {
             if (playbackState !== 'ended') {
                stop();
             }
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
          systemInstruction: `You are a professional podcast narrator. Read the text provided to you in a clear, engaging, and natural voice. Do not add any commentary or extra words before or after the provided text. Just read the text.`,
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (e) {
        console.error("Failed to connect to Gemini Live API:", e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(`Connection failed: ${errorMessage}`);
        await stop();
    }
  }, [stop, playbackState]);


  const pause = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      audioContextRef.current.suspend();
      setPlaybackState('paused');
    }
  }, []);

  const resume = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
      setPlaybackState('playing');
    }
  }, []);


  return { play, pause, resume, stop, playbackState, error };
};
