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
const CenterRegistrationSchema = new mongoose_1.Schema({
    centerName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    businessNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^\d{3}-\d{2}-\d{5}$/
    },
    representativeName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    representativeEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    representativePhone: {
        type: String,
        required: true,
        trim: true,
        match: /^01[0-9]-\d{3,4}-\d{4}$/
    },
    password: {
        type: String,
        required: true
    },
    address: {
        postalCode: {
            type: String,
            required: true,
            trim: true,
            match: /^\d{5}$/
        },
        address1: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },
        address2: {
            type: String,
            trim: true,
            maxlength: 100
        },
        city: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        },
        province: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        }
    },
    centerInfo: {
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },
        pools: [{
                id: { type: String, required: true },
                type: {
                    type: String,
                    enum: ['main', 'auxiliary'],
                    required: true
                },
                length: {
                    type: Number,
                    required: true,
                    min: 5,
                    max: 100
                },
                width: {
                    type: Number,
                    required: true,
                    min: 3,
                    max: 50
                },
                depth: {
                    type: Number,
                    required: true,
                    min: 0.3,
                    max: 5
                },
                laneCount: {
                    type: Number,
                    min: 1,
                    max: 20
                },
                description: {
                    type: String,
                    trim: true,
                    maxlength: 200
                }
            }],
        facilities: [{
                name: {
                    type: String,
                    required: true,
                    trim: true,
                    maxlength: 100
                },
                enabled: {
                    type: Boolean,
                    default: false
                },
                details: {
                    count: {
                        type: Number,
                        min: 0
                    },
                    type: {
                        type: String,
                        trim: true,
                        maxlength: 50
                    },
                    description: {
                        type: String,
                        trim: true,
                        maxlength: 500
                    }
                }
            }],
        operatingHours: {
            weekdays: {
                open: {
                    type: String,
                    required: true,
                    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
                },
                close: {
                    type: String,
                    required: true,
                    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
                }
            },
            weekends: {
                open: {
                    type: String,
                    required: true,
                    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
                },
                close: {
                    type: String,
                    required: true,
                    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
                }
            }
        },
        capacity: {
            type: Number,
            required: true,
            min: 10,
            max: 1000
        },
        parkingAvailable: {
            type: Boolean,
            default: false
        },
        parkingSpaces: {
            type: Number,
            min: 0,
            default: 0
        }
    },
    applicant: {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            match: /^01[0-9]-\d{3,4}-\d{4}$/
        },
        position: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        },
        userId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    documents: {
        businessLicense: {
            type: String,
            trim: true
        },
        facilityPhotos: [{
                type: String,
                trim: true
            }],
        poolPhotos: [{
                type: String,
                trim: true
            }],
        otherDocuments: [{
                type: String,
                trim: true
            }]
    },
    status: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected', 'cancelled'],
        default: 'pending'
    },
    approvalInfo: {
        reviewedBy: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        },
        reviewedAt: {
            type: Date
        },
        approvedBy: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        },
        approvedAt: {
            type: Date
        },
        rejectedBy: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        },
        rejectedAt: {
            type: Date
        },
        rejectionReason: {
            type: String,
            trim: true,
            maxlength: 500
        },
        comments: {
            type: String,
            trim: true,
            maxlength: 1000
        }
    },
    createdCenterId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'CenterInfo'
    },
    createdCenterAdminId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
CenterRegistrationSchema.index({ businessNumber: 1 }, { unique: true });
CenterRegistrationSchema.index({ status: 1 });
CenterRegistrationSchema.index({ submittedAt: -1 });
CenterRegistrationSchema.index({ 'applicant.email': 1 });
CenterRegistrationSchema.index({ 'representativeEmail': 1 });
CenterRegistrationSchema.virtual('fullAddress').get(function () {
    const addr = this.address;
    return `${addr.address1} ${addr.address2 || ''} ${addr.city} ${addr.province}`.trim();
});
CenterRegistrationSchema.virtual('statusKorean').get(function () {
    const statusMap = {
        'pending': '대기중',
        'under_review': '검토중',
        'approved': '승인됨',
        'rejected': '거부됨',
        'cancelled': '취소됨'
    };
    return statusMap[this.status] || this.status;
});
CenterRegistrationSchema.set('toJSON', { virtuals: true });
CenterRegistrationSchema.set('toObject', { virtuals: true });
exports.default = mongoose_1.default.model('CenterRegistration', CenterRegistrationSchema);
//# sourceMappingURL=CenterRegistration.js.map