import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreSetting } from '../types';
import { settingsService } from '../services';

interface StoreConfigContextType {
  settings: StoreSetting | null;
  isStoreOpen: boolean;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const StoreConfigContext = createContext<StoreConfigContextType | undefined>(undefined);

export const StoreConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSetting | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSettings = async () => {
    try {
      const res = await settingsService.getStoreSettings();
      if (res.data.success && res.data.data) {
        setSettings(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load store settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <StoreConfigContext.Provider
      value={{
        settings,
        isStoreOpen: settings ? settings.isOpen : true,
        isLoading,
        refreshSettings,
      }}
    >
      {children}
    </StoreConfigContext.Provider>
  );
};

export const useStoreConfig = () => {
  const context = useContext(StoreConfigContext);
  if (!context) throw new Error('useStoreConfig must be used within a StoreConfigProvider');
  return context;
};