'use client';

import { useState, useEffect } from 'react';

interface News {
  id: number;
  title: string;
  content: string;
  date: string;
  category: 'notice' | 'event' | 'update';
  important: boolean;
}

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    setTimeout(() => {
      setNews([
        {
          id: 1,
          title: '2025년 1월 강습 일정 안내',
          content: '2025년 1월 강습 일정이 업데이트되었습니다. 자세한 내용은 첨부된 파일을 참고해주세요.',
          date: '2025-01-15',
          category: 'notice',
          important: true
        },
        {
          id: 2,
          title: '겨울 시즌 특별 이벤트 안내',
          content: '겨울 시즌을 맞아 특별 이벤트를 진행합니다. 신규 회원 20% 할인 혜택을 제공합니다.',
          date: '2025-01-10',
          category: 'event',
          important: false
        },
        {
          id: 3,
          title: '시스템 업데이트 안내',
          content: '더 나은 서비스를 위해 시스템을 업데이트했습니다. 새로운 기능들을 확인해보세요.',
          date: '2025-01-08',
          category: 'update',
          important: false
        },
        {
          id: 4,
          title: '수영장 정기 점검 안내',
          content: '1월 20일부터 22일까지 수영장 정기 점검이 진행됩니다. 이용에 참고해주세요.',
          date: '2025-01-05',
          category: 'notice',
          important: true
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(item => item.category === selectedCategory);

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'notice': return '공지사항';
      case 'event': return '이벤트';
      case 'update': return '업데이트';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'notice': return 'bg-blue-100 text-blue-800';
      case 'event': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-single-line">공지사항</h1>

        {/* 필터 */}
        <div className="mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setSelectedCategory('notice')}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedCategory === 'notice'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              공지사항
            </button>
            <button
              onClick={() => setSelectedCategory('event')}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedCategory === 'event'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              이벤트
            </button>
            <button
              onClick={() => setSelectedCategory('update')}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedCategory === 'update'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              업데이트
            </button>
          </div>
        </div>

        {/* 공지사항 목록 */}
        <div className="space-y-4">
          {filteredNews.map((item) => (
            <div key={item.id} className={`bg-white rounded-lg shadow p-6 ${item.important ? 'border-l-4 border-red-500' : ''}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(item.category)}`}>
                    {getCategoryText(item.category)}
                  </span>
                  {item.important && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      중요
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">{item.date}</span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 card-title-text">{item.title}</h3>
              <p className="text-gray-700 description-text">{item.content}</p>
              
              <div className="mt-4 flex justify-end">
                <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                  자세히 보기
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredNews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">해당 카테고리의 공지사항이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
} 