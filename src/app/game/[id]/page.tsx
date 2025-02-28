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
import { Plus, Save, Trophy, ArrowLeft, Trash2, Edit } from "lucide-react";
import { Game, Player, PlayerScore, Round } from "@/lib/store/gameStore";

export default function GameDetail() {
  const params = useParams();
  const router = useRouter();
  const { currentGame, addRound, addNote, endGame, updateRound } = useGameStore();
  const [game, setGame] = useState<Game | null>(null);
  const [newRound, setNewRound] = useState<{ [key: string]: number }>({});
  const [roundNote, setRoundNote] = useState("");
  const [gameNote, setGameNote] = useState("");
  const [showEndGameDialog, setShowEndGameDialog] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  // Add state for editing rounds
  const [editingRound, setEditingRound] = useState<Round | null>(null);
  const [editRoundData, setEditRoundData] = useState<{ [key: string]: number }>({});
  const [editRoundNote, setEditRoundNote] = useState("");
  const [showEditRoundDialog, setShowEditRoundDialog] = useState(false);

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

  // Determine the default winner based on game type
  const getDefaultWinner = () => {
    if (!game || game.players.length === 0) return null;

    const totals = calculateTotalScores();

    if (game.gameType === "hearts") {
      // For Hearts, lowest score wins
      return game.players.reduce((leader, player) =>
        totals[player.id] < totals[leader.id] ? player : leader
      , game.players[0]).id;
    } else {
      // For other games, highest score wins
      return game.players.reduce((leader, player) =>
        totals[player.id] > totals[leader.id] ? player : leader
      , game.players[0]).id;
    }
  };

  // Update to set the default winner when opening the dialog
  const handleOpenEndGameDialog = () => {
    setWinner(getDefaultWinner());
    setShowEndGameDialog(true);
  };

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

  // Add handler for editing round score changes
  const handleEditScoreChange = (playerId: string, value: string) => {
    setEditRoundData({
      ...editRoundData,
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

  // Add handler for opening the edit round dialog
  const handleOpenEditRoundDialog = (round: Round) => {
    setEditingRound(round);

    // Initialize edit round data with current scores
    const roundData: { [key: string]: number } = {};
    round.playerScores.forEach((score) => {
      roundData[score.playerId] = score.score;
    });

    setEditRoundData(roundData);
    setEditRoundNote(round.notes || "");
    setShowEditRoundDialog(true);
  };

  // Add handler for saving edited round
  const handleSaveEditedRound = () => {
    if (!editingRound) return;

    const playerScores: PlayerScore[] = Object.entries(editRoundData).map(
      ([playerId, score]) => ({
        playerId,
        score,
      })
    );

    const updatedRound: Round = {
      ...editingRound,
      playerScores,
      notes: editRoundNote || undefined,
    };

    updateRound(editingRound.roundNumber, updatedRound);
    setShowEditRoundDialog(false);
    toast.success(`Round ${editingRound.roundNumber} updated`);
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
      <div className="container px-4 py-4 md:py-8">
        <div className="mb-4 md:mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => router.push("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">{game.gameType.charAt(0).toUpperCase() + game.gameType.slice(1)}</h1>
          </div>
          <Button variant="destructive" onClick={handleOpenEndGameDialog}>
            End Game
          </Button>
        </div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Tabs defaultValue="scoreboard">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="scoreboard">Scoreboard</TabsTrigger>
                <TabsTrigger value="add-round">Add Round</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="scoreboard" className="mt-3 md:mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Scoreboard</CardTitle>
                    <CardDescription>
                      Game ends at {game.endScore} points
                      {game.gameType === "hearts" && " (lowest score wins)"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                      <table className="w-full border-collapse min-w-[400px]">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 text-left font-medium">Round</th>
                            {game.players.map((player) => (
                              <th key={player.id} className="py-2 text-left font-medium">
                                {player.name}
                              </th>
                            ))}
                            <th className="py-2 text-left font-medium">Notes</th>
                            <th className="py-2 text-left font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {game.rounds.map((round) => (
                            <tr key={round.roundNumber} className="border-b">
                              <td className="py-2 pr-4">{round.roundNumber}</td>
                              {game.players.map((player) => {
                                const score = round.playerScores.find(
                                  (s) => s.playerId === player.id
                                );
                                return (
                                  <td key={player.id} className="py-2 pr-4">
                                    {score ? score.score : 0}
                                  </td>
                                );
                              })}
                              <td className="py-2 text-sm text-muted-foreground">
                                {round.notes}
                              </td>
                              <td className="py-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenEditRoundDialog(round)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                          <tr className="font-bold">
                            <td className="py-2 pr-4">Total</td>
                            {game.players.map((player) => (
                              <td key={player.id} className="py-2 pr-4">
                                {totalScores[player.id]}
                              </td>
                            ))}
                            <td></td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="add-round" className="mt-3 md:mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Add Round {game.rounds.length + 1}</CardTitle>
                    <CardDescription>
                      Enter scores for each player
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {game.players.map((player) => (
                      <div key={player.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <Label htmlFor={`score-${player.id}`} className="w-full sm:w-24">
                          {player.name}
                        </Label>
                        <Input
                          id={`score-${player.id}`}
                          type="number"
                          value={newRound[player.id] || 0}
                          onChange={(e) =>
                            handleScoreChange(player.id, e.target.value)
                          }
                          className="flex-1"
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

              <TabsContent value="notes" className="mt-3 md:mt-4">
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
                      <Input
                        id="game-note"
                        value={gameNote}
                        onChange={(e) => setGameNote(e.target.value)}
                        placeholder="Add a game note"
                        className="mt-1"
                      />
                    </div>

                    {game.notes.length > 0 ? (
                      <div className="mt-4 space-y-2">
                        <h3 className="font-medium">Existing Notes</h3>
                        <ul className="space-y-2">
                          {game.notes.map((note, index) => (
                            <li key={index} className="p-2 bg-muted rounded-md">
                              {note}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No notes yet</p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={handleAddGameNote}
                      className="ml-auto gap-2"
                      disabled={!gameNote.trim()}
                    >
                      <Plus className="h-4 w-4" />
                      Add Note
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Players</CardTitle>
                <CardDescription>
                  {game.players.length} players in this game
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {game.players.map((player) => (
                    <li
                      key={player.id}
                      className="flex items-center justify-between p-2 bg-muted rounded-md"
                    >
                      <span>{player.name}</span>
                      <span className="font-medium">{totalScores[player.id]}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* End Game Dialog */}
      <Dialog open={showEndGameDialog} onOpenChange={setShowEndGameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Game</DialogTitle>
            <DialogDescription>
              Are you sure you want to end this game?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="winner">Winner</Label>
            <select
              id="winner"
              value={winner || ""}
              onChange={(e) => setWinner(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
            >
              <option value="">No winner</option>
              {game.players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name} ({totalScores[player.id]} points)
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

      {/* Add Edit Round Dialog */}
      <Dialog open={showEditRoundDialog} onOpenChange={setShowEditRoundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Round {editingRound?.roundNumber}</DialogTitle>
            <DialogDescription>
              Update scores for each player
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {game.players.map((player) => (
              <div key={player.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <Label htmlFor={`edit-score-${player.id}`} className="w-full sm:w-24">
                  {player.name}
                </Label>
                <Input
                  id={`edit-score-${player.id}`}
                  type="number"
                  value={editRoundData[player.id] || 0}
                  onChange={(e) =>
                    handleEditScoreChange(player.id, e.target.value)
                  }
                  className="flex-1"
                />
              </div>
            ))}

            <div className="pt-2">
              <Label htmlFor="edit-round-note">Round Note (Optional)</Label>
              <Input
                id="edit-round-note"
                value={editRoundNote}
                onChange={(e) => setEditRoundNote(e.target.value)}
                placeholder="Add a note for this round"
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditRoundDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditedRound}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
