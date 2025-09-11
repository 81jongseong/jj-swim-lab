'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
// import ThreeJSAnimationViewer from '@/components/ThreeJSAnimationViewer';

interface VideoData {
  videoId: string;
  status: string;
  progress: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

const VideoViewerPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;
  
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadLinks, setDownloadLinks] = useState<{
    glb?: string;
    fbx?: string;
    bvh?: string;
  }>({});

  useEffect(() => {
    if (videoId) {
      fetchVideoData();
    }
  }, [videoId]);

  const fetchVideoData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/video-upload/status/${videoId}`);
      const result = await response.json();

      if (result.success) {
        setVideoData(result.data);
        
        // 다운로드 링크 생성
        setDownloadLinks({
          glb: `/api/video-upload/download/${videoId}/glb`,
          fbx: `/api/video-upload/download/${videoId}/fbx`,
          bvh: `/api/video-upload/download/${videoId}/bvh`
        });
      } else {
        setError(result.message || '비디오 데이터를 가져올 수 없습니다.');
      }
    } catch (err) {
      console.error('비디오 데이터 조회 오류:', err);
      setError('비디오 데이터를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기 중';
      case 'processing':
        return '처리 중';
      case 'completed':
        return '완료';
      case 'failed':
        return '실패';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'processing':
        return 'text-blue-500';
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">3D 뷰어 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !videoData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-auto">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-4">오류 발생</h1>
          <p className="text-red-200 mb-6">{error || '비디오를 찾을 수 없습니다.'}</p>
          <button
            onClick={() => router.push('/video-upload')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            새로 업로드
          </button>
        </div>
      </div>
    );
  }

  if (videoData.status === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-auto">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">처리 실패</h1>
          <p className="text-red-200 mb-2">3D 애니메이션 생성에 실패했습니다.</p>
          {videoData.error && (
            <p className="text-sm text-red-300 mb-6">{videoData.error}</p>
          )}
          <button
            onClick={() => router.push('/video-upload')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (videoData.status !== 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-auto">
          <div className="text-6xl mb-4 animate-spin">🤖</div>
          <h1 className="text-2xl font-bold mb-4">처리 중</h1>
          <p className="text-blue-200 mb-4">
            AI가 3D 애니메이션을 생성하고 있습니다...
          </p>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${videoData.progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-300">
            진행률: {videoData.progress}%
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* 헤더 */}
      <div className="bg-black bg-opacity-30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/video-upload')}
                className="text-white hover:text-blue-300 transition-colors"
              >
                ← 뒤로가기
              </button>
              <h1 className="text-2xl font-bold text-white">
                🏊‍♂️ 3D 수영 애니메이션
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(videoData.status)} bg-white bg-opacity-20`}>
                {getStatusText(videoData.status)}
              </span>
              <div className="text-sm text-gray-300">
                생성: {formatDate(videoData.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 3D 뷰어 */}
          <div className="lg:col-span-3">
            <div className="bg-black bg-opacity-20 rounded-lg overflow-hidden">
              <div className="h-96 lg:h-[600px] flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🏊‍♂️</div>
                  <h3 className="text-2xl font-bold mb-2">3D 애니메이션 뷰어</h3>
                  <p className="text-lg opacity-80">동영상 기반 3D 모션 캡처</p>
                </div>
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 비디오 정보 */}
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">📊 비디오 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">ID:</span>
                  <span className="text-white font-mono">{videoId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">상태:</span>
                  <span className={getStatusColor(videoData.status)}>
                    {getStatusText(videoData.status)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">생성일:</span>
                  <span className="text-white">{formatDate(videoData.createdAt)}</span>
                </div>
                {videoData.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">완료일:</span>
                    <span className="text-white">{formatDate(videoData.completedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 다운로드 */}
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">📥 다운로드</h3>
              <div className="space-y-2">
                <a
                  href={downloadLinks.glb}
                  download
                  className="block w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-center"
                >
                  📦 GLB 파일
                </a>
                <a
                  href={downloadLinks.fbx}
                  download
                  className="block w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-center"
                >
                  🎬 FBX 파일
                </a>
                <a
                  href={downloadLinks.bvh}
                  download
                  className="block w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-center"
                >
                  🕺 BVH 파일
                </a>
              </div>
            </div>

            {/* 컨트롤 가이드 */}
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">🎮 조작법</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400">🖱️</span>
                  <span>마우스 드래그: 회전</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400">🔄</span>
                  <span>휠: 확대/축소</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400">▶️</span>
                  <span>재생/일시정지</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400">🔄</span>
                  <span>카메라 리셋</span>
                </div>
              </div>
            </div>

            {/* 새로 업로드 */}
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <button
                onClick={() => router.push('/video-upload')}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                🆕 새 동영상 업로드
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoViewerPage;






