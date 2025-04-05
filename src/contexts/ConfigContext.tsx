import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { RemovalReason } from "@/types";
import { api } from "@/services/api";

// Define department interface
export interface Department {
  id: string;
  name: string;
}

// Define context type
export interface ConfigContextType {
  removalReasons: RemovalReason[];
  departments: Department[];
  isLoading: boolean;
  error: string | null;
  refreshConfig: () => Promise<void>;
}

// Create context with default values
const ConfigContext = createContext<ConfigContextType>({
  removalReasons: [],
  departments: [],
  isLoading: false,
  error: null,
  refreshConfig: async () => {},
});

// Mock data for development
const mockReasons: RemovalReason[] = [
  { id: '1', name: 'Damaged' },
  { id: '2', name: 'Obsolete' },
  { id: '3', name: 'Temporary Use' },
  { id: '4', name: 'Transfer' },
  { id: '5', name: 'Disposal' },
  { id: '6', name: 'Other' },
];

// Mock departments for development
const mockDepartments: Department[] = [
  { id: '1', name: 'IT Department' },
  { id: '2', name: 'Finance' },
  { id: '3', name: 'Human Resources' },
  { id: '4', name: 'Operations' },
  { id: '5', name: 'Legal' },
];

// Provider Props
interface ConfigProviderProps {
  children: ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const [removalReasons, setRemovalReasons] = useState<RemovalReason[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, fetch from API
      // const reasonsResponse = await api.getRemovalReasons();
      // const departmentsResponse = await api.getDepartments();
      
      // For now use mock data
      setRemovalReasons(mockReasons);
      setDepartments(mockDepartments);
    } catch (err) {
      setError('Failed to load configuration');
      console.error('Config loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load config on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  const refreshConfig = async () => {
    await fetchConfig();
  };

  return (
    <ConfigContext.Provider
      value={{
        removalReasons,
        departments,
        isLoading,
        error,
        refreshConfig
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

// Custom hook for using the config context
export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

export default ConfigContext; 