import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { Removal, RemovalStatus, RemovalImage, Approval } from "@/types";
import { User } from "@/types/user";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";

// Local storage utility functions
const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
};

const loadFromLocalStorage = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error);
    return null;
  }
};

// Helper to get the next status in the approval flow
const getNextStatus = (currentStatus: RemovalStatus, approved: boolean): RemovalStatus => {
  if (!approved) return 'REJECTED';
  
  const statusFlow: Record<RemovalStatus, RemovalStatus> = {
    'DRAFT': 'PENDING_LEVEL_2',
    'PENDING_LEVEL_2': 'PENDING_LEVEL_3',
    'PENDING_LEVEL_3': 'PENDING_LEVEL_4',
    'PENDING_LEVEL_4': 'PENDING_SECURITY',
    'PENDING_SECURITY': 'APPROVED',
    'APPROVED': 'APPROVED',
    'REJECTED': 'REJECTED'
  };
  
  return statusFlow[currentStatus] || currentStatus;
};

// Helper to get the current approval stage
const getCurrentApprovalStage = (status: RemovalStatus): string => {
  const stageMap: Record<RemovalStatus, string> = {
    'DRAFT': 'draft',
    'PENDING_LEVEL_2': 'Level 2',
    'PENDING_LEVEL_3': 'Level 3',
    'PENDING_LEVEL_4': 'Level 4',
    'PENDING_SECURITY': 'Security',
    'APPROVED': 'Completed',
    'REJECTED': 'Rejected'
  };
  
  return stageMap[status] || 'Unknown';
};

// RequestsContext for request-related operations
interface RequestsContextType {
  requests: Removal[];
  addRequest: (
    request: Omit<
      Removal,
      | "id"
      | "userId"
      | "user"
      | "department"
      | "status"
      | "approvals"
      | "createdAt"
      | "updatedAt"
    >
  ) => number;
  getRequest: (id: number) => Removal | undefined;
  updateRequestStatus: (
    id: number,
    approved: boolean,
    signature?: string,
    rejectionReason?: string
  ) => void;
  addImage: (requestId: number, imageUrl: string) => void;
  removeImage: (requestId: number, imageId: number) => void;
}

// Create the context
const RequestsContext = createContext<RequestsContextType | undefined>(undefined);

// Provider Props
interface RequestsProviderProps {
  children: ReactNode;
}

export function RequestsProvider({ children }: RequestsProviderProps) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Removal[]>([]);

  // Load requests from localStorage on initial render
  useEffect(() => {
    const storedData = loadFromLocalStorage("requestsData");
    if (storedData?.requests?.length) {
      // Convert string dates back to Date objects and ensure proper types
      const parsedRequests = storedData.requests.map((request: any) => ({
        ...request,
        id: Number(request.id),
        userId: Number(request.userId),
        createdAt: request.createdAt ? new Date(request.createdAt) : new Date(),
        updatedAt: request.updatedAt ? new Date(request.updatedAt) : new Date(),
        dateFrom: request.dateFrom ? new Date(request.dateFrom) : null,
        dateTo: request.dateTo ? new Date(request.dateTo) : null,
        // Convert approvals to match new structure
        approvals: request.approvals?.map((approval: any, index: number) => ({
          id: index + 1,
          removalId: Number(request.id),
          level: approval.stage,
          approverId: 0, // Default value since we don't have this in old data
          approval: approval.approved ? "APPROVED" : "REJECTED",
          signature: approval.signature,
          signatureDate: approval.timestamp ? new Date(approval.timestamp) : new Date()
        })) || []
      }));
      setRequests(parsedRequests);
    }
  }, []);

  // Save requests to localStorage whenever they change
  useEffect(() => {
    saveToLocalStorage("requestsData", { requests });
  }, [requests]);

  const addRequest = useCallback(
    (
      newRequestData: Omit<
        Removal,
        | "id"
        | "userId"
        | "user"
        | "department"
        | "status"
        | "approvals"
        | "createdAt"
        | "updatedAt"
      >
    ) => {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a request",
          variant: "destructive",
        });
        return 0;
      }

      const now = new Date();
      const newId = Math.floor(Math.random() * 1000000) + 1; // Generate a random numeric ID

      const newRequest: Removal = {
        id: newId,
        userId: typeof user.id === 'string' ? parseInt(user.id, 10) : user.id,
        user: {
          id: typeof user.id === 'string' ? parseInt(user.id, 10) : user.id,
          fullName: user.fullName,
          email: user.email,
          position: user.position || "",
          role: user.role,
          departmentId: 0 // Default value since we don't have this in the User type
        },
        departmentId: 0, // Default value since we don't have this in the User type
        status: "PENDING_LEVEL_2",
        approvals: [],
        createdAt: now,
        updatedAt: now,
        ...newRequestData,
      };

      setRequests((prevRequests) => [...prevRequests, newRequest]);

      toast({
        title: "Success",
        description: "Removal request created successfully",
      });

      return newId;
    },
    [user]
  );

  const getRequest = useCallback(
    (id: number) => {
      return requests.find((request) => request.id === id);
    },
    [requests]
  );

  const updateRequestStatus = useCallback(
    (
      id: number,
      approved: boolean,
      signature?: string,
      rejectionReason?: string
    ) => {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to approve or reject requests",
          variant: "destructive",
        });
        return;
      }

      setRequests((prevRequests) => {
        return prevRequests.map((request) => {
          if (request.id === id) {
            const currentStage = getCurrentApprovalStage(request.status);

            if (!currentStage) {
              return request;
            }

            const level: Approval['level'] = 
              currentStage === 'Level 2' ? 'LEVEL_2' :
              currentStage === 'Level 3' ? 'LEVEL_3' :
              currentStage === 'Level 4' ? 'LEVEL_4' :
              currentStage === 'Security' ? 'SECURITY' :
              'LEVEL_2';

            const newApproval: Approval = {
              id: (request.approvals.length + 1),
              removalId: request.id,
              level,
              approverId: typeof user.id === 'string' ? parseInt(user.id, 10) : user.id,
              approval: approved ? "APPROVED" : "REJECTED",
              signature,
              signatureDate: new Date()
            };

            const newStatus = getNextStatus(request.status, approved);

            const statusMessage = approved ? "approved" : "rejected";
            toast({
              title: `Request ${statusMessage}`,
              description: `The removal request has been ${statusMessage} successfully.`,
            });

            return {
              ...request,
              status: newStatus,
              approvals: [...request.approvals, newApproval],
              updatedAt: new Date(),
            };
          }
          return request;
        });
      });
    },
    [user]
  );

  const addImage = useCallback((requestId: number, imageUrl: string) => {
    setRequests((prevRequests) => {
      return prevRequests.map((request) => {
        if (request.id === requestId) {
          const newImage: RemovalImage = {
            id: request.images.length + 1,
            removalId: requestId,
            url: imageUrl
          };

          return {
            ...request,
            images: [...(request.images || []), newImage],
            updatedAt: new Date(),
          };
        }
        return request;
      });
    });
  }, []);

  const removeImage = useCallback((requestId: number, imageId: number) => {
    setRequests((prevRequests) => {
      return prevRequests.map((request) => {
        if (request.id === requestId) {
          return {
            ...request,
            images: request.images.filter((image) => image.id !== imageId),
            updatedAt: new Date(),
          };
        }
        return request;
      });
    });
  }, []);

  const value = useMemo(
    () => ({
      requests,
      addRequest,
      getRequest,
      updateRequestStatus,
      addImage,
      removeImage,
    }),
    [requests, addRequest, getRequest, updateRequestStatus, addImage, removeImage]
  );

  return (
    <RequestsContext.Provider value={value}>
      {children}
    </RequestsContext.Provider>
  );
}

// Hook for using the requests context
export const useRequests = (): RequestsContextType => {
  const context = useContext(RequestsContext);
  if (context === undefined) {
    throw new Error("useRequests must be used within a RequestsProvider");
  }
  return context;
};

export default RequestsContext; 