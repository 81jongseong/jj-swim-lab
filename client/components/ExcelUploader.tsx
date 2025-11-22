/**
 * 📊 JJ Swim Lab - ExcelUploader 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - Excel 파일 업로드 및 파싱을 위한 시스템
 * - 다양한 데이터 형식의 Excel 파일 처리
 * - 업로드된 데이터의 유효성 검증
 * - 파싱된 데이터를 데이터베이스에 저장
 * 
 * 🔄 **주요 기능**
 * - Excel 파일 드래그 앤 드롭 업로드
 * - Excel 파일 파싱 및 데이터 추출
 * - 데이터 유효성 검증 및 에러 처리
 * - 파싱된 데이터 미리보기
 * - 데이터베이스 저장 및 동기화
 * 
 * 🗄️ **데이터 연동**
 * - Excel 파일 업로드 처리
 * - 파싱된 데이터 유효성 검증
 * - 데이터베이스 저장 API 연동
 * - 업로드 이력 및 로그 관리
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect, useCallback)
 * - Excel 파싱 라이브러리 (xlsx)
 * - Tailwind CSS (스타일링)
 * - TypeScript (타입 정의)
 * - 파일 업로드 관련 아이콘 (SVG)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. Excel 파일 형식 검증
 * 2. 대용량 파일 처리 성능 최적화
 * 3. 데이터 유효성 검증 로직
 * 4. 에러 처리 및 사용자 피드백
 * 5. 보안을 위한 파일 타입 제한
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] Excel 파일 업로드 기능 확인
 * - [ ] 파일 파싱 및 데이터 추출 검증
 * - [ ] 데이터 유효성 검증 로직 확인
 * - [ ] 에러 처리 및 피드백 검증
 * - [ ] 데이터베이스 저장 기능 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 Excel 업로더)
 * - 2024-12-19: Excel 파일 파싱 기능 구현
 * - 2024-12-19: 데이터 유효성 검증 시스템 구현
 * - 2024-12-19: 데이터베이스 저장 기능 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (Excel 업로드 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 기반 데이터 자동 검증
 * - 데이터 매핑 자동화
 * - 실시간 데이터 처리
 * - 배치 업로드 최적화
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <ExcelUploader 
 *   onDataParsed={(data) => handleDataParsed(data)}
 *   onUploadComplete={(result) => handleUploadComplete(result)}
 *   acceptedFileTypes={['.xlsx', '.xls']}
 * />
 * ```
 */

'use client';

import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';
import Button from './ui/button';
import Card from './ui/card';

interface ExcelUploaderProps {
  onUploadSuccess?: (data: any[]) => void;
  onUploadError?: (error: string) => void;
  acceptedTypes?: string[];
  maxSize?: number; // MB
  title?: string;
  description?: string;
}

export default function ExcelUploader({
  onUploadSuccess,
  onUploadError,
  acceptedTypes = ['.xlsx', '.xls', '.csv'],
  maxSize = 5,
  title = '엑셀 파일 업로드',
  description = '엑셀 파일을 드래그 앤 드롭하거나 클릭하여 업로드하세요'
}: ExcelUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // 파일 타입 검증
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!acceptedTypes.includes(fileExtension)) {
      setUploadStatus('error');
      setUploadMessage(`지원하지 않는 파일 형식입니다. ${acceptedTypes.join(', ')} 파일만 업로드 가능합니다.`);
      onUploadError?.(`지원하지 않는 파일 형식: ${fileExtension}`);
      return;
    }

    // 파일 크기 검증
    if (file.size > maxSize * 1024 * 1024) {
      setUploadStatus('error');
      setUploadMessage(`파일 크기가 너무 큽니다. 최대 ${maxSize}MB까지 업로드 가능합니다.`);
      onUploadError?.(`파일 크기 초과: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    setUploadedFile(file);
    setUploadStatus('idle');
    setUploadMessage('');
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    setUploadStatus('idle');
    setUploadMessage('');

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:5000/api/uploads/excel', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📥 ExcelUploader 서버 응답:', result);

        setUploadStatus('success');
        setUploadMessage('파일 업로드가 성공적으로 완료되었습니다!');

        // 파싱된 데이터를 uploadedFile 객체에 저장
        if (uploadedFile) {
          (uploadedFile as any).parsedData = result.data;
          console.log('📊 ExcelUploader에 저장된 파싱 데이터:', result.data);
        }

        console.log('📤 ExcelUploader에서 onUploadSuccess 호출:', result.data);
        console.log('🔍 onUploadSuccess 함수 존재 여부:', !!onUploadSuccess);

        if (onUploadSuccess) {
          onUploadSuccess(result.data);
        } else {
          console.error('❌ onUploadSuccess 함수가 정의되지 않음!');
        }
      } else {
        const error = await response.json();
        setUploadStatus('error');
        setUploadMessage(error.message || '파일 업로드 중 오류가 발생했습니다.');
        onUploadError?.(error.message || '업로드 실패');
      }
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage('네트워크 오류가 발생했습니다.');
      onUploadError?.('네트워크 오류');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadStatus('idle');
    setUploadMessage('');
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileSpreadsheet className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = () => {
    switch (uploadStatus) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card className="w-full">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{description}</p>

          {/* 드래그 앤 드롭 영역 */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-12 h-12 text-gray-400" />
              <div className="text-lg font-medium text-gray-700">
                파일을 여기에 드래그하거나
              </div>
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-input')?.click()}
                className="mt-2"
              >
                파일 선택
              </Button>
              <input
                id="file-input"
                type="file"
                accept={acceptedTypes.join(',')}
                onChange={handleFileInput}
                className="hidden"
              />
              <p className="text-sm text-gray-500">
                지원 형식: {acceptedTypes.join(', ')} | 최대 크기: {maxSize}MB
              </p>
            </div>
          </div>

          {/* 업로드된 파일 정보 */}
          {uploadedFile && (
            <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon()}
                  <div>
                    <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-600">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* 업로드 버튼 */}
          {uploadedFile && (
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  업로드 중...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  파일 업로드
                </>
              )}
            </Button>
          )}

          {/* 상태 메시지 */}
          {uploadMessage && (
            <div className={`p-3 rounded-lg ${getStatusColor()}`}>
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="text-sm">{uploadMessage}</span>
              </div>
            </div>
          )}

          {/* 파싱된 데이터 표시 */}
          {uploadStatus === 'success' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">파싱된 데이터</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p>• 총 행 수: {uploadedFile && (uploadedFile as any).parsedData?.totalRows || 0}</p>
                <p>• 컬럼: {uploadedFile && (uploadedFile as any).parsedData?.headers?.join(', ') || '없음'}</p>
              </div>

              {/* 데이터 미리보기 */}
              {uploadedFile && (uploadedFile as any).parsedData?.data && (
                <div className="mt-3">
                  <p className="text-xs text-green-600 mb-2">데이터 미리보기 (처음 3행):</p>
                  <div className="bg-white border border-green-200 rounded p-2 max-h-32 overflow-y-auto">
                    <pre className="text-xs text-green-800 whitespace-pre-wrap">
                      {JSON.stringify((uploadedFile as any).parsedData.data.slice(0, 3), null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
