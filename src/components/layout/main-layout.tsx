"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}
