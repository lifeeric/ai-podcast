import React, { useState, useCallback, useEffect } from 'react';
import { generatePodcastScript } from './services/geminiService';
import { useGeminiAudio } from './hooks/useGeminiAudio';
import { PodcastGenerationStatus, GEMINI_VOICES, type GeminiVoice, type PlaybackState } from './types';
import Header from './components/Header';
import TextAreaInput from './components/TextAreaInput';
import SettingsPanel from './components/SettingsPanel';
import AudioPlayer from './components/AudioPlayer';
import Loader from './components/Loader';

export default function App(): React.ReactElement {
  const [blogText, setBlogText] = useState<string>('');
  const [podcastScript, setPodcastScript] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<PodcastGenerationStatus | ''>('');
  const [error, setError] = useState<string | null>(null);

  const {
    play,
    pause,
    resume,
    stop,
    playbackState,
    error: audioError,
  } = useGeminiAudio();
  
  const [selectedVoice, setSelectedVoice] = useState<GeminiVoice>(GEMINI_VOICES[0]);

  useEffect(() => {
    // Clean up audio on component unmount
    return () => {
      stop();
    };
  }, [stop]);

  useEffect(() => {
    if (audioError) {
      setError(audioError);
    }
  }, [audioError]);

  const handleGeneratePodcast = useCallback(async () => {
    if (!blogText.trim()) {
      setError('Please paste your blog content first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPodcastScript('');
    await stop();

    try {
      setStatusMessage(PodcastGenerationStatus.WRITING);
      const script = await generatePodcastScript(blogText);
      setPodcastScript(script);
      
      setStatusMessage(PodcastGenerationStatus.RECORDING);
      await play(script, selectedVoice);

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate podcast. ${errorMessage}`);
      setPodcastScript('');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  }, [blogText, selectedVoice, play, stop]);

  const isPlayerVisible = podcastScript && playbackState !== 'idle';
  const isButtonDisabled = isLoading || !blogText.trim();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="mt-8 space-y-8">
          <div className="p-8 bg-slate-800/50 rounded-2xl shadow-lg border border-slate-700">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4">1. Paste Your Blog Content</h2>
            <TextAreaInput value={blogText} onChange={(e) => setBlogText(e.target.value)} />
          </div>

          <div className="p-8 bg-slate-800/50 rounded-2xl shadow-lg border border-slate-700">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4">2. Select a Voice</h2>
            <SettingsPanel
              voices={GEMINI_VOICES as unknown as string[]}
              selectedVoice={selectedVoice}
              onVoiceChange={(v) => setSelectedVoice(v as GeminiVoice)}
              isDisabled={isLoading}
            />
          </div>

          <div className="flex flex-col items-center justify-center space-y-6">
            <button
              onClick={handleGeneratePodcast}
              disabled={isButtonDisabled}
              className="relative inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white transition-all duration-200 bg-cyan-600 rounded-md shadow-lg hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:text-slate-400 disabled:shadow-none"
            >
              {isLoading ? 'Generating...' : 'Generate Podcast'}
            </button>
            
            {error && <p className="text-red-400 text-center">{error}</p>}
            
            {isLoading && statusMessage && <Loader message={statusMessage} />}
          </div>
          
          {isPlayerVisible && (
            <div className="mt-10 p-8 bg-slate-800/50 rounded-2xl shadow-lg border border-slate-700">
              <h2 className="text-xl font-semibold text-cyan-300 mb-4">3. Enjoy Your Podcast</h2>
              <AudioPlayer
                playbackState={playbackState}
                onPlay={resume}
                onPause={pause}
                onStop={stop}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
