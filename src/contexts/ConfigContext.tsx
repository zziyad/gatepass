import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { RemovalReason } from "@/types";
import { api } from "@/services/api";

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
  const [removalReasons, setRemovalReasons] = useState<RemovalReason[]>([]);

  // Fetch removal reasons from the API
  useEffect(() => {
    async function fetchRemovalReasons() {
      try {
        const response = await api.admin.getRemovalReasons();
        if (response.result?.status === 'success' && response.result.response?.reasons) {
          setRemovalReasons(response.result.response.reasons);
        } else {
          console.error('Failed to fetch removal reasons: Invalid response format');
        }
      } catch (error) {
        console.error('Failed to fetch removal reasons:', error);
      }
    }
    
    fetchRemovalReasons();
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