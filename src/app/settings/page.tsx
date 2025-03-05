"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useGameStore } from "@/lib/store/gameStore";
import { useStorage } from "@/lib/store/storageProvider";
import { getStorageAdapter } from "@/lib/store/storageAdapters";
import { Moon, Sun, Trash2, Database, HardDrive } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Game } from "@/lib/store/gameStore";
import { defaultRankConfigs, PlayerRankConfigs } from "@/types/ranks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { recentGames, clearCurrentGame, setStorageType, storageType, loadGamesFromStorage } = useGameStore();
  const { storageType: contextStorageType, setStorageType: setContextStorageType } = useStorage();
  const [confirmClear, setConfirmClear] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rankConfigs, setRankConfigs] = useState<PlayerRankConfigs>(defaultRankConfigs);
  const [defaultPlayers, setDefaultPlayers] = useState<string[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [presidentAlias, setPresidentAlias] = useState('President');

  // Sync storage type from context to game store
  useEffect(() => {
    if (storageType !== contextStorageType) {
      setStorageType(contextStorageType);
    }
  }, [contextStorageType, setStorageType, storageType]);

  useEffect(() => {
    // Load rank configs from localStorage
    const savedConfigs = localStorage.getItem('rankConfigs');
    if (savedConfigs) {
      setRankConfigs(JSON.parse(savedConfigs));
    }
  }, []);

  useEffect(() => {
    // Load president alias from localStorage
    const savedAlias = localStorage.getItem('presidentAlias');
    if (savedAlias) {
      setPresidentAlias(savedAlias);
    }
  }, []);

  useEffect(() => {
    // Load default players from localStorage
    const savedPlayers = localStorage.getItem('defaultPlayers');
    if (savedPlayers) {
      setDefaultPlayers(JSON.parse(savedPlayers));
    }
  }, []);

  const handleClearHistory = async () => {
    if (confirmClear) {
      try {
        // Get all games from storage
        const adapter = getStorageAdapter(contextStorageType);
        const games = await adapter.getGames();

        // Delete each game
        await Promise.all(games
          .filter((game): game is Game & { id: string } => typeof game.id === 'string')
          .map(game => adapter.deleteGame(game.id)));

        // Clear the current game and recent games from the store
        clearCurrentGame();
        useGameStore.setState({ recentGames: [] });

        toast.success("Game history cleared");
        setConfirmClear(false);
      } catch (error) {
        console.error('Error clearing game history:', error);
        toast.error('Failed to clear game history');
      }
    } else {
      setConfirmClear(true);
    }
  };

  const handleStorageChange = async (type: 'local' | 'mongodb') => {
    try {
      setIsLoading(true);
      setContextStorageType(type);

      // Load games from the new storage type
      await loadGamesFromStorage();

      toast.success(`Storage type changed to ${type === 'local' ? 'Local Storage' : 'MongoDB'}`);
    } catch (error) {
      console.error('Error changing storage type:', error);
      toast.error('Failed to change storage type');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePointsChange = (playerCount: number, index: number, points: number) => {
    const newConfigs = { ...rankConfigs };
    newConfigs[playerCount as keyof PlayerRankConfigs][index].points = points;
    setRankConfigs(newConfigs);
    localStorage.setItem('rankConfigs', JSON.stringify(newConfigs));
    toast.success('Rank points updated');
  };

  const handleAddDefaultPlayer = () => {
    if (!newPlayerName.trim()) return;

    const updatedPlayers = [...defaultPlayers, newPlayerName.trim()];
    setDefaultPlayers(updatedPlayers);
    localStorage.setItem('defaultPlayers', JSON.stringify(updatedPlayers));
    setNewPlayerName('');
    toast.success('Player added to defaults');
  };

  const handleRemoveDefaultPlayer = (index: number) => {
    const updatedPlayers = defaultPlayers.filter((_, i) => i !== index);
    setDefaultPlayers(updatedPlayers);
    localStorage.setItem('defaultPlayers', JSON.stringify(updatedPlayers));
    toast.success('Player removed from defaults');
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="mb-8 text-3xl font-bold">Settings</h1>

        <div className="grid gap-6 md:grid-cols-2 mx-auto max-w-6xl">
          <Card className="shadow-sm hover:shadow-md transition-shadow col-span-1 justify-self-center w-full">
            <CardHeader className="pb-2">
              <CardTitle>Rank Configuration</CardTitle>
              <CardDescription>
                Configure points for different ranks based on the number of players
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="4" className="w-full">
                <TabsList>
                  <TabsTrigger value="4">4 Players</TabsTrigger>
                  <TabsTrigger value="5">5 Players</TabsTrigger>
                  <TabsTrigger value="6">6 Players</TabsTrigger>
                </TabsList>
                {[4, 5, 6].map((playerCount) => (
                  <TabsContent key={playerCount} value={playerCount.toString()}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rankConfigs[playerCount as keyof PlayerRankConfigs].map((config, index) => (
                          <TableRow key={index}>
                            <TableCell>{config.rank}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={config.points}
                                onChange={(e) => handlePointsChange(playerCount, index, parseInt(e.target.value) || 0)}
                                className="w-20"
                                min={0}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle>Storage Options</CardTitle>
                <CardDescription>
                  Choose where to store your game data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue={contextStorageType} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="local"
                      onClick={() => handleStorageChange('local')}
                      disabled={isLoading}
                    >
                      <HardDrive className="mr-2 h-4 w-4" />
                      Local Storage
                    </TabsTrigger>
                    <TabsTrigger
                      value="mongodb"
                      onClick={() => handleStorageChange('mongodb')}
                      disabled={isLoading}
                    >
                      <Database className="mr-2 h-4 w-4" />
                      MongoDB
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="local" className="mt-4">
                    <div className="space-y-2">
                      <p className="text-sm">
                        Data is stored in your browser's local storage. It will be available only on this device and browser.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Note: Clearing browser data will delete your game history.
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="mongodb" className="mt-4">
                    <div className="space-y-2">
                      <p className="text-sm">
                        Data is stored in MongoDB. It will be available across devices when you're logged in.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Note: Internet connection is required to access your data.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Manage your game data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Clear Game History</Label>
                  <p className="text-sm text-muted-foreground">
                    This will permanently delete your current game and history.
                  </p>
                  <Button
                    variant={confirmClear ? "destructive" : "outline"}
                    onClick={handleClearHistory}
                    className="mt-2"
                  >
                    {confirmClear ? (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Confirm Clear History
                      </>
                    ) : (
                      "Clear History"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm hover:shadow-md transition-shadow col-span-1">
            <CardHeader className="pb-2">
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the app looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark mode
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4 text-muted-foreground" />
                  <Switch
                    id="dark-mode"
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  />
                  <Moon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow col-span-1">
            <CardHeader className="pb-2">
              <CardTitle>Game Title</CardTitle>
              <CardDescription>
                Choose how you want to refer to the highest rank
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex gap-8">
                  {['President', 'Scum', 'Asshole'].map((alias) => (
                    <div key={alias} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={alias.toLowerCase()}
                        name="presidentAlias"
                        value={alias}
                        checked={presidentAlias === alias}
                        onChange={(e) => {
                          setPresidentAlias(e.target.value);
                          localStorage.setItem('presidentAlias', e.target.value);
                          toast.success(`Game title changed to ${e.target.value}`);
                        }}
                        className="text-primary"
                      />
                      <Label htmlFor={alias.toLowerCase()}>{alias}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Default Players</CardTitle>
              <CardDescription>
                Manage your list of default players for quick game setup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Enter player name"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddDefaultPlayer();
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={handleAddDefaultPlayer}
                  disabled={!newPlayerName.trim()}
                >
                  Add Player
                </Button>
              </div>

              <div className="space-y-2">
                {defaultPlayers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No default players added yet.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                    {[...defaultPlayers]
                      .sort((a, b) => a.localeCompare(b))
                      .map((player, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <span className="truncate">{player}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveDefaultPlayer(index)}
                          className="h-8 w-8 ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
