import { logger } from '@/lib/logger';
import React, { useState } from 'react';
import { Modal } from '@/components/ui';
import { Button } from '@/components/ui';

interface MemoItem {
  _id: string;
  content: string;
  type: 'info' | 'warning' | 'complaint' | 'special';
  createdAt: string;
  createdByName: string;
}

interface Member {
  _id: string;
  name: string;
  centerMemo?: string;
  centerMemos?: MemoItem[];
}

interface MemberMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onUpdateMemo: (memberId: string, memo: string, memoType: string) => Promise<void>;
  onDeleteMemo: (memberId: string, memoId: string) => Promise<void>;
}

export default function MemberMemoModal({ 
  isOpen, 
  onClose, 
  member, 
  onUpdateMemo, 
  onDeleteMemo 
}: MemberMemoModalProps) {
  const [memo, setMemo] = useState('');
  const [memoType, setMemoType] = useState<'info' | 'warning' | 'complaint' | 'special'>('info');

  if (!isOpen || !member) return null;

  const handleUpdateMemo = async () => {
    if (!memo.trim()) {
      alert('메모를 입력해주세요.');
      return;
    }
    
    try {
      await onUpdateMemo(member._id, memo, memoType);
      setMemo('');
      setMemoType('info');
    } catch (error) {
      logger.error('메모 업데이트 오류:', error);
    }
  };

  const handleDeleteMemo = async (memoId: string) => {
    if (confirm('이 메모를 삭제하시겠습니까?')) {
      try {
        await onDeleteMemo(member._id, memoId);
      } catch (error) {
        logger.error('메모 삭제 오류:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            📝 {member.name} 회원 메모 관리
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 메모 작성 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">새 메모 작성</label>
          <div className="space-y-3">
            <select
              value={memoType}
              onChange={(e) => setMemoType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="info">ℹ️ 일반 정보</option>
              <option value="warning">⚠️ 경고</option>
              <option value="complaint">📢 민원</option>
              <option value="special">⭐ 특이사항</option>
            </select>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full px-3 py- factor-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={4}
              placeholder="메모를 입력하세요..."
            />
            <Button
              onClick={handleUpdateMemo}
              variant="primary"
              className="w-full"
            >
              메모 저장
            </Button>
          </div>
        </div>

        {/* 메모 이력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">메모 이력</label>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {member.centerMemos && member.centerMemos.length > 0 ? (
              member.centerMemos.map((memoItem) => (
                <div key={memoItem._id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      {memoItem.type === 'info' ? 'ℹ️ 일반' :
                       memoItem.type === 'warning' ? '⚠️ 경고' :
                       memoItem.type === 'complaint' ? '📢 민원' :
                       memoItem.type === 'special' ? '⭐ 특이' :
                       'ℹ️ 일반'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(memoItem.createdAt).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 mb-1">{memoItem.content}</p>
                  <p className="text-xs text-gray-500">작성자: {memoItem.createdByName}</p>
                  <button 
                    onClick={() => handleDeleteMemo(memoItem._id)}
                    className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50 mt-2"
                  >
                    🗑️ 삭제
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">작성된 메모가 없습니다.</p>
            )}
          </div>
        </div>
        </div>
        
        {/* 버튼 */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
