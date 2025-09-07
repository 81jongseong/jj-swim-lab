'use client';

import React from 'react';
import GLBAnimationTest from '@/components/GLBAnimationTest';

export default function AnimationTestPage() {
  // 실제 GLB 파일 경로로 변경하세요
  const glbPath = '/animated_model.glb';

  return (
    <div>
      <GLBAnimationTest glbPath={glbPath} />
    </div>
  );
}

