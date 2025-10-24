
import React from 'react';
import type { EffectSettings } from '../types';
import { EffectSlider } from './EffectSlider';
import { PlayIcon } from './icons/PlayIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface AudioEditorProps {
  effectSettings: EffectSettings;
  setEffectSettings: React.Dispatch<React.SetStateAction<EffectSettings>>;
  onPlay: () => void;
  onDownload: () => void;
}

export const AudioEditor: React.FC<AudioEditorProps> = ({
  effectSettings,
  setEffectSettings,
  onPlay,
  onDownload
}) => {
  const handleSliderChange = (effect: keyof EffectSettings, value: number) => {
    setEffectSettings(prev => ({ ...prev, [effect]: value }));
  };

  return (
    <div className="border-t-2 border-purple-500/30 pt-6 mt-6 animate-fade-in">
        <h2 className="font-orbitron text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-400">
            4. Mini-Estudio de Efectos
        </h2>
        <div className="space-y-6">
            {/* EQ Controls */}
            <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-300">Ecualizador</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-900/50 p-4 rounded-lg">
                    <EffectSlider 
                        label="Bajos"
                        value={effectSettings.eqLow}
                        onChange={(val) => handleSliderChange('eqLow', val)}
                        min={-20} max={20} step={1}
                    />
                    <EffectSlider 
                        label="Medios"
                        value={effectSettings.eqMid}
                        onChange={(val) => handleSliderChange('eqMid', val)}
                        min={-20} max={20} step={1}
                    />
                    <EffectSlider 
                        label="Altos"
                        value={effectSettings.eqHigh}
                        onChange={(val) => handleSliderChange('eqHigh', val)}
                        min={-20} max={20} step={1}
                    />
                </div>
            </div>

            {/* Delay/Echo Controls */}
            <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-300">Eco (Delay)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-900/50 p-4 rounded-lg">
                    <EffectSlider 
                        label="Tiempo"
                        value={effectSettings.delayTime}
                        onChange={(val) => handleSliderChange('delayTime', val)}
                        min={0} max={1} step={0.01}
                    />
                    <EffectSlider 
                        label="Repetición"
                        value={effectSettings.delayFeedback}
                        onChange={(val) => handleSliderChange('delayFeedback', val)}
                        min={0} max={0.8} step={0.01}
                    />
                </div>
            </div>

            {/* Reverb Control */}
            <div>
                 <h3 className="text-lg font-semibold mb-3 text-gray-300">Reverb</h3>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                    <EffectSlider 
                        label="Cantidad"
                        value={effectSettings.reverb}
                        onChange={(val) => handleSliderChange('reverb', val)}
                        min={0} max={100} step={1}
                    />
                </div>
            </div>

            {/* Speed Control */}
            <div>
                 <h3 className="text-lg font-semibold mb-3 text-gray-300">Velocidad</h3>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                    <EffectSlider 
                        label="Velocidad"
                        value={effectSettings.playbackRate}
                        onChange={(val) => handleSliderChange('playbackRate', val)}
                        min={0.5} max={2.0} step={0.05}
                    />
                </div>
            </div>

             {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                    onClick={onPlay}
                    className="w-full font-orbitron text-md font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-6 py-3 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                    <PlayIcon />
                    Escuchar con FX
                </button>
                <button
                    onClick={onDownload}
                    className="w-full font-orbitron text-md font-bold bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-6 py-3 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                    <DownloadIcon />
                    Descargar WAV
                </button>
            </div>
        </div>
    </div>
  );
};