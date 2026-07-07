import { NextRequest, NextResponse } from 'next/server';
export interface EmailHandlerConfig<T, R = {
    success: true;
}> {
    validate: (body: any) => {
        ok: true;
        data: T;
    } | {
        ok: false;
        error: string;
    };
    action: (data: T) => Promise<boolean | R>;
    rate: {
        bucket: string;
        limit: number;
        windowMs: number;
    };
}
export declare function handleEmailPost<T, R = {
    success: true;
}>(request: NextRequest, cfg: EmailHandlerConfig<T, R>): Promise<NextResponse<any>>;
//# sourceMappingURL=api-email-route.d.ts.map