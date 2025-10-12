/**
 * 🏊 SwimLab - 간단한 샘플 회원 데이터 생성
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 간단한 User 스키마 정의
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  userType: String,
  centerId: mongoose.Schema.Types.ObjectId,
  password: String,
  isActive: Boolean,
  userId: { type: String, unique: true, sparse: true }, // userId 필드 추가
  studentInfo: {
    age: Number,
    currentLevel: String,
    swimmingLevel: String,
    healthProfile: {
      height: Number,
      weight: Number,
      chronicConditions: [String],
      allergies: [String],
      activityLevel: String
    },
    swimmingProfile: {
      css: {
        freestyle: Number,
        backstroke: Number,
        breaststroke: Number,
        butterfly: Number
      },
      mainStrokes: [String],
      excludedStrokes: [String],
      trainingDays: [Number],
      sessionsPerWeek: Number,
      sessionDuration: Number,
      currentGoal: String,
      conditionIds: [String]
    }
  },
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', userSchema);
const SwimmingCenter = mongoose.model('SwimmingCenter', new mongoose.Schema({}));

const sampleMembers = [
  // 초급 회원들
  {
    name: '김초보',
    email: 'beginner1@swimlab.com',
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
        sessionsPerWeek: 2,
        sessionDuration: 45,
        currentGoal: '기술 연마',
        conditionIds: []
      }
    }
  },
  {
    name: '이학습',
    email: 'beginner2@swimlab.com',
    userType: 'student',
    studentInfo: {
      age: 30,
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
        mainStrokes: ['freestyle', 'breaststroke'],
        excludedStrokes: ['butterfly'],
        trainingDays: [2, 4],
        sessionsPerWeek: 2,
        sessionDuration: 50,
        currentGoal: '건강 증진',
        conditionIds: ['knee_arthritis']
      }
    }
  },
  {
    name: '박중급',
    email: 'intermediate1@swimlab.com',
    userType: 'student',
    studentInfo: {
      age: 28,
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
    name: '최중급',
    email: 'intermediate2@swimlab.com',
    userType: 'student',
    studentInfo: {
      age: 32,
      currentLevel: 'intermediate',
      swimmingLevel: 'intermediate',
      healthProfile: {
        height: 165,
        weight: 58,
        chronicConditions: ['어깨 충돌 증후군'],
        allergies: [],
        activityLevel: 'moderately_active'
      },
      swimmingProfile: {
        css: {
          freestyle: 90,
          backstroke: 85,
          breaststroke: 100,
          butterfly: 0
        },
        mainStrokes: ['freestyle', 'backstroke'],
        excludedStrokes: ['butterfly', 'breaststroke'],
        trainingDays: [2, 4, 6],
        sessionsPerWeek: 3,
        sessionDuration: 55,
        currentGoal: '기술 연마',
        conditionIds: ['shoulder_impingement']
      }
    }
  },
  {
    name: '정상급',
    email: 'advanced1@swimlab.com',
    userType: 'student',
    studentInfo: {
      age: 24,
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
        trainingDays: [1, 2, 3, 4, 5, 6],
        sessionsPerWeek: 5,
        sessionDuration: 90,
        currentGoal: '실력 향상',
        conditionIds: []
      }
    }
  },
  {
    name: '한상급',
    email: 'advanced2@swimlab.com',
    userType: 'student',
    studentInfo: {
      age: 26,
      currentLevel: 'advanced',
      swimmingLevel: 'advanced',
      healthProfile: {
        height: 178,
        weight: 72,
        chronicConditions: ['허리 디스크'],
        allergies: [],
        activityLevel: 'very_active'
      },
      swimmingProfile: {
        css: {
          freestyle: 70,
          backstroke: 75,
          breaststroke: 85,
          butterfly: 80
        },
        mainStrokes: ['freestyle', 'backstroke'],
        excludedStrokes: ['butterfly', 'breaststroke'],
        trainingDays: [1, 3, 5, 6],
        sessionsPerWeek: 4,
        sessionDuration: 75,
        currentGoal: '체력 향상',
        conditionIds: ['lumbar_disc']
      }
    }
  },
  {
    name: '김마스터',
    email: 'master1@swimlab.com',
    userType: 'student',
    studentInfo: {
      age: 22,
      currentLevel: 'master',
      swimmingLevel: 'expert',
      healthProfile: {
        height: 182,
        weight: 78,
        chronicConditions: [],
        allergies: [],
        activityLevel: 'extremely_active'
      },
      swimmingProfile: {
        css: {
          freestyle: 55,
          backstroke: 58,
          breaststroke: 65,
          butterfly: 60
        },
        mainStrokes: ['freestyle', 'backstroke', 'breaststroke', 'butterfly'],
        excludedStrokes: [],
        trainingDays: [1, 2, 3, 4, 5, 6, 0],
        sessionsPerWeek: 6,
        sessionDuration: 120,
        currentGoal: '실력 향상',
        conditionIds: []
      }
    }
  },
  {
    name: '이마스터',
    email: 'master2@swimlab.com',
    userType: 'student',
    studentInfo: {
      age: 29,
      currentLevel: 'master',
      swimmingLevel: 'expert',
      healthProfile: {
        height: 175,
        weight: 68,
        chronicConditions: ['무릎 인대 손상'],
        allergies: [],
        activityLevel: 'extremely_active'
      },
      swimmingProfile: {
        css: {
          freestyle: 60,
          backstroke: 62,
          breaststroke: 70,
          butterfly: 65
        },
        mainStrokes: ['freestyle', 'backstroke', 'butterfly'],
        excludedStrokes: ['breaststroke'],
        trainingDays: [1, 2, 4, 5, 6],
        sessionsPerWeek: 5,
        sessionDuration: 100,
        currentGoal: '실력 향상',
        conditionIds: ['knee_ligament_injury']
      }
    }
  },
  {
    name: '장건강',
    email: 'healthy@swimlab.com',
    userType: 'student',
    studentInfo: {
      age: 35,
      currentLevel: 'intermediate',
      swimmingLevel: 'intermediate',
      healthProfile: {
        height: 168,
        weight: 62,
        chronicConditions: [],
        allergies: [],
        activityLevel: 'moderately_active'
      },
      swimmingProfile: {
        css: {
          freestyle: 80,
          backstroke: 85,
          breaststroke: 90,
          butterfly: 0
        },
        mainStrokes: ['freestyle', 'backstroke', 'breaststroke'],
        excludedStrokes: ['butterfly'],
        trainingDays: [1, 3, 5],
        sessionsPerWeek: 3,
        sessionDuration: 60,
        currentGoal: '건강 증진',
        conditionIds: []
      }
    }
  },
  {
    name: '오알레르기',
    email: 'allergy@swimlab.com',
    userType: 'student',
    studentInfo: {
      age: 27,
      currentLevel: 'beginner',
      swimmingLevel: 'beginner',
      healthProfile: {
        height: 172,
        weight: 66,
        chronicConditions: [],
        allergies: ['염소 알레르기'],
        activityLevel: 'lightly_active'
      },
      swimmingProfile: {
        mainStrokes: ['freestyle'],
        excludedStrokes: [],
        trainingDays: [2, 4],
        sessionsPerWeek: 2,
        sessionDuration: 45,
        currentGoal: '기술 연마',
        conditionIds: ['chlorine_allergy']
      }
    }
  },
  {
    name: '신고령',
    email: 'senior@swimlab.com',
    userType: 'student',
    studentInfo: {
      age: 65,
      currentLevel: 'beginner',
      swimmingLevel: 'beginner',
      healthProfile: {
        height: 160,
        weight: 55,
        chronicConditions: ['고혈압', '당뇨'],
        allergies: [],
        activityLevel: 'lightly_active'
      },
      swimmingProfile: {
        mainStrokes: ['freestyle', 'elementary_backstroke'],
        excludedStrokes: ['butterfly', 'breaststroke'],
        trainingDays: [2, 4, 6],
        sessionsPerWeek: 3,
        sessionDuration: 40,
        currentGoal: '건강 증진',
        conditionIds: ['hypertension', 'diabetes']
      }
    }
  },
  {
    name: '조선수',
    email: 'athlete@swimlab.com',
    userType: 'student',
    studentInfo: {
      age: 20,
      currentLevel: 'master',
      swimmingLevel: 'expert',
      healthProfile: {
        height: 190,
        weight: 85,
        chronicConditions: [],
        allergies: [],
        activityLevel: 'extremely_active'
      },
      swimmingProfile: {
        css: {
          freestyle: 50,
          backstroke: 52,
          breaststroke: 58,
          butterfly: 55
        },
        mainStrokes: ['freestyle', 'backstroke', 'breaststroke', 'butterfly'],
        excludedStrokes: [],
        trainingDays: [1, 2, 3, 4, 5, 6, 0],
        sessionsPerWeek: 7,
        sessionDuration: 150,
        currentGoal: '실력 향상',
        conditionIds: []
      }
    }
  }
];

async function createSampleMembers() {
  try {
    console.log('🏊 다양한 샘플 회원 데이터 생성 시작...');
    
    // 기존 샘플 데이터 삭제
    await User.deleteMany({ email: { $regex: '@swimlab.com' } });
    console.log('✅ 기존 샘플 데이터 삭제 완료');

    // 센터 정보 가져오기 (첫 번째 센터 사용)
    const center = await SwimmingCenter.findOne();
    if (!center) {
      console.log('❌ 센터 정보가 없습니다. 먼저 센터를 생성해주세요.');
      return;
    }

    // 회원 생성
    const createdMembers = [];
    for (let i = 0; i < sampleMembers.length; i++) {
      const memberData = sampleMembers[i];
      const member = new User({
        ...memberData,
        userId: `sample_${i + 1}`, // 고유한 userId 추가
        centerId: center._id,
        password: 'password123',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const savedMember = await member.save();
      createdMembers.push(savedMember);
      console.log(`✅ ${savedMember.name} (${savedMember.studentInfo.currentLevel}) 생성 완료`);
    }

    console.log(`\n🎉 총 ${createdMembers.length}명의 다양한 샘플 회원 생성 완료!`);
    console.log('\n📊 생성된 회원 통계:');
    
    const stats = createdMembers.reduce((acc, member) => {
      const level = member.studentInfo.currentLevel;
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    Object.entries(stats).forEach(([level, count]) => {
      console.log(`  - ${level}: ${count}명`);
    });

    console.log('\n🏥 질환 보유 회원:');
    createdMembers
      .filter(m => m.studentInfo.healthProfile.chronicConditions.length > 0)
      .forEach(m => {
        console.log(`  - ${m.name}: ${m.studentInfo.healthProfile.chronicConditions.join(', ')}`);
      });

    console.log('\n🏊‍♂️ CSS 보유 회원 (상급/마스터):');
    createdMembers
      .filter(m => m.studentInfo.swimmingProfile.css)
      .forEach(m => {
        const css = m.studentInfo.swimmingProfile.css;
        console.log(`  - ${m.name} (${m.studentInfo.currentLevel}): FR ${css.freestyle}s, BK ${css.backstroke}s, BR ${css.breaststroke}s, FL ${css.butterfly}s`);
      });

  } catch (error) {
    console.error('❌ 샘플 데이터 생성 실패:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

createSampleMembers();
