import { prisma } from '../db/prisma';
import type { CompletionChecklist, InstallationSchedule, Project, ProjectMilestone, ProjectTask } from '@tecbunny/database';

export class OrderProjectService {
  /**
   * Automate Project Creation from Confirmed Sales Order (5.5)
   */
  static async createProjectFromSalesOrder(params: {
    salesOrderId: string;
    projectName: string;
    customerId: string;
    budget: number;
    projectManagerId?: string;
  }) {
    const p = prisma as any;
    const projectNumber = `PRJ-${Date.now().toString().slice(-6)}`;

    const projectData = {
      id: `prj-${Date.now()}`,
      project_number: projectNumber,
      project_name: params.projectName,
      customer_id: params.customerId,
      sales_order_id: params.salesOrderId,
      project_manager_id: params.projectManagerId,
      budget: params.budget,
      status: 'CREATED',
      created_at: new Date().toISOString(),
    };

    if (p.projects) {
      return p.projects.create({ data: projectData });
    }

    return projectData;
  }

  /**
   * Milestone Management & Progress Calculation (5.8)
   */
  static async updateMilestoneStatus(params: {
    milestoneId: string;
    status: 'PENDING' | 'ACHIEVED' | 'DELAYED';
  }) {
    const p = prisma as any;

    if (p.project_milestones) {
      return p.project_milestones.update({
        where: { id: params.milestoneId },
        data: {
          status: params.status,
          ...(params.status === 'ACHIEVED' ? { completed_at: new Date().toISOString() } : {}),
        },
      });
    }

    return { id: params.milestoneId, status: params.status };
  }

  /**
   * Schedule Installation & Engineer Assignment (5.12)
   */
  static async scheduleInstallation(params: {
    projectId: string;
    engineerId: string;
    customerId: string;
    installationDate: string;
    siteAddress: string;
  }) {
    const p = prisma as any;

    const scheduleData = {
      id: `sch-${Date.now()}`,
      project_id: params.projectId,
      assigned_engineer_id: params.engineerId,
      customer_id: params.customerId,
      installation_date: params.installationDate,
      site_address: params.siteAddress,
      status: 'SCHEDULED',
    };

    if (p.installation_schedules) {
      return p.installation_schedules.create({ data: scheduleData });
    }

    return scheduleData;
  }

  /**
   * Completion Checklist Validation & Project Closure Gatekeeper (5.18)
   */
  static async validateAndCloseProject(projectId: string, checklist: Partial<CompletionChecklist>) {
    const mandatoryItems = [
      checklist.all_materials_installed,
      checklist.installation_photos_uploaded,
      checklist.testing_completed,
      checklist.customer_trained,
      checklist.documents_uploaded,
      checklist.completion_certificate_generated,
      checklist.customer_signature_captured,
      checklist.warranty_activated,
      checklist.final_invoice_generated,
    ];

    const isFullyComplete = mandatoryItems.every(Boolean);

    if (!isFullyComplete) {
      return {
        canClose: false,
        message: 'Cannot close project until all 9 mandatory checklist items are verified complete.',
      };
    }

    const p = prisma as any;
    if (p.projects) {
      await p.projects.update({
        where: { id: projectId },
        data: { status: 'COMPLETED' },
      });
    }

    return {
      canClose: true,
      status: 'COMPLETED',
      closedAt: new Date().toISOString(),
    };
  }
}
