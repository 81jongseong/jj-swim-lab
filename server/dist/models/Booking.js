"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bookingSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    laneNumber: {
        type: Number,
        required: true,
    },
    purpose: {
        type: String,
        enum: ['practice', 'lesson', 'competition', 'other'],
        default: 'practice',
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending',
    },
    notes: {
        type: String,
        default: '',
    },
    instructor: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
    },
    course: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Course',
    },
    centerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Center',
        required: true,
    },
}, {
    timestamps: true
});
bookingSchema.index({ date: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ user: 1, date: 1 });
bookingSchema.index({ centerId: 1, date: 1, status: 1 });
bookingSchema.index({ instructorId: 1, date: 1, status: 1 });
bookingSchema.index({ courseId: 1, date: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ 'payment.status': 1 });
bookingSchema.index({ createdAt: -1 });
exports.Booking = mongoose_1.default.model('Booking', bookingSchema);
//# sourceMappingURL=Booking.js.map