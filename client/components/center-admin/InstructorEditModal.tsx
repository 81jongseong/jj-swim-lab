/**
 * 🏢 JJ Swim Lab - 강사 수정 모달
 * 
 * 📋 **컴포넌트 목적**
 * - 센터 관리자가 소속 강사의 정보를 수정하는 모달
 * - 근무 정보, 급여, 계약 형태, 이력 관리
 * - 강사는 읽기 전용 (편집 불가)
 * 
 * 🔄 **주요 기능**
 * - 기본 정보 수정 (연락처, 경력, 등급, 전문분야, 자격증)
 * - 근무 요일/시간 설정
 * - 급여 정보 관리 (민감정보)
 * - 계약 형태 관리
 * - 이전 센터 경력 이력 표시 (읽기 전용)
 * - 현재 센터 경력 자동 계산
 * 
 * 🗄️ **데이터 연동**
 * - client/app/center-admin/instructors/page.tsx (부모 컴포넌트)
 * - server/src/models/User.ts (instructorInfo 스키마)
 * - server/src/routes/center-admin.ts (API 엔드포인트)
 * 
 * 🛠️ **필요한 설치 파일**
 * - React 18.3.1
 * - TypeScript 5.x
 * - lucide-react (아이콘)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 급여 정보는 민감정보 - 센터관리자/최고관리자만 접근
 * 2. 이직 이력은 읽기 전용 (강사 편집 불가)
 * 3. 현재 센터 경력은 입사일 기준 자동 계산
 * 4. 총 경력 = 이전 센터 경력 + 현재 센터 경력
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 권한 검증 로직 확인
 * - [ ] 날짜 계산 로직 확인 (경력)
 * - [ ] 급여 정보 보안 체크
 * - [ ] 반응형 디자인 테스트
 * 
 * 📅 **개발 히스토리**
 * - 2025-10-21: 초기 구현 (강사 수정 모달)
 * - 2025-10-21: 근무 정보, 급여, 이력 관리 추가
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-10-21
 * - 상태: ✅ 완성
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, DollarSign, Briefcase, History, Star } from 'lucide-react';

interface EmploymentHistory {
  centerName: string;
  startDate: string;
  endDate: string;
  position: string;
  rating: number;
  totalClasses: number;
  totalStudents: number;
  leaveReason?: string;
  memo?: string;
}

interface Instructor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  experience: number;
  rating: number;
  specialties: string[];
  certifications: string[];
  status: 'active' | 'inactive' | 'pending';
  joinedAt: Date;
  totalStudents: number;
  totalClasses: number;
  instructorInfo?: {
    experience?: string;
    specialties?: string[];
    certifications?: string[];
    instructorLevel?: string;
    maxStudents?: number;
    currentStudents?: number;
    workSchedule?: {
      daysOfWeek?: number[];
      timeSlots?: string[];
    };
    salaryInfo?: {
      type?: string;
      amount?: number;
      currency?: string;
      incentive?: number;
    };
    memo?: string;
    hiredAt?: Date;
    contractType?: string;
    employmentHistory?: EmploymentHistory[];
  };
}

interface InstructorEditModalProps {
  instructor: Instructor;
  onClose: () => void;
  onSave: (updatedInstructor: Partial<Instructor>) => Promise<void>;
}

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

const SPECIALTIES_OPTIONS = [
  '초급자', '중급자', '상급자',
  '아동반', '성인반', '선수반',
  '생존수영', '아쿠아로빅', '수중재활',
  '개인지도', '그룹지도'
];

export default function InstructorEditModal({ 
  instructor, 
  onClose, 
  onSave 
}: InstructorEditModalProps) {
  const [formData, setFormData] = useState({
    phone: instructor.phone || '',
    experience: instructor.experience || instructor.instructorInfo?.experience || 0,
    instructorLevel: instructor.instructorInfo?.instructorLevel || 'junior',
    maxStudents: instructor.instructorInfo?.maxStudents || 20,
    status: instructor.status || 'active',
    specialties: instructor.specialties || instructor.instructorInfo?.specialties || [],
    certifications: instructor.certifications || instructor.instructorInfo?.certifications || [],
    workSchedule: {
      daysOfWeek: instructor.instructorInfo?.workSchedule?.daysOfWeek || [],
      timeSlots: instructor.instructorInfo?.workSchedule?.timeSlots || ['09:00-18:00']
    },
    salaryInfo: {
      type: instructor.instructorInfo?.salaryInfo?.type || 'monthly',
      amount: instructor.instructorInfo?.salaryInfo?.amount || 0,
      currency: instructor.instructorInfo?.salaryInfo?.currency || 'KRW',
      incentive: instructor.instructorInfo?.salaryInfo?.incentive || 0
    },
    memo: instructor.instructorInfo?.memo || '',
    hiredAt: instructor.instructorInfo?.hiredAt || new Date(),
    contractType: instructor.instructorInfo?.contractType || 'full-time'
  });

  const [newCertification, setNewCertification] = useState('');
  const [newTimeSlotStart, setNewTimeSlotStart] = useState('09:00');
  const [newTimeSlotEnd, setNewTimeSlotEnd] = useState('18:00');
  const [isSaving, setIsSaving] = useState(false);

  // 현재 센터 경력 계산 (개월)
  const calculateCurrentTenure = () => {
    if (!formData.hiredAt) return 0;
    const hired = new Date(formData.hiredAt);
    const now = new Date();
    const months = (now.getFullYear() - hired.getFullYear()) * 12 + 
                   (now.getMonth() - hired.getMonth());
    return Math.max(0, months);
  };

  // 이전 센터 총 경력 계산 (개월)
  const calculatePreviousTenure = () => {
    const history = instructor.instructorInfo?.employmentHistory || [];
    return history.reduce((total, job) => {
      const start = new Date(job.startDate);
      const end = new Date(job.endDate);
      const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                     (end.getMonth() - start.getMonth());
      return total + months;
    }, 0);
  };

  // 총 경력 계산
  const currentTenureMonths = calculateCurrentTenure();
  const previousTenureMonths = calculatePreviousTenure();
  const totalTenureMonths = currentTenureMonths + previousTenureMonths;

  // 개월 수를 년/개월로 변환
  const formatTenure = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years > 0 && remainingMonths > 0) {
      return `${years}년 ${remainingMonths}개월`;
    } else if (years > 0) {
      return `${years}년`;
    } else {
      return `${remainingMonths}개월`;
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const saveData = {
        phone: formData.phone,
        instructorInfo: {
          instructorLevel: formData.instructorLevel,
          maxStudents: formData.maxStudents,
          workSchedule: formData.workSchedule,
          salaryInfo: formData.salaryInfo,
          memo: formData.memo,
          hiredAt: formData.hiredAt,
          contractType: formData.contractType,
          specialties: formData.specialties,
          certifications: formData.certifications
        }
      };
      
      console.log('🔥 InstructorEditModal 저장 데이터:', saveData);
      console.log('🔥 현재 폼 데이터:', formData);
      
      await onSave(saveData as any);
      onClose();
    } catch (error) {
      console.error('❌ 강사 정보 저장 실패:', error);
      console.error('📋 에러 상세:', error);
      alert(`저장 중 오류가 발생했습니다: ${error.message || error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const toggleDayOfWeek = (day: number) => {
    setFormData(prev => ({
      ...prev,
      workSchedule: {
        ...prev.workSchedule,
        daysOfWeek: prev.workSchedule.daysOfWeek.includes(day)
          ? prev.workSchedule.daysOfWeek.filter(d => d !== day)
          : [...prev.workSchedule.daysOfWeek, day].sort()
      }
    }));
  };

  const addTimeSlot = () => {
    if (newTimeSlotStart && newTimeSlotEnd) {
      // 시작시간이 종료시간보다 늦으면 경고
      if (newTimeSlotStart >= newTimeSlotEnd) {
        alert('종료 시간은 시작 시간보다 늦어야 합니다.');
        return;
      }
      
      const timeSlot = `${newTimeSlotStart}-${newTimeSlotEnd}`;
      setFormData(prev => ({
        ...prev,
        workSchedule: {
          ...prev.workSchedule,
          timeSlots: [...prev.workSchedule.timeSlots, timeSlot]
        }
      }));
      
      // 기본값으로 리셋
      setNewTimeSlotStart('09:00');
      setNewTimeSlotEnd('18:00');
    }
  };

  const removeTimeSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workSchedule: {
        ...prev.workSchedule,
        timeSlots: prev.workSchedule.timeSlots.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            👨‍🏫 강사 정보 수정
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 📋 기본 정보 (읽기 전용) */}
          <section className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 기본 정보 (읽기 전용)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input
                  type="text"
                  value={instructor.name}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input
                  type="email"
                  value={instructor.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
            </div>
          </section>

          {/* 📞 연락처 정보 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">📞 연락처</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="010-1234-5678"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </section>

          {/* 🎓 경력 정보 - 통계 + 이력서 형식 */}
          <section className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <History className="w-5 h-5 mr-2 text-blue-600" />
              경력 정보
            </h3>
            
            {/* 경력 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border-2 border-blue-200 shadow-sm">
                <p className="text-sm text-gray-600 mb-1 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  총 경력
                </p>
                <p className="text-3xl font-bold text-blue-600">{formatTenure(totalTenureMonths)}</p>
                <p className="text-xs text-gray-500 mt-1">전체 강사 경력</p>
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-green-200 shadow-sm">
                <p className="text-sm text-gray-600 mb-1 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  현재 센터 경력
                </p>
                <p className="text-3xl font-bold text-green-600">{formatTenure(currentTenureMonths)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.hiredAt ? new Date(formData.hiredAt).toLocaleDateString('ko-KR') : '미설정'} 부터
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-gray-200 shadow-sm">
                <p className="text-sm text-gray-600 mb-1 flex items-center">
                  <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                  이전 센터 경력
                </p>
                <p className="text-3xl font-bold text-gray-600">{formatTenure(previousTenureMonths)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {instructor.instructorInfo?.employmentHistory?.length || 0}개 센터
                </p>
              </div>
            </div>
            
            {/* 경력 상세 이력 (타임라인 형식) */}
            <div className="border-t border-blue-200 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">📋 경력 상세 이력</h4>
              <div className="space-y-4">
              {/* 현재 센터 (편집 가능) */}
              <div className="bg-white rounded-lg p-4 border-2 border-green-500 relative">
                <div className="absolute -left-3 top-6 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
                <div className="ml-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        현재 센터 (재직 중)
                        <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">현재</span>
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {formData.hiredAt ? new Date(formData.hiredAt).toLocaleDateString('ko-KR') : '미설정'} ~ 현재 
                        <span className="ml-2 font-medium text-green-600">
                          ({formatTenure(currentTenureMonths)})
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">입사일</label>
                      <input
                        type="date"
                        value={formData.hiredAt ? new Date(formData.hiredAt).toISOString().split('T')[0] : ''}
                        onChange={(e) => setFormData({ ...formData, hiredAt: new Date(e.target.value) })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">고용 형태</label>
                      <select
                        value={formData.contractType}
                        onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="full-time">정규직</option>
                        <option value="part-time">파트타임</option>
                        <option value="contract">계약직</option>
                        <option value="freelance">프리랜서</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                    <div className="bg-gray-50 px-3 py-2 rounded">
                      <p className="text-xs text-gray-600">담당 학생</p>
                      <p className="font-semibold text-gray-900">
                        {instructor.totalStudents || instructor.instructorInfo?.currentStudents || 0}명
                      </p>
                    </div>
                    <div className="bg-gray-50 px-3 py-2 rounded">
                      <p className="text-xs text-gray-600">진행 수업</p>
                      <p className="font-semibold text-gray-900">{instructor.totalClasses || 0}회</p>
                    </div>
                    <div className="bg-gray-50 px-3 py-2 rounded">
                      <p className="text-xs text-gray-600">평점</p>
                      <p className="font-semibold text-gray-900 flex items-center">
                        <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                        {(instructor.rating || 0).toFixed(1)}
                      </p>
                    </div>
                  </div>
                  
                  {formData.specialties.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-600 mb-1">담당 분야</p>
                      <div className="flex flex-wrap gap-1">
                        {formData.specialties.map((specialty, idx) => (
                          <span key={idx} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 이전 센터 이력 (읽기 전용) */}
              {instructor.instructorInfo?.employmentHistory && instructor.instructorInfo.employmentHistory.length > 0 && (
                <>
                  {instructor.instructorInfo.employmentHistory.map((job, index) => {
                    const startDate = new Date(job.startDate);
                    const endDate = new Date(job.endDate);
                    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                                   (endDate.getMonth() - startDate.getMonth());
                    
                    // 고용 형태 매핑
                    const contractTypeMap: { [key: string]: string } = {
                      'full-time': '정규직',
                      'part-time': '파트타임',
                      'contract': '계약직',
                      'freelance': '프리랜서'
                    };
                    
                    return (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-300 relative">
                        <div className="absolute -left-3 top-6 w-6 h-6 bg-gray-400 rounded-full border-4 border-white"></div>
                        <div className="ml-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{job.centerName}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {startDate.toLocaleDateString('ko-KR')} ~ {endDate.toLocaleDateString('ko-KR')}
                                <span className="ml-2 font-medium text-gray-600">
                                  ({formatTenure(months)})
                                </span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            <p className="text-gray-600">
                              <span className="font-medium">직책:</span> {job.position}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">고용형태:</span> {contractTypeMap[formData.contractType] || '미지정'}
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                            <div className="bg-gray-50 px-3 py-2 rounded">
                              <p className="text-xs text-gray-600">담당 학생</p>
                              <p className="font-semibold text-gray-900">{job.totalStudents || 0}명</p>
                            </div>
                            <div className="bg-gray-50 px-3 py-2 rounded">
                              <p className="text-xs text-gray-600">진행 수업</p>
                              <p className="font-semibold text-gray-900">{job.totalClasses || 0}회</p>
                            </div>
                            <div className="bg-gray-50 px-3 py-2 rounded">
                              <p className="text-xs text-gray-600">평점</p>
                              <p className="font-semibold text-gray-900 flex items-center">
                                <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                                {(job.rating || 0).toFixed(1)}
                              </p>
                            </div>
                          </div>
                          
                          {job.leaveReason && (
                            <div className="mt-3 bg-gray-50 px-3 py-2 rounded">
                              <p className="text-xs text-gray-600 mb-1">퇴사 사유</p>
                              <p className="text-sm text-gray-800">{job.leaveReason}</p>
                            </div>
                          )}
                          
                          {job.memo && (
                            <div className="mt-2 border-t pt-2">
                              <p className="text-xs text-gray-500 italic">{job.memo}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              </div>
            </div>
          </section>

          {/* ⚙️ 강사 설정 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">⚙️ 강사 설정</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  강사 등급
                  <span className="ml-2 text-xs text-gray-500">(경력 및 성과 기반)</span>
                </label>
                <select
                  value={formData.instructorLevel}
                  onChange={(e) => setFormData({ ...formData, instructorLevel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="junior">초급 (Junior) - 경력 0~2년</option>
                  <option value="senior">중급 (Senior) - 경력 3~5년</option>
                  <option value="master">고급 (Master) - 경력 6~10년</option>
                  <option value="expert">전문가 (Expert) - 경력 10년 이상</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  💡 기준: 경력, 자격증, 학생 평점, 수업 품질, 대회 실적
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                  <option value="pending">승인대기</option>
                </select>
              </div>
            </div>
          </section>

          {/* 🎯 전문분야 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 전문분야</h3>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES_OPTIONS.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => toggleSpecialty(specialty)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    formData.specialties.includes(specialty)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </section>

          {/* 📜 자격증 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">📜 자격증</h3>
            <div className="space-y-2 mb-3">
              {formData.certifications.map((cert, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="text-sm text-gray-700">• {cert}</span>
                  <button
                    onClick={() => removeCertification(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                placeholder="자격증 이름 입력"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={addCertification}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                추가
              </button>
            </div>
          </section>

          {/* 📅 근무 정보 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              <Clock className="w-5 h-5 inline mr-2" />
              근무 정보
            </h3>
            
            {/* 근무 요일 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">근무 요일</label>
              <div className="flex gap-2">
                {DAYS_OF_WEEK.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => toggleDayOfWeek(index)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.workSchedule.daysOfWeek.includes(index)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* 근무 시간 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">근무 시간</label>
              <div className="space-y-2 mb-3">
                {formData.workSchedule.timeSlots.map((slot, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="text-sm text-gray-700 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                      {slot}
                    </span>
                    <button
                      onClick={() => removeTimeSlot(index)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">시작 시간</label>
                  <input
                    type="time"
                    value={newTimeSlotStart}
                    onChange={(e) => setNewTimeSlotStart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <span className="text-gray-400 mt-5">~</span>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">종료 시간</label>
                  <input
                    type="time"
                    value={newTimeSlotEnd}
                    onChange={(e) => setNewTimeSlotEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={addTimeSlot}
                  className="px-4 py-2 mt-5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  추가
                </button>
              </div>
            </div>
          </section>

          {/* 💰 급여 정보 (민감정보 - 센터관리자/최고관리자만) */}
          <section className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-yellow-600" />
                급여 정보 (민감정보)
              </h3>
              <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded font-medium">
                🔒 회원에게 비공개
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              ⚠️ 이 정보는 센터 관리자와 최고 관리자만 볼 수 있습니다. 일반 회원에게는 표시되지 않습니다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">급여 형태</label>
                <select
                  value={formData.salaryInfo.type}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    salaryInfo: { ...formData.salaryInfo, type: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="monthly">월급제</option>
                  <option value="hourly">시급제</option>
                  <option value="per-class">회당</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">금액 (원)</label>
                <input
                  type="number"
                  value={formData.salaryInfo.amount}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    salaryInfo: { ...formData.salaryInfo, amount: parseInt(e.target.value) || 0 }
                  })}
                  min="0"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">인센티브 (%)</label>
                <input
                  type="number"
                  value={formData.salaryInfo.incentive}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    salaryInfo: { ...formData.salaryInfo, incentive: parseInt(e.target.value) || 0 }
                  })}
                  min="0"
                  max="100"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* 📝 센터 메모 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">📝 센터 메모 (내부 전용)</h3>
            <textarea
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              placeholder="강사에 대한 센터 내부 메모를 입력하세요..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </section>
        </div>

        {/* 하단 버튼 */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                저장 중...
              </>
            ) : (
              '저장'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

