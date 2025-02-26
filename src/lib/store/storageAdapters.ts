import { Game } from './gameStore';

// Interface for storage adapters
export interface StorageAdapter {
  saveGame: (game: Game) => Promise<Game>;
  getGames: () => Promise<Game[]>;
  getGameById: (id: string) => Promise<Game | null>;
  updateGame: (id: string, game: Game) => Promise<Game | null>;
  deleteGame: (id: string) => Promise<boolean>;
}

// Local Storage Adapter
export class LocalStorageAdapter implements StorageAdapter {
  private storageKey = 'card-score-keeper-games';

  private getStoredGames(): Game[] {
    if (typeof window === 'undefined') return [];

    const storedGames = localStorage.getItem(this.storageKey);
    return storedGames ? JSON.parse(storedGames) : [];
  }

  private setStoredGames(games: Game[]): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(this.storageKey, JSON.stringify(games));
  }

  async saveGame(game: Game): Promise<Game> {
    const games = this.getStoredGames();
    const newGame = {
      ...game,
      id: game.id || crypto.randomUUID(),
    };

    games.push(newGame);
    this.setStoredGames(games);

    return newGame;
  }

  async getGames(): Promise<Game[]> {
    return this.getStoredGames();
  }

  async getGameById(id: string): Promise<Game | null> {
    const games = this.getStoredGames();
    return games.find(game => game.id === id) || null;
  }

  async updateGame(id: string, updatedGame: Game): Promise<Game | null> {
    const games = this.getStoredGames();
    const index = games.findIndex(game => game.id === id);

    if (index === -1) return null;

    games[index] = {
      ...updatedGame,
      id,
    };

    this.setStoredGames(games);
    return games[index];
  }

  async deleteGame(id: string): Promise<boolean> {
    const games = this.getStoredGames();
    const filteredGames = games.filter(game => game.id !== id);

    if (filteredGames.length === games.length) return false;

    this.setStoredGames(filteredGames);
    return true;
  }
}

// MongoDB Adapter
export class MongoDBAdapter implements StorageAdapter {
  async saveGame(game: Game): Promise<Game> {
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(game),
      });

      if (!response.ok) {
        throw new Error('Failed to save game to MongoDB');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving game to MongoDB:', error);
      throw error;
    }
  }

  async getGames(): Promise<Game[]> {
    try {
      const response = await fetch('/api/game');

      if (!response.ok) {
        throw new Error('Failed to fetch games from MongoDB');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching games from MongoDB:', error);
      return [];
    }
  }

  async getGameById(id: string): Promise<Game | null> {
    try {
      const response = await fetch(`/api/game/${id}`);

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch game from MongoDB');
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching game ${id} from MongoDB:`, error);
      return null;
    }
  }

  async updateGame(id: string, game: Game): Promise<Game | null> {
    try {
      const response = await fetch(`/api/game/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(game),
      });

      if (!response.ok) {
        throw new Error('Failed to update game in MongoDB');
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating game ${id} in MongoDB:`, error);
      return null;
    }
  }

  async deleteGame(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/game/${id}`, {
        method: 'DELETE',
      });

      return response.ok;
    } catch (error) {
      console.error(`Error deleting game ${id} from MongoDB:`, error);
      return false;
    }
  }
}

// Factory function to get the appropriate storage adapter
export const getStorageAdapter = (type: 'local' | 'mongodb'): StorageAdapter => {
  return type === 'local' ? new LocalStorageAdapter() : new MongoDBAdapter();
};
