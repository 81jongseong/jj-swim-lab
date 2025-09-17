interface BackupInfo {
    id: string;
    timestamp: Date;
    type: 'full' | 'incremental' | 'schema';
    size: number;
    status: 'success' | 'failed' | 'in_progress';
    description?: string;
    filePath: string;
}
interface RestoreInfo {
    id: string;
    timestamp: Date;
    backupId: string;
    status: 'success' | 'failed' | 'in_progress';
    description?: string;
}
declare class BackupService {
    private static instance;
    private backupDir;
    private restoreDir;
    private backups;
    private restores;
    private constructor();
    static getInstance(): BackupService;
    private ensureDirectories;
    private loadBackupHistory;
    private saveBackupHistory;
    createFullBackup(description?: string): Promise<BackupInfo>;
    createSchemaBackup(description?: string): Promise<BackupInfo>;
    restoreFromBackup(backupId: string, description?: string): Promise<RestoreInfo>;
    getBackups(): BackupInfo[];
    getRestores(): RestoreInfo[];
    deleteBackup(backupId: string): Promise<boolean>;
    scheduleAutoBackup(intervalHours?: number): void;
    private extractDatabaseName;
    private getDirectorySize;
    private formatBytes;
    getBackupSummary(): any;
}
export default BackupService;
//# sourceMappingURL=backupService.d.ts.map