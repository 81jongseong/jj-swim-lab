'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/utils/api';

export default function UploadsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await apiClient.getMyUploads({ page: 1, limit: 20 });
    if (!res.error) setItems(res.data.items || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!file) return;
    
    // File을 FormData로 변환
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await apiClient.uploadFile(formData);
    if (res.error) setMessage(res.error);
    else {
      setMessage('업로드 완료: ' + (res.data as any).id);
      setFile(null);
      load();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">영상 업로드</h1>
        <div className="flex items-center gap-3">
          <input type="file" accept="video/*" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
          <button onClick={submit} className="px-4 py-2 bg-blue-600 text-white rounded">업로드</button>
          {message && <div className="text-sm text-gray-700">{message}</div>}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">내 업로드</h2>
          {loading ? (
            <p>로딩중...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((v) => (
                <div key={v._id} className="border rounded p-4 space-y-1">
                  <div className="font-medium">{v.originalName}</div>
                  <div className="text-sm text-gray-600">{v.mimetype} · {(v.size/1024/1024).toFixed(1)}MB</div>
                  <div className="text-sm">상태: <span className="font-medium">{v.status}</span></div>
                  <div className="text-xs text-gray-500">업로드: {new Date(v.createdAt).toLocaleString()}</div>
                  <div className="pt-2">
                    <a
                      className="text-blue-600 hover:underline text-sm"
                      href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/uploads/${v._id}/download`}
                      target="_blank"
                    >다운로드</a>
                    <a
                      className="ml-3 text-sm underline"
                      href={`/uploads/${v._id}`}
                    >상세</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


