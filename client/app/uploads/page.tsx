/**
 * 📁 JJ Swim Lab - 파일 업로드 페이지
 *
 * =============================================================================
 * 📋 **의존성 파일들**
 * =============================================================================
 * 🔗 **직접 의존성**:
 *   - @/utils/api (API 클라이언트 유틸리티)
 *   - React hooks (useState, useEffect)
 * 
 * 🔗 **연동되는 서버 API**:
 *   - /api/uploads (파일 업로드 API)
 *   - /api/uploads/files (업로드된 파일 목록 조회)
 *   - /api/uploads/files/:filename (파일 삭제)
 * 
 * 🔗 **데이터베이스 연동**:
 *   - Video 컬렉션 (업로드된 비디오 정보)
 *   - 파일 시스템 (uploads/ 디렉토리)
 *
 * =============================================================================
 * 🔄 **현재 구현된 기능들**
 * =============================================================================
 * ✅ **완전 구현**:
 *   - 파일 선택 및 업로드
 *   - 업로드된 파일 목록 조회
 *   - 파일 업로드 상태 관리
 *   - 업로드 완료 메시지 표시
 * 
 * ✅ **부분 구현**:
 *   - 파일 타입 검증
 *   - 파일 크기 제한
 * 
 * ❌ **미구현**:
 *   - 파일 미리보기
 *   - 파일 삭제 기능
 *   - 업로드 진행률 표시
 *   - 드래그 앤 드롭 업로드
 *
 * =============================================================================
 * ⚠️ **중요한 주의사항**
 * =============================================================================
 * 🚨 **파일 보안**: 업로드된 파일의 보안 검증 필요
 * 🚨 **파일 크기**: MAX_FILE_SIZE 환경변수로 제한
 * 🚨 **파일 타입**: 허용된 파일 타입만 업로드 가능
 * 🚨 **에러 처리**: 업로드 실패 시 적절한 에러 메시지 표시
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-13: 초기 파일 업로드 페이지 구현
 * - 2025-01-13: 파일 목록 조회 기능 추가
 * - 2025-01-13: 업로드 상태 관리 기능 추가
 * - 2025-01-13: API 클라이언트 연동 완료
 */

'use client';

import { useEffect, useState } from 'react';
import apiClient from '../../utils/api';

export default function UploadsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await apiClient.getMyUploads({ page: 1, limit: 20 });
    if (!res.error) setItems(res.data.items || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!file) return;
    
    // File을 FormData로 변환
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await apiClient.uploadFile(formData);
    if (res.error) setMessage(res.error);
    else {
      setMessage('업로드 완료: ' + (res.data as any).id);
      setFile(null);
      load();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">영상 업로드</h1>
        <div className="flex items-center gap-3">
          <input type="file" accept="video/*" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
          <button onClick={submit} className="px-4 py-2 bg-blue-600 text-white rounded">업로드</button>
          {message && <div className="text-sm text-gray-700">{message}</div>}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">내 업로드</h2>
          {loading ? (
            <p>로딩중...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((v) => (
                <div key={v._id} className="border rounded p-4 space-y-1">
                  <div className="font-medium">{v.originalName}</div>
                  <div className="text-sm text-gray-600">{v.mimetype} · {(v.size/1024/1024).toFixed(1)}MB</div>
                  <div className="text-sm">상태: <span className="font-medium">{v.status}</span></div>
                  <div className="text-xs text-gray-500">업로드: {new Date(v.createdAt).toLocaleString()}</div>
                  <div className="pt-2">
                    <a
                      className="text-blue-600 hover:underline text-sm"
                      href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/uploads/${v._id}/download`}
                      target="_blank"
                    >다운로드</a>
                    <a
                      className="ml-3 text-sm underline"
                      href={`/uploads/${v._id}`}
                    >상세</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


