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
    required: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  evaluationDate: {
    type: Date,
    required: true,
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
  isActive: {
    type: Boolean,
    default: true,
  },
}, { 
  timestamps: true 
});

// 학생별 진행상황 조회를 위한 인덱스
progressSchema.index({ student: 1, course: 1, evaluationDate: -1 });

export const Progress = mongoose.model('Progress', progressSchema); 