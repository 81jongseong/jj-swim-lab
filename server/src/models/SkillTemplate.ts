import mongoose from 'mongoose';

const skillTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'diving', 'turning', 'breathing', 'endurance', 'technique'],
    required: true,
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  practiceDrills: [{
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    youtubeUrl: {
      type: String,
    },
    duration: {
      type: Number, // 분 단위
      default: 10,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
  }],
  commonIssues: [{
    issue: {
      type: String,
      required: true,
    },
    solution: {
      type: String,
      required: true,
    },
    practiceDrill: {
      type: String,
    },
  }],
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillTemplate',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { 
  timestamps: true 
});

// 카테고리별 스킬 조회를 위한 인덱스
skillTemplateSchema.index({ category: 1, level: 1, isActive: 1 });

export const SkillTemplate = mongoose.models.SkillTemplate || mongoose.model('SkillTemplate', skillTemplateSchema); 