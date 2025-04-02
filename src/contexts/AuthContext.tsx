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
  // Users list might be fetched from an API later or removed if not needed globally
  const [users] = useState<User[]>([]); // Initialize as empty

  // Check for existing session on mount by verifying cookie
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const isUserAuthenticated = await authService.isAuthenticated();
        
        if (isUserAuthenticated) {
          const currentUser = await authService.getCurrentUser();
          
          if (currentUser) {
            setUser(currentUser);
          }
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
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
      console.error('Login failed:', err);
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, []);

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
        window.location.href = '/login';
      } else {
        toast({
          title: "Error",
          description: "Logout failed. Please try again.",
          variant: "destructive",
        });
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
      login,
      logout,
    }),
    [user, users, login, logout]
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