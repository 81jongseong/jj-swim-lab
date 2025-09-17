/**
 * @file 빠른 샘플 데이터 생성 스크립트
 * @description MongoDB에 직접 샘플 데이터 삽입
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

const mongoose = require('mongoose');

// MongoDB 연결
async function connectDB() {
  try {
    const MONGODB_URI = 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');
    
    // 모델 스키마 정의
    const youtubeVideoSchema = new mongoose.Schema({
      title: { type: String, required: true },
      description: String,
      videoId: { type: String, required: true },
      category: String,
      level: String,
      duration: Number,
      tags: [String],
      isActive: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    const notificationSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, required: true },
      type: { type: String, required: true },
      title: { type: String, required: true },
      message: String,
      data: mongoose.Schema.Types.Mixed,
      priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
      isRead: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    // 모델 등록
    mongoose.model('YouTubeVideo', youtubeVideoSchema);
    mongoose.model('Notification', notificationSchema);
    
    console.log('✅ 모델 스키마 등록 완료');
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error);
    process.exit(1);
  }
}

// 샘플 유튜브 비디오 데이터 생성
async function createSampleVideos() {
  console.log('🎥 샘플 유튜브 비디오 데이터 생성...');
  
  const sampleVideos = [
    {
      title: '자유형 기초 강습',
      description: '자유형의 기본 동작을 단계별로 설명하는 영상',
      videoId: 'dQw4w9WgXcQ',
      category: '자유형',
      level: '초급',
      duration: 300,
      tags: ['자유형', '기초', '수영'],
      isActive: true
    },
    {
      title: '배영 기초 강습',
      description: '배영의 기본 동작을 단계별로 설명하는 영상',
      videoId: 'dQw4w9WgXcQ',
      category: '배영',
      level: '초급',
      duration: 350,
      tags: ['배영', '기초', '수영'],
      isActive: true
    },
    {
      title: '평영 기초 강습',
      description: '평영의 기본 동작을 단계별로 설명하는 영상',
      videoId: 'dQw4w9WgXcQ',
      category: '평영',
      level: '중급',
      duration: 400,
      tags: ['평영', '기초', '수영'],
      isActive: true
    }
  ];

  try {
    const YouTubeVideo = mongoose.model('YouTubeVideo');
    
    for (const videoData of sampleVideos) {
      const existingVideo = await YouTubeVideo.findOne({ title: videoData.title });
      if (existingVideo) {
        console.log(`⚠️ ${videoData.title} 이미 존재함`);
        continue;
      }

      const video = new YouTubeVideo(videoData);
      await video.save();
      console.log(`✅ ${videoData.title} 생성 완료`);
    }
  } catch (error) {
    console.error('❌ 유튜브 비디오 생성 오류:', error);
  }
}

// 샘플 알림 데이터 생성
async function createSampleNotifications() {
  console.log('🔔 샘플 알림 데이터 생성...');
  
  const sampleNotifications = [
    {
      userId: new mongoose.Types.ObjectId(),
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
      userId: new mongoose.Types.ObjectId(),
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

  try {
    const Notification = mongoose.model('Notification');
    
    for (const notificationData of sampleNotifications) {
      const notification = new Notification(notificationData);
      await notification.save();
      console.log(`✅ ${notificationData.title} 생성 완료`);
    }
  } catch (error) {
    console.error('❌ 알림 생성 오류:', error);
  }
}

// 메인 실행 함수
async function createSampleData() {
  console.log('🚀 샘플 데이터 생성 시작\n');
  
  await connectDB();
  
  await createSampleVideos();
  console.log('');
  await createSampleNotifications();
  
  console.log('\n✅ 샘플 데이터 생성 완료!');
  
  // 데이터 개수 확인
  const YouTubeVideo = mongoose.model('YouTubeVideo');
  const Notification = mongoose.model('Notification');
  
  const videoCount = await YouTubeVideo.countDocuments();
  const notificationCount = await Notification.countDocuments();
  
  console.log(`\n📊 생성된 데이터:`);
  console.log(`   - 유튜브 비디오: ${videoCount}개`);
  console.log(`   - 알림: ${notificationCount}개`);
  
  await mongoose.disconnect();
  console.log('🔌 MongoDB 연결 종료');
}

// 스크립트 실행
createSampleData().catch(console.error);
