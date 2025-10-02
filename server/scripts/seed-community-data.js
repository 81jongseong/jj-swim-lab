/**
 * 커뮤니티 샘플 데이터 생성 스크립트
 */

const mongoose = require('mongoose');
require('dotenv').config();

const CommunityPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: {
    name: { type: String, required: true },
    userId: { type: String, required: true }
  },
  category: { 
    type: String, 
    enum: ['tip', 'question', 'review', 'meetup', 'event', 'general'],
    default: 'general'
  },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  isBlinded: { type: Boolean, default: false },
  warnings: { type: Number, default: 0 },
  reportCount: { type: Number, default: 0 },
  meetupDetails: {
    location: String,
    date: String,
    time: String,
    strokeType: String,
    distance: String,
    pace: String,
    maxParticipants: Number,
    currentParticipants: { type: Number, default: 0 },
    cost: Number,
    level: String,
    participants: [{ userId: String, userName: String, joinedAt: Date }]
  }
}, { timestamps: true });

const CommunityPost = mongoose.models.CommunityPost || mongoose.model('CommunityPost', CommunityPostSchema);

const samplePosts = [
  {
    title: '💡 자유형 호흡법 완전 정복 가이드',
    content: '자유형 호흡법을 마스터하는 단계별 가이드입니다. 초보자도 쉽게 따라할 수 있어요!\n\n1️⃣ 기본 자세: 머리는 물속에, 시선은 바닥\n2️⃣ 호흡 타이밍: 팔이 물에서 나올 때 고개 돌리기\n3️⃣ 연습 방법: 킥보드로 호흡 연습\n\n이 방법으로 연습하면 2주 안에 호흡법을 마스터할 수 있습니다!',
    author: { name: '김강사', userId: 'instructor_01' },
    category: 'tip',
    likes: 89,
    comments: 24
  },
  {
    title: '⭐ JJ Swim Lab 3개월 수강 완전 후기',
    content: 'JJ Swim Lab에서 3개월 동안 수업을 듣고 정말 많이 늘었어요! AI 자세 분석이 특히 도움이 됐습니다.\n\n✅ 실력 향상: 자유형 25m → 1000m 연속 가능\n✅ 자세 점수: 60점 → 85점\n✅ 호흡법 완전 마스터\n\n강력 추천합니다! 🏊‍♀️',
    author: { name: '이학생', userId: 'student_01' },
    category: 'review',
    likes: 42,
    comments: 18
  },
  {
    title: '❓ 접영 킥 동작이 어려워요',
    content: '접영 킥을 연습하고 있는데 물살이 잘 안 생겨요. 어떤 점을 주의해야 할까요?\n\n현재 주 3회 연습하고 있고, 다른 영법은 어느 정도 할 수 있습니다.\n\n강사님들이나 고수분들의 조언 부탁드립니다!',
    author: { name: '정초보', userId: 'beginner_02' },
    category: 'question',
    likes: 12,
    comments: 28
  },
  {
    title: '🏆 2025 JJ Swim Lab 챔피언십 참가자 모집',
    content: '연례 수영 대회를 개최합니다!\n\n📅 일시: 2025년 10월 15일 오전 9시\n📍 장소: JJ Swim Lab 메인 센터\n🏊‍♂️ 종목: 자유형, 배영, 평영, 접영\n💰 참가비: 무료\n🎁 시상: 종목별 메달 및 상품\n\n많은 참여 부탁드립니다!',
    author: { name: '박관리자', userId: 'admin_01' },
    category: 'event',
    likes: 67,
    comments: 35
  },
  {
    title: '⚡ 오늘 저녁 번개 수영 모임 (잠실)',
    content: '오늘 저녁 7시에 잠실 수영장에서 자유형 연습하실 분 모집합니다!\n\n편하게 참가 신청해주세요. 초보자도 환영합니다!',
    author: { name: '최수영', userId: 'swimmer_01' },
    category: 'meetup',
    likes: 23,
    comments: 8,
    meetupDetails: {
      location: '잠실 수영장 3층',
      date: new Date().toISOString().split('T')[0],
      time: '19:00-20:30',
      strokeType: '자유형',
      distance: '1000m',
      pace: '100m당 2분 30초',
      maxParticipants: 6,
      currentParticipants: 3,
      cost: 8000,
      level: '초급-중급',
      participants: [
        { userId: 'swimmer_01', userName: '최수영', joinedAt: new Date() },
        { userId: 'student_02', userName: '강수영', joinedAt: new Date() },
        { userId: 'student_03', userName: '박헤엄', joinedAt: new Date() }
      ]
    }
  },
  {
    title: '💬 수영 다이어트 2개월 후기',
    content: '수영으로 다이어트 시작한지 2개월 됐어요!\n\n체중: 75kg → 68kg (-7kg)\n체지방: 28% → 23% (-5%)\n\n주 5일, 하루 1시간씩 수영했습니다. 식단 조절도 병행했고요.\n\n수영이 정말 전신 운동이라 효과가 좋네요!',
    author: { name: '다이어터', userId: 'student_04' },
    category: 'general',
    likes: 34,
    comments: 15
  },
  {
    title: '💡 배영 턴 동작 완벽 가이드',
    content: '배영 턴을 마스터하는 방법을 공유합니다!\n\n1. 깃발 카운트: 깃발 지나면 스트로크 5회\n2. 회전: 마지막 스트로크로 몸 회전\n3. 손 터치: 벽을 손으로 터치\n4. 턴: 무릎을 가슴으로 당기며 회전\n5. 킥: 강하게 벽 차고 나가기\n\n연습하면 1-2주 안에 마스터 가능!',
    author: { name: '배영킹', userId: 'instructor_02' },
    category: 'tip',
    likes: 56,
    comments: 19
  },
  {
    title: '❓ 수영 장비 추천 부탁드려요',
    content: '수영 시작한지 1개월 됐는데 장비를 사려고 합니다.\n\n수경, 수모, 킥보드 추천 부탁드립니다!\n\n예산은 10만원 정도 생각하고 있어요.',
    author: { name: '신입수영러', userId: 'student_05' },
    category: 'question',
    likes: 8,
    comments: 12
  },
  {
    title: '⚡ 이번 주말 한강 오픈워터 수영 (뚝섬)',
    content: '날씨 좋을 때 한강에서 오픈워터 수영 하실 분!\n\n안전요원 동행하고, 구명조끼 필수입니다.',
    author: { name: '한강러', userId: 'swimmer_02' },
    category: 'meetup',
    likes: 15,
    comments: 6,
    meetupDetails: {
      location: '뚝섬 한강공원 수영장',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '10:00-12:00',
      strokeType: '자유형',
      distance: '2000m',
      pace: '자유 페이스',
      maxParticipants: 10,
      currentParticipants: 5,
      cost: 15000,
      level: '중급 이상',
      participants: [
        { userId: 'swimmer_02', userName: '한강러', joinedAt: new Date() },
        { userId: 'student_06', userName: '오픈워터', joinedAt: new Date() },
        { userId: 'instructor_03', userName: '안전요원', joinedAt: new Date() },
        { userId: 'student_07', userName: '수영매니아', joinedAt: new Date() },
        { userId: 'student_08', userName: '한강사랑', joinedAt: new Date() }
      ]
    }
  },
  {
    title: '💡 평영 발차기 교정 팁',
    content: '평영 발차기가 힘들다면 이것만 기억하세요!\n\n1. 무릎은 어깨 너비\n2. 발목 꺾기 (flex)\n3. 바깥쪽으로 차기\n4. 발바닥으로 물 밀기\n5. 마지막에 발목 펴기\n\n거울 보면서 육상 연습도 도움됩니다!',
    author: { name: '평영마스터', userId: 'instructor_04' },
    category: 'tip',
    likes: 72,
    comments: 21
  }
];

async function seedCommunityData() {
  try {
    // MongoDB 연결 (로컬 강제)
    const mongoUri = 'mongodb://127.0.0.1:27017/jj-swim-lab';
    console.log('🔗 MongoDB URI: Local');
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB 연결 성공');

    // 기존 데이터 삭제 (선택적)
    const existingCount = await CommunityPost.countDocuments();
    console.log(`📊 기존 게시글: ${existingCount}개`);

    if (existingCount > 0) {
      const answer = 'yes'; // 자동으로 yes
      if (answer === 'yes') {
        await CommunityPost.deleteMany({});
        console.log('🗑️ 기존 게시글 삭제 완료');
      }
    }

    // 샘플 데이터 삽입
    const inserted = await CommunityPost.insertMany(samplePosts);
    console.log(`✅ ${inserted.length}개의 샘플 게시글 생성 완료`);

    // 카테고리별 통계
    const categories = ['tip', 'question', 'review', 'meetup', 'event', 'general'];
    console.log('\n📊 카테고리별 게시글 수:');
    for (const category of categories) {
      const count = await CommunityPost.countDocuments({ category });
      console.log(`  ${category}: ${count}개`);
    }

    console.log('\n✅ 커뮤니티 샘플 데이터 생성 완료!');
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 MongoDB 연결 종료');
  }
}

seedCommunityData();

