export type RankName = 'President' | 'Vice President' | 'Neutral' | 'Vice Scum' | 'Scum';

export interface RankConfig {
  rank: RankName;
  points: number;
}

export interface PlayerRankConfigs {
  4: RankConfig[];
  5: RankConfig[];
  6: RankConfig[];
}

export const defaultRankConfigs: PlayerRankConfigs = {
  4: [
    { rank: 'President', points: 4 },
    { rank: 'Vice President', points: 3 },
    { rank: 'Vice Scum', points: 2 },
    { rank: 'Scum', points: 1 }
  ],
  5: [
    { rank: 'President', points: 5 },
    { rank: 'Vice President', points: 4 },
    { rank: 'Neutral', points: 3 },
    { rank: 'Vice Scum', points: 2 },
    { rank: 'Scum', points: 1 }
  ],
  6: [
    { rank: 'President', points: 6 },
    { rank: 'Vice President', points: 5 },
    { rank: 'Neutral', points: 4 },
    { rank: 'Neutral', points: 3 },
    { rank: 'Vice Scum', points: 2 },
    { rank: 'Scum', points: 1 }
  ]
};
