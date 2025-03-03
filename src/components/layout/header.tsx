"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuHeight, setMenuHeight] = useState<number | undefined>(0);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    if (mobileMenuOpen && menuRef.current) {
      setMenuHeight(menuRef.current.scrollHeight);
    } else {
      setMenuHeight(0);
    }
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-8 flex items-center space-x-2">
            <span className="font-bold text-lg">TallyJack</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
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
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu with animation */}
      <div
        ref={menuRef}
        className="md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t bg-background"
        style={{ maxHeight: menuHeight ? `${menuHeight}px` : '0px', opacity: menuHeight ? 1 : 0 }}
      >
        <nav className="container mx-auto px-4 flex flex-col space-y-4 py-4">
          <Link
            href="/"
            className={`transition-colors hover:text-foreground/80 ${
              pathname === "/" ? "text-foreground" : "text-foreground/60"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/history"
            className={`transition-colors hover:text-foreground/80 ${
              pathname === "/history" ? "text-foreground" : "text-foreground/60"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            History
          </Link>
          <Link
            href="/settings"
            className={`transition-colors hover:text-foreground/80 ${
              pathname === "/settings" ? "text-foreground" : "text-foreground/60"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Settings
          </Link>
        </nav>
      </div>
    </header>
  );
}
