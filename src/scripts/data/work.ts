/**
 * Work manifest.
 *
 * A group is one section: related pieces that belong together on screen, and a
 * piece is either a clip or a still. Every piece carries two files, because a
 * strip shows a clip about 250px wide and there is no reason to send a visitor
 * a 1080p file for that: `strip` is the light one the section plays, `full` is
 * the quality one, fetched only when the piece is opened.
 *
 * Adding work is a data change: transcode with tools/transcode.swift (a light
 * pass at height 960 and a full pass at the source ceiling), drop the files in
 * `public/`, add an entry here.
 */
export type Item = {
  id: string;
  kind: 'clip' | 'still';
  title: string;
  /** Which cut or frame of the piece this is, when a shoot yields several. */
  cut?: string;
  /** Light file the strip shows. */
  strip: string;
  /** Full quality file, loaded when the piece is opened. */
  full: string;
  /** Clips only. */
  poster?: string;
  hasAudio?: boolean;
};

export type Group = {
  id: string;
  title: string;
  year: number;
  note: string;
  items: Item[];
};

export const groups: Group[] = [
  {
    id: 'weddings',
    title: 'Weddings & Catering',
    year: 2025,
    note: 'The day itself and the tables it is eaten at, cut vertical for the feed.',
    items: [
      {
        id: 'love-01',
        kind: 'clip',
        title: 'Love',
        cut: 'Cut one',
        strip: '/video/weddings/love-cut-01-strip.mp4',
        full: '/video/weddings/love-cut-01.mp4',
        poster: '/frames/weddings/love-cut-01.jpg',
        hasAudio: true,
      },
      {
        id: 'love-02',
        kind: 'clip',
        title: 'Love',
        cut: 'Cut two',
        strip: '/video/weddings/love-cut-02-strip.mp4',
        full: '/video/weddings/love-cut-02.mp4',
        poster: '/frames/weddings/love-cut-02.jpg',
        hasAudio: true,
      },
      {
        id: 'catering-01',
        kind: 'clip',
        title: 'Catering',
        cut: 'One',
        strip: '/video/catering/catering-01-strip.mp4',
        full: '/video/catering/catering-01.mp4',
        poster: '/frames/catering/catering-01.jpg',
        hasAudio: true,
      },
      {
        id: 'catering-02',
        kind: 'clip',
        title: 'Catering',
        cut: 'Two',
        strip: '/video/catering/catering-02-strip.mp4',
        full: '/video/catering/catering-02.mp4',
        poster: '/frames/catering/catering-02.jpg',
        hasAudio: true,
      },
      {
        id: 'catering-03',
        kind: 'clip',
        title: 'Catering',
        cut: 'Three',
        strip: '/video/catering/catering-03-strip.mp4',
        full: '/video/catering/catering-03.mp4',
        poster: '/frames/catering/catering-03.jpg',
        hasAudio: true,
      },
      {
        id: 'catering-04',
        kind: 'clip',
        title: 'Catering',
        cut: 'Four',
        strip: '/video/catering/catering-04-strip.mp4',
        full: '/video/catering/catering-04.mp4',
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
    items: [
      {
        id: 'furn-01',
        kind: 'clip',
        title: 'Furn Beirut',
        cut: 'One',
        strip: '/video/fnb/furn-beirut-strip.mp4',
        full: '/video/fnb/furn-beirut.mp4',
        poster: '/frames/fnb/furn-beirut.jpg',
        hasAudio: true,
      },
      {
        id: 'furn-02',
        kind: 'clip',
        title: 'Furn Beirut',
        cut: 'Two',
        strip: '/video/fnb/furn-beirut-02-strip.mp4',
        full: '/video/fnb/furn-beirut-02.mp4',
        poster: '/frames/fnb/furn-beirut-02.jpg',
        hasAudio: true,
      },
      {
        id: 'furn-03',
        kind: 'clip',
        title: 'Furn Beirut',
        cut: 'Three',
        strip: '/video/fnb/furn-beirut-03-strip.mp4',
        full: '/video/fnb/furn-beirut-03.mp4',
        poster: '/frames/fnb/furn-beirut-03.jpg',
        hasAudio: true,
      },
      {
        id: 'food-district',
        kind: 'clip',
        title: 'Food District',
        cut: "Mikey's, Hamra",
        strip: '/video/fnb/food-district-strip.mp4',
        full: '/video/fnb/food-district.mp4',
        poster: '/frames/fnb/food-district.jpg',
        hasAudio: true,
      },
      {
        id: 'food-district-02',
        kind: 'clip',
        title: 'Food District',
        cut: 'Mac and cheese',
        strip: '/video/fnb/food-district-02-strip.mp4',
        full: '/video/fnb/food-district-02.mp4',
        poster: '/frames/fnb/food-district-02.jpg',
        hasAudio: true,
      },
      {
        id: 'food-district-03',
        kind: 'clip',
        title: 'Food District',
        cut: 'Sliders',
        strip: '/video/fnb/food-district-03-strip.mp4',
        full: '/video/fnb/food-district-03.mp4',
        poster: '/frames/fnb/food-district-03.jpg',
        hasAudio: true,
      },
      {
        id: 'fd-still-01',
        kind: 'still',
        title: 'Food District',
        cut: 'Sliders, still',
        strip: '/stills/fnb/food-district-01-strip.jpg',
        full: '/stills/fnb/food-district-01.jpg',
      },
      {
        id: 'fd-still-02',
        kind: 'still',
        title: 'Food District',
        cut: 'Tray, still',
        strip: '/stills/fnb/food-district-02-strip.jpg',
        full: '/stills/fnb/food-district-02.jpg',
      },
    ],
  },
  {
    id: 'stays',
    title: 'Stays',
    year: 2025,
    note: 'Villas and pools, shot for the places people book.',
    items: [
      {
        id: 'barcoo-01',
        kind: 'clip',
        title: 'Barcoo Baakline',
        cut: 'Golden hour',
        strip: '/video/stays/barcoo-01-strip.mp4',
        full: '/video/stays/barcoo-01.mp4',
        poster: '/frames/stays/barcoo-01.jpg',
        hasAudio: true,
      },
      {
        id: 'barcoo-02',
        kind: 'clip',
        title: 'Barcoo Baakline',
        cut: 'Escape',
        strip: '/video/stays/barcoo-02-strip.mp4',
        full: '/video/stays/barcoo-02.mp4',
        poster: '/frames/stays/barcoo-02.jpg',
        hasAudio: true,
      },
      {
        id: 'barcoo-03',
        kind: 'clip',
        title: 'Barcoo Baakline',
        cut: 'Sunset',
        strip: '/video/stays/barcoo-03-strip.mp4',
        full: '/video/stays/barcoo-03.mp4',
        poster: '/frames/stays/barcoo-03.jpg',
        hasAudio: true,
      },
    ],
  },
];
