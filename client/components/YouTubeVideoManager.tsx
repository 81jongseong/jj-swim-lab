/**
 * @file YouTube 비디오 관리 컴포넌트
 * @description 강습법과 연결된 유튜브 비디오를 관리하는 컴포넌트
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import { Button, Input, Card } from './ui';
import { Badge } from '@/components/ui';

interface YouTubeVideo {
  _id?: string;
  title: string;
  description: string;
  videoId: string; // YouTube 비디오 ID
  thumbnailUrl: string;
  duration: string;
  category: string;
  level: string;
  teachingMethodId?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface YouTubeVideoManagerProps {
  teachingMethodId?: string;
  onVideoSelect?: (video: YouTubeVideo) => void;
  selectedVideoId?: string;
}

const YouTubeVideoManager: React.FC<YouTubeVideoManagerProps> = ({
  teachingMethodId,
  onVideoSelect,
  selectedVideoId
}) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<YouTubeVideo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState(true);

  // YouTube 카테고리 상수
  const YOUTUBE_CATEGORIES = [
    '자유형',
    '배영',
    '평영',
    '접영',
    '혼영',
    '기초기술',
    '호흡법',
    '발차기',
    '손짓',
    '턴',
    '스타트',
    '안전수칙',
    '체력향상',
    '기타'
  ] as const;

  // YouTube 레벨 상수
  const YOUTUBE_LEVELS = [
    { value: 'beginner', label: '초급', color: 'bg-green-100 text-green-800' },
    { value: 'intermediate', label: '중급', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'advanced', label: '고급', color: 'bg-red-100 text-red-800' }
  ] as const;

  useEffect(() => {
    fetchVideos();
  }, [teachingMethodId]);

  useEffect(() => {
    filterVideos();
  }, [videos, searchTerm, selectedCategory, selectedLevel]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        logger.error('❌ JWT 토큰이 없습니다.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/youtube-videos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const apiVideos = data.data || data;

        if (Array.isArray(apiVideos)) {
          setVideos(apiVideos);
        } else {
          logger.error('❌ 비디오 데이터 형식 오류:', apiVideos);
          setVideos([]);
        }
      } else {
        logger.error('❌ 비디오 조회 실패:', response.status);
        setVideos([]);
      }
    } catch (error) {
      logger.error('❌ 비디오 조회 중 오류:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const filterVideos = () => {
    let filtered = videos;

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(video => video.category === selectedCategory);
    }

    // 레벨 필터
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(video => video.level === selectedLevel);
    }

    setFilteredVideos(filtered);
  };

  const extractVideoId = (url: string): string => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  };

  const getThumbnailUrl = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const handleVideoSelect = (video: YouTubeVideo) => {
    if (onVideoSelect) {
      onVideoSelect(video);
    }
  };

  const handleFormSubmit = async (videoData: Partial<YouTubeVideo>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const videoId = extractVideoId(videoData.videoId || '');
      if (!videoId) {
        alert('유효한 YouTube URL을 입력해주세요.');
        return;
      }

      const payload = {
        ...videoData,
        videoId,
        thumbnailUrl: getThumbnailUrl(videoId),
        teachingMethodId: teachingMethodId || null
      };

      const url = editingVideo
        ? `http://localhost:5000/api/youtube-videos/${editingVideo._id}`
        : 'http://localhost:5000/api/youtube-videos';

      const method = editingVideo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(editingVideo ? '비디오가 수정되었습니다!' : '비디오가 추가되었습니다!');
        setIsFormOpen(false);
        setEditingVideo(null);
        fetchVideos();
      } else {
        const errorData = await response.json();
        alert(`오류: ${errorData.message || '비디오 저장에 실패했습니다.'}`);
      }
    } catch (error) {
      logger.error('❌ 비디오 저장 중 오류:', error);
      alert('비디오 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('이 비디오를 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/youtube-videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('비디오가 삭제되었습니다!');
        fetchVideos();
      } else {
        const errorData = await response.json();
        alert(`오류: ${errorData.message || '비디오 삭제에 실패했습니다.'}`);
      }
    } catch (error) {
      logger.error('❌ 비디오 삭제 중 오류:', error);
      alert('비디오 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🎬 YouTube 비디오 관리</h2>
          <p className="text-gray-600">강습법과 연결된 YouTube 비디오를 관리합니다.</p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          ➕ 비디오 추가
        </Button>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="비디오 제목, 설명, 카테고리로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체 카테고리</option>
                {YOUTUBE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체 레벨</option>
                {YOUTUBE_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* 비디오 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <Card
            key={video._id}
            className={`hover:shadow-lg transition-shadow duration-200 cursor-pointer ${selectedVideoId === video._id ? 'ring-2 ring-blue-500' : ''
              }`}
            onClick={() => handleVideoSelect(video)}
          >
            <div className="p-6">
              {/* 썸네일 */}
              <div className="relative mb-4">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>

              {/* 제목 및 레벨 */}
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {video.title}
                </h3>
                <Badge className={YOUTUBE_LEVELS.find(l => l.value === video.level)?.color || 'bg-gray-100 text-gray-800'}>
                  {YOUTUBE_LEVELS.find(l => l.value === video.level)?.label || video.level}
                </Badge>
              </div>

              {/* 설명 */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {video.description}
              </p>

              {/* 카테고리 */}
              <div className="mb-4">
                <Badge className="bg-blue-100 text-blue-800">
                  📂 {video.category}
                </Badge>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => {
                    window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank');
                  }}
                  variant="outline"
                  className="flex-1 bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                >
                  🎬 재생
                </Button>
                <Button
                  onClick={() => {
                    setEditingVideo(video);
                    setIsFormOpen(true);
                  }}
                  variant="outline"
                  className="flex-1 bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                >
                  ✏️ 수정
                </Button>
                <Button
                  onClick={() => {
                    handleDelete(video._id!);
                  }}
                  variant="outline"
                  className="flex-1 bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                >
                  🗑️ 삭제
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredVideos.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            등록된 비디오가 없습니다.
          </div>
        </div>
      )}

      {/* 비디오 추가/수정 폼 */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingVideo ? '비디오 수정' : '새 비디오 추가'}
                </h3>
                <button
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingVideo(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const videoData = {
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  videoId: formData.get('videoId') as string,
                  category: formData.get('category') as string,
                  level: formData.get('level') as string,
                  duration: formData.get('duration') as string
                };
                handleFormSubmit(videoData);
              }} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    비디오 제목 *
                  </label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingVideo?.title}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="videoId" className="block text-sm font-medium text-gray-700 mb-2">
                    YouTube URL *
                  </label>
                  <Input
                    id="videoId"
                    name="videoId"
                    defaultValue={editingVideo?.videoId ? `https://www.youtube.com/watch?v=${editingVideo.videoId}` : ''}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      카테고리 *
                    </label>
                    <select
                      id="category"
                      name="category"
                      defaultValue={editingVideo?.category || '자유형'}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {YOUTUBE_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                      레벨 *
                    </label>
                    <select
                      id="level"
                      name="level"
                      defaultValue={editingVideo?.level || 'beginner'}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {YOUTUBE_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    설명 *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    defaultValue={editingVideo?.description}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                    재생 시간 (예: 5:30)
                  </label>
                  <Input
                    id="duration"
                    name="duration"
                    defaultValue={editingVideo?.duration}
                    placeholder="5:30"
                    className="w-full"
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingVideo(null);
                    }}
                    variant="outline"
                  >
                    취소
                  </Button>
                  <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                    {editingVideo ? '수정' : '추가'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeVideoManager;
