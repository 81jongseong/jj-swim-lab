/**
 * 🏊 SwimLab - 회원 선택 모달
 * 
 * 📋 **컴포넌트 목적**
 * - 데이터베이스에서 실제 회원 정보를 불러와서 선택
 * - 선택한 회원의 정보를 선수 프로필로 변환
 * - 건강 정보를 컨디션으로 자동 매핑
 * 
 * 🔗 **연동 파일:**
 * - server/src/models/User.ts (회원 데이터)
 * - client/lib/swimlab/utils/athletes.ts (선수 프로필)
 * - client/components/swimlab/AthleteProfileBar.tsx (부모 컴포넌트)
 */

'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/api';
import { convertHealthToConditions } from '@/lib/swimlab/utils/healthToCondition';
import { CardGrid } from '@/components/common';
import { logger } from '@/lib/logger';

interface User {
  _id: string;
  name: string;
  email: string;
  userType: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin';
  groupClassName?: string; // 단체반 이름
  groupClassId?: string; // 단체반 ID
  studentInfo?: {
    age?: number;
    swimmingLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    currentLevel?: string; // 현재 레벨
    healthProfile?: {
      height?: number;
      weight?: number;
      chronicConditions?: string[];
      allergies?: string[];
      activityLevel?: string;
    };
    swimmingProfile?: {
      css?: {
        freestyle?: number;
        backstroke?: number;
        breaststroke?: number;
        butterfly?: number;
        lastUpdated?: string;
        updatedByRole?: 'self' | 'instructor';
      };
      preferredStrokes?: string[];
      trainingDays?: number[];
      currentGoal?: string;
      conditionIds?: string[];
    };
  };
}

interface MemberSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (user: User) => void;
  multiSelect?: boolean; // 다중 선택 모드
  onMultiSelect?: (users: User[]) => void;
  showVariablesModal?: (users: User[]) => void; // 변수 설정 모달 표시
}

export default function MemberSelectModal({ isOpen, onClose, onSelect, multiSelect = false, onMultiSelect, showVariablesModal }: MemberSelectModalProps) {
  
  useEffect(() => {
    if (isOpen) {
      logger.debug('MemberSelectModal props', {
        multiSelect,
        hasOnMultiSelect: !!onMultiSelect,
        hasShowVariablesModal: !!showVariablesModal,
        showVariablesModalType: typeof showVariablesModal
      });
    }
  }, [isOpen]);
  
  const [members, setMembers] = useState<User[]>([]);
  const [groupClasses, setGroupClasses] = useState<any[]>([]); // 단체반 목록
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'student' | 'instructor' | 'group'>('all');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]); // 다중 선택용 (개인 PT)
  const [selectedGroups, setSelectedGroups] = useState<any[]>([]); // 다중 선택용 (단체반)

  // 회원 목록 불러오기
  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      logger.debug('회원 불러오기 시작');
      
      // 단체반 회원 포함하여 전체 회원 불러오기
      const allUsersResponse = await apiClient.get('/api/users/center-users?limit=100&includeGroupStudents=true') as any;
      
      logger.api('회원 목록 API 응답', allUsersResponse);
      
      if (allUsersResponse.success && allUsersResponse.data) {
        let allUsers = Array.isArray(allUsersResponse.data) 
          ? allUsersResponse.data 
          : (allUsersResponse.data as any).users || [];
        
        logger.success(`총 ${allUsers.length}명의 회원 조회됨`);
        
        // 레벨 확인
        logger.debug('회원 레벨 샘플', allUsers.slice(0, 3).map((u: any) => ({
          name: u.name,
          currentLevel: u.studentInfo?.currentLevel,
          swimmingLevel: u.studentInfo?.swimmingLevel
        })));
        
        // 단체반 정보 가져오기
        try {
          const groupClassesResponse = await apiClient.get('/api/group-classes?status=active') as any;
          if (groupClassesResponse.success && (groupClassesResponse.data as any)?.groupClasses) {
            const groupClassesData = (groupClassesResponse.data as any).groupClasses;
            
            console.log(`📚 ${groupClassesData.length}개 단체반 정보 조회됨`);
            
            // 단체반 목록 state에 저장
            setGroupClasses(groupClassesData);
            
            // 각 사용자에 단체반 이름 추가
            allUsers = allUsers.map((user: any) => {
              const userClass = groupClassesData.find((gc: any) =>
                gc.students.some((s: any) => {
                  const match = s.userId === user._id || 
                               s.userId.toString() === user._id.toString() ||
                               (s.userId._id && s.userId._id.toString() === user._id.toString());
                  return match;
                })
              );
              
              if (userClass) {
                logger.debug(`${user.name} → ${userClass.className}`);
              }
              
              return {
                ...user,
                groupClassName: userClass?.className
              };
            });
          }
        } catch (groupError) {
          logger.warn('단체반 정보 불러오기 실패:', groupError);
        }
        
        setMembers(allUsers);
        setLoading(false);
        return;
      }
      
      logger.warn('API 응답이 비어있음, 데모 데이터 사용');
    } catch (error) {
      logger.warn('회원 목록 불러오기 실패, 데모 데이터 사용:', error);
    }
    
    // 데모 데이터 (API 실패 시 또는 개발 환경)
    setMembers([
        {
          _id: '1',
          name: '김민수',
          email: 'minsu@example.com',
          userType: 'student',
          studentInfo: {
            age: 25,
            swimmingLevel: 'intermediate',
            healthProfile: {
              height: 175,
              weight: 70,
              chronicConditions: ['어깨 충돌 증후군'],
              allergies: [],
              activityLevel: 'moderately_active'
            }
          }
        },
        {
          _id: '2',
          name: '이지은',
          email: 'jieun@example.com',
          userType: 'student',
          studentInfo: {
            age: 28,
            swimmingLevel: 'advanced',
            healthProfile: {
              height: 165,
              weight: 55,
              chronicConditions: ['무릎 앞통증 증후군'],
              allergies: ['chlorine'],
              activityLevel: 'very_active'
            }
          }
        },
        {
          _id: '3',
          name: '박준호',
          email: 'junho@example.com',
          userType: 'student',
          studentInfo: {
            age: 22,
            swimmingLevel: 'beginner',
            healthProfile: {
              height: 180,
              weight: 75,
              chronicConditions: ['무릎 인대 손상'],
              allergies: [],
              activityLevel: 'lightly_active'
            }
          }
        }
    ]);
    setLoading(false);
  };

  // 필터링된 회원 목록
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 필터 타입에 따라
    if (filterType === 'student') {
      return matchesSearch && !member.groupClassName; // 개인 PT만
    } else if (filterType === 'group') {
      return false; // 회원 목록에서는 단체반 회원 제외
    }
    return matchesSearch; // 전체
  });
  
  // 필터링된 단체반 목록
  const filteredGroups = groupClasses.filter(gc => {
    const matchesSearch = gc.className.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && (filterType === 'all' || filterType === 'group');
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              회원 선택 {multiSelect && selectedUsers.length + selectedGroups.length > 0 && 
                `(개인 PT ${selectedUsers.length}명, 단체반 ${selectedGroups.length}개)`}
            </h3>
            {multiSelect && (
              <p className="text-sm text-gray-500 mt-1">
                💡 개인 PT 회원과 단체반을 선택할 수 있습니다
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* 검색 및 필터 */}
        <div className="p-6 border-b space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="이름 또는 이메일로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="student">개인 PT</option>
              <option value="group">단체반</option>
            </select>
          </div>
        </div>

        {/* 회원 목록 */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">회원 정보를 불러오는 중...</p>
            </div>
          ) : (
            <div className="space-y-6 h-full">
              {/* 단체반 목록 */}
              {filteredGroups.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">📚</span>
                    <span>단체반</span>
                    <span className="text-sm text-gray-500">({filteredGroups.length}개)</span>
                  </h4>
                  <CardGrid mobileCols={1} desktopCols={3} gap={4} className="auto-rows-fr">
                    {filteredGroups.map((gc) => {
                      const isSelected = selectedGroups.some(g => g._id === gc._id);
                      
                      return (
                        <div
                          key={gc._id}
                          onClick={() => {
                            if (multiSelect) {
                              if (isSelected) {
                                setSelectedGroups(selectedGroups.filter(g => g._id !== gc._id));
                              } else {
                                setSelectedGroups([...selectedGroups, gc]);
                              }
                            } else {
                              // 단일 선택 시 단체반 전체 선택
                              setSelectedGroups([gc]);
                            }
                          }}
                          className={`border-2 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-purple-500 bg-purple-50' 
                              : 'border-gray-300 hover:border-purple-400'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                <span>📚</span>
                                <span>{gc.className}</span>
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">{gc.description}</p>
                            </div>
                            <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                              {gc.level === 'beginner' && '초급'}
                              {gc.level === 'intermediate' && '중급'}
                              {gc.level === 'advanced' && '상급'}
                              {gc.level === 'master' && '마스터'}
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <div>👥 {gc.currentStudents}/{gc.maxStudents}명</div>
                            <div>🏊 {gc.poolLength}m 풀</div>
                            <div>⏱️ {gc.schedule.duration}분</div>
                            <div>📅 주 {gc.schedule.dayOfWeek.length}회</div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t">
                            <button className={`w-full px-3 py-1 rounded text-sm font-medium transition-colors ${
                              isSelected
                                ? 'bg-purple-500 hover:bg-purple-600 text-white'
                                : 'bg-purple-500 hover:bg-purple-600 text-white'
                            }`}>
                              {isSelected ? '✅ 선택됨' : '선택'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </CardGrid>
                </div>
              )}
              
              {/* 개인 PT 회원 목록 */}
              {filteredMembers.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">🏊</span>
                    <span>개인 PT 회원</span>
                    <span className="text-sm text-gray-500">({filteredMembers.length}명)</span>
                  </h4>
                  <CardGrid mobileCols={1} desktopCols={3} gap={4} className="auto-rows-fr">
                    {filteredMembers.map((member) => {
                const isSelected = selectedUsers.some(u => u._id === member._id);
                
                return (
                <div
                  key={member._id}
                  onClick={() => {
                    if (multiSelect) {
                      // 다중 선택 모드
                      if (isSelected) {
                        setSelectedUsers(selectedUsers.filter(u => u._id !== member._id));
                        logger.debug(`선택 해제: ${member.name}`);
                      } else {
                        logger.debug(`선택 추가: ${member.name}`, {
                          currentLevel: member.studentInfo?.currentLevel,
                          swimmingLevel: member.studentInfo?.swimmingLevel,
                          memberKeys: Object.keys(member)
                        });
                        
                        // 전체 객체 깊은 복사
                        const fullMember = JSON.parse(JSON.stringify(member));
                        
                        logger.debug('복사된 fullMember', {
                          name: fullMember.name,
                          currentLevel: fullMember.studentInfo?.currentLevel,
                          keys: Object.keys(fullMember)
                        });
                        
                        setSelectedUsers([...selectedUsers, fullMember as any]);
                      }
                    } else {
                      // 단일 선택 모드 - 건강정보를 컨디션으로 변환
                      const convertedConditions = convertHealthToConditions(member.studentInfo?.healthProfile || {});
                      const memberWithConditions = {
                        ...member,
                        conditionIds: convertedConditions.auto
                      };
                      onSelect(memberWithConditions);
                      onClose();
                    }
                  }}
                  className={`border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{member.name}</h4>
                      <p className="text-sm text-gray-500">{member.email}</p>
                      {(member as any).groupClassName && (
                        <div className="mt-1 flex items-center gap-1">
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                            📚 {(member as any).groupClassName}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      member.userType === 'student' ? 'bg-blue-100 text-blue-700' :
                      member.userType === 'instructor' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {member.userType === 'student' ? '학생' :
                       member.userType === 'instructor' ? '강사' : '관리자'}
                    </span>
                  </div>

                  {member.studentInfo && (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">나이:</span>
                        <span className="font-medium">{member.studentInfo.age || '-'}세</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">수영 실력:</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          member.studentInfo.swimmingLevel === 'beginner' ? 'bg-yellow-100 text-yellow-700' :
                          member.studentInfo.swimmingLevel === 'intermediate' ? 'bg-green-100 text-green-700' :
                          member.studentInfo.swimmingLevel === 'advanced' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {member.studentInfo.swimmingLevel === 'beginner' ? '초급' :
                           member.studentInfo.swimmingLevel === 'intermediate' ? '중급' :
                           member.studentInfo.swimmingLevel === 'advanced' ? '상급' : '전문가'}
                        </span>
                      </div>
                      {member.studentInfo.healthProfile?.chronicConditions && member.studentInfo.healthProfile.chronicConditions.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">질환:</span>
                          <span className="text-xs text-red-600">{member.studentInfo.healthProfile.chronicConditions.length}개</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t">
                    <button className={`w-full px-3 py-1 rounded text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}>
                      {isSelected ? '✅ 선택됨' : '선택'}
                    </button>
                  </div>
                </div>
              );
              })}
                  </CardGrid>
                </div>
              )}
              
              {filteredMembers.length === 0 && filteredGroups.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 푸터 - 다중 선택 모드일 때만 */}
        {multiSelect && (
          <div className="p-6 border-t bg-gray-50">
            <button
              onClick={() => {
                if (selectedUsers.length === 0 && selectedGroups.length === 0) {
                  alert('최소 1명 이상 선택하세요.');
                  return;
                }
                
                logger.debug(`선택: 개인 PT ${selectedUsers.length}명, 단체반 ${selectedGroups.length}개`);
                
                // 단체반을 AthleteProfile 형식으로 변환
                const groupProfiles = selectedGroups.map(gc => ({
                  id: `group_${gc._id}`,
                  name: gc.className,
                  icon: '📚',
                  conditionIds: [],
                  cssPer100: undefined,
                  stroke: 'FR' as const,
                  raceTargets: [],
                  groupClassId: gc._id,
                  groupClassName: gc.className,
                  groupMembers: gc.students,
                  level: gc.level,
                  poolLength: gc.poolLength,
                  schedule: gc.schedule
                }));
                
                // 개인 PT 1명 이상 선택 시 변수 설정 모달 (단일 회원도 팝업 사용)
                if (selectedUsers.length >= 1 && selectedGroups.length === 0 && showVariablesModal) {
                  logger.debug(`→ 개인 PT ${selectedUsers.length}명: 변수 설정 모달`);
                  logger.debug('selectedUsers 전체', selectedUsers);
                  logger.debug('전달할 회원 데이터', selectedUsers.map(u => ({
                    name: u.name,
                    _id: u._id,
                    'studentInfo': u.studentInfo,
                    'studentInfo.currentLevel': u.studentInfo?.currentLevel,
                    level: (u as any).level
                  })));
                  showVariablesModal(selectedUsers);
                  onClose();
                  return;
                }
                
                // 단체반 선택 시 반별 설정 모달
                if (selectedGroups.length > 0 && showVariablesModal) {
                  logger.debug('→ 단체반 선택: 반별 설정 모달');
                  logger.debug('선택된 단체반', selectedGroups.map(gc => ({
                    className: gc.className,
                    level: gc.level
                  })));
                  
                  // 단체반을 회원처럼 변환해서 변수 설정 모달로 전달
                  const groupAsMembers = selectedGroups.map(gc => {
                    const converted = {
                      _id: gc._id,
                      name: gc.className,
                      email: `group@${gc._id}`,
                      userType: 'group' as any,
                      groupClassName: gc.className,
                      groupClassId: gc._id,
                      level: gc.level, // 단체반 레벨
                      poolLength: gc.poolLength,
                      schedule: gc.schedule,
                      studentInfo: {
                        currentLevel: gc.level, // 이 값이 중요!
                        swimmingProfile: {
                          mainStrokes: ['freestyle'],
                          excludedStrokes: [],
                          trainingDays: gc.schedule.dayOfWeek,
                          sessionsPerWeek: gc.schedule.dayOfWeek.length,
                          sessionDuration: gc.schedule.duration,
                          poolLength: gc.poolLength,
                          currentGoal: '체력 향상',
                          conditionIds: []
                        }
                      }
                    };
                    
                    logger.debug('단체반 변환 결과', {
                      name: converted.name,
                      level: converted.level,
                      'studentInfo.currentLevel': converted.studentInfo.currentLevel
                    });
                    
                    return converted;
                  });
                  
                  const allMembers = [...selectedUsers, ...groupAsMembers];
                  logger.debug('변수 설정 모달에 전달할 전체 데이터', allMembers);
                  logger.debug('상세', allMembers.map(m => ({
                    name: m.name,
                    'studentInfo 전체': m.studentInfo,
                    'studentInfo.currentLevel': m.studentInfo?.currentLevel,
                    level: (m as any).level,
                    'Object.keys': Object.keys(m)
                  })));
                  
                  logger.debug('showVariablesModal 호출 - 첫 번째 회원', allMembers[0]);
                  logger.debug('첫 번째 회원 keys', Object.keys(allMembers[0]));
                  
                  // 명시적으로 전체 데이터 확인
                  logger.debug('데이터 손실 체크', {
                    studentInfoExists: !!allMembers[0]?.studentInfo,
                    levelExists: !!(allMembers[0] as any)?.level
                  });
                  
                  if (!allMembers[0]?.studentInfo && !(allMembers[0] as any)?.level) {
                    logger.error('데이터 손실 감지!', {
                      selectedUsers,
                      selectedUsersLength: selectedUsers.length,
                      firstSelectedUser: selectedUsers[0],
                      firstGroupMember: groupAsMembers[0]
                    });
                  }
                  
                  if (showVariablesModal) {
                    logger.debug('showVariablesModal 함수 호출');
                    showVariablesModal(allMembers as any);
                  } else {
                    logger.error('showVariablesModal prop이 없음!');
                  }
                  onClose();
                  return;
                }
                
                // 나머지 케이스: 바로 추가
                logger.debug('→ 단일 선택 또는 혼합: 바로 추가');
                const combined = [...selectedUsers, ...groupProfiles];
                onMultiSelect?.(combined as any);
                setSelectedUsers([]);
                setSelectedGroups([]);
                onClose();
              }}
              disabled={selectedUsers.length === 0 && selectedGroups.length === 0}
              className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(() => {
                const total = selectedUsers.length + selectedGroups.length;
                
                if (selectedUsers.length > 0 && selectedGroups.length > 0) {
                  return `✅ 개인 PT ${selectedUsers.length}명 + 단체반 ${selectedGroups.length}개 추가`;
                } else if (selectedGroups.length > 0) {
                  return `📚 단체반 ${selectedGroups.length}개 추가`;
                } else if (selectedUsers.length > 1) {
                  return `⚙️ 개인 PT ${selectedUsers.length}명 개별 설정 진행`;
                } else if (selectedUsers.length === 1) {
                  return `✅ 1명 추가하기`;
                } else {
                  return '선택하세요';
                }
              })()}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

