import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { RemovalRequest, Image } from "@/types";
import { v4 as uuidv4 } from "uuid";
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  getNextStatus,
  getCurrentApprovalStage,
} from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";

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
    const { requests: storedRequests } = loadFromLocalStorage();
    if (storedRequests?.length) {
      setRequests(storedRequests);
    }
  }, []);

  // Save requests to localStorage whenever they change
  useEffect(() => {
    const { currentUser } = loadFromLocalStorage();
    saveToLocalStorage(requests, currentUser);
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
        userId: user.id,
        userName: user.name,
        department: user.department,
        status: "PENDING_HOD",
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

            const approval = {
              stage: currentStage,
              approved,
              signature,
              rejectionReason,
              approvedBy: user.name,
              timestamp: new Date(),
            };

            const newStatus = approved
              ? getNextStatus(request.status)
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