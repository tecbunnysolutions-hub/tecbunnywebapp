export interface LeadMetrics {
  totalLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  avgLeadScore: number;
  convertedLeads: number;
  pendingFollowup: number;
  todayLeads: number;
}

export interface RevenueMetrics {
  paidRevenue: number;
  pendingRevenue: number;
  todayRevenue: number;
  yesterdayRevenue: number;
  weekRevenue: number;
  paymentCount: number;
  paidCount: number;
  pendingCount: number;
}

export interface OrderTrend {
  orderDate: string;
  orderCount: number;
  orderValue: number;
}

export interface LeadSourcePerformance {
  source: string;
  totalLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  avgScore: number;
  conversionRate: number;
}

export interface LeadAssignmentStatus {
  assignedTo: string;
  assignedToName: string;
  totalAssigned: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  converted: number;
  pendingFollowup: number;
}

export interface HotLead {
  id: string;
  name: string;
  company: string;
  estimatedValue: number;
  leadScore: number;
  source: string;
  assignedToName: string;
  lastContactAt: string | null;
  nextFollowupAt: string | null;
  status: string;
  contactMethod: string;
}


export interface LeadCommandCenterData {
  leadMetrics: LeadMetrics;
  revenueMetrics: RevenueMetrics;
  hotLeads: HotLead[];
  sourcePerformance: LeadSourcePerformance[];
  assignmentStatus: LeadAssignmentStatus[];
}
