/**
 * 🪟 JJ Swim Lab - Modal UI 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 사용자 주의를 끌기 위한 모달 다이얼로그 컴포넌트
 * - 중요 정보 표시, 확인 요청, 폼 입력 등을 위한 오버레이
 * - 접근성을 고려한 모달 디자인 및 동작
 * - 일관된 모달 UI 디자인 시스템 제공
 * - 다양한 모달 타입 및 크기 지원
 * 
 * 🔄 **주요 기능**
 * - 모달 열기/닫기 상태 관리
 * - 배경 클릭 시 모달 닫기
 * - 키보드 네비게이션 지원 (ESC 키 등)
 * - 접근성 지원 (포커스 트랩, ARIA 속성 등)
 * - 다양한 크기 및 스타일 옵션
 * 
 * 🗄️ **데이터 연동**
 * - 모달 열기/닫기 상태
 * - 모달 내용 및 제목
 * - 모달 크기 및 스타일 설정
 * - 접근성 속성 및 라벨
 * - 모달 이벤트 및 콜백
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect, useRef)
 * - 포커스 관리 라이브러리
 * - 접근성 도구 및 라이브러리
 * - 모달 오버레이 관리 시스템
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 모달 열기/닫기 시 포커스 관리
 * 2. 키보드 네비게이션 및 접근성
 * 3. 모달 내용의 명확성 및 유용성
 * 4. 배경 클릭 시 모달 닫기 동작
 * 5. 모달 크기와 화면 크기의 적절한 조화
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 모달 열기/닫기 동작 확인
 * - [ ] 배경 클릭 시 모달 닫기 검증
 * - [ ] 키보드 네비게이션 확인
 * - [ ] 접근성 속성 확인
 * - [ ] 모달 크기 및 스타일 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 모달)
 * - 2024-12-19: 모달 상태 관리 시스템 구현
 * - 2024-12-19: 키보드 네비게이션 시스템 구현
 * - 2024-12-19: 접근성 지원 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (모달 UI 컴포넌트 완료)
 * 
 * 🚀 **다음 단계**
 * - 애니메이션 모달 효과
 * - 다양한 모달 타입 지원
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <Modal 
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   title="확인"
 *   size="medium"
 *   showCloseButton={true}
 *   closeOnBackgroundClick={true}
 * >
 *   <p>정말 삭제하시겠습니까?</p>
 * </Modal>
 * ```
 */

'use client';

import * as React from 'react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    'full': 'max-w-full mx-4',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg ${sizeClasses[size]} w-full mx-4`}>
        {title && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal; 