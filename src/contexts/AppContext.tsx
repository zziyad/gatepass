import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { RemovalRequest, User, RemovalReason, Image } from "@/types";
import { v4 as uuidv4 } from "uuid";
import {
  mockRemovalReasons,
  saveToLocalStorage, // Keep for requests for now
  loadFromLocalStorage,
  getNextStatus,
  getCurrentApprovalStage,
} from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";
import authService from "@/services/auth";

// Define a type for the item data
interface ItemData {
  description: string;
  reasonId: string;
  customReason?: string;
}

// Split the context into smaller, more focused contexts
// 1. AuthContext for user authentication
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// 2. RequestsContext for request-related operations
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

// 3. ConfigContext for application configuration
interface ConfigContextType {
  removalReasons: RemovalReason[];
}

// 3. ConfigContext for application configuration
// ... (ConfigContextType interface definition remains the same) ...

// Create the contexts
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const RequestsContext = createContext<RequestsContextType | undefined>(
  undefined
);
const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

// Combined AppContext type for backward compatibility
interface AppContextType
  extends AuthContextType,
    RequestsContextType,
    ConfigContextType {}

// Provider Props
interface AppProviderProps {
  children: ReactNode;
}

// Create individual providers
export function AuthProvider({ children }: AppProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  // Users list might be fetched from an API later or removed if not needed globally
  const [users] = useState<User[]>([]); // Initialize as empty

  // Check for existing session on mount by verifying cookie
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Use the auth service to check authentication status
        const isUserAuthenticated = await authService.isAuthenticated();
        
        if (isUserAuthenticated) {
          // If authenticated, fetch user data
          const userData = await authService.getCurrentUser();
          
          if (userData) {
            // User data is already properly formatted from the service
            setUser(userData);
          }
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        // No need to clear localStorage as we're using cookies now
      }
    };
    
    checkAuthStatus();
  }, []);

  // Login function
  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      const userData = await authService.login({ email, password });
      
      if (userData) {
        setUser(userData);
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Login failed",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      console.error('Login failed:', err);
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, []);

  // Implement logout function
  const handleLogout = useCallback(async () => {
    try {
      // Call the auth service logout function
      const success = await authService.logout();
      
      if (success) {
        // Clear the user state
        setUser(null);
        // Success message
        toast({
          title: "Success",
          description: "Logged out successfully",
        });
        // Redirect to login page
        window.location.href = '/login';
      } else {
        throw new Error("Logout failed");
      }
    } catch (err) {
      console.error('Logout failed:', err);
      toast({
        title: "Error",
        description: "Logout failed. Please try again.",
        variant: "destructive",
      });
    }
  }, []);

  // Expose user, setUser, and auth functions
  const value = useMemo(
    () => ({
      user,
      setUser,
      users,
      login: handleLogin,
      logout: handleLogout,
    }),
    [user, users, handleLogin, handleLogout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function RequestsProvider({ children }: AppProviderProps) {
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
    [
      requests,
      addRequest,
      getRequest,
      updateRequestStatus,
      addImage,
      removeImage,
    ]
  );

  return (
    <RequestsContext.Provider value={value}>
      {children}
    </RequestsContext.Provider>
  );
}

export function ConfigProvider({ children }: AppProviderProps) {
  const [removalReasons] = useState<RemovalReason[]>(mockRemovalReasons);

  const value = useMemo(
    () => ({
      removalReasons,
    }),
    [removalReasons]
  );

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
}

// Combined provider for backward compatibility
export function AppProvider({ children }: AppProviderProps) {
  return (
    <AuthProvider>
      <ConfigProvider>
        <RequestsProvider>{children}</RequestsProvider>
      </ConfigProvider>
    </AuthProvider>
  );
}

// Custom hooks to use the contexts
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useRequests() {
  const context = useContext(RequestsContext);
  if (context === undefined) {
    throw new Error("useRequests must be used within a RequestsProvider");
  }
  return context;
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}

// Combined hook for backward compatibility
export function useApp(): AppContextType {
  const auth = useAuth();
  const requests = useRequests();
  const config = useConfig();

  return {
    ...auth,
    ...requests,
    ...config,
  };
}
