"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useGameStore } from "@/lib/store/gameStore";
import { Plus, Trash2, ArrowRight } from "lucide-react";

export default function NewGame() {
  const router = useRouter();
  const { setCurrentGame } = useGameStore();

  const [gameType, setGameType] = useState("hearts");
  const [endScore, setEndScore] = useState(100);
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([
    { id: uuidv4(), name: "" },
    { id: uuidv4(), name: "" },
  ]);

  const handleAddPlayer = () => {
    setPlayers([...players, { id: uuidv4(), name: "" }]);
  };

  const handleRemovePlayer = (id: string) => {
    if (players.length <= 2) {
      toast.error("You need at least 2 players");
      return;
    }
    setPlayers(players.filter((player) => player.id !== id));
  };

  const handlePlayerNameChange = (id: string, name: string) => {
    setPlayers(
      players.map((player) => (player.id === id ? { ...player, name } : player))
    );
  };

  const handleStartGame = () => {
    // Validate inputs
    if (players.some((player) => !player.name.trim())) {
      toast.error("All players must have names");
      return;
    }

    if (new Set(players.map((p) => p.name.trim())).size !== players.length) {
      toast.error("All players must have unique names");
      return;
    }

    // Create new game
    const newGame = {
      id: uuidv4(),
      players,
      gameType,
      endScore,
      rounds: [],
      notes: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      // Set current game in store
      setCurrentGame(newGame);

      // Explicitly save the game to storage
      setTimeout(() => {
        const { saveCurrentGame } = useGameStore.getState();
        saveCurrentGame().then(() => {
          console.log('New game saved successfully');
        });
      }, 0);

      // Navigate to game page
      router.push(`/game/${newGame.id}`);
    } catch (error) {
      console.error('Error starting game:', error);
      toast.error('Failed to start game. Please try again.');
    }
  };

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 py-6 sm:py-8 w-full max-w-2xl mx-auto">
        <h1 className="mb-6 text-2xl sm:text-3xl font-bold">Start New Game</h1>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle>Game Settings</CardTitle>
            <CardDescription>Configure your game settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="game-type">Game Type</Label>
              <Select value={gameType} onValueChange={setGameType}>
                <SelectTrigger id="game-type">
                  <SelectValue placeholder="Select game type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hearts">Hearts</SelectItem>
                  <SelectItem value="president">President</SelectItem>
                  <SelectItem value="spades">Spades</SelectItem>
                  <SelectItem value="rummy">Rummy</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-score">End Score</Label>
              <Input
                id="end-score"
                type="number"
                value={endScore}
                onChange={(e) => setEndScore(Number(e.target.value))}
                min={1}
              />
              <p className="text-sm text-muted-foreground">
                {gameType === "hearts"
                  ? "Game ends when a player reaches this score (lowest score wins)"
                  : "Game ends when a player reaches this score or after a set number of rounds"}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Players</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddPlayer}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Player
                </Button>
              </div>

              <div className="space-y-3">
                {players.map((player, index) => (
                  <div key={player.id} className="flex items-center gap-3">
                    <Input
                      placeholder={`Player ${index + 1}`}
                      value={player.name}
                      onChange={(e) =>
                        handlePlayerNameChange(player.id, e.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePlayer(player.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleStartGame} className="ml-auto gap-2">
              Start Game
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
