'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '../../../utils/api';
import { LoadingState, ErrorState, PageHeader } from '@/components/common';

export default function UploadDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      const res = await apiClient.get(`/uploads/${id}`);
      if (res.error) setError(res.error);
      else setData(res.data);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-16 p-6">
        <LoadingState message="로딩 중..." size="lg" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen pt-16 p-6">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }
  if (!data) return null;

  const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/uploads/${data._id}/download`;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-3xl mx-auto p-6 space-y-4 bg-white rounded shadow">
        <PageHeader title="업로드 상세" />
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500">파일명</div>
            <div>{data.originalName}</div>
          </div>
          <div>
            <div className="text-gray-500">형식/크기</div>
            <div>{data.mimetype} · {(data.size/1024/1024).toFixed(1)}MB</div>
          </div>
          <div>
            <div className="text-gray-500">상태</div>
            <div>{data.status}</div>
          </div>
          <div>
            <div className="text-gray-500">공개범위</div>
            <div>{data.visibility || 'private'}</div>
          </div>
          <div>
            <div className="text-gray-500">업로더</div>
            <div>{data.owner?.name || '-'}</div>
          </div>
          <div>
            <div className="text-gray-500">업로드 시각</div>
            <div>{new Date(data.createdAt).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-500">리뷰어</div>
            <div>{data.reviewedBy?.name || '-'}</div>
          </div>
          <div>
            <div className="text-gray-500">리뷰 시각</div>
            <div>{data.reviewedAt ? new Date(data.reviewedAt).toLocaleString() : '-'}</div>
          </div>
        </div>
        <div>
          <div className="text-gray-500 text-sm mb-1">피드백</div>
          <div className="whitespace-pre-wrap text-sm">{data.feedback || '-'}</div>
        </div>
        <div>
          <div className="text-gray-500 text-sm mb-1">리뷰 이력</div>
          <div className="space-y-2 text-sm">
            {(data.reviews || []).length === 0 && <div>-</div>}
            {(data.reviews || []).map((r:any, idx:number) => (
              <div key={idx} className="border rounded p-2">
                <div className="flex justify-between">
                  <span>리뷰어: {r.reviewedBy?.name || '-'}</span>
                  <span>{r.reviewedAt ? new Date(r.reviewedAt).toLocaleString() : ''}</span>
                </div>
                <div className="text-gray-600 mt-1">공개범위: {r.visibility || '-'}</div>
                <div className="mt-1 whitespace-pre-wrap">{r.feedback || '-'}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <a className="text-blue-600 hover:underline" href={downloadUrl} target="_blank">다운로드</a>
        </div>
      </div>
    </div>
  );
}


