/**
 * 🎥 JJ Swim Lab - 동영상 피드백 페이지
 * 
 * 📋 **페이지 목적**
 * - 회원이 유튜브 동영상 링크를 등록하고 피드백을 받는 페이지
 * - 강사 및 회원들의 기술 피드백 수집
 * - 공개 범위 설정 (본인 센터 강사, 모든 강사, 센터 회원, 전체 회원)
 * 
 * 🗄️ **데이터 연동**
 * - POST /api/uploads - 유튜브 링크 등록
 * - GET /api/uploads - 동영상 목록 조회
 * - GET /api/uploads/:id - 동영상 상세 조회
 * - POST /api/uploads/:id/feedback - 피드백 추가
 * 
 * 🔄 **연동 파일**
 * - server/src/routes/uploads.ts
 * - server/src/models/Video.ts
 * - client/app/community/page.tsx (커뮤니티 통합)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import withAuth from '@/components/withAuth';
import { Plus, Youtube, Eye, MessageSquare, Star, Users, Lock, Globe, Building2, UserCheck, HelpCircle, ExternalLink, Copy, CheckCircle } from 'lucide-react';

interface Video {
  _id: string;
  youtubeUrl: string;
  title?: string;
  description?: string;
  owner: {
    _id: string;
    name: string;
    userId: string;
  };
  ownerCenterId?: {
    _id: string;
    name: string;
  };
  visibility: {
    myCenterInstructors: boolean;
    allInstructors: boolean;
    myCenterMembers: boolean;
    allMembers: boolean;
  };
  feedbacks: Array<{
    _id?: string;
    reviewer: {
      _id: string;
      name: string;
      userId: string;
      userType: string;
    };
    reviewerType: 'instructor' | 'member';
    content: string;
    rating?: number;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface VisibilitySettings {
  myCenterInstructors: boolean;
  allInstructors: boolean;
  myCenterMembers: boolean;
  allMembers: boolean;
}

function VideoFeedbackPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'my'>('all');
  
  // 업로드 폼 상태
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<VisibilitySettings>({
    myCenterInstructors: false,
    allInstructors: false,
    myCenterMembers: false,
    allMembers: false
  });
  const [uploading, setUploading] = useState(false);
  
  // 분석 요청 설정
  const [analysisRequestType, setAnalysisRequestType] = useState<'public' | 'center' | 'specific'>('public');
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
  const [availableInstructors, setAvailableInstructors] = useState<any[]>([]);
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  const [analysisFee, setAnalysisFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'transfer'>('card');
  
  // 피드백 작성 상태
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (user) {
      loadVideos();
      if (analysisRequestType === 'specific') {
        loadInstructors();
      }
    }
  }, [user, filter, analysisRequestType]);
  
  // 강사 목록 로드
  const loadInstructors = async () => {
    try {
      setLoadingInstructors(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch('http://localhost:5000/api/uploads/instructors', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('강사 목록 조회 실패');
      }
      
      const result = await response.json();
      if (result.success && result.data) {
        setAvailableInstructors(result.data.instructors || []);
      }
    } catch (error) {
      console.error('강사 목록 조회 실패:', error);
    } finally {
      setLoadingInstructors(false);
    }
  };
  
  // 선택된 강사 변경 시 분석 비용 계산
  useEffect(() => {
    if (analysisRequestType === 'specific' && selectedInstructors.length > 0) {
      let totalFee = 0;
      selectedInstructors.forEach(instructorId => {
        const instructor = availableInstructors.find(i => i._id === instructorId);
        if (instructor) {
          totalFee += instructor.analysisFee || 10000;
        }
      });
      setAnalysisFee(totalFee);
    } else {
      setAnalysisFee(0);
    }
  }, [selectedInstructors, availableInstructors, analysisRequestType]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('토큰이 없습니다.');
        return;
      }

      const myVideos = filter === 'my' ? 'true' : 'false';
      const response = await fetch(`http://localhost:5000/api/uploads?myVideos=${myVideos}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('동영상 목록 조회 실패');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setVideos(result.data.items || []);
      }
    } catch (error) {
      console.error('동영상 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!youtubeUrl.trim()) {
      alert('유튜브 링크를 입력해주세요.');
      return;
    }

    // 최소 하나의 공개 범위 선택 확인
    if (!Object.values(visibility).some(v => v === true)) {
      alert('최소 하나의 공개 범위를 선택해주세요.');
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      // 분석 요청 데이터 구성
      const analysisRequestData: any = {
        type: analysisRequestType
      };
      
      if (analysisRequestType === 'specific' && selectedInstructors.length > 0) {
        analysisRequestData.requestedInstructors = selectedInstructors;
        analysisRequestData.paymentMethod = paymentMethod;
      } else if (analysisRequestType === 'specific' && selectedInstructors.length === 0) {
        alert('특정 강사를 선택해주세요.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/uploads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          youtubeUrl: youtubeUrl.trim(),
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          visibility,
          analysisRequest: analysisRequestData
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '동영상 등록 실패');
      }

      if (result.data?.requiresPayment) {
        const confirmMessage = `동영상이 등록되었습니다!\n\n분석 요청 비용: ${result.data.analysisFee?.toLocaleString()}원\n결제를 진행하시겠습니까?`;
        if (confirm(confirmMessage)) {
          // 결제 페이지로 이동 또는 결제 모달 표시
          window.location.href = `/payments?paymentId=${result.data.paymentId}`;
        }
      } else {
        alert('동영상이 등록되었습니다!');
      }
      
      setShowUploadForm(false);
      setYoutubeUrl('');
      setTitle('');
      setDescription('');
      setVisibility({
        myCenterInstructors: false,
        allInstructors: false,
        myCenterMembers: false,
        allMembers: false
      });
      setAnalysisRequestType('public');
      setSelectedInstructors([]);
      setAnalysisFee(0);
      loadVideos();
    } catch (error: any) {
      console.error('동영상 등록 실패:', error);
      alert(error.message || '동영상 등록에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleViewDetail = async (video: Video) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/uploads/${video._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('동영상 상세 조회 실패');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setSelectedVideo(result.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('동영상 상세 조회 실패:', error);
      alert('동영상 정보를 불러올 수 없습니다.');
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedVideo || !feedbackContent.trim()) {
      alert('피드백 내용을 입력해주세요.');
      return;
    }

    try {
      setSubmittingFeedback(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/uploads/${selectedVideo._id}/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: feedbackContent.trim(),
          rating: feedbackRating > 0 ? feedbackRating : undefined
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '피드백 등록 실패');
      }

      alert('피드백이 등록되었습니다!');
      setFeedbackContent('');
      setFeedbackRating(0);
      
      // 동영상 정보 새로고침
      const detailResponse = await fetch(`http://localhost:5000/api/uploads/${selectedVideo._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (detailResponse.ok) {
        const detailResult = await detailResponse.json();
        if (detailResult.success && detailResult.data) {
          setSelectedVideo(detailResult.data);
        }
      }
      loadVideos();
    } catch (error: any) {
      console.error('피드백 등록 실패:', error);
      alert(error.message || '피드백 등록에 실패했습니다.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    // 유튜브 URL을 임베드 URL로 변환
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const getVisibilityLabel = (video: Video) => {
    const labels: string[] = [];
    if (video.visibility.myCenterInstructors) labels.push('본인 센터 강사');
    if (video.visibility.allInstructors) labels.push('모든 강사');
    if (video.visibility.myCenterMembers) labels.push('본인 센터 회원');
    if (video.visibility.allMembers) labels.push('모든 회원');
    return labels.join(', ') || '공개 범위 없음';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">동영상 목록을 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto p-6">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎥 동영상 분석 요청</h1>
          <p className="text-gray-600">
            유튜브 동영상을 공유하고 강사에게 분석을 요청하세요. 
            <span className="text-blue-600 font-medium"> 모두 공개(무료), 본인 센터(무료), 특정 강사(유료)</span> 중 선택할 수 있습니다.
          </p>
        </div>

        {/* 필터 및 업로드 버튼 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              전체 동영상
            </button>
            <button
              onClick={() => setFilter('my')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'my' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              내 동영상
            </button>
          </div>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            동영상 등록
          </button>
        </div>

        {/* 업로드 폼 */}
        {showUploadForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">새 동영상 등록</h2>
            
            {/* 유튜브 업로드 가이드 */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-5">
              <div className="flex items-start gap-3 mb-4">
                <HelpCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">📹 유튜브에 영상 올리는 방법</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    영상은 유튜브에 직접 업로드한 후, 링크만 여기에 입력하시면 됩니다.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* 스텝 1: 유튜브 업로드 */}
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <h4 className="font-semibold text-gray-900">유튜브에 영상 업로드하기</h4>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-2">
                    <li>
                      <a 
                        href="https://www.youtube.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        유튜브(YouTube)
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      에 로그인하세요
                    </li>
                    <li>우측 상단의 <strong className="text-blue-600">"만들기"</strong> 버튼을 클릭하세요</li>
                    <li><strong className="text-blue-600">"동영상 업로드"</strong>를 선택하세요</li>
                    <li>업로드할 영상 파일을 선택하거나 드래그 앤 드롭하세요</li>
                    <li>제목, 설명 등을 입력하세요</li>
                    <li>
                      <strong className="text-blue-600">공개 설정</strong>을 선택하세요:
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                        <li><strong>"링크가 있는 사용자만"</strong> (권장) - 링크를 아는 사람만 볼 수 있습니다</li>
                        <li>"비공개" - 본인만 볼 수 있습니다</li>
                        <li>"공개" - 누구나 검색해서 볼 수 있습니다</li>
                      </ul>
                    </li>
                    <li><strong className="text-blue-600">"게시"</strong> 버튼을 클릭하여 업로드를 완료하세요</li>
                  </ol>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                    <div className="font-semibold mb-2">🔒 "링크가 있는 사용자만" 설정하는 방법:</div>
                    <ol className="list-decimal list-inside space-y-1 ml-1">
                      <li>업로드 중 또는 업로드 완료 후 <strong>"공개 설정"</strong> 또는 <strong>"가시성"</strong> 버튼을 클릭하세요</li>
                      <li><strong>"링크가 있는 사용자만"</strong> 옵션을 선택하세요</li>
                      <li>이렇게 설정하면 유튜브에서 검색되지 않지만, 링크를 아는 사람은 모두 볼 수 있습니다</li>
                      <li>본인 센터 강사나 회원들에게만 링크를 공유하고 싶을 때 유용합니다</li>
                    </ol>
                  </div>
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    💡 <strong>팁:</strong> "링크가 있는 사용자만" 또는 "비공개"로 설정해도 링크만 있으면 접근 가능합니다. 
                    개인정보가 포함된 영상은 주의하세요.
                  </div>
                </div>

                {/* 스텝 2: 링크 가져오기 */}
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <h4 className="font-semibold text-gray-900">유튜브 링크 가져오기</h4>
                  </div>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div>
                      <p className="font-medium mb-2">방법 1: 업로드 완료 후 바로 복사</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>업로드가 완료되면 나타나는 <strong className="text-blue-600">"공유"</strong> 버튼을 클릭하세요</li>
                        <li><strong className="text-blue-600">"링크 복사"</strong>를 클릭하세요</li>
                        <li>아래 입력란에 붙여넣기(Ctrl+V 또는 Cmd+V)하세요</li>
                      </ol>
                    </div>
                    <div>
                      <p className="font-medium mb-2">방법 2: 이미 업로드된 영상에서 가져오기</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>
                          <a 
                            href="https://www.youtube.com/my_videos" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-1"
                          >
                            내 동영상
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          페이지로 이동하세요
                        </li>
                        <li>원하는 영상을 클릭하여 재생하세요</li>
                        <li>영상 아래의 <strong className="text-blue-600">"공유"</strong> 버튼을 클릭하세요</li>
                        <li><strong className="text-blue-600">"링크 복사"</strong>를 클릭하거나</li>
                        <li>브라우저 주소창의 URL을 복사하세요</li>
                      </ol>
                    </div>
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                      <p className="font-medium text-green-800 mb-1">✅ 올바른 링크 형식 예시:</p>
                      <div className="space-y-1 text-xs font-mono text-green-700">
                        <div>• https://www.youtube.com/watch?v=VIDEO_ID</div>
                        <div>• https://youtu.be/VIDEO_ID</div>
                        <div>• https://youtube.com/watch?v=VIDEO_ID</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  유튜브 링크 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  위 가이드를 참고하여 유튜브 링크를 입력해주세요
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">제목 (선택)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="동영상 제목"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">설명 (선택)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="동영상에 대한 설명을 입력해주세요"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 분석 요청 설정 */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  📊 분석 요청 설정 <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  누가 이 동영상을 분석해줄지 선택하세요. 특정 강사에게 요청하면 분석 비용이 발생할 수 있습니다.
                </p>
                
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="analysisRequestType"
                      value="public"
                      checked={analysisRequestType === 'public'}
                      onChange={(e) => {
                        setAnalysisRequestType('public');
                        setSelectedInstructors([]);
                      }}
                      className="mt-1 w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">모두 공개 (무료)</div>
                      <div className="text-xs text-gray-600 mt-1">
                        모든 회원과 강사가 볼 수 있고, 누구나 피드백을 남길 수 있습니다.
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="analysisRequestType"
                      value="center"
                      checked={analysisRequestType === 'center'}
                      onChange={(e) => {
                        setAnalysisRequestType('center');
                        setSelectedInstructors([]);
                      }}
                      className="mt-1 w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">본인 센터 (무료)</div>
                      <div className="text-xs text-gray-600 mt-1">
                        본인 센터의 강사와 회원만 볼 수 있습니다.
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="analysisRequestType"
                      value="specific"
                      checked={analysisRequestType === 'specific'}
                      onChange={(e) => {
                        setAnalysisRequestType('specific');
                        if (!availableInstructors.length) {
                          loadInstructors();
                        }
                      }}
                      className="mt-1 w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        특정 강사에게 요청
                        {analysisFee > 0 && (
                          <span className="text-sm text-blue-600 font-bold">
                            ({analysisFee.toLocaleString()}원)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        원하는 강사를 선택하여 분석을 요청합니다. 강사별로 분석 비용이 다를 수 있습니다.
                      </div>
                      
                      {/* 강사 선택 UI */}
                      {analysisRequestType === 'specific' && (
                        <div className="mt-3 space-y-2">
                          {loadingInstructors ? (
                            <div className="text-sm text-gray-500">강사 목록을 불러오는 중...</div>
                          ) : availableInstructors.length === 0 ? (
                            <div className="text-sm text-red-500">등록된 강사가 없습니다.</div>
                          ) : (
                            <>
                              <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-2">
                                {availableInstructors.map((instructor) => (
                                  <label
                                    key={instructor._id}
                                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedInstructors.includes(instructor._id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedInstructors([...selectedInstructors, instructor._id]);
                                        } else {
                                          setSelectedInstructors(selectedInstructors.filter(id => id !== instructor._id));
                                        }
                                      }}
                                      className="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-gray-900">
                                        {instructor.name}
                                        {instructor.isMyCenter && (
                                          <span className="ml-2 text-xs text-blue-600">(본인 센터)</span>
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {instructor.centerName} · {instructor.analysisFee?.toLocaleString()}원
                                      </div>
                                    </div>
                                  </label>
                                ))}
                              </div>
                              
                              {selectedInstructors.length > 0 && (
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <div className="text-sm font-medium text-blue-900 mb-2">
                                    선택된 강사: {selectedInstructors.length}명
                                  </div>
                                  <div className="text-sm text-blue-800">
                                    총 분석 비용: <strong>{analysisFee.toLocaleString()}원</strong>
                                  </div>
                                  
                                  <div className="mt-3">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      결제 방법
                                    </label>
                                    <select
                                      value={paymentMethod}
                                      onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'cash' | 'transfer')}
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                      <option value="card">카드</option>
                                      <option value="cash">현금</option>
                                      <option value="transfer">계좌 이체</option>
                                    </select>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  공개 범위 <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  동영상을 누가 볼 수 있는지 설정합니다. (분석 요청과는 별개입니다)
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibility.myCenterInstructors}
                      onChange={(e) => setVisibility({ ...visibility, myCenterInstructors: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span>본인 센터 강사만</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibility.allInstructors}
                      onChange={(e) => setVisibility({ ...visibility, allInstructors: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <UserCheck className="w-4 h-4 text-gray-500" />
                    <span>모든 센터 강사</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibility.myCenterMembers}
                      onChange={(e) => setVisibility({ ...visibility, myCenterMembers: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>본인 센터 회원들</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibility.allMembers}
                      onChange={(e) => setVisibility({ ...visibility, allMembers: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span>모든 회원들</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {uploading ? '등록 중...' : '등록하기'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadForm(false);
                    setYoutubeUrl('');
                    setTitle('');
                    setDescription('');
                    setVisibility({
                      myCenterInstructors: false,
                      allInstructors: false,
                      myCenterMembers: false,
                      allMembers: false
                    });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 동영상 목록 */}
        {videos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Youtube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">등록된 동영상이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewDetail(video)}
              >
                <div className="aspect-video bg-gray-900 relative">
                  <iframe
                    src={getYoutubeEmbedUrl(video.youtubeUrl)}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {video.title || '제목 없음'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {video.description || '설명 없음'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{video.owner.name}</span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {video.feedbacks?.length || 0}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    {getVisibilityLabel(video)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 상세 모달 */}
        {showDetailModal && selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">동영상 상세</h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedVideo(null);
                    setFeedbackContent('');
                    setFeedbackRating(0);
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* 동영상 플레이어 */}
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <iframe
                    src={getYoutubeEmbedUrl(selectedVideo.youtubeUrl)}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* 동영상 정보 */}
                <div>
                  <h3 className="text-xl font-semibold mb-2">{selectedVideo.title || '제목 없음'}</h3>
                  <p className="text-gray-600 mb-4">{selectedVideo.description || '설명 없음'}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>작성자: {selectedVideo.owner.name}</span>
                    <span>공개 범위: {getVisibilityLabel(selectedVideo)}</span>
                  </div>
                </div>

                {/* 피드백 작성 */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold mb-4">피드백 작성</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">평가 (선택)</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setFeedbackRating(rating)}
                            className={`p-2 rounded transition-colors ${
                              feedbackRating >= rating
                                ? 'text-yellow-400'
                                : 'text-gray-300 hover:text-yellow-300'
                            }`}
                          >
                            <Star className="w-6 h-6 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">피드백 내용</label>
                      <textarea
                        value={feedbackContent}
                        onChange={(e) => setFeedbackContent(e.target.value)}
                        placeholder="기술적인 조언이나 격려의 말을 남겨주세요"
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={submittingFeedback || !feedbackContent.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {submittingFeedback ? '등록 중...' : '피드백 등록'}
                    </button>
                  </div>
                </div>

                {/* 피드백 목록 */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold mb-4">
                    피드백 ({selectedVideo.feedbacks?.length || 0})
                  </h4>
                  {selectedVideo.feedbacks && selectedVideo.feedbacks.length > 0 ? (
                    <div className="space-y-4">
                      {selectedVideo.feedbacks.map((feedback, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {feedback.reviewer.name}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded ${
                                feedback.reviewerType === 'instructor'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {feedback.reviewerType === 'instructor' ? '강사' : '회원'}
                              </span>
                            </div>
                            {feedback.rating && (
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < feedback.rating!
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="text-gray-700">{feedback.content}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(feedback.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">아직 피드백이 없습니다.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(VideoFeedbackPage, { requireTypes: ['student', 'instructor', 'centerAdmin'] });

