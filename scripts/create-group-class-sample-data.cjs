/**
 * 🏊 SwimLab - 단체반 샘플 데이터 생성
 * 
 * 다양한 레벨의 단체반과 회원들을 생성합니다.
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 간단한 스키마 정의
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  userType: String,
  centerId: mongoose.Schema.Types.ObjectId,
  password: String,
  isActive: Boolean,
  userId: { type: String, unique: true, sparse: true },
  studentInfo: mongoose.Schema.Types.Mixed,
  createdAt: Date,
  updatedAt: Date
});

const groupClassSchema = new mongoose.Schema({
  className: String,
  description: String,
  level: String,
  maxStudents: Number,
  currentStudents: Number,
  schedule: mongoose.Schema.Types.Mixed,
  instructor: String,
  poolLength: Number,
  status: String,
  centerId: mongoose.Schema.Types.ObjectId,
  students: [mongoose.Schema.Types.Mixed],
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', userSchema);
const SwimmingCenter = mongoose.model('SwimmingCenter', new mongoose.Schema({}));
const GroupClass = mongoose.model('GroupClass', groupClassSchema);

const groupClassData = [
  {
    className: '초급 자유형 A반',
    description: '수영을 처음 시작하는 분들을 위한 기초 자유형 클래스',
    level: 'beginner',
    maxStudents: 8,
    currentStudents: 6,
    schedule: {
      dayOfWeek: [1, 3, 5], // 월, 수, 금
      startTime: '19:00',
      endTime: '20:00',
      duration: 60
    },
    instructor: '김강사',
    poolLength: 25,
    status: 'active'
  },
  {
    className: '초급 자유형 B반',
    description: '수영을 처음 시작하는 분들을 위한 기초 자유형 클래스',
    level: 'beginner',
    maxStudents: 8,
    currentStudents: 5,
    schedule: {
      dayOfWeek: [2, 4, 6], // 화, 목, 토
      startTime: '19:00',
      endTime: '20:00',
      duration: 60
    },
    instructor: '이강사',
    poolLength: 25,
    status: 'active'
  },
  {
    className: '중급 올라운드 반',
    description: '4영법을 모두 배우는 중급 클래스',
    level: 'intermediate',
    maxStudents: 6,
    currentStudents: 4,
    schedule: {
      dayOfWeek: [1, 3, 5],
      startTime: '20:00',
      endTime: '21:00',
      duration: 60
    },
    instructor: '박강사',
    poolLength: 25,
    status: 'active'
  },
  {
    className: '상급 마스터 반',
    description: '고급 기술과 체력 향상을 위한 클래스',
    level: 'advanced',
    maxStudents: 4,
    currentStudents: 3,
    schedule: {
      dayOfWeek: [2, 4, 6],
      startTime: '20:00',
      endTime: '21:30',
      duration: 90
    },
    instructor: '정강사',
    poolLength: 50,
    status: 'active'
  },
  {
    className: '시니어 건강반',
    description: '건강 증진을 위한 고령자 전용 클래스',
    level: 'beginner',
    maxStudents: 10,
    currentStudents: 8,
    schedule: {
      dayOfWeek: [2, 4, 6],
      startTime: '10:00',
      endTime: '11:00',
      duration: 60
    },
    instructor: '최강사',
    poolLength: 25,
    status: 'active'
  }
];

const groupClassMembers = [
  // 초급 자유형 A반 회원들
  {
    name: '김초급A1',
    email: 'beginner_a1@swimlab.com',
    userType: 'student',
    studentInfo: {
      age: 25,
      currentLevel: 'beginner',
      swimmingLevel: 'beginner',
      healthProfile: {
        height: 170,
        weight: 65,
        chronicConditions: [],
        allergies: [],
        activityLevel: 'lightly_active'
      },
      swimmingProfile: {
        mainStrokes: ['freestyle'],
        excludedStrokes: [],
        trainingDays: [1, 3, 5],
        sessionsPerWeek: 3,
        sessionDuration: 60,
        currentGoal: '기술 연마',
        conditionIds: []
      }
    }
  },
  {
    name: '이초급A2',
    email: 'beginner_a2@swimlab.com',
    userType: 'student',
    studentInfo: {
      age: 28,
      currentLevel: 'beginner',
      swimmingLevel: 'beginner',
      healthProfile: {
        height: 175,
        weight: 70,
        chronicConditions: ['무릎 관절염'],
        allergies: [],
        activityLevel: 'lightly_active'
      },
      swimmingProfile: {
        mainStrokes: ['freestyle'],
        excludedStrokes: ['butterfly'],
        trainingDays: [1, 3, 5],
        sessionsPerWeek: 3,
        sessionDuration: 60,
        currentGoal: '건강 증진',
        conditionIds: ['knee_arthritis']
      }
    }
  },
  {
    name: '박초급A3',
    email: 'beginner_a3@swimlab.com',
    userType: 'student',
    studentInfo: {
      age: 30,
      currentLevel: 'beginner',
      swimmingLevel: 'beginner',
      healthProfile: {
        height: 168,
        weight: 62,
        chronicConditions: [],
        allergies: [],
        activityLevel: 'lightly_active'
      },
      swimmingProfile: {
        mainStrokes: ['freestyle'],
        excludedStrokes: [],
        trainingDays: [1, 3, 5],
        sessionsPerWeek: 3,
        sessionDuration: 60,
        currentGoal: '기술 연마',
        conditionIds: []
      }
    }
  },

  // 초급 자유형 B반 회원들
  {
    name: '최초급B1',
    email: 'beginner_b1@swimlab.com',
    userType: 'student',
    studentInfo: {
      age: 26,
      currentLevel: 'beginner',
      swimmingLevel: 'beginner',
      healthProfile: {
        height: 172,
        weight: 68,
        chronicConditions: [],
        allergies: [],
        activityLevel: 'lightly_active'
      },
      swimmingProfile: {
        mainStrokes: ['freestyle'],
        excludedStrokes: [],
        trainingDays: [2, 4, 6],
        sessionsPerWeek: 3,
        sessionDuration: 60,
        currentGoal: '기술 연마',
        conditionIds: []
      }
    }
  },
  {
    name: '정초급B2',
    email: 'beginner_b2@swimlab.com',
    userType: 'student',
    studentInfo: {
      age: 24,
      currentLevel: 'beginner',
      swimmingLevel: 'beginner',
      healthProfile: {
        height: 165,
        weight: 58,
        chronicConditions: ['어깨 충돌 증후군'],
        allergies: [],
        activityLevel: 'lightly_active'
      },
      swimmingProfile: {
        mainStrokes: ['freestyle'],
        excludedStrokes: ['butterfly'],
        trainingDays: [2, 4, 6],
        sessionsPerWeek: 3,
        sessionDuration: 60,
        currentGoal: '건강 증진',
        conditionIds: ['shoulder_impingement']
      }
    }
  },

  // 중급 올라운드 반 회원들
  {
    name: '한중급1',
    email: 'intermediate1@swimlab.com',
    userType: 'student',
    studentInfo: {
      age: 32,
      currentLevel: 'intermediate',
      swimmingLevel: 'intermediate',
      healthProfile: {
        height: 180,
        weight: 75,
        chronicConditions: [],
        allergies: [],
        activityLevel: 'moderately_active'
      },
      swimmingProfile: {
        css: {
          freestyle: 85,
          backstroke: 90,
          breaststroke: 95,
          butterfly: 0
        },
        mainStrokes: ['freestyle', 'backstroke', 'breaststroke'],
        excludedStrokes: ['butterfly'],
        trainingDays: [1, 3, 5],
        sessionsPerWeek: 3,
        sessionDuration: 60,
        currentGoal: '체력 향상',
        conditionIds: []
      }
    }
  },
  {
    name: '김중급2',
    email: 'intermediate2@swimlab.com',
    userType: 'student',
    studentInfo: {
      age: 29,
      currentLevel: 'intermediate',
      swimmingLevel: 'intermediate',
      healthProfile: {
        height: 178,
        weight: 72,
        chronicConditions: [],
        allergies: [],
        activityLevel: 'moderately_active'
      },
      swimmingProfile: {
        css: {
          freestyle: 88,
          backstroke: 92,
          breaststroke: 98,
          butterfly: 0
        },
        mainStrokes: ['freestyle', 'backstroke', 'breaststroke'],
        excludedStrokes: ['butterfly'],
        trainingDays: [1, 3, 5],
        sessionsPerWeek: 3,
        sessionDuration: 60,
        currentGoal: '기술 연마',
        conditionIds: []
      }
    }
  },

  // 상급 마스터 반 회원들
  {
    name: '이상급1',
    email: 'advanced1@swimlab.com',
    userType: 'student',
    studentInfo: {
      age: 25,
      currentLevel: 'advanced',
      swimmingLevel: 'advanced',
      healthProfile: {
        height: 185,
        weight: 80,
        chronicConditions: [],
        allergies: [],
        activityLevel: 'very_active'
      },
      swimmingProfile: {
        css: {
          freestyle: 65,
          backstroke: 70,
          breaststroke: 80,
          butterfly: 75
        },
        mainStrokes: ['freestyle', 'backstroke', 'breaststroke', 'butterfly'],
        excludedStrokes: [],
        trainingDays: [2, 4, 6],
        sessionsPerWeek: 3,
        sessionDuration: 90,
        currentGoal: '실력 향상',
        conditionIds: []
      }
    }
  },
  {
    name: '박상급2',
    email: 'advanced2@swimlab.com',
    userType: 'student',
    studentInfo: {
      age: 27,
      currentLevel: 'advanced',
      swimmingLevel: 'advanced',
      healthProfile: {
        height: 182,
        weight: 78,
        chronicConditions: [],
        allergies: [],
        activityLevel: 'very_active'
      },
      swimmingProfile: {
        css: {
          freestyle: 68,
          backstroke: 72,
          breaststroke: 82,
          butterfly: 78
        },
        mainStrokes: ['freestyle', 'backstroke', 'breaststroke', 'butterfly'],
        excludedStrokes: [],
        trainingDays: [2, 4, 6],
        sessionsPerWeek: 3,
        sessionDuration: 90,
        currentGoal: '실력 향상',
        conditionIds: []
      }
    }
  },

  // 시니어 건강반 회원들
  {
    name: '김시니어1',
    email: 'senior1@swimlab.com',
    userType: 'student',
    studentInfo: {
      age: 65,
      currentLevel: 'beginner',
      swimmingLevel: 'beginner',
      healthProfile: {
        height: 160,
        weight: 55,
        chronicConditions: ['고혈압'],
        allergies: [],
        activityLevel: 'lightly_active'
      },
      swimmingProfile: {
        mainStrokes: ['freestyle', 'elementary_backstroke'],
        excludedStrokes: ['butterfly', 'breaststroke'],
        trainingDays: [2, 4, 6],
        sessionsPerWeek: 3,
        sessionDuration: 60,
        currentGoal: '건강 증진',
        conditionIds: ['hypertension']
      }
    }
  },
  {
    name: '이시니어2',
    email: 'senior2@swimlab.com',
    userType: 'student',
    studentInfo: {
      age: 70,
      currentLevel: 'beginner',
      swimmingLevel: 'beginner',
      healthProfile: {
        height: 165,
        weight: 60,
        chronicConditions: ['당뇨', '관절염'],
        allergies: [],
        activityLevel: 'lightly_active'
      },
      swimmingProfile: {
        mainStrokes: ['freestyle', 'elementary_backstroke'],
        excludedStrokes: ['butterfly', 'breaststroke'],
        trainingDays: [2, 4, 6],
        sessionsPerWeek: 3,
        sessionDuration: 60,
        currentGoal: '건강 증진',
        conditionIds: ['diabetes', 'arthritis']
      }
    }
  }
];

async function createGroupClassData() {
  try {
    console.log('🏊 단체반 샘플 데이터 생성 시작...');
    
    // 기존 단체반 데이터 삭제
    await GroupClass.deleteMany({});
    await User.deleteMany({ email: { $regex: '@swimlab.com' } });
    console.log('✅ 기존 단체반 및 회원 데이터 삭제 완료');

    // 센터 정보 가져오기
    const center = await SwimmingCenter.findOne();
    if (!center) {
      console.log('❌ 센터 정보가 없습니다. 먼저 센터를 생성해주세요.');
      return;
    }

    // 단체반 회원 생성
    const createdMembers = [];
    for (let i = 0; i < groupClassMembers.length; i++) {
      const memberData = groupClassMembers[i];
      const member = new User({
        ...memberData,
        userId: `group_${i + 1}`, // 고유한 userId 추가
        centerId: center._id,
        password: 'password123',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const savedMember = await member.save();
      createdMembers.push(savedMember);
    }
    console.log(`✅ ${createdMembers.length}명의 단체반 회원 생성 완료`);

    // 단체반 생성 (레벨별 회원 매칭)
    const createdClasses = [];

    for (const classData of groupClassData) {
      const students = [];
      
      // 단체반 레벨에 맞는 회원만 필터링
      const matchingMembers = createdMembers.filter(member => {
        const memberLevel = member.studentInfo?.currentLevel || 'beginner';
        const classLevel = classData.level;
        
        // 레벨 매칭 로직
        if (classLevel === 'beginner' && memberLevel === 'beginner') return true;
        if (classLevel === 'intermediate' && memberLevel === 'intermediate') return true;
        if (classLevel === 'advanced' && memberLevel === 'advanced') return true;
        return false;
      });

      // 아직 반에 배정되지 않은 회원만 선택
      const availableMembers = matchingMembers.filter(member => 
        !createdClasses.some(cls => 
          cls.students.some(s => s.userId.toString() === member._id.toString())
        )
      );

      // 해당 클래스의 회원 수만큼 회원 할당
      const membersToAdd = availableMembers.slice(0, classData.currentStudents);
      
      for (const member of membersToAdd) {
        students.push({
          userId: member._id,
          status: 'active',
          joinedAt: new Date()
        });
      }

      const groupClass = new GroupClass({
        ...classData,
        centerId: center._id,
        students: students,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const savedClass = await groupClass.save();
      createdClasses.push(savedClass);
      console.log(`✅ ${savedClass.className} (${students.length}명) 생성 완료 [레벨: ${classData.level}]`);
    }

    console.log(`\n🎉 총 ${createdClasses.length}개의 단체반 생성 완료!`);
    console.log('\n📊 생성된 단체반 통계:');
    
    createdClasses.forEach(cls => {
      console.log(`  - ${cls.className}: ${cls.currentStudents}/${cls.maxStudents}명 (${cls.level})`);
      console.log(`    시간: ${cls.schedule.dayOfWeek.map(d => ['일','월','화','수','목','금','토'][d]).join(', ')} ${cls.schedule.startTime}-${cls.schedule.endTime}`);
      console.log(`    강사: ${cls.instructor}, 풀: ${cls.poolLength}m`);
    });

  } catch (error) {
    console.error('❌ 단체반 데이터 생성 실패:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

createGroupClassData();
