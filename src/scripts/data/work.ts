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
    title: 'Weddings & Catering',
    year: 2025,
    note: 'The day itself and the tables it is eaten at, cut vertical for the feed.',
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
      {
        id: 'catering-01',
        title: 'Catering',
        cut: 'One',
        clip: '/video/catering/catering-01.mp4',
        poster: '/frames/catering/catering-01.jpg',
        hasAudio: true,
      },
      {
        id: 'catering-02',
        title: 'Catering',
        cut: 'Two',
        clip: '/video/catering/catering-02.mp4',
        poster: '/frames/catering/catering-02.jpg',
        hasAudio: true,
      },
      {
        id: 'catering-03',
        title: 'Catering',
        cut: 'Three',
        clip: '/video/catering/catering-03.mp4',
        poster: '/frames/catering/catering-03.jpg',
        hasAudio: true,
      },
      {
        id: 'catering-04',
        title: 'Catering',
        cut: 'Four',
        clip: '/video/catering/catering-04.mp4',
        poster: '/frames/catering/catering-04.jpg',
        hasAudio: true,
      },
    ],
  },
  {
    id: 'fnb',
    title: 'F&B',
    year: 2025,
    note: 'Food and drink, shot for the places that serve it.',
    reels: [
      {
        id: 'furn-01',
        title: 'Furn Beirut',
        cut: 'One',
        clip: '/video/fnb/furn-beirut.mp4',
        poster: '/frames/fnb/furn-beirut.jpg',
        hasAudio: true,
      },
      {
        id: 'furn-02',
        title: 'Furn Beirut',
        cut: 'Two',
        clip: '/video/fnb/furn-beirut-02.mp4',
        poster: '/frames/fnb/furn-beirut-02.jpg',
        hasAudio: true,
      },
      {
        id: 'furn-03',
        title: 'Furn Beirut',
        cut: 'Three',
        clip: '/video/fnb/furn-beirut-03.mp4',
        poster: '/frames/fnb/furn-beirut-03.jpg',
        hasAudio: true,
      },
      {
        id: 'food-district',
        title: 'Food District',
        cut: "Mikey's, Hamra",
        clip: '/video/fnb/food-district.mp4',
        poster: '/frames/fnb/food-district.jpg',
        hasAudio: true,
      },
    ],
  },
];
