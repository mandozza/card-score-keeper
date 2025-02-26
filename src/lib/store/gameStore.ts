import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getStorageAdapter } from './storageAdapters';
import { StorageType } from './storageProvider';

export interface Player {
  id: string;
  name: string;
}

export interface PlayerScore {
  playerId: string;
  score: number;
}

export interface Round {
  roundNumber: number;
  playerScores: PlayerScore[];
  notes?: string;
}

export interface Game {
  id?: string;
  players: Player[];
  gameType: string;
  endScore: number;
  rounds: Round[];
  notes: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface GameState {
  currentGame: Game | null;
  recentGames: Game[];
  storageType: StorageType;
  setStorageType: (type: StorageType) => void;
  setCurrentGame: (game: Game | null) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  addRound: (round: Round) => void;
  updateRound: (roundNumber: number, round: Round) => void;
  addNote: (note: string) => void;
  endGame: (winnerId?: string) => void;
  clearCurrentGame: () => void;
  addRecentGame: (game: Game) => void;
  loadGamesFromStorage: () => Promise<void>;
  saveCurrentGame: () => Promise<void>;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentGame: null,
      recentGames: [],
      storageType: 'local' as StorageType,

      setStorageType: (type: StorageType) => set({ storageType: type }),

      setCurrentGame: (game) => set({ currentGame: game }),

      addPlayer: (player) => set((state) => ({
        currentGame: state.currentGame
          ? {
              ...state.currentGame,
              players: [...state.currentGame.players, player],
              updatedAt: new Date()
            }
          : null
      })),

      removePlayer: (playerId) => set((state) => ({
        currentGame: state.currentGame
          ? {
              ...state.currentGame,
              players: state.currentGame.players.filter(p => p.id !== playerId),
              updatedAt: new Date()
            }
          : null
      })),

      addRound: (round) => set((state) => ({
        currentGame: state.currentGame
          ? {
              ...state.currentGame,
              rounds: [...state.currentGame.rounds, round],
              updatedAt: new Date()
            }
          : null
      })),

      updateRound: (roundNumber, round) => set((state) => ({
        currentGame: state.currentGame
          ? {
              ...state.currentGame,
              rounds: state.currentGame.rounds.map(r =>
                r.roundNumber === roundNumber ? round : r
              ),
              updatedAt: new Date()
            }
          : null
      })),

      addNote: (note) => set((state) => ({
        currentGame: state.currentGame
          ? {
              ...state.currentGame,
              notes: [...state.currentGame.notes, note],
              updatedAt: new Date()
            }
          : null
      })),

      endGame: (winnerId) => {
        const state = get();
        if (!state.currentGame) return;

        const endedGame = {
          ...state.currentGame,
          isActive: false,
          updatedAt: new Date()
        };

        set({
          currentGame: endedGame,
          recentGames: [endedGame, ...state.recentGames].slice(0, 10)
        });

        // Save to selected storage
        state.saveCurrentGame();
      },

      clearCurrentGame: () => set({ currentGame: null }),

      addRecentGame: (game) => set((state) => ({
        recentGames: [game, ...state.recentGames].slice(0, 10)
      })),

      loadGamesFromStorage: async () => {
        try {
          const { storageType } = get();
          const adapter = getStorageAdapter(storageType);
          const games = await adapter.getGames();

          set({
            recentGames: games.filter(game => !game.isActive).slice(0, 10),
            currentGame: games.find(game => game.isActive) || null
          });
        } catch (error) {
          console.error('Error loading games from storage:', error);
        }
      },

      saveCurrentGame: async () => {
        try {
          const { currentGame, storageType } = get();
          if (!currentGame) return;

          const adapter = getStorageAdapter(storageType);

          if (currentGame.id) {
            await adapter.updateGame(currentGame.id, currentGame);
          } else {
            const savedGame = await adapter.saveGame(currentGame);
            set({ currentGame: savedGame });
          }
        } catch (error) {
          console.error('Error saving game to storage:', error);
        }
      }
    }),
    {
      name: 'card-score-keeper-storage',
    }
  )
);
