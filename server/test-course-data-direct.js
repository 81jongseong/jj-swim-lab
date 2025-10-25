const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';

async function checkCourseData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공!');
    
    // Course 스키마 정의
    const courseSchema = new mongoose.Schema({
      name: String,
      description: String,
      level: String,
      duration: Number,
      price: Number,
      maxStudents: Number,
      instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      instructorId: mongoose.Schema.Types.ObjectId,
      instructorName: String,
      centerId: mongoose.Schema.Types.ObjectId,
      schedule: [{
        day: String,
        startTime: String,
        endTime: String
      }],
      tags: [String],
      poolType: String,
      lanes: [Number],
      isActive: { type: Boolean, default: true }
    });
    
    const Course = mongoose.model('Course', courseSchema);
    
    // 수정된 강습 과정 확인
    const course = await Course.findById('68fb24ce93a6078f2bc6697b');
    
    console.log('📋 강습 과정 정보:');
    console.log('  - 이름:', course?.name);
    console.log('  - instructor:', course?.instructor);
    console.log('  - instructorId:', course?.instructorId);
    console.log('  - instructorName:', course?.instructorName);
    console.log('  - centerId:', course?.centerId);
    console.log('  - poolType:', course?.poolType);
    console.log('  - lanes:', course?.lanes);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ 오류:', error);
  }
}

checkCourseData();


