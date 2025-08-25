"use client";

import { useState, useEffect } from 'react';

export default function TestPage() {
  console.log('🧪 TestPage 컴포넌트 렌더링 시작');
  
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log('⚡ TestPage useEffect 실행됨');
  }, []);
  
  const handleClick = () => {
    console.log('🖱️ 버튼 클릭됨');
    setCount(prev => prev + 1);
  };
  
  console.log('🔍 TestPage 렌더링 중, count:', count);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">🧪 테스트 페이지</h1>
      <p className="mb-4">이 페이지가 제대로 렌더링되는지 테스트합니다.</p>
      
      <div className="bg-blue-100 p-4 rounded-lg mb-4">
        <p>현재 카운트: <span className="font-bold text-blue-600">{count}</span></p>
        <button 
          onClick={handleClick}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          카운트 증가
        </button>
      </div>
      
      <div className="bg-green-100 p-4 rounded-lg">
        <p>✅ 이 텍스트가 보인다면 컴포넌트가 정상적으로 렌더링되고 있습니다!</p>
        <p>🔍 콘솔에서 로그를 확인해보세요.</p>
      </div>
    </div>
  );
}
