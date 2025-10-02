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

interface User {
  _id: string;
  name: string;
  email: string;
  userType: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin';
  studentInfo?: {
    age?: number;
    swimmingLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    healthProfile?: {
      height?: number;
      weight?: number;
      chronicConditions?: string[];
      allergies?: string[];
      activityLevel?: string;
    };
  };
}

interface MemberSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (user: User) => void;
  multiSelect?: boolean; // 다중 선택 모드
  onMultiSelect?: (users: User[]) => void;
}

export default function MemberSelectModal({ isOpen, onClose, onSelect, multiSelect = false, onMultiSelect }: MemberSelectModalProps) {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'student' | 'instructor'>('student');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]); // 다중 선택용

  // 회원 목록 불러오기
  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      // 인증이 필요한 API이므로 실패 시 데모 데이터 사용
      const response = await apiClient.get('/api/users/center-users?limit=100');
      if (response.success && response.data) {
        setMembers(response.data);
        return;
      }
    } catch (error) {
      console.warn('회원 목록 불러오기 실패, 데모 데이터 사용:', error);
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
              chronicConditions: ['shoulder_impingement'],
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
              chronicConditions: [],
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
              chronicConditions: ['knee_pain'],
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
    const matchesType = filterType === 'all' || member.userType === filterType;
    return matchesSearch && matchesType;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              회원 선택 {multiSelect && `(${selectedUsers.length}명 선택)`}
            </h3>
            {multiSelect && (
              <p className="text-sm text-gray-500 mt-1">
                💡 여러 회원을 선택할 수 있습니다
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
              <option value="student">학생</option>
              <option value="instructor">강사</option>
            </select>
          </div>
        </div>

        {/* 회원 목록 */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">회원 정보를 불러오는 중...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      } else {
                        setSelectedUsers([...selectedUsers, member]);
                      }
                    } else {
                      // 단일 선택 모드
                      onSelect(member);
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
                    <div>
                      <h4 className="font-semibold text-gray-900">{member.name}</h4>
                      <p className="text-sm text-gray-500">{member.email}</p>
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
            </div>
          )}
        </div>

        {/* 푸터 - 다중 선택 모드일 때만 */}
        {multiSelect && (
          <div className="p-6 border-t bg-gray-50">
            <button
              onClick={() => {
                if (selectedUsers.length === 0) {
                  alert('최소 1명 이상 선택하세요.');
                  return;
                }
                onMultiSelect?.(selectedUsers);
                setSelectedUsers([]);
                onClose();
              }}
              disabled={selectedUsers.length === 0}
              className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✅ {selectedUsers.length}명 추가하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

