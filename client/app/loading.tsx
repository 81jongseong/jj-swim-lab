export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="text-6xl mb-4 animate-spin">⏳</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          로딩 중...
        </h2>
        <p className="text-gray-600">
          페이지를 불러오는 중입니다. 잠시만 기다려주세요.
        </p>
      </div>
    </div>
  );
} 