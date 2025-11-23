/**
 * 🏊 SwimLab - 회원 프로필 바 (최종판)
 * 
 * 📋 **컴포넌트 목적**
 * - 상단 바에서 회원 여러 명을 칩으로 관리
 * - 현재 입력(컨디션/목표종목) 저장/불러오기
 * - 팀 단위 일괄 선택
 * - 목표 종목·기록 편집 모달
 * 
 * 🔄 **주요 기능**
 * - 회원 추가 (이름/아이콘 입력)
 * - 회원 선택/해제 (다중 선택)
 * - 현재 컨디션 저장
 * - 회원 프로필 불러오기
 * - 목표 종목·기록 편집
 * - 회원 삭제
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
import { logger } from '@/lib/logger';
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
import SearchBar from '@/components/common/SearchBar';

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

interface GroupedMember {
  type: 'individual' | 'group';
  name: string;
  members?: any[]; // 단체반인 경우 회원 목록
  profile?: AthleteProfile; // 개인인 경우 프로필
}

export default function AthleteProfileBar({
  condIds, 
  onLoad, 
  onBulkSelect,
  onBulkVariablesNeeded
}:{ 
  condIds: string[]; 
  onLoad: (p: AthleteProfile) => void;
  onBulkVariablesNeeded?: (members: any[]) => void; 
  onBulkSelect?: (ids: string[]) => void 
}){
  const [items, setItems] = useState<AthleteProfile[]>([]);
  const [groupedMembers, setGroupedMembers] = useState<GroupedMember[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<AthleteProfile | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const refresh = () => {
    const allAthletes = listAthletes();
    logger.debug(`Refresh: 총 ${allAthletes.length}개 항목 조회됨`);
    
    setItems(allAthletes);
    
    // 개인 PT와 단체반 구분
    const grouped: GroupedMember[] = [];
    
    allAthletes.forEach(athlete => {
      if ((athlete as any).groupClassId) {
        // 단체반
        logger.debug(`단체반: ${athlete.name}`);
        grouped.push({
          type: 'group',
          name: athlete.name,
          members: (athlete as any).groupMembers || []
        });
      } else {
        // 개인 PT
        logger.debug(`개인 PT: ${athlete.name}`);
        grouped.push({
          type: 'individual',
          name: athlete.name,
          profile: athlete
        });
      }
    });
    
    const individualCount = grouped.filter(g => g.type === 'individual').length;
    const groupCount = grouped.filter(g => g.type === 'group').length;
    logger.success(`그룹화 완료: 개인 PT ${individualCount}명, 단체반 ${groupCount}개`);
    setGroupedMembers(grouped);
  };

  useEffect(() => { refresh(); }, []);
  
  // 검색 필터링
  const filteredItems = items.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
    <div className="space-y-3">
      {/* 검색창 - 항상 표시 */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-3">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="🔍 회원 이름 검색..."
          icon={<span className="text-lg">🔍</span>}
        />
        {searchQuery && (
          <div className="text-xs text-gray-500 mt-2">
            {filteredItems.length}명 검색됨 / 전체 {items.length}명
          </div>
        )}
      </div>
      
      {/* 회원 불러오기 영역 */}
      <div className="flex flex-col gap-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg">
        <div className="text-sm text-gray-700">
          💡 <strong>[회원 불러오기]</strong> 버튼을 클릭하여 데이터베이스에서 회원을 선택하세요.
        </div>

      {/* 회원 불러오기 버튼 */}
      <button 
        className="border-2 rounded-lg px-4 py-2 text-sm bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 text-green-700 border-green-300 min-h-[44px] font-medium shadow-sm"
        onClick={() => setShowMemberModal(true)}
      >
        👥 회원 불러오기
      </button>
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
      showVariablesModal={(users) => {
        // 다중 선택 시 변수 설정 모달 표시
        console.log('📤 AthleteProfileBar showVariablesModal 받은 users:', users);
        console.log('첫 번째 user:', users[0]);
        console.log('첫 번째 user의 keys:', Object.keys(users[0]));
        
        if (onBulkVariablesNeeded) {
          console.log('📤 onBulkVariablesNeeded로 전달 직전');
          onBulkVariablesNeeded(users);
        }
      }}
      onMultiSelect={(items) => {
        console.log('🔍 선택된 항목들:', items.length);
        
        let individualCount = 0;
        let groupCount = 0;
        
        items.forEach(item => {
          // 단체반인지 확인 (groupClassId가 있으면 단체반)
          if ((item as any).groupClassId) {
            console.log(`📚 단체반 추가: ${item.name}`);
            
            // 단체반을 그대로 저장
            upsertAthlete(item as any);
            groupCount++;
          } else {
            console.log(`🏊 개인 PT 추가: ${item.name}`);
            
            // 개인 PT 회원 처리
            const healthProfile = {
              age: (item as any).studentInfo?.age,
              height: (item as any).studentInfo?.healthProfile?.height,
              weight: (item as any).studentInfo?.healthProfile?.weight,
              chronicConditions: (item as any).studentInfo?.healthProfile?.chronicConditions,
              allergies: (item as any).studentInfo?.healthProfile?.allergies
            };
            
            const { auto: autoConditions } = require('@/lib/swimlab/utils/healthToCondition').convertHealthToConditions(healthProfile);

            const newProfile: AthleteProfile = {
              id: `athlete_${(item as any)._id}`,
              name: item.name,
              icon: (item as any).userType === 'student' ? '🏊‍♂️' : '👨‍🏫',
              conditionIds: autoConditions,
              cssPer100: undefined,
              stroke: 'FR',
              raceTargets: []
            } as any;

            upsertAthlete(newProfile);
            individualCount++;
          }
        });
        
        refresh();
        
        if (groupCount > 0 && individualCount > 0) {
          alert(`✅ 개인 PT ${individualCount}명 + 단체반 ${groupCount}개 추가되었습니다!`);
        } else if (groupCount > 0) {
          alert(`✅ 단체반 ${groupCount}개 추가되었습니다!\n\n💡 단체반을 선택하면 반 전체를 위한 프로그램을 생성할 수 있습니다.`);
        } else {
          alert(`✅ 개인 PT ${individualCount}명이 추가되었습니다!`);
        }
      }}
      onSelect={(user) => {
        // 단체반 회원이면 개인이 아닌 반으로 추가해야 함
        if (user.groupClassName) {
          alert('⚠️ 이 회원은 단체반 소속입니다.\n\n"회원 불러오기"에서 여러 명을 선택하면\n단체반으로 자동 그룹화됩니다.');
          return;
        }
        
        // 개인 PT 회원만 개별 추가 가능
        const healthProfile = {
          age: user.studentInfo?.age,
          height: user.studentInfo?.healthProfile?.height,
          weight: user.studentInfo?.healthProfile?.weight,
          chronicConditions: user.studentInfo?.healthProfile?.chronicConditions,
          allergies: user.studentInfo?.healthProfile?.allergies
        };
        
        const { auto: autoConditions } = require('@/lib/swimlab/utils/healthToCondition').convertHealthToConditions(healthProfile);

        const newProfile: AthleteProfile = {
          id: `athlete_${user._id}`,
          name: user.name,
          icon: user.userType === 'student' ? '🏊‍♂️' : '👨‍🏫',
          conditionIds: autoConditions,
          cssPer100: undefined,
          stroke: 'FR',
          raceTargets: []
        } as any;

        upsertAthlete(newProfile);
        refresh();
        
        alert(
          `✅ ${user.name}님이 개인 PT 회원으로 추가되었습니다!\n\n` +
          `🔒 자동 설정된 컨디션: ${autoConditions.length}개\n` +
          `💡 클릭하여 선택 후 추가 컨디션을 설정하세요.`
        );
      }}
    />
    </>
  );
}

