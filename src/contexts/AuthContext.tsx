import { createContext, useContext, useState, ReactNode, FunctionComponent, useEffect } from 'react';
import localForage from 'localforage';

export const AUTH_STATE_KEY = 'authState';

// Define a type for the auth state
export type AuthState = {
  token: string | null;
  refreshToken: string | null;
};

// Define the structure of the context's value
interface AuthContextType {
  authState: AuthState;
  setAuthInfo: (authState: AuthState) => void;
  logout: () => void;
  isLoading: boolean;
}

// Define the props for the provider component
interface AuthProviderProps {
  children: ReactNode;
}

// Create the context with an initial null value
const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider component
const AuthProvider: FunctionComponent<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({ token: null, refreshToken: null });
  const [isLoading, setIsLoading] = useState(true);

  const setAuthInfo = async (authInfo: AuthState) => {
    setAuthState(authInfo);
    await localForage.setItem(AUTH_STATE_KEY, authState);
  };

  const logout = async () => {
    await localForage.removeItem(AUTH_STATE_KEY); // Clear authState from localForage on logout
    setAuthState({ token: null, refreshToken: null });
  };

  // Context value that will be provided to any descendants of this component
  const contextValue: AuthContextType = {
    authState,
    setAuthInfo,
    logout,
    isLoading
  };
  useEffect(() => {
    const loadAuthState = async () => {
      const storedAuth = await localForage.getItem<AuthState>(AUTH_STATE_KEY);
      if (storedAuth?.token) {
        setAuthState(storedAuth);
      }
      setIsLoading(false);
    };
  
    loadAuthState();
  }, []);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using context
const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    // Throw an error if useAuth is used outside of AuthProvider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the AuthProvider and useAuth hook
export { AuthProvider, useAuth };
