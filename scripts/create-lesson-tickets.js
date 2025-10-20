/**
 * 수강권 샘플 데이터 생성 스크립트
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const MONGODB_URI = process.env.MONGODB_URI;

// 스키마 정의
const lessonTicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  centerId: { type: mongoose.Schema.Types.ObjectId, ref: 'SwimmingCenter', required: true },
  type: { type: String, enum: ['group', 'personal', 'unlimited'], required: true },
  name: { type: String, required: true },
  totalSessions: { type: Number, required: true },
  remainingSessions: { type: Number, required: true },
  usedSessions: { type: Number, default: 0 },
  purchaseDate: { type: Date, default: Date.now },
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired', 'exhausted', 'suspended'], default: 'active' },
  price: { type: Number, required: true },
  allowedCourseTypes: [{ type: String }],
  assignedInstructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  centerMemo: { type: String },
  isRefunded: { type: Boolean, default: false },
  refundDate: { type: Date },
  refundAmount: { type: Number }
}, { timestamps: true });

const LessonTicket = mongoose.models.LessonTicket || mongoose.model('LessonTicket', lessonTicketSchema);

async function createSampleTickets() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // JJSwim 센터 찾기
    const SwimmingCenter = mongoose.model('SwimmingCenter');
    const center = await SwimmingCenter.findOne({ name: 'JJSwim' });
    
    if (!center) {
      console.log('❌ JJSwim 센터를 찾을 수 없습니다.');
      return;
    }
    
    console.log('🏢 센터 ID:', center._id);

    // 학생 회원 찾기
    const User = mongoose.model('User');
    const students = await User.find({ 
      centerId: center._id,
      userType: 'student' 
    }).limit(10);
    
    console.log(`👥 학생 회원 ${students.length}명 찾음`);

    if (students.length === 0) {
      console.log('❌ 학생 회원이 없습니다. 먼저 학생 회원을 생성하세요.');
      return;
    }

    // 기존 수강권 삭제
    await LessonTicket.deleteMany({ centerId: center._id });
    console.log('🗑️ 기존 수강권 삭제 완료');

    const tickets = [];
    
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      // 각 학생에게 1-3개의 수강권 생성
      const ticketCount = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < ticketCount; j++) {
        const ticketTypes = [
          {
            type: 'group',
            name: '10회 그룹 수강권',
            totalSessions: 10,
            price: 200000,
            remainingSessions: Math.floor(Math.random() * 10) + 1
          },
          {
            type: 'group',
            name: '20회 그룹 수강권',
            totalSessions: 20,
            price: 360000,
            remainingSessions: Math.floor(Math.random() * 20) + 1
          },
          {
            type: 'personal',
            name: '5회 개인 레슨',
            totalSessions: 5,
            price: 500000,
            remainingSessions: Math.floor(Math.random() * 5) + 1
          },
          {
            type: 'personal',
            name: '10회 개인 레슨',
            totalSessions: 10,
            price: 900000,
            remainingSessions: Math.floor(Math.random() * 10) + 1
          }
        ];
        
        const selectedTicket = ticketTypes[Math.floor(Math.random() * ticketTypes.length)];
        
        // 일부는 만료 임박으로 설정 (7일 이내)
        const isExpiringSoon = Math.random() > 0.7;
        const daysUntilExpiry = isExpiringSoon 
          ? Math.floor(Math.random() * 7) + 1  // 1-7일
          : Math.floor(Math.random() * 60) + 8; // 8-67일
        
        const expiryDate = new Date(Date.now() + daysUntilExpiry * 24 * 60 * 60 * 1000);
        const purchaseDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
        
        tickets.push({
          userId: student._id,
          centerId: center._id,
          type: selectedTicket.type,
          name: selectedTicket.name,
          totalSessions: selectedTicket.totalSessions,
          remainingSessions: selectedTicket.remainingSessions,
          usedSessions: selectedTicket.totalSessions - selectedTicket.remainingSessions,
          purchaseDate: purchaseDate,
          startDate: purchaseDate,
          expiryDate: expiryDate,
          status: 'active',
          price: selectedTicket.price
        });
      }
    }

    // 수강권 생성
    const createdTickets = await LessonTicket.insertMany(tickets);
    console.log(`✅ 수강권 ${createdTickets.length}개 생성 완료`);
    
    // 생성된 수강권 통계
    const groupTickets = createdTickets.filter(t => t.type === 'group').length;
    const personalTickets = createdTickets.filter(t => t.type === 'personal').length;
    const expiringTickets = createdTickets.filter(t => {
      const daysLeft = Math.ceil((t.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysLeft <= 7;
    }).length;
    
    console.log('\n📊 생성된 수강권 통계:');
    console.log(`   - 총 수강권: ${createdTickets.length}개`);
    console.log(`   - 단체 수강권: ${groupTickets}개`);
    console.log(`   - 개인 수강권: ${personalTickets}개`);
    console.log(`   - 만료 임박 (7일 이내): ${expiringTickets}개`);
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 MongoDB 연결 종료');
  }
}

createSampleTickets();

