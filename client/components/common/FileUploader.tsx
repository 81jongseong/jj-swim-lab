/**
 * 범용 파일 업로더 컴포넌트
 * 
 * 컴포넌트 목적:
 * - 유지보수가 필요한 파일 업로드 기능을 통합
 * - 일관된 파일 업로드 UI 제공
 * 
 * 연동 파일:
 * - 모든 파일 업로드가 필요한 페이지
 */

'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, File } from 'lucide-react';

interface FileUploaderProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // MB
  label?: string;
  className?: string;
  showPreview?: boolean;
}

export default function FileUploader({
  onUpload,
  accept,
  multiple = false,
  maxSize = 10,
  label,
  className = '',
  showPreview = false
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setError('');

    // 파일 크기 검증
    const oversizedFiles = selectedFiles.filter(
      file => file.size > maxSize * 1024 * 1024
    );

    if (oversizedFiles.length > 0) {
      setError(`파일 크기는 ${maxSize}MB 이하여야 합니다.`);
      return;
    }

    const newFiles = multiple ? [...files, ...selectedFiles] : selectedFiles.slice(0, 1);
    setFiles(newFiles);
    onUpload(newFiles);
  };

  const handleRemove = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onUpload(newFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setError('');

    const oversizedFiles = droppedFiles.filter(
      file => file.size > maxSize * 1024 * 1024
    );

    if (oversizedFiles.length > 0) {
      setError(`파일 크기는 ${maxSize}MB 이하여야 합니다.`);
      return;
    }

    const newFiles = multiple ? [...files, ...droppedFiles] : droppedFiles.slice(0, 1);
    setFiles(newFiles);
    onUpload(newFiles);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          파일을 드래그 앤 드롭하거나 클릭하여 업로드
        </p>
        <p className="text-sm text-gray-500">
          최대 {maxSize}MB까지 업로드 가능
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {showPreview && files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <File className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024 / 1024).toFixed(2)}MB)
                </span>
              </div>
              <button
                onClick={() => handleRemove(index)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

