/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/inferschematype" />
/// <reference types="mongoose/types/inferrawdoctype" />
import mongoose, { Document } from 'mongoose';
export interface IAIConfig extends Document {
    name: string;
    description: string;
    category: 'diagnostic' | 'recommendation' | 'feedback' | 'assessment';
    algorithmType: 'swimming_analysis' | 'stroke_detection' | 'performance_prediction' | 'routine_generation';
    version: string;
    isActive: boolean;
    validateConfig(): {
        isValid: boolean;
        errors: string[];
    };
    exportConfig(): any;
    importConfig(configData: any): void;
    configData: {
        parameters: {
            [key: string]: {
                type: 'number' | 'string' | 'boolean' | 'array' | 'object';
                value: any;
                min?: number;
                max?: number;
                options?: string[];
                description: string;
                required: boolean;
            };
        };
        thresholds: {
            [key: string]: number;
        };
        weights: {
            [key: string]: number;
        };
        rules: Array<{
            id: string;
            condition: string;
            action: string;
            priority: number;
        }>;
        metadata: {
            createdBy: string;
            lastModifiedBy: string;
            tags: string[];
            dependencies: string[];
        };
    };
    uiConfig: {
        displayName: string;
        icon: string;
        color: string;
        formFields: Array<{
            field: string;
            type: 'input' | 'select' | 'slider' | 'checkbox' | 'textarea' | 'json';
            label: string;
            placeholder?: string;
            validation?: {
                required?: boolean;
                min?: number;
                max?: number;
                pattern?: string;
            };
            options?: Array<{
                label: string;
                value: any;
            }>;
        }>;
        visualization: {
            charts: Array<{
                type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap';
                title: string;
                dataSource: string;
                config: any;
            }>;
            widgets: Array<{
                type: 'metric' | 'gauge' | 'progress' | 'status';
                title: string;
                dataSource: string;
                config: any;
            }>;
        };
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const AIConfig: mongoose.Model<IAIConfig, {}, {}, {}, mongoose.Document<unknown, {}, IAIConfig, {}, {}> & IAIConfig & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=AIConfig.d.ts.map