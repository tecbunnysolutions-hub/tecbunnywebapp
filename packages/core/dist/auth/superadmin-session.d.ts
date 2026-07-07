declare const SUPERADMIN_SESSION_TTL_SECONDS: number;
type SuperadminSessionPayload = {
    sub: 'superadmin-root-id';
    email: string;
    iat: number;
    exp: number;
    jti: string;
};
export declare function createSuperadminSessionToken(email: string): Promise<string>;
export declare function verifySuperadminSessionToken(token: string | undefined | null): Promise<SuperadminSessionPayload | null>;
export declare function revokeSuperadminSessionToken(token: string): Promise<void>;
export { SUPERADMIN_SESSION_TTL_SECONDS };
//# sourceMappingURL=superadmin-session.d.ts.map