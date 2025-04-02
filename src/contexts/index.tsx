import { ReactNode } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { RequestsProvider, useRequests } from './RequestsContext';
import { ConfigProvider, useConfig } from './ConfigContext';

// Create a combined provider for backward compatibility
interface AppProviderProps {
  children: ReactNode;
}

// Combined provider that composes all individual providers
export function AppProvider({ children }: AppProviderProps) {
  return (
    <AuthProvider>
      <RequestsProvider>
        <ConfigProvider>
          {children}
        </ConfigProvider>
      </RequestsProvider>
    </AuthProvider>
  );
}

// Combined hook that merges all contexts for backward compatibility
export function useApp() {
  const auth = useAuth();
  const requests = useRequests();
  const config = useConfig();

  return {
    ...auth,
    ...requests,
    ...config
  };
}

// Export individual contexts and hooks for more granular usage
export {
  AuthProvider,
  useAuth,
  RequestsProvider,
  useRequests,
  ConfigProvider,
  useConfig
}; 