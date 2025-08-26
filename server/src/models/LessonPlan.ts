import mongoose from 'mongoose';

const lessonPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  stroke: {
    type: String,
    required: true,
    enum: ['자유형', '평영', '배영', '접영', '혼영']
  },
  level: {
    type: String,
    required: true,
    enum: ['초급', '중급', '고급']
  },
  duration: {
    type: Number, // 분 단위
    required: true,
    min: 30,
    max: 120
  },
  objectives: [{
    type: String,
    maxlength: 200
  }],
  activities: [{
    name: String,
    description: String,
    duration: Number, // 분 단위
    materials: [String]
  }],
  assessment: {
    type: String,
    maxlength: 300
  },
  notes: {
    type: String,
    maxlength: 500
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 업데이트 시 updatedAt 자동 설정
lessonPlanSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const LessonPlan = mongoose.model('LessonPlan', lessonPlanSchema);

