export type UserRole = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4' | 'SECURITY' | 'ADMIN';

export type RemovalStatus = 
  | 'DRAFT' 
  | 'PENDING_LEVEL_2' 
  | 'PENDING_LEVEL_3' 
  | 'PENDING_LEVEL_4' 
  | 'PENDING_SECURITY' 
  | 'APPROVED' 
  | 'REJECTED';

export type RemovalTerm = 'RETURNABLE' | 'NON_RETURNABLE';

export interface Department {
  id: number;
  name: string;
}

export interface RemovalReason {
  id: number;
  name: string;
}

export interface RemovalImage {
  id: number;
  url: string;  // Base64 string
  removalId: number;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  password?: string; // Optional as we don't always want to expose this
  position: string;
  role: UserRole;
  departmentId: number;
  department?: Department;
}

export interface Approval {
  id: number;
  removalId: number;
  level: 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4' | 'SECURITY';
  approverId: number;
  approver?: User;
  approval: string;
  signature?: string;  // Base64 string
  signatureDate?: Date;
}

export interface RemovalItem {
  id?: number;
  removalId: number;
  description: string;
  removalReasonId: number;
  removalReason?: RemovalReason;
  customReason?: string;
}

export interface Removal {
  id: number;
  userId: number;
  user?: User;
  removalTerms: RemovalTerm;
  dateFrom: Date;
  dateTo?: Date;
  employee: string;
  departmentId: number;
  department?: Department;
  items: RemovalItem[];
  images: RemovalImage[];
  approvals: Approval[];
  status: RemovalStatus;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface RemovalNotification {
  id: number;
  removalId: number;
  removal?: Removal;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  userId: number;
  user?: User;
}

export interface ReturnRecord {
  id: number;
  removalId: number;
  removal?: Removal;
  returnDate: Date;
  condition: string;
  notes?: string;
  receivedById: number;
  receivedBy?: User;
  createdAt: Date;
}

export interface ExtensionRequest {
  id: number;
  removalId: number;
  removal?: Removal;
  originalDate: Date;
  newDate: Date;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedById: number;
  requestedBy?: User;
  processedById?: number;
  processedBy?: User;
  processedAt?: Date;
  comments?: string;
  createdAt: Date;
}

// Activity type for the activity feed
export interface Activity {
  id: number;
  type: string;
  status: string;
  createdAt: Date;
  userName: string;
  description: string;
  items?: RemovalItem[];
  removalTerms?: RemovalTerm;
  dateFrom?: Date;
  dateTo?: Date;
  department?: string;
}