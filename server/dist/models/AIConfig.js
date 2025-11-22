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
exports.AIConfig = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const aiConfigSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['diagnostic', 'recommendation', 'feedback', 'assessment'],
        required: true
    },
    algorithmType: {
        type: String,
        enum: ['swimming_analysis', 'stroke_detection', 'performance_prediction', 'routine_generation'],
        required: true
    },
    version: {
        type: String,
        required: true,
        default: '1.0.0'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    configData: {
        parameters: {
            type: Map,
            of: {
                type: {
                    type: String,
                    enum: ['number', 'string', 'boolean', 'array', 'object'],
                    required: true
                },
                value: mongoose_1.Schema.Types.Mixed,
                min: Number,
                max: Number,
                options: [String],
                description: String,
                required: {
                    type: Boolean,
                    default: false
                }
            }
        },
        thresholds: {
            type: Map,
            of: Number
        },
        weights: {
            type: Map,
            of: Number
        },
        rules: [{
                id: String,
                condition: String,
                action: String,
                priority: {
                    type: Number,
                    default: 1
                }
            }],
        metadata: {
            createdBy: String,
            lastModifiedBy: String,
            tags: [String],
            dependencies: [String]
        }
    },
    uiConfig: {
        displayName: String,
        icon: String,
        color: String,
        formFields: [{
                field: String,
                type: {
                    type: String,
                    enum: ['input', 'select', 'slider', 'checkbox', 'textarea', 'json']
                },
                label: String,
                placeholder: String,
                validation: {
                    required: Boolean,
                    min: Number,
                    max: Number,
                    pattern: String
                },
                options: [{
                        label: String,
                        value: mongoose_1.Schema.Types.Mixed
                    }]
            }],
        visualization: {
            charts: [{
                    type: {
                        type: String,
                        enum: ['line', 'bar', 'pie', 'scatter', 'heatmap']
                    },
                    title: String,
                    dataSource: String,
                    config: mongoose_1.Schema.Types.Mixed
                }],
            widgets: [{
                    type: {
                        type: String,
                        enum: ['metric', 'gauge', 'progress', 'status']
                    },
                    title: String,
                    dataSource: String,
                    config: mongoose_1.Schema.Types.Mixed
                }]
        }
    }
}, {
    timestamps: true
});
aiConfigSchema.index({ category: 1, isActive: 1 });
aiConfigSchema.index({ algorithmType: 1 });
aiConfigSchema.index({ 'configData.metadata.tags': 1 });
aiConfigSchema.virtual('formattedVersion').get(function () {
    return `v${this.version}`;
});
aiConfigSchema.methods.validateConfig = function () {
    const errors = [];
    for (const [key, param] of Object.entries(this.configData.parameters)) {
        const typedParam = param;
        if (typedParam.required && (typedParam.value === undefined || typedParam.value === null)) {
            errors.push(`Required parameter '${key}' is missing`);
        }
        if (typedParam.type === 'number' && typeof typedParam.value === 'number') {
            if (typedParam.min !== undefined && typedParam.value < typedParam.min) {
                errors.push(`Parameter '${key}' value (${typedParam.value}) is below minimum (${typedParam.min})`);
            }
            if (typedParam.max !== undefined && typedParam.value > typedParam.max) {
                errors.push(`Parameter '${key}' value (${typedParam.value}) is above maximum (${typedParam.max})`);
            }
        }
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
aiConfigSchema.methods.exportConfig = function () {
    return {
        name: this.name,
        version: this.version,
        category: this.category,
        algorithmType: this.algorithmType,
        configData: this.configData,
        uiConfig: this.uiConfig
    };
};
aiConfigSchema.methods.importConfig = function (configData) {
    if (configData.name)
        this.name = configData.name;
    if (configData.description)
        this.description = configData.description;
    if (configData.category)
        this.category = configData.category;
    if (configData.algorithmType)
        this.algorithmType = configData.algorithmType;
    if (configData.version)
        this.version = configData.version;
    if (configData.configData)
        this.configData = configData.configData;
    if (configData.uiConfig)
        this.uiConfig = configData.uiConfig;
};
exports.AIConfig = mongoose_1.default.model('AIConfig', aiConfigSchema);
//# sourceMappingURL=AIConfig.js.map