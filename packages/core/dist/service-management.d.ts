/**
 * Service Management System
 * Handles service engineer assignments, ticket management, and service billing
 */
import type { ServiceTicket, ServiceEngineer, ServiceTicketStatus, ServiceTicketPriority, ServiceEngineerSkillLevel } from '@tecbunny/core';
export interface ServiceTicketRequest {
    service_id?: string;
    customer_id?: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    customer_address?: string;
    service_pincode?: string;
    pincode?: string;
    issue_description: string;
    priority?: ServiceTicketPriority;
}
export interface EngineerAssignment {
    ticket_id: string;
    engineer_id: string;
    scheduled_date?: string;
    estimated_duration?: number;
    notes?: string;
}
export interface ServiceCompletion {
    ticket_id: string;
    engineer_notes?: string;
    service_charge?: number;
    parts_used?: Array<{
        part_name: string;
        quantity: number;
        unit_cost: number;
        warranty_days?: number;
    }>;
    photos?: string[];
    actual_duration?: number;
}
export declare class ServiceManagementService {
    private supabase;
    constructor();
    /**
     * Create a new service ticket
     */
    createServiceTicket(request: ServiceTicketRequest): Promise<{
        success: boolean;
        ticket_id?: string;
        ticket?: ServiceTicket;
        error?: string;
    }>;
    /**
     * Get available service engineers based on specialization and location
     */
    getAvailableEngineers(specialization?: string, location?: {
        lat: number;
        lng: number;
    }, radius?: number): Promise<ServiceEngineer[]>;
    /**
     * Assign engineer to a service ticket
     */
    assignEngineer(assignment: EngineerAssignment): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Update ticket status
     */
    updateTicketStatus(ticketId: string, status: ServiceTicketStatus, notes?: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Complete service ticket with billing information
     */
    completeService(completion: ServiceCompletion): Promise<{
        success: boolean;
        total_cost?: number;
        error?: string;
    }>;
    /**
     * Get service tickets for an engineer
     */
    getEngineerTickets(engineerId: string, status?: ServiceTicketStatus): Promise<ServiceTicket[]>;
    /**
     * Get customer service history
     */
    getCustomerServiceHistory(customerId: string): Promise<ServiceTicket[]>;
    /**
     * Create or update service engineer profile
     */
    createOrUpdateEngineer(userId: string, engineerData: {
        employee_id?: string;
        specializations: string[];
        skill_level: ServiceEngineerSkillLevel;
        available_hours?: Record<string, any>;
        service_radius?: number;
    }): Promise<{
        success: boolean;
        engineer_id?: string;
        error?: string;
    }>;
    /**
     * Update engineer performance statistics
     */
    private updateEngineerStats;
    /**
     * Submit customer feedback and rating
     */
    submitCustomerFeedback(ticketId: string, rating: number, feedback?: string): Promise<{
        success: boolean;
        error?: string;
    }>;
}
export declare const serviceManagementService: ServiceManagementService;
//# sourceMappingURL=service-management.d.ts.map