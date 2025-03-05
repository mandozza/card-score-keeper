"use client";

import Link from "next/link";
import { useGameStore } from "@/lib/store/gameStore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Crown, Target, Clock, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function CurrentGameCard() {
  const { currentGame } = useGameStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

console.log('CURRENT GAME CARD');
  console.log('currentGame', currentGame );
  console.log('isClient', isClient);
  console.log('currentGame.isActive', currentGame?.isActive);

  if (!isClient || !currentGame || !currentGame.isActive) {
    return null;
  }

  // Calculate total scores for each player
  const playerTotals = currentGame.players.map(player => {
    const totalScore = currentGame.rounds.reduce((total, round) => {
      const playerScore = round.playerScores.find(ps => ps.playerId === player.id);
      return total + (playerScore?.score || 0);
    }, 0);

    return {
      player,
      totalScore
    };
  });

  // Safely format dates
  const formatDate = (dateInput: Date | string) => {
    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      return date.toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateInput: Date | string) => {
    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      return date.toLocaleString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getDisplayGameType = (gameType: string) => {
    if (gameType === 'president') {
      return localStorage.getItem('presidentAlias') || 'President';
    }
    return gameType.charAt(0).toUpperCase() + gameType.slice(1);
  };

  // Get the player in the lead
  const getLeadingPlayer = () => {
    if (!playerTotals.length) return null;
    const sorted = [...playerTotals].sort((a, b) => {
      if (currentGame.gameType === 'hearts') {
        return a.totalScore - b.totalScore; // Lower score wins in Hearts
      }
      return b.totalScore - a.totalScore; // Higher score wins in other games
    });
    return sorted[0];
  };

  const leadingPlayer = getLeadingPlayer();

  return (
    <Card className="shadow-md border-primary/20 mb-8">
      <CardHeader className="pb-2 bg-primary/5">
        <CardTitle className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            {currentGame.gameType === 'hearts' ? (
              <Heart className="h-5 w-5 text-red-500" />
            ) : (
              <Crown className="h-5 w-5 text-yellow-500" />
            )}
            Current Game: {getDisplayGameType(currentGame.gameType)}
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            {formatDate(currentGame.createdAt)}
          </span>
        </CardTitle>
        <CardDescription>
          {currentGame.players.length} players • {currentGame.rounds.length} rounds played
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Players</h3>
              </div>
              <ul className="space-y-2">
                {playerTotals.map(({ player, totalScore }) => (
                  <li key={player.id} className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      {player === leadingPlayer?.player && (
                        <Trophy className="h-3 w-3 text-yellow-500" />
                      )}
                      <span>{player.name}</span>
                    </span>
                    <span className={cn(
                      "font-medium px-2 py-0.5 rounded text-sm",
                      player === leadingPlayer?.player ? "bg-primary/10 text-primary" : ""
                    )}>
                      {totalScore}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Game Progress</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Target score:</span>
                  <span className="font-medium">{currentGame.endScore}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Rounds played:</span>
                  <span className="font-medium">{currentGame.rounds.length}</span>
                </div>
                {leadingPlayer && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Current leader:</span>
                    <span className="font-medium flex items-center gap-1">
                      {leadingPlayer.player.name}
                      <Trophy className="h-3 w-3 text-yellow-500" />
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Last updated:</span>
                  <span className="font-medium">{formatDateTime(currentGame.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        <div className="w-full md:w-1/2 mx-auto">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/game/${currentGame.id}`} className="gap-2">
              Continue Game
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
