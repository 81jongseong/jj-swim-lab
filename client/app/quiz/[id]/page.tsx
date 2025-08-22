'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/utils/api';

export default function QuizDetailPage({ params }: { params: { id: string } }) {
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await apiClient.get(`/quiz/${params.id}`);
      setQuiz(res.data);
      setAnswers(((res.data as any)?.questions || []).map(() => null));
      setLoading(false);
    };
    load();
  }, [params.id]);

  const submit = async () => {
    const res = await apiClient.post(`/quiz/${params.id}/take`, { answers });
    if (!res.error) setResult(res.data);
  };

  if (loading) return <div className="pt-16 p-6">로딩 중...</div>;
  if (!quiz) return <div className="pt-16 p-6">퀴즈를 불러오지 못했습니다.</div>;

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">결과: {Math.round(result.score)}점 ({result.passed ? '합격' : '불합격'})</h1>
          <div className="space-y-3">
             {(result.results || []).map((r: any, idx: number) => (
              <div key={idx} className="bg-white p-4 rounded border">
                <div className="font-medium">Q{idx + 1}. {r.question}</div>
                <div className="text-sm mt-1">내 답: {String(r.userAnswer)} / 정답: {String(r.correctAnswer)} — {r.isCorrect ? '정답' : '오답'}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setResult(null)} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded">다시 풀기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{quiz.title}</h1>
        <p className="text-gray-600 mb-8">{quiz.description}</p>
        <div className="space-y-6">
           {((quiz as any).questions || []).map((q: any, idx: number) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <div className="font-semibold mb-3">Q{idx + 1}. {q.questionText || q.question}</div>
              <div className="space-y-2">
                {((q.options || []) as any[]).map((opt: any, i: number) => (
                  <label key={i} className="flex items-center gap-2">
                    <input type="radio" name={`q-${idx}`} onChange={() => {
                      const next = [...answers];
                      next[idx] = opt.value ?? opt;
                      setAnswers(next);
                    }} />
                    <span>{opt.label ?? String(opt)}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={submit} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded">제출</button>
      </div>
    </div>
  );
}



