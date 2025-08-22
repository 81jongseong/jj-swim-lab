'use client';

import * as React from 'react';

interface InputProps {
  id?: string;
  name?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  defaultValue?: string;
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
  defaultValue
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
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );
};

export default Input; 