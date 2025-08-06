'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-500/20">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            오류가 발생했습니다
          </h2>
          <p className="mt-2 text-center text-sm text-blue-200">
            {error.message || '예상치 못한 오류가 발생했습니다.'}
          </p>
        </div>
        
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20">
          <div className="space-y-4">
            <p className="text-blue-200 text-sm">
              문제가 지속되면 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={reset}
                className="flex-1 bg-white text-blue-900 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                다시 시도
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-white/20 text-white py-2 px-4 rounded-lg font-medium hover:bg-white/30 transition-colors"
              >
                홈으로
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 