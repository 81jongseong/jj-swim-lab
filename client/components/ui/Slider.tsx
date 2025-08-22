'use client';

import * as React from 'react';

interface SliderProps {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ 
    value = [0], 
    onValueChange, 
    min = 0, 
    max = 100, 
    step = 1, 
    disabled = false, 
    className = '' 
  }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled && onValueChange) {
        const newValue = parseFloat(e.target.value);
        onValueChange([newValue]);
      }
    };

    const currentValue = value[0] || min;
    const percentage = ((currentValue - min) / (max - min)) * 100;

    return (
      <div ref={ref} className={`relative w-full ${className}`}>
        <div className="relative h-2 w-full bg-gray-200 rounded-full">
          <div 
            className="absolute h-full bg-blue-600 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          className={`
            absolute inset-0 w-full h-2 opacity-0 cursor-pointer
            disabled:cursor-not-allowed
            ${className}
          `}
        />
        <div className="absolute -top-6 left-0 transform -translate-x-1/2">
          <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded">
            {currentValue}
          </div>
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export default Slider;
