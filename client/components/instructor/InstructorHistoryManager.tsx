'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Search, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  Download,
  Eye,
  Plus,
  Award,
  Building,
  User,
  Filter
} from 'lucide-react';

// 타입 정의
interface WorkHistory {
  _id: string;
  centerId: {
    _id: string;
    name: string;
    address: string;
  };
  position: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  workType: 'fulltime' | 'parttime' | 'contract' | 'volunteer';
  responsibilities: string[];
  achievements: string[];
  hashValue: string;
  isVerified: boolean;
  readonly: boolean;
}

interface Certification {
  _id: string;
  certificationType: string;
  certificationName: string;
  certificationNumber: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'expired';
  isValid: boolean;
  documentUrl?: string;
}

interface CenterDashboard {
  totalInstructors: number;
  activeInstructors: number;
  certificationStats: any[];
  expiringCerts: any[];
  complianceRate: number;
}

interface InstructorHistoryManagerProps {
  instructorId?: string;
  centerId?: string;
  mode: 'instructor' | 'center' | 'admin';
}

export const InstructorHistoryManager: React.FC<InstructorHistoryManagerProps> = ({
  instructorId,
  centerId,
  mode
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'certifications' | 'dashboard'>('history');
  const [workHistory, setWorkHistory] = useState<WorkHistory[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [centerDashboard, setCenterDashboard] = useState<CenterDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    certificationType: '',
    verificationStatus: '',
    isExpired: '',
    issuingOrganization: ''
  });

  // 자격증 타입 옵션
  const certificationTypes = {
    lifeguard: '인명구조원',
    sports_instructor: '생활체육지도사',
    swimming_coach: '수영지도자',
    first_aid: '응급처치',
    other: '기타'
  };

  const workTypeLabels = {
    fulltime: '정규직',
    parttime: '파트타임',
    contract: '계약직',
    volunteer: '자원봉사'
  };

  // 데이터 로드
  useEffect(() => {
    if (mode === 'instructor' && instructorId) {
      loadInstructorHistory();
    } else if (mode === 'center' && centerId) {
      loadCenterDashboard();
    }
  }, [mode, instructorId, centerId]);

  const loadInstructorHistory = async () => {
    if (!instructorId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/instructor-history/instructor/${instructorId}/complete`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setWorkHistory(result.data.workHistory);
        setCertifications(result.data.certifications);
      }
    } catch (error) {
      console.error('강사 이력 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCenterDashboard = async () => {
    if (!centerId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/instructor-history/center/${centerId}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setCenterDashboard(result.data);
      }
    } catch (error) {
      console.error('센터 대시보드 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchInstructorsByCenter = async () => {
    if (!centerId) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/instructor-history/center/${centerId}/instructors?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        // 검색 결과 처리
        console.log('검색 결과:', result.data.instructors);
      }
    } catch (error) {
      console.error('강사 검색 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 상태별 색상 반환
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // 만료 상태 확인
  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  // 만료 임박 확인
  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow && expiry > new Date();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          👨‍🏫 강사 이력관리 시스템
        </h1>
        <p className="text-gray-600">
          불변성이 보장된 근무 이력과 검증된 자격증 관리
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'history', label: '근무 이력', icon: Building },
              { key: 'certifications', label: '자격증', icon: Award },
              ...(mode === 'center' ? [{ key: 'dashboard', label: '대시보드', icon: Shield }] : [])
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-5 w-5 inline mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* 근무 이력 탭 */}
            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">근무 이력</h2>
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">수정 불가</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {workHistory.map((history, index) => (
                    <div key={history._id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{history.centerId.name}</h3>
                          <p className="text-sm text-gray-600">{history.position}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {history.isVerified ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-500" />
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            history.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {history.isActive ? '근무 중' : '퇴사'}
                          </span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">근무 형태:</span>
                          <span className="ml-2">{workTypeLabels[history.workType]}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">시작일:</span>
                          <span className="ml-2">{new Date(history.startDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">종료일:</span>
                          <span className="ml-2">
                            {history.endDate ? new Date(history.endDate).toLocaleDateString() : '현재'}
                          </span>
                        </div>
                      </div>

                      {history.responsibilities.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm text-gray-500">담당 업무:</span>
                          <ul className="mt-1 text-sm">
                            {history.responsibilities.map((resp, idx) => (
                              <li key={idx} className="text-gray-700">• {resp}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                          해시: {history.hashValue.substring(0, 8)}...
                        </div>
                        <div className="text-xs text-gray-400">
                          이력 #{index + 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 자격증 탭 */}
            {activeTab === 'certifications' && (
              <motion.div
                key="certifications"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">자격증 관리</h2>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    자격증 추가
                  </button>
                </div>

                <div className="grid gap-4">
                  {certifications.map((cert) => (
                    <div key={cert._id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium">{cert.certificationName}</h3>
                          <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(cert.verificationStatus)}`}>
                            {cert.verificationStatus === 'verified' ? '검증됨' : 
                             cert.verificationStatus === 'pending' ? '검증 대기' :
                             cert.verificationStatus === 'rejected' ? '거부됨' : '만료됨'}
                          </span>
                          {isExpired(cert.expiryDate) && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          {isExpiringSoon(cert.expiryDate) && (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">자격증 번호:</span>
                          <span className="ml-2 font-mono">{cert.certificationNumber}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">발급일:</span>
                          <span className="ml-2">{new Date(cert.issueDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">만료일:</span>
                          <span className={`ml-2 ${
                            isExpired(cert.expiryDate) ? 'text-red-600 font-medium' :
                            isExpiringSoon(cert.expiryDate) ? 'text-yellow-600 font-medium' : ''
                          }`}>
                            {cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : '무기한'}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          타입: {certificationTypes[cert.certificationType as keyof typeof certificationTypes]}
                        </div>
                        <div className="flex space-x-2">
                          {cert.documentUrl && (
                            <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              문서 보기
                            </button>
                          )}
                          <button className="text-gray-600 hover:text-gray-700 text-sm flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            상세 보기
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 센터 대시보드 탭 */}
            {activeTab === 'dashboard' && mode === 'center' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">센터 강사 현황 대시보드</h2>
                  <div className="flex space-x-4">
                    {/* 검색 필터 */}
                    <select
                      value={searchFilters.certificationType}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, certificationType: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">모든 자격증</option>
                      {Object.entries(certificationTypes).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    <button
                      onClick={searchInstructorsByCenter}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      검색
                    </button>
                  </div>
                </div>

                {centerDashboard && (
                  <div className="grid md:grid-cols-4 gap-6">
                    {/* 통계 카드들 */}
                    <div className="bg-blue-50 rounded-lg p-6 text-center">
                      <User className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">{centerDashboard.totalInstructors}</div>
                      <div className="text-sm text-gray-600">전체 강사</div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6 text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">{centerDashboard.activeInstructors}</div>
                      <div className="text-sm text-gray-600">활성 강사</div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-6 text-center">
                      <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">{centerDashboard.complianceRate}%</div>
                      <div className="text-sm text-gray-600">컴플라이언스</div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-6 text-center">
                      <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-yellow-600">{centerDashboard.expiringCerts.length}</div>
                      <div className="text-sm text-gray-600">만료 예정</div>
                    </div>
                  </div>
                )}

                {/* 만료 예정 자격증 알림 */}
                {centerDashboard?.expiringCerts.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-medium text-yellow-800 mb-3 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      만료 예정 자격증 ({centerDashboard.expiringCerts.length}개)
                    </h3>
                    <div className="space-y-2">
                      {centerDashboard.expiringCerts.slice(0, 5).map((cert: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span>{cert.instructorName} - {cert.certificationName}</span>
                          <span className="text-yellow-700 font-medium">
                            {cert.daysUntilExpiry}일 남음
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>데이터를 불러오는 중...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorHistoryManager;
