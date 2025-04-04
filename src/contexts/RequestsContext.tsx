import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { RemovalRequest, Image, RemovalStatus } from "@/types";
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
  requests: RemovalRequest[];
  addRequest: (
    request: Omit<
      RemovalRequest,
      | "id"
      | "userId"
      | "userName"
      | "department"
      | "status"
      | "approvals"
      | "createdAt"
      | "updatedAt"
    >
  ) => string | undefined;
  getRequest: (id: string) => RemovalRequest | undefined;
  updateRequestStatus: (
    id: string,
    approved: boolean,
    signature?: string,
    rejectionReason?: string
  ) => void;
  addImage: (requestId: string, imageUrl: string) => void;
  removeImage: (requestId: string, imageId: string) => void;
}

// Create the context
const RequestsContext = createContext<RequestsContextType | undefined>(undefined);

// Provider Props
interface RequestsProviderProps {
  children: ReactNode;
}

export function RequestsProvider({ children }: RequestsProviderProps) {
  const { user } = useAuth(); // Use the auth context
  const [requests, setRequests] = useState<RemovalRequest[]>([]);

  // Load requests from localStorage on initial render
  useEffect(() => {
    const storedData = loadFromLocalStorage("requestsData");
    if (storedData?.requests?.length) {
      // Convert string dates back to Date objects
      const parsedRequests = storedData.requests.map((request: any) => ({
        ...request,
        createdAt: request.createdAt ? new Date(request.createdAt) : new Date(),
        updatedAt: request.updatedAt ? new Date(request.updatedAt) : new Date(),
        dateFrom: request.dateFrom ? new Date(request.dateFrom) : null,
        dateTo: request.dateTo ? new Date(request.dateTo) : null,
        // Also convert dates in approvals
        approvals: request.approvals?.map((approval: any) => ({
          ...approval,
          timestamp: approval.timestamp ? new Date(approval.timestamp) : new Date()
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
        RemovalRequest,
        | "id"
        | "userId"
        | "userName"
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
        return;
      }

      const now = new Date();

      const newRequest: RemovalRequest = {
        id: uuidv4(),
        userId: String(user.id),
        userName: user.fullName,
        departmentName: user.departmentName || user.department || "Unknown",
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

      return newRequest.id;
    },
    [user]
  );

  const getRequest = useCallback(
    (id: string) => {
      return requests.find((request) => request.id === id);
    },
    [requests]
  );

  const updateRequestStatus = useCallback(
    (
      id: string,
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

            // Ensure stage is one of the allowed values for Approval type
            let approvalStage: 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4' | 'SECURITY' = 'LEVEL_2';
            
            if (currentStage === 'Level 2' || currentStage === 'Level 3' || 
                currentStage === 'Level 4' || currentStage === 'Security') {
              approvalStage = currentStage === 'Level 2' ? 'LEVEL_2' : 
                              currentStage === 'Level 3' ? 'LEVEL_3' : 
                              currentStage === 'Level 4' ? 'LEVEL_4' : 
                              'SECURITY';
            }

            const approval = {
              stage: approvalStage,
              approved,
              signature,
              rejectionReason,
              approvedBy: user.fullName,
              timestamp: new Date(),
            };

            const newStatus = approved
              ? getNextStatus(request.status, approved)
              : "REJECTED";

            const updatedRequest = {
              ...request,
              status: newStatus,
              approvals: [...request.approvals, approval],
              updatedAt: new Date(),
            };

            const statusMessage = approved ? "approved" : "rejected";

            toast({
              title: `Request ${statusMessage}`,
              description: `The removal request has been ${statusMessage} successfully.`,
            });

            return updatedRequest;
          }
          return request;
        });
      });
    },
    [user]
  );

  const addImage = useCallback((requestId: string, imageUrl: string) => {
    setRequests((prevRequests) => {
      return prevRequests.map((request) => {
        if (request.id === requestId) {
          const newImage: Image = {
            id: uuidv4(),
            url: imageUrl,
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

  const removeImage = useCallback((requestId: string, imageId: string) => {
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