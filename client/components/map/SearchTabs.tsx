/**
 * 🔍 검색 탭 컴포넌트
 * 
 * 📋 **컴포넌트 목적**:
 * - 검색 방식 선택 (지역/센터명/주소)
 * - 모던 탭 디자인
 * - 아이콘 + 텍스트
 * 
 * 🔗 **연동 파일**:
 * - client/app/map/page.tsx
 */

'use client';

interface SearchTabsProps {
  activeTab: 'region' | 'center' | 'address';
  onTabChange: (tab: 'region' | 'center' | 'address') => void;
}

export default function SearchTabs({ activeTab, onTabChange }: SearchTabsProps) {
  const tabs = [
    { id: 'region' as const, icon: '📍', label: '지역 선택' },
    { id: 'center' as const, icon: '🏊', label: '센터명' },
    { id: 'address' as const, icon: '🏠', label: '주소 검색' }
  ];

  return (
    <div className="mb-6">
      <div className="flex gap-3 p-1.5 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl shadow-inner">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex-1 px-4 py-4 rounded-lg font-semibold transition-all transform hover:scale-105
              ${activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:text-gray-900 shadow-sm hover:shadow-md'
              }
            `}
          >
            <div className="text-3xl mb-1">{tab.icon}</div>
            <div className="text-sm">{tab.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

