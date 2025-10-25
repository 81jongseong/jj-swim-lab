const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';

async function createTestMembersAndInstructors() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 모델 정의
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      phone: String,
      userType: String,
      studentInfo: {
        level: String,
        emergencyContact: {
          name: String,
          phone: String,
          relationship: String
        },
        medicalInfo: {
          hasConditions: Boolean,
          conditions: [String],
          medications: [String],
          allergies: [String]
        }
      },
      instructorInfo: {
        specialties: [String],
        certifications: [String],
        experience: Number,
        bio: String,
        hourlyRate: Number
      },
      centerAdminInfo: {
        managedCenters: [mongoose.Schema.Types.ObjectId],
        permissions: [String],
        role: String
      },
      isActive: Boolean,
      createdAt: Date,
      updatedAt: Date
    });

    const centerSchema = new mongoose.Schema({
      name: String,
      email: String
    });

    const User = mongoose.model('User', userSchema);
    const Center = mongoose.model('Center', centerSchema);

    // 1. center-admin@jjswimlab.com 사용자 찾기
    const centerAdmin = await User.findOne({ 
      email: 'center-admin@jjswimlab.com',
      userType: 'center-admin'
    });
    
    if (!centerAdmin) {
      console.error('❌ center-admin@jjswimlab.com 사용자를 찾을 수 없습니다.');
      return;
    }

    console.log('📋 센터 관리자:', centerAdmin.name, '- 관리 센터:', centerAdmin.centerAdminInfo.managedCenters);

    // 2. 관리하는 센터 정보 가져오기
    const managedCenter = await Center.findById(centerAdmin.centerAdminInfo.managedCenters[0]);
    if (!managedCenter) {
      console.error('❌ 관리하는 센터를 찾을 수 없습니다.');
      return;
    }

    console.log('📋 관리 센터:', managedCenter.name, '- ID:', managedCenter._id);

    // 3. 테스트 회원들 생성
    const testMembers = [
      {
        name: '김철수',
        email: 'kimcheolsu@test.com',
        phone: '010-1111-1111',
        userType: 'student',
        studentInfo: {
          level: 'beginner',
          emergencyContact: {
            name: '김영희',
            phone: '010-2222-2222',
            relationship: '어머니'
          },
          medicalInfo: {
            hasConditions: false,
            conditions: [],
            medications: [],
            allergies: []
          }
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '이영희',
        email: 'leeyounghee@test.com',
        phone: '010-3333-3333',
        userType: 'student',
        studentInfo: {
          level: 'intermediate',
          emergencyContact: {
            name: '이민수',
            phone: '010-4444-4444',
            relationship: '아버지'
          },
          medicalInfo: {
            hasConditions: true,
            conditions: ['천식'],
            medications: ['흡입기'],
            allergies: ['꽃가루']
          }
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '박민수',
        email: 'parkminsu@test.com',
        phone: '010-5555-5555',
        userType: 'student',
        studentInfo: {
          level: 'advanced',
          emergencyContact: {
            name: '박순희',
            phone: '010-6666-6666',
            relationship: '어머니'
          },
          medicalInfo: {
            hasConditions: false,
            conditions: [],
            medications: [],
            allergies: []
          }
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '정수진',
        email: 'jeongsujin@test.com',
        phone: '010-7777-7777',
        userType: 'student',
        studentInfo: {
          level: 'beginner',
          emergencyContact: {
            name: '정대호',
            phone: '010-8888-8888',
            relationship: '아버지'
          },
          medicalInfo: {
            hasConditions: false,
            conditions: [],
            medications: [],
            allergies: []
          }
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '최동현',
        email: 'choidonghyun@test.com',
        phone: '010-9999-9999',
        userType: 'student',
        studentInfo: {
          level: 'intermediate',
          emergencyContact: {
            name: '최미영',
            phone: '010-0000-0000',
            relationship: '어머니'
          },
          medicalInfo: {
            hasConditions: false,
            conditions: [],
            medications: [],
            allergies: []
          }
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // 4. 테스트 강사들 생성
    const testInstructors = [
      {
        name: '강민호',
        email: 'kangminho@instructor.com',
        phone: '010-1234-5678',
        userType: 'instructor',
        instructorInfo: {
          specialties: ['자유형', '배영'],
          certifications: ['수영지도사 1급', '생존수영지도사'],
          experience: 5,
          bio: '5년 경력의 전문 수영 강사입니다. 초보자부터 고급자까지 체계적인 지도를 제공합니다.',
          hourlyRate: 50000
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '서지영',
        email: 'seojiyoung@instructor.com',
        phone: '010-2345-6789',
        userType: 'instructor',
        instructorInfo: {
          specialties: ['평영', '접영'],
          certifications: ['수영지도사 2급', '아쿠아필라테스지도사'],
          experience: 3,
          bio: '아쿠아필라테스 전문 강사로 수영과 필라테스를 결합한 수업을 제공합니다.',
          hourlyRate: 45000
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '윤태준',
        email: 'yuntaejun@instructor.com',
        phone: '010-3456-7890',
        userType: 'instructor',
        instructorInfo: {
          specialties: ['자유형', '배영', '평영'],
          certifications: ['수영지도사 1급', '생존수영지도사', '수상안전요원'],
          experience: 8,
          bio: '8년 경력의 베테랑 강사입니다. 생존수영과 안전교육에 특화되어 있습니다.',
          hourlyRate: 60000
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // 5. 회원들 생성
    console.log('\n👥 테스트 회원들 생성 중...');
    const createdMembers = [];
    for (const memberData of testMembers) {
      // 비밀번호 해시화
      const hashedPassword = await bcrypt.hash('test123', 10);
      
      const newMember = new User({
        ...memberData,
        password: hashedPassword
      });

      try {
        const savedMember = await newMember.save();
        createdMembers.push(savedMember);
        console.log(`✅ 회원 생성: ${savedMember.name} (${savedMember.email})`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`ℹ️ 회원 이미 존재: ${memberData.name} (${memberData.email})`);
        } else {
          console.error(`❌ 회원 생성 실패: ${memberData.name}`, error.message);
        }
      }
    }

    // 6. 강사들 생성
    console.log('\n👨‍🏫 테스트 강사들 생성 중...');
    const createdInstructors = [];
    for (const instructorData of testInstructors) {
      // 비밀번호 해시화
      const hashedPassword = await bcrypt.hash('instructor123', 10);
      
      const newInstructor = new User({
        ...instructorData,
        password: hashedPassword
      });

      try {
        const savedInstructor = await newInstructor.save();
        createdInstructors.push(savedInstructor);
        console.log(`✅ 강사 생성: ${savedInstructor.name} (${savedInstructor.email})`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`ℹ️ 강사 이미 존재: ${instructorData.name} (${instructorData.email})`);
        } else {
          console.error(`❌ 강사 생성 실패: ${instructorData.name}`, error.message);
        }
      }
    }

    console.log('\n📊 생성 결과:');
    console.log(`- 회원: ${createdMembers.length}명 생성`);
    console.log(`- 강사: ${createdInstructors.length}명 생성`);
    console.log(`- 관리 센터: ${managedCenter.name}`);

    console.log('\n🔑 테스트 계정 정보:');
    console.log('회원 비밀번호: test123');
    console.log('강사 비밀번호: instructor123');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

createTestMembersAndInstructors();

