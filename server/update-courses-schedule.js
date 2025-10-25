const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';

async function updateCoursesWithSchedule() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 모델 정의
    const courseSchema = new mongoose.Schema({
      name: String,
      description: String,
      level: String,
      instructorId: mongoose.Schema.Types.ObjectId,
      centerId: mongoose.Schema.Types.ObjectId,
      maxStudents: Number,
      enrolledStudents: [mongoose.Schema.Types.Mixed],
      status: String,
      price: Number,
      duration: Number,
      schedule: mongoose.Schema.Types.Mixed,
      createdAt: Date,
      updatedAt: Date
    });

    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      userType: String,
      centerId: mongoose.Schema.Types.ObjectId,
      centerAdminInfo: {
        managedCenters: [mongoose.Schema.Types.ObjectId]
      }
    });

    const Course = mongoose.model('Course', courseSchema);
    const User = mongoose.model('User', userSchema);

    // 1. 센터 관리자 확인
    const centerAdmin = await User.findOne({ 
      email: 'center-admin@jjswimlab.com',
      userType: 'center-admin'
    });
    
    if (!centerAdmin) {
      console.error('❌ center-admin@jjswimlab.com 사용자를 찾을 수 없습니다.');
      return;
    }

    const centerId = centerAdmin.centerAdminInfo?.managedCenters?.[0];
    console.log('📋 센터 관리자:', centerAdmin.name);
    console.log('📋 관리 센터 ID:', centerId);

    // 2. 해당 센터의 강습 과정 확인
    const courses = await Course.find({ centerId: centerId });
    console.log(`\n📚 센터의 강습 과정 수: ${courses.length}개`);

    // 3. 각 강습 과정에 요일 정보 추가
    const scheduleUpdates = [
      {
        name: '초급 자유형',
        schedule: {
          days: ['월', '수', '금'],
          time: '19:00-20:00',
          startDate: '2025-01-06',
          endDate: '2025-03-31'
        }
      },
      {
        name: '중급 배영',
        schedule: {
          days: ['화', '목'],
          time: '20:00-21:00',
          startDate: '2025-01-07',
          endDate: '2025-03-31'
        }
      },
      {
        name: '고급 접영',
        schedule: {
          days: ['월', '수', '금'],
          time: '21:00-22:00',
          startDate: '2025-01-06',
          endDate: '2025-03-31'
        }
      },
      {
        name: '개인 레슨',
        schedule: {
          days: ['토', '일'],
          time: '10:00-11:00',
          startDate: '2025-01-04',
          endDate: '2025-03-31'
        }
      }
    ];

    console.log('\n📅 강습 과정 요일 정보 업데이트 중...');
    
    for (const course of courses) {
      const scheduleInfo = scheduleUpdates.find(s => s.name === course.name);
      if (scheduleInfo) {
        const result = await Course.updateOne(
          { _id: course._id },
          { 
            $set: { 
              schedule: scheduleInfo.schedule,
              updatedAt: new Date()
            } 
          }
        );
        
        if (result.modifiedCount > 0) {
          console.log(`✅ ${course.name} 요일 정보 업데이트 완료`);
          console.log(`   - 요일: ${scheduleInfo.schedule.days.join(', ')}`);
          console.log(`   - 시간: ${scheduleInfo.schedule.time}`);
        } else {
          console.log(`ℹ️ ${course.name} 이미 요일 정보가 있거나 업데이트 실패`);
        }
      } else {
        console.log(`⚠️ ${course.name}에 대한 요일 정보를 찾을 수 없습니다.`);
      }
    }

    // 4. 업데이트된 강습 과정 확인
    const updatedCourses = await Course.find({ centerId: centerId });
    console.log('\n📚 업데이트된 강습 과정 목록:');
    updatedCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.name}`);
      console.log(`   - 레벨: ${course.level}`);
      console.log(`   - 최대 수강생: ${course.maxStudents}`);
      console.log(`   - 가격: ${course.price?.toLocaleString() || 0}원`);
      if (course.schedule) {
        console.log(`   - 요일: ${course.schedule.days?.join(', ') || '미설정'}`);
        console.log(`   - 시간: ${course.schedule.time || '미설정'}`);
      } else {
        console.log(`   - 요일: 미설정`);
        console.log(`   - 시간: 미설정`);
      }
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

updateCoursesWithSchedule();

