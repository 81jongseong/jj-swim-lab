const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://jjswimlab:jjswimlab123@cluster0.mongodb.net/jj-swim-lab');

// 체크리스트 모델 정의
const ChecklistSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teachingMethodId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeachingMethod', required: true },
  items: [{
    teachingMethodId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeachingMethod' },
    stepName: { type: String, required: true },
    stepOrder: { type: Number, required: true, default: 0 },
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
    category: String,
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    tips: String,
    notes: String,
    instructorNotes: String
  }],
  overallProgress: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  startDate: { type: Date, default: Date.now },
  targetCompletionDate: Date,
  status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
  notes: String
}, { timestamps: true });

const Checklist = mongoose.model('Checklist', ChecklistSchema);

async function checkChecklist() {
  try {
    console.log('🔍 체크리스트 데이터 확인 중...');
    
    // 모든 체크리스트 조회
    const allChecklists = await Checklist.find({});
    console.log(`📊 총 체크리스트 수: ${allChecklists.length}`);
    
    if (allChecklists.length > 0) {
      console.log('\n📋 체크리스트 목록:');
      allChecklists.forEach((checklist, index) => {
        console.log(`\n${index + 1}. 체크리스트 ID: ${checklist._id}`);
        console.log(`   학생 ID: ${checklist.studentId}`);
        console.log(`   과정 ID: ${checklist.courseId}`);
        console.log(`   강사 ID: ${checklist.instructorId}`);
        console.log(`   강습법 ID: ${checklist.teachingMethodId}`);
        console.log(`   아이템 수: ${checklist.items.length}`);
        console.log(`   상태: ${checklist.status}`);
        console.log(`   생성일: ${checklist.createdAt}`);
      });
    }
    
    // 특정 학생/과정 조합으로 체크리스트 조회
    const studentId = '507f1f77bcf86cd799439012';
    const courseId = '507f1f77bcf86cd799439011';
    
    console.log(`\n🔍 특정 조합으로 체크리스트 조회: ${studentId} / ${courseId}`);
    const specificChecklist = await Checklist.findOne({ studentId, courseId });
    
    if (specificChecklist) {
      console.log('✅ 체크리스트 발견!');
      console.log(`   ID: ${specificChecklist._id}`);
      console.log(`   아이템 수: ${specificChecklist.items.length}`);
      console.log(`   아이템들:`, specificChecklist.items.map(item => ({
        stepName: item.stepName,
        stepOrder: item.stepOrder,
        isCompleted: item.isCompleted
      })));
    } else {
      console.log('❌ 체크리스트를 찾을 수 없습니다.');
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkChecklist();
