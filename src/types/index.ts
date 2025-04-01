export type UserRole = 'EMPLOYEE' | 'HOD' | 'FINANCE' | 'MOD' | 'SECURITY' | 'ADMIN';

export type RemovalStatus = 'DRAFT' | 'PENDING_HOD' | 'PENDING_FINANCE' | 'PENDING_MOD' | 'PENDING_SECURITY' | 'APPROVED' | 'REJECTED';

export type RemovalTerm = 'RETURNABLE' | 'NON_RETURNABLE';

export interface RemovalReason {
  id: string;
  name: string;
}

export interface Image {
  id: string;
  url: string;
}

export interface User {
  id: string; // Converted from number for compatibility
  name: string;
  email: string;
  department: string; // Just the name for display
  role: UserRole;
}

// For API requests - matches schema directly
export interface ApiUser {
  id: number;
  email: string;
  role: UserRole;
  departmentId: number;
  department?: {
    id: number;
    name: string;
  };
}

export interface Approval {
  stage: 'HOD' | 'FINANCE' | 'MOD' | 'SECURITY';
  approved: boolean;
  signature?: string;
  rejectionReason?: string;
  approvedBy?: string;
  timestamp: Date;
}

export interface RemovalRequest {
  id: string;
  userId: string;
  userName: string;
  department: string;
  term: RemovalTerm;
  dateFrom: Date;
  dateTo?: Date;
  targetDepartment?: string;
  employee?: string;
  itemDescription: string;
  removalReasonId: string;
  customReason?: string;
  images: Image[];
  status: RemovalStatus;
  approvals: Approval[];
  createdAt: Date;
  updatedAt: Date;
}
