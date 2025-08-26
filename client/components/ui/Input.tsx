'use client';

import React from 'react';

interface InputProps {
  id?: string;
  name?: string;
  type?: string;
  value?: string;
  onChange?: (e: any) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  defaultValue?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  onKeyPress?: (e: any) => void;
  onKeyDown?: (e: any) => void;
  onKeyUp?: (e: any) => void;
}

const Input: React.FC<InputProps> = ({ 
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  required = false,
  defaultValue,
  min,
  max,
  step,
  onKeyPress,
  onKeyDown,
  onKeyUp
}) => {
  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      onKeyPress={onKeyPress}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );
};

export default Input; 