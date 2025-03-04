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

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { recentGames, clearCurrentGame, setStorageType, storageType, loadGamesFromStorage } = useGameStore();
  const { storageType: contextStorageType, setStorageType: setContextStorageType } = useStorage();
  const [confirmClear, setConfirmClear] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync storage type from context to game store
  useEffect(() => {
    if (storageType !== contextStorageType) {
      setStorageType(contextStorageType);
    }
  }, [contextStorageType, setStorageType, storageType]);

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

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="mb-8 text-3xl font-bold">Settings</h1>

        <div className="grid gap-6 md:grid-cols-2 mx-auto max-w-6xl">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
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
      </div>
    </MainLayout>
  );
}
