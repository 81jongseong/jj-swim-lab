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
exports.InstructorCertification = exports.InstructorWorkHistory = exports.CERTIFICATION_TYPES = void 0;
const mongoose_1 = __importStar(require("mongoose"));
exports.CERTIFICATION_TYPES = {
    lifeguard: {
        name: '인명구조원',
        issuingOrgs: ['대한적십자사', '대한수상안전협회', '한국수영장협회'],
        validityPeriod: 2,
        required: true
    },
    sports_instructor: {
        name: '생활체육지도사',
        issuingOrgs: ['국민체육진흥공단', '대한체육회'],
        validityPeriod: null,
        required: true
    },
    swimming_coach: {
        name: '수영지도자',
        issuingOrgs: ['대한수영연맹', '한국수영장협회'],
        validityPeriod: 3,
        required: false
    },
    first_aid: {
        name: '응급처치',
        issuingOrgs: ['대한적십자사', '대한심폐소생협회'],
        validityPeriod: 2,
        required: true
    }
};
const instructorWorkHistorySchema = new mongoose_1.Schema({
    instructorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    centerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Center',
        required: true,
        index: true
    },
    position: {
        type: String,
        required: true,
        enum: ['수영강사', '헬스트레이너', '아쿠아로빅강사', '다이빙강사', '수영부코치', '기타']
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    workType: {
        type: String,
        enum: ['fulltime', 'parttime', 'contract', 'volunteer'],
        required: true
    },
    responsibilities: [{
            type: String
        }],
    achievements: [{
            type: String
        }],
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        immutable: true
    },
    hashValue: {
        type: String,
        required: true,
        immutable: true
    },
    previousHash: {
        type: String,
        immutable: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: {
        type: Date
    },
    readonly: {
        type: Boolean,
        default: true,
        immutable: true
    }
}, {
    timestamps: false,
    collection: 'instructor_work_histories'
});
const instructorCertificationSchema = new mongoose_1.Schema({
    instructorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    certificationType: {
        type: String,
        enum: ['lifeguard', 'sports_instructor', 'swimming_coach', 'first_aid', 'other'],
        required: true
    },
    certificationName: {
        type: String,
        required: true
    },
    certificationNumber: {
        type: String,
        required: true,
        unique: true
    },
    issuingOrganization: {
        type: String,
        required: true
    },
    issueDate: {
        type: Date,
        required: true
    },
    expiryDate: {
        type: Date
    },
    isValid: {
        type: Boolean,
        default: true
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'expired'],
        default: 'pending'
    },
    verificationMethod: {
        type: String,
        enum: ['manual', 'api', 'document'],
        default: 'manual'
    },
    verifiedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: {
        type: Date
    },
    verificationNotes: {
        type: String
    },
    documentUrl: {
        type: String
    },
    documentHash: {
        type: String
    },
    readonly: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    collection: 'instructor_certifications'
});
instructorWorkHistorySchema.pre('findOneAndUpdate', function () {
    throw new Error('근무 이력은 수정할 수 없습니다. 새로운 이력을 추가해주세요.');
});
instructorWorkHistorySchema.pre('updateOne', function () {
    throw new Error('근무 이력은 수정할 수 없습니다. 새로운 이력을 추가해주세요.');
});
instructorWorkHistorySchema.pre('updateMany', function () {
    throw new Error('근무 이력은 수정할 수 없습니다.');
});
instructorCertificationSchema.pre('findOneAndUpdate', function () {
    const update = this.getUpdate();
    const allowedFields = ['verificationStatus', 'verifiedBy', 'verifiedAt', 'verificationNotes', 'isValid'];
    const updateFields = Object.keys(update.$set || update);
    const hasRestrictedFields = updateFields.some(field => !allowedFields.includes(field));
    if (hasRestrictedFields) {
        throw new Error('자격증 기본 정보는 수정할 수 없습니다. 검증 상태만 변경 가능합니다.');
    }
});
instructorWorkHistorySchema.methods.generateHash = function () {
    const crypto = require('crypto');
    const data = `${this.instructorId}${this.centerId}${this.position}${this.startDate}${this.workType}`;
    return crypto.createHash('sha256').update(data).digest('hex');
};
instructorWorkHistorySchema.methods.verifyIntegrity = function () {
    const expectedHash = this.generateHash();
    return this.hashValue === expectedHash;
};
instructorCertificationSchema.methods.isExpired = function () {
    if (!this.expiryDate)
        return false;
    return new Date() > this.expiryDate;
};
instructorCertificationSchema.methods.shouldRenew = function () {
    if (!this.expiryDate)
        return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return this.expiryDate <= thirtyDaysFromNow;
};
instructorWorkHistorySchema.index({ instructorId: 1, centerId: 1 });
instructorWorkHistorySchema.index({ centerId: 1, isActive: 1 });
instructorWorkHistorySchema.index({ createdAt: 1 });
instructorWorkHistorySchema.index({ hashValue: 1 }, { unique: true });
instructorCertificationSchema.index({ instructorId: 1, certificationType: 1 });
instructorCertificationSchema.index({ certificationNumber: 1 }, { unique: true });
instructorCertificationSchema.index({ issuingOrganization: 1 });
instructorCertificationSchema.index({ expiryDate: 1 });
instructorCertificationSchema.index({ verificationStatus: 1 });
instructorWorkHistorySchema.statics.createNewHistory = async function (historyData, createdBy) {
    const crypto = require('crypto');
    const lastHistory = await this.findOne({ instructorId: historyData.instructorId })
        .sort({ createdAt: -1 });
    const newHistoryData = {
        ...historyData,
        createdBy,
        previousHash: lastHistory?.hashValue,
        readonly: true
    };
    const hashData = `${newHistoryData.instructorId}${newHistoryData.centerId}${newHistoryData.position}${newHistoryData.startDate}${newHistoryData.workType}`;
    newHistoryData.hashValue = crypto.createHash('sha256').update(hashData).digest('hex');
    return this.create(newHistoryData);
};
instructorCertificationSchema.statics.findByCenterAndType = async function (centerId, certificationType) {
    const pipeline = [
        {
            $lookup: {
                from: 'instructor_work_histories',
                localField: 'instructorId',
                foreignField: 'instructorId',
                as: 'workHistory'
            }
        },
        {
            $match: {
                'workHistory': {
                    $elemMatch: {
                        centerId: new mongoose_1.default.Types.ObjectId(centerId),
                        isActive: true
                    }
                }
            }
        },
        ...(certificationType ? [{ $match: { certificationType } }] : []),
        {
            $lookup: {
                from: 'users',
                localField: 'instructorId',
                foreignField: '_id',
                as: 'instructor'
            }
        },
        {
            $lookup: {
                from: 'centers',
                localField: 'workHistory.centerId',
                foreignField: '_id',
                as: 'center'
            }
        },
        {
            $project: {
                instructorName: { $arrayElemAt: ['$instructor.name', 0] },
                instructorEmail: { $arrayElemAt: ['$instructor.email', 0] },
                certificationType: 1,
                certificationName: 1,
                certificationNumber: 1,
                issuingOrganization: 1,
                issueDate: 1,
                expiryDate: 1,
                verificationStatus: 1,
                isValid: 1,
                isExpired: {
                    $cond: {
                        if: { $and: [{ $ne: ['$expiryDate', null] }, { $lt: ['$expiryDate', new Date()] }] },
                        then: true,
                        else: false
                    }
                }
            }
        }
    ];
    return this.aggregate(pipeline);
};
exports.InstructorWorkHistory = mongoose_1.default.model('InstructorWorkHistory', instructorWorkHistorySchema);
exports.InstructorCertification = mongoose_1.default.model('InstructorCertification', instructorCertificationSchema);
exports.default = {
    InstructorWorkHistory: exports.InstructorWorkHistory,
    InstructorCertification: exports.InstructorCertification,
    CERTIFICATION_TYPES: exports.CERTIFICATION_TYPES
};
//# sourceMappingURL=InstructorHistory.js.map