'use client';

import { useState } from 'react';
import Link from 'next/link';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  date: string;
  category: string;
  isImportant: boolean;
}

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const newsItems: NewsItem[] = [
    {
      id: 1,
      title: "시스템 업데이트 안내",
      content: "새로운 AI 기반 학습 시스템이 업데이트되었습니다. 더욱 정확한 진도 분석과 맞춤형 훈련 추천이 가능해졌습니다.",
      date: "2025.01.15",
      category: "system",
      isImportant: true,
    },
    {
      id: 2,
      title: "2025년 상반기 수영 대회 일정",
      content: "2025년 상반기 수영 대회 일정이 공개되었습니다. 참가 신청은 2월 1일부터 시작됩니다.",
      date: "2025.01.10",
      category: "event",
      isImportant: true,
    },
    {
      id: 3,
      title: "새로운 강사 등록",
      content: "경력 10년 이상의 전문 강사가 새롭게 등록되었습니다. 자유형, 접영 전문 강사입니다.",
      date: "2025.01.05",
      category: "instructor",
      isImportant: false,
    },
    {
      id: 4,
      title: "겨울 시즌 프로그램 안내",
      content: "겨울 시즌 특별 프로그램이 시작됩니다. 실내 수영장에서 안전하게 수영을 배워보세요.",
      date: "2024.12.20",
      category: "program",
      isImportant: false,
    },
    {
      id: 5,
      title: "모의고사 시스템 개선",
      content: "수영 이론 모의고사 시스템이 개선되었습니다. 더욱 다양한 문제 유형을 제공합니다.",
      date: "2024.12.15",
      category: "system",
      isImportant: false,
    },
    {
      id: 6,
      title: "연말연시 운영시간 안내",
      content: "연말연시 기간 중 운영시간이 변경됩니다. 자세한 내용은 공지사항을 확인해주세요.",
      date: "2024.12.10",
      category: "notice",
      isImportant: true,
    },
  ];

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'system', label: '시스템' },
    { value: 'event', label: '이벤트' },
    { value: 'instructor', label: '강사' },
    { value: 'program', label: '프로그램' },
    { value: 'notice', label: '공지' },
  ];

  const filteredNews = newsItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryLabel = (category: string) => {
    const found = categories.find(c => c.value === category);
    return found ? found.label : category;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'system': return 'bg-blue-100 text-blue-800';
      case 'event': return 'bg-green-100 text-green-800';
      case 'instructor': return 'bg-purple-100 text-purple-800';
      case 'program': return 'bg-orange-100 text-orange-800';
      case 'notice': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">📢 공지사항</h1>
          <p className="text-gray-600">
            JJ Swim Lab의 최신 소식과 업데이트 정보를 확인하세요.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="공지사항 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedCategory === category.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* News List */}
        <div className="space-y-6">
          {filteredNews.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-500">검색 결과가 없습니다.</p>
            </div>
          ) : (
            filteredNews.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${
                  item.isImportant ? 'border-l-4 border-red-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                      {getCategoryLabel(item.category)}
                    </span>
                    {item.isImportant && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        중요
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{item.date}</span>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>

                <p className="text-gray-600 mb-4 leading-relaxed">
                  {item.content}
                </p>

                <div className="flex items-center justify-between">
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    자세히 보기 →
                  </button>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>👁️ 1,234</span>
                    <span>👍 56</span>
                    <span>💬 12</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50">
              이전
            </button>
            <button className="px-3 py-2 bg-blue-600 text-white rounded-md">1</button>
            <button className="px-3 py-2 text-gray-500 hover:text-gray-700">2</button>
            <button className="px-3 py-2 text-gray-500 hover:text-gray-700">3</button>
            <button className="px-3 py-2 text-gray-500 hover:text-gray-700">
              다음
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
} 