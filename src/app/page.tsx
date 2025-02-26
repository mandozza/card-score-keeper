import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

export default function Home() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
        <div className="flex flex-col items-center justify-center space-y-6 text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Card Score Keeper
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground">
            A digital scorekeeper for card games like Hearts and President.
          </p>
          <div className="flex gap-4 mt-4">
            <Button asChild size="lg">
              <Link href="/game/new" className="gap-2">
                <Plus className="h-5 w-5" />
                Start New Game
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/history" className="gap-2">
                View History
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mx-auto max-w-7xl">
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
