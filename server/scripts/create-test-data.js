const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 모델 정의
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  userType: { type: String, enum: ['member', 'instructor', 'admin'], default: 'member' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const swimmingCenterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  phone: { type: String, required: true },
  email: { type: String },
  website: { type: String },
  description: { type: String },
  facilities: {
    lanes: { type: Number, required: true },
    poolLength: { type: Number, required: true },
    poolDepth: { type: Number, required: true },
    temperature: { type: Number, required: true },
    hasSauna: { type: Boolean, default: false },
    hasShower: { type: Boolean, default: true },
    hasLocker: { type: Boolean, default: true }
  },
  operatingHours: {
    monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    sunday: { open: String, close: String, isOpen: { type: Boolean, default: true } }
  },
  pricing: {
    freeSwim: {
      adult: { type: Number, required: true },
      child: { type: Number, required: true },
      student: { type: Number, required: true }
    },
    lesson: {
      perSession: { type: Number, required: true },
      monthly: { type: Number, required: true }
    }
  },
  currentCapacity: { type: Number, default: 0 },
  maxCapacity: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  images: [{ url: String, caption: String }]
});

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  maxStudents: { type: Number, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  schedule: [{
    day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  }],
  isActive: { type: Boolean, default: true },
  enrolledStudents: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    enrolledAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'completed', 'dropped'], default: 'active' }
  }]
});

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  center: { type: mongoose.Schema.Types.ObjectId, ref: 'SwimmingCenter', required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  maxStudents: { type: Number, required: true },
  currentStudents: { type: Number, default: 0 },
  schedule: {
    dayOfWeek: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  students: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    enrolledAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'completed', 'dropped'], default: 'active' }
  }]
});

const skillTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'diving', 'turning', 'breathing', 'endurance', 'technique'], required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  description: { type: String, required: true },
  practiceDrills: [{
    name: { type: String, required: true },
    description: { type: String, required: true },
    youtubeUrl: { type: String },
    duration: { type: Number, default: 10 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
  }],
  commonIssues: [{
    issue: { type: String, required: true },
    solution: { type: String, required: true },
    practiceDrill: { type: String }
  }],
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SkillTemplate' }],
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const progressSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  center: { type: mongoose.Schema.Types.ObjectId, ref: 'SwimmingCenter', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  evaluationDate: { type: Date, required: true },
  skills: [{
    skillName: { type: String, required: true },
    status: { type: String, enum: ['not_started', 'learning', 'completed', 'needs_improvement'], default: 'not_started' },
    instructorNotes: { type: String, default: '' },
    practiceDrills: [{
      name: String,
      description: String,
      youtubeUrl: String
    }],
    advice: { type: String, default: '' }
  }],
  overallProgress: { type: Number, default: 0 },
  instructorComments: { type: String, default: '' },
  nextGoals: [{
    goal: String,
    targetDate: Date
  }],
  isActive: { type: Boolean, default: true }
});

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['general', 'lesson', 'facility', 'payment', 'safety'], default: 'general' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  expiresAt: { type: Date },
  attachments: [{ url: String, name: String }],
  viewCount: { type: Number, default: 0 },
  tags: [String]
});

// 모델 생성
const User = mongoose.model('User', userSchema);
const SwimmingCenter = mongoose.model('SwimmingCenter', swimmingCenterSchema);
const Course = mongoose.model('Course', courseSchema);
const Class = mongoose.model('Class', classSchema);
const SkillTemplate = mongoose.model('SkillTemplate', skillTemplateSchema);
const Progress = mongoose.model('Progress', progressSchema);
const Notice = mongoose.model('Notice', noticeSchema);

async function createTestData() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab');
    console.log('✅ MongoDB 연결 성공');

    // 기존 테스트 데이터 삭제
    await User.deleteMany({ userId: { $in: ['admin', 'instructor1', 'instructor2', 'member1', 'member2', 'member3'] } });
    await SwimmingCenter.deleteMany({});
    await Course.deleteMany({});
    await Class.deleteMany({});
    await SkillTemplate.deleteMany({});
    await Progress.deleteMany({});
    await Notice.deleteMany({});
    console.log('🗑️ 기존 테스트 데이터 삭제 완료');

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 사용자 생성
    const admin = new User({
      userId: 'admin',
      password: hashedPassword,
      name: '관리자',
      email: 'admin@jjswim.com',
      phone: '010-0000-0000',
      userType: 'admin'
    });
    await admin.save();

    const instructor1 = new User({
      userId: 'instructor1',
      password: hashedPassword,
      name: '김강사',
      email: 'instructor1@jjswim.com',
      phone: '010-1111-1111',
      userType: 'instructor'
    });
    await instructor1.save();

    const instructor2 = new User({
      userId: 'instructor2',
      password: hashedPassword,
      name: '이강사',
      email: 'instructor2@jjswim.com',
      phone: '010-2222-2222',
      userType: 'instructor'
    });
    await instructor2.save();

    const member1 = new User({
      userId: 'member1',
      password: hashedPassword,
      name: '김철수',
      email: 'member1@test.com',
      phone: '010-3333-3333',
      userType: 'member'
    });
    await member1.save();

    const member2 = new User({
      userId: 'member2',
      password: hashedPassword,
      name: '이영희',
      email: 'member2@test.com',
      phone: '010-4444-4444',
      userType: 'member'
    });
    await member2.save();

    const member3 = new User({
      userId: 'member3',
      password: hashedPassword,
      name: '박민수',
      email: 'member3@test.com',
      phone: '010-5555-5555',
      userType: 'member'
    });
    await member3.save();

    console.log('👥 사용자 생성 완료');

    // 수영장 생성
    const center1 = new SwimmingCenter({
      name: 'JJ Swim Lab 강남점',
      address: '서울시 강남구 테헤란로 123',
      location: { latitude: 37.5665, longitude: 127.0080 },
      phone: '02-1234-5678',
      email: 'gangnam@jjswim.com',
      website: 'https://jjswim.com/gangnam',
      description: '강남역 인근 최고의 수영장',
      facilities: {
        lanes: 6,
        poolLength: 25,
        poolDepth: 1.8,
        temperature: 28,
        hasSauna: true,
        hasShower: true,
        hasLocker: true
      },
      operatingHours: {
        monday: { open: '06:00', close: '22:00', isOpen: true },
        tuesday: { open: '06:00', close: '22:00', isOpen: true },
        wednesday: { open: '06:00', close: '22:00', isOpen: true },
        thursday: { open: '06:00', close: '22:00', isOpen: true },
        friday: { open: '06:00', close: '22:00', isOpen: true },
        saturday: { open: '08:00', close: '20:00', isOpen: true },
        sunday: { open: '08:00', close: '20:00', isOpen: true }
      },
      pricing: {
        freeSwim: { adult: 15000, child: 10000, student: 12000 },
        lesson: { perSession: 50000, monthly: 200000 }
      },
      currentCapacity: 15,
      maxCapacity: 50
    });
    await center1.save();

    const center2 = new SwimmingCenter({
      name: 'JJ Swim Lab 홍대점',
      address: '서울시 마포구 홍대로 456',
      location: { latitude: 37.5575, longitude: 126.9250 },
      phone: '02-9876-5432',
      email: 'hongdae@jjswim.com',
      website: 'https://jjswim.com/hongdae',
      description: '홍대입구역 근처의 친근한 수영장',
      facilities: {
        lanes: 4,
        poolLength: 20,
        poolDepth: 1.5,
        temperature: 29,
        hasSauna: false,
        hasShower: true,
        hasLocker: true
      },
      operatingHours: {
        monday: { open: '07:00', close: '21:00', isOpen: true },
        tuesday: { open: '07:00', close: '21:00', isOpen: true },
        wednesday: { open: '07:00', close: '21:00', isOpen: true },
        thursday: { open: '07:00', close: '21:00', isOpen: true },
        friday: { open: '07:00', close: '21:00', isOpen: true },
        saturday: { open: '09:00', close: '18:00', isOpen: true },
        sunday: { open: '09:00', close: '18:00', isOpen: true }
      },
      pricing: {
        freeSwim: { adult: 12000, child: 8000, student: 10000 },
        lesson: { perSession: 40000, monthly: 180000 }
      },
      currentCapacity: 8,
      maxCapacity: 30
    });
    await center2.save();

    console.log('🏊‍♂️ 수영장 생성 완료');

    // 강습 과정 생성
    const course1 = new Course({
      name: '자유형 기초',
      description: '자유형의 기본기를 다지는 과정',
      level: 'beginner',
      duration: 50,
      price: 200000,
      maxStudents: 8,
      instructor: instructor1._id,
      schedule: [
        { day: 'monday', startTime: '19:00', endTime: '20:00' },
        { day: 'wednesday', startTime: '19:00', endTime: '20:00' }
      ],
      isActive: true
    });
    await course1.save();

    const course2 = new Course({
      name: '자유형 심화',
      description: '자유형의 고급 기술을 배우는 과정',
      level: 'intermediate',
      duration: 60,
      price: 250000,
      maxStudents: 6,
      instructor: instructor2._id,
      schedule: [
        { day: 'tuesday', startTime: '20:00', endTime: '21:00' },
        { day: 'thursday', startTime: '20:00', endTime: '21:00' }
      ],
      isActive: true
    });
    await course2.save();

    console.log('📚 강습 과정 생성 완료');

    // 반 생성
    const class1 = new Class({
      name: '초급 A반',
      center: center1._id,
      instructor: instructor1._id,
      course: course1._id,
      level: 'beginner',
      maxStudents: 8,
      currentStudents: 6,
      schedule: {
        dayOfWeek: 'monday',
        startTime: '19:00',
        endTime: '20:00'
      },
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      description: '자유형 기초를 배우는 초급반',
      students: [
        { student: member1._id, status: 'active' },
        { student: member2._id, status: 'active' }
      ]
    });
    await class1.save();

    const class2 = new Class({
      name: '중급 B반',
      center: center1._id,
      instructor: instructor2._id,
      course: course2._id,
      level: 'intermediate',
      maxStudents: 6,
      currentStudents: 4,
      schedule: {
        dayOfWeek: 'wednesday',
        startTime: '20:00',
        endTime: '21:00'
      },
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      description: '자유형 심화를 배우는 중급반',
      students: [
        { student: member3._id, status: 'active' }
      ]
    });
    await class2.save();

    console.log('📚 반 생성 완료');

    // 스킬 템플릿 생성
    const skillTemplate1 = new SkillTemplate({
      name: '자유형 팔 동작',
      category: 'freestyle',
      level: 'beginner',
      description: '자유형의 기본 팔 동작을 배웁니다',
      practiceDrills: [
        {
          name: '벽 잡고 팔 동작 연습',
          description: '벽을 잡고 팔 동작만 연습합니다',
          youtubeUrl: 'https://youtube.com/watch?v=example1',
          duration: 10,
          difficulty: 'easy'
        }
      ],
      commonIssues: [
        {
          issue: '팔이 너무 넓게 벌어짐',
          solution: '팔을 어깨 너비로 제한하여 움직입니다',
          practiceDrill: '벽 잡고 팔 동작 연습'
        }
      ],
      createdBy: admin._id
    });
    await skillTemplate1.save();

    const skillTemplate2 = new SkillTemplate({
      name: '자유형 호흡',
      category: 'breathing',
      level: 'beginner',
      description: '자유형의 호흡법을 배웁니다',
      practiceDrills: [
        {
          name: '벽 잡고 호흡 연습',
          description: '벽을 잡고 호흡만 연습합니다',
          youtubeUrl: 'https://youtube.com/watch?v=example2',
          duration: 15,
          difficulty: 'medium'
        }
      ],
      commonIssues: [
        {
          issue: '호흡할 때 몸이 기울어짐',
          solution: '고개만 돌리고 몸은 평행을 유지합니다',
          practiceDrill: '벽 잡고 호흡 연습'
        }
      ],
      createdBy: admin._id
    });
    await skillTemplate2.save();

    console.log('🎯 스킬 템플릿 생성 완료');

    // 진도 데이터 생성
    const progress1 = new Progress({
      student: member1._id,
      instructor: instructor1._id,
      course: course1._id,
      center: center1._id,
      class: class1._id,
      evaluationDate: new Date(),
      skills: [
        {
          skillName: '자유형 팔 동작',
          status: 'learning',
          instructorNotes: '기본 동작은 잘 하지만 속도가 부족합니다',
          practiceDrills: [
            {
              name: '벽 잡고 팔 동작 연습',
              description: '벽을 잡고 팔 동작만 연습합니다',
              youtubeUrl: 'https://youtube.com/watch?v=example1'
            }
          ],
          advice: '팔 동작을 더 빠르게 연습해보세요'
        },
        {
          skillName: '자유형 호흡',
          status: 'completed',
          instructorNotes: '호흡법을 완벽하게 습득했습니다',
          practiceDrills: [],
          advice: '잘 하고 있습니다!'
        }
      ],
      overallProgress: 75,
      instructorComments: '전반적으로 잘 하고 있습니다. 팔 동작 속도를 높이면 더 좋을 것 같습니다.',
      nextGoals: [
        { goal: '팔 동작 속도 향상', targetDate: new Date('2024-02-01') }
      ]
    });
    await progress1.save();

    console.log('📊 진도 데이터 생성 완료');

    // 공지사항 생성
    const notice1 = new Notice({
      title: '2024년 1월 강습 일정 안내',
      content: '새해를 맞이하여 1월 강습 일정을 안내드립니다. 자세한 내용은 첨부파일을 참고해주세요.',
      author: admin._id,
      category: 'lesson',
      priority: 'medium',
      isPublished: true,
      publishedAt: new Date(),
      tags: ['강습', '일정', '2024']
    });
    await notice1.save();

    const notice2 = new Notice({
      title: '수영장 시설 점검 안내',
      content: '1월 15일 오후 2시부터 4시까지 시설 점검이 있을 예정입니다. 이용에 참고해주세요.',
      author: admin._id,
      category: 'facility',
      priority: 'high',
      isPublished: true,
      publishedAt: new Date(),
      tags: ['시설', '점검', '안내']
    });
    await notice2.save();

    console.log('📢 공지사항 생성 완료');

    console.log('✅ 모든 테스트 데이터 생성 완료!');
    console.log('\n📋 생성된 데이터:');
    console.log('- 사용자: 6명 (관리자 1, 강사 2, 회원 3)');
    console.log('- 수영장: 2개 (강남점, 홍대점)');
    console.log('- 강습 과정: 2개 (자유형 기초, 자유형 심화)');
    console.log('- 반: 2개 (초급 A반, 중급 B반)');
    console.log('- 스킬 템플릿: 2개');
    console.log('- 진도 데이터: 1개');
    console.log('- 공지사항: 2개');

  } catch (error) {
    console.error('❌ 테스트 데이터 생성 실패:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
  }
}

createTestData(); 