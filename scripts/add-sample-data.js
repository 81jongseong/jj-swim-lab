/**
 * @file 데이터베이스 예시 데이터 추가 스크립트
 * @description 새로 생성된 페이지들에 대한 예시 데이터를 데이터베이스에 추가합니다.
 * @date 2025-09-14
 * @author JJ Swim Lab
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// MongoDB 연결
async function connectDB() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';
    
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: true,
      autoIndex: false,
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 15000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      w: 'majority',
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000
    });
    
    log('✅ MongoDB 연결 성공', colors.green);
  } catch (error) {
    log(`❌ MongoDB 연결 실패: ${error.message}`, colors.red);
    throw error;
  }
}

// 스키마 정의
const NoticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  isImportant: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  centerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Center' }
});

const PaymentSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  courseName: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, enum: ['completed', 'pending', 'failed', 'refunded'], default: 'completed' },
  paymentDate: { type: Date, default: Date.now },
  transactionId: { type: String, required: true },
  centerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Center' }
});

const ReviewSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  instructorName: { type: String, required: true },
  courseName: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'pending' },
  date: { type: Date, default: Date.now },
  centerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Center' }
});

const ReportSchema = new mongoose.Schema({
  period: { type: String, required: true },
  totalStudents: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  totalClasses: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  newStudents: { type: Number, default: 0 },
  retentionRate: { type: Number, default: 0 },
  centerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Center' },
  createdAt: { type: Date, default: Date.now }
});

// 모델 생성
const Notice = mongoose.model('Notice', NoticeSchema);
const Payment = mongoose.model('Payment', PaymentSchema);
const Review = mongoose.model('Review', ReviewSchema);
const Report = mongoose.model('Report', ReportSchema);

// 예시 데이터 추가 함수
async function addSampleData() {
  try {
    log('📝 예시 데이터 추가 시작', colors.cyan);
    
    // 기존 데이터 삭제 (개발용)
    await Notice.deleteMany({});
    await Payment.deleteMany({});
    await Review.deleteMany({});
    await Report.deleteMany({});
    
    log('🗑️ 기존 예시 데이터 삭제 완료', colors.yellow);
    
    // 공지사항 예시 데이터
    const notices = [
      {
        title: '수영장 이용 안내',
        content: '수영장 이용 시 안전수칙을 준수해 주시기 바랍니다.\n\n1. 수영 전 충분한 준비운동을 해주세요.\n2. 수영장 내에서는 뛰지 마세요.\n3. 개인 소지품은 락커에 보관해주세요.',
        author: '센터 관리자',
        isImportant: true,
        status: 'published',
        centerId: new mongoose.Types.ObjectId('68c58a122bac3caedf19c146')
      },
      {
        title: '강의 일정 변경 안내',
        content: '다음 주 강의 일정이 변경되었습니다. 확인해 주세요.\n\n- 월요일: 자유형 기초 (오후 2시 → 오후 3시)\n- 수요일: 배영 중급 (오후 4시 → 오후 5시)\n- 금요일: 접영 고급 (오후 6시 → 오후 7시)',
        author: '센터 관리자',
        isImportant: false,
        status: 'published',
        centerId: new mongoose.Types.ObjectId('68c58a122bac3caedf19c146')
      },
      {
        title: '새로운 강사 합류',
        content: '새로운 강사가 합류했습니다. 환영해 주세요.\n\n김수영 강사님\n- 전국대회 우승 경력\n- 자유형 전문\n- 친절하고 체계적인 지도',
        author: '센터 관리자',
        isImportant: false,
        status: 'published',
        centerId: new mongoose.Types.ObjectId('68c58a122bac3caedf19c146')
      },
      {
        title: '겨울 특별 프로그램 안내',
        content: '겨울 특별 프로그램을 준비했습니다.\n\n- 아이스 스위밍 프로그램\n- 겨울 체력 단련 프로그램\n- 실내 수영 마스터 프로그램',
        author: '센터 관리자',
        isImportant: true,
        status: 'draft',
        centerId: new mongoose.Types.ObjectId('68c58a122bac3caedf19c146')
      }
    ];
    
    await Notice.insertMany(notices);
    log(`✅ 공지사항 ${notices.length}개 추가 완료`, colors.green);
    
    // 결제 예시 데이터
    const payments = [
      {
        studentName: '김학생',
        courseName: '자유형 기초',
        amount: 150000,
        paymentMethod: '카드',
        status: 'completed',
        transactionId: 'TXN123456789',
        centerId: new mongoose.Types.ObjectId('68c58a122bac3caedf19c146')
      },
      {
        studentName: '박학생',
        courseName: '배영 중급',
        amount: 200000,
        paymentMethod: '계좌이체',
        status: 'pending',
        transactionId: 'TXN123456790',
        centerId: new mongoose.Types.ObjectId('68c58a122bac3caedf19c146')
      },
      {
        studentName: '정학생',
        courseName: '접영 고급',
        amount: 250000,
        paymentMethod: '카드',
        status: 'failed',
        transactionId: 'TXN123456791',
        centerId: new mongoose.Types.ObjectId('68c58a122bac3caedf19c146')
      },
      {
        studentName: '이학생',
        courseName: '자유형 중급',
        amount: 180000,
        paymentMethod: '카드',
        status: 'refunded',
        transactionId: 'TXN123456792',
        centerId: new mongoose.Types.ObjectId('68c58a122bac3caedf19c146')
      },
      {
        studentName: '최학생',
        courseName: '배영 기초',
        amount: 120000,
        paymentMethod: '계좌이체',
        status: 'completed',
        transactionId: 'TXN123456793',
        centerId: new mongoose.Types.ObjectId('68c58a122bac3caedf19c146')
      }
    ];
    
    await Payment.insertMany(payments);
    log(`✅ 결제 내역 ${payments.length}개 추가 완료`, colors.green);
    
    // 리뷰 예시 데이터
    const reviews = [
      {
        studentName: '김학생',
        instructorName: '이강사',
        courseName: '자유형 기초',
        rating: 5,
        comment: '정말 좋은 강의였습니다. 강사님이 친절하시고 설명도 잘 해주셔요. 다음에도 꼭 수강하고 싶습니다.',
        status: 'approved',
        centerId: new mongoose.Types.ObjectId('68c58a122bac3caedf19c146')
      },
      {
        studentName: '박학생',
        instructorName: '최강사',
        courseName: '배영 중급',
        rating: 4,
        comment: '배영 기술이 많이 향상되었어요. 감사합니다. 다만 시간이 조금 부족했던 것 같아요.',
        status: 'pending',
        centerId: new mongoose.Types.ObjectId('68c58a122bac3caedf19c146')
      },
      {
        studentName: '정학생',
        instructorName: '김강사',
        courseName: '접영 고급',
        rating: 3,
        comment: '강의는 괜찮지만 시간이 좀 부족했어요. 더 자세한 설명이 있었으면 좋겠습니다.',
        status: 'rejected',
        centerId: new mongoose.Types.ObjectId('68c58a122bac3caedf19c146')
      },
      {
        studentName: '이학생',
        instructorName: '박강사',
        courseName: '자유형 중급',
        rating: 5,
        comment: '완벽한 강의였습니다! 기술도 많이 늘었고 체력도 좋아졌어요. 강사님 최고입니다!',
        status: 'approved',
        centerId: new mongoose.Types.ObjectId('68c58a122bac3caedf19c146')
      },
      {
        studentName: '최학생',
        instructorName: '정강사',
        courseName: '배영 기초',
        rating: 4,
        comment: '처음 배영을 배웠는데 정말 재미있었어요. 다음 단계도 배우고 싶습니다.',
        status: 'approved',
        centerId: new mongoose.Types.ObjectId('68c58a122bac3caedf19c146')
      }
    ];
    
    await Review.insertMany(reviews);
    log(`✅ 리뷰 ${reviews.length}개 추가 완료`, colors.green);
    
    // 리포트 예시 데이터
    const reports = [
      {
        period: 'month',
        totalStudents: 156,
        totalRevenue: 23400000,
        totalClasses: 89,
        averageRating: 4.7,
        newStudents: 23,
        retentionRate: 87.5,
        centerId: new mongoose.Types.ObjectId('68c58a122bac3caedf19c146')
      },
      {
        period: 'week',
        totalStudents: 45,
        totalRevenue: 6750000,
        totalClasses: 23,
        averageRating: 4.8,
        newStudents: 8,
        retentionRate: 92.0,
        centerId: new mongoose.Types.ObjectId('68c58a122bac3caedf19c146')
      },
      {
        period: 'year',
        totalStudents: 1245,
        totalRevenue: 186750000,
        totalClasses: 892,
        averageRating: 4.6,
        newStudents: 234,
        retentionRate: 85.2,
        centerId: new mongoose.Types.ObjectId('68c58a122bac3caedf19c146')
      }
    ];
    
    await Report.insertMany(reports);
    log(`✅ 리포트 ${reports.length}개 추가 완료`, colors.green);
    
    log('🎉 모든 예시 데이터 추가 완료!', colors.green);
    
  } catch (error) {
    log(`❌ 예시 데이터 추가 실패: ${error.message}`, colors.red);
    throw error;
  }
}

// 메인 실행 함수
async function main() {
  try {
    await connectDB();
    await addSampleData();
    log('✅ 모든 작업이 성공적으로 완료되었습니다!', colors.green);
  } catch (error) {
    log(`❌ 작업 실패: ${error.message}`, colors.red);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    log('🔌 MongoDB 연결 해제', colors.yellow);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { addSampleData, connectDB };
