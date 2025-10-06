/**
 * 공지사항 샘플 데이터 생성 스크립트
 * 
 * 실행 방법:
 * cd server
 * node scripts/create-notice-sample-data.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: { 
    type: String, 
    enum: ['general', 'course', 'facility', 'maintenance', 'emergency', 'membership', 'quiz', 'system'],
    default: 'general'
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  targetUserTypes: [String],
  targetCenters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SwimmingCenter' }],
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
  expiresAt: Date,
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    type: String
  }],
  viewCount: { type: Number, default: 0 },
  tags: [String],
  isPinned: { type: Boolean, default: false },
  allowComments: { type: Boolean, default: false }
}, { timestamps: true });

const Notice = mongoose.model('Notice', noticeSchema);

const sampleNotices = [
  {
    title: '🎉 JJ Swim Lab 플랫폼 정식 오픈!',
    content: '안녕하세요, JJ Swim Lab입니다.\n\nAI 기반 수영 교육 플랫폼이 정식으로 오픈되었습니다. 모든 센터와 회원 여러분께 감사드립니다.\n\n주요 기능:\n- AI 영상 분석\n- 실시간 센터 관리\n- 스마트워치 연동\n- 맞춤형 커리큘럼\n\n많은 이용 부탁드립니다.',
    category: 'system',
    isPublished: true,
    priority: 'high',
    targetUserTypes: ['student', 'instructor', 'centerAdmin', 'superAdmin'],
    targetCenters: [],
    publishedAt: new Date('2025-10-01'),
    viewCount: 1250,
    tags: ['오픈', '플랫폼', 'AI'],
    isPinned: true,
    allowComments: true,
    createdAt: new Date('2025-10-01')
  },
  {
    title: '📱 스마트워치 연동 서비스 출시',
    content: '갤럭시 워치, 애플 워치와 연동하여 수영 중 실시간 데이터를 수집할 수 있습니다.\n\n지원 기능:\n- 심박수 모니터링\n- 영법별 스트로크 수\n- 거리 및 속도 측정\n- 칼로리 소모량\n\n앱 설정에서 연동하세요!',
    category: 'system',
    isPublished: true,
    priority: 'medium',
    targetUserTypes: ['student', 'instructor'],
    targetCenters: [],
    publishedAt: new Date('2025-10-05'),
    viewCount: 850,
    tags: ['스마트워치', '기능', '연동'],
    isPinned: false,
    allowComments: true,
    createdAt: new Date('2025-10-05')
  },
  {
    title: '🔧 10월 15일 시스템 점검 안내',
    content: '서비스 품질 향상을 위한 정기 점검을 실시합니다.\n\n일시: 2025년 10월 15일 (화) 02:00 ~ 04:00\n대상: 전체 서비스\n\n점검 시간 동안 일시적으로 서비스 이용이 불가능합니다. 양해 부탁드립니다.',
    category: 'maintenance',
    isPublished: true,
    priority: 'high',
    targetUserTypes: ['student', 'instructor', 'centerAdmin'],
    targetCenters: [],
    publishedAt: new Date('2025-10-10'),
    viewCount: 620,
    tags: ['점검', '시스템'],
    isPinned: true,
    allowComments: false,
    createdAt: new Date('2025-10-10')
  },
  {
    title: '🏊 겨울 시즌 특별 프로모션 안내',
    content: '겨울 시즌을 맞아 특별 프로모션을 진행합니다!\n\n혜택:\n- 신규 등록 시 첫 달 30% 할인\n- 3개월 등록 시 1개월 추가 무료\n- 친구 추천 시 양쪽 모두 10% 할인\n\n기간: 2025년 11월 1일 ~ 12월 31일\n대상: 전국 모든 센터',
    category: 'membership',
    isPublished: true,
    priority: 'medium',
    targetUserTypes: ['student'],
    targetCenters: [],
    publishedAt: new Date('2025-10-12'),
    viewCount: 1450,
    tags: ['프로모션', '할인', '이벤트'],
    isPinned: true,
    allowComments: true,
    createdAt: new Date('2025-10-12')
  },
  {
    title: '📊 AI 영상 분석 기능 업데이트',
    content: 'AI 영상 분석 기능이 대폭 업그레이드되었습니다.\n\n새로운 기능:\n- 영법별 정밀 분석\n- 자세 교정 AI 코칭\n- 개인 맞춤형 피드백\n- 진도 추적 리포트\n\n강사님들께서는 대시보드에서 확인하실 수 있습니다.',
    category: 'course',
    isPublished: true,
    priority: 'medium',
    targetUserTypes: ['instructor', 'centerAdmin'],
    targetCenters: [],
    publishedAt: new Date('2025-10-18'),
    viewCount: 340,
    tags: ['AI', '영상분석', '업데이트'],
    isPinned: false,
    allowComments: true,
    createdAt: new Date('2025-10-18')
  },
  {
    title: '🎓 강사 교육 프로그램 안내 (서울/경기 지역)',
    content: '신규 강사님들을 위한 교육 프로그램을 진행합니다.\n\n대상: 서울/경기 지역 신규 강사\n일시: 2025년 11월 5일 (화) 14:00\n장소: 강남센터\n내용: 플랫폼 사용법, AI 분석 활용, 커리큘럼 작성법\n\n참석 신청은 강사 관리 페이지에서 해주세요.',
    category: 'course',
    isPublished: true,
    priority: 'medium',
    targetUserTypes: ['instructor'],
    targetCenters: [],
    publishedAt: new Date('2025-10-20'),
    viewCount: 180,
    tags: ['교육', '강사', '서울', '경기'],
    isPinned: false,
    allowComments: true,
    createdAt: new Date('2025-10-20')
  },
  {
    title: '⚠️ 개인정보 보호 정책 업데이트',
    content: '개인정보 보호법 개정에 따라 개인정보 처리방침이 업데이트되었습니다.\n\n주요 변경사항:\n- 데이터 보관 기간 명시\n- 제3자 제공 동의 절차 강화\n- 개인정보 열람/삭제 요청 간소화\n\n자세한 내용은 홈페이지의 개인정보 처리방침을 확인해주세요.',
    category: 'system',
    isPublished: true,
    priority: 'high',
    targetUserTypes: ['student', 'instructor', 'centerAdmin'],
    targetCenters: [],
    publishedAt: new Date('2025-10-22'),
    viewCount: 920,
    tags: ['개인정보', '정책'],
    isPinned: true,
    allowComments: false,
    createdAt: new Date('2025-10-22')
  },
  {
    title: '📝 11월 센터 평가 일정 안내',
    content: '각 센터의 정기 평가가 진행됩니다.\n\n일정: 2025년 11월 중\n평가 항목:\n- 회원 만족도\n- 강사 퀄리티\n- 시설 관리 상태\n- 안전 관리 수준\n\n평가 결과는 센터별로 개별 통보됩니다.',
    category: 'general',
    isPublished: false,
    priority: 'low',
    targetUserTypes: ['centerAdmin'],
    targetCenters: [],
    viewCount: 0,
    tags: ['평가', '센터'],
    isPinned: false,
    allowComments: false,
    createdAt: new Date('2025-10-25')
  },
  {
    title: '🎯 프리미엄 플랜 신규 기능 안내',
    content: '프리미엄 플랜 구독 센터에 새로운 기능이 추가됩니다!\n\n신규 기능:\n- 고급 통계 대시보드\n- 맞춤형 마케팅 도구\n- 회원 리텐션 분석\n- 경쟁 센터 벤치마킹\n\n프리미엄 플랜 업그레이드는 센터 관리 페이지에서 가능합니다.',
    category: 'membership',
    isPublished: false,
    priority: 'medium',
    targetUserTypes: ['centerAdmin'],
    targetCenters: [],
    viewCount: 0,
    tags: ['프리미엄', '기능'],
    isPinned: false,
    allowComments: false,
    createdAt: new Date('2025-10-26')
  },
  {
    title: '🏆 우수 센터 시상식 개최 안내',
    content: '2025년 상반기 우수 센터를 선정하여 시상식을 개최합니다.\n\n일시: 2025년 11월 20일 (수) 18:00\n장소: 서울 강남구 삼성동 코엑스 컨벤션홀\n\n시상 부문:\n- 매출 성장상\n- 회원 만족도상\n- 안전 관리상\n- 혁신 센터상\n\n초대장은 개별 발송됩니다.',
    category: 'general',
    isPublished: true,
    priority: 'high',
    targetUserTypes: ['centerAdmin'],
    targetCenters: [],
    publishedAt: new Date('2025-10-28'),
    viewCount: 560,
    tags: ['시상식', '우수센터'],
    isPinned: false,
    allowComments: true,
    createdAt: new Date('2025-10-28')
  }
];

async function createNoticeData() {
  try {
    console.log('🔌 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab');
    console.log('✅ MongoDB 연결 성공');

    // 기존 공지사항 삭제
    console.log('🗑️ 기존 공지사항 삭제 중...');
    await Notice.deleteMany({});
    console.log('✅ 기존 공지사항 삭제 완료');

    // 샘플 데이터 생성
    console.log('📝 샘플 공지사항 생성 중...');
    const created = await Notice.insertMany(sampleNotices);
    console.log(`✅ ${created.length}개의 공지사항이 생성되었습니다.`);

    // 생성된 데이터 요약
    console.log('\n📊 생성된 공지사항 요약:');
    console.log(`- 총 공지사항: ${created.length}개`);
    console.log(`- 발행됨: ${created.filter(n => n.isPublished).length}개`);
    console.log(`- 초안: ${created.filter(n => !n.isPublished).length}개`);
    console.log(`- 시스템: ${created.filter(n => n.category === 'system').length}개`);
    console.log(`- 강습: ${created.filter(n => n.category === 'course').length}개`);
    console.log(`- 점검: ${created.filter(n => n.category === 'maintenance').length}개`);
    console.log(`- 회원: ${created.filter(n => n.category === 'membership').length}개`);
    console.log(`- 일반: ${created.filter(n => n.category === 'general').length}개`);
    console.log(`- 총 조회수: ${created.reduce((sum, n) => sum + n.viewCount, 0)}회`);

    console.log('\n✨ 공지사항 샘플 데이터 생성 완료!');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
  }
}

createNoticeData();

