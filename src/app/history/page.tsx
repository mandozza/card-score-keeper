"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameStore } from "@/lib/store/gameStore";
import { ArrowRight, Calendar, Users, PlayCircle } from "lucide-react";
import Link from "next/link";

export default function History() {
  const { recentGames, currentGame } = useGameStore();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Function to render a game card
  const renderGameCard = (game, isCurrentGame = false) => (
    <Card key={game.id} className={`shadow-sm hover:shadow-md transition-shadow ${isCurrentGame ? 'border-primary border-2' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            {game.gameType.charAt(0).toUpperCase() + game.gameType.slice(1)}
          </CardTitle>
          {isCurrentGame && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
              <PlayCircle className="h-3 w-3 mr-1" />
              Current Game
            </span>
          )}
        </div>
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
            {isCurrentGame ? "Continue Game" : "View Details"}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );

  const hasGames = currentGame || recentGames.length > 0;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="mb-8 text-3xl font-bold">Game History</h1>

        {!hasGames ? (
          <div className="rounded-lg border p-8 text-center mx-auto max-w-2xl">
            <h2 className="mb-2 text-xl font-semibold">No Game History</h2>
            <p className="mb-4 text-muted-foreground">
              You haven't played any games yet. Start a new game to see your history.
            </p>
            <Button asChild>
              <Link href="/game/new">Start New Game</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {currentGame && (
              <div>
                <h2 className="mb-4 text-xl font-semibold">Current Game</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mx-auto max-w-7xl">
                  {renderGameCard(currentGame, true)}
                </div>
              </div>
            )}

            {recentGames.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-semibold">Past Games</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mx-auto max-w-7xl">
                  {recentGames.map((game) => renderGameCard(game))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
