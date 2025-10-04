"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwimmingCenter = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const swimmingCenterSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    website: {
        type: String,
    },
    description: {
        type: String,
    },
    introduction: {
        type: String,
    },
    guide: {
        type: String,
    },
    facilities: {
        mainPool: {
            lanes: {
                type: Number,
                required: true,
            },
            poolLength: {
                type: Number,
                required: true,
            },
            poolDepth: {
                type: Number,
                required: true,
            },
            temperature: {
                type: Number,
                required: true,
            },
        },
        kidsPool: {
            hasKidsPool: {
                type: Boolean,
                default: false,
            },
            kidsPoolLanes: {
                type: Number,
                default: 0,
            },
            kidsPoolLength: {
                type: Number,
                default: 0,
            },
            kidsPoolDepth: {
                type: Number,
                default: 0,
            },
            kidsPoolTemperature: {
                type: Number,
                default: 0,
            },
        },
        endlessPool: {
            hasEndlessPool: {
                type: Boolean,
                default: false,
            },
            endlessPoolCount: {
                type: Number,
                default: 0,
            },
            endlessPoolLength: {
                type: Number,
                default: 0,
            },
            endlessPoolWidth: {
                type: Number,
                default: 0,
            },
        },
        amenities: {
            hasSauna: {
                type: Boolean,
                default: false,
            },
            hasShower: {
                type: Boolean,
                default: true,
            },
            hasLocker: {
                type: Boolean,
                default: true,
            },
            hasJacuzzi: {
                type: Boolean,
                default: false,
            },
            hasSteamRoom: {
                type: Boolean,
                default: false,
            },
            hasFitnessRoom: {
                type: Boolean,
                default: false,
            },
            hasCafeteria: {
                type: Boolean,
                default: false,
            },
            hasParking: {
                type: Boolean,
                default: false,
            },
            parkingSpaces: {
                type: Number,
                default: 0,
            },
            additionalFacilities: {
                type: String,
                default: '',
            },
        },
    },
    operatingHours: {
        monday: {
            open: String,
            close: String,
            isOpen: { type: Boolean, default: true },
        },
        tuesday: {
            open: String,
            close: String,
            isOpen: { type: Boolean, default: true },
        },
        wednesday: {
            open: String,
            close: String,
            isOpen: { type: Boolean, default: true },
        },
        thursday: {
            open: String,
            close: String,
            isOpen: { type: Boolean, default: true },
        },
        friday: {
            open: String,
            close: String,
            isOpen: { type: Boolean, default: true },
        },
        saturday: {
            open: String,
            close: String,
            isOpen: { type: Boolean, default: true },
        },
        sunday: {
            open: String,
            close: String,
            isOpen: { type: Boolean, default: true },
        },
    },
    pricing: {
        freeSwim: {
            adult: Number,
            child: Number,
            student: Number,
        },
        lesson: {
            perSession: Number,
            monthly: Number,
        },
    },
    currentCapacity: {
        type: Number,
        default: 0,
    },
    maxCapacity: {
        type: Number,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    images: [{
            url: String,
            caption: String,
        }],
    admins: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User'
        }],
    instructors: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User'
        }],
    students: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User'
        }]
}, {
    timestamps: true
});
swimmingCenterSchema.index({ location: '2dsphere' });
exports.SwimmingCenter = mongoose_1.default.models.SwimmingCenter || mongoose_1.default.model('SwimmingCenter', swimmingCenterSchema);
//# sourceMappingURL=SwimmingCenter.js.map