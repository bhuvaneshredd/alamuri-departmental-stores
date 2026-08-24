import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<User>;
  adminLogin: (credentials: any) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  updateUserProfile: (data: any) => Promise<User>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('quickstore_token');
      const storedUser = localStorage.getItem('quickstore_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        try {
          // Verify with backend
          const res = await authService.getMe();
          if (res.data.success && res.data.data) {
            setUser(res.data.data);
            localStorage.setItem('quickstore_user', JSON.stringify(res.data.data));
          }
        } catch (e) {
          // Token expired, clear storage
          localStorage.removeItem('quickstore_token');
          localStorage.removeItem('quickstore_user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: any): Promise<User> => {
    const res = await authService.login(credentials);
    const { user: loggedInUser, token: authToken } = res.data.data;
    setUser(loggedInUser);
    setToken(authToken);
    localStorage.setItem('quickstore_token', authToken);
    localStorage.setItem('quickstore_user', JSON.stringify(loggedInUser));
    setIsAuthModalOpen(false);
    return loggedInUser;
  };

  const adminLogin = async (credentials: any): Promise<User> => {
    const res = await authService.adminLogin(credentials);
    const { user: loggedInUser, token: authToken } = res.data.data;
    setUser(loggedInUser);
    setToken(authToken);
    localStorage.setItem('quickstore_token', authToken);
    localStorage.setItem('quickstore_user', JSON.stringify(loggedInUser));
    return loggedInUser;
  };

  const register = async (data: any): Promise<User> => {
    const res = await authService.register(data);
    const { user: newUser, token: authToken } = res.data.data;
    setUser(newUser);
    setToken(authToken);
    localStorage.setItem('quickstore_token', authToken);
    localStorage.setItem('quickstore_user', JSON.stringify(newUser));
    setIsAuthModalOpen(false);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('quickstore_token');
    localStorage.removeItem('quickstore_user');
  };

  const updateUserProfile = async (data: any): Promise<User> => {
    const res = await authService.updateProfile(data);
    const updated = res.data.data;
    setUser(updated);
    localStorage.setItem('quickstore_user', JSON.stringify(updated));
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isLoading,
        login,
        adminLogin,
        register,
        logout,
        updateUserProfile,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};