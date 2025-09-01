const mongoose = require('mongoose');
require('dotenv').config();

// 모델 import
const { ChecklistTemplate } = require('../dist/models/ChecklistTemplate');

// 체크리스트 템플릿 데이터
const checklistTemplates = [
  {
    name: '기초 수영 체크리스트',
    description: '처음 수영을 배우는 초보자를 위한 기본 체크리스트',
    creatorType: 'center',
    creatorId: new mongoose.Types.ObjectId('000000000000000000000001'),
    items: [
      {
        stepName: '수영복 착용',
        description: '적절한 수영복을 착용했는지 확인',
        difficulty: '기초',
        stepOrder: 1,
        category: '준비',
        estimatedTime: 5,
        teachingMethodId: new mongoose.Types.ObjectId('000000000000000000000001')
      },
      {
        name: '수영모자 착용',
        description: '수영모자를 올바르게 착용했는지 확인',
        difficulty: '기초',
        stepOrder: '2',
        category: '준비',
        estimatedTime: 3
      },
      {
        name: '따뜻한 물로 몸 풀기',
        description: '따뜻한 샤워로 몸을 풀어줍니다',
        difficulty: '기초',
        stepOrder: '3',
        category: '준비',
        estimatedTime: 10
      },
      {
        name: '기본 스트레칭',
        description: '수영에 필요한 기본 스트레칭을 수행합니다',
        difficulty: '기초',
        stepOrder: '4',
        category: '준비',
        estimatedTime: 15
      },
      {
        name: '수영장 입수',
        description: '수영장에 천천히 입수합니다',
        difficulty: '기초',
        stepOrder: '5',
        category: '입수',
        estimatedTime: 5
      },
      {
        name: '물에 익숙해지기',
        description: '물의 온도와 느낌에 익숙해집니다',
        difficulty: '기초',
        stepOrder: '6',
        category: '적응',
        estimatedTime: 10
      },
      {
        name: '기본 호흡 연습',
        description: '물속에서 코로 숨을 내쉬는 연습',
        difficulty: '기초',
        stepOrder: '7',
        category: '호흡',
        estimatedTime: 15
      },
      {
        name: '얼굴 담그기 연습',
        description: '물속에 얼굴을 담그는 연습',
        difficulty: '기초',
        stepOrder: '8',
        category: '적응',
        estimatedTime: 10
      },
      {
        name: '기본 발차기 연습',
        description: '벽을 잡고 기본 발차기 연습',
        difficulty: '기초',
        stepOrder: '9',
        category: '기술',
        estimatedTime: 20
      },
      {
        name: '기본 팔동작 연습',
        description: '벽을 잡고 기본 팔동작 연습',
        difficulty: '기초',
        stepOrder: '10',
        category: '기술',
        estimatedTime: 20
      }
    ],
    isActive: true
  },
  {
    name: '자유형 체크리스트',
    description: '자유형 수영을 위한 체크리스트',
    creatorType: 'center',
    creatorId: new mongoose.Types.ObjectId('000000000000000000000001'),
    items: [
      {
        name: '자세 확인',
        description: '바른 자세로 수평을 유지합니다',
        difficulty: '초급',
        stepOrder: '1',
        category: '자세',
        estimatedTime: 10
      },
      {
        name: '호흡 타이밍',
        description: '올바른 호흡 타이밍을 연습합니다',
        difficulty: '초급',
        stepOrder: '2',
        category: '호흡',
        estimatedTime: 15
      },
      {
        name: '팔 동작',
        description: '정확한 팔 동작을 연습합니다',
        difficulty: '초급',
        stepOrder: '3',
        category: '기술',
        estimatedTime: 20
      },
      {
        name: '다리 동작',
        description: '효율적인 다리 동작을 연습합니다',
        difficulty: '초급',
        stepOrder: '4',
        category: '기술',
        estimatedTime: 20
      },
      {
        name: '전체 동작 조화',
        description: '팔과 다리 동작을 조화롭게 연습합니다',
        difficulty: '중급',
        stepOrder: '5',
        category: '조화',
        estimatedTime: 30
      }
    ],
    isActive: true
  }
];

async function seedChecklistTemplates() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');
    
    // 기존 템플릿 데이터 삭제
    console.log('🗑️ 기존 체크리스트 템플릿 삭제 중...');
    await ChecklistTemplate.deleteMany({
      creatorId: { $in: [new mongoose.Types.ObjectId('000000000000000000000001')] }
    });
    console.log('✅ 기존 템플릿 삭제 완료');
    
    // 새 템플릿 데이터 생성
    console.log('📋 체크리스트 템플릿 생성 중...');
    const createdTemplates = await ChecklistTemplate.insertMany(checklistTemplates);
    console.log(`✅ ${createdTemplates.length}개의 템플릿 생성 완료`);
    
    // 생성된 템플릿 정보 출력
    createdTemplates.forEach(template => {
      console.log(`\n📋 ${template.name}`);
      console.log(`   - 설명: ${template.description}`);
      console.log(`   - 아이템 수: ${template.items.length}개`);
      console.log(`   - 난이도: ${template.items.map(item => item.difficulty).join(', ')}`);
    });
    
    console.log('\n🎉 체크리스트 템플릿 시드 데이터 생성 완료!');
    
  } catch (error) {
    console.error('❌ 템플릿 시드 데이터 생성 실패:', error.message);
  } finally {
    // MongoDB 연결 해제
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 해제');
  }
}

// 스크립트 실행
seedChecklistTemplates();
