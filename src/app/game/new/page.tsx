"use client";

import { useState, useEffect } from "react";
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
import { Plus, Trash2, ArrowRight, UserPlus, Check, Heart, Crown, Users, Settings } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function NewGame() {
  const router = useRouter();
  const { setCurrentGame } = useGameStore();

  const [gameType, setGameType] = useState("hearts");
  const [endScore, setEndScore] = useState(100);
  const [players, setPlayers] = useState<{ id: string; name: string; isDefault: boolean }[]>([]);
  const [defaultPlayers, setDefaultPlayers] = useState<string[]>([]);
  const [showDefaultPlayers, setShowDefaultPlayers] = useState(false);
  const [selectedDefaultPlayers, setSelectedDefaultPlayers] = useState<string[]>([]);

  // Load default players from localStorage
  useEffect(() => {
    const savedPlayers = localStorage.getItem('defaultPlayers');
    if (savedPlayers) {
      setDefaultPlayers(JSON.parse(savedPlayers));
    }
  }, []);

  const handleAddPlayer = () => {
    setPlayers([...players, { id: uuidv4(), name: "", isDefault: false }]);
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
      players.map((player) => (player.id === id ? { ...player, name, isDefault: player.isDefault } : player))
    );
  };

  const handleToggleDefaultPlayer = (id: string) => {
    setPlayers(
      players.map((player) =>
        player.id === id ? { ...player, isDefault: !player.isDefault } : player
      )
    );
  };

  const handleToggleSelectDefaultPlayer = (playerName: string) => {
    setSelectedDefaultPlayers(prev => {
      if (prev.includes(playerName)) {
        return prev.filter(name => name !== playerName);
      } else {
        return [...prev, playerName];
      }
    });
  };

  const handleAddSelectedDefaultPlayers = () => {
    if (selectedDefaultPlayers.length === 0) {
      toast.error("No players selected");
      return;
    }

    // Filter out players that are already in the game
    const newPlayers = selectedDefaultPlayers.filter(
      name => !players.some(p => p.name.toLowerCase() === name.toLowerCase())
    );

    if (newPlayers.length === 0) {
      toast.info("All selected players are already in the game");
      return;
    }

    // Add the selected default players to the current game
    const playersToAdd = newPlayers.map(name => ({
      id: uuidv4(),
      name,
      isDefault: true
    }));

    setPlayers([...players, ...playersToAdd]);
    setSelectedDefaultPlayers([]);
    toast.success(`Added ${newPlayers.length} player${newPlayers.length > 1 ? 's' : ''}`);

    // Hide the default players section with a slight delay for animation
    setTimeout(() => {
      setShowDefaultPlayers(false);
    }, 300);
  };

  const handleAddDefaultPlayer = (playerName: string) => {
    // Check if this player is already in the list
    const existingPlayer = players.find(p => p.name.toLowerCase() === playerName.toLowerCase());

    if (existingPlayer) {
      toast.info(`${playerName} is already in the game`);
      return;
    }

    // Add the default player to the current game
    setPlayers([...players, { id: uuidv4(), name: playerName, isDefault: true }]);
  };

  const handleStartGame = () => {
    // Validate inputs
    if (players.length === 0) {
      toast.error("You need to add at least 2 players");
      return;
    }

    if (players.some((player) => !player.name.trim())) {
      toast.error("All players must have names");
      return;
    }

    if (players.length < 2) {
      toast.error("You need at least 2 players");
      return;
    }

    if (new Set(players.map((p) => p.name.trim())).size !== players.length) {
      toast.error("All players must have unique names");
      return;
    }

    // Add new players to default players list if marked
    const newDefaultPlayers = [...defaultPlayers];
    let defaultPlayersChanged = false;

    players.forEach(player => {
      if (player.isDefault && !defaultPlayers.includes(player.name)) {
        newDefaultPlayers.push(player.name);
        defaultPlayersChanged = true;
      }
    });

    if (defaultPlayersChanged) {
      localStorage.setItem('defaultPlayers', JSON.stringify(newDefaultPlayers));
      setDefaultPlayers(newDefaultPlayers);
    }

    // Create new game (without the isDefault property)
    const gamePlayers = players.map(({ id, name }) => ({ id, name }));
    const newGame = {
      id: uuidv4(),
      players: gamePlayers,
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
              <Label htmlFor="game-type" className="text-base font-medium">Game Type</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`border rounded-md p-4 text-left transition-all ${
                    gameType === "hearts"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-muted hover:border-primary/50"
                  }`}
                  onClick={() => setGameType("hearts")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span className="font-medium">Hearts</span>
                    {gameType === "hearts" && (
                      <Check className="h-4 w-4 ml-auto text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Classic trick-taking card game where you avoid hearts and the Queen of Spades.
                  </p>
                </button>
                <button
                  type="button"
                  className={`border rounded-md p-4 text-left transition-all ${
                    gameType === "president"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-muted hover:border-primary/50"
                  }`}
                  onClick={() => {
                    console.log("Setting game type to president");
                    setGameType("president");
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">
                      {typeof window !== 'undefined' ? localStorage.getItem('presidentAlias') || 'President' : 'President'}
                    </span>
                    {gameType === "president" && (
                      <Check className="h-4 w-4 ml-auto text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Climbing card game with player ranks from President to Scum.
                  </p>
                </button>
              </div>
              <div className="sr-only">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="hearts-radio"
                    name="game-type-radio"
                    checked={gameType === "hearts"}
                    onChange={() => setGameType("hearts")}
                    className="mr-2"
                  />
                  <label htmlFor="hearts-radio">Hearts</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="president-radio"
                    name="game-type-radio"
                    checked={gameType === "president"}
                    onChange={() => setGameType("president")}
                    className="mr-2"
                  />
                  <label htmlFor="president-radio">President</label>
                </div>
              </div>
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
                <div className="flex gap-2">

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowDefaultPlayers(!showDefaultPlayers);
                        if (!showDefaultPlayers) {
                          setSelectedDefaultPlayers([]);
                        }
                      }}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      {showDefaultPlayers ? "Hide Default Players" : "Add Default Players"}
                    </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddPlayer}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Player
                  </Button>
                </div>
              </div>

              {showDefaultPlayers && (
                <div className="p-3 bg-muted rounded-md animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex flex-col space-y-2 mb-3">
                    <h3 className="text-sm font-medium">Default Players</h3>
                    <p className="text-xs text-muted-foreground">
                      {defaultPlayers.length > 0
                        ? "Select players from the list below, then click \"Add to Game\" to include them."
                        : "You don't have any default players saved yet. You can add default players in the settings page."}
                    </p>
                  </div>

                  {defaultPlayers.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {defaultPlayers.map((player) => {
                          const isAlreadyInGame = players.some(p => p.name.toLowerCase() === player.toLowerCase());
                          return (
                            <div
                              key={player}
                              className={`flex items-center p-2 rounded-md ${isAlreadyInGame ? 'bg-secondary/30' : 'hover:bg-secondary/10'}`}
                            >
                              <Checkbox
                                id={`select-${player}`}
                                checked={selectedDefaultPlayers.includes(player)}
                                onCheckedChange={() => !isAlreadyInGame && handleToggleSelectDefaultPlayer(player)}
                                disabled={isAlreadyInGame}
                                className="mr-2"
                              />
                              <Label
                                htmlFor={`select-${player}`}
                                className={`text-sm flex-1 cursor-pointer ${isAlreadyInGame ? 'text-muted-foreground line-through' : ''}`}
                              >
                                {player}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button
                          type="button"
                          variant="default"
                          onClick={handleAddSelectedDefaultPlayers}
                          disabled={selectedDefaultPlayers.length === 0}
                          className="w-full sm:w-auto font-medium shadow-sm hover:shadow-md transition-all"
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Add to Game ({selectedDefaultPlayers.length} player{selectedDefaultPlayers.length !== 1 ? 's' : ''})
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-center mt-4">
                      <Button
                        type="button"
                        variant="default"
                        onClick={() => router.push('/settings')}
                        className="w-full sm:w-auto font-medium shadow-sm hover:shadow-md transition-all"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Go to Settings
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {players.length === 0 ? (
                <div className="p-8 border border-dashed rounded-md text-center">
                  <p className="text-sm text-muted-foreground mb-4">No players added yet<br/>Choose from your default players or add a new player to get started.</p>
                </div>
              ) : (
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
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleStartGame}
              className="ml-auto gap-2"
              disabled={players.length < 2}
            >
              Start Game
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
