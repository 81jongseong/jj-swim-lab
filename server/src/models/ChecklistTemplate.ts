import mongoose, { Schema, Document } from 'mongoose';

export interface IChecklistTemplateItem {
  stepName: string;
  stepOrder: number;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tips?: string;
  estimatedTime?: number;
  required?: boolean;
}

export interface IChecklistTemplate extends Document {
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  items: IChecklistTemplateItem[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  version: number;
  tags: string[];
}

const checklistTemplateItemSchema = new Schema<IChecklistTemplateItem>({
  stepName: {
    type: String,
    required: true,
    trim: true
  },
  stepOrder: {
    type: Number,
    required: true,
    default: 0
  },
  category: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  tips: {
    type: String,
    trim: true
  },
  estimatedTime: {
    type: Number,
    min: 0
  },
  required: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const checklistTemplateSchema = new Schema<IChecklistTemplate>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  items: {
    type: [checklistTemplateItemSchema],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  version: {
    type: Number,
    default: 1
  },
  tags: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// 인덱스 설정
checklistTemplateSchema.index({ level: 1, category: 1 });
checklistTemplateSchema.index({ isActive: 1, createdBy: 1 });
checklistTemplateSchema.index({ tags: 1 });

export const ChecklistTemplate = mongoose.model<IChecklistTemplate>('ChecklistTemplate', checklistTemplateSchema);






