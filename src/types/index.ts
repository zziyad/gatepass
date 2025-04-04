export type UserRole = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4' | 'SECURITY' | 'ADMIN';

export type RemovalStatus = 'DRAFT' | 'PENDING_LEVEL_2' | 'PENDING_LEVEL_3' | 'PENDING_LEVEL_4' | 'PENDING_SECURITY' | 'APPROVED' | 'REJECTED';

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
  id: string | number; // Allow both string and number types
  fullName: string;
  email: string;
  department?: string; // Make optional to support departmentName pattern
  departmentName?: string; // Some API responses use this format instead
  position?: string;
  role: UserRole;
}

// For API requests - matches schema directly
export interface ApiUser {
  id: number;
  email: string;
  fullName: string;
  position?: string;
  role: UserRole;
  departmentId: number;
  department?: {
    id: number;
    name: string;
  };
}

export interface Approval {
  stage: 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4' | 'SECURITY';
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
  departmentName: string;
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
