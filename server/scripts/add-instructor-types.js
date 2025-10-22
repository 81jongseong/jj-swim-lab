/**
 * 기존 강사 데이터에 instructorType 필드 추가 스크립트
 */

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');

async function addInstructorTypes() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI 환경 변수가 설정되지 않았습니다.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공\n');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    // 모든 강사 조회
    console.log('🔍 모든 강사 조회 중...');
    const instructors = await User.find({ userType: 'instructor' });
    console.log(`📋 총 ${instructors.length}명의 강사 발견\n`);

    let updatedCount = 0;

    for (const instructor of instructors) {
      const hasInstructorType = instructor.instructorInfo?.instructorType;
      
      if (!hasInstructorType) {
        console.log(`📝 ${instructor.name} (${instructor.userId}) - instructorType 추가 중...`);
        
        // instructorInfo가 없으면 초기화
        if (!instructor.instructorInfo) {
          instructor.instructorInfo = {};
        }
        
        // 기본값: 'instructor' (강습 강사)
        // 이름이나 자격증에 '안전', '구조', 'lifeguard'가 포함되면 'lifeguard'
        const isLifeguard = 
          instructor.name.includes('안전') ||
          instructor.name.includes('구조') ||
          (instructor.instructorInfo.certifications || []).some(cert => 
            cert.includes('안전') || cert.includes('구조') || cert.includes('lifeguard')
          );
        
        instructor.instructorInfo.instructorType = isLifeguard ? 'lifeguard' : 'instructor';
        
        await instructor.save();
        
        console.log(`  ✅ ${instructor.name} → ${instructor.instructorInfo.instructorType === 'lifeguard' ? '🛟 안전요원' : '🏊 강습강사'}`);
        updatedCount++;
      } else {
        console.log(`  ⏭️ ${instructor.name} - 이미 설정됨 (${hasInstructorType})`);
      }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`🎉 작업 완료!`);
    console.log(`${'='.repeat(50)}`);
    console.log(`📊 총 ${instructors.length}명 중 ${updatedCount}명 업데이트됨`);
    
    // 통계 출력
    const instructorCount = await User.countDocuments({ 
      userType: 'instructor',
      'instructorInfo.instructorType': 'instructor'
    });
    const lifeguardCount = await User.countDocuments({ 
      userType: 'instructor',
      'instructorInfo.instructorType': 'lifeguard'
    });
    
    console.log(`\n📊 강사 종류별 통계:`);
    console.log(`  🏊 강습 강사: ${instructorCount}명`);
    console.log(`  🛟 안전 요원: ${lifeguardCount}명`);

  } catch (error) {
    console.error('\n💥 오류 발생:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

addInstructorTypes();

