import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema({
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
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  courseEndDate: {
    type: Date,
    required: true,
  },
  evaluationDate: {
    type: Date,
    default: Date.now,
  },
  ratings: {
    instructorTeaching: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    courseContent: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    facilityQuality: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    overallSatisfaction: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
  },
  comments: {
    strengths: {
      type: String,
      default: '',
    },
    improvements: {
      type: String,
      default: '',
    },
    additionalComments: {
      type: String,
      default: '',
    },
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  isSubmitted: {
    type: Boolean,
    default: false,
  },
}, { 
  timestamps: true 
});

// 평가 제출 기간 체크 (강습 종료 후 10일)
evaluationSchema.methods.isWithinEvaluationPeriod = function() {
  const now = new Date();
  const endDate = new Date(this.courseEndDate);
  const evaluationDeadline = new Date(endDate.getTime() + (10 * 24 * 60 * 60 * 1000)); // 10일 후
  
  return now <= evaluationDeadline;
};

// 학생별 평가 조회를 위한 인덱스
evaluationSchema.index({ student: 1, course: 1, evaluationDate: -1 });

export const Evaluation = mongoose.model('Evaluation', evaluationSchema); 