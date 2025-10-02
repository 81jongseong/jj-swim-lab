/**
 * @file 강습법 레벨 변경 유틸리티
 * @description 모든 강습법의 레벨을 한국어로 통일
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

// 레벨 매핑 정의
const LEVEL_MAPPING = {
  'beginner': '초급',
  'intermediate': '중급', 
  'advanced': '상급',
  'expert': '상급',
  '고급': '상급',
  '전문가': '상급'
};

// 모든 강습법의 레벨을 한국어로 변경
export async function updateAllLevels() {
  try {
    console.log('🔄 강습법 레벨 변경 시작...');
    
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    // 모든 강습법 가져오기
    const response = await fetch('/api/teaching-methods', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('강습법 목록을 가져오는데 실패했습니다.');
    }

    const data = await response.json();
    const methods = data.data;

    console.log(`📊 총 ${methods.length}개의 강습법 발견`);

    let updatedCount = 0;
    const results = [];

    // 각 강습법의 레벨 확인 및 변경
    for (const method of methods) {
      const currentLevel = method.level;
      const newLevel = LEVEL_MAPPING[currentLevel];

      if (newLevel && newLevel !== currentLevel) {
        try {
          const updateResponse = await fetch(`/api/teaching-methods/${method._id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: method.name,
              description: method.description,
              category: method.category,
              level: newLevel,
              steps: method.steps || [],
              tips: method.tips || [],
              checklist: method.checklist || []
            }),
          });

          if (updateResponse.ok) {
            console.log(`✅ "${method.name}": "${currentLevel}" → "${newLevel}"`);
            updatedCount++;
            results.push({
              name: method.name,
              from: currentLevel,
              to: newLevel
            });
          } else {
            console.error(`❌ "${method.name}" 업데이트 실패`);
          }
        } catch (error) {
          console.error(`❌ "${method.name}" 업데이트 오류:`, error);
        }
      } else {
        console.log(`ℹ️ "${method.name}": 레벨 변경 불필요 (${currentLevel})`);
      }
    }

    console.log(`🎉 레벨 변경 완료! ${updatedCount}개 업데이트됨`);
    
    return {
      success: true,
      updatedCount,
      results
    };

  } catch (error) {
    console.error('❌ 레벨 변경 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 브라우저 콘솔에서 사용할 수 있도록 전역 함수로 등록
if (typeof window !== 'undefined') {
  (window as any).updateAllLevels = updateAllLevels;
}

