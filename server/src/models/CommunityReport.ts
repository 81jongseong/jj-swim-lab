import mongoose from 'mongoose';

const communityReportSchema = new mongoose.Schema({
  targetType: { type: String, enum: ['post','comment'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['open','reviewed','dismissed'], default: 'open' },
}, { timestamps: true });

communityReportSchema.index({ targetType: 1, targetId: 1, reporter: 1 }, { unique: true });

export const CommunityReport = mongoose.model('CommunityReport', communityReportSchema);













































