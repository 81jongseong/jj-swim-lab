/**
 * @file 샘플 데이터 생성 스크립트
 * @description 테스트를 위한 샘플 데이터 생성
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

const https = require('https');
const http = require('http');

// HTTP 요청 헬퍼 함수
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// 샘플 강습법 데이터 생성
async function createSampleTeachingMethods() {
  console.log('📚 샘플 강습법 데이터 생성...');
  
  const sampleMethods = [
    {
      name: '자유형 기초',
      category: '자유형',
      level: '초급',
      description: '자유형의 기본 동작을 익히는 강습법',
      steps: [
        { step: 1, title: '물에 적응하기', description: '물에 들어가서 기본적인 호흡 연습' },
        { step: 2, title: '플로터 연습', description: '물에 떠서 균형 잡기' },
        { step: 3, title: '킥 연습', description: '벽을 잡고 다리 차기 연습' },
        { step: 4, title: '스트로크 연습', description: '팔 동작 연습' },
        { step: 5, title: '호흡 연습', description: '옆으로 고개 돌려 호흡하기' }
      ],
      duration: 30,
      difficulty: 1,
      prerequisites: [],
      equipment: ['수영모', '수영복', '고글'],
      safetyNotes: '물에 들어가기 전 충분한 준비운동을 하세요.',
      tips: '천천히 단계별로 연습하세요.'
    },
    {
      name: '배영 기초',
      category: '배영',
      level: '초급',
      description: '배영의 기본 동작을 익히는 강습법',
      steps: [
        { step: 1, title: '물에 누워서 떠있기', description: '물에 등을 대고 떠있기 연습' },
        { step: 2, title: '배영 킥 연습', description: '벽을 잡고 배영 킥 연습' },
        { step: 3, title: '배영 스트로크 연습', description: '팔 동작 연습' },
        { step: 4, title: '호흡 연습', description: '자연스러운 호흡 연습' },
        { step: 5, title: '통합 연습', description: '킥과 스트로크를 함께 연습' }
      ],
      duration: 35,
      difficulty: 2,
      prerequisites: ['자유형 기초'],
      equipment: ['수영모', '수영복', '고글'],
      safetyNotes: '뒤를 보지 못하므로 주변을 확인하세요.',
      tips: '균형을 잡는 것이 중요합니다.'
    },
    {
      name: '평영 기초',
      category: '평영',
      level: '중급',
      description: '평영의 기본 동작을 익히는 강습법',
      steps: [
        { step: 1, title: '기본 자세', description: '평영의 기본 자세 익히기' },
        { step: 2, title: '킥 연습', description: '개구리 킥 연습' },
        { step: 3, title: '스트로크 연습', description: '팔 동작 연습' },
        { step: 4, title: '호흡 연습', description: '머리 들고 호흡하기' },
        { step: 5, title: '통합 연습', description: '킥, 스트로크, 호흡을 함께 연습' }
      ],
      duration: 40,
      difficulty: 3,
      prerequisites: ['자유형 기초', '배영 기초'],
      equipment: ['수영모', '수영복', '고글'],
      safetyNotes: '동작이 복잡하므로 천천히 연습하세요.',
      tips: '동작의 타이밍이 중요합니다.'
    }
  ];

  for (const method of sampleMethods) {
    try {
      const response = await makeRequest('http://localhost:5000/api/teaching-methods', {
        method: 'POST',
        body: method
      });
      
      if (response.status === 201) {
        console.log(`✅ ${method.name} 생성 완료`);
      } else {
        console.log(`⚠️ ${method.name} 생성 실패: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${method.name} 생성 오류:`, error.message);
    }
  }
}

// 샘플 유튜브 비디오 데이터 생성
async function createSampleYouTubeVideos() {
  console.log('🎥 샘플 유튜브 비디오 데이터 생성...');
  
  const sampleVideos = [
    {
      title: '자유형 기초 강습',
      description: '자유형의 기본 동작을 단계별로 설명하는 영상',
      videoId: 'dQw4w9WgXcQ', // 예시 ID
      category: '자유형',
      level: '초급',
      duration: 300,
      tags: ['자유형', '기초', '수영'],
      isActive: true
    },
    {
      title: '배영 기초 강습',
      description: '배영의 기본 동작을 단계별로 설명하는 영상',
      videoId: 'dQw4w9WgXcQ', // 예시 ID
      category: '배영',
      level: '초급',
      duration: 350,
      tags: ['배영', '기초', '수영'],
      isActive: true
    },
    {
      title: '평영 기초 강습',
      description: '평영의 기본 동작을 단계별로 설명하는 영상',
      videoId: 'dQw4w9WgXcQ', // 예시 ID
      category: '평영',
      level: '중급',
      duration: 400,
      tags: ['평영', '기초', '수영'],
      isActive: true
    }
  ];

  for (const video of sampleVideos) {
    try {
      const response = await makeRequest('http://localhost:5000/api/youtube-videos', {
        method: 'POST',
        body: video
      });
      
      if (response.status === 201) {
        console.log(`✅ ${video.title} 생성 완료`);
      } else {
        console.log(`⚠️ ${video.title} 생성 실패: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${video.title} 생성 오류:`, error.message);
    }
  }
}

// 메인 실행 함수
async function createSampleData() {
  console.log('🚀 샘플 데이터 생성 시작\n');
  
  await createSampleTeachingMethods();
  console.log('');
  await createSampleYouTubeVideos();
  
  console.log('\n✅ 샘플 데이터 생성 완료!');
}

// 스크립트 실행
createSampleData().catch(console.error);
