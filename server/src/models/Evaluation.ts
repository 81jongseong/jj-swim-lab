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
    required: false, // 선택적
  },
  courseEndDate: {
    type: Date,
    required: false, // 선택적
  },
  evaluationDate: {
    type: Date,
    default: Date.now,
  },
  // 강사가 학생을 평가하는 필드들
  skills: {
    freestyle: {
      type: Number,
      min: 1,
      max: 5,
      default: 0
    },
    backstroke: {
      type: Number,
      min: 1,
      max: 5,
      default: 0
    },
    breaststroke: {
      type: Number,
      min: 1,
      max: 5,
      default: 0
    },
    butterfly: {
      type: Number,
      min: 1,
      max: 5,
      default: 0
    },
    diving: {
      type: Number,
      min: 1,
      max: 5,
      default: 0
    },
    turns: {
      type: Number,
      min: 1,
      max: 5,
      default: 0
    }
  },
  attitude: {
    type: Number,
    min: 1,
    max: 5,
    default: 0
  },
  effort: {
    type: Number,
    min: 1,
    max: 5,
    default: 0
  },
  overallRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 0
  },
  // 학생이 강사를 평가하는 필드들 (기존)
  ratings: {
    instructorTeaching: {
      type: Number,
      min: 1,
      max: 5,
      required: false, // 선택적
    },
    courseContent: {
      type: Number,
      min: 1,
      max: 5,
      required: false, // 선택적
    },
    facilityQuality: {
      type: Number,
      min: 1,
      max: 5,
      required: false, // 선택적
    },
    overallSatisfaction: {
      type: Number,
      min: 1,
      max: 5,
      required: false, // 선택적
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
  // 강사 평가 코멘트
  instructorComments: {
    type: String,
    default: ''
  },
  recommendations: {
    type: String,
    default: ''
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  isSubmitted: {
    type: Boolean,
    default: false,
  },
  // 평가 유형 구분
  evaluationType: {
    type: String,
    enum: ['student_to_instructor', 'instructor_to_student', 'mutual'],
    default: 'mutual'
  }
}, { 
  timestamps: true 
});

// 평가 제출 기간 체크 (강습 종료 후 10일)
evaluationSchema.methods.isWithinEvaluationPeriod = function() {
  if (!this.courseEndDate) return true; // 강사 평가는 기간 제한 없음
  
  const now = new Date();
  const endDate = new Date(this.courseEndDate);
  const evaluationDeadline = new Date(endDate.getTime() + (10 * 24 * 60 * 60 * 1000)); // 10일 후
  
  return now <= evaluationDeadline;
};

// 학생별 평가 조회를 위한 인덱스
evaluationSchema.index({ student: 1, course: 1, evaluationDate: -1 });
evaluationSchema.index({ instructor: 1, course: 1, evaluationDate: -1 });
evaluationSchema.index({ evaluationType: 1 });

export const Evaluation = mongoose.model('Evaluation', evaluationSchema); 