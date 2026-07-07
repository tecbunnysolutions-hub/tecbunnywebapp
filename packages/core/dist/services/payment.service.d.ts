import { SupabaseClient } from '@supabase/supabase-js';
import { type PayuEnvironment } from '../payu-service';
export interface InitiatePayuPaymentParams {
    orderId: string;
    userId: string | null;
    userRole: string | null;
    clientIp: string;
    host: string | undefined;
    correlationId: string;
    staffPaymentRoles: Set<string>;
}
export interface UpdatePaymentStatusParams {
    orderId: string;
    paymentId?: string;
    status: 'pending' | 'success' | 'failed' | 'refunded';
    amount: number;
    gateway?: string;
    transactionId?: string;
    failureReason?: string;
    correlationId: string;
}
export declare class PaymentService {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    private generateTransactionId;
    private resolveEnvironmentPreference;
    initiatePayuPayment(params: InitiatePayuPaymentParams): Promise<{
        paymentUrl: string;
        params: {
            readonly service_provider: "payu_paisa";
            readonly udf2?: string | undefined;
            readonly udf3?: string | undefined;
            readonly udf4?: string | undefined;
            readonly udf5?: string | undefined;
            readonly udf6?: string | undefined;
            readonly key: any;
            readonly txnid: string;
            readonly amount: string;
            readonly productinfo: string;
            readonly firstname: string;
            readonly email: string;
            readonly phone: string;
            readonly surl: string;
            readonly furl: string;
            readonly hash: string;
            readonly udf1: string;
        };
        transactionId: string;
        environment: PayuEnvironment;
    }>;
    updatePaymentStatus(params: UpdatePaymentStatusParams): Promise<{
        orderId: string;
        paymentStatus: "success" | "pending" | "failed" | "refunded";
        orderStatus: string;
        amount: number;
        updatedAt: any;
    }>;
    getPaymentStatus(orderId: string): Promise<{
        id: any;
        status: any;
        total: any;
        created_at: any;
        updated_at: any;
    }>;
}
//# sourceMappingURL=payment.service.d.ts.map