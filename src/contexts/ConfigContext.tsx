import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { RemovalReason } from "@/types";
import { mockRemovalReasons } from "@/lib/mockData";

// ConfigContext for application configuration
interface ConfigContextType {
  removalReasons: RemovalReason[];
}

// Create the context
const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

// Provider Props
interface ConfigProviderProps {
  children: ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const [removalReasons, setRemovalReasons] = useState<RemovalReason[]>(mockRemovalReasons);

  // In a real app, you would fetch these from the API
  useEffect(() => {
    // Example of how you might fetch from API:
    // async function fetchRemovalReasons() {
    //   try {
    //     const response = await apiClient({ method: 'admin/removalReasons' });
    //     if (response.result?.status === 'success') {
    //       setRemovalReasons(response.result.response || []);
    //     }
    //   } catch (error) {
    //     console.error('Failed to fetch removal reasons:', error);
    //   }
    // }
    // fetchRemovalReasons();
    
    // For now, just using mock data
    setRemovalReasons(mockRemovalReasons);
  }, []);

  const value = useMemo(
    () => ({
      removalReasons,
    }),
    [removalReasons]
  );

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

// Hook for using the config context
export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};

export default ConfigContext; 