"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useGameStore } from "@/lib/store/gameStore";
import { Plus, Save, Trophy, ArrowLeft, Trash2 } from "lucide-react";
import { Game, Player, PlayerScore, Round } from "@/lib/store/gameStore";

export default function GameDetail() {
  const params = useParams();
  const router = useRouter();
  const { currentGame, addRound, addNote, endGame } = useGameStore();
  const [game, setGame] = useState<Game | null>(null);
  const [newRound, setNewRound] = useState<{ [key: string]: number }>({});
  const [roundNote, setRoundNote] = useState("");
  const [gameNote, setGameNote] = useState("");
  const [showEndGameDialog, setShowEndGameDialog] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    if (!currentGame || currentGame.id !== params.id) {
      // In a real app, we would fetch the game from the API if not in store
      router.push("/");
      return;
    }

    setGame(currentGame);

    // Initialize new round with player IDs
    const initialRound: { [key: string]: number } = {};
    currentGame.players.forEach((player) => {
      initialRound[player.id] = 0;
    });
    setNewRound(initialRound);
  }, [currentGame, params.id, router]);

  if (!game) {
    return (
      <MainLayout>
        <div className="container py-8">
          <p>Loading game...</p>
        </div>
      </MainLayout>
    );
  }

  const calculateTotalScores = () => {
    const totals: { [key: string]: number } = {};

    game.players.forEach((player) => {
      totals[player.id] = 0;
    });

    game.rounds.forEach((round) => {
      round.playerScores.forEach((score) => {
        totals[score.playerId] += score.score;
      });
    });

    return totals;
  };

  const totalScores = calculateTotalScores();

  const handleScoreChange = (playerId: string, value: string) => {
    setNewRound({
      ...newRound,
      [playerId]: value === "" ? 0 : parseInt(value, 10),
    });
  };

  const handleAddRound = () => {
    const roundNumber = game.rounds.length + 1;
    const playerScores: PlayerScore[] = Object.entries(newRound).map(
      ([playerId, score]) => ({
        playerId,
        score,
      })
    );

    const round: Round = {
      roundNumber,
      playerScores,
      notes: roundNote || undefined,
    };

    addRound(round);

    // Reset form
    const resetRound: { [key: string]: number } = {};
    game.players.forEach((player) => {
      resetRound[player.id] = 0;
    });
    setNewRound(resetRound);
    setRoundNote("");

    toast.success(`Round ${roundNumber} added`);

    // Check if any player has reached the end score
    const updatedTotals = { ...totalScores };
    playerScores.forEach((score) => {
      updatedTotals[score.playerId] += score.score;
    });

    const winningPlayer = game.players.find(
      (player) => updatedTotals[player.id] >= game.endScore
    );

    if (winningPlayer) {
      setWinner(winningPlayer.id);
      setShowEndGameDialog(true);
    }
  };

  const handleAddGameNote = () => {
    if (!gameNote.trim()) return;

    addNote(gameNote);
    setGameNote("");
    toast.success("Note added");
  };

  const handleEndGame = () => {
    endGame(winner || undefined);
    toast.success("Game ended");
    router.push("/");
  };

  const getPlayerName = (playerId: string) => {
    return game.players.find((p) => p.id === playerId)?.name || "Unknown";
  };

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => router.push("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">{game.gameType.charAt(0).toUpperCase() + game.gameType.slice(1)}</h1>
          </div>
          <Button variant="destructive" onClick={() => setShowEndGameDialog(true)}>
            End Game
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Tabs defaultValue="scoreboard">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="scoreboard">Scoreboard</TabsTrigger>
                <TabsTrigger value="add-round">Add Round</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="scoreboard" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Scoreboard</CardTitle>
                    <CardDescription>
                      Game ends at {game.endScore} points
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 text-left">Round</th>
                            {game.players.map((player) => (
                              <th key={player.id} className="py-2 text-left">
                                {player.name}
                              </th>
                            ))}
                            <th className="py-2 text-left">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {game.rounds.map((round) => (
                            <tr key={round.roundNumber} className="border-b">
                              <td className="py-2">{round.roundNumber}</td>
                              {game.players.map((player) => {
                                const score = round.playerScores.find(
                                  (s) => s.playerId === player.id
                                );
                                return (
                                  <td key={player.id} className="py-2">
                                    {score ? score.score : 0}
                                  </td>
                                );
                              })}
                              <td className="py-2 text-sm text-muted-foreground">
                                {round.notes}
                              </td>
                            </tr>
                          ))}
                          <tr className="font-bold">
                            <td className="py-2">Total</td>
                            {game.players.map((player) => (
                              <td key={player.id} className="py-2">
                                {totalScores[player.id]}
                              </td>
                            ))}
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="add-round" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Add Round {game.rounds.length + 1}</CardTitle>
                    <CardDescription>
                      Enter scores for each player
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {game.players.map((player) => (
                      <div key={player.id} className="flex items-center gap-4">
                        <Label htmlFor={`score-${player.id}`} className="w-24">
                          {player.name}
                        </Label>
                        <Input
                          id={`score-${player.id}`}
                          type="number"
                          value={newRound[player.id] || 0}
                          onChange={(e) =>
                            handleScoreChange(player.id, e.target.value)
                          }
                        />
                      </div>
                    ))}

                    <div className="pt-2">
                      <Label htmlFor="round-note">Round Note (Optional)</Label>
                      <Input
                        id="round-note"
                        value={roundNote}
                        onChange={(e) => setRoundNote(e.target.value)}
                        placeholder="Add a note for this round"
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleAddRound} className="ml-auto gap-2">
                      <Save className="h-4 w-4" />
                      Save Round
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Game Notes</CardTitle>
                    <CardDescription>
                      Add notes about the game
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="game-note">New Note</Label>
                      <div className="mt-1 flex gap-2">
                        <Input
                          id="game-note"
                          value={gameNote}
                          onChange={(e) => setGameNote(e.target.value)}
                          placeholder="Add a game note"
                        />
                        <Button onClick={handleAddGameNote}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {game.notes.length > 0 ? (
                      <div className="space-y-2">
                        <h3 className="font-medium">Existing Notes</h3>
                        <ul className="space-y-1">
                          {game.notes.map((note, index) => (
                            <li
                              key={index}
                              className="rounded-md border p-2 text-sm"
                            >
                              {note}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No notes added yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Game Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Game Type</h3>
                  <p className="text-sm text-muted-foreground">
                    {game.gameType.charAt(0).toUpperCase() + game.gameType.slice(1)}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">End Score</h3>
                  <p className="text-sm text-muted-foreground">{game.endScore}</p>
                </div>

                <div>
                  <h3 className="font-medium">Players</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {game.players.map((player) => (
                      <li key={player.id} className="flex items-center justify-between">
                        <span>{player.name}</span>
                        <span className="font-medium">
                          {totalScores[player.id]} pts
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium">Current Leader</h3>
                  {game.players.length > 0 ? (
                    <div className="mt-1 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span>
                        {
                          game.players.reduce((leader, player) => {
                            return totalScores[player.id] > totalScores[leader.id]
                              ? player
                              : leader;
                          }, game.players[0]).name
                        }
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No players</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showEndGameDialog} onOpenChange={setShowEndGameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Game</DialogTitle>
            <DialogDescription>
              Are you sure you want to end this game?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="winner">Select Winner</Label>
            <select
              id="winner"
              className="mt-1 w-full rounded-md border p-2"
              value={winner || ""}
              onChange={(e) => setWinner(e.target.value || null)}
            >
              <option value="">No winner</option>
              {game.players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name} ({totalScores[player.id]} pts)
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndGameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEndGame}>End Game</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
