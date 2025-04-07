import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { User } from "@/types/user";
import { toast } from "@/hooks/use-toast";
import authService, { LoginCredentials } from "@/services/auth";

// AuthContext for user authentication
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  users: User[];
  loading: boolean; // Add loading state
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Initialize loading state
  // Users list might be fetched from an API later or removed if not needed globally
  const [users] = useState<User[]>([]); // Initialize as empty

  // Check for existing session on mount by verifying cookie
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const isUserAuthenticated = await authService.isAuthenticated();

        if (isUserAuthenticated) {
          try {
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
              setUser(currentUser);
            } else {
              // If getCurrentUser fails but we're still authenticated,
              // we should avoid immediate logout as this could be an intermittent API issue
              console.warn("User is authenticated but couldn't fetch user details");
              // Keep any existing user data rather than clearing it
            }
          } catch (userErr) {
            console.error("Failed to get current user:", userErr);
            // Don't clear user state here, as we might have existing valid user data
          }
        } else {
          // Only clear the user if we're definitely not authenticated
          setUser(null);
        }
      } catch (err) {
        console.error("Authentication check failed:", err);
        // Don't clear user state on error - this could be a temporary network issue
      } finally {
        setLoading(false); // Set loading to false after check completes
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const credentials: LoginCredentials = { email, password };
        const loggedInUser = await authService.login(credentials);

        if (loggedInUser) {
          setUser(loggedInUser);
          toast({
            title: "Success",
            description: "Logged in successfully",
          });
          return true;
        } else {
          toast({
            title: "Error",
            description: "Login failed. Please check your credentials.",
            variant: "destructive",
          });
          return false;
        }
      } catch (err) {
        console.error("Login failed:", err);
        toast({
          title: "Error",
          description: "Login failed. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    },
    []
  );

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
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
        window.location.href = "/login";
      } else {
        toast({
          title: "Error",
          description: "Logout failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Logout failed:", err);
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
      loading, // Include loading in context value
      login,
      logout,
    }),
    [user, users, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook for using the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
