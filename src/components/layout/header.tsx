"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Card Score Keeper</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/" ? "text-foreground" : "text-foreground/60"
              }`}
            >
              Home
            </Link>
            <Link
              href="/history"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/history" ? "text-foreground" : "text-foreground/60"
              }`}
            >
              History
            </Link>
            <Link
              href="/settings"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/settings" ? "text-foreground" : "text-foreground/60"
              }`}
            >
              Settings
            </Link>
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Button asChild size="sm" className="gap-1">
            <Link href="/game/new">
              <Plus className="h-4 w-4" />
              <span>New Game</span>
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
