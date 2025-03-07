import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getStorageAdapter } from './storageAdapters';
import { StorageType } from './storageProvider';

export interface Player {
  id: string;
  name: string;
  rank?: string;
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
  assignRandomRanks: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentGame: null,
      recentGames: [],
      storageType: 'local' as StorageType,

      setStorageType: (type: StorageType) => set({ storageType: type }),

      setCurrentGame: (game) => {
        set({ currentGame: game });

        // If we're setting a new game, save it to storage
        if (game) {
          setTimeout(() => {
            const state = get();
            state.saveCurrentGame();
          }, 0);
        }
      },

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

      endGame: () => {
        const state = get();
        if (!state.currentGame) return;

        const endedGame = {
          ...state.currentGame,
          isActive: false,
          updatedAt: new Date()
        };

        set({
          currentGame: null,
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
          console.log('Loading games from storage type:', storageType);

          const adapter = getStorageAdapter(storageType);
          const games = await adapter.getGames();

          console.log('Games loaded from storage:', games);

          if (games && games.length > 0) {
            // Ensure dates are properly converted
            const processedGames = games.map(game => ({
              ...game,
              createdAt: game.createdAt instanceof Date ? game.createdAt : new Date(game.createdAt),
              updatedAt: game.updatedAt instanceof Date ? game.updatedAt : new Date(game.updatedAt)
            }));

            set({
              recentGames: processedGames.filter(game => !game.isActive).slice(0, 10),
              currentGame: processedGames.find(game => game.isActive) || null
            });

            console.log('Store updated with loaded games');
          } else {
            console.log('No games found in storage');
          }
        } catch (error) {
          console.error('Error loading games from storage:', error);
        }
      },

      saveCurrentGame: async () => {
        try {
          const { currentGame, storageType } = get();
          if (!currentGame) return;

          console.log('Saving current game to storage:', currentGame);
          const adapter = getStorageAdapter(storageType);

          if (currentGame.id) {
            const updatedGame = await adapter.updateGame(currentGame.id, currentGame);
            console.log('Game updated in storage:', updatedGame);
          } else {
            const savedGame = await adapter.saveGame(currentGame);
            console.log('Game saved to storage with ID:', savedGame.id);
            // Update the store with the saved game that has an ID
            set({ currentGame: savedGame });
          }
        } catch (error) {
          console.error('Error saving game to storage:', error);
        }
      },

      assignRandomRanks: () => set((state) => {
        if (!state.currentGame) return state;

        const playerCount = state.currentGame.players.length;
        let ranks: string[];

        switch (playerCount) {
          case 4:
            ranks = ['President', 'Vice President', 'Vice Scum', 'Scum'];
            break;
          case 5:
            ranks = ['President', 'Vice President', 'Neutral', 'Vice Scum', 'Scum'];
            break;
          case 6:
            ranks = ['President', 'Vice President', 'Neutral', 'Neutral', 'Vice Scum', 'Scum'];
            break;
          default:
            return state;
        }

        // Shuffle ranks
        const shuffledRanks = [...ranks].sort(() => Math.random() - 0.5);

        // Assign ranks to players
        const updatedPlayers = state.currentGame.players.map((player, index) => ({
          ...player,
          rank: shuffledRanks[index]
        }));

        return {
          currentGame: {
            ...state.currentGame,
            players: updatedPlayers,
            updatedAt: new Date()
          }
        };
      })
    }),
    {
      name: 'card-score-keeper-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {}
        };
      }),
      partialize: (state) => ({
        currentGame: state.currentGame ? {
          ...state.currentGame,
          createdAt: state.currentGame.createdAt instanceof Date
            ? state.currentGame.createdAt.toISOString()
            : state.currentGame.createdAt,
          updatedAt: state.currentGame.updatedAt instanceof Date
            ? state.currentGame.updatedAt.toISOString()
            : state.currentGame.updatedAt,
        } : null,
        recentGames: state.recentGames.map(game => ({
          ...game,
          createdAt: game.createdAt instanceof Date
            ? game.createdAt.toISOString()
            : game.createdAt,
          updatedAt: game.updatedAt instanceof Date
            ? game.updatedAt.toISOString()
            : game.updatedAt,
        })),
        storageType: state.storageType,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert ISO date strings back to Date objects
          if (state.currentGame) {
            state.currentGame.createdAt = new Date(state.currentGame.createdAt);
            state.currentGame.updatedAt = new Date(state.currentGame.updatedAt);
          }

          state.recentGames = state.recentGames.map(game => ({
            ...game,
            createdAt: new Date(game.createdAt),
            updatedAt: new Date(game.updatedAt),
          }));

          console.log('Storage rehydrated successfully');
        }
      },
    }
  )
);
