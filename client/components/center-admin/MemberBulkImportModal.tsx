import { logger } from '@/lib/logger';
import React, { useState } from 'react';
import { X, Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';

interface MemberBulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export default function MemberBulkImportModal({
  isOpen,
  onClose,
  onImportComplete
}: MemberBulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // 파일 선택
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  // 템플릿 다운로드
  const handleDownloadTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/member-bulk-import/template', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'member_template.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      logger.error('템플릿 다운로드 오류:', error);
      alert('템플릿 다운로드에 실패했습니다.');
    }
  };

  // 파일 업로드
  const handleUpload = async () => {
    if (!file) {
      alert('파일을 선택해주세요.');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/api/member-bulk-import/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data.data);
        
        if (data.data.success > 0) {
          setTimeout(() => {
            onImportComplete();
          }, 2000);
        }
      } else {
        const errorData = await response.json();
        alert(`업로드 실패: ${errorData.message}`);
      }
    } catch (error) {
      logger.error('파일 업로드 오류:', error);
      alert('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  // 모달 닫기
  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            회원 일괄 등록
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!result ? (
          <>
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2 text-blue-800">엑셀 파일 업로드 가이드</h3>
              <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                <li>아래 템플릿을 다운로드하세요.</li>
                <li>템플릿에 회원 정보를 입력하세요.</li>
                <li>작성한 파일을 업로드하세요.</li>
              </ol>
            </div>

            <div className="mb-6">
              <Button
                onClick={handleDownloadTemplate}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                템플릿 다운로드
              </Button>
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium">엑셀 파일 선택</label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  선택된 파일: {file.name}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                onClick={handleClose}
                variant="outline"
                disabled={uploading}
              >
                취소
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {uploading ? '업로드 중...' : '업로드'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className={`p-4 rounded-lg ${result.success > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center mb-2">
                  {result.success > 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  )}
                  <h3 className="font-semibold">
                    {result.success > 0 ? '일괄 등록 완료' : '일괄 등록 실패'}
                  </h3>
                </div>
                <div className="text-sm">
                  <p>✅ 성공: {result.success}명</p>
                  <p>❌ 실패: {result.failed}명</p>
                </div>
              </div>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-2">오류 상세</h4>
                <div className="max-h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                  {result.errors.map((error: any, index: number) => (
                    <div key={index} className="mb-2 text-sm">
                      <span className="font-medium">행 {error.row}:</span> {error.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleClose}
                className="bg-blue-600 hover:bg-blue-700"
              >
                확인
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


