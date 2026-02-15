import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, RegisterData } from '@/types';
import { apiLogin, apiRegister, apiGetCurrentUser } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount and auto-fetch user
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        try {
          // Try to fetch current user with existing token
          const userData = await apiGetCurrentUser();
          setUser(userData);
        } catch (error) {
          // Token is invalid or expired, clear it
          localStorage.removeItem('auth_token');
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // Get token from login
    const tokenData = await apiLogin(email, password);
    
    // Save token to localStorage
    localStorage.setItem('auth_token', tokenData.access_token);
    
    // Fetch user data
    const userData = await apiGetCurrentUser();
    setUser(userData);
  };

  const register = async (data: RegisterData) => {
    // Register returns User but no token
    await apiRegister(data);
    
    // Automatically login after successful registration
    await login(data.email, data.password);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
