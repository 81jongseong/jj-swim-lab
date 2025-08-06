import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-yellow-500/20">
            <span className="text-2xl">🔍</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="mt-2 text-center text-sm text-blue-200">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>
        
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20">
          <div className="space-y-4">
            <p className="text-blue-200 text-sm text-center">
              URL을 다시 확인하거나 홈페이지로 돌아가서 원하는 페이지를 찾아보세요.
            </p>
            
            <div className="flex space-x-4">
              <Link
                href="/"
                className="flex-1 bg-white text-blue-900 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors text-center"
              >
                홈으로
              </Link>
              <button
                onClick={() => window.history.back()}
                className="flex-1 bg-white/20 text-white py-2 px-4 rounded-lg font-medium hover:bg-white/30 transition-colors"
              >
                이전 페이지
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 