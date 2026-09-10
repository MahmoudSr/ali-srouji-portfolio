/**
 * Work manifest.
 *
 * A reel group is one section: a set of related reels (a wedding, a restaurant,
 * one client's page) that belong together on screen. Adding reels is a data
 * change: transcode the master with tools/transcode.swift, drop the clip and a
 * poster into `public/`, add an entry here.
 */
export type Reel = {
  id: string;
  title: string;
  clip: string;
  poster: string;
  /** Sound is off until the visitor asks for it. */
  hasAudio: boolean;
};

export type ReelGroup = {
  id: string;
  /** Names the section, e.g. Weddings, Food, a client. */
  title: string;
  year: number;
  /** One line about the set. Kept short and factual. */
  note: string;
  reels: Reel[];
};

export const reelGroups: ReelGroup[] = [
  {
    id: 'weddings',
    title: 'Weddings',
    year: 2025,
    note: 'Shot and cut for the day itself, vertical, for the couple to post.',
    reels: [
      {
        id: 'love',
        title: 'Love',
        clip: '/video/love-reel.mp4',
        poster: '/frames/reel-love.jpg',
        hasAudio: true,
      },
    ],
  },
];
