/**
 * 💼 JJ Swim Lab - 구인구직 커뮤니티 페이지
 * 
 * 📋 **페이지 목적**
 * - 수영 산업 전용 구인구직 커뮤니티
 * - 강사, 안전요원, 인포데스크, 사무직 등 채용 정보 공유
 * - 최고 관리자, 센터 관리자, 강사만 접근 가능
 * 
 * 🔄 **주요 기능**
 * - 구인/구직 게시글 조회 및 작성
 * - 직책별 필터링 (강사, 안전요원, 인포데스크, 사무직, 관리자)
 * - 센터별 분류 및 검색
 * - 근무 조건 상세 정보 표시
 * 
 * 🗄️ **데이터 연동**
 * - Community 모델 (roomType: 'job_board')
 * - Center 모델 (센터 정보)
 * - User 모델 (작성자 정보)
 * 
 * 🔗 **연동되는 파일**
 * - hooks/useAuth.tsx (인증 및 권한 확인)
 * - components/withAuth (인증 HOC)
 * - components/ui (Card, Button 등)
 * 
 * 📅 **개발 히스토리**
 * - 2025-11-01: 구인구직 커뮤니티 페이지 생성
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import withAuth from '../../components/withAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { Button } from '@/components/Button';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Plus,
  Search,
  Phone,
  Mail,
  X,
  Eye
} from 'lucide-react';

interface JobPost {
  _id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  roomType: 'job_board';
  roomSpecific: {
    jobBoard: {
      jobType: 'job_post' | 'resume' | 'freelance';
      position: 'instructor' | 'lifeguard' | 'front_desk' | 'office' | 'manager' | 'other';
      employmentType: 'full_time' | 'part_time' | 'contract' | 'freelance';
      location?: string;
      centerId?: string;
      centerName?: string;
      salary?: {
        min?: number;
        max?: number;
        type: 'monthly' | 'hourly' | 'per_class';
      };
      requirements?: string[];
      benefits?: string[];
      workSchedule?: {
        daysOfWeek?: number[];
        timeSlots?: string[];
      };
      contactInfo?: {
        email?: string;
        phone?: string;
      };
      applicationDeadline?: string;
      status: 'open' | 'closed' | 'filled';
    };
  };
  createdAt: string;
  updatedAt: string;
  views: number;
}

const POSITION_LABELS = {
  instructor: '강사',
  lifeguard: '안전요원',
  front_desk: '인포데스크',
  office: '사무직',
  manager: '관리자',
  other: '기타'
};

const EMPLOYMENT_LABELS = {
  full_time: '정규직',
  part_time: '파트타임',
  contract: '계약직',
  freelance: '프리랜스'
};

const JOB_TYPE_LABELS = {
  job_post: '구인',
  resume: '구직',
  freelance: '프리랜스'
};

function JobBoardPage() {
  const { user } = useAuth();
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobType, setSelectedJobType] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<JobPost | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchJobPosts();
  }, []);

  const fetchJobPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // TODO: 실제 API 연동
      // const response = await fetch('http://localhost:5000/api/community/posts?roomType=job_board', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // 샘플 데이터
      const mockData: JobPost[] = [
        {
          _id: '1',
          title: '🏊 수영강사 정규직 채용합니다',
          content: 'JJ Swim Lab 강남점에서 정규직 수영강사를 채용합니다. 자유형, 평영 전문가 우대.',
          authorId: 'center_admin_1',
          authorName: 'JJ 강남센터',
          roomType: 'job_board',
          roomSpecific: {
            jobBoard: {
              jobType: 'job_post',
              position: 'instructor',
              employmentType: 'full_time',
              location: '강남구',
              centerId: 'center_1',
              centerName: 'JJ 강남센터',
              salary: { min: 2500000, max: 3500000, type: 'monthly' },
              requirements: ['수영 지도자 자격증', '3년 이상 경력'],
              benefits: ['4대보험', '퇴직금', '차량지원'],
              status: 'open'
            }
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          views: 45
        },
        {
          _id: '2',
          title: '🛟 안전요원 파트타임 모집',
          content: '주말 근무 가능한 안전요원을 모집합니다. 응급처치 자격증 보유자 우대.',
          authorId: 'center_admin_2',
          authorName: 'JJ 서초센터',
          roomType: 'job_board',
          roomSpecific: {
            jobBoard: {
              jobType: 'job_post',
              position: 'lifeguard',
              employmentType: 'part_time',
              location: '서초구',
              centerId: 'center_2',
              centerName: 'JJ 서초센터',
              salary: { min: 12000, max: 15000, type: 'hourly' },
              workSchedule: {
                daysOfWeek: [6, 0],
                timeSlots: ['09:00-18:00']
              },
              status: 'open'
            }
          },
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          views: 23
        },
        {
          _id: '3',
          title: '💼 강사 이력서',
          content: '10년 경력의 자유형 전문 강사입니다. 초급부터 마스터즈 코치까지 가능.',
          authorId: 'instructor_1',
          authorName: '김선수',
          roomType: 'job_board',
          roomSpecific: {
            jobBoard: {
              jobType: 'resume',
              position: 'instructor',
              employmentType: 'full_time',
              location: '서울 전체',
              salary: { min: 3000000, type: 'monthly' },
              requirements: ['수영 지도자 1급', '10년 경력'],
              status: 'open'
            }
          },
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          views: 67
        }
      ];
      
      setJobPosts(mockData);
    } catch (error) {
      console.error('채용 공고 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = jobPosts.filter(post => {
    if (searchTerm && !post.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedJobType !== 'all' && post.roomSpecific.jobBoard.jobType !== selectedJobType) {
      return false;
    }
    if (selectedPosition !== 'all' && post.roomSpecific.jobBoard.position !== selectedPosition) {
      return false;
    }
    return true;
  });

  const getJobTypeColor = (jobType: string) => {
    switch (jobType) {
      case 'job_post':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'resume':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'freelance':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatSalary = (salary?: { min?: number; max?: number; type: string }) => {
    if (!salary) return '면접 후 결정';
    
    const min = salary.min?.toLocaleString() || '';
    const max = salary.max?.toLocaleString() || '';
    const type = salary.type === 'monthly' ? '만원/월' : salary.type === 'hourly' ? '원/시간' : '원/회';
    
    if (min && max) {
      return `${min} ~ ${max} ${type}`;
    } else if (min) {
      return `${min} ${type} 이상`;
    }
    return '면접 후 결정';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">채용 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Briefcase className="w-8 h-8 mr-3 text-blue-600" />
                구인구직 커뮤니티
              </h1>
              <p className="text-gray-600 mt-2">
                수영 산업 전용 채용 정보를 확인하고 공유하세요
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              공고 등록
            </Button>
          </div>

          {/* 필터 및 검색 */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              
              <select
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">구분 전체</option>
                <option value="job_post">구인</option>
                <option value="resume">구직</option>
                <option value="freelance">프리랜스</option>
              </select>
              
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">직책 전체</option>
                <option value="instructor">강사</option>
                <option value="lifeguard">안전요원</option>
                <option value="front_desk">인포데스크</option>
                <option value="office">사무직</option>
                <option value="manager">관리자</option>
                <option value="other">기타</option>
              </select>
            </div>
          </div>
        </div>

        {/* 채용 공고 목록 */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPosts.map((post) => (
              <Card key={post._id} className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedPost(post);
                  setShowDetailModal(true);
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getJobTypeColor(post.roomSpecific.jobBoard.jobType)}`}>
                          {JOB_TYPE_LABELS[post.roomSpecific.jobBoard.jobType]}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {POSITION_LABELS[post.roomSpecific.jobBoard.position]}
                        </span>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                          {EMPLOYMENT_LABELS[post.roomSpecific.jobBoard.employmentType]}
                        </span>
                      </div>
                      <CardTitle className="text-lg mb-1">{post.title}</CardTitle>
                      <CardDescription>
                        {post.roomSpecific.jobBoard.centerName || post.roomSpecific.jobBoard.location || '위치 미지정'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4 line-clamp-2">{post.content}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-medium">급여:</span>
                      <span>{formatSalary(post.roomSpecific.jobBoard.salary)}</span>
                    </div>
                    {post.roomSpecific.jobBoard.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-red-600" />
                        <span>{post.roomSpecific.jobBoard.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span>조회 {post.views}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPost(post);
                        setShowDetailModal(true);
                      }}
                    >
                      상세보기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">등록된 채용 공고가 없습니다.</p>
            <p className="text-gray-400 text-sm mt-2">첫 번째 공고를 등록해보세요!</p>
          </div>
        )}
      </div>

      {/* 상세보기 모달 */}
      {showDetailModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">채용 공고 상세</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* 기본 정보 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getJobTypeColor(selectedPost.roomSpecific.jobBoard.jobType)}`}>
                    {JOB_TYPE_LABELS[selectedPost.roomSpecific.jobBoard.jobType]}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {POSITION_LABELS[selectedPost.roomSpecific.jobBoard.position]}
                  </span>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    {EMPLOYMENT_LABELS[selectedPost.roomSpecific.jobBoard.employmentType]}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedPost.title}</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
              </div>

              {/* 근무 조건 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="font-medium">급여</span>
                  </div>
                  <p className="text-gray-900">{formatSalary(selectedPost.roomSpecific.jobBoard.salary)}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-red-600" />
                    <span className="font-medium">근무지</span>
                  </div>
                  <p className="text-gray-900">{selectedPost.roomSpecific.jobBoard.location || '미지정'}</p>
                </div>
              </div>

              {/* 자격 요건 */}
              {selectedPost.roomSpecific.jobBoard.requirements && selectedPost.roomSpecific.jobBoard.requirements.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">자격 요건</h4>
                  <ul className="space-y-1">
                    {selectedPost.roomSpecific.jobBoard.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 혜택 */}
              {selectedPost.roomSpecific.jobBoard.benefits && selectedPost.roomSpecific.jobBoard.benefits.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">혜택</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.roomSpecific.jobBoard.benefits.map((benefit, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 근무 시간 */}
              {selectedPost.roomSpecific.jobBoard.workSchedule && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">근무 시간</h4>
                  {selectedPost.roomSpecific.jobBoard.workSchedule.timeSlots && (
                    <p className="text-gray-700">
                      {selectedPost.roomSpecific.jobBoard.workSchedule.timeSlots.join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* 연락처 */}
              {selectedPost.roomSpecific.jobBoard.contactInfo && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">문의</h4>
                  <div className="space-y-2">
                    {selectedPost.roomSpecific.jobBoard.contactInfo.email && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{selectedPost.roomSpecific.jobBoard.contactInfo.email}</span>
                      </div>
                    )}
                    {selectedPost.roomSpecific.jobBoard.contactInfo.phone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{selectedPost.roomSpecific.jobBoard.contactInfo.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 등록 모달 - TODO */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">채용 공고 등록</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-500 mb-4">채용 공고 등록 기능은 추후 구현 예정입니다.</p>
            <Button onClick={() => setShowCreateModal(false)}>닫기</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(JobBoardPage, { requireTypes: ['superAdmin', 'centerAdmin', 'instructor'] });

