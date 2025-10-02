/**
 * 🏊‍♂️ 수영 영법 초기 데이터 시딩
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function seedSwimmingStyles() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 완료\n');

    const SwimmingStyle = mongoose.model('SwimmingStyle');

    const defaultStyles = [
      {
        name: 'freestyle',
        displayName: '자유형',
        description: '가장 기본적이고 빠른 수영 영법. 팔을 번갈아가며 앞으로 젓고, 발차기는 위아래로 움직입니다.',
        difficulty: 'beginner',
        isActive: true,
        isPublicDemo: true, // 체험 공개
        tags: ['빠름', '초보자 추천', '크롤'],
        cues: ['팔꿈치를 높게', '손은 물을 끌어당기듯', '발차기는 무릎 펴기'],
        cautions: ['어깨 부상 주의', '과도한 회전 금지'],
        poster: '/images/swimming/freestyle.jpg',
        modelUrl: '/models/swimming/freestyle.glb'
      },
      {
        name: 'backstroke',
        displayName: '배영',
        description: '등을 대고 수영하는 영법. 자유형과 유사하지만 뒤로 헤엄칩니다.',
        difficulty: 'intermediate',
        isActive: true,
        isPublicDemo: true,
        tags: ['후진', '자유형 응용'],
        cues: ['고개는 천장을 향해', '팔은 일직선으로', '엉덩이 높이 유지'],
        cautions: ['방향 감각 유지', '벽 충돌 주의'],
        poster: '/images/swimming/backstroke.jpg',
        modelUrl: '/models/swimming/backstroke.glb'
      },
      {
        name: 'breaststroke',
        displayName: '평영',
        description: '가슴을 아래로 하여 팔과 다리를 동시에 움직이는 영법. 가장 느리지만 체력 소모가 적습니다.',
        difficulty: 'intermediate',
        isActive: true,
        isPublicDemo: true,
        tags: ['느림', '체력 절약', '개구리'],
        cues: ['팔 → 호흡 → 발차기 순서', '글라이드 구간 유지'],
        cautions: ['무릎 부상 주의', '타이밍 중요'],
        poster: '/images/swimming/breaststroke.jpg',
        modelUrl: '/models/swimming/breaststroke.glb'
      },
      {
        name: 'butterfly',
        displayName: '접영',
        description: '가장 어렵고 강렬한 영법. 양팔을 동시에 움직이고 돌고래 킥을 사용합니다.',
        difficulty: 'advanced',
        isActive: true,
        isPublicDemo: true,
        tags: ['어려움', '나비', '돌고래 킥'],
        cues: ['팔은 동시에', '돌고래 킥 2번', '몸통 웨이브'],
        cautions: ['어깨 부담 큼', '초보자 비추천'],
        poster: '/images/swimming/butterfly.jpg',
        modelUrl: '/models/swimming/butterfly.glb'
      }
    ];

    console.log('🗑️ 기존 데이터 삭제 중...');
    await SwimmingStyle.deleteMany({});
    console.log('✅ 기존 데이터 삭제 완료\n');

    console.log('📝 새 데이터 삽입 중...');
    const inserted = await SwimmingStyle.insertMany(defaultStyles);
    console.log(`✅ ${inserted.length}개 영법 생성 완료\n`);

    inserted.forEach(style => {
      console.log(`  ✓ ${style.displayName} (${style.difficulty}) - 체험 공개: ${style.isPublicDemo ? '✅' : '❌'}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 시딩 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

seedSwimmingStyles();

