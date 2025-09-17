/**
 * @file 서버 샘플 데이터 생성 스크립트
 * @description 서버에서 직접 샘플 데이터 생성
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

const mongoose = require('mongoose');
require('dotenv').config();

// 모델 import
const TeachingMethod = require('./dist/models/TeachingMethod').default;
const YouTubeVideo = require('./dist/models/YouTubeVideo').default;
const Notification = require('./dist/models/Notification').default;

// MongoDB 연결
async function connectDB() {
  try {
    const MONGODB_URI = 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error);
    process.exit(1);
  }
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

  for (const methodData of sampleMethods) {
    try {
      const existingMethod = await TeachingMethod.findOne({ name: methodData.name });
      if (existingMethod) {
        console.log(`⚠️ ${methodData.name} 이미 존재함`);
        continue;
      }

      const method = new TeachingMethod(methodData);
      await method.save();
      console.log(`✅ ${methodData.name} 생성 완료`);
    } catch (error) {
      console.log(`❌ ${methodData.name} 생성 오류:`, error.message);
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

  for (const videoData of sampleVideos) {
    try {
      const existingVideo = await YouTubeVideo.findOne({ title: videoData.title });
      if (existingVideo) {
        console.log(`⚠️ ${videoData.title} 이미 존재함`);
        continue;
      }

      const video = new YouTubeVideo(videoData);
      await video.save();
      console.log(`✅ ${videoData.title} 생성 완료`);
    } catch (error) {
      console.log(`❌ ${videoData.title} 생성 오류:`, error.message);
    }
  }
}

// 샘플 알림 데이터 생성
async function createSampleNotifications() {
  console.log('🔔 샘플 알림 데이터 생성...');
  
  // 먼저 사용자 ID를 가져와야 함 (실제로는 사용자 생성 후)
  const sampleNotifications = [
    {
      userId: new mongoose.Types.ObjectId(), // 임시 사용자 ID
      type: 'learning_progress',
      title: '🎉 강습법 완료!',
      message: '자유형 기초 강습법을 완료했습니다.',
      data: {
        methodName: '자유형 기초',
        progressPercentage: 100,
        completedSteps: 5,
        totalSteps: 5
      },
      priority: 'high',
      isRead: false
    },
    {
      userId: new mongoose.Types.ObjectId(), // 임시 사용자 ID
      type: 'recommendation',
      title: '💡 새로운 추천!',
      message: '배영 기초 강습법을 추천드립니다.',
      data: {
        recommendationType: 'new_recommendation',
        methodName: '배영 기초',
        description: '자유형을 마스터한 후 배영을 배워보세요.'
      },
      priority: 'medium',
      isRead: false
    }
  ];

  for (const notificationData of sampleNotifications) {
    try {
      const notification = new Notification(notificationData);
      await notification.save();
      console.log(`✅ ${notificationData.title} 생성 완료`);
    } catch (error) {
      console.log(`❌ ${notificationData.title} 생성 오류:`, error.message);
    }
  }
}

// 메인 실행 함수
async function createSampleData() {
  console.log('🚀 샘플 데이터 생성 시작\n');
  
  await connectDB();
  
  await createSampleTeachingMethods();
  console.log('');
  await createSampleYouTubeVideos();
  console.log('');
  await createSampleNotifications();
  
  console.log('\n✅ 샘플 데이터 생성 완료!');
  
  // 데이터 개수 확인
  const methodCount = await TeachingMethod.countDocuments();
  const videoCount = await YouTubeVideo.countDocuments();
  const notificationCount = await Notification.countDocuments();
  
  console.log(`\n📊 생성된 데이터:`);
  console.log(`   - 강습법: ${methodCount}개`);
  console.log(`   - 유튜브 비디오: ${videoCount}개`);
  console.log(`   - 알림: ${notificationCount}개`);
  
  await mongoose.disconnect();
  console.log('🔌 MongoDB 연결 종료');
}

// 스크립트 실행
createSampleData().catch(console.error);
