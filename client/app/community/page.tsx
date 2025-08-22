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


