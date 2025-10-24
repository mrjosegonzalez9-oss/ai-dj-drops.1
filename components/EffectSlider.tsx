
import React from 'react';

interface EffectSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const EffectSlider: React.FC<EffectSliderProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const backgroundStyle = {
    background: `linear-gradient(to right, #a855f7 ${percentage}%, #4b5563 ${percentage}%)`
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <span className="text-sm font-mono bg-gray-700 text-purple-300 px-2 py-0.5 rounded">
          {value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
        style={backgroundStyle}
      />
      <style jsx>{`
        .slider {
          -webkit-appearance: none;
          appearance: none;
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #d8b4fe;
          border: 2px solid #a855f7;
          border-radius: 50%;
          cursor: pointer;
          margin-top: -7px;
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #d8b4fe;
          border: 2px solid #a855f7;
          border-radius: 50%;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
