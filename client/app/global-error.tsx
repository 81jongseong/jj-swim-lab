'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center border border-red-200">
            <div className="text-6xl mb-4">🚨</div>
            <h2 className="text-2xl font-bold text-red-900 mb-4">
              심각한 오류가 발생했습니다
            </h2>
            <p className="text-red-600 mb-6">
              애플리케이션에서 치명적인 오류가 발생했습니다.
            </p>
            <button
              onClick={reset}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}


