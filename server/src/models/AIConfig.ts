import mongoose, { Schema, Document } from 'mongoose';

export interface IAIConfig extends Document {
  name: string;
  description: string;
  category: 'diagnostic' | 'recommendation' | 'feedback' | 'assessment';
  algorithmType: 'swimming_analysis' | 'stroke_detection' | 'performance_prediction' | 'routine_generation';
  version: string;
  isActive: boolean;
  validateConfig(): { isValid: boolean; errors: string[] };
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

const aiConfigSchema = new Schema<IAIConfig>({
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
        value: Schema.Types.Mixed,
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
        value: Schema.Types.Mixed
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
        config: Schema.Types.Mixed
      }],
      widgets: [{
        type: {
          type: String,
          enum: ['metric', 'gauge', 'progress', 'status']
        },
        title: String,
        dataSource: String,
        config: Schema.Types.Mixed
      }]
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
aiConfigSchema.index({ category: 1, isActive: 1 });
aiConfigSchema.index({ algorithmType: 1 });
aiConfigSchema.index({ 'configData.metadata.tags': 1 });

// Virtual for formatted version
aiConfigSchema.virtual('formattedVersion').get(function(this: IAIConfig) {
  return `v${this.version}`;
});

            // Method to validate configuration
            aiConfigSchema.methods.validateConfig = function(): { isValid: boolean; errors: string[] } {
              const errors: string[] = [];

              // Check required parameters
              for (const [key, param] of Object.entries(this.configData.parameters)) {
                const typedParam = param as any;
                if (typedParam.required && (typedParam.value === undefined || typedParam.value === null)) {
                  errors.push(`Required parameter '${key}' is missing`);
                }

                // Validate numeric ranges
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

// Method to export configuration as JSON
aiConfigSchema.methods.exportConfig = function(): any {
  return {
    name: this.name,
    version: this.version,
    category: this.category,
    algorithmType: this.algorithmType,
    configData: this.configData,
    uiConfig: this.uiConfig
  };
};

// Method to import configuration from JSON
aiConfigSchema.methods.importConfig = function(configData: any): void {
  if (configData.name) this.name = configData.name;
  if (configData.description) this.description = configData.description;
  if (configData.category) this.category = configData.category;
  if (configData.algorithmType) this.algorithmType = configData.algorithmType;
  if (configData.version) this.version = configData.version;
  if (configData.configData) this.configData = configData.configData;
  if (configData.uiConfig) this.uiConfig = configData.uiConfig;
};

export const AIConfig = mongoose.model<IAIConfig>('AIConfig', aiConfigSchema); 