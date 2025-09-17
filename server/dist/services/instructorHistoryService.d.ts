import { IInstructorWorkHistory, IInstructorCertification } from '../models/InstructorHistory';
export declare class InstructorHistoryService {
    private static instance;
    static getInstance(): InstructorHistoryService;
    addWorkHistory(historyData: {
        instructorId: string;
        centerId: string;
        position: string;
        startDate: Date;
        workType: 'fulltime' | 'parttime' | 'contract' | 'volunteer';
        responsibilities: string[];
    }, createdBy: string): Promise<IInstructorWorkHistory>;
    endCurrentWorkHistory(instructorId: string, centerId: string): Promise<void>;
    addCertification(certData: {
        instructorId: string;
        certificationType: string;
        certificationName: string;
        certificationNumber: string;
        issuingOrganization: string;
        issueDate: Date;
        expiryDate?: Date;
        documentUrl?: string;
    }): Promise<IInstructorCertification>;
    verifyCertification(certificationId: string, verifiedBy: string, status: 'verified' | 'rejected', notes?: string): Promise<IInstructorCertification>;
    searchInstructorsByCenterAndCertification(centerId: string, filters?: {
        certificationType?: string;
        verificationStatus?: string;
        isExpired?: boolean;
        issuingOrganization?: string;
    }): Promise<any[]>;
    getInstructorCompleteHistory(instructorId: string): Promise<{
        workHistory: IInstructorWorkHistory[];
        certifications: IInstructorCertification[];
        summary: any;
    }>;
    getExpiringCertifications(days?: number): Promise<any[]>;
    verifyHistoryIntegrity(instructorId: string): Promise<{
        isValid: boolean;
        issues: string[];
    }>;
    autoVerifyCertification(certificationId: string): Promise<{
        success: boolean;
        verificationResult: any;
    }>;
    getCenterInstructorDashboard(centerId: string): Promise<{
        totalInstructors: number;
        activeInstructors: number;
        certificationStats: any;
        expiringCerts: any[];
        complianceRate: number;
    }>;
    private simulateExternalVerification;
    private calculateTotalExperience;
    private summarizeCertifications;
    private getCertificationStatsByCenter;
    private getExpiringCertificationsByCenter;
    private calculateCenterComplianceRate;
    private hasAllRequiredCertifications;
}
export default InstructorHistoryService;
//# sourceMappingURL=instructorHistoryService.d.ts.map