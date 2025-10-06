export enum PodcastGenerationStatus {
  WRITING = 'Crafting your podcast script...',
  RECORDING = 'Generating your audio with a high-quality voice...',
}

export type PlaybackState = 'idle' | 'playing' | 'paused' | 'ended';

export const GEMINI_VOICES = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'] as const;
export type GeminiVoice = typeof GEMINI_VOICES[number];
