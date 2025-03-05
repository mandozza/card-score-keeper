import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function transformRankText(rank: string): string {
  const presidentAlias = localStorage.getItem('presidentAlias') || 'President';
  if (presidentAlias === 'Asshole') {
    if (rank === 'Scum') return 'Asshole';
    if (rank === 'Vice Scum') return 'Vice Asshole';
  }
  return rank;
}
