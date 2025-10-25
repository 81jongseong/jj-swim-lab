"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CenterSchedule = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const centerScheduleSchema = new mongoose_1.default.Schema({
    centerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'SwimmingCenter',
        required: true,
    },
    operatingHours: {
        weekdays: {
            isOpen: { type: Boolean, default: true },
            openTime: { type: String, default: '06:00' },
            closeTime: { type: String, default: '22:00' },
            breaks: [{
                    startTime: String,
                    endTime: String,
                    reason: String
                }]
        },
        weekends: {
            isOpen: { type: Boolean, default: true },
            openTime: { type: String, default: '08:00' },
            closeTime: { type: String, default: '20:00' },
            breaks: [{
                    startTime: String,
                    endTime: String,
                    reason: String
                }]
        },
        holidays: {
            isOpen: { type: Boolean, default: false },
            openTime: { type: String, default: '09:00' },
            closeTime: { type: String, default: '18:00' },
            breaks: [{
                    startTime: String,
                    endTime: String,
                    reason: String
                }]
        }
    },
    personalLessonSettings: {
        isAvailable: { type: Boolean, default: true },
        availableDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
        timeSlots: [{
                startTime: String,
                endTime: String,
                isActive: { type: Boolean, default: true },
                maxLessons: { type: Number, default: 1 },
                instructorCapacity: { type: Number, default: 1 },
                poolType: { type: String, enum: ['mainPool', 'kidsPool', 'auxiliaryPool'], default: 'mainPool' },
                price: { type: Number, default: 0 },
                notes: { type: String, default: '' }
            }],
        advanceBookingDays: { type: Number, default: 7 },
        cancellationHours: { type: Number, default: 24 },
        lessonDuration: { type: Number, default: 60 },
        bufferTime: { type: Number, default: 15 },
        slotInterval: { type: Number, default: 60 }
    },
    laneRentalSettings: {
        isAvailable: { type: Boolean, default: true },
        availableDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
        timeSlots: [{
                startTime: String,
                endTime: String,
                isActive: { type: Boolean, default: true },
                maxRentals: { type: Number, default: 1 },
                poolType: { type: String, enum: ['mainPool', 'kidsPool', 'auxiliaryPool'], default: 'mainPool' },
                hourlyRate: { type: Number, default: 0 },
                notes: { type: String, default: '' }
            }],
        advanceBookingDays: { type: Number, default: 14 },
        cancellationHours: { type: Number, default: 48 },
        minRentalDuration: { type: Number, default: 60 },
        maxRentalDuration: { type: Number, default: 240 },
        bufferTime: { type: Number, default: 30 },
        slotInterval: { type: Number, default: 60 }
    },
    instructorAvailability: [{
            instructorId: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            instructorName: { type: String, required: true },
            instructorType: {
                type: String,
                enum: ['instructor', 'lifeguard'],
                default: 'instructor'
            },
            availableDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
            timeSlots: [{
                    startTime: String,
                    endTime: String,
                    maxStudents: { type: Number, default: 1 },
                    lessonTypes: [{ type: String, enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'private', 'group'] }],
                    poolType: { type: String, enum: ['mainPool', 'kidsPool', 'auxiliaryPool'], default: 'mainPool' },
                    isActive: { type: Boolean, default: true },
                    price: { type: Number, default: 0 },
                    skillLevels: [{ type: String }],
                    notes: { type: String, default: '' },
                    currentBookings: { type: Number, default: 0 }
                }],
            weeklySchedule: {
                monday: [{ startTime: String, endTime: String, isAvailable: { type: Boolean, default: true } }],
                tuesday: [{ startTime: String, endTime: String, isAvailable: { type: Boolean, default: true } }],
                wednesday: [{ startTime: String, endTime: String, isAvailable: { type: Boolean, default: true } }],
                thursday: [{ startTime: String, endTime: String, isAvailable: { type: Boolean, default: true } }],
                friday: [{ startTime: String, endTime: String, isAvailable: { type: Boolean, default: true } }],
                saturday: [{ startTime: String, endTime: String, isAvailable: { type: Boolean, default: true } }],
                sunday: [{ startTime: String, endTime: String, isAvailable: { type: Boolean, default: true } }]
            },
            isActive: { type: Boolean, default: true },
            lastUpdated: { type: Date, default: Date.now }
        }],
    laneAvailability: [{
            poolType: { type: String, enum: ['mainPool', 'kidsPool', 'auxiliaryPool'], required: true },
            laneNumber: { type: Number, required: true },
            isAvailable: { type: Boolean, default: true },
            maintenanceSchedule: [{
                    startDate: Date,
                    endDate: Date,
                    reason: String,
                    isRecurring: { type: Boolean, default: false },
                    recurringPattern: String
                }],
            restrictions: [{
                    startTime: String,
                    endTime: String,
                    days: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
                    reason: String
                }]
        }],
    specialSchedules: [{
            date: Date,
            type: { type: String, enum: ['holiday', 'event', 'maintenance', 'closure'], required: true },
            title: String,
            description: String,
            isOpen: { type: Boolean, default: false },
            openTime: String,
            closeTime: String,
            affectedServices: [{ type: String, enum: ['personalLesson', 'laneRental', 'all'] }]
        }],
    settings: {
        timeZone: { type: String, default: 'Asia/Seoul' },
        currency: { type: String, default: 'KRW' },
        language: { type: String, default: 'ko' },
        autoConfirm: { type: Boolean, default: false },
        requireApproval: { type: Boolean, default: true },
        maxConcurrentBookings: { type: Number, default: 10 },
        notificationSettings: {
            emailNotifications: { type: Boolean, default: true },
            smsNotifications: { type: Boolean, default: false },
            reminderHours: { type: Number, default: 24 }
        }
    },
    isActive: { type: Boolean, default: true },
    lastUpdated: { type: Date, default: Date.now },
    updatedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
});
centerScheduleSchema.index({ centerId: 1 });
centerScheduleSchema.index({ 'instructorAvailability.instructorId': 1 });
centerScheduleSchema.index({ 'laneAvailability.poolType': 1, 'laneAvailability.laneNumber': 1 });
centerScheduleSchema.index({ 'specialSchedules.date': 1 });
exports.CenterSchedule = mongoose_1.default.models.CenterSchedule || mongoose_1.default.model('CenterSchedule', centerScheduleSchema);
//# sourceMappingURL=CenterSchedule.js.map