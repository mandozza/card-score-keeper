'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { useStorage } from '@/lib/store/storageProvider';

export function StorageInitializer() {
  const { loadGamesFromStorage, setStorageType } = useGameStore();
  const { storageType, isLoading } = useStorage();

  useEffect(() => {
    if (!isLoading) {
      // Set the storage type in the game store
      setStorageType(storageType);

      // Load games from storage
      loadGamesFromStorage();
    }
  }, [isLoading, loadGamesFromStorage, setStorageType, storageType]);

  // This component doesn't render anything
  return null;
}
