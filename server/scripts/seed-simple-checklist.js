const mongoose = require('mongoose');
require('dotenv').config();

// 모델 import
const { Checklist } = require('../dist/models/Checklist');

// 간단한 체크리스트 데이터
const sampleChecklists = [
  {
    classId: 'class1',
    centerId: 'center001',
    instructorId: 'instructor001',
    level: 'beginner',
    isPrivateLesson: false,
    items: [
      {
        name: '수영복 착용',
        description: '적절한 수영복을 착용했는지 확인',
        difficulty: '기초',
        stepOrder: '1',
        category: '준비',
        isCompleted: false,
        isHidden: false
      },
      {
        name: '수영모자 착용',
        description: '수영모자를 올바르게 착용했는지 확인',
        difficulty: '기초',
        stepOrder: '2',
        category: '준비',
        isCompleted: false,
        isHidden: false
      },
      {
        name: '따뜻한 물로 몸 풀기',
        description: '따뜻한 샤워로 몸을 풀어줍니다',
        difficulty: '기초',
        stepOrder: '3',
        category: '준비',
        isCompleted: false,
        isHidden: false
      },
      {
        name: '기본 스트레칭',
        description: '수영에 필요한 기본 스트레칭을 수행합니다',
        difficulty: '기초',
        stepOrder: '4',
        category: '준비',
        isCompleted: false,
        isHidden: false
      },
      {
        name: '수영장 입수',
        description: '수영장에 천천히 입수합니다',
        difficulty: '기초',
        stepOrder: '5',
        category: '입수',
        isCompleted: false,
        isHidden: false
      }
    ],
    hiddenItems: [],
    customItems: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    classId: 'class2',
    centerId: 'center001',
    instructorId: 'instructor002',
    level: 'intermediate',
    isPrivateLesson: false,
    items: [
      {
        name: '자세 확인',
        description: '바른 자세로 수평을 유지합니다',
        difficulty: '초급',
        stepOrder: '1',
        category: '자세',
        isCompleted: false,
        isHidden: false
      },
      {
        name: '호흡 타이밍',
        description: '올바른 호흡 타이밍을 연습합니다',
        difficulty: '초급',
        stepOrder: '2',
        category: '호흡',
        isCompleted: false,
        isHidden: false
      },
      {
        name: '팔 동작',
        description: '정확한 팔 동작을 연습합니다',
        difficulty: '초급',
        stepOrder: '3',
        category: '기술',
        isCompleted: false,
        isHidden: false
      }
    ],
    hiddenItems: [],
    customItems: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    classId: 'class3',
    centerId: 'center001',
    instructorId: 'instructor001',
    level: 'personal',
    isPrivateLesson: true,
    items: [
      {
        name: '개인 맞춤 준비운동',
        description: '개인별 특성에 맞는 준비운동을 수행합니다',
        difficulty: '개인',
        stepOrder: '1',
        category: '준비',
        isCompleted: false,
        isHidden: false
      },
      {
        name: '개인별 호흡 연습',
        description: '개인별 호흡 패턴에 맞는 연습을 수행합니다',
        difficulty: '개인',
        stepOrder: '2',
        category: '호흡',
        isCompleted: false,
        isHidden: false
      },
      {
        name: '개인별 기술 연습',
        description: '개인별 수준에 맞는 기술을 연습합니다',
        difficulty: '개인',
        stepOrder: '3',
        category: '기술',
        isCompleted: false,
        isHidden: false
      },
      {
        name: '개인별 보조 연습',
        description: '개인별 필요에 따른 보조 연습을 수행합니다',
        difficulty: '개인',
        stepOrder: '4',
        category: '보조',
        isCompleted: false,
        isHidden: false
      }
    ],
    hiddenItems: [],
    customItems: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedSimpleChecklists() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');
    
    // 기존 샘플 체크리스트 삭제
    console.log('🗑️ 기존 체크리스트 삭제 중...');
    await Checklist.deleteMany({
      classId: { $in: ['class1', 'class2', 'class3'] }
    });
    console.log('✅ 기존 체크리스트 삭제 완료');
    
    // 새 체크리스트 데이터 생성
    console.log('📋 체크리스트 생성 중...');
    const createdChecklists = await Checklist.insertMany(sampleChecklists);
    console.log(`✅ ${createdChecklists.length}개의 체크리스트 생성 완료`);
    
    // 생성된 체크리스트 정보 출력
    createdChecklists.forEach(checklist => {
      console.log(`\n📋 ${checklist.classId} (${checklist.level})`);
      console.log(`   - 강사: ${checklist.instructorId}`);
      console.log(`   - 개인레슨: ${checklist.isPrivateLesson ? '예' : '아니오'}`);
      console.log(`   - 아이템 수: ${checklist.items.length}개`);
    });
    
    console.log('\n🎉 체크리스트 시드 데이터 생성 완료!');
    
  } catch (error) {
    console.error('❌ 체크리스트 시드 데이터 생성 실패:', error.message);
  } finally {
    // MongoDB 연결 해제
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 해제');
  }
}

// 스크립트 실행
seedSimpleChecklists();

