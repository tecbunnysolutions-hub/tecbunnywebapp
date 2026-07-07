import type { SupabaseClient } from '@supabase/supabase-js';
export interface TwoFactorSetup {
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
}
export interface TwoFactorVerification {
    success: boolean;
    message: string;
    backupCodeUsed?: boolean;
}
declare class TwoFactorManager {
    private resolveSupabaseClient;
    generateSecret(email: string): TwoFactorSetup;
    generateQRCode(otpauthUrl: string): Promise<string>;
    verifyToken(secret: string, token: string): boolean;
    private getEncryptionKey;
    private encryptSecret;
    private decryptSecret;
    private hashBackupCode;
    private verifyBackupCodeHash;
    verifyBackupCode(backupCodes: string[], usedCodes: string[], code: string): boolean;
    markBackupCodeUsed(backupCodes: string[], usedCodes: string[], code: string): string[];
    enableTwoFactor(userId: string, secret: string, backupCodes: string[], supabase?: SupabaseClient): Promise<boolean>;
    disableTwoFactor(userId: string, supabase?: SupabaseClient): Promise<boolean>;
    getTwoFactorStatus(userId: string, supabase?: SupabaseClient): Promise<{
        enabled: boolean;
        method: string | null;
        setupAt: string | null;
        backupCodesRemaining: number;
    } | null>;
    verifyTwoFactor(userId: string, token: string, supabase?: SupabaseClient): Promise<TwoFactorVerification>;
}
export declare const twoFactorManager: TwoFactorManager;
export {};
//# sourceMappingURL=two-factor-manager.d.ts.map