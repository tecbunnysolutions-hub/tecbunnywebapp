/** Core domain entities — framework-agnostic, no imports from infra layers */

export interface OrderLine {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  hsnCode?: string;
  totalPrice: number;
  discount?: number;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  items: OrderLine[];
  subtotal: number;
  discountAmount: number;
  gstAmount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  deliveryAddress?: Address;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST' | 'DEAD';
  heatLevel?: 'COLD' | 'WARM' | 'HOT';
  leadScore: number;
  assignedTo?: string;
  subCategory?: string;
  sourceName?: string;
  notes?: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  handle?: string;
  title: string;
  description?: string;
  price: number;
  mrp?: number;
  gstRate: number;
  hsnCode?: string;
  status: 'active' | 'inactive' | 'draft';
  stockQuantity?: number;
  isDeleted: boolean;
  createdAt: Date;
}

export interface ServiceTicket {
  id: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  issueDescription: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedEngineerId?: string;
  scheduledDate?: Date;
  resolvedAt?: Date;
  createdAt: Date;
}

export interface ReferralCode {
  id: string;
  userId: string;
  code: string;
  totalUses: number;
  totalRewards: number;
  isActive: boolean;
  createdAt: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  tags: string[];
  status: 'draft' | 'published';
  authorId: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
