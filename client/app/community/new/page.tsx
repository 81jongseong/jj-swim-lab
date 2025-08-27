'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/utils/api';
import withAuth from '@/components/withAuth';

function CommunityNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const categories = [
    { id: '자유형', label: '🏊‍♂️ 자유형', color: 'bg-blue-100 text-blue-800' },
    { id: '평영', label: '🐸 평영', color: 'bg-green-100 text-green-800' },
    { id: '배영', label: '🦋 배영', color: 'bg-purple-100 text-purple-800' },
    { id: '접영', label: '🦅 접영', color: 'bg-orange-100 text-orange-800' },
    { id: '호흡법', label: '🫁 호흡법', color: 'bg-red-100 text-red-800' },
    { id: '기타', label: '💬 기타', color: 'bg-gray-100 text-gray-800' }
  ];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    } else if (title.length < 5) {
      newErrors.title = '제목은 5자 이상 입력해주세요.';
    } else if (title.length > 100) {
      newErrors.title = '제목은 100자 이하로 입력해주세요.';
    }
    
    if (!content.trim()) {
      newErrors.content = '내용을 입력해주세요.';
    } else if (content.length < 10) {
      newErrors.content = '내용은 10자 이상 입력해주세요.';
    }
    
    if (!category) {
      newErrors.category = '카테고리를 선택해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const res = await apiClient.post('/community/posts', { 
        title: title.trim(), 
        content: content.trim(), 
        category,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean) 
      });
      
      if (res.error) {
        alert(res.error);
        return;
      }
      
      alert('게시글이 성공적으로 등록되었습니다! 🎉');
      router.push('/community');
    } catch (error) {
      console.error('게시글 등록 실패:', error);
      alert('게시글 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 쉼표로 구분된 태그 입력 허용
    setTags(value);
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !tags.split(',').map(t => t.trim()).includes(tag.trim())) {
      const currentTags = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      setTags([...currentTags, tag.trim()].join(', '));
    }
  };

  const suggestedTags = ['초보자', '중급자', '고급자', '자유형', '평영', '배영', '접영', '호흡법', '테크닉', '팁'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16">
      <div className="max-w-4xl mx-auto p-6">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <img src="/swim-icon.png" alt="작성" className="inline-block w-12 h-12 mr-3" />
            새 게시글 작성
          </h1>
          <p className="text-lg text-gray-600">
            JJ Swim Lab 커뮤니티에 새로운 이야기를 공유해보세요!
          </p>
        </div>

        {/* 작성 폼 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-6">
            {/* 제목 입력 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📝 제목 <span className="text-red-500">*</span>
              </label>
              <input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="게시글의 제목을 입력해주세요 (5-100자)"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.title ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                maxLength={100}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
              <div className="mt-1 text-xs text-gray-500 text-right">
                {title.length}/100
              </div>
            </div>

            {/* 카테고리 선택 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🏷️ 카테고리 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      category === cat.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`text-sm font-medium ${cat.color}`}>
                      {cat.label}
                    </div>
                  </button>
                ))}
              </div>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* 내용 입력 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📄 내용 <span className="text-red-500">*</span>
              </label>
              <textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                placeholder="게시글의 내용을 자세히 작성해주세요 (10자 이상)"
                rows={12}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                  errors.content ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
              )}
              <div className="mt-1 text-xs text-gray-500 text-right">
                {content.length}자
              </div>
            </div>

            {/* 태그 입력 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🏷️ 태그
              </label>
              <input 
                value={tags} 
                onChange={handleTagInput}
                placeholder="쉼표(,)로 구분하여 태그를 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-2">추천 태그:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 작성 가이드 */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-800 mb-2">💡 작성 가이드</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 수영 관련 질문, 경험, 팁 등을 자유롭게 공유해주세요</li>
                <li>• 다른 사용자들이 이해하기 쉽게 구체적으로 작성해주세요</li>
                <li>• 적절한 카테고리와 태그를 선택하면 더 많은 분들이 찾을 수 있어요</li>
                <li>• 커뮤니티 가이드라인을 준수해주세요</li>
              </ul>
            </div>

            {/* 버튼 그룹 */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link 
                href="/community"
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-center"
              >
                ← 목록으로 돌아가기
              </Link>
              <button 
                disabled={loading}
                onClick={submit}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    등록 중...
                  </span>
                ) : (
                  '📝 게시글 등록하기'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(CommunityNewPage);






































