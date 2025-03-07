'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { useStorage } from '@/lib/store/storageProvider';

export function StorageInitializer() {
  const { loadGamesFromStorage, setStorageType } = useGameStore();
  const { storageType, isLoading } = useStorage();

  useEffect(() => {
    console.log('StorageInitializer effect running, isLoading:', isLoading);

    if (!isLoading) {
      // Set the storage type in the game store
      setStorageType(storageType);
      console.log('Storage type set to:', storageType);

      // Log what's in localStorage for debugging
      if (typeof window !== 'undefined') {
        console.log('Zustand storage:', localStorage.getItem('card-score-keeper-storage'));
        console.log('Custom games storage:', localStorage.getItem('card-score-keeper-games-data'));

        // Small delay to ensure store is fully rehydrated
        const timer = setTimeout(() => {
          console.log('Loading games from storage...');
          loadGamesFromStorage();
          console.log('Games loaded from storage, currentGame:', useGameStore.getState().currentGame);
        }, 100);

        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, loadGamesFromStorage, setStorageType, storageType]);

  // This component doesn't render anything
  return null;
}
