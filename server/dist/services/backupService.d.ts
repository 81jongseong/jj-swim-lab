declare class BackupService {
    private static instance;
    private backupInterval;
    private isRunning;
    private constructor();
    static getInstance(): BackupService;
    startBackupService(): Promise<void>;
    private checkAndScheduleBackup;
    private performBackup;
    private cleanupOldBackups;
    triggerManualBackup(): Promise<boolean>;
    stopBackupService(): void;
    getStatus(): {
        isRunning: boolean;
    };
}
export declare const backupService: BackupService;
export {};
//# sourceMappingURL=backupService.d.ts.map