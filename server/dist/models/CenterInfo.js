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
exports.CenterInfo = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CenterInfoSchema = new mongoose_1.Schema({
    centerId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    shortDescription: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    website: {
        type: String,
        trim: true
    },
    businessHours: {
        monday: { type: String, required: true },
        tuesday: { type: String, required: true },
        wednesday: { type: String, required: true },
        thursday: { type: String, required: true },
        friday: { type: String, required: true },
        saturday: { type: String, required: true },
        sunday: { type: String, required: true }
    },
    facilities: [{
            type: String,
            trim: true
        }],
    features: [{
            type: String,
            trim: true
        }],
    images: {
        mainImage: { type: String, trim: true },
        gallery: [{ type: String, trim: true }]
    },
    instructors: [{
            name: { type: String, required: true, trim: true },
            specialty: { type: String, required: true, trim: true },
            experience: { type: String, required: true, trim: true },
            image: { type: String, trim: true }
        }],
    courses: [{
            name: { type: String, required: true, trim: true },
            description: { type: String, required: true, trim: true },
            level: { type: String, required: true, trim: true },
            duration: { type: String, required: true, trim: true },
            price: { type: String, required: true, trim: true }
        }]
}, {
    timestamps: true
});
exports.CenterInfo = mongoose_1.default.model('CenterInfo', CenterInfoSchema);
//# sourceMappingURL=CenterInfo.js.map