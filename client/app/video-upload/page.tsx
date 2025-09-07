'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface UploadStatus {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  videoId?: string;
  error?: string;
}

const VideoUploadPage: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'idle',
    progress: 0,
    message: '동영상을 업로드하세요'
  });
  const [dragActive, setDragActive] = useState(false);
  const [selectedModel, setSelectedModel] = useState<File | null>(null);
  const [modelDragActive, setModelDragActive] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file) return;

    // 파일 형식 검증
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus({
        status: 'error',
        progress: 0,
        message: '지원되지 않는 파일 형식입니다.',
        error: 'MP4, AVI, MOV, WMV, WEBM만 지원됩니다.'
      });
      return;
    }

    // 파일 크기 검증 (100MB)
    if (file.size > 100 * 1024 * 1024) {
      setUploadStatus({
        status: 'error',
        progress: 0,
        message: '파일 크기가 너무 큽니다.',
        error: '최대 100MB까지 업로드 가능합니다.'
      });
      return;
    }

    uploadVideo(file);
  };

  const uploadVideo = async (file: File) => {
    setUploadStatus({
      status: 'uploading',
      progress: 0,
      message: '동영상 업로드 중...'
    });

    try {
      const formData = new FormData();
      formData.append('video', file);
      
      // 사용자 모델이 있는 경우 추가
      if (selectedModel) {
        formData.append('userModel', selectedModel);
      }

      const response = await fetch('/api/video-upload/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '업로드 실패');
      }

      if (result.success) {
        setUploadStatus({
          status: 'processing',
          progress: 0,
          message: '3D 애니메이션 생성 중...',
          videoId: result.data.videoId
        });

        // 처리 상태 폴링
        pollProcessingStatus(result.data.videoId);
      } else {
        throw new Error(result.message || '업로드 실패');
      }

    } catch (error) {
      console.error('업로드 오류:', error);
      setUploadStatus({
        status: 'error',
        progress: 0,
        message: '업로드 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  };

  const pollProcessingStatus = async (videoId: string) => {
    const pollInterval = 2000; // 2초마다 폴링
    const maxAttempts = 150; // 최대 5분 (150 * 2초)
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/video-upload/status/${videoId}`);
        const result = await response.json();

        if (result.success) {
          const { status, progress } = result.data;

          if (status === 'completed') {
            setUploadStatus({
              status: 'completed',
              progress: 100,
              message: '3D 애니메이션 생성 완료!',
              videoId
            });
            return;
          } else if (status === 'failed') {
            setUploadStatus({
              status: 'error',
              progress: 0,
              message: '처리 중 오류가 발생했습니다.',
              error: result.data.error || '알 수 없는 오류'
            });
            return;
          } else if (status === 'processing') {
            setUploadStatus(prev => ({
              ...prev,
              progress: progress || prev.progress + 10,
              message: `처리 중... ${Math.min(progress || prev.progress + 10, 90)}%`
            }));
          }

          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, pollInterval);
          } else {
            setUploadStatus({
              status: 'error',
              progress: 0,
              message: '처리 시간이 초과되었습니다.',
              error: '처리 시간이 5분을 초과했습니다.'
            });
          }
        } else {
          throw new Error(result.message || '상태 조회 실패');
        }
      } catch (error) {
        console.error('상태 조회 오류:', error);
        setUploadStatus({
          status: 'error',
          progress: 0,
          message: '상태 조회 중 오류가 발생했습니다.',
          error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
      }
    };

    poll();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const resetUpload = () => {
    setUploadStatus({
      status: 'idle',
      progress: 0,
      message: '동영상을 업로드하세요'
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const goToViewer = () => {
    if (uploadStatus.videoId) {
      router.push(`/video-viewer/${uploadStatus.videoId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🏊‍♂️ 3D 수영 애니메이션 생성기
          </h1>
          <p className="text-xl text-blue-200">
            2D 동영상을 업로드하면 AI가 3D 애니메이션으로 변환합니다
          </p>
        </div>

        {/* 업로드 영역 */}
        <div className="max-w-2xl mx-auto">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
              dragActive
                ? 'border-blue-400 bg-blue-50 bg-opacity-20'
                : uploadStatus.status === 'error'
                ? 'border-red-400 bg-red-50 bg-opacity-20'
                : uploadStatus.status === 'completed'
                ? 'border-green-400 bg-green-50 bg-opacity-20'
                : 'border-gray-300 bg-white bg-opacity-10'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={uploadStatus.status === 'uploading' || uploadStatus.status === 'processing'}
            />

            {uploadStatus.status === 'idle' && (
              <div>
                <div className="text-6xl mb-4">📹</div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  동영상 파일을 드래그하거나 클릭하세요
                </h3>
                <p className="text-blue-200 mb-4">
                  MP4, AVI, MOV, WMV, WEBM 형식 지원
                </p>
                <p className="text-sm text-gray-300 mb-4">
                  최대 파일 크기: 100MB
                </p>
                
                {/* 사용자 3D 모델 선택 */}
                <div className="mb-4 p-4 bg-white bg-opacity-10 rounded-lg">
                  <h4 className="text-lg font-semibold text-white mb-2">🎨 3D 모델 (선택사항)</h4>
                  <p className="text-sm text-gray-300 mb-3">
                    사용자 모델을 업로드하면 해당 모델에 애니메이션이 적용됩니다
                  </p>
                  
                  {selectedModel ? (
                    <div className="flex items-center justify-between p-3 bg-green-600 bg-opacity-20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-400">✅</span>
                        <span className="text-white">{selectedModel.name}</span>
                      </div>
                      <button
                        onClick={() => setSelectedModel(null)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                        modelDragActive
                          ? 'border-blue-400 bg-blue-50 bg-opacity-20'
                          : 'border-gray-300 bg-white bg-opacity-5'
                      }`}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        setModelDragActive(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setModelDragActive(false);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setModelDragActive(false);
                        const file = e.dataTransfer.files[0];
                        if (file && file.name.match(/\.(blend|fbx|obj|glb|gltf)$/i)) {
                          setSelectedModel(file);
                        }
                      }}
                    >
                      <div className="text-2xl mb-2">🎭</div>
                      <p className="text-white mb-1">3D 모델 드래그하거나 클릭</p>
                      <p className="text-sm text-gray-300">
                        .blend, .fbx, .obj, .glb, .gltf 지원
                      </p>
                      <input
                        type="file"
                        accept=".blend,.fbx,.obj,.glb,.gltf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setSelectedModel(file);
                        }}
                        className="hidden"
                        id="model-input"
                      />
                      <label
                        htmlFor="model-input"
                        className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        모델 선택
                      </label>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  동영상 선택
                </button>
              </div>
            )}

            {uploadStatus.status === 'uploading' && (
              <div>
                <div className="text-6xl mb-4 animate-pulse">⬆️</div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  업로드 중...
                </h3>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadStatus.progress}%` }}
                  ></div>
                </div>
                <p className="text-blue-200">{uploadStatus.message}</p>
              </div>
            )}

            {uploadStatus.status === 'processing' && (
              <div>
                <div className="text-6xl mb-4 animate-spin">🤖</div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  AI가 3D 애니메이션을 생성하고 있습니다
                </h3>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadStatus.progress}%` }}
                  ></div>
                </div>
                <p className="text-purple-200">{uploadStatus.message}</p>
                <p className="text-sm text-gray-300 mt-2">
                  예상 소요 시간: 2-5분
                </p>
              </div>
            )}

            {uploadStatus.status === 'completed' && (
              <div>
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  생성 완료!
                </h3>
                <p className="text-green-200 mb-4">{uploadStatus.message}</p>
                <div className="space-x-4">
                  <button
                    onClick={goToViewer}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    🎬 3D 뷰어에서 보기
                  </button>
                  <button
                    onClick={resetUpload}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    🔄 새로 업로드
                  </button>
                </div>
              </div>
            )}

            {uploadStatus.status === 'error' && (
              <div>
                <div className="text-6xl mb-4">❌</div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  오류 발생
                </h3>
                <p className="text-red-200 mb-2">{uploadStatus.message}</p>
                {uploadStatus.error && (
                  <p className="text-sm text-red-300 mb-4">{uploadStatus.error}</p>
                )}
                <button
                  onClick={resetUpload}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            )}
          </div>

          {/* 기능 설명 */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="font-semibold text-white mb-2">AI 포즈 분석</h4>
              <p className="text-sm text-blue-200">
                OpenPose + VideoPose3D로 정확한 3D 포즈 추출
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🎨</div>
              <h4 className="font-semibold text-white mb-2">3D 애니메이션</h4>
              <p className="text-sm text-blue-200">
                Blender로 전문적인 3D 애니메이션 생성
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🌐</div>
              <h4 className="font-semibold text-white mb-2">웹 뷰어</h4>
              <p className="text-sm text-blue-200">
                Three.js로 인터랙티브 3D 뷰어 제공
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUploadPage;
