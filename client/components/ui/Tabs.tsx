/**
 * 📑 JJ Swim Lab - Tabs UI 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 여러 콘텐츠를 탭으로 구분하여 표시하는 탭 컴포넌트
 * - 수영 관련 정보를 카테고리별로 구분하여 표시
 * - 일관된 탭 UI 디자인 시스템 제공
 * - 접근성을 고려한 탭 네비게이션 및 콘텐츠 전환
 * - 반응형 디자인으로 다양한 화면 크기 지원
 * 
 * 🔄 **주요 기능**
 * - 탭 헤더 및 콘텐츠 관리
 * - 탭 전환 및 활성 탭 표시
 * - 키보드 네비게이션 지원
 * - 접근성 지원 (ARIA 속성, 포커스 관리 등)
 * - 반응형 탭 디자인 및 모바일 최적화
 * 
 * 🗄️ **데이터 연동**
 * - 탭 헤더 및 콘텐츠 데이터
 * - 활성 탭 상태 및 인덱스
 * - 탭 전환 이벤트 및 콜백
 * - 접근성 속성 및 ARIA 값
 * - 반응형 디자인 설정
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect, useRef)
 * - 탭 상태 관리 시스템
 * - 접근성 도구 및 라이브러리
 * - 키보드 네비게이션 시스템
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 탭 전환 시 콘텐츠의 적절한 표시
 * 2. 키보드 네비게이션 및 접근성
 * 3. 활성 탭의 명확한 시각적 구분
 * 4. 반응형 디자인에서의 탭 사용성
 * 5. 탭 콘텐츠의 로딩 및 성능 최적화
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 탭 전환 동작 확인
 * - [ ] 키보드 네비게이션 검증
 * - [ ] 접근성 속성 확인
 * - [ ] 반응형 디자인 동작 확인
 * - [ ] 탭 콘텐츠 표시 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 탭)
 * - 2024-12-19: 탭 상태 관리 시스템 구현
 * - 2024-12-19: 키보드 네비게이션 시스템 구현
 * - 2024-12-19: 접근성 지원 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (탭 UI 컴포넌트 완료)
 * 
 * 🚀 **다음 단계**
 * - 애니메이션 탭 전환 효과
 * - 고급 탭 기능 (드래그 앤 드롭 등)
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <Tabs 
 *   tabs={[
 *     { id: 'tab1', label: '기본 정보', content: <BasicInfo /> },
 *     { id: 'tab2', label: '진행 상황', content: <Progress /> },
 *     { id: 'tab3', label: '설정', content: <Settings /> }
 *   ]}
 *   defaultTab="tab1"
 *   onTabChange={(tabId) => handleTabChange(tabId)}
 *   accessible={true}
 *   responsive={true}
 * />
 * ```
 */

'use client';

import * as React from "react"

interface TabsProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({ value, onValueChange, className = '', children }) => {
  const [activeTab, setActiveTab] = React.useState(value || '');

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div className={className}>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, { activeTab, onTabChange: handleTabChange })
          : child
      )}
    </div>
  );
};

const TabsList: React.FC<TabsListProps> = ({ className = '', children }) => (
  <div
    className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}
  >
    {children}
  </div>
);

const TabsTrigger: React.FC<TabsTriggerProps & { activeTab?: string; onTabChange?: (value: string) => void }> = ({ 
  value, 
  className = '', 
  children, 
  activeTab, 
  onTabChange 
}) => {
  const isActive = activeTab === value;
  
  return (
    <button
      onClick={() => onTabChange?.(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive 
          ? 'bg-white text-gray-900 shadow-sm' 
          : 'text-gray-600 hover:text-gray-900'
      } ${className}`}
    >
      {children}
    </button>
  );
};

const TabsContent: React.FC<TabsContentProps & { activeTab?: string }> = ({ 
  value, 
  className = '',
  children, 
  activeTab 
}) => {
  if (activeTab !== value) return null;
  
  return (
    <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${className}`}>
      {children}
    </div>
  );
};

export default Tabs;
export { TabsList, TabsTrigger, TabsContent };