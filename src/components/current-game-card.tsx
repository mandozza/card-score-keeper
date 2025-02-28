"use client";

import Link from "next/link";
import { useGameStore } from "@/lib/store/gameStore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CurrentGameCard() {
  const { currentGame } = useGameStore();

  if (!currentGame || !currentGame.isActive) {
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

  return (
    <Card className="shadow-md border-primary/20 mb-8">
      <CardHeader className="pb-2 bg-primary/5">
        <CardTitle className="flex justify-between items-center">
          <span>Current Game: {currentGame.gameType}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {new Date(currentGame.createdAt).toLocaleDateString()}
          </span>
        </CardTitle>
        <CardDescription>
          {currentGame.players.length} players • {currentGame.rounds.length} rounds played
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <h3 className="text-sm font-medium mb-2">Players</h3>
            <ul className="space-y-1">
              {playerTotals.map(({ player, totalScore }) => (
                <li key={player.id} className="flex justify-between">
                  <span>{player.name}</span>
                  <span className="font-medium">{totalScore}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Game Details</h3>
            <p className="text-sm">Target score: {currentGame.endScore}</p>
            <p className="text-sm">Last updated: {new Date(currentGame.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/game/${currentGame.id}`} className="gap-2">
            Continue Game
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
