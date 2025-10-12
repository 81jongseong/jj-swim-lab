/**
 * 🚀 SwimLab - 빠른 액션 버튼 모음
 */

'use client';

interface QuickActionButtonsProps {
  onGroupProgramClick: () => void;
  onChecklistClick?: () => void;
}

export default function QuickActionButtons({
  onGroupProgramClick,
  onChecklistClick
}: QuickActionButtonsProps) {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-200 mb-6">
      <h3 className="font-semibold text-gray-900 mb-3">🚀 빠른 액션</h3>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onGroupProgramClick}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2 shadow-md transition-all hover:shadow-lg"
        >
          <span>📚</span>
          <span>단체반 프로그램 생성</span>
        </button>
        
        {onChecklistClick && (
          <button
            onClick={onChecklistClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 shadow-md transition-all hover:shadow-lg"
          >
            <span>✅</span>
            <span>학생 체크리스트</span>
          </button>
        )}
      </div>
      <p className="text-xs text-gray-600 mt-3">
        💡 단체반 프로그램: 전체 학생에게 동일한 프로그램 + 개인별 맞춤 조정 자동 생성
      </p>
    </div>
  );
}








