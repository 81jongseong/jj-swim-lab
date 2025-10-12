/**
 * 개인 PT 회원 샘플 데이터 생성 스크립트
 * (단체반에 속하지 않은 1:1 레슨 회원)
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

// 간단한 스키마 정의
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const swimmingCenterSchema = new mongoose.Schema({}, { strict: false });
const SwimmingCenter = mongoose.model('SwimmingCenter', swimmingCenterSchema);

const individualPTMembers = [
  {
    name: '최개인PT1',
    email: 'pt1@swimlab.com',
    userType: 'student',
    studentInfo: {
      age: 28,
      currentLevel: 'intermediate',
      swimmingLevel: 'intermediate',
      healthProfile: {
        height: 172,
        weight: 68,
        chronicConditions: [],
        allergies: [],
        activityLevel: 'active'
      },
      swimmingProfile: {
        css: {
          freestyle: 85,
          backstroke: 92,
          breaststroke: 98,
          butterfly: 0
        },
        mainStrokes: ['freestyle', 'backstroke'],
        excludedStrokes: ['butterfly'],
        trainingDays: [1, 3, 5],
        sessionsPerWeek: 3,
        sessionDuration: 60,
        poolLength: 25,
        currentGoal: '기술 개선',
        conditionIds: []
      }
    }
  },
  {
    name: '정개인PT2',
    email: 'pt2@swimlab.com',
    userType: 'student',
    studentInfo: {
      age: 32,
      currentLevel: 'advanced',
      swimmingLevel: 'advanced',
      healthProfile: {
        height: 178,
        weight: 75,
        chronicConditions: ['shoulder_impingement'],
        allergies: [],
        activityLevel: 'very_active'
      },
      swimmingProfile: {
        css: {
          freestyle: 72,
          backstroke: 76,
          breaststroke: 85,
          butterfly: 80
        },
        mainStrokes: ['freestyle', 'backstroke'],
        excludedStrokes: [],
        trainingDays: [1, 3, 5],
        sessionsPerWeek: 3,
        sessionDuration: 90,
        poolLength: 50,
        currentGoal: '실력 향상',
        conditionIds: ['shoulder_impingement']
      }
    }
  },
  {
    name: '강개인PT3',
    email: 'pt3@swimlab.com',
    userType: 'student',
    studentInfo: {
      age: 45,
      currentLevel: 'beginner',
      swimmingLevel: 'beginner',
      healthProfile: {
        height: 165,
        weight: 72,
        chronicConditions: ['knee_pain'],
        allergies: [],
        activityLevel: 'lightly_active'
      },
      swimmingProfile: {
        mainStrokes: ['freestyle'],
        excludedStrokes: ['breaststroke'],
        trainingDays: [2, 4],
        sessionsPerWeek: 2,
        sessionDuration: 45,
        poolLength: 25,
        currentGoal: '건강 증진',
        conditionIds: ['knee_pain']
      }
    }
  }
];

async function createIndividualPTMembers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공\n');

    // 센터 정보 가져오기
    const center = await SwimmingCenter.findOne();
    if (!center) {
      console.log('❌ 센터 정보가 없습니다.');
      return;
    }

    console.log('🏊 개인 PT 회원 샘플 데이터 생성 시작...\n');

    // 기존 개인 PT 회원 삭제
    await User.deleteMany({ email: { $regex: '@swimlab.com$' }, userId: { $regex: /^pt_/ } });
    console.log('✅ 기존 개인 PT 회원 데이터 삭제 완료\n');

    // 개인 PT 회원 생성
    const createdMembers = [];
    for (let i = 0; i < individualPTMembers.length; i++) {
      const memberData = individualPTMembers[i];
      const member = new User({
        ...memberData,
        userId: `pt_${i + 1}`,
        centerId: center._id,
        password: 'password123',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const savedMember = await member.save();
      createdMembers.push(savedMember);
      console.log(`✅ ${savedMember.name} (레벨: ${savedMember.studentInfo.currentLevel}) 생성 완료`);
    }

    console.log(`\n🎉 총 ${createdMembers.length}명의 개인 PT 회원 생성 완료!`);
    console.log('\n📊 생성된 회원:');
    createdMembers.forEach(m => {
      console.log(`  - ${m.name} (${m.studentInfo.currentLevel})`);
      const css = m.studentInfo?.swimmingProfile?.css;
      if (css && css.freestyle > 0) {
        console.log(`    CSS: ${css.freestyle}초/100m`);
      }
    });

  } catch (error) {
    console.error('❌ 개인 PT 회원 생성 실패:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

createIndividualPTMembers();








