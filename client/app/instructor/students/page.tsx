/**
 * 👥 JJ Swim Lab - 강사용 회원 관리 페이지 (건강정보 포함)
 * 
 * 📋 **페이지 목적**
 * - 강사가 담당 회원들의 건강정보를 확인하고 적절한 수영 가이드라인 제공
 * - 회원별 건강 상태에 따른 수영법 추천/금지 사항 표시
 * - 안전한 수영 지도를 위한 건강정보 기반 의사결정 지원
 * 
 * 🔄 **주요 기능**
 * - 회원 목록 및 건강정보 조회
 * - 관절별 질환에 따른 수영법 안전도 표시
 * - 회원별 맞춤 수영 프로그램 추천
 * - 건강 상태 변경 시 알림 및 업데이트
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-22: 강사용 회원 건강정보 관리 시스템 구현
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import withAuth from '../../../components/withAuth';
import { Users, Heart, AlertTriangle, CheckCircle, XCircle, Info, Eye } from 'lucide-react';

interface MemberHealthInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  jointConditions: string[];
  cardiovascularConditions: string[];
  metabolicConditions: string[];
  swimmingExperience: string;
  medicalHistory: string;
  lastUpdated: string;
}

interface SwimmingSafety {
  stroke: string;
  safetyLevel: 'safe' | 'caution' | 'avoid' | 'prohibited';
  reason: string;
}

const InstructorStudentsPage: React.FC = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<MemberHealthInfo[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberHealthInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // 샘플 데이터 (실제로는 API에서 가져옴)
  useEffect(() => {
    // 실제로는 API 호출
    const sampleMembers = [
      {
        id: '1',
        name: '김수영',
        email: 'kim@example.com',
        phone: '010-1234-5678',
        jointConditions: ['spine_herniated_disc', 'shoulder_frozen_shoulder'],
        cardiovascularConditions: ['hypertension'],
        metabolicConditions: ['diabetes'],
        swimmingExperience: 'beginner',
        medicalHistory: '허리 디스크 수술 후 1년 경과, 어깨 오십견 치료 중',
        lastUpdated: '2025-01-20'
      },
      {
        id: '2',
        name: '이영수',
        email: 'lee@example.com',
        phone: '010-2345-6789',
        jointConditions: ['knee_osteoarthritis'],
        cardiovascularConditions: ['none'],
        metabolicConditions: ['obesity'],
        swimmingExperience: 'basic',
        medicalHistory: '무릎 관절염으로 인한 통증 관리 중',
        lastUpdated: '2025-01-19'
      },
      {
        id: '3',
        name: '박물수',
        email: 'park@example.com',
        phone: '010-3456-7890',
        jointConditions: ['ankle_sprain'],
        cardiovascularConditions: ['none'],
        metabolicConditions: ['none'],
        swimmingExperience: 'intermediate',
        medicalHistory: '발목 염좌 회복 중',
        lastUpdated: '2025-01-18'
      }
    ];
    // ⭐ 가나다순 정렬
    const sortedMembers = sampleMembers.sort((a, b) => 
      a.name.localeCompare(b.name, 'ko-KR')
    );
    setMembers(sortedMembers);
    setLoading(false);
  }, []);

  // 관절별 질환에 따른 수영법 구체적 동작 가이드라인 데이터
  const getSwimmingGuidanceForConditions = (conditions: string[]) => {
    const guidanceData: { [key: string]: any } = {
      spine_herniated_disc: {
        freestyle: { 
          level: 'caution', 
          reason: '척추 회전 동작이 디스크 압박을 증가시킬 수 있음',
          medicalEvidence: [
            '대한스포츠의학회 수영 처방 가이드라인 (2023)',
            'Spine Journal: Swimming for Herniated Disc Rehabilitation (2022)',
            '물리치료학회 척추 질환 운동 처방 (2024)',
            'American Journal of Physical Medicine & Rehabilitation: Aquatic Exercise for Spinal Disorders (2021)'
          ],
          detailedExplanation: '추간판 탈출증(허리 디스크)은 척추 사이의 디스크가 신경을 압박하여 통증과 저림을 유발하는 질환입니다. 자유형 수영 시 발생하는 척추 회전 동작은 디스크에 추가적인 압박을 가할 수 있어 주의가 필요합니다. 특히 급격한 회전이나 강한 스트로크는 디스크 압박을 증가시켜 증상을 악화시킬 수 있습니다.',
          allowedMovements: [
            '부드러운 팔 동작 (짧은 스트로크)',
            '가벼운 킥 동작',
            '자연스러운 호흡'
          ],
          prohibitedMovements: [
            '과도한 척추 회전',
            '강한 팔 스트로크',
            '급격한 방향 전환'
          ],
          modifications: [
            '회전 동작 최소화 (30도 이하)',
            '짧은 거리부터 시작 (25m 이하)',
            '수영 후 척추 스트레칭 필수'
          ],
          alternatives: ['backstroke', 'elementary_backstroke']
        },
        backstroke: { 
          level: 'safe', 
          reason: '척추를 자연스럽게 늘려주고 압박을 줄임',
          allowedMovements: [
            '자연스러운 척추 신전',
            '부드러운 팔 동작',
            '가벼운 킥 동작'
          ],
          prohibitedMovements: [
            '과도한 척추 아치',
            '강한 킥 동작'
          ],
          modifications: [
            '부드러운 킥 사용',
            '과도한 아치 자세 피하기'
          ],
          alternatives: []
        },
        breaststroke: { 
          level: 'avoid', 
          reason: '허리 아치 동작이 디스크에 압박을 가함',
          allowedMovements: [],
          prohibitedMovements: [
            '허리 아치 동작',
            '강한 킥 동작',
            '상체 들기 동작'
          ],
          modifications: [],
          alternatives: ['backstroke', 'elementary_backstroke']
        },
        butterfly: { 
          level: 'prohibited', 
          reason: '강한 척추 신전 동작이 디스크 손상을 악화시킬 수 있음',
          allowedMovements: [],
          prohibitedMovements: [
            '강한 척추 신전',
            '상체 들기 동작',
            '전체적인 동작'
          ],
          modifications: [],
          alternatives: ['elementary_backstroke']
        },
        elementary_backstroke: { 
          level: 'safe', 
          reason: '가장 부드러운 동작으로 척추에 부담이 적음',
          allowedMovements: [
            '부드러운 팔 동작',
            '가벼운 킥 동작',
            '자연스러운 호흡'
          ],
          prohibitedMovements: [],
          modifications: [],
          alternatives: []
        }
      },
      spine_simple_back_pain: {
        freestyle: { 
          level: 'safe', 
          reason: '근육 긴장 완화와 혈액 순환 개선에 효과적 (디스크와 달리 회전 제한 없음)',
          allowedMovements: [
            '자연스러운 팔 동작',
            '가벼운 킥 동작',
            '정상적인 회전 (45도 이하)',
            '자유로운 호흡'
          ],
          prohibitedMovements: [
            '급격한 동작',
            '과도한 회전 (60도 이상)',
            '강한 스트로크'
          ],
          modifications: [
            '부드러운 스트로크 사용',
            '과도한 회전 피하기',
            '점진적 거리 증가'
          ],
          alternatives: []
        },
        backstroke: { 
          level: 'safe', 
          reason: '척추를 자연스럽게 늘려주어 근육 긴장 완화 (디스크보다 안전)',
          allowedMovements: [
            '자연스러운 척추 신전',
            '부드러운 팔 동작',
            '가벼운 킥 동작',
            '정상적인 아치 자세'
          ],
          prohibitedMovements: [
            '과도한 아치 (디스크보다 관대)',
            '강한 킥 동작'
          ],
          modifications: [
            '부드러운 킥 사용',
            '자연스러운 아치 유지'
          ],
          alternatives: []
        },
        breaststroke: { 
          level: 'caution', 
          reason: '허리 아치 동작이 근육 긴장을 악화시킬 수 있음 (디스크보다 관대)',
          allowedMovements: [
            '부드러운 킥 동작',
            '가벼운 팔 동작',
            '제한된 아치 자세'
          ],
          prohibitedMovements: [
            '강한 허리 아치',
            '급격한 상체 들기',
            '과도한 킥 동작'
          ],
          modifications: [
            '아치 자세 최소화',
            '짧은 거리부터 시작',
            '부드러운 동작 유지'
          ],
          alternatives: ['freestyle', 'backstroke']
        },
        elementary_backstroke: { 
          level: 'safe', 
          reason: '가장 부드러운 동작으로 근육 긴장 완화에 효과적',
          allowedMovements: [
            '부드러운 팔 동작',
            '가벼운 킥 동작',
            '자연스러운 호흡',
            '자유로운 회전'
          ],
          prohibitedMovements: [],
          modifications: [],
          alternatives: []
        }
      },
      spine_cervical_disorder: {
        freestyle: { 
          level: 'avoid', 
          reason: '목 회전 동작이 경추 디스크나 협착을 악화시킬 수 있음',
          allowedMovements: [
            '부드러운 팔 동작',
            '가벼운 킥 동작'
          ],
          prohibitedMovements: [
            '목 회전 동작 (호흡 시)',
            '강한 팔 스트로크',
            '급격한 방향 전환',
            '목 신전 동작'
          ],
          modifications: [
            '목 회전 최소화',
            '부드러운 호흡',
            '짧은 거리부터 시작'
          ],
          alternatives: ['backstroke', 'elementary_backstroke']
        },
        backstroke: { 
          level: 'caution', 
          reason: '목 신전 동작이 경추에 부담을 줄 수 있음',
          allowedMovements: [
            '부드러운 팔 동작',
            '가벼운 킥 동작',
            '제한된 목 신전'
          ],
          prohibitedMovements: [
            '과도한 목 신전',
            '강한 킥 동작',
            '목 아치 동작'
          ],
          modifications: [
            '부드러운 킥 사용',
            '목 신전 최소화',
            '자연스러운 자세 유지'
          ],
          alternatives: ['elementary_backstroke']
        },
        breaststroke: { 
          level: 'avoid', 
          reason: '목 신전과 회전 동작이 경추에 압박을 가함',
          allowedMovements: [],
          prohibitedMovements: [
            '목 신전 동작',
            '목 회전 동작',
            '강한 킥 동작',
            '상체 들기 동작'
          ],
          modifications: [],
          alternatives: ['elementary_backstroke']
        },
        butterfly: { 
          level: 'prohibited', 
          reason: '강한 목 신전과 회전 동작이 경추 손상을 악화시킬 수 있음',
          allowedMovements: [],
          prohibitedMovements: [
            '강한 목 신전',
            '목 회전 동작',
            '상체 들기 동작',
            '전체적인 동작'
          ],
          modifications: [],
          alternatives: ['elementary_backstroke']
        },
        elementary_backstroke: { 
          level: 'safe', 
          reason: '목에 부담이 적고 자연스러운 자세 유지',
          allowedMovements: [
            '부드러운 팔 동작',
            '가벼운 킥 동작',
            '자연스러운 호흡',
            '목에 부담 없는 자세'
          ],
          prohibitedMovements: [],
          modifications: [],
          alternatives: []
        }
      },
      shoulder_frozen_shoulder: {
        freestyle: { 
          level: 'avoid', 
          reason: '어깨 회전 범위 제한으로 인한 부상 위험',
          allowedMovements: [],
          prohibitedMovements: [
            '어깨 회전 동작',
            '강한 팔 스트로크',
            '급격한 방향 전환'
          ],
          modifications: [],
          alternatives: ['elementary_backstroke', 'sidestroke']
        },
        backstroke: { 
          level: 'caution', 
          reason: '어깨 신전 동작이 제한될 수 있음',
          allowedMovements: [
            '제한된 범위의 팔 동작',
            '가벼운 킥 동작'
          ],
          prohibitedMovements: [
            '과도한 어깨 신전',
            '강한 팔 동작'
          ],
          modifications: [
            '짧은 스트로크 사용',
            '과도한 신전 피하기'
          ],
          alternatives: ['elementary_backstroke']
        },
        elementary_backstroke: { 
          level: 'safe', 
          reason: '부드러운 동작으로 어깨 관절에 부담이 적음',
          allowedMovements: [
            '부드러운 팔 동작',
            '가벼운 킥 동작',
            '자연스러운 호흡'
          ],
          prohibitedMovements: [],
          modifications: [],
          alternatives: []
        },
        sidestroke: { 
          level: 'safe', 
          reason: '어깨 회전 범위를 최소화하면서 수영 가능',
          allowedMovements: [
            '제한된 어깨 동작',
            '부드러운 킥 동작',
            '자연스러운 호흡'
          ],
          prohibitedMovements: [],
          modifications: [],
          alternatives: []
        }
      },
      knee_osteoarthritis: {
        freestyle: { 
          level: 'safe', 
          reason: '무릎에 부담이 적고 관절 가동범위 개선에 효과적',
          allowedMovements: [
            '부드러운 킥 동작',
            '자연스러운 팔 동작',
            '가벼운 회전'
          ],
          prohibitedMovements: [
            '강한 킥 동작',
            '급격한 방향 전환'
          ],
          modifications: [
            '부드러운 킥 사용',
            '과도한 킥 동작 피하기'
          ],
          alternatives: []
        },
        breaststroke: { 
          level: 'avoid', 
          reason: '무릎 회전 동작이 관절염을 악화시킬 수 있음',
          allowedMovements: [],
          prohibitedMovements: [
            '무릎 회전 동작',
            '강한 킥 동작',
            '급격한 방향 전환'
          ],
          modifications: [],
          alternatives: ['freestyle', 'backstroke']
        },
        backstroke: { 
          level: 'safe', 
          reason: '무릎에 부담이 적고 관절 가동범위 개선',
          allowedMovements: [
            '부드러운 킥 동작',
            '자연스러운 팔 동작',
            '가벼운 회전'
          ],
          prohibitedMovements: [
            '강한 킥 동작',
            '급격한 방향 전환'
          ],
          modifications: [],
          alternatives: []
        }
      },
      ankle_sprain: {
        freestyle: { 
          level: 'safe', 
          reason: '발목에 부담이 적고 회복에 도움',
          allowedMovements: [
            '부드러운 킥 동작',
            '자연스러운 팔 동작',
            '가벼운 회전'
          ],
          prohibitedMovements: [
            '강한 킥 동작',
            '급격한 방향 전환'
          ],
          modifications: [],
          alternatives: []
        },
        backstroke: { 
          level: 'safe', 
          reason: '발목에 부담이 적음',
          allowedMovements: [
            '부드러운 킥 동작',
            '자연스러운 팔 동작',
            '가벼운 회전'
          ],
          prohibitedMovements: [
            '강한 킥 동작',
            '급격한 방향 전환'
          ],
          modifications: [],
          alternatives: []
        },
        breaststroke: { 
          level: 'caution', 
          reason: '발목 킥 동작이 부상 부위에 부담을 줄 수 있음',
          allowedMovements: [
            '부드러운 킥 동작',
            '가벼운 팔 동작'
          ],
          prohibitedMovements: [
            '강한 발목 킥',
            '급격한 방향 전환'
          ],
          modifications: [
            '발목 킥 동작 최소화',
            '부드러운 동작 사용'
          ],
          alternatives: ['freestyle', 'backstroke']
        }
      }
    };

    const allGuidanceData: any[] = [];
    conditions.forEach(condition => {
      if (guidanceData[condition]) {
        Object.entries(guidanceData[condition]).forEach(([stroke, guidance]) => {
          if (typeof guidance === 'object' && guidance !== null) {
            allGuidanceData.push({ stroke, ...guidance });
          } else {
            allGuidanceData.push({ stroke, guidance });
          }
        });
      }
    });

    // 중복 제거 및 안전도 우선순위 적용
    const uniqueGuidanceData = allGuidanceData.reduce((acc, current) => {
      const existing = acc.find(item => item.stroke === current.stroke);
      if (!existing) {
        acc.push(current);
      } else {
        // 더 위험한 안전도로 업데이트
        const priority = { 'prohibited': 4, 'avoid': 3, 'caution': 2, 'safe': 1 };
        if (priority[current.level] > priority[existing.level]) {
          acc[acc.indexOf(existing)] = current;
        }
      }
      return acc;
    }, [] as any[]);

    return uniqueGuidanceData;
  };

  // 안전도별 색상
  const getSafetyColor = (level: string) => {
    switch (level) {
      case 'safe': return 'text-green-600 bg-green-100';
      case 'caution': return 'text-yellow-600 bg-yellow-100';
      case 'avoid': return 'text-orange-600 bg-orange-100';
      case 'prohibited': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // 안전도별 아이콘
  const getSafetyIcon = (level: string) => {
    switch (level) {
      case 'safe': return <CheckCircle className="h-4 w-4" />;
      case 'caution': return <Info className="h-4 w-4" />;
      case 'avoid': return <XCircle className="h-4 w-4" />;
      case 'prohibited': return <XCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">회원 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                담당 회원 관리
              </h1>
              <p className="text-gray-600 mt-2">
                회원들의 건강정보를 확인하고 안전한 수영 지도를 제공하세요.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 회원 목록 */}
          <div className="lg:col-span-1">
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">회원 목록</h3>
              <div className="space-y-3">
                {members.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedMember?.id === member.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{member.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.jointConditions.length > 0 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {member.jointConditions.length > 0 ? '주의 필요' : '정상'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      건강정보: {member.jointConditions.length + member.cardiovascularConditions.filter(c => c !== 'none').length + member.metabolicConditions.filter(c => c !== 'none').length}개 질환
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 회원 상세 정보 */}
          <div className="lg:col-span-2">
            {selectedMember ? (
              <div className="space-y-6">
                {/* 기본 정보 */}
                <div className="p-6 bg-white rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">이름</label>
                      <p className="text-gray-900">{selectedMember.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">이메일</label>
                      <p className="text-gray-900">{selectedMember.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">전화번호</label>
                      <p className="text-gray-900">{selectedMember.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">수영 경험</label>
                      <p className="text-gray-900">
                        {selectedMember.swimmingExperience === 'beginner' ? '초보자' :
                         selectedMember.swimmingExperience === 'basic' ? '기초' :
                         selectedMember.swimmingExperience === 'intermediate' ? '중급' : '고급'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 건강정보 */}
                <div className="p-6 bg-white rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    건강정보
                  </h3>
                  
                  <div className="space-y-4">
                    {/* 관절별 질환 */}
                    {selectedMember.jointConditions.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">관절별 질환</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedMember.jointConditions.map((condition) => (
                            <span key={condition} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                              {condition.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 심혈관 질환 */}
                    {selectedMember.cardiovascularConditions.filter(c => c !== 'none').length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">심혈관 질환</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedMember.cardiovascularConditions.filter(c => c !== 'none').map((condition) => (
                            <span key={condition} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                              {condition.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 대사 질환 */}
                    {selectedMember.metabolicConditions.filter(c => c !== 'none').length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">대사 질환</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedMember.metabolicConditions.filter(c => c !== 'none').map((condition) => (
                            <span key={condition} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                              {condition.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 의료 이력 */}
                    {selectedMember.medicalHistory && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">의료 이력</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {selectedMember.medicalHistory}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 수영법별 구체적 동작 가이드라인 */}
                <div className="p-6 bg-white rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    수영법별 구체적 동작 가이드라인
                  </h3>
                  
                  <div className="space-y-6">
                    {getSwimmingGuidanceForConditions(selectedMember.jointConditions).map((guidance) => (
                      <div key={guidance.stroke} className="bg-white p-6 rounded-lg border-2">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xl font-semibold text-gray-900 capitalize">{guidance.stroke}</h4>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSafetyColor(guidance.level)}`}>
                            {getSafetyIcon(guidance.level)}
                            <span className="ml-2">
                              {guidance.level === 'safe' ? '안전' :
                               guidance.level === 'caution' ? '주의' :
                               guidance.level === 'avoid' ? '피하기' : '금지'}
                            </span>
                          </span>
                        </div>
                        
                        <p className="text-gray-700 mb-4 font-medium">{guidance.reason}</p>
                        
                        {/* 의학적 근거 및 상세 설명 */}
                        {guidance.medicalEvidence && (
                          <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h5 className="font-semibold text-blue-800 mb-3 flex items-center">
                              <Info className="h-4 w-4 mr-2" />
                              📚 의학적 근거 및 출처
                            </h5>
                            <div className="mb-3">
                              <h6 className="font-medium text-blue-700 mb-2">주요 참고 문헌:</h6>
                              <ul className="text-sm text-blue-600 space-y-1">
                                {guidance.medicalEvidence.map((evidence, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    {evidence}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            {guidance.detailedExplanation && (
                              <div>
                                <h6 className="font-medium text-blue-700 mb-2">상세 설명:</h6>
                                <p className="text-sm text-blue-600 leading-relaxed">
                                  {guidance.detailedExplanation}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* 허용된 동작 */}
                          {guidance.allowedMovements.length > 0 && (
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                              <h5 className="font-semibold text-green-800 mb-3 flex items-center">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                ✅ 허용된 동작
                              </h5>
                              <ul className="space-y-2">
                                {guidance.allowedMovements.map((movement, index) => (
                                  <li key={index} className="text-sm text-green-700 flex items-start">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    {movement}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* 금지된 동작 */}
                          {guidance.prohibitedMovements.length > 0 && (
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                              <h5 className="font-semibold text-red-800 mb-3 flex items-center">
                                <XCircle className="h-4 w-4 mr-2" />
                                ❌ 금지된 동작
                              </h5>
                              <ul className="space-y-2">
                                {guidance.prohibitedMovements.map((movement, index) => (
                                  <li key={index} className="text-sm text-red-700 flex items-start">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    {movement}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        {/* 수정된 동작 */}
                        {guidance.modifications.length > 0 && (
                          <div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <h5 className="font-semibold text-yellow-800 mb-3 flex items-center">
                              <Info className="h-4 w-4 mr-2" />
                              ⚠️ 수정된 동작
                            </h5>
                            <ul className="space-y-2">
                              {guidance.modifications.map((modification, index) => (
                                <li key={index} className="text-sm text-yellow-700 flex items-start">
                                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                  {modification}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* 대안 영법 */}
                        {guidance.alternatives.length > 0 && (
                          <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h5 className="font-semibold text-blue-800 mb-3 flex items-center">
                              <Info className="h-4 w-4 mr-2" />
                              🔄 대안 영법
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {guidance.alternatives.map((alternative, index) => (
                                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                  {alternative}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 강사 지도 권장사항 */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">강사 지도 권장사항</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• 수영 전 충분한 워밍업 (10-15분) 필수</li>
                      <li>• 통증 발생 시 즉시 중단하고 의료진 상담 권유</li>
                      <li>• 점진적 거리 증가로 안전한 운동량 조절</li>
                      <li>• 수영 후 스트레칭으로 근육 긴장 완화</li>
                      <li>• 정기적인 건강 상태 확인 및 업데이트</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-lg shadow">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">회원을 선택하세요</h3>
                <p className="text-gray-600">
                  왼쪽 목록에서 회원을 선택하면 건강정보와 수영 가이드라인을 확인할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(InstructorStudentsPage);