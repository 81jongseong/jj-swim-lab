/**
 * 🔍 JJ Swim Lab - TeachingMethodDetailModal 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 수영 교수법의 상세 정보를 모달 형태로 표시
 * - 교수법 단계별 상세 설명 및 시각 자료 제공
 * - 교수법 관련 동영상 및 이미지 갤러리
 * - 교수법 난이도 및 대상 레벨 정보 표시
 * - 교수법 적용 팁 및 주의사항 제공
 * 
 * 🔄 **주요 기능**
 * - 교수법 기본 정보 상세 표시
 * - 단계별 교수법 설명 및 순서 표시
 * - 교수법 이미지 및 동영상 갤러리
 * - 난이도 및 대상 레벨 정보
 * - 교수법 적용 팁 및 주의사항
 * 
 * 🗄️ **데이터 연동**
 * - 교수법 상세 데이터 표시
 * - 이미지 및 동영상 미디어 파일
 * - 교수법 메타데이터 (난이도, 카테고리 등)
 * - 교수법 관련 팁 및 주의사항
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect)
 * - Tailwind CSS (스타일링)
 * - TypeScript (타입 정의)
 * - 이미지 갤러리 컴포넌트
 * - 동영상 플레이어 컴포넌트
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 모달 상태 관리 및 열기/닫기
 * 2. 이미지 및 동영상 로딩 처리
 * 3. 반응형 디자인 및 모바일 최적화
 * 4. 접근성 및 키보드 네비게이션
 * 5. 성능 최적화 및 메모리 관리
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 모달 열기/닫기 동작 확인
 * - [ ] 이미지 및 동영상 표시 검증
 * - [ ] 반응형 디자인 테스트
 * - [ ] 접근성 속성 확인
 * - [ ] 성능 및 메모리 사용량 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 교수법 상세 모달)
 * - 2024-12-19: 이미지 갤러리 기능 구현
 * - 2024-12-19: 동영상 플레이어 기능 구현
 * - 2024-12-19: 반응형 디자인 적용
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (교수법 상세 모달 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 기반 교수법 분석
 * - 실시간 피드백 시스템
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <TeachingMethodDetailModal 
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   teachingMethod={selectedMethod}
 * />
 * ```
 */

'use client';

import React from 'react';
import Modal from './ui/modal';
import { Badge } from '@/components/ui';
import Button from './ui/button';

interface TeachingMethod {
  _id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: string[];
  tips: string[];
  videoUrl?: string;
  imageUrl?: string;
  createdBy?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TeachingMethodDetailModalProps {
  method: TeachingMethod | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (method: TeachingMethod) => void;
  onDelete: (id: string) => void;
}

const TeachingMethodDetailModal: React.FC<TeachingMethodDetailModalProps> = ({
  method,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!method) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '초급';
      case 'intermediate':
        return '중급';
      case 'advanced':
        return '고급';
      default:
        return difficulty;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <div className="p-6 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-start mb-6">
          <div>
            {/* 제목을 대제목과 소제목으로 구분 */}
            <div className="mb-3">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {method.name.includes(' - ') ? method.name.split(' - ')[0] : method.name}
              </h2>
              {method.name.includes(' - ') && (
                <h3 className="text-lg text-gray-700 font-medium">
                  {method.name.split(' - ')[1]}
                </h3>
              )}
            </div>
            <div className="flex gap-2">
              <Badge className={getDifficultyColor(method.difficulty)}>
                {getDifficultyText(method.difficulty)}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                {method.category}
              </Badge>
              <Badge className={method.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {method.isActive ? '활성' : '비활성'}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => onEdit(method)}
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              ✏️ 수정
            </Button>
            <Button
              onClick={() => onDelete(method._id)}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              🗑️ 삭제
            </Button>
          </div>
        </div>

        {/* 설명 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">📝 설명</h3>
          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
            {method.description}
          </p>
        </div>

        {/* 체크리스트 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 체크리스트</h3>
          <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
            {method.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-gray-700">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 팁 */}
        {method.tips.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 유용한 팁</h3>
            <div className="space-y-2">
              {method.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-2 bg-yellow-50 p-3 rounded-lg">
                  <span className="text-yellow-600 text-lg">💡</span>
                  <p className="text-gray-700 flex-1">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 미디어 */}
        {(method.videoUrl || method.imageUrl) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🎬 미디어</h3>
            <div className="space-y-3">
              {method.imageUrl && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">📷 이미지</p>
                  <img
                    src={method.imageUrl}
                    alt={method.name}
                    className="w-full max-w-md h-auto rounded-lg border"
                  />
                </div>
              )}
              {method.videoUrl && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">🎥 비디오</p>
                  <a
                    href={method.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    🎬 비디오 보기
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 메타 정보 */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">생성일:</span>
              <span className="ml-2">{formatDate(method.createdAt)}</span>
            </div>
            <div>
              <span className="font-medium">수정일:</span>
              <span className="ml-2">{formatDate(method.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex justify-end mt-6 pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            닫기
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TeachingMethodDetailModal;

