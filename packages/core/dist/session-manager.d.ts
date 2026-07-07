export declare const SESSION_EXPIRED_EVENT = "tecbunny:session-expired-event";
export declare class SessionManager {
    private static instance;
    private get supabase();
    private refreshInterval;
    private expiryTimer;
    private isExpiring;
    static getInstance(): SessionManager;
    registerSessionStart(startTimestamp?: number): void;
    clearSessionTracking(resetExpiring?: boolean): void;
    ensureSessionTimer(): void;
    startSessionRefresh(): void;
    stopSessionRefresh(): void;
    checkSessionValidity(): Promise<boolean>;
    forceRefreshSession(): Promise<boolean>;
    private getStoredSessionStart;
    private startSessionTimer;
    private clearExpiryTimer;
    private isSessionExpired;
    private broadcastSessionExpiry;
    private handleSessionExpiry;
}
//# sourceMappingURL=session-manager.d.ts.map