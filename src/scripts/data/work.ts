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
  /** Which cut of the piece this is, when one shoot yields several. */
  cut?: string;
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
    note: 'One day, cut two ways, vertical, for the couple to post.',
    reels: [
      {
        id: 'love-01',
        title: 'Love',
        cut: 'Cut one',
        clip: '/video/weddings/love-cut-01.mp4',
        poster: '/frames/weddings/love-cut-01.jpg',
        hasAudio: true,
      },
      {
        id: 'love-02',
        title: 'Love',
        cut: 'Cut two',
        clip: '/video/weddings/love-cut-02.mp4',
        poster: '/frames/weddings/love-cut-02.jpg',
        hasAudio: true,
      },
    ],
  },
];
