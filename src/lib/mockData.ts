import {
  RemovalReason,
  RemovalRequest,
  User,
  RemovalStatus,
  UserRole,
  Approval,
} from "@/types";
import { v4 as uuidv4 } from "uuid";

export const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    department: "IT",
    role: "EMPLOYEE",
    email: "john@z.com",
  },
  {
    id: "2",
    name: "Jane Smith",
    department: "IT",
    role: "HOD",
    email: "jane@z.com",
  },
  {
    id: "3",
    name: "Mike Johnson",
    department: "FINANCE",
    role: "FINANCE",
    email: "mike@z.com",
  },
  {
    id: "4",
    name: "Sarah Williams",
    department: "MANAGEMENT",
    role: "MOD",
    email: "sarah@z.com",
  },
  {
    id: "5",
    name: "David Brown",
    department: "SECURITY",
    role: "SECURITY",
    email: "david@z.com",
  },
  {
    id: "6",
    name: "Emily Davis",
    department: "HR",
    role: "EMPLOYEE",
    email: "emily@z.com",
  },
  {
    id: "7",
    name: "Admin User",
    department: "MANAGEMENT",
    role: "ADMIN",
    email: "admin@z.com",
  },
];

// Mock data for development
export const mockDepartments = [
  { id: 1, name: "IT Department" },
  { id: 2, name: "Finance Department" },
  { id: 3, name: "HR Department" },
  { id: 4, name: "Operations" },
  { id: 5, name: "Marketing" },
  { id: 6, name: "Research & Development" },
];

export const mockRemovalReasons: RemovalReason[] = [
  { id: "1", name: "Damaged Equipment" },
  { id: "2", name: "Obsolete Equipment" },
  { id: "3", name: "Personal Item Removal" },
  { id: "4", name: "Transfer to Another Department" },
  { id: "5", name: "Maintenance/Repair" },
  { id: "6", name: "Other (Specify)" },
];

export const mockRequests: RemovalRequest[] = [
  {
    id: "1",
    userId: "1",
    userName: "John Doe",
    department: "IT",
    term: "RETURNABLE",
    dateFrom: new Date(),
    dateTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    targetDepartment: "HR",
    employee: undefined,
    itemDescription: "Dell Laptop XPS 15",
    removalReasonId: "3",
    customReason: undefined,
    images: [{ id: "1", url: "https://picsum.photos/id/0/200/300" }],
    status: "PENDING_HOD",
    approvals: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    userId: "6",
    userName: "Emily Davis",
    department: "HR",
    term: "NON_RETURNABLE",
    dateFrom: new Date(),
    dateTo: undefined,
    targetDepartment: undefined,
    employee: "Sarah Johnson",
    itemDescription: "Office Chair",
    removalReasonId: "4",
    customReason: undefined,
    images: [
      { id: "2", url: "https://picsum.photos/id/1/200/300" },
      { id: "3", url: "https://picsum.photos/id/2/200/300" },
    ],
    status: "PENDING_FINANCE",
    approvals: [
      {
        stage: "HOD",
        approved: true,
        signature:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAA",
        approvedBy: "Jane Smith",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

// Context and local storage management
export const STORAGE_KEY = "item-removal-app-state";

// Debounce function to limit the frequency of localStorage writes
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

// Regular save function
const _saveToLocalStorage = (
  requests: RemovalRequest[],
  currentUser: User | null
) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        requests,
        currentUser,
      })
    );
  } catch (error) {
    console.error("Error saving to localStorage", error);
  }
};

// Debounced version that only saves after 300ms of inactivity
export const saveToLocalStorage = debounce(_saveToLocalStorage, 300);

// Optimized version of loadFromLocalStorage with better error handling and performance
export const loadFromLocalStorage = (): {
  requests: RemovalRequest[];
  currentUser: User | null;
} => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      return {
        requests: mockRequests,
        currentUser: null,
      };
    }

    const data = JSON.parse(storedData);

    // Convert date strings back to Date objects
    // Use a more efficient approach with a single map operation
    const requests = Array.isArray(data.requests)
      ? data.requests.map((req: any) => ({
          ...req,
          dateFrom: req.dateFrom ? new Date(req.dateFrom) : undefined,
          dateTo: req.dateTo ? new Date(req.dateTo) : undefined,
          createdAt: req.createdAt ? new Date(req.createdAt) : new Date(),
          updatedAt: req.updatedAt ? new Date(req.updatedAt) : new Date(),
          approvals: Array.isArray(req.approvals)
            ? req.approvals.map((approval: any) => ({
                ...approval,
                timestamp: approval.timestamp
                  ? new Date(approval.timestamp)
                  : new Date(),
              }))
            : [],
        }))
      : mockRequests;

    return {
      requests,
      currentUser: data.currentUser || null,
    };
  } catch (error) {
    console.error("Error loading data from localStorage", error);
    return {
      requests: mockRequests,
      currentUser: null,
    };
  }
};

export const getNextStatus = (currentStatus: RemovalStatus): RemovalStatus => {
  const statusFlow: Record<RemovalStatus, RemovalStatus> = {
    DRAFT: "PENDING_HOD",
    PENDING_HOD: "PENDING_FINANCE",
    PENDING_FINANCE: "PENDING_MOD",
    PENDING_MOD: "PENDING_SECURITY",
    PENDING_SECURITY: "APPROVED",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
  };

  return statusFlow[currentStatus];
};

export const getCurrentApprovalStage = (
  status: RemovalStatus
): Approval["stage"] | null => {
  switch (status) {
    case "PENDING_HOD":
      return "HOD";
    case "PENDING_FINANCE":
      return "FINANCE";
    case "PENDING_MOD":
      return "MOD";
    case "PENDING_SECURITY":
      return "SECURITY";
    default:
      return null;
  }
};

export const canUserApprove = (
  userRole: UserRole,
  requestStatus: RemovalStatus
): boolean => {
  const roleStatusMap: Record<UserRole, RemovalStatus[]> = {
    EMPLOYEE: [],
    HOD: ["PENDING_HOD"],
    FINANCE: ["PENDING_FINANCE"],
    MOD: ["PENDING_MOD"],
    SECURITY: ["PENDING_SECURITY"],
    ADMIN: [
      "PENDING_HOD",
      "PENDING_FINANCE",
      "PENDING_MOD",
      "PENDING_SECURITY",
    ],
  };

  return roleStatusMap[userRole]?.includes(requestStatus) || false;
};

// Utility to create a mock API response for dev/test
export const createMockApiResponse = <T>(data: T, status = "success") => {
  return {
    status,
    response: data,
  };
};
