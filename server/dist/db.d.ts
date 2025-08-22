export declare const connectDB: () => Promise<boolean>;
export declare const isConnected: () => boolean;
export declare const disconnectDB: () => Promise<boolean>;
export declare const getDBStats: () => Promise<{
    collections: any;
    dataSize: any;
    storageSize: any;
    indexes: any;
    indexSize: any;
    objects: any;
    avgObjSize: any;
    dataFileVersion: any;
    extents: any;
    fileSize: any;
    nsSizeMB: any;
    ok: any;
}>;
export declare const checkDatabaseHealth: () => Promise<{
    status: string;
    timestamp: string;
    type: string;
    collections: any;
    objects: any;
    error?: undefined;
} | {
    status: string;
    timestamp: string;
    error: string;
    type?: undefined;
    collections?: undefined;
    objects?: undefined;
}>;
export declare const suggestIndexes: () => Promise<any[]>;
//# sourceMappingURL=db.d.ts.map