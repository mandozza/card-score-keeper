'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type StorageType = 'local' | 'mongodb';

interface StorageContextType {
  storageType: StorageType;
  setStorageType: (type: StorageType) => void;
  isLoading: boolean;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export const StorageProvider = ({ children }: { children: ReactNode }) => {
  const [storageType, setStorageType] = useState<StorageType>('local');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load storage preference from localStorage
    if (typeof window !== 'undefined') {
      const savedStorageType = localStorage.getItem('preferred-storage-type');
      if (savedStorageType && (savedStorageType === 'local' || savedStorageType === 'mongodb')) {
        setStorageType(savedStorageType as StorageType);
      }
    }
    setIsLoading(false);
  }, []);

  const handleSetStorageType = (type: StorageType) => {
    setStorageType(type);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-storage-type', type);
    }
  };

  return (
    <StorageContext.Provider
      value={{
        storageType,
        setStorageType: handleSetStorageType,
        isLoading
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = (): StorageContextType => {
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
};
