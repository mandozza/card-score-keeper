"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameStore } from "@/lib/store/gameStore";
import { ArrowRight, Calendar, Users } from "lucide-react";
import Link from "next/link";

export default function History() {
  const { recentGames } = useGameStore();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="mb-6 text-3xl font-bold">Game History</h1>

        {recentGames.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <h2 className="mb-2 text-xl font-semibold">No Game History</h2>
            <p className="mb-4 text-muted-foreground">
              You haven't played any games yet. Start a new game to see your history.
            </p>
            <Button asChild>
              <Link href="/game/new">Start New Game</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentGames.map((game) => (
              <Card key={game.id}>
                <CardHeader>
                  <CardTitle>
                    {game.gameType.charAt(0).toUpperCase() + game.gameType.slice(1)}
                  </CardTitle>
                  <CardDescription>
                    {formatDate(game.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {game.players.length} players
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {game.rounds.length} rounds played
                    </span>
                  </div>

                  <div>
                    <h3 className="mb-1 text-sm font-medium">Players</h3>
                    <div className="flex flex-wrap gap-1">
                      {game.players.map((player) => (
                        <span
                          key={player.id}
                          className="inline-flex rounded-full bg-secondary px-2 py-1 text-xs"
                        >
                          {player.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto gap-1"
                    asChild
                  >
                    <Link href={`/game/${game.id}`}>
                      View Details
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
