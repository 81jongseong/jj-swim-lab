const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

// 스키마 직접 정의
const groupClassSchema = new mongoose.Schema({
  className: { type: String, required: true },
  centerId: { type: mongoose.Schema.Types.ObjectId, ref: 'SwimmingCenter', required: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  schedule: {
    dayOfWeek: [{ type: Number }],
    startTime: { type: String },
    endTime: { type: String },
    duration: { type: Number }
  },
  students: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    enrolledAt: { type: Date, default: Date.now },
    status: { type: String, default: 'active' }
  }],
  programs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SwimProgram' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

async function main() {
  try {
    console.log('📡 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 모델 생성
    const GroupClass = mongoose.models.GroupClass || mongoose.model('GroupClass', groupClassSchema);
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const SwimmingCenter = mongoose.models.SwimmingCenter || mongoose.model('SwimmingCenter', new mongoose.Schema({}, { strict: false }));

    // 센터 조회
    const center = await SwimmingCenter.findOne();
    if (!center) {
      throw new Error('센터를 찾을 수 없습니다.');
    }
    console.log(`📍 센터: ${center.name}`);

    // 강사 조회
    const instructor = await User.findOne({ userType: 'instructor' });
    if (!instructor) {
      throw new Error('강사를 찾을 수 없습니다.');
    }
    console.log(`👨‍🏫 강사: ${instructor.name}`);

    // 학생 조회
    const students = await User.find({ userType: 'student' }).limit(10);
    if (students.length < 3) {
      throw new Error('학생이 부족합니다. 최소 3명 필요.');
    }
    console.log(`👥 학생: ${students.length}명`);

    // 단체반 데이터
    const groupClasses = [
      {
        className: '초급 성인반 (월수금)',
        centerId: center._id,
        instructorId: instructor._id,
        schedule: {
          dayOfWeek: [1, 3, 5],
          startTime: '19:00',
          endTime: '20:00',
          duration: 60
        },
        students: students.slice(0, 5).map(s => ({
          userId: s._id,
          enrolledAt: new Date(),
          status: 'active'
        })),
        programs: []
      },
      {
        className: '중급 청소년반 (화목)',
        centerId: center._id,
        instructorId: instructor._id,
        schedule: {
          dayOfWeek: [2, 4],
          startTime: '18:00',
          endTime: '19:00',
          duration: 60
        },
        students: students.slice(5, 8).map(s => ({
          userId: s._id,
          enrolledAt: new Date(),
          status: 'active'
        })),
        programs: []
      },
      {
        className: '고급 선수반 (주5일)',
        centerId: center._id,
        instructorId: instructor._id,
        schedule: {
          dayOfWeek: [1, 2, 3, 4, 5],
          startTime: '06:00',
          endTime: '08:00',
          duration: 120
        },
        students: students.slice(8, 10).map(s => ({
          userId: s._id,
          enrolledAt: new Date(),
          status: 'active'
        })),
        programs: []
      }
    ];

    console.log('\n🎯 단체반 생성 중...');
    for (const classData of groupClasses) {
      const existing = await GroupClass.findOne({ 
        className: classData.className,
        centerId: classData.centerId
      });

      if (existing) {
        console.log(`⚠️  "${classData.className}" 이미 존재 - 건너뜀`);
        continue;
      }

      const newClass = await GroupClass.create(classData);
      console.log(`✅ "${newClass.className}" 생성 완료 (${newClass.students.length}명)`);
    }

    console.log('\n🎉 단체반 샘플 데이터 생성 완료!');
    const allClasses = await GroupClass.find({ centerId: center._id });
    console.log(`\n📋 총 ${allClasses.length}개 단체반:`);
    allClasses.forEach((c, i) => {
      console.log(`  ${i+1}. ${c.className} - ${c.students.length}명`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 MongoDB 연결 종료');
  }
}

main();
