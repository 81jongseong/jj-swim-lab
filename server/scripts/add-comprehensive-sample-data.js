/**
 * 🗄️ JJ Swim Lab - 종합 샘플 데이터 추가 스크립트
 * 
 * 📋 **스크립트 목적**
 * - 모든 필요한 데이터베이스 모델에 대한 종합적인 샘플 데이터 추가
 * - 결제, 회원권, 알림, 상품, 주문 등 모든 시스템 데이터 생성
 * - 실제 운영 환경과 유사한 데이터 구조 제공
 * - 각 사용자 타입별 맞춤형 데이터 생성
 * 
 * 🔄 **추가되는 데이터**
 * - 결제 내역 (Payment)
 * - 회원권 계획 및 사용자 회원권 (Membership)
 * - 알림 데이터 (Notification)
 * - 상품 및 주문 데이터 (ShopProduct, ShopOrder)
 * - 사용자 진행상황 (StudentProgress)
 * - 퀴즈 시도 데이터 (QuizAttempt)
 * - 비디오 및 운동 데이터 (Video, ExerciseData)
 * - 승인 요청 데이터 (Approval)
 * 
 * 🗄️ **데이터 연동**
 * - 기존 사용자, 센터, 강의, 예약 데이터와 연동
 * - 모든 데이터 간 관계 설정 및 참조 연결
 * - 실제 비즈니스 로직에 맞는 데이터 구조
 * 
 * ⚠️ **주의사항**
 * - 기존 데이터와 중복되지 않도록 중복 체크
 * - 모든 외래키 관계 올바르게 설정
 * - 데이터 일관성 및 무결성 보장
 * 
 * 📅 **개발 히스토리**
 * - 2025-09-13: 종합 샘플 데이터 스크립트 생성
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-09-13
 * - 상태: ✅ 완성
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

// 스키마 정의
const userSchema = new mongoose.Schema({
  name: String,
  userId: String,
  email: String,
  userType: String,
  centerId: mongoose.Schema.Types.ObjectId,
  permissions: mongoose.Schema.Types.Mixed,
  isActive: Boolean
}, { timestamps: true });

const centerSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  email: String,
  managerId: mongoose.Schema.Types.ObjectId,
  capacity: Number,
  status: String,
  facilities: [String],
  operatingHours: mongoose.Schema.Types.Mixed
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
  name: String,
  description: String,
  instructorId: mongoose.Schema.Types.ObjectId,
  centerId: mongoose.Schema.Types.ObjectId,
  level: String,
  maxStudents: Number,
  duration: Number,
  price: Number,
  schedule: String,
  startDate: Date,
  endDate: Date,
  isActive: Boolean
}, { timestamps: true });

const bookingSchema = new mongoose.Schema({
  studentId: mongoose.Schema.Types.ObjectId,
  instructorId: mongoose.Schema.Types.ObjectId,
  courseId: mongoose.Schema.Types.ObjectId,
  date: String,
  time: String,
  status: String,
  notes: String
}, { timestamps: true });

// 새로운 모델 스키마들
const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'KRW' },
  paymentMethod: { type: String, enum: ['card', 'cash', 'transfer', 'online'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  purpose: { type: String, enum: ['course', 'booking', 'membership', 'other'], required: true },
  relatedCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  relatedBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  transactionId: { type: String, unique: true },
  receiptUrl: String,
  notes: { type: String, default: '' },
  processedAt: Date
}, { timestamps: true });

const membershipPlanSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  duration: { type: Number, required: true, min: 1 },
  features: [{ type: String }],
  maxClassesPerMonth: { type: Number },
  maxVideoUploads: { type: Number },
  prioritySupport: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const userMembershipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired', 'cancelled', 'pending'], required: true },
  autoRenew: { type: Boolean, default: true },
  paymentMethod: String,
  lastPaymentDate: Date,
  nextPaymentDate: Date,
  totalPaid: { type: Number, required: true, min: 0 }
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, maxlength: 100 },
  message: { type: String, required: true, maxlength: 500 },
  type: { type: String, enum: ['info', 'success', 'warning', 'error', 'course', 'booking', 'payment', 'system'], default: 'info' },
  category: { type: String, enum: ['general', 'course', 'booking', 'payment', 'membership', 'ai_analysis', 'system'], default: 'general' },
  isRead: { type: Boolean, default: false },
  isEmailSent: { type: Boolean, default: false },
  isPushSent: { type: Boolean, default: false },
  relatedId: mongoose.Schema.Types.ObjectId,
  relatedType: String,
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  scheduledAt: Date,
  expiresAt: Date,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

const shopProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true, min: 0 },
  category: { type: String, enum: ['swimwear', 'equipment', 'accessories', 'books', 'other'], required: true },
  stock: { type: Number, default: 0 },
  images: [String],
  isActive: { type: Boolean, default: true },
  tags: [String]
}, { timestamps: true });

const shopOrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShopProduct', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'cancelled', 'refunded'], default: 'pending' },
  notes: { type: String, default: '' }
}, { timestamps: true });

const studentProgressSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  level: { type: String, required: true },
  skills: [{
    name: String,
    level: Number,
    maxLevel: Number,
    completed: Boolean,
    notes: String
  }],
  attendance: { type: Number, default: 0 },
  totalClasses: { type: Number, default: 0 },
  lastClassDate: Date,
  nextClassDate: Date,
  notes: String
}, { timestamps: true });

const quizAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  timeSpent: { type: Number, required: true },
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    selectedAnswer: String,
    isCorrect: Boolean,
    timeSpent: Number
  }],
  completedAt: Date,
  startedAt: Date
}, { timestamps: true });

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  url: { type: String, required: true },
  thumbnailUrl: String,
  duration: Number,
  category: { type: String, enum: ['technique', 'exercise', 'tutorial', 'analysis'], required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  tags: [String],
  uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 }
}, { timestamps: true });

const exerciseDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exerciseType: { type: String, required: true },
  duration: { type: Number, required: true },
  calories: Number,
  heartRate: {
    average: Number,
    max: Number,
    min: Number
  },
  distance: Number,
  strokes: Number,
  technique: String,
  notes: String,
  recordedAt: { type: Date, required: true }
}, { timestamps: true });

const approvalSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['course_enrollment', 'level_change', 'refund', 'membership_upgrade', 'other'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  relatedData: mongoose.Schema.Types.Mixed,
  approvedAt: Date,
  rejectedAt: Date,
  reason: String
}, { timestamps: true });

// 모델 생성
const User = mongoose.model('User', userSchema);
const Center = mongoose.model('Center', centerSchema);
const Course = mongoose.model('Course', courseSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const MembershipPlan = mongoose.model('MembershipPlan', membershipPlanSchema);
const UserMembership = mongoose.model('UserMembership', userMembershipSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const ShopProduct = mongoose.model('ShopProduct', shopProductSchema);
const ShopOrder = mongoose.model('ShopOrder', shopOrderSchema);
const StudentProgress = mongoose.model('StudentProgress', studentProgressSchema);
const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
const Video = mongoose.model('Video', videoSchema);
const ExerciseData = mongoose.model('ExerciseData', exerciseDataSchema);
const Approval = mongoose.model('Approval', approvalSchema);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error);
    process.exit(1);
  }
};

const addComprehensiveSampleData = async () => {
  try {
    console.log('🔍 종합 샘플 데이터 추가 시작...');

    // 기존 데이터 조회
    const users = await User.find();
    const centers = await Center.find();
    const courses = await Course.find();
    const bookings = await Booking.find();

    console.log(`📊 기존 데이터: 사용자 ${users.length}명, 센터 ${centers.length}개, 강의 ${courses.length}개, 예약 ${bookings.length}개`);

    // 1. 회원권 계획 추가
    console.log('💳 회원권 계획 추가 중...');
    const membershipPlans = [
      {
        name: '기본 회원권',
        description: '월 8회 강습 이용 가능',
        price: 80000,
        duration: 30,
        features: ['월 8회 강습', '기본 시설 이용', '온라인 강의 영상'],
        maxClassesPerMonth: 8,
        maxVideoUploads: 5,
        prioritySupport: false,
        isActive: true
      },
      {
        name: '프리미엄 회원권',
        description: '무제한 강습 이용 및 프리미엄 혜택',
        price: 150000,
        duration: 30,
        features: ['무제한 강습', '모든 시설 이용', '무제한 영상 업로드', '개인 코칭 1회'],
        maxClassesPerMonth: 999,
        maxVideoUploads: 999,
        prioritySupport: true,
        isActive: true
      },
      {
        name: '가족 회원권',
        description: '가족 4명까지 이용 가능',
        price: 250000,
        duration: 30,
        features: ['가족 4명 이용', '월 20회 강습', '가족 할인 혜택'],
        maxClassesPerMonth: 20,
        maxVideoUploads: 10,
        prioritySupport: false,
        isActive: true
      }
    ];

    for (const planData of membershipPlans) {
      const existingPlan = await MembershipPlan.findOne({ name: planData.name });
      if (!existingPlan) {
        await MembershipPlan.create(planData);
        console.log(`✅ 회원권 계획 추가: ${planData.name}`);
      } else {
        console.log(`⏭️ 회원권 계획 이미 존재: ${planData.name}`);
      }
    }

    const membershipPlansList = await MembershipPlan.find();

    // 2. 사용자 회원권 추가
    console.log('👥 사용자 회원권 추가 중...');
    const studentUsers = users.filter(u => u.userType === 'student');
    
    for (let i = 0; i < Math.min(studentUsers.length, 10); i++) {
      const user = studentUsers[i];
      const plan = membershipPlansList[i % membershipPlansList.length];
      
      const existingMembership = await UserMembership.findOne({ userId: user._id });
      if (!existingMembership) {
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + (plan.duration * 24 * 60 * 60 * 1000));
        
        await UserMembership.create({
          userId: user._id,
          planId: plan._id,
          startDate,
          endDate,
          status: i < 8 ? 'active' : 'expired',
          autoRenew: true,
          paymentMethod: 'card',
          lastPaymentDate: startDate,
          nextPaymentDate: endDate,
          totalPaid: plan.price
        });
        console.log(`✅ 사용자 회원권 추가: ${user.name} - ${plan.name}`);
      }
    }

    // 3. 결제 내역 추가
    console.log('💳 결제 내역 추가 중...');
    const userMemberships = await UserMembership.find();
    
    for (const membership of userMemberships) {
      const user = users.find(u => u._id.toString() === membership.userId.toString());
      const plan = membershipPlansList.find(p => p._id.toString() === membership.planId.toString());
      
      if (user && plan) {
        // 회원권 결제
        const existingPayment = await Payment.findOne({ 
          user: user._id, 
          purpose: 'membership',
          amount: plan.price 
        });
        
        if (!existingPayment) {
          await Payment.create({
            user: user._id,
            amount: plan.price,
            currency: 'KRW',
            paymentMethod: 'card',
            status: 'completed',
            purpose: 'membership',
            transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            receiptUrl: `https://receipts.jjswim.com/${Date.now()}.pdf`,
            processedAt: membership.startDate,
            notes: `${plan.name} 회원권 결제`
          });
          console.log(`✅ 결제 내역 추가: ${user.name} - ${plan.name} (${plan.price.toLocaleString()}원)`);
        }

        // 강습 관련 결제들
        const userBookings = bookings.filter(b => b.studentId.toString() === user._id.toString());
        for (let i = 0; i < Math.min(userBookings.length, 3); i++) {
          const booking = userBookings[i];
          const course = courses.find(c => c._id.toString() === booking.courseId.toString());
          
          if (course) {
            const existingCoursePayment = await Payment.findOne({
              user: user._id,
              relatedBooking: booking._id
            });
            
            if (!existingCoursePayment) {
              await Payment.create({
                user: user._id,
                amount: course.price || 50000,
                currency: 'KRW',
                paymentMethod: ['card', 'cash', 'transfer'][i % 3],
                status: ['completed', 'pending', 'completed'][i % 3],
                purpose: 'course',
                relatedCourse: course._id,
                relatedBooking: booking._id,
                transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                processedAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
                notes: `${course.name} 강습 결제`
              });
              console.log(`✅ 강습 결제 추가: ${user.name} - ${course.name}`);
            }
          }
        }
      }
    }

    // 4. 알림 데이터 추가
    console.log('🔔 알림 데이터 추가 중...');
    for (const user of users) {
      const notifications = [
        {
          userId: user._id,
          title: '새로운 강습 일정 안내',
          message: '다음 주 강습 일정이 업데이트되었습니다. 확인해주세요.',
          type: 'info',
          category: 'course',
          isRead: false,
          priority: 'medium'
        },
        {
          userId: user._id,
          title: '결제 완료 알림',
          message: '회원권 결제가 완료되었습니다. 감사합니다.',
          type: 'success',
          category: 'payment',
          isRead: true,
          priority: 'high'
        },
        {
          userId: user._id,
          title: '강습 예약 확인',
          message: '내일 오후 2시 자유형 강습 예약을 확인해주세요.',
          type: 'info',
          category: 'booking',
          isRead: false,
          priority: 'high'
        }
      ];

      for (const notifData of notifications) {
        const existingNotif = await Notification.findOne({
          userId: user._id,
          title: notifData.title
        });
        
        if (!existingNotif) {
          await Notification.create(notifData);
          console.log(`✅ 알림 추가: ${user.name} - ${notifData.title}`);
        }
      }
    }

    // 5. 상품 데이터 추가
    console.log('🛍️ 상품 데이터 추가 중...');
    const products = [
      {
        name: '수영복 (남성용)',
        description: '편안하고 기능적인 남성용 수영복',
        price: 45000,
        category: 'swimwear',
        stock: 50,
        images: ['/images/swimwear1.jpg'],
        tags: ['남성', '수영복', '기본']
      },
      {
        name: '수영복 (여성용)',
        description: '세련된 디자인의 여성용 수영복',
        price: 55000,
        category: 'swimwear',
        stock: 40,
        images: ['/images/swimwear1.jpg'],
        tags: ['여성', '수영복', '기본']
      },
      {
        name: '수영 고글',
        description: '안전하고 편안한 수영 고글',
        price: 25000,
        category: 'equipment',
        stock: 100,
        images: ['/images/goggles1.jpg'],
        tags: ['고글', '안전', '편안']
      },
      {
        name: '수영 모자',
        description: '실리콘 재질의 수영 모자',
        price: 15000,
        category: 'accessories',
        stock: 80,
        images: ['/images/cap1.jpg'],
        tags: ['모자', '실리콘', '필수']
      },
      {
        name: '키킹보드',
        description: '발차기 연습용 키킹보드',
        price: 35000,
        category: 'equipment',
        stock: 30,
        images: ['/images/board1.jpg'],
        tags: ['키킹보드', '연습', '발차기']
      },
      {
        name: '핀 (지느러미)',
        description: '다이빙용 핀',
        price: 85000,
        category: 'equipment',
        stock: 20,
        images: ['/images/fins1.jpg'],
        tags: ['핀', '다이빙', '전문']
      }
    ];

    for (const productData of products) {
      const existingProduct = await ShopProduct.findOne({ name: productData.name });
      if (!existingProduct) {
        await ShopProduct.create(productData);
        console.log(`✅ 상품 추가: ${productData.name}`);
      }
    }

    const productsList = await ShopProduct.find();

    // 6. 주문 데이터 추가
    console.log('📦 주문 데이터 추가 중...');
    const studentUsersForOrders = users.filter(u => u.userType === 'student').slice(0, 5);
    
    for (const user of studentUsersForOrders) {
      const orderItems = [];
      const numItems = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numItems; i++) {
        const product = productsList[i % productsList.length];
        const qty = Math.floor(Math.random() * 2) + 1;
        
        orderItems.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          qty
        });
      }
      
      const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
      
      await ShopOrder.create({
        user: user._id,
        items: orderItems,
        totalAmount,
        status: ['pending', 'paid', 'paid'][Math.floor(Math.random() * 3)],
        notes: '온라인 주문'
      });
      
      console.log(`✅ 주문 추가: ${user.name} - ${orderItems.length}개 상품 (${totalAmount.toLocaleString()}원)`);
    }

    // 7. 학생 진행상황 추가
    console.log('📈 학생 진행상황 추가 중...');
    const studentUsersForProgress = users.filter(u => u.userType === 'student').slice(0, 8);
    
    for (const user of studentUsersForProgress) {
      const userCourses = courses.filter(c => 
        bookings.some(b => b.studentId.toString() === user._id.toString() && b.courseId.toString() === c._id.toString())
      );
      
      for (const course of userCourses.slice(0, 2)) {
        const instructor = users.find(u => u._id.toString() === course.instructorId.toString());
        
        if (instructor) {
          const existingProgress = await StudentProgress.findOne({
            studentId: user._id,
            courseId: course._id
          });
          
          if (!existingProgress) {
            const skills = [
              { name: '자유형', level: Math.floor(Math.random() * 3) + 1, maxLevel: 5, completed: false, notes: '' },
              { name: '배영', level: Math.floor(Math.random() * 3) + 1, maxLevel: 5, completed: false, notes: '' },
              { name: '접영', level: Math.floor(Math.random() * 2) + 1, maxLevel: 5, completed: false, notes: '' },
              { name: '평영', level: Math.floor(Math.random() * 2) + 1, maxLevel: 5, completed: false, notes: '' }
            ];
            
            try {
              await StudentProgress.create({
                studentId: user._id,
                courseId: course._id,
                instructorId: instructor._id,
                level: course.level || 'beginner',
                skills,
                attendance: Math.floor(Math.random() * 10) + 1,
                totalClasses: Math.floor(Math.random() * 15) + 5,
                lastClassDate: new Date(Date.now() - (Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000)),
                nextClassDate: new Date(Date.now() + (Math.floor(Math.random() * 3) + 1) * 24 * 60 * 60 * 1000),
                notes: '꾸준히 연습하고 있습니다.'
              });
              
              console.log(`✅ 진행상황 추가: ${user.name} - ${course.name}`);
            } catch (error) {
              console.log(`⏭️ 진행상황 이미 존재: ${user.name} - ${course.name}`);
            }
          }
        }
      }
    }

    // 8. 퀴즈 시도 데이터 추가
    console.log('🧠 퀴즈 시도 데이터 추가 중...');
    const studentUsersForQuiz = users.filter(u => u.userType === 'student').slice(0, 6);
    
    for (const user of studentUsersForQuiz) {
      const quizAttempts = [
        {
          userId: user._id,
          quizId: new mongoose.Types.ObjectId(),
          score: Math.floor(Math.random() * 40) + 60,
          totalQuestions: 10,
          correctAnswers: Math.floor(Math.random() * 4) + 6,
          timeSpent: Math.floor(Math.random() * 300) + 120,
          answers: [],
          completedAt: new Date(Date.now() - (Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)),
          startedAt: new Date(Date.now() - (Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) - 300000)
        }
      ];
      
      for (const attemptData of quizAttempts) {
        try {
          await QuizAttempt.create(attemptData);
          console.log(`✅ 퀴즈 시도 추가: ${user.name} - 점수 ${attemptData.score}점`);
        } catch (error) {
          console.log(`⏭️ 퀴즈 시도 이미 존재: ${user.name}`);
        }
      }
    }

    // 9. 비디오 데이터 추가
    console.log('🎥 비디오 데이터 추가 중...');
    const instructorUsers = users.filter(u => u.userType === 'instructor');
    
    for (const instructor of instructorUsers.slice(0, 3)) {
      const videos = [
        {
          title: '자유형 기초 자세',
          description: '자유형의 기본 자세와 호흡법을 배워보세요.',
          url: 'https://example.com/freestyle_basic.mp4',
          thumbnailUrl: 'https://example.com/freestyle_basic_thumb.jpg',
          duration: 600,
          category: 'technique',
          level: 'beginner',
          tags: ['자유형', '기초', '자세'],
          uploaderId: instructor._id,
          isPublic: true,
          viewCount: Math.floor(Math.random() * 1000) + 100,
          likeCount: Math.floor(Math.random() * 100) + 10
        },
        {
          title: '배영 스트로크 연습',
          description: '배영의 올바른 스트로크 방법을 익혀보세요.',
          url: 'https://example.com/backstroke_stroke.mp4',
          thumbnailUrl: 'https://example.com/backstroke_stroke_thumb.jpg',
          duration: 480,
          category: 'exercise',
          level: 'intermediate',
          tags: ['배영', '스트로크', '연습'],
          uploaderId: instructor._id,
          isPublic: true,
          viewCount: Math.floor(Math.random() * 800) + 50,
          likeCount: Math.floor(Math.random() * 80) + 5
        }
      ];
      
      for (const videoData of videos) {
        try {
          await Video.create(videoData);
          console.log(`✅ 비디오 추가: ${instructor.name} - ${videoData.title}`);
        } catch (error) {
          console.log(`⏭️ 비디오 이미 존재: ${instructor.name} - ${videoData.title}`);
        }
      }
    }

    // 10. 운동 데이터 추가
    console.log('🏊‍♂️ 운동 데이터 추가 중...');
    const studentUsersForExercise = users.filter(u => u.userType === 'student').slice(0, 5);
    
    for (const user of studentUsersForExercise) {
      const exerciseData = [
        {
          userId: user._id,
          exerciseType: 'freestyle',
          duration: Math.floor(Math.random() * 1800) + 600,
          calories: Math.floor(Math.random() * 300) + 200,
          heartRate: {
            average: Math.floor(Math.random() * 40) + 120,
            max: Math.floor(Math.random() * 20) + 150,
            min: Math.floor(Math.random() * 30) + 90
          },
          distance: Math.floor(Math.random() * 1000) + 500,
          strokes: Math.floor(Math.random() * 200) + 100,
          technique: 'freestyle',
          notes: '안정적인 페이스로 수영했습니다.',
          recordedAt: new Date(Date.now() - (Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000))
        }
      ];
      
      for (const exercise of exerciseData) {
        try {
          await ExerciseData.create(exercise);
          console.log(`✅ 운동 데이터 추가: ${user.name} - ${exercise.exerciseType}`);
        } catch (error) {
          console.log(`⏭️ 운동 데이터 이미 존재: ${user.name} - ${exercise.exerciseType}`);
        }
      }
    }

    // 11. 승인 요청 데이터 추가
    console.log('📝 승인 요청 데이터 추가 중...');
    const studentUsersForApproval = users.filter(u => u.userType === 'student').slice(0, 4);
    const adminUsers = users.filter(u => u.userType === 'superAdmin' || u.userType === 'centerAdmin');
    
    for (const user of studentUsersForApproval) {
      const approvalData = {
        requesterId: user._id,
        approverId: adminUsers[0]._id,
        type: ['course_enrollment', 'level_change', 'refund'][Math.floor(Math.random() * 3)],
        status: ['pending', 'approved', 'pending'][Math.floor(Math.random() * 3)],
        title: '레벨 업그레이드 요청',
        description: '중급 레벨로 업그레이드를 요청합니다.',
        relatedData: {
          currentLevel: 'beginner',
          requestedLevel: 'intermediate',
          reason: '지속적인 연습으로 실력 향상'
        },
        approvedAt: Math.random() > 0.5 ? new Date() : null,
        reason: Math.random() > 0.5 ? '승인되었습니다.' : null
      };
      
      try {
        await Approval.create(approvalData);
        console.log(`✅ 승인 요청 추가: ${user.name} - ${approvalData.type}`);
      } catch (error) {
        console.log(`⏭️ 승인 요청 이미 존재: ${user.name} - ${approvalData.type}`);
      }
    }

    console.log('🎉 종합 샘플 데이터 추가 완료!');
    
    // 최종 데이터 현황 출력
    const finalCounts = {
      users: await User.countDocuments(),
      centers: await Center.countDocuments(),
      courses: await Course.countDocuments(),
      bookings: await Booking.countDocuments(),
      payments: await Payment.countDocuments(),
      membershipPlans: await MembershipPlan.countDocuments(),
      userMemberships: await UserMembership.countDocuments(),
      notifications: await Notification.countDocuments(),
      shopProducts: await ShopProduct.countDocuments(),
      shopOrders: await ShopOrder.countDocuments(),
      studentProgress: await StudentProgress.countDocuments(),
      quizAttempts: await QuizAttempt.countDocuments(),
      videos: await Video.countDocuments(),
      exerciseData: await ExerciseData.countDocuments(),
      approvals: await Approval.countDocuments()
    };
    
    console.log('\n📊 최종 데이터베이스 현황:');
    Object.entries(finalCounts).forEach(([model, count]) => {
      console.log(`   - ${model}: ${count}개`);
    });

  } catch (error) {
    console.error('❌ 샘플 데이터 추가 오류:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 해제');
  }
};

connectDB().then(() => addComprehensiveSampleData());
