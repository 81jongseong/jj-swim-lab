"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const GroupClassSchema = new mongoose_1.Schema({
    className: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        trim: true
    },
    centerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'SwimmingCenter',
        required: true,
        index: true
    },
    instructorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    students: [{
            userId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            enrolledAt: {
                type: Date,
                default: Date.now
            },
            status: {
                type: String,
                enum: ['active', 'inactive', 'completed', 'dropped'],
                default: 'active'
            },
            attendanceRate: {
                type: Number,
                min: 0,
                max: 100
            },
            completionRate: {
                type: Number,
                min: 0,
                max: 100
            }
        }],
    schedule: {
        dayOfWeek: {
            type: [Number],
            required: true,
            validate: {
                validator: function (arr) {
                    return arr.every(day => day >= 0 && day <= 6);
                },
                message: 'dayOfWeek must be between 0 (Sunday) and 6 (Saturday)'
            }
        },
        startTime: {
            type: String,
            required: true,
            match: /^([01]\d|2[0-3]):([0-5]\d)$/
        },
        endTime: {
            type: String,
            required: true,
            match: /^([01]\d|2[0-3]):([0-5]\d)$/
        },
        duration: {
            type: Number,
            required: true,
            min: 30,
            max: 180
        }
    },
    period: {
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        totalSessions: {
            type: Number,
            required: true,
            min: 1
        },
        completedSessions: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    capacity: {
        min: {
            type: Number,
            required: true,
            min: 1,
            default: 4
        },
        max: {
            type: Number,
            required: true,
            min: 1,
            default: 12
        },
        current: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    programId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'SwimProgram'
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'mixed'],
        required: true,
        default: 'beginner'
    },
    targetAge: {
        min: {
            type: Number,
            min: 1,
            max: 100
        },
        max: {
            type: Number,
            min: 1,
            max: 100
        }
    },
    status: {
        type: String,
        enum: ['planned', 'active', 'completed', 'cancelled'],
        default: 'planned',
        index: true
    },
    fee: {
        amount: {
            type: Number,
            min: 0
        },
        currency: {
            type: String,
            default: 'KRW'
        },
        billingCycle: {
            type: String,
            enum: ['monthly', 'per_session', 'total'],
            default: 'monthly'
        }
    },
    notes: {
        type: String
    },
    announcements: [{
            title: {
                type: String,
                required: true
            },
            content: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            createdBy: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User'
            }
        }],
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    collection: 'groupclasses'
});
GroupClassSchema.index({ centerId: 1, status: 1 });
GroupClassSchema.index({ instructorId: 1, status: 1 });
GroupClassSchema.index({ 'students.userId': 1 });
GroupClassSchema.index({ 'period.startDate': 1, 'period.endDate': 1 });
GroupClassSchema.virtual('activeStudentCount').get(function () {
    return this.students.filter((s) => s.status === 'active').length;
});
GroupClassSchema.virtual('occupancyRate').get(function () {
    return (this.capacity.current / this.capacity.max) * 100;
});
GroupClassSchema.methods.addStudent = async function (userId) {
    if (this.capacity.current >= this.capacity.max) {
        throw new Error('Class is full');
    }
    const existingStudent = this.students.find((s) => s.userId.toString() === userId.toString());
    if (existingStudent) {
        throw new Error('Student already enrolled');
    }
    this.students.push({
        userId,
        enrolledAt: new Date(),
        status: 'active'
    });
    this.capacity.current += 1;
    await this.save();
};
GroupClassSchema.methods.removeStudent = async function (userId) {
    const studentIndex = this.students.findIndex((s) => s.userId.toString() === userId.toString());
    if (studentIndex === -1) {
        throw new Error('Student not found');
    }
    this.students.splice(studentIndex, 1);
    this.capacity.current = Math.max(0, this.capacity.current - 1);
    await this.save();
};
GroupClassSchema.methods.updateStudentStatus = async function (userId, status) {
    const student = this.students.find((s) => s.userId.toString() === userId.toString());
    if (!student) {
        throw new Error('Student not found');
    }
    student.status = status;
    await this.save();
};
exports.default = mongoose_1.default.model('GroupClass', GroupClassSchema);
//# sourceMappingURL=GroupClass.js.map