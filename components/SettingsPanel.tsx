import React from 'react';

interface SettingsPanelProps {
  voices: string[];
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
  isDisabled: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ voices, selectedVoice, onVoiceChange, isDisabled }) => {
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onVoiceChange(event.target.value);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <label htmlFor="voice-select" className="font-medium text-slate-300">Podcast Voice:</label>
      <select
        id="voice-select"
        value={selectedVoice}
        onChange={handleSelectChange}
        disabled={isDisabled}
        className="w-full sm:w-auto flex-grow bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 disabled:bg-slate-700 disabled:cursor-not-allowed"
      >
        {voices.map((voice) => (
          <option key={voice} value={voice}>
            {voice}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SettingsPanel;
