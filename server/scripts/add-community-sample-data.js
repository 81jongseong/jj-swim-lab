/**
 * 🔥 JJ Swim Lab - 커뮤니티 샘플 데이터 추가 스크립트
 * 
 * 📋 **스크립트 목적**
 * - 번개 모임, 후기, 이벤트 등 고급 커뮤니티 기능 샘플 데이터 생성
 * - 실제 데이터베이스에 완전한 커뮤니티 데이터 구축
 * - 사용자 요구사항에 맞는 풍부한 커뮤니티 환경 제공
 * 
 * 📅 **개발 히스토리**
 * - 2025-09-18: 번개 모임 및 고급 커뮤니티 기능 샘플 데이터 생성
 */

const mongoose = require('mongoose');
require('dotenv').config();

// 모델 import
const { CommunityPost } = require('../dist/models/CommunityPost');
const { Event } = require('../dist/models/Event');
const { User } = require('../dist/models/User');

async function addCommunitySampleData() {
  try {
    console.log('🔗 데이터베이스 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 기존 사용자 확인
    const users = await User.find({});
    if (users.length === 0) {
      console.log('❌ 사용자가 없습니다. 먼저 사용자를 생성해주세요.');
      return;
    }

    console.log(`📊 발견된 사용자: ${users.length}명`);

    // 커뮤니티 게시글 샘플 데이터
    const samplePosts = [
      {
        author: users[0]._id,
        title: '🔥 [번개모임] 오늘 저녁 7시 잠실 수영장 자유형 연습',
        content: '안녕하세요! 오늘 저녁 7시에 잠실 수영장에서 자유형 연습하실 분 모집합니다. 초급-중급 레벨 환영! 레인 대여비는 n빵으로 해요 💪\n\n📍 장소: 잠실 수영장 3층\n⏰ 시간: 오늘 19:00-20:30\n💰 비용: 1인당 8,000원 (레인 대여비 분할)\n🏊‍♂️ 레벨: 초급-중급\n\n참가 신청은 댓글로 해주세요!',
        tags: ['번개모임', '자유형', '잠실', '초급', '중급'],
        likes: 25,
        commentsCount: 15
      },
      {
        author: users[1]._id,
        title: '⭐ [후기] JJ Swim Lab 3개월 수강 완전 후기',
        content: 'JJ Swim Lab에서 3개월 동안 수업을 듣고 정말 많이 늘었어요! 특히 AI 자세 분석이 도움이 많이 됐습니다.\n\n✅ 좋았던 점:\n- AI 실시간 자세 분석\n- 개인화된 운동 계획\n- 친절한 강사진\n- 체계적인 커리큘럼\n\n📊 실력 향상:\n- 자유형 25m → 1000m 연속 가능\n- 자세 점수 60점 → 85점\n- 호흡법 완전 마스터\n\n강력 추천합니다! 🏊‍♀️',
        tags: ['후기', 'AI분석', '자유형', '실력향상'],
        likes: 42,
        commentsCount: 18
      },
      {
        author: users[2]._id,
        title: '🏆 [대회] 2025 JJ Swim Lab 챔피언십 참가자 모집',
        content: '연례 수영 대회를 개최합니다!\n\n🏆 대회 정보:\n- 일시: 2025년 10월 15일 (토) 오전 9시\n- 장소: JJ Swim Lab 메인 센터\n- 종목: 자유형, 배영, 평영, 접영 (50m, 100m)\n- 참가비: 무료\n\n🎁 시상:\n- 종목별 1-3위 메달 및 상품\n- 참가자 전원 기념품 증정\n\n많은 참여 부탁드립니다!',
        tags: ['대회', '챔피언십', '무료', '메달'],
        likes: 67,
        commentsCount: 35
      },
      {
        author: users[0]._id,
        title: '💡 자유형 호흡법 완전 정복 가이드',
        content: '자유형 호흡법을 마스터하는 단계별 가이드입니다!\n\n1️⃣ 기본 자세:\n- 머리는 물속에, 시선은 바닥\n- 목은 자연스럽게 릴랙스\n\n2️⃣ 호흡 타이밍:\n- 팔이 물에서 나올 때 고개 돌리기\n- 짧고 빠르게 들이마시기\n\n3️⃣ 연습 방법:\n- 킥보드로 호흡 연습\n- 한쪽 팔만 사용해서 연습\n\n초보자도 쉽게 따라할 수 있어요!',
        tags: ['가이드', '자유형', '호흡법', '초보자'],
        likes: 89,
        commentsCount: 24
      },
      {
        author: users[1]._id,
        title: '👥 [소셜] 수영 동호회 정기 모임 안내',
        content: '매주 토요일 오전 수영 동호회 모임을 가져요!\n\n📅 정기 모임:\n- 시간: 매주 토요일 오전 8:00-10:00\n- 장소: 강남 수영장\n- 레벨: 중급 이상\n- 회비: 월 50,000원\n\n🤝 활동:\n- 함께 수영 연습\n- 기술 공유 및 피드백\n- 월 1회 친목 모임\n- 분기별 소규모 대회\n\n신규 회원 대환영! 🤗',
        tags: ['동호회', '정기모임', '토요일', '강남'],
        likes: 34,
        commentsCount: 19
      }
    ];

    // 기존 게시글 삭제 후 새로 추가
    await CommunityPost.deleteMany({});
    const createdPosts = await CommunityPost.insertMany(samplePosts);
    console.log(`✅ 커뮤니티 게시글 ${createdPosts.length}개 생성 완료`);

    // 번개 모임 이벤트 샘플 데이터
    const sampleEvents = [
      {
        title: '🔥 오늘 저녁 번개 수영 모임',
        description: '잠실 수영장에서 자유형 연습 모임입니다.',
        type: 'meetup',
        category: '번개모임',
        organizer: users[0]._id,
        dateTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3시간 후
        duration: 90,
        location: {
          address: '잠실 수영장 3층',
          poolType: 'indoor'
        },
        maxParticipants: 8,
        skillLevel: 'mixed',
        cost: 8000,
        costType: 'shared',
        tags: ['번개모임', '자유형', '잠실'],
        status: 'published'
      },
      {
        title: '🏆 월간 수영 대회',
        description: 'JJ Swim Lab 월간 수영 대회입니다.',
        type: 'competition',
        category: '대회',
        organizer: users[2]._id,
        dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
        duration: 240,
        location: {
          address: 'JJ Swim Lab 메인 센터',
          poolType: 'indoor'
        },
        maxParticipants: 50,
        skillLevel: 'mixed',
        cost: 0,
        costType: 'free',
        tags: ['대회', '월간', '무료'],
        status: 'published'
      }
    ];

    // 기존 이벤트 삭제 후 새로 추가
    await Event.deleteMany({});
    const createdEvents = await Event.insertMany(sampleEvents);
    console.log(`✅ 이벤트 ${createdEvents.length}개 생성 완료`);

    console.log('🎉 커뮤니티 샘플 데이터 추가 완료!');

  } catch (error) {
    console.error('❌ 데이터 생성 실패:', error.message);
  } finally {
    console.log('🔌 데이터베이스 연결 종료');
    await mongoose.disconnect();
  }
}

addCommunitySampleData();
