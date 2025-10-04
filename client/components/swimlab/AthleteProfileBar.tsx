/**
 * 🏊 SwimLab - 선수 프로필 바 (최종판)
 * 
 * 📋 **컴포넌트 목적**
 * - 상단 바에서 선수 여러 명을 칩으로 관리
 * - 현재 입력(컨디션/목표종목) 저장/불러오기
 * - 팀 단위 일괄 선택
 * - 목표 종목·기록 편집 모달
 * 
 * 🔄 **주요 기능**
 * - 선수 추가 (이름/아이콘 입력)
 * - 선수 선택/해제 (다중 선택)
 * - 현재 컨디션 저장
 * - 선수 프로필 불러오기
 * - 목표 종목·기록 편집
 * - 선수 삭제
 * - 모바일 반응형 (터치 타깃 40px+)
 * 
 * 🗄️ **데이터 연동**
 * - athletes.ts (저장/불러오기)
 * - MultiEventPicker (목표 편집)
 * - multiExport.ts (팀 내보내기)
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <AthleteProfileBar
 *   condIds={condIds}
 *   onLoad={(p) => setCondIds(p.conditionIds)}
 *   onBulkSelect={(ids) => setTeamSelectedIds(ids)}
 * />
 * ```
 */

'use client';
import React, { useEffect, useState } from 'react';
import { 
  listAthletes, 
  upsertAthlete, 
  removeAthlete, 
  newAthlete, 
  getAthlete, 
  type AthleteProfile,
  type RaceTarget 
} from '@/lib/swimlab/utils/athletes';
import MemberSelectModal from './MemberSelectModal';

// MultiEventPicker 모의 컴포넌트 (실제로는 import)
function MultiEventPicker({ value, onChange }: { value: RaceTarget[]; onChange: (v: RaceTarget[]) => void }) {
  return (
    <div className="p-3 border rounded bg-gray-50">
      <div className="text-xs text-gray-600 mb-2">
        목표 종목·기록 편집 (실제로는 MultiEventPicker 사용)
      </div>
      <div className="text-xs">
        선택됨: {value.length}개
      </div>
    </div>
  );
}

export default function AthleteProfileBar({
  condIds, 
  onLoad, 
  onBulkSelect
}:{ 
  condIds: string[]; 
  onLoad: (p: AthleteProfile) => void; 
  onBulkSelect?: (ids: string[]) => void 
}){
  const [items, setItems] = useState<AthleteProfile[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<AthleteProfile | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  
  const refresh = () => setItems(listAthletes());

  useEffect(() => { refresh(); }, []);

  return (
    <>
    <div className="space-y-3">
      {/* 회원 불러오기 버튼 (강조) */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <div className="text-white">
              <div className="font-semibold">회원 불러오기</div>
              <div className="text-xs opacity-90">DB에서 실제 회원 정보를 가져옵니다</div>
            </div>
          </div>
          <button 
            className="px-4 py-2 bg-white hover:bg-gray-100 text-blue-600 font-medium rounded-lg min-h-[40px] shadow-md transition-all"
            onClick={() => setShowMemberModal(true)}
          >
            ➕ 불러오기
          </button>
        </div>
      </div>

      {/* 선수 목록 및 관리 버튼 영역 */}
      <div className="flex flex-wrap items-center gap-2 p-4 bg-white border-2 border-gray-200 rounded-lg">
        {/* 선수 목록 라벨 */}
        {items.length > 0 && (
          <div className="text-sm font-medium text-gray-600 mr-2">
            선수 목록 ({items.length}명):
          </div>
        )}

      {/* 선수 목록 (칩) - 모바일 터치 타깃 40px+ */}
      {items.map(p => {
        const active = selected.includes(p.id);
        return (
          <div key={p.id} className="relative group">
            <button 
              className={`px-3 py-2 text-xs md:text-sm border rounded transition-colors min-h-[40px] ${
                active
                  ? 'bg-black text-white border-black' 
                  : 'bg-white hover:bg-gray-50 border-gray-300'
              }`}
              onClick={() => {
                const next = active 
                  ? selected.filter(x => x !== p.id) 
                  : [...selected, p.id];
                setSelected(next);
                onBulkSelect?.(next);
              }}
            >
              <span className="mr-1">{p.icon || '🏊'}</span>
              {p.name}
            </button>
            
            {/* 호버 시 툴팁 */}
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50">
              <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap">
                <div className="font-medium mb-1">{p.name}</div>
                <div>컨디션: {p.conditionIds.length}개</div>
                {p.conditionIds.length > 0 && (
                  <div className="text-yellow-300 text-[10px] mt-1">
                    {p.conditionIds.slice(0, 3).join(', ')}
                    {p.conditionIds.length > 3 && ` +${p.conditionIds.length - 3}개`}
                  </div>
                )}
                <div className="text-gray-400 mt-1">
                  {active ? '✅ 선택됨 (클릭하여 해제)' : '클릭하여 선택'}
                </div>
              </div>
            </div>
          </div>
        );
      })}

        {/* 안내 메시지 (선수 없을 때) */}
        {items.length === 0 && (
          <div className="text-sm text-gray-400 py-2">
            위의 &quot;➕ 불러오기&quot; 버튼을 클릭하여 회원을 추가하세요
          </div>
        )}

        {/* 구분선 */}
        {items.length > 0 && (
          <div className="w-full border-t border-gray-300 my-2"></div>
        )}

        {/* 관리 버튼 라벨 */}
        {items.length > 0 && (
          <div className="w-full text-sm font-medium text-gray-600 mb-1">
            선수 관리 기능:
          </div>
        )}

      {/* 현재 컨디션 → 저장 (선택 1명 필요) - 모바일 터치 40px+ */}
      {items.length > 0 && (
      <button 
        className="border-2 rounded-lg px-4 py-2 text-sm bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-700 border-green-300 min-h-[44px] font-medium shadow-sm"
        onClick={() => {
          const id = selected[0]; 
          if (!id) return alert('저장할 선수를 하나 선택하세요.');
          const p = getAthlete(id); 
          if (!p) return;
          upsertAthlete({ ...p, conditionIds: condIds }); 
          refresh(); 
          alert(`${p.name}에게 현재 컨디션이 저장되었습니다.`);
        }}
      >
        💾 컨디션 저장
      </button>
      )}

      {/* 목표 편집 (선택 1명) - NEW! */}
      {items.length > 0 && (
      <button 
        className="border-2 rounded-lg px-4 py-2 text-sm bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 border-purple-300 min-h-[44px] font-medium shadow-sm"
        onClick={() => {
          const id = selected[0]; 
          if (!id) return alert('편집할 선수를 하나 선택하세요.');
          const p = getAthlete(id); 
          if (!p) return;
          setEditing(p);
        }}
      >
        🎯 목표 편집
      </button>
      )}

      {/* 불러오기 (선택 1명) */}
      {items.length > 0 && (
      <button 
        className="border-2 rounded-lg px-4 py-2 text-sm bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 text-blue-700 border-blue-300 min-h-[44px] font-medium shadow-sm"
        onClick={() => {
          const id = selected[0]; 
          if (!id) return alert('불러올 선수를 하나 선택하세요.');
          const p = getAthlete(id); 
          if (!p) return;
          onLoad(p);
          alert(`${p.name}의 프로필을 불러왔습니다.`);
        }}
      >
        📥 불러오기
      </button>
      )}

      {/* 삭제 (선택 1명) */}
      {items.length > 0 && (
      <button 
        className="border-2 rounded-lg px-4 py-2 text-sm bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 text-red-700 border-red-300 min-h-[44px] font-medium shadow-sm"
        onClick={() => {
          const id = selected[0]; 
          if (!id) return alert('삭제할 선수를 하나 선택하세요.');
          const p = getAthlete(id);
          if (!p) return;
          if (!confirm(`${p.name}을(를) 삭제하시겠습니까?`)) return;
          removeAthlete(id); 
          setSelected([]); 
          refresh();
        }}
      >
        🗑️ 삭제
      </button>
      )}

        {/* 선택 상태 표시 */}
        {selected.length > 0 && (
          <div className="w-full mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                ✅ 선택: {selected.length}명
              </span>
              <span className="text-gray-500 text-xs">
                프로그램 생성 시 이 {selected.length}명의 프로그램이 생성됩니다
              </span>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* 목표 편집 모달 (하단 드로어 형태 - 모바일 우선) */}
    {editing && (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center md:justify-center" onClick={() => setEditing(null)}>
        <div 
          className="bg-white rounded-t-2xl md:rounded-2xl p-4 w-full md:w-[640px] max-h-[85vh] overflow-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium text-base md:text-lg">
              {editing.icon || '🏊'} {editing.name} · 목표 종목·기록
            </div>
            <button 
              className="border rounded px-3 py-2 text-xs md:text-sm min-h-[40px]" 
              onClick={() => setEditing(null)}
            >
              ✕ 닫기
            </button>
          </div>
          
          <MultiEventPicker
            value={editing.raceTargets || []}
            onChange={(v: RaceTarget[]) => setEditing({ ...editing, raceTargets: v })}
          />
          
          <div className="mt-4 flex gap-2 justify-end">
            <button 
              className="border rounded px-4 py-2 text-sm bg-green-50 hover:bg-green-100 text-green-700 border-green-200 min-h-[44px]" 
              onClick={() => {
                if (!editing) return;
                upsertAthlete(editing);
                refresh();
                setEditing(null);
                alert('목표가 저장되었습니다!');
              }}
            >
              💾 저장
            </button>
          </div>
        </div>
      </div>
    )}

    {/* 회원 선택 모달 */}
    <MemberSelectModal
      isOpen={showMemberModal}
      onClose={() => setShowMemberModal(false)}
      multiSelect={true}
      onMultiSelect={(users) => {
        // 여러 회원을 한 번에 추가
        let addedCount = 0;
        
        users.forEach(user => {
          // 건강정보 자동 변환
          const healthProfile = {
            age: user.studentInfo?.age,
            height: user.studentInfo?.healthProfile?.height,
            weight: user.studentInfo?.healthProfile?.weight,
            chronicConditions: user.studentInfo?.healthProfile?.chronicConditions,
            allergies: user.studentInfo?.healthProfile?.allergies
          };
          
          const { auto: autoConditions } = require('@/lib/swimlab/utils/healthToCondition').convertHealthToConditions(healthProfile);

          // 새 선수 프로필 생성
          const newProfile: AthleteProfile = {
            id: `athlete_${user._id}`,
            name: user.name,
            icon: user.userType === 'student' ? '🏊‍♂️' : '👨‍🏫',
            conditionIds: autoConditions,
            cssPer100: undefined,
            stroke: 'FR',
            raceTargets: []
          };

          upsertAthlete(newProfile);
          addedCount++;
        });
        
        refresh();
        alert(
          `✅ ${addedCount}명이 선수 목록에 추가되었습니다!\n\n` +
          `💡 각 선수를 클릭하여 선택 후\n` +
          `추가 컨디션을 설정하고 저장하세요.`
        );
      }}
      onSelect={(user) => {
        // 건강정보 자동 변환
        const healthProfile = {
          age: user.studentInfo?.age,
          height: user.studentInfo?.healthProfile?.height,
          weight: user.studentInfo?.healthProfile?.weight,
          chronicConditions: user.studentInfo?.healthProfile?.chronicConditions,
          allergies: user.studentInfo?.healthProfile?.allergies
        };
        
        const { auto: autoConditions } = require('@/lib/swimlab/utils/healthToCondition').convertHealthToConditions(healthProfile);

        // 새 선수 프로필 생성
        const newProfile: AthleteProfile = {
          id: `athlete_${user._id}`,
          name: user.name,
          icon: user.userType === 'student' ? '🏊‍♂️' : '👨‍🏫',
          conditionIds: autoConditions, // ← 자동 변환된 기본 컨디션
          cssPer100: undefined,
          stroke: 'FR',
          raceTargets: []
        };

        upsertAthlete(newProfile);
        refresh();
        
        alert(
          `✅ ${user.name}님이 선수 목록에 추가되었습니다!\n\n` +
          `🔒 자동 설정된 컨디션: ${autoConditions.length}개\n` +
          `(나이, 만성질환, 알레르기 기반)\n\n` +
          `💡 추가로 당일 컨디션을 선택할 수 있습니다.`
        );
      }}
    />
    </>
  );
}

