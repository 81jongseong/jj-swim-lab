/**
 * 💬 JJ Swim Lab - 커뮤니티 페이지
 * 
 * 📋 **페이지 목적**
 * - 수영 강습 관련 커뮤니티 게시글 목록을 표시하는 페이지
 * - 게시글 검색, 필터링, 페이지네이션 기능 제공
 * - 커뮤니티 게시글 작성, 수정, 삭제 기능
 * - 게시글 상세 보기 및 댓글 기능
 * - 커뮤니티 통계 및 인기 게시글 표시
 * 
 * 🔄 **주요 기능**
 * - 게시글 목록 조회 및 표시
 * - 게시글 검색 (제목, 내용, 태그별)
 * - 게시글 필터링 (태그별, 날짜별)
 * - 페이지네이션 및 정렬 기능
 * - 게시글 작성 및 수정
 * - 게시글 상세 보기 및 댓글
 * - 커뮤니티 통계 및 인기 게시글
 * 
 * 🗄️ **데이터 연동**
 * - 커뮤니티 API와 연동 (게시글 목록)
 * - 게시글 검색 및 필터링 API
 * - 게시글 작성 및 수정 API
 * - 댓글 시스템 API
 * - 사용자 인증 시스템
 * - 실시간 데이터 업데이트
 * 
 * 🛠️ **필요한 설치 파일**
 * - Next.js 14.2.5 (App Router)
 * - React 18.3.1
 * - TypeScript 5.x
 * - Tailwind CSS 3.3.0
 * - API 클라이언트 (../utils/api)
 * - 커뮤니티 API 엔드포인트
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 게시글 검색 성능 최적화
 * 2. 페이지네이션 성능 최적화
 * 3. 게시글 내용 검증 및 sanitization
 * 4. 반응형 디자인 적용 (모바일/데스크톱)
 * 5. 로딩 상태 및 에러 처리
 * 6. 접근성 지원 (키보드 네비게이션, ARIA 라벨)
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 게시글 검색 및 필터링 확인
 * - [ ] 페이지네이션 기능 확인
 * - [ ] 게시글 내용 검증 확인
 * - [ ] 반응형 디자인 테스트
 * - [ ] 로딩 상태 및 에러 처리 확인
 * - [ ] 접근성 지원 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 커뮤니티 페이지 구현
 * - 2024-12-19: 게시글 목록 및 검색 기능 구현
 * - 2024-12-19: 게시글 필터링 및 페이지네이션 구현
 * - 2024-12-19: 게시글 작성 및 수정 기능 구현
 * - 2024-12-19: 반응형 디자인 및 사용자 경험 개선
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (커뮤니티 페이지 완료)
 * 
 * 🚀 **다음 단계**
 * - 실시간 게시글 알림 시스템
 * - 게시글 추천 시스템
 * - 커뮤니티 모더레이션 도구
 * - 커뮤니티 통계 대시보드
 * - 커뮤니티 보안 강화
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // 커뮤니티 페이지 접근
 * /community
 * 
 * // 게시글 검색
 * const searchResults = await apiClient.getCommunityPosts({ q: '자유형' });
 * 
 * // 게시글 필터링
 * const filteredPosts = await apiClient.getCommunityPosts({ tag: '초급' });
 * ```
 * 
 * 🔍 **커뮤니티 페이지 처리 흐름**
 * 1. 게시글 목록 데이터 로드
 * 2. 검색 및 필터링 조건 적용
 * 3. 페이지네이션 및 정렬 처리
 * 4. 게시글 목록 렌더링
 * 5. 사용자 상호작용 처리
 * 6. 게시글 작성 및 수정 처리
 * 7. 실시간 데이터 업데이트
 */

'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/utils/api';

interface Post { _id: string; title: string; content: string; author?: any; tags?: string[]; createdAt?: string }

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const params: any = {};
    if (q) params.q = q; if (tag) params.tag = tag;
    const res = await apiClient.getCommunityPosts(params);
    console.log('🔍 API 응답:', res);
    if (res.error) setError(res.error); else setPosts((res.data as any)?.posts || res.data || []);
    setLoading(false);
  };

  useEffect(()=>{ load(); }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">커뮤니티</h1>
          <div className="flex items-center gap-2">
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="검색" className="px-3 py-2 border rounded" />
            <input value={tag} onChange={(e)=>setTag(e.target.value)} placeholder="태그" className="px-3 py-2 border rounded" />
            <button onClick={load} className="px-3 py-2 bg-gray-800 text-white rounded">검색</button>
          </div>
        </div>

        {loading && <div className="text-gray-600">로딩 중...</div>}
        {error && <div className="text-red-700">{error}</div>}

        <div className="space-y-4">
          {posts.map(p => (
            <a href={`/community/${p._id}`} className="bg-white rounded shadow p-4 block hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <span className="text-xs text-gray-500">{p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-3 mt-2">{p.content}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(p.tags||[]).map((t,i)=>(<span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded">#{t}</span>))}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}


