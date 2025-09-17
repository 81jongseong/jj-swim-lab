import mongoose from 'mongoose';
export declare const SwimmingCenter: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    phone: string;
    isActive: boolean;
    address: string;
    students: mongoose.Types.ObjectId[];
    instructors: mongoose.Types.ObjectId[];
    images: {
        url?: string;
        caption?: string;
    }[];
    maxCapacity: number;
    currentCapacity: number;
    admins: mongoose.Types.ObjectId[];
    email?: string;
    description?: string;
    location?: {
        enum: unknown[];
        type?: string;
        required?: unknown;
    };
    facilities?: {
        mainPool?: {
            lanes: number;
            poolLength: number;
            poolDepth: number;
            temperature: number;
        };
        kidsPool?: {
            hasKidsPool: boolean;
            kidsPoolLanes: number;
            kidsPoolLength: number;
            kidsPoolDepth: number;
            kidsPoolTemperature: number;
        };
        endlessPool?: {
            hasEndlessPool: boolean;
            endlessPoolCount: number;
            endlessPoolLength: number;
            endlessPoolWidth: number;
        };
        amenities?: {
            hasSauna: boolean;
            hasShower: boolean;
            hasLocker: boolean;
            hasJacuzzi: boolean;
            hasSteamRoom: boolean;
            hasFitnessRoom: boolean;
            hasCafeteria: boolean;
            hasParking: boolean;
            parkingSpaces: number;
            additionalFacilities: string;
        };
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
    introduction?: string;
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
    website?: string;
    guide?: string;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    phone: string;
    isActive: boolean;
    address: string;
    students: mongoose.Types.ObjectId[];
    instructors: mongoose.Types.ObjectId[];
    images: {
        url?: string;
        caption?: string;
    }[];
    maxCapacity: number;
    currentCapacity: number;
    admins: mongoose.Types.ObjectId[];
    email?: string;
    description?: string;
    location?: {
        enum: unknown[];
        type?: string;
        required?: unknown;
    };
    facilities?: {
        mainPool?: {
            lanes: number;
            poolLength: number;
            poolDepth: number;
            temperature: number;
        };
        kidsPool?: {
            hasKidsPool: boolean;
            kidsPoolLanes: number;
            kidsPoolLength: number;
            kidsPoolDepth: number;
            kidsPoolTemperature: number;
        };
        endlessPool?: {
            hasEndlessPool: boolean;
            endlessPoolCount: number;
            endlessPoolLength: number;
            endlessPoolWidth: number;
        };
        amenities?: {
            hasSauna: boolean;
            hasShower: boolean;
            hasLocker: boolean;
            hasJacuzzi: boolean;
            hasSteamRoom: boolean;
            hasFitnessRoom: boolean;
            hasCafeteria: boolean;
            hasParking: boolean;
            parkingSpaces: number;
            additionalFacilities: string;
        };
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
    introduction?: string;
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
    website?: string;
    guide?: string;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    phone: string;
    isActive: boolean;
    address: string;
    students: mongoose.Types.ObjectId[];
    instructors: mongoose.Types.ObjectId[];
    images: {
        url?: string;
        caption?: string;
    }[];
    maxCapacity: number;
    currentCapacity: number;
    admins: mongoose.Types.ObjectId[];
    email?: string;
    description?: string;
    location?: {
        enum: unknown[];
        type?: string;
        required?: unknown;
    };
    facilities?: {
        mainPool?: {
            lanes: number;
            poolLength: number;
            poolDepth: number;
            temperature: number;
        };
        kidsPool?: {
            hasKidsPool: boolean;
            kidsPoolLanes: number;
            kidsPoolLength: number;
            kidsPoolDepth: number;
            kidsPoolTemperature: number;
        };
        endlessPool?: {
            hasEndlessPool: boolean;
            endlessPoolCount: number;
            endlessPoolLength: number;
            endlessPoolWidth: number;
        };
        amenities?: {
            hasSauna: boolean;
            hasShower: boolean;
            hasLocker: boolean;
            hasJacuzzi: boolean;
            hasSteamRoom: boolean;
            hasFitnessRoom: boolean;
            hasCafeteria: boolean;
            hasParking: boolean;
            parkingSpaces: number;
            additionalFacilities: string;
        };
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
    introduction?: string;
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
    website?: string;
    guide?: string;
} & {
    _id: mongoose.Types.ObjectId;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    phone: string;
    isActive: boolean;
    address: string;
    students: mongoose.Types.ObjectId[];
    instructors: mongoose.Types.ObjectId[];
    images: {
        url?: string;
        caption?: string;
    }[];
    maxCapacity: number;
    currentCapacity: number;
    admins: mongoose.Types.ObjectId[];
    email?: string;
    description?: string;
    location?: {
        enum: unknown[];
        type?: string;
        required?: unknown;
    };
    facilities?: {
        mainPool?: {
            lanes: number;
            poolLength: number;
            poolDepth: number;
            temperature: number;
        };
        kidsPool?: {
            hasKidsPool: boolean;
            kidsPoolLanes: number;
            kidsPoolLength: number;
            kidsPoolDepth: number;
            kidsPoolTemperature: number;
        };
        endlessPool?: {
            hasEndlessPool: boolean;
            endlessPoolCount: number;
            endlessPoolLength: number;
            endlessPoolWidth: number;
        };
        amenities?: {
            hasSauna: boolean;
            hasShower: boolean;
            hasLocker: boolean;
            hasJacuzzi: boolean;
            hasSteamRoom: boolean;
            hasFitnessRoom: boolean;
            hasCafeteria: boolean;
            hasParking: boolean;
            parkingSpaces: number;
            additionalFacilities: string;
        };
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
    introduction?: string;
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
    website?: string;
    guide?: string;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    phone: string;
    isActive: boolean;
    address: string;
    students: mongoose.Types.ObjectId[];
    instructors: mongoose.Types.ObjectId[];
    images: {
        url?: string;
        caption?: string;
    }[];
    maxCapacity: number;
    currentCapacity: number;
    admins: mongoose.Types.ObjectId[];
    email?: string;
    description?: string;
    location?: {
        enum: unknown[];
        type?: string;
        required?: unknown;
    };
    facilities?: {
        mainPool?: {
            lanes: number;
            poolLength: number;
            poolDepth: number;
            temperature: number;
        };
        kidsPool?: {
            hasKidsPool: boolean;
            kidsPoolLanes: number;
            kidsPoolLength: number;
            kidsPoolDepth: number;
            kidsPoolTemperature: number;
        };
        endlessPool?: {
            hasEndlessPool: boolean;
            endlessPoolCount: number;
            endlessPoolLength: number;
            endlessPoolWidth: number;
        };
        amenities?: {
            hasSauna: boolean;
            hasShower: boolean;
            hasLocker: boolean;
            hasJacuzzi: boolean;
            hasSteamRoom: boolean;
            hasFitnessRoom: boolean;
            hasCafeteria: boolean;
            hasParking: boolean;
            parkingSpaces: number;
            additionalFacilities: string;
        };
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
    introduction?: string;
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
    website?: string;
    guide?: string;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    phone: string;
    isActive: boolean;
    address: string;
    students: mongoose.Types.ObjectId[];
    instructors: mongoose.Types.ObjectId[];
    images: {
        url?: string;
        caption?: string;
    }[];
    maxCapacity: number;
    currentCapacity: number;
    admins: mongoose.Types.ObjectId[];
    email?: string;
    description?: string;
    location?: {
        enum: unknown[];
        type?: string;
        required?: unknown;
    };
    facilities?: {
        mainPool?: {
            lanes: number;
            poolLength: number;
            poolDepth: number;
            temperature: number;
        };
        kidsPool?: {
            hasKidsPool: boolean;
            kidsPoolLanes: number;
            kidsPoolLength: number;
            kidsPoolDepth: number;
            kidsPoolTemperature: number;
        };
        endlessPool?: {
            hasEndlessPool: boolean;
            endlessPoolCount: number;
            endlessPoolLength: number;
            endlessPoolWidth: number;
        };
        amenities?: {
            hasSauna: boolean;
            hasShower: boolean;
            hasLocker: boolean;
            hasJacuzzi: boolean;
            hasSteamRoom: boolean;
            hasFitnessRoom: boolean;
            hasCafeteria: boolean;
            hasParking: boolean;
            parkingSpaces: number;
            additionalFacilities: string;
        };
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
    introduction?: string;
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
    website?: string;
    guide?: string;
}> & {
    _id: mongoose.Types.ObjectId;
}>>;
//# sourceMappingURL=SwimmingCenter.d.ts.map