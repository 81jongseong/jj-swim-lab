/**
 * 데이터베이스의 모든 레벨을 한글로 변환하는 스크립트
 * Course와 User의 모든 영어/숫자 레벨을 센터 레벨 체계로 변환
 */

const mongoose = require('mongoose');
require('dotenv').config();
const { Course } = require('./dist/models/Course');
const { User } = require('./dist/models/User');

const LEVEL_MAPPING = {
  // 숫자 레벨
  'level1': '초급',
  'level2': '중급',
  'level3': '고급',
  'level4': '전문가',
  'level5': '마스터',
  
  // 영어 레벨
  'beginner': '초급',
  'intermediate': '중급',
  'advanced': '고급',
  'expert': '전문가',
  'master': '마스터',
  'all': '전체'
};

async function convertLevels() {
  try {
    console.log('🔌 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 1. Course 레벨 변환
    console.log('\n📚 Course 레벨 변환 시작...');
    const courses = await Course.find({});
    console.log(`총 ${courses.length}개의 과정 발견`);
    
    let courseUpdateCount = 0;
    for (const course of courses) {
      const oldLevel = course.level;
      const newLevel = LEVEL_MAPPING[oldLevel] || oldLevel;
      
      if (newLevel !== oldLevel) {
        course.level = newLevel;
        await course.save();
        console.log(`✅ "${course.name}" 레벨 변환: "${oldLevel}" -> "${newLevel}"`);
        courseUpdateCount++;
      }
    }
    console.log(`✅ Course 레벨 변환 완료: ${courseUpdateCount}개 업데이트`);

    // 2. User 레벨 변환
    console.log('\n👥 User 레벨 변환 시작...');
    const users = await User.find({});
    console.log(`총 ${users.length}명의 사용자 발견`);
    
    let userUpdateCount = 0;
    for (const user of users) {
      let updated = false;
      const updates = {};
      
      // studentInfo.level 변환
      if (user.studentInfo?.level) {
        const oldLevel = user.studentInfo.level;
        const newLevel = LEVEL_MAPPING[oldLevel] || oldLevel;
        if (newLevel !== oldLevel) {
          updates['studentInfo.level'] = newLevel;
          console.log(`  📝 ${user.name} - studentInfo.level: "${oldLevel}" -> "${newLevel}"`);
          updated = true;
        }
      }
      
      // studentInfo.currentLevel 변환
      if (user.studentInfo?.currentLevel) {
        const oldLevel = user.studentInfo.currentLevel;
        const newLevel = LEVEL_MAPPING[oldLevel] || oldLevel;
        if (newLevel !== oldLevel) {
          updates['studentInfo.currentLevel'] = newLevel;
          console.log(`  📝 ${user.name} - studentInfo.currentLevel: "${oldLevel}" -> "${newLevel}"`);
          updated = true;
        }
      }
      
      // studentInfo.swimmingLevel 변환
      if (user.studentInfo?.swimmingLevel) {
        const oldLevel = user.studentInfo.swimmingLevel;
        const newLevel = LEVEL_MAPPING[oldLevel] || oldLevel;
        if (newLevel !== oldLevel) {
          updates['studentInfo.swimmingLevel'] = newLevel;
          console.log(`  📝 ${user.name} - studentInfo.swimmingLevel: "${oldLevel}" -> "${newLevel}"`);
          updated = true;
        }
      }
      
      // user.level 변환
      if (user.level) {
        const oldLevel = user.level;
        const newLevel = LEVEL_MAPPING[oldLevel] || oldLevel;
        if (newLevel !== oldLevel) {
          updates['level'] = newLevel;
          console.log(`  📝 ${user.name} - level: "${oldLevel}" -> "${newLevel}"`);
          updated = true;
        }
      }
      
      if (updated) {
        await User.findByIdAndUpdate(user._id, { $set: updates });
        userUpdateCount++;
      }
    }
    
    console.log(`✅ User 레벨 변환 완료: ${userUpdateCount}명 업데이트`);
    
    // 3. studentInfo.enrolledCourses와 completedCourses 내부 레벨 변환
    console.log('\n📋 수강 이력 레벨 변환 시작...');
    let enrollmentUpdateCount = 0;
    
    for (const user of users) {
      if (user.studentInfo?.enrolledCourses && Array.isArray(user.studentInfo.enrolledCourses)) {
        let needsUpdate = false;
        const updatedEnrolledCourses = user.studentInfo.enrolledCourses.map(course => {
          if (course.level) {
            const newLevel = LEVEL_MAPPING[course.level] || course.level;
            if (newLevel !== course.level) {
              needsUpdate = true;
              console.log(`  📝 ${user.name} - enrolledCourse 레벨: "${course.level}" -> "${newLevel}"`);
              return { ...course.toObject(), level: newLevel };
            }
          }
          return course;
        });
        
        if (needsUpdate) {
          await User.findByIdAndUpdate(user._id, { 
            $set: { 'studentInfo.enrolledCourses': updatedEnrolledCourses }
          });
          enrollmentUpdateCount++;
        }
      }
      
      if (user.studentInfo?.completedCourses && Array.isArray(user.studentInfo.completedCourses)) {
        let needsUpdate = false;
        const updatedCompletedCourses = user.studentInfo.completedCourses.map(course => {
          if (course.level) {
            const newLevel = LEVEL_MAPPING[course.level] || course.level;
            if (newLevel !== course.level) {
              needsUpdate = true;
              console.log(`  📝 ${user.name} - completedCourse 레벨: "${course.level}" -> "${newLevel}"`);
              return { ...course.toObject(), level: newLevel };
            }
          }
          return course;
        });
        
        if (needsUpdate) {
          await User.findByIdAndUpdate(user._id, { 
            $set: { 'studentInfo.completedCourses': updatedCompletedCourses }
          });
          enrollmentUpdateCount++;
        }
      }
    }
    
    console.log(`✅ 수강 이력 레벨 변환 완료: ${enrollmentUpdateCount}개 업데이트`);
    
    console.log('\n🎉 모든 레벨 변환 완료!');
    console.log(`📊 통계:`);
    console.log(`   - Course 변환: ${courseUpdateCount}개`);
    console.log(`   - User 변환: ${userUpdateCount}명`);
    console.log(`   - 수강 이력 변환: ${enrollmentUpdateCount}개`);
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB 연결 종료');
    process.exit(0);
  }
}

convertLevels();

