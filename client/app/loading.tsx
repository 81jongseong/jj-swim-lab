export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-white/10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            로딩 중...
          </h2>
          <p className="mt-2 text-center text-sm text-blue-200">
            잠시만 기다려주세요
          </p>
        </div>
        
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20">
          <div className="space-y-4">
            <div className="flex space-x-2 justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-blue-200 text-sm text-center">
              페이지를 준비하고 있습니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 