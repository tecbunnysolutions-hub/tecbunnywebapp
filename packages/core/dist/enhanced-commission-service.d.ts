export interface CommissionCalculation {
    order_id: string;
    agent_id: string;
    pre_tax_amount: number;
    gst_amount: number;
    commission_rate: number;
    commission_amount: number;
    rule_id?: string;
    breakdown: CommissionBreakdown[];
}
export interface CommissionBreakdown {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    commission_rate: number;
    commission_amount: number;
    rule_applied?: string;
}
export interface CommissionRule {
    agent_id?: string;
    product_id?: string;
    product_category?: string;
    commission_rate: number;
    min_order_value?: number;
    valid_from?: string;
    valid_to?: string;
}
export declare class EnhancedCommissionService {
    private supabase;
    constructor();
    /**
     * Calculates a dynamic multiplier for 24-hour blitz operations
     */
    getBlitzMultiplier(agentId: string): Promise<number>;
    /**
     * Calculate commission for an order
     */
    calculateOrderCommission(orderId: string, agentId: string): Promise<{
        success: boolean;
        calculation?: CommissionCalculation;
        error?: string;
    }>;
    /**
     * Save commission record to database
     */
    saveCommissionRecord(calculation: CommissionCalculation): Promise<{
        success: boolean;
        commission_id?: string;
        error?: string;
    }>;
    /**
     * Trigger WhatsApp notification for agent commission
     */
    private triggerAgentWhatsApp;
    /**
     * Get agent commission rules
     */
    private getAgentCommissionRules;
    /**
     * Calculate commission for individual order item
     */
    private calculateItemCommission;
    /**
     * Get final commission rate considering minimum order value
     */
    private getFinalCommissionRate;
    /**
     * Update agent points balance
     */
    private updateAgentPoints;
    /**
     * Create or update commission rule
     */
    createCommissionRule(rule: CommissionRule): Promise<{
        success: boolean;
        rule_id?: string;
        error?: string;
    }>;
    /**
     * Get agent commission history
     */
    getAgentCommissions(agentId: string, startDate?: string, endDate?: string, status?: string): Promise<any[]>;
    /**
     * Award commission for an order (calculates and saves)
     */
    awardCommission(orderId: string, agentId: string, _orderTotal: number): Promise<{
        success: boolean;
        commission_id?: string;
        commission_amount?: number;
        error?: string;
    }>;
    /**
     * Process commission payments
     */
    processCommissionPayment(commissionIds: string[], _paymentDetails: {
        payment_method: string;
        transaction_id?: string;
        notes?: string;
    }): Promise<{
        success: boolean;
        processed_count?: number;
        error?: string;
    }>;
}
export declare const enhancedCommissionService: EnhancedCommissionService;
//# sourceMappingURL=enhanced-commission-service.d.ts.map