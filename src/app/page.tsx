"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Plus, AlertCircle } from "lucide-react";
import { CurrentGameCard } from "@/components/current-game-card";
import { useGameStore } from "@/lib/store/gameStore";
import { useState, useEffect } from "react";

export default function Home() {
  const { currentGame } = useGameStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const hasActiveGame = isClient && currentGame && currentGame.isActive;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            TallyJack
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground">
            A digital scorekeeper for card games like Hearts and President.
          </p>
          <div className="flex flex-col items-center gap-4 mt-4">
            {hasActiveGame ? (
              <Card className="shadow-sm hover:shadow-md transition-shadow bg-muted/50 border-primary/20 mb-4">
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Active Game in Progress
                  </CardTitle>
                  <CardDescription>
                    Continue your game below or check your game history
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <Button asChild size="lg">
                <Link href="/game/new" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Start New Game
                </Link>
              </Button>
            )}
            <div className="flex gap-4">
              {hasActiveGame && (
                <Button asChild size="lg">
                  <Link href={`/game/${currentGame?.id}`} className="gap-2">
                    View Current Game
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              )}
              <Button asChild variant={hasActiveGame ? "outline" : "outline"} size="lg">
                <Link href="/history" className="gap-2">
                  View History
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Current Game Section */}
        <div className="w-full md:w-1/2 mx-auto">
          <CurrentGameCard />
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mx-auto max-w-7xl mt-16">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle>Track Scores</CardTitle>
              <CardDescription>
                Keep track of scores round by round
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Easily input scores for each player after every round. The app automatically calculates totals and shows who's winning.</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle>Game History</CardTitle>
              <CardDescription>
                Review past games and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Access your game history to see who won previous games, review scores, and track player performance over time.</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle>Game Notes</CardTitle>
              <CardDescription>
                Add notes to games and rounds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Record special events, debts, or penalties with the built-in notes feature for both games and individual rounds.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
