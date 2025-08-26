import mongoose from 'mongoose';
export declare const SwimmingCenter: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    phone: string;
    address: string;
    isActive: boolean;
    students: mongoose.Types.ObjectId[];
    maxCapacity: number;
    currentCapacity: number;
    images: mongoose.Types.DocumentArray<{
        url?: string;
        caption?: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        url?: string;
        caption?: string;
    }> & {
        url?: string;
        caption?: string;
    }>;
    admins: mongoose.Types.ObjectId[];
    instructors: mongoose.Types.ObjectId[];
    email?: string;
    description?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    website?: string;
    facilities?: {
        lanes: number;
        poolLength: number;
        poolDepth: number;
        temperature: number;
        hasSauna: boolean;
        hasShower: boolean;
        hasLocker: boolean;
    };
    operatingHours?: {
        monday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        tuesday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        wednesday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        thursday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        friday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        saturday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        sunday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
    };
    pricing?: {
        lesson?: {
            perSession?: number;
            monthly?: number;
        };
        freeSwim?: {
            student?: number;
            adult?: number;
            child?: number;
        };
    };
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    phone: string;
    address: string;
    isActive: boolean;
    students: mongoose.Types.ObjectId[];
    maxCapacity: number;
    currentCapacity: number;
    images: mongoose.Types.DocumentArray<{
        url?: string;
        caption?: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        url?: string;
        caption?: string;
    }> & {
        url?: string;
        caption?: string;
    }>;
    admins: mongoose.Types.ObjectId[];
    instructors: mongoose.Types.ObjectId[];
    email?: string;
    description?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    website?: string;
    facilities?: {
        lanes: number;
        poolLength: number;
        poolDepth: number;
        temperature: number;
        hasSauna: boolean;
        hasShower: boolean;
        hasLocker: boolean;
    };
    operatingHours?: {
        monday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        tuesday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        wednesday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        thursday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        friday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        saturday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        sunday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
    };
    pricing?: {
        lesson?: {
            perSession?: number;
            monthly?: number;
        };
        freeSwim?: {
            student?: number;
            adult?: number;
            child?: number;
        };
    };
}, {}, {
    timestamps: true;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    phone: string;
    address: string;
    isActive: boolean;
    students: mongoose.Types.ObjectId[];
    maxCapacity: number;
    currentCapacity: number;
    images: mongoose.Types.DocumentArray<{
        url?: string;
        caption?: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        url?: string;
        caption?: string;
    }> & {
        url?: string;
        caption?: string;
    }>;
    admins: mongoose.Types.ObjectId[];
    instructors: mongoose.Types.ObjectId[];
    email?: string;
    description?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    website?: string;
    facilities?: {
        lanes: number;
        poolLength: number;
        poolDepth: number;
        temperature: number;
        hasSauna: boolean;
        hasShower: boolean;
        hasLocker: boolean;
    };
    operatingHours?: {
        monday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        tuesday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        wednesday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        thursday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        friday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        saturday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        sunday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
    };
    pricing?: {
        lesson?: {
            perSession?: number;
            monthly?: number;
        };
        freeSwim?: {
            student?: number;
            adult?: number;
            child?: number;
        };
    };
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    phone: string;
    address: string;
    isActive: boolean;
    students: mongoose.Types.ObjectId[];
    maxCapacity: number;
    currentCapacity: number;
    images: mongoose.Types.DocumentArray<{
        url?: string;
        caption?: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        url?: string;
        caption?: string;
    }> & {
        url?: string;
        caption?: string;
    }>;
    admins: mongoose.Types.ObjectId[];
    instructors: mongoose.Types.ObjectId[];
    email?: string;
    description?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    website?: string;
    facilities?: {
        lanes: number;
        poolLength: number;
        poolDepth: number;
        temperature: number;
        hasSauna: boolean;
        hasShower: boolean;
        hasLocker: boolean;
    };
    operatingHours?: {
        monday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        tuesday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        wednesday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        thursday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        friday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        saturday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        sunday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
    };
    pricing?: {
        lesson?: {
            perSession?: number;
            monthly?: number;
        };
        freeSwim?: {
            student?: number;
            adult?: number;
            child?: number;
        };
    };
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    phone: string;
    address: string;
    isActive: boolean;
    students: mongoose.Types.ObjectId[];
    maxCapacity: number;
    currentCapacity: number;
    images: mongoose.Types.DocumentArray<{
        url?: string;
        caption?: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        url?: string;
        caption?: string;
    }> & {
        url?: string;
        caption?: string;
    }>;
    admins: mongoose.Types.ObjectId[];
    instructors: mongoose.Types.ObjectId[];
    email?: string;
    description?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    website?: string;
    facilities?: {
        lanes: number;
        poolLength: number;
        poolDepth: number;
        temperature: number;
        hasSauna: boolean;
        hasShower: boolean;
        hasLocker: boolean;
    };
    operatingHours?: {
        monday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        tuesday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        wednesday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        thursday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        friday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        saturday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        sunday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
    };
    pricing?: {
        lesson?: {
            perSession?: number;
            monthly?: number;
        };
        freeSwim?: {
            student?: number;
            adult?: number;
            child?: number;
        };
    };
}>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    phone: string;
    address: string;
    isActive: boolean;
    students: mongoose.Types.ObjectId[];
    maxCapacity: number;
    currentCapacity: number;
    images: mongoose.Types.DocumentArray<{
        url?: string;
        caption?: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        url?: string;
        caption?: string;
    }> & {
        url?: string;
        caption?: string;
    }>;
    admins: mongoose.Types.ObjectId[];
    instructors: mongoose.Types.ObjectId[];
    email?: string;
    description?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    website?: string;
    facilities?: {
        lanes: number;
        poolLength: number;
        poolDepth: number;
        temperature: number;
        hasSauna: boolean;
        hasShower: boolean;
        hasLocker: boolean;
    };
    operatingHours?: {
        monday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        tuesday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        wednesday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        thursday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        friday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        saturday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
        sunday?: {
            isOpen: boolean;
            close?: string;
            open?: string;
        };
    };
    pricing?: {
        lesson?: {
            perSession?: number;
            monthly?: number;
        };
        freeSwim?: {
            student?: number;
            adult?: number;
            child?: number;
        };
    };
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=SwimmingCenter.d.ts.map