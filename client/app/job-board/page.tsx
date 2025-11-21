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
import InstructorProfileCard from '@/components/job-board/InstructorProfileCard';
import JobPostCard from '@/components/job-board/JobPostCard';
import MyApplicationCard from '@/components/job-board/MyApplicationCard';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Plus,
  Search,
  Phone,
  Mail,
  X,
  Eye,
  Edit,
  Trash2,
  Users,
  CheckCircle,
  XCircle,
  Calendar,
  Clock
} from 'lucide-react';
import SearchBar from '@/components/common/SearchBar';
import { CardGrid } from '@/components/common';

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
      incentives?: string[];
      instructorFeeRate?: number;
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
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [showMyApplicationsModal, setShowMyApplicationsModal] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showApplicationDetailModal, setShowApplicationDetailModal] = useState(false);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [hasApplied, setHasApplied] = useState(false);
  
  // 구인등록 폼 상태
  const [newJobPost, setNewJobPost] = useState({
    title: '',
    content: '',
    jobType: 'job_post' as 'job_post' | 'resume' | 'freelance',
    position: 'instructor' as 'instructor' | 'lifeguard' | 'front_desk' | 'office' | 'manager' | 'other',
    employmentType: 'full_time' as 'full_time' | 'part_time' | 'contract' | 'freelance',
    location: '',
    salaryMin: '',
    salaryMax: '',
    salaryType: 'monthly' as 'monthly' | 'hourly' | 'per_class',
    requirements: '',
    benefits: '',
    incentives: '',
    instructorFeeRate: '',
    contactEmail: '',
    contactPhone: '',
    applicationDeadline: ''
  });

  const [centerInfo, setCenterInfo] = useState<any>(null);

  useEffect(() => {
    fetchJobPosts();
    if (user?.userType === 'center-admin' || user?.userType === 'centerAdmin') {
      loadCenterInfo();
      fetchApplications();
    } else if (user?.userType === 'instructor') {
      fetchMyApplications();
    }
  }, [user]);

  // 선택된 게시글에 대한 지원 여부 확인
  useEffect(() => {
    if (selectedPost && user?.userType === 'instructor' && myApplications.length > 0) {
      const applied = myApplications.some((app: any) => 
        app.postId?._id?.toString() === selectedPost._id || 
        app.postId?.toString() === selectedPost._id
      );
      setHasApplied(applied);
    } else {
      setHasApplied(false);
    }
  }, [selectedPost, myApplications, user]);

  const loadCenterInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/centers/my-center', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setCenterInfo(data.data);
          // 센터 정보 자동 입력
          // 주소에서 시 구 단위 추출
          const address = data.data.address || '';
          let location = '';
          if (address) {
            // "서울특별시 강남구", "경기도 성남시 분당구" 등의 형태를 추출
            const parts = address.split(' ');
            // 시/도, 시/군/구 2개 단위만 추출
            const locationParts = parts.slice(0, 2).filter(p => p);
            location = locationParts.join(' ');
          }
          setNewJobPost(prev => ({
            ...prev,
            location: location,
            contactEmail: data.data.email || user?.email || prev.contactEmail,
            contactPhone: data.data.phone || prev.contactPhone
          }));
        }
      }
    } catch (error) {
      console.error('센터 정보 로드 실패:', error);
    }
  };

  const fetchJobPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/community/posts?roomType=job_board', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('채용 공고 조회 실패');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // API 응답 데이터를 JobPost 형식으로 변환
        const posts: JobPost[] = result.data.map((post: any) => ({
          _id: post._id.toString(),
          title: post.title,
          content: post.content,
          authorId: post.authorId?._id?.toString() || post.authorId?.toString() || '',
          authorName: post.authorName || post.authorId?.name || '익명',
          roomType: post.roomType,
          roomSpecific: {
            jobBoard: {
              jobType: post.roomSpecific?.jobBoard?.jobType || 'job_post',
              position: post.roomSpecific?.jobBoard?.position || 'instructor',
              employmentType: post.roomSpecific?.jobBoard?.employmentType || 'full_time',
              location: post.roomSpecific?.jobBoard?.location,
              centerId: post.roomSpecific?.jobBoard?.centerId?._id?.toString() || post.roomSpecific?.jobBoard?.centerId?.toString() || post.roomSpecific?.jobBoard?.centerId,
              centerName: (() => {
                // populate된 centerId 객체에서 name 추출
                const centerIdObj = post.roomSpecific?.jobBoard?.centerId;
                if (centerIdObj && typeof centerIdObj === 'object' && centerIdObj.name) {
                  return centerIdObj.name;
                }
                // 기존 centerName이 있으면 사용
                if (post.roomSpecific?.jobBoard?.centerName) {
                  return post.roomSpecific.jobBoard.centerName;
                }
                return undefined;
              })(),
              salary: post.roomSpecific?.jobBoard?.salary,
              requirements: post.roomSpecific?.jobBoard?.requirements || [],
              benefits: post.roomSpecific?.jobBoard?.benefits || [],
              incentives: post.roomSpecific?.jobBoard?.incentives || [],
              instructorFeeRate: post.roomSpecific?.jobBoard?.instructorFeeRate,
              workSchedule: post.roomSpecific?.jobBoard?.workSchedule,
              contactInfo: post.roomSpecific?.jobBoard?.contactInfo,
              applicationDeadline: post.roomSpecific?.jobBoard?.applicationDeadline,
              status: post.roomSpecific?.jobBoard?.status || 'open'
            }
          },
          createdAt: post.createdAt || new Date().toISOString(),
          updatedAt: post.updatedAt || new Date().toISOString(),
          views: post.views || 0
        }));
        
        setJobPosts(posts);
      } else {
        setJobPosts([]);
      }
    } catch (error) {
      console.error('채용 공고 조회 실패:', error);
      setJobPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // 지원 목록 조회 (센터 관리자용)
  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/job-board/applications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setApplications(result.data);
        }
      }
    } catch (error) {
      console.error('지원 목록 조회 실패:', error);
    }
  };

  // 내 지원 목록 조회 (강사용)
  const fetchMyApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/job-board/applications/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setMyApplications(result.data);
        }
      }
    } catch (error) {
      console.error('내 지원 목록 조회 실패:', error);
    }
  };

  // 지원하기
  const handleApply = async () => {
    if (!selectedPost) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/job-board/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          postId: selectedPost._id,
          coverLetter: ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '지원에 실패했습니다.');
      }

      const result = await response.json();
      if (result.success) {
        alert('지원이 완료되었습니다!');
        setHasApplied(true);
        await fetchMyApplications();
      }
    } catch (error: any) {
      console.error('지원 실패:', error);
      alert(error.message || '지원에 실패했습니다.');
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

  // 게시글에 지원했는지 확인하는 함수
  const isPostApplied = (postId: string): boolean => {
    if (!user || user.userType !== 'instructor' || myApplications.length === 0) {
      return false;
    }
    return myApplications.some((app: any) => 
      app.postId?._id?.toString() === postId || 
      app.postId?.toString() === postId
    );
  };

  const handleSubmit = async () => {
    try {
      // 필수 입력 항목 체크
      if (!newJobPost.title || !newJobPost.content) {
        alert('제목과 내용은 필수 입력 항목입니다.');
        return;
      }

      const token = localStorage.getItem('token');
      
      // 수정 모드인 경우 PUT 요청
      const isEditMode = selectedPost && selectedPost._id;
      const url = isEditMode 
        ? `http://localhost:5000/api/community/posts/${selectedPost._id}`
        : 'http://localhost:5000/api/community/posts';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(isEditMode ? {
          title: newJobPost.title,
          content: newJobPost.content,
          roomSpecific: {
            jobBoard: {
              jobType: newJobPost.jobType,
              position: newJobPost.position,
              employmentType: newJobPost.employmentType,
              location: newJobPost.location || undefined,
              salary: {
                min: newJobPost.salaryMin ? Number(newJobPost.salaryMin) : undefined,
                max: newJobPost.salaryMax ? Number(newJobPost.salaryMax) : undefined,
                type: newJobPost.salaryType
              },
              requirements: newJobPost.requirements ? newJobPost.requirements.split('\n').filter(r => r.trim()) : undefined,
              benefits: newJobPost.benefits ? newJobPost.benefits.split(',').map(b => b.trim()).filter(b => b) : undefined,
              incentives: newJobPost.incentives ? newJobPost.incentives.split(',').map(i => i.trim()).filter(i => i) : undefined,
              instructorFeeRate: newJobPost.instructorFeeRate ? Number(newJobPost.instructorFeeRate) : undefined,
              contactInfo: {
                email: newJobPost.contactEmail || undefined,
                phone: newJobPost.contactPhone || undefined
              },
              applicationDeadline: newJobPost.applicationDeadline || undefined
            }
          }
        } : {
          title: newJobPost.title,
          content: newJobPost.content,
          roomType: 'job_board',
          roomSpecific: {
            jobBoard: {
              jobType: newJobPost.jobType,
              position: newJobPost.position,
              employmentType: newJobPost.employmentType,
              location: newJobPost.location || undefined,
              salary: {
                min: newJobPost.salaryMin ? Number(newJobPost.salaryMin) : undefined,
                max: newJobPost.salaryMax ? Number(newJobPost.salaryMax) : undefined,
                type: newJobPost.salaryType
              },
              requirements: newJobPost.requirements ? newJobPost.requirements.split('\n').filter(r => r.trim()) : undefined,
              benefits: newJobPost.benefits ? newJobPost.benefits.split(',').map(b => b.trim()).filter(b => b) : undefined,
              incentives: newJobPost.incentives ? newJobPost.incentives.split(',').map(i => i.trim()).filter(i => i) : undefined,
              instructorFeeRate: newJobPost.instructorFeeRate ? Number(newJobPost.instructorFeeRate) : undefined,
              contactInfo: {
                email: newJobPost.contactEmail || undefined,
                phone: newJobPost.contactPhone || undefined
              },
              applicationDeadline: newJobPost.applicationDeadline || undefined,
              status: 'open'
            }
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '채용 공고 등록에 실패했습니다.');
      }

      const result = await response.json();
      
      if (result.success) {
        alert(isEditMode ? '채용 공고가 수정되었습니다!' : '채용 공고가 등록되었습니다!');
        // 목록 새로고침
        await fetchJobPosts();
        // 수정 모드인 경우 selectedPost 초기화
        if (isEditMode) {
          setSelectedPost(null);
        }
      
        // 폼 초기화
        setNewJobPost({
          title: '',
          content: '',
          jobType: 'job_post',
          position: 'instructor',
          employmentType: 'full_time',
          location: centerInfo?.address ? (() => {
            const parts = centerInfo.address.split(' ');
            const locationParts = parts.slice(0, 2).filter(p => p);
            return locationParts.join(' ');
          })() : '',
          salaryMin: '',
          salaryMax: '',
          salaryType: 'monthly',
          requirements: '',
          benefits: '',
          incentives: '',
          instructorFeeRate: '',
          contactEmail: centerInfo?.email || user?.email || '',
          contactPhone: centerInfo?.phone || '',
          applicationDeadline: ''
        });
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('채용 공고 등록 실패:', error);
      alert('채용 공고 등록에 실패했습니다.');
    }
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
            <div className="flex gap-2">
              {user?.userType === 'instructor' && (
                <Button
                  onClick={() => {
                    setShowMyApplicationsModal(true);
                    fetchMyApplications();
                  }}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  내 지원 목록
                </Button>
              )}
              {(user?.userType === 'centerAdmin' || user?.userType === 'center-admin') && (
                <Button
                  onClick={() => {
                    setShowApplicationsModal(true);
                    fetchApplications();
                  }}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  지원 목록
                </Button>
              )}
              {(user?.userType === 'centerAdmin' || user?.userType === 'center-admin') && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  구인등록
                </Button>
              )}
            </div>
          </div>

          {/* 필터 및 검색 */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="검색..."
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
          <CardGrid mobileCols={1} desktopCols={3} gap={4}>
            {filteredPosts.map((post) => {
              // 강사 구직 이력서인 경우 강사 프로필 카드 사용
              if (post.roomSpecific.jobBoard.jobType === 'resume' && post.roomSpecific.jobBoard.position === 'instructor') {
                // TODO: 실제 API에서 강사 정보 가져오기
                const instructorData = {
                  _id: post.authorId,
                  name: post.authorName,
                  instructorInfo: {
                    experience: '10년 경력',
                    specialties: ['자유형', '평영', '초보자 지도'],
                    certifications: [
                      { name: '수영 지도자 1급', issuer: '대한수영협회', acquiredDate: '2015-01-01' }
                    ],
                    instructorLevel: 'expert' as const,
                    introduction: post.content,
                    availableRegions: post.roomSpecific.jobBoard.location ? [post.roomSpecific.jobBoard.location] : [],
                    profileCustomization: {
                      theme: 'blue' as const,
                      layout: 'standard' as const
                    }
                  }
                };

                const applied = isPostApplied(post._id);
                return (
                  <div key={post._id} className="relative">
                    {applied && (
                      <div className="absolute top-4 right-4 z-10">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold shadow-md">
                          <CheckCircle className="w-3 h-3" />
                          지원 완료
                        </span>
                      </div>
                    )}
                    <InstructorProfileCard
                      instructor={instructorData}
                      jobPost={{
                        title: post.title,
                        content: post.content,
                        roomSpecific: {
                          jobBoard: {
                            salary: post.roomSpecific.jobBoard.salary,
                            location: post.roomSpecific.jobBoard.location,
                            employmentType: post.roomSpecific.jobBoard.employmentType
                          }
                        }
                      }}
                      onClick={() => {
                        setSelectedPost(post);
                        setShowDetailModal(true);
                      }}
                    />
                  </div>
                );
              }

              // 일반 채용 공고는 JobPostCard 컴포넌트 사용
              const applied = isPostApplied(post._id);
              return (
                <JobPostCard
                  key={post._id}
                  post={post}
                  applied={applied}
                  onClick={() => {
                    setSelectedPost(post);
                    setShowDetailModal(true);
                  }}
                  formatSalary={formatSalary}
                  getJobTypeColor={getJobTypeColor}
                  jobTypeLabels={JOB_TYPE_LABELS}
                  positionLabels={POSITION_LABELS}
                  employmentLabels={EMPLOYMENT_LABELS}
                />
              )
            })}
          </CardGrid>
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

              {/* 수정/삭제 버튼 (작성자만) */}
              {user && selectedPost.authorId === (user._id || user.id) && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      if (confirm('정말 이 게시글을 삭제하시겠습니까?')) {
                        try {
                          const token = localStorage.getItem('token');
                          const response = await fetch(`http://localhost:5000/api/community/posts/${selectedPost._id}`, {
                            method: 'DELETE',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json'
                            }
                          });

                          if (!response.ok) {
                            throw new Error('게시글 삭제에 실패했습니다.');
                          }

                          alert('게시글이 삭제되었습니다.');
                          setShowDetailModal(false);
                          await fetchJobPosts();
                        } catch (error) {
                          console.error('게시글 삭제 실패:', error);
                          alert('게시글 삭제에 실패했습니다.');
                        }
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    삭제
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      // 수정 모달 열기 (간단하게 기존 폼 재사용)
                      setNewJobPost({
                        title: selectedPost.title,
                        content: selectedPost.content,
                        jobType: selectedPost.roomSpecific.jobBoard.jobType,
                        position: selectedPost.roomSpecific.jobBoard.position,
                        employmentType: selectedPost.roomSpecific.jobBoard.employmentType,
                        location: selectedPost.roomSpecific.jobBoard.location || '',
                        salaryMin: selectedPost.roomSpecific.jobBoard.salary?.min?.toString() || '',
                        salaryMax: selectedPost.roomSpecific.jobBoard.salary?.max?.toString() || '',
                        salaryType: selectedPost.roomSpecific.jobBoard.salary?.type || 'monthly',
                        requirements: selectedPost.roomSpecific.jobBoard.requirements?.join('\n') || '',
                        benefits: selectedPost.roomSpecific.jobBoard.benefits?.join(', ') || '',
                        incentives: selectedPost.roomSpecific.jobBoard.incentives?.join(', ') || '',
                        instructorFeeRate: selectedPost.roomSpecific.jobBoard.instructorFeeRate?.toString() || '',
                        contactEmail: selectedPost.roomSpecific.jobBoard.contactInfo?.email || '',
                        contactPhone: selectedPost.roomSpecific.jobBoard.contactInfo?.phone || '',
                        applicationDeadline: selectedPost.roomSpecific.jobBoard.applicationDeadline || ''
                      });
                      setSelectedPost(selectedPost); // 수정할 게시글 저장
                      setShowDetailModal(false);
                      setShowCreateModal(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    수정
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowDetailModal(false)}
                    className="flex items-center gap-2 ml-auto"
                  >
                    <X className="w-4 h-4" />
                    닫기
                  </Button>
                </div>
              )}

              {/* 강사인 경우 지원 버튼 표시 */}
              {user?.userType === 'instructor' && selectedPost.roomSpecific.jobBoard.jobType === 'job_post' && (
                <div className="flex gap-2 pt-4 border-t">
                  {hasApplied ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">✓ 지원 완료</span>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handleApply}
                      className="flex items-center gap-2"
                    >
                      <Briefcase className="w-4 h-4" />
                      지원하기
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    onClick={() => setShowDetailModal(false)}
                    className="flex items-center gap-2 ml-auto"
                  >
                    <X className="w-4 h-4" />
                    닫기
                  </Button>
                </div>
              )}

              {/* 작성자가 아닌 경우 닫기 버튼만 표시 */}
              {(!user || (selectedPost.authorId !== (user._id || user.id) && user.userType !== 'instructor')) && (
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDetailModal(false)}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    닫기
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 지원 목록 모달 (센터 관리자용) */}
      {showApplicationsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">지원 목록</h2>
              <button
                onClick={() => {
                  setShowApplicationsModal(false);
                  setSelectedApplication(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {applications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {applications.map((app: any) => {
                    const applicant = app.applicantId;
                    const post = app.postId;
                    return (
                      <Card
                        key={app._id}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => {
                          setSelectedApplication(app);
                          setShowApplicationDetailModal(true);
                        }}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-1">{applicant?.name || '이름 없음'} 강사</CardTitle>
                              <CardDescription>{post?.title || '제목 없음'}</CardDescription>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              app.status === 'applied' ? 'bg-blue-100 text-blue-800' :
                              app.status === 'document_passed' ? 'bg-green-100 text-green-800' :
                              app.status === 'interview_scheduled' ? 'bg-purple-100 text-purple-800' :
                              app.status === 'interview_passed' ? 'bg-green-100 text-green-800' :
                              app.status === 'final_passed' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {app.status === 'applied' ? '지원' :
                               app.status === 'document_passed' ? '서류 통과' :
                               app.status === 'interview_scheduled' ? '면접 일정' :
                               app.status === 'interview_passed' ? '면접 통과' :
                               app.status === 'final_passed' ? '최종 합격' :
                               app.status === 'document_failed' ? '서류 불합격' :
                               app.status === 'interview_failed' ? '면접 불합격' :
                               app.status === 'final_failed' ? '최종 불합격' :
                               app.status === 'withdrawn' ? '지원 취소' : app.status}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span>{applicant?.email || '-'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{applicant?.phone || '-'}</span>
                            </div>
                            {app.interviewDate && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>면접: {new Date(app.interviewDate).toLocaleDateString('ko-KR')} {app.interviewTime || ''}</span>
                              </div>
                            )}
                            <div className="text-xs text-gray-400">
                              지원일: {new Date(app.createdAt).toLocaleDateString('ko-KR')}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">지원자가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 강사용 내 지원 목록 모달 */}
      {showMyApplicationsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">내 지원 목록</h2>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowMyApplicationsModal(false);
                }}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                닫기
              </Button>
            </div>

            <div className="p-6">
              {myApplications.length > 0 ? (
                <CardGrid mobileCols={1} desktopCols={3} gap={4}>
                  {myApplications.map((app: any) => (
                    <MyApplicationCard
                      key={app._id}
                      application={app}
                      formatSalary={formatSalary}
                      onInterviewAccept={async (applicationId) => {
                        try {
                          const token = localStorage.getItem('token');
                          const response = await fetch(`http://localhost:5000/api/job-board/applications/${applicationId}/respond`, {
                            method: 'PUT',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ response: 'accept' })
                          });

                          if (!response.ok) {
                            throw new Error('면접 수락에 실패했습니다.');
                          }

                          const result = await response.json();
                          if (result.success) {
                            alert('면접을 수락했습니다.');
                            await fetchMyApplications();
                          }
                        } catch (error: any) {
                          console.error('면접 수락 실패:', error);
                          alert(error.message || '면접 수락에 실패했습니다.');
                        }
                      }}
                      onInterviewReject={async (applicationId) => {
                        try {
                          const token = localStorage.getItem('token');
                          const response = await fetch(`http://localhost:5000/api/job-board/applications/${applicationId}/respond`, {
                            method: 'PUT',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ response: 'reject' })
                          });

                          if (!response.ok) {
                            throw new Error('면접 거부에 실패했습니다.');
                          }

                          const result = await response.json();
                          if (result.success) {
                            alert('면접을 거부했습니다.');
                            await fetchMyApplications();
                          }
                        } catch (error: any) {
                          console.error('면접 거부 실패:', error);
                          alert(error.message || '면접 거부에 실패했습니다.');
                        }
                      }}
                    />
                  ))}
                </CardGrid>
              ) : (
                <div className="text-center py-16">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">지원한 공고가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 지원 상세 모달 (강사 정보 및 관리) */}
      {showApplicationDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">지원 상세</h2>
              <button
                onClick={() => {
                  setShowApplicationDetailModal(false);
                  setSelectedApplication(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 강사 기본 정보 */}
              {selectedApplication.applicantId && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">강사 정보</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">이름:</span>
                      <span>{selectedApplication.applicantId.name || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedApplication.applicantId.email || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedApplication.applicantId.phone || '-'}</span>
                    </div>
                    {selectedApplication.applicantId.instructorInfo && (
                      <>
                        {selectedApplication.applicantId.instructorInfo.introduction && (
                          <div>
                            <span className="font-medium">자기소개:</span>
                            <p className="text-gray-700 mt-1">{selectedApplication.applicantId.instructorInfo.introduction}</p>
                          </div>
                        )}
                        {selectedApplication.applicantId.instructorInfo.experience && (
                          <div>
                            <span className="font-medium">경력:</span>
                            <p className="text-gray-700 mt-1">{selectedApplication.applicantId.instructorInfo.experience}</p>
                          </div>
                        )}
                        {selectedApplication.applicantId.instructorInfo.specialties && selectedApplication.applicantId.instructorInfo.specialties.length > 0 && (
                          <div>
                            <span className="font-medium">전문 분야:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {selectedApplication.applicantId.instructorInfo.specialties.map((s: string, i: number) => (
                                <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedApplication.applicantId.instructorInfo.certifications && selectedApplication.applicantId.instructorInfo.certifications.length > 0 && (
                          <div>
                            <span className="font-medium">자격증:</span>
                            <ul className="list-disc list-inside text-gray-700 mt-1 space-y-1">
                              {selectedApplication.applicantId.instructorInfo.certifications.map((c: any, i: number) => (
                                <li key={i}>{c.name} ({c.issuer})</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* 지원 상태 및 평가 */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">지원 상태</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">현재 상태:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedApplication.status === 'applied' ? 'bg-blue-100 text-blue-800' :
                      selectedApplication.status === 'document_passed' ? 'bg-green-100 text-green-800' :
                      selectedApplication.status === 'interview_scheduled' ? 'bg-purple-100 text-purple-800' :
                      selectedApplication.status === 'interview_passed' ? 'bg-green-100 text-green-800' :
                      selectedApplication.status === 'final_passed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedApplication.status === 'applied' ? '지원' :
                       selectedApplication.status === 'document_passed' ? '서류 통과' :
                       selectedApplication.status === 'interview_scheduled' ? '면접 일정' :
                       selectedApplication.status === 'interview_passed' ? '면접 통과' :
                       selectedApplication.status === 'final_passed' ? '최종 합격' :
                       selectedApplication.status === 'document_failed' ? '서류 불합격' :
                       selectedApplication.status === 'interview_failed' ? '면접 불합격' :
                       selectedApplication.status === 'final_failed' ? '최종 불합격' :
                       selectedApplication.status === 'withdrawn' ? '지원 취소' : selectedApplication.status}
                    </span>
                  </div>
                  {selectedApplication.documentScore !== undefined && (
                    <div>
                      <span className="font-medium">서류 평가 점수:</span>
                      <span className="ml-2">{selectedApplication.documentScore}점</span>
                    </div>
                  )}
                  {selectedApplication.interviewScore !== undefined && (
                    <div>
                      <span className="font-medium">면접 평가 점수:</span>
                      <span className="ml-2">{selectedApplication.interviewScore}점</span>
                    </div>
                  )}
                  {selectedApplication.totalScore !== undefined && (
                    <div>
                      <span className="font-medium">총점:</span>
                      <span className="ml-2 font-bold">{selectedApplication.totalScore}점</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 면접 일정 설정 */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">면접 일정 관리</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">면접 날짜</label>
                      <input
                        type="date"
                        value={selectedApplication.interviewDate ? new Date(selectedApplication.interviewDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          setSelectedApplication({
                            ...selectedApplication,
                            interviewDate: e.target.value ? new Date(e.target.value).toISOString() : undefined
                          });
                        }}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">면접 시간</label>
                      <input
                        type="time"
                        value={selectedApplication.interviewTime || ''}
                        onChange={(e) => {
                          setSelectedApplication({
                            ...selectedApplication,
                            interviewTime: e.target.value
                          });
                        }}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">면접 장소</label>
                    <input
                      type="text"
                      value={selectedApplication.interviewLocation || ''}
                      onChange={(e) => {
                        setSelectedApplication({
                          ...selectedApplication,
                          interviewLocation: e.target.value
                        });
                      }}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="면접 장소를 입력하세요"
                    />
                  </div>
                </div>
              </div>

              {/* 지원 관리 버튼 */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedApplication.status === 'applied' && (
                  <Button
                    variant="primary"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        const response = await fetch(`http://localhost:5000/api/job-board/applications/${selectedApplication._id}`, {
                          method: 'PUT',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            status: 'document_passed'
                          })
                        });

                        if (!response.ok) {
                          throw new Error('서류 통과 처리에 실패했습니다.');
                        }

                        const result = await response.json();
                        if (result.success) {
                          alert('서류 통과 처리되었습니다.');
                          await fetchApplications();
                          setShowApplicationDetailModal(false);
                          setSelectedApplication(null);
                        }
                      } catch (error: any) {
                        console.error('서류 통과 처리 실패:', error);
                        alert(error.message || '서류 통과 처리에 실패했습니다.');
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    서류 통과
                  </Button>
                )}
                {selectedApplication.status === 'document_passed' && (
                  <Button
                    variant="primary"
                    onClick={async () => {
                      if (!selectedApplication.interviewDate) {
                        alert('면접 날짜를 먼저 설정해주세요.');
                        return;
                      }

                      try {
                        const token = localStorage.getItem('token');
                        const response = await fetch(`http://localhost:5000/api/job-board/applications/${selectedApplication._id}`, {
                          method: 'PUT',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            status: 'interview_scheduled',
                            interviewDate: selectedApplication.interviewDate,
                            interviewTime: selectedApplication.interviewTime,
                            interviewLocation: selectedApplication.interviewLocation
                          })
                        });

                        if (!response.ok) {
                          throw new Error('면접 일정 설정에 실패했습니다.');
                        }

                        const result = await response.json();
                        if (result.success) {
                          alert('면접 일정이 설정되었고 강사에게 알림이 전송되었습니다.');
                          await fetchApplications();
                          setShowApplicationDetailModal(false);
                          setSelectedApplication(null);
                        }
                      } catch (error: any) {
                        console.error('면접 일정 설정 실패:', error);
                        alert(error.message || '면접 일정 설정에 실패했습니다.');
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    면접 일정 설정
                  </Button>
                )}
                {selectedApplication.status === 'interview_passed' && (
                  <Button
                    variant="primary"
                    onClick={async () => {
                      if (!confirm('정말 이 강사를 채용하시겠습니까? 채용하면 센터에 소속되어 반배정 및 강의 시스템을 이용할 수 있습니다.')) {
                        return;
                      }

                      try {
                        const token = localStorage.getItem('token');
                        const response = await fetch(`http://localhost:5000/api/job-board/applications/${selectedApplication._id}/hire`, {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            contractType: 'full-time' // 기본값, 필요시 선택 가능하도록 수정 가능
                          })
                        });

                        if (!response.ok) {
                          const errorData = await response.json();
                          throw new Error(errorData.message || '채용 처리에 실패했습니다.');
                        }

                        const result = await response.json();
                        if (result.success) {
                          alert('강사가 채용되었습니다. 강사에게 알림이 전송되었습니다.');
                          await fetchApplications();
                          setShowApplicationDetailModal(false);
                          setSelectedApplication(null);
                        }
                      } catch (error: any) {
                        console.error('채용 처리 실패:', error);
                        alert(error.message || '채용 처리에 실패했습니다.');
                      }
                    }}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    채용하기
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowApplicationDetailModal(false);
                    setSelectedApplication(null);
                  }}
                  className="flex items-center gap-2 ml-auto"
                >
                  <X className="w-4 h-4" />
                  닫기
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 구인등록 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedPost ? '구인 공고 수정' : '구인 공고 등록'}
              </h2>
              <button onClick={() => {
                setShowCreateModal(false);
                setSelectedPost(null);
              }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* 기본 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">기본 정보</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
                  <input
                    type="text"
                    value={newJobPost.title}
                    onChange={(e) => setNewJobPost({ ...newJobPost, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="예: 수영강사 정규직 채용합니다"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상세 내용 *</label>
                  <textarea
                    value={newJobPost.content}
                    onChange={(e) => setNewJobPost({ ...newJobPost, content: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="채용 공고 상세 내용을 입력하세요"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">구분</label>
                    <select
                      value={newJobPost.jobType}
                      onChange={(e) => setNewJobPost({ ...newJobPost, jobType: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="job_post">구인</option>
                      <option value="resume">구직</option>
                      <option value="freelance">프리랜스</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">직책</label>
                    <select
                      value={newJobPost.position}
                      onChange={(e) => setNewJobPost({ ...newJobPost, position: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="instructor">강사</option>
                      <option value="lifeguard">안전요원</option>
                      <option value="front_desk">인포데스크</option>
                      <option value="office">사무직</option>
                      <option value="manager">관리자</option>
                      <option value="other">기타</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">근무 형태</label>
                    <select
                      value={newJobPost.employmentType}
                      onChange={(e) => setNewJobPost({ ...newJobPost, employmentType: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="full_time">정규직</option>
                      <option value="part_time">파트타임</option>
                      <option value="contract">계약직</option>
                      <option value="freelance">프리랜스</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">근무 지역</label>
                    <input
                      type="text"
                      value={newJobPost.location}
                      onChange={(e) => setNewJobPost({ ...newJobPost, location: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="예: 강남구"
                    />
                  </div>
                </div>
              </div>

              {/* 급여 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">급여 정보</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">최소 급여</label>
                    <input
                      type="number"
                      value={newJobPost.salaryMin}
                      onChange={(e) => setNewJobPost({ ...newJobPost, salaryMin: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="2500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">최대 급여</label>
                    <input
                      type="number"
                      value={newJobPost.salaryMax}
                      onChange={(e) => setNewJobPost({ ...newJobPost, salaryMax: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="3500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">급여 단위</label>
                    <select
                      value={newJobPost.salaryType}
                      onChange={(e) => setNewJobPost({ ...newJobPost, salaryType: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="monthly">만원/월</option>
                      <option value="hourly">원/시간</option>
                      <option value="per_class">원/회</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 자격 요건 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">자격 요건</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">자격 요건 (줄바꿈으로 구분)</label>
                  <textarea
                    value={newJobPost.requirements}
                    onChange={(e) => setNewJobPost({ ...newJobPost, requirements: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="예:&#10;수영 지도자 자격증&#10;3년 이상 경력"
                  />
                </div>
              </div>

              {/* 혜택 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">혜택</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">혜택 (쉼표로 구분)</label>
                  <input
                    type="text"
                    value={newJobPost.benefits}
                    onChange={(e) => setNewJobPost({ ...newJobPost, benefits: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="예: 4대보험, 퇴직금, 차량지원"
                  />
                </div>
              </div>

              {/* 인센티브 및 강사 조건 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">인센티브 및 강사 조건</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">인센티브 (쉼표로 구분)</label>
                  <input
                    type="text"
                    value={newJobPost.incentives}
                    onChange={(e) => setNewJobPost({ ...newJobPost, incentives: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="예: 신규 회원 유치 보너스, 목표 달성 시 추가 지급"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">개인레슨 강사 수수료 비율 (%)</label>
                  <input
                    type="number"
                    value={newJobPost.instructorFeeRate}
                    onChange={(e) => setNewJobPost({ ...newJobPost, instructorFeeRate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="예: 60"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">강사가 개인레슨 수강료에서 받는 비율을 입력하세요 (0-100%)</p>
                </div>
              </div>

              {/* 연락처 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">연락처</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                    <input
                      type="email"
                      value={newJobPost.contactEmail}
                      onChange={(e) => setNewJobPost({ ...newJobPost, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="contact@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                    <input
                      type="tel"
                      value={newJobPost.contactPhone}
                      onChange={(e) => setNewJobPost({ ...newJobPost, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="010-1234-5678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">모집 마감일</label>
                  <input
                    type="date"
                    value={newJobPost.applicationDeadline}
                    onChange={(e) => setNewJobPost({ ...newJobPost, applicationDeadline: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedPost(null);
                }}
              >
                취소
              </Button>
              <Button onClick={handleSubmit}>
                {selectedPost ? '수정하기' : '등록하기'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(JobBoardPage, { requireTypes: ['superAdmin', 'centerAdmin', 'instructor'] });


