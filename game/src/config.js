// Midnight Ramen Rush — every tuning number, colour and screen rectangle in one place.
// The kitchen is a fixed 1280x720 logical stage; the renderer scales it to the window,
// so no rule here depends on the screen size.
export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** One night shift: when the clock hits zero the stall closes and the score is final. */
export const SHIFT_SECONDS = 180;
export const HEARTS = 3;

/** The six toppings, in counter order. `key` is the keyboard shortcut for each bin. */
export const TOPPINGS = [
  { id: 'egg', name: 'Egg', short: 'EGG', key: '1', colour: '#f7e8c3', dot: '#f2c94c' },
  { id: 'chashu', name: 'Chashu', short: 'PORK', key: '2', colour: '#e88a7a', dot: '#c94f3d' },
  { id: 'nori', name: 'Nori', short: 'NORI', key: '3', colour: '#3f6b4f', dot: '#2c4f38' },
  { id: 'negi', name: 'Negi', short: 'ONION', key: '4', colour: '#8fce6e', dot: '#4f9e3a' },
  { id: 'corn', name: 'Corn', short: 'CORN', key: '5', colour: '#ffd94d', dot: '#e8a91c' },
  { id: 'naruto', name: 'Naruto', short: 'FISH', key: '6', colour: '#f6f0e6', dot: '#e86a8a' },
];

/** The three broths. Q / W / E ladle one into the bowl. */
export const BROTHS = [
  { id: 'shoyu', name: 'Shoyu', key: 'q', colour: '#8a5a2b', dot: '#6b4423' },
  { id: 'miso', name: 'Miso', key: 'w', colour: '#c98a4b', dot: '#a06a2e' },
  { id: 'tonkotsu', name: 'Tonkotsu', key: 'e', colour: '#f0e0c0', dot: '#d9c49a' },
];

/** Noodle Timing Bar: seconds of boiling. Pull inside the perfect band for a perfect noodle. */
export const NOODLE = {
  hardUntil: 3.5,
  perfectFrom: 4.5,
  perfectUntil: 6.5,
  soggyAfter: 8.0,
  barMax: 10,
};

/** Patience: a new customer waits this long (seconds) before storming off, shorter late at night. */
export const PATIENCE = { start: 48, end: 30 };

/** Seconds between new customers: rush hour tightens the gap as the night goes on. */
export const SPAWN = { start: 13, end: 6.5 };

export const SCORE = { base: 120, perfectNoodle: 60, goodNoodle: 20, badNoodle: -30, tipMax: 60 };

/** Screen rectangles the mouse can hit: pot, broth ladles, topping bins, serve button, tickets. */
export const LAYOUT = {
  board: { x: 24, y: 16, w: 560, h: 128 },
  ticketW: 128,
  ticketH: 112,
  ticketGap: 10,
  pot: { x: 640, y: 60, w: 200, h: 110 },
  timingBar: { x: 640, y: 178, w: 200, h: 22 },
  brothY: 244,
  brothW: 62,
  brothH: 54,
  brothX0: 640,
  brothGap: 8,
  bowl: { x: 900, y: 60, w: 330, h: 220 },
  serve: { x: 900, y: 292, w: 330, h: 52 },
  clear: { x: 900, y: 352, w: 160, h: 36 },
  binsY: 400,
  binW: 92,
  binH: 96,
  binX0: 640,
  binGap: 12,
  counterY: 520,
  customersY: 560,
};

export const PALETTE = {
  night: '#1c1420',
  wall: '#3a2430',
  wallLower: '#2b1a24',
  counter: '#7a4a2b',
  counterTop: '#a06a3c',
  board: '#f5e6c8',
  boardInk: '#3a2430',
  ticket: '#fff8e6',
  ticketPick: '#ffe9a8',
  pot: '#4a4a55',
  potRim: '#c9c9d4',
  broth: '#e8a13c',
  bowl: '#d94f3d',
  bowlInner: '#f7e8c3',
  text: '#fff6e0',
  muted: '#d9b48a',
  gold: '#f2c94c',
  green: '#7ed957',
  red: '#ff5a4e',
  blue: '#6ec6ff',
  panel: '#241722',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'midnight-ramen-rush.best';
