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
import { Plus, Save, Trophy, ArrowLeft, Trash2, Edit, User, Shuffle } from "lucide-react";
import { Game, Player, PlayerScore, Round } from "@/lib/store/gameStore";
import dynamic from "next/dynamic";
import { defaultRankConfigs, PlayerRankConfigs } from "@/types/ranks";
import { transformRankText } from "@/lib/utils";

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

export default function GameDetail() {
  const params = useParams();
  const router = useRouter();
  const { currentGame, addRound, addNote, endGame, updateRound, recentGames, assignRandomRanks } = useGameStore();
  const [game, setGame] = useState<Game | null>(null);
  const [newRound, setNewRound] = useState<{ [key: string]: number }>({});
  const [roundNote, setRoundNote] = useState("");
  const [gameNote, setGameNote] = useState("");
  const [showEndGameDialog, setShowEndGameDialog] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [showShootMoonDialog, setShowShootMoonDialog] = useState(false);
  const [shootingPlayer, setShootingPlayer] = useState<string | null>(null);

  // Add state for editing rounds
  const [editingRound, setEditingRound] = useState<Round | null>(null);
  const [editRoundData, setEditRoundData] = useState<{ [key: string]: number }>({});
  const [editRoundNote, setEditRoundNote] = useState("");
  const [showEditRoundDialog, setShowEditRoundDialog] = useState(false);

  // Add state for editing player names
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editPlayerName, setEditPlayerName] = useState("");
  const [showEditPlayerDialog, setShowEditPlayerDialog] = useState(false);

  // Add state for editing notes
  const [editingNote, setEditingNote] = useState<{ index: number; text: string } | null>(null);
  const [showEditNoteDialog, setShowEditNoteDialog] = useState(false);

  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [activeTab, setActiveTab] = useState("scoreboard");

  const [rankConfigs, setRankConfigs] = useState<PlayerRankConfigs>(defaultRankConfigs);

  useEffect(() => {
    // Load rank configs from localStorage
    const savedConfigs = localStorage.getItem('rankConfigs');
    if (savedConfigs) {
      setRankConfigs(JSON.parse(savedConfigs));
    }
  }, []);

  const calculatePointsFromRank = (rank: string, playerCount: number) => {
    const configs = rankConfigs[playerCount as keyof PlayerRankConfigs];
    const config = configs.find(c => c.rank === rank);
    return config?.points || 0;
  };

  const getRankOptions = (playerCount: number) => {
    const configs = rankConfigs[playerCount as keyof PlayerRankConfigs];
    return configs.map(c => c.rank);
  };

  const [roundRanks, setRoundRanks] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (game?.players) {
      const initialRanks: { [key: string]: string } = {};
      game.players.forEach((player) => {
        initialRanks[player.id] = '';
      });
      setRoundRanks(initialRanks);
    }
  }, [game]);

  const handleRankChange = (playerId: string, rank: string) => {
    if (!game) return;

    const player = game.players.find(p => p.id === playerId);
    const oldRank = player?.rank;

    setRoundRanks(prev => ({
      ...prev,
      [playerId]: rank
    }));

    // Calculate and update the points
    const points = calculatePointsFromRank(rank, game.players.length);
    setNewRound(prev => ({
      ...prev,
      [playerId]: points
    }));

    // Add note about rank change if it's different
    if (oldRank && oldRank !== rank) {
      const playerName = player?.name || '';
      let rankChangeNote = `${playerName} moved from ${transformRankText(oldRank)} to ${transformRankText(rank)}`;
      // Add crown emoji if the player became President
      if (rank === 'President') {
        rankChangeNote += ' 👑';
      }
      setRoundNote(prev => prev ? `${prev} - ${rankChangeNote}` : rankChangeNote);
    }
  };

  const isRankTaken = (rank: string) => {
    return Object.values(roundRanks).includes(rank);
  };

  useEffect(() => {
    if (!currentGame || currentGame.id !== params.id) {
      // Check if the game exists in recentGames
      const pastGame = recentGames.find(game => game.id === params.id);
      if (pastGame) {
        setGame(pastGame);
        // Initialize new round with player IDs
        const initialRound: { [key: string]: number } = {};
        pastGame.players.forEach((player) => {
          initialRound[player.id] = 0;
        });
        setNewRound(initialRound);
      } else {
        // Game not found in current or recent games
        router.push("/");
        return;
      }
    } else {
      setGame(currentGame);
      // Initialize new round with player IDs
      const initialRound: { [key: string]: number } = {};
      currentGame.players.forEach((player) => {
        initialRound[player.id] = 0;
      });
      setNewRound(initialRound);
    }
  }, [currentGame, params.id, router, recentGames]);

  useEffect(() => {
    // Update window size
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

    // Validate Hearts scoring rules
    if (game.gameType === "hearts") {
      const totalPoints = playerScores.reduce((sum, score) => sum + score.score, 0);
      const shootTheMoonPoints = (game.players.length - 1) * 26;

      if (totalPoints !== 26 && totalPoints !== shootTheMoonPoints) {
        toast.error(`Invalid scores. Total points must be either 26 or ${shootTheMoonPoints} (shoot the moon)`);
        return;
      }
    }

    // Get current leader before adding new scores
    const currentLeader = getDefaultWinner();

    // Calculate new totals with the new round
    const updatedTotals = { ...totalScores };
    playerScores.forEach((score) => {
      updatedTotals[score.playerId] += score.score;
    });

    // Determine new leader
    const newLeader = game.players.reduce((leader, player) => {
      if (game.gameType === "hearts") {
        return updatedTotals[player.id] < updatedTotals[leader.id] ? player : leader;
      }
      return updatedTotals[player.id] > updatedTotals[leader.id] ? player : leader;
    }, game.players[0]);

    // Add note about leader change if different
    let finalNote = roundNote;
    if (currentLeader !== newLeader.id) {
      const leaderName = game.players.find(p => p.id === newLeader.id)?.name || '';
      const leaderMessage = `${leaderName.charAt(0).toUpperCase() + leaderName.slice(1)} takes the lead!`;
      finalNote = roundNote ? `${roundNote} - ${leaderMessage}` : leaderMessage;
    }

    const round: Round = {
      roundNumber,
      playerScores,
      notes: finalNote || undefined,
    };

    // Update player ranks based on the selected ranks
    const updatedPlayers = game.players.map(player => ({
      ...player,
      rank: roundRanks[player.id] || player.rank
    }));

    // Update the game in the store with new ranks
    const updatedGame: Game = {
      ...game,
      players: updatedPlayers,
      updatedAt: new Date()
    };

    // Update local state
    setGame(updatedGame);

    // Update store
    useGameStore.setState({ currentGame: updatedGame });

    // Add the round
    addRound(round);

    // Reset form
    const resetRound: { [key: string]: number } = {};
    game.players.forEach((player) => {
      resetRound[player.id] = 0;
    });
    setNewRound(resetRound);
    setRoundRanks({});  // Reset rank selections
    setRoundNote("");

    toast.success(`Round ${roundNumber} added`);

    // Check if any player has reached the end score
    if (game.players.find((player) => updatedTotals[player.id] >= game.endScore)) {
      setWinner(newLeader.id);
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

    // Validate Hearts scoring rules
    if (game.gameType === "hearts") {
      const totalPoints = playerScores.reduce((sum, score) => sum + score.score, 0);
      const shootTheMoonPoints = (game.players.length - 1) * 26;

      if (totalPoints !== 26 && totalPoints !== shootTheMoonPoints) {
        toast.error(`Invalid scores. Total points must be either 26 or ${shootTheMoonPoints} (shoot the moon)`);
        return;
      }
    }

    const updatedRound: Round = {
      ...editingRound,
      playerScores,
      notes: editRoundNote || undefined,
    };

    updateRound(editingRound.roundNumber, updatedRound);
    setShowEditRoundDialog(false);
    toast.success(`Round ${editingRound.roundNumber} updated`);
  };

  // Add handler for opening the edit player dialog
  const handleOpenEditPlayerDialog = (player: Player) => {
    setEditingPlayer(player);
    setEditPlayerName(player.name);
    setShowEditPlayerDialog(true);
  };

  // Add handler for saving edited player name
  const handleSaveEditedPlayer = () => {
    if (!editingPlayer || !editPlayerName.trim()) return;

    // Create a new player object with the updated name
    const updatedPlayer: Player = {
      ...editingPlayer,
      name: editPlayerName.trim()
    };

    // Update the player in the game
    if (game) {
      const updatedPlayers = game.players.map(p =>
        p.id === updatedPlayer.id ? updatedPlayer : p
      );

      // Update the game in the store
      const updatedGame: Game = {
        ...game,
        players: updatedPlayers,
        updatedAt: new Date()
      };

      // Update the local state
      setGame(updatedGame);

      // Update the game in the store
      // Since we don't have a direct updatePlayer function in the store,
      // we'll need to update the entire currentGame
      useGameStore.setState({ currentGame: updatedGame });

      // Save the game to storage
      setTimeout(() => {
        useGameStore.getState().saveCurrentGame();
      }, 0);

      setShowEditPlayerDialog(false);
      toast.success(`Player name updated to ${editPlayerName}`);
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

  const handleEditNote = (index: number, text: string) => {
    setEditingNote({ index, text });
    setShowEditNoteDialog(true);
  };

  const handleSaveEditedNote = () => {
    if (!editingNote || !game) return;

    const updatedNotes = [...game.notes];
    updatedNotes[editingNote.index] = editingNote.text;

    // Update the game in the store
    const updatedGame: Game = {
      ...game,
      notes: updatedNotes,
      updatedAt: new Date()
    };

    // Update the local state
    setGame(updatedGame);

    // Update the game in the store
    useGameStore.setState({ currentGame: updatedGame });

    // Save the game to storage
    setTimeout(() => {
      useGameStore.getState().saveCurrentGame();
    }, 0);

    setShowEditNoteDialog(false);
    toast.success('Note updated');
  };

  const handleShootMoon = () => {
    if (!shootingPlayer) return;

    const shootMoonScores: { [key: string]: number } = {};
    game.players.forEach((player) => {
      shootMoonScores[player.id] = player.id === shootingPlayer ? 0 : 26;
    });

    // Add note about who shot the moon
    const shootingPlayerName = getPlayerName(shootingPlayer);
    setRoundNote(`${shootingPlayerName} shot the moon! 🌙`);

    // Show confetti
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000); // Hide after 5 seconds

    setNewRound(shootMoonScores);
    setShowShootMoonDialog(false);
    setShootingPlayer(null);
    setActiveTab("add-round"); // Switch to Add Round tab
  };

  // Add this section after the loading check and before the return statement
  const showAssignRanksButton = game && game.rounds.length === 0;

  const handleAssignRanks = () => {
    assignRandomRanks();
    toast.success('Ranks assigned randomly!');
  };

  return (
    <MainLayout>
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={200}
          recycle={false}
          colors={['#c084fc', '#a855f7', '#7c3aed', '#6b21a8']} // Purple theme colors
        />
      )}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.push('/')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold capitalize">
            {game.gameType === 'president' ? localStorage.getItem('presidentAlias') || 'President' : game.gameType}
          </h1>
        </div>

        {showAssignRanksButton && (
          <div className="w-full flex justify-center">
            <Card className="mb-8 w-[75%]">
              <CardHeader>
                <CardTitle>Assign Initial Ranks</CardTitle>
                <CardDescription>
                  Randomly assign ranks to all players before starting the game
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className={`grid grid-cols-1 ${game.players.length === 4 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
                    {game.players.map((player) => (
                      <div key={player.id} className="flex items-center gap-2 p-2 border rounded">
                        <User className="h-4 w-4" />
                        <span>{player.name}</span>
                        {player.rank && (
                          <span className="ml-auto text-sm text-muted-foreground">
                            {transformRankText(player.rank)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleAssignRanks}
                    className="flex items-center gap-2"
                  >
                    <Shuffle className="h-4 w-4" />
                    Randomly Assign Ranks
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-4 md:gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Tabs defaultValue="scoreboard" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="scoreboard">Scoreboard</TabsTrigger>
                {game.isActive && <TabsTrigger value="add-round">Add Round</TabsTrigger>}
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
                            <th className="py-2 px-4 text-left font-medium">Round</th>
                            {game.players.map((player) => (
                              <th key={player.id} className={`py-2 px-4 text-left font-medium ${player.id === getDefaultWinner() ? 'bg-yellow-500/5' : ''}`}>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="capitalize">{player.name}</span>
                                    {player.id === getDefaultWinner() && (
                                      <Trophy className="h-4 w-4 text-yellow-500" />
                                    )}
                                    {player.rank === 'President' && (
                                      <span role="img" aria-label="crown">👑</span>
                                    )}
                                  </div>
                                  {player.rank && (
                                    <span className="text-xs text-muted-foreground font-normal">
                                      {transformRankText(player.rank)}
                                    </span>
                                  )}
                                </div>
                              </th>
                            ))}
                            <th className="py-2 px-4 text-left font-medium">Notes</th>
                            {game.isActive && <th className="py-2 px-4 text-left font-medium">Actions</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {game.rounds.map((round) => (
                            <tr key={round.roundNumber} className="border-b">
                              <td className="py-2 px-4">{round.roundNumber}</td>
                              {game.players.map((player) => {
                                const score = round.playerScores.find(
                                  (s) => s.playerId === player.id
                                );
                                return (
                                  <td key={player.id} className={`py-2 px-4 ${player.id === getDefaultWinner() ? 'bg-yellow-500/5' : ''}`}>
                                    {score ? score.score : 0}
                                  </td>
                                );
                              })}
                              <td className="py-2 px-4 text-sm text-muted-foreground">
                                {round.notes}
                              </td>
                              {game.isActive && (
                                <td className="py-2 px-4">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenEditRoundDialog(round)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </td>
                              )}
                            </tr>
                          ))}
                          <tr className="font-bold">
                            <td className="py-2 px-4">Total</td>
                            {game.players.map((player) => (
                              <td key={player.id} className={`py-2 px-4 ${player.id === getDefaultWinner() ? 'bg-yellow-500/5' : ''}`}>
                                {totalScores[player.id]}
                              </td>
                            ))}
                            <td></td>
                            {game.isActive && <td></td>}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {game.isActive && (
                <TabsContent value="add-round" className="mt-3 md:mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Add Round {game.rounds.length + 1}</CardTitle>
                      <CardDescription>
                        Select the rank for each player
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {game.players.map((player) => (
                        <div key={player.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <Label htmlFor={`rank-${player.id}`} className="w-full sm:w-24">
                            {player.name}
                          </Label>
                          <select
                            id={`rank-${player.id}`}
                            value={roundRanks[player.id] || ''}
                            onChange={(e) => handleRankChange(player.id, e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select rank...</option>
                            {getRankOptions(game.players.length).map((rank) => (
                              <option
                                key={rank}
                                value={rank}
                                disabled={isRankTaken(rank) && roundRanks[player.id] !== rank}
                              >
                                {transformRankText(rank)} ({calculatePointsFromRank(rank, game.players.length)} pts)
                              </option>
                            ))}
                          </select>
                          <div className="text-sm text-muted-foreground w-20 text-right">
                            {newRound[player.id] || 0} points
                          </div>
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
                      <Button
                        onClick={handleAddRound}
                        className="ml-auto gap-2"
                        disabled={Object.values(roundRanks).some(rank => !rank)}
                      >
                        <Save className="h-4 w-4" />
                        Save Round
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              )}

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

                    <div className="mt-4 space-y-2">
                      <h3 className="font-medium">Existing Notes</h3>
                      <ul className="space-y-2">
                        {game.notes.map((note, index) => (
                          <li key={index} className="p-2 bg-muted rounded-md flex items-center justify-between">
                            <span>{note}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditNote(index, note)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
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
                <CardTitle>Game Summary</CardTitle>
                <CardDescription>
                  <div>{game.players.length} players in this game</div>
                  <div>Game ends at {game.endScore} points{game.gameType === "hearts" && " (lowest score wins)"}</div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {game.gameType === "hearts" && game.isActive && (
                  <>
                    <div className="mb-6">
                      <Button
                        variant="default"
                        onClick={() => setShowShootMoonDialog(true)}
                        className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold py-6 flex items-center justify-center gap-2"
                      >
                        <span className="text-xl">🌙</span>
                        Shoot the Moon!
                        <span className="text-xl">⭐️</span>
                      </Button>
                    </div>
                    <div className="mb-6 p-4 bg-muted rounded-lg">
                      <div className="text-sm font-medium mb-2">Current Round Points</div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold">
                            {Object.values(newRound).reduce((sum, score) => sum + score, 0)}
                          </span>
                          <span className="text-muted-foreground"> / 26</span>
                        </div>
                        {Object.values(newRound).reduce((sum, score) => sum + score, 0) === 26 ? (
                          <span className="text-green-500">✓</span>
                        ) : (
                          <span className="text-muted-foreground">Points remaining: {26 - Object.values(newRound).reduce((sum, score) => sum + score, 0)}</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
                <ul className="space-y-2">
                  {[...game.players]
                    .sort((a, b) => {
                      // For Hearts, sort by lowest score first
                      if (game.gameType === "hearts") {
                        return totalScores[a.id] - totalScores[b.id];
                      }
                      // For other games, sort by highest score first
                      return totalScores[b.id] - totalScores[a.id];
                    })
                    .map((player) => (
                      <li
                        key={player.id}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <span className="capitalize">{player.name}</span>
                          {player.rank && (
                            <span className="text-xs text-muted-foreground">
                              ({transformRankText(player.rank)}) {player.rank === 'President' && '👑'}
                            </span>
                          )}
                          {player.id === getDefaultWinner() && (
                            <Trophy className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{totalScores[player.id]}</span>
                          {game.isActive && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditPlayerDialog(player)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
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

      {/* Add Edit Player Dialog */}
      <Dialog open={showEditPlayerDialog} onOpenChange={setShowEditPlayerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Player</DialogTitle>
            <DialogDescription>
              Update player name
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="edit-player-name">Player Name</Label>
            <Input
              id="edit-player-name"
              value={editPlayerName}
              onChange={(e) => setEditPlayerName(e.target.value)}
              placeholder="Enter player name"
              className="mt-1"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditPlayerDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEditedPlayer}
              disabled={!editPlayerName.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Edit Note Dialog */}
      <Dialog open={showEditNoteDialog} onOpenChange={setShowEditNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Update the note text
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="edit-note">Note</Label>
            <Input
              id="edit-note"
              value={editingNote?.text || ''}
              onChange={(e) => setEditingNote(prev => prev ? { ...prev, text: e.target.value } : null)}
              placeholder="Enter note text"
              className="mt-1"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditNoteDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEditedNote}
              disabled={!editingNote?.text.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Shoot the Moon Dialog */}
      <Dialog open={showShootMoonDialog} onOpenChange={setShowShootMoonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shoot the Moon</DialogTitle>
            <DialogDescription>
              Select the player who shot the moon. They will receive 0 points while all other players receive 26 points.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="shooting-player">Who Shot the Moon?</Label>
            <select
              id="shooting-player"
              value={shootingPlayer || ""}
              onChange={(e) => setShootingPlayer(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
            >
              <option value="">Select a player</option>
              {game.players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowShootMoonDialog(false);
              setShootingPlayer(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleShootMoon} disabled={!shootingPlayer}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
