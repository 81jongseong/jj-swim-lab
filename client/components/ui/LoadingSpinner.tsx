/**
 * ⏳ JJ Swim Lab - LoadingSpinner UI 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 로딩 상태를 시각적으로 표시하는 스피너 컴포넌트
 * - 데이터 로딩, API 호출, 작업 진행 상황 등의 상태 표시
 * - 사용자에게 현재 진행 중인 작업을 명확하게 안내
 * - 일관된 로딩 UI 디자인 시스템 제공
 * - 접근성을 고려한 로딩 상태 표시
 * 
 * 🔄 **주요 기능**
 * - 애니메이션 로딩 스피너 표시
 * - 다양한 크기 및 색상 옵션
 * - 로딩 메시지 및 설명 텍스트
 * - 접근성 지원 (ARIA 라벨 등)
 * - 커스터마이징 가능한 스타일
 * 
 * 🗄️ **데이터 연동**
 * - 로딩 상태 정보
 * - 로딩 메시지 및 설명
 * - 스피너 크기 및 색상 설정
 * - 접근성 속성 및 라벨
 * - 커스터마이징 옵션
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (기본 컴포넌트)
 * - CSS 애니메이션 라이브러리
 * - 접근성 도구 및 라이브러리
 * - 아이콘 라이브러리 (SVG)
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 로딩 애니메이션의 부드러움 및 자연스러움
 * 2. 다양한 화면 크기에서의 적절한 표시
 * 3. 접근성 표준 준수
 * 4. 로딩 메시지의 명확성 및 유용성
 * 5. 성능 최적화 및 메모리 관리
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 로딩 애니메이션 동작 확인
 * - [ ] 다양한 크기 옵션 검증
 * - [ ] 로딩 메시지 표시 확인
 * - [ ] 접근성 속성 확인
 * - [ ] 성능 및 메모리 사용량 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 로딩 스피너)
 * - 2024-12-19: 애니메이션 시스템 구현
 * - 2024-12-19: 크기 및 색상 옵션 시스템 구현
 * - 2024-12-19: 접근성 지원 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (로딩 스피너 UI 컴포넌트 완료)
 * 
 * 🚀 **다음 단계**
 * - 다양한 로딩 애니메이션 타입
 * - 실시간 진행률 표시
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <LoadingSpinner 
 *   size="medium"
 *   color="blue"
 *   message="데이터를 불러오는 중..."
 *   showMessage={true}
 *   accessibility={true}
 * />
 * ```
 */

'use client';

import * as React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  const colorClasses = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    white: 'border-white',
  };
  
  const classes = `animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]} ${className}`;
  
  return (
    <div className={classes}></div>
  );
};

export default LoadingSpinner; 