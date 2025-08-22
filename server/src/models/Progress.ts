import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  center: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SwimmingCenter',
    required: false, // 선택적
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: false, // 선택적
  },
  type: {
    type: String,
    enum: ['progress', 'checklist', 'evaluation'],
    default: 'progress'
  },
  evaluationDate: {
    type: Date,
    required: false, // 선택적
  },
  skills: [{
    skillName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['not_started', 'learning', 'completed', 'needs_improvement'],
      default: 'not_started',
    },
    instructorNotes: {
      type: String,
      default: '',
    },
    practiceDrills: [{
      name: String,
      description: String,
      youtubeUrl: String,
    }],
    advice: {
      type: String,
      default: '',
    },
  }],
  overallProgress: {
    type: Number, // 0-100%
    default: 0,
  },
  instructorComments: {
    type: String,
    default: '',
  },
  nextGoals: [{
    goal: String,
    targetDate: Date,
  }],
  // 체크리스트 관련 필드들
  checklistItems: [{
    title: String,
    description: String,
    isCompleted: {
      type: Boolean,
      default: false
    },
    notes: String,
    completedAt: Date,
    dueDate: Date,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }],
  dueDate: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'overdue'],
    default: 'pending'
  },
  // 추가 진도 관리 필드들
  notes: String,
  completedLessons: [{
    lessonName: String,
    completedAt: Date,
    score: Number
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { 
  timestamps: true 
});

// 학생별 진행상황 조회를 위한 인덱스
progressSchema.index({ student: 1, course: 1, evaluationDate: -1 });
progressSchema.index({ instructor: 1, type: 1 });
progressSchema.index({ student: 1, type: 1 });

export const Progress = mongoose.model('Progress', progressSchema); 