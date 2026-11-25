// Input for Rush Hour Kitchen: mouse clicks and keyboard shortcuts.
// One tiny job: turn pointer and key events into named actions the
// game loop understands. It knows the clickable regions, which the
// renderer lays out in the same coordinates.

export const LAYOUT = {
  width: 1024,
  height: 640,
  // Order board tickets, top to bottom.
  tickets: [
    { x: 16, y: 68, w: 300, h: 58 },
    { x: 16, y: 132, w: 300, h: 58 },
    { x: 16, y: 196, w: 300, h: 58 },
  ],
  // Grill slots, fryer slot, assembly tray, serving window.
  grill: [
    { x: 36, y: 306, w: 128, h: 92 },
    { x: 180, y: 306, w: 128, h: 92 },
  ],
  fryer: { x: 356, y: 306, w: 118, h: 92 },
  tray: { x: 506, y: 290, w: 250, h: 108 },
  trash: { x: 700, y: 404, w: 56, h: 26 },
  serve: { x: 796, y: 306, w: 192, h: 92 },
  start: { x: 362, y: 430, w: 300, h: 64 },
  restart: { x: 362, y: 460, w: 300, h: 64 },
  // Seven ingredient tiles along the bottom.
  ingredients: [
    { x: 16, y: 452, w: 134, h: 108 },
    { x: 162, y: 452, w: 134, h: 108 },
    { x: 308, y: 452, w: 134, h: 108 },
    { x: 454, y: 452, w: 134, h: 108 },
    { x: 600, y: 452, w: 134, h: 108 },
    { x: 746, y: 452, w: 134, h: 108 },
    { x: 892, y: 452, w: 116, h: 108 },
  ],
};

export const INGREDIENT_KEYS = ['1', '2', '3', '4', '5', '6', '7'];

function inside(rect, x, y) {
  return x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;
}

// Translate a canvas pointer position into an action, or null.
// Actions: { kind: 'ingredient', index }, { kind: 'grill', slot },
// { kind: 'fryer' }, { kind: 'serve' }, { kind: 'trash' },
// { kind: 'start' }, { kind: 'restart' }.
export function actionAt(x, y, phase) {
  if (phase === 'title' && inside(LAYOUT.start, x, y)) return { kind: 'start' };
  if (phase === 'over' && inside(LAYOUT.restart, x, y)) return { kind: 'restart' };
  if (phase !== 'playing') return null;
  for (let i = 0; i < LAYOUT.ingredients.length; i++) {
    if (inside(LAYOUT.ingredients[i], x, y)) return { kind: 'ingredient', index: i };
  }
  for (let i = 0; i < LAYOUT.grill.length; i++) {
    if (inside(LAYOUT.grill[i], x, y)) return { kind: 'grill', slot: i };
  }
  if (inside(LAYOUT.fryer, x, y)) return { kind: 'fryer' };
  if (inside(LAYOUT.trash, x, y)) return { kind: 'trash' };
  if (inside(LAYOUT.serve, x, y)) return { kind: 'serve' };
  return null;
}

// Translate a key into an action, or null.
export function actionForKey(key, phase) {
  const lower = key.toLowerCase();
  if (phase === 'title' && (key === ' ' || key === 'Enter')) return { kind: 'start' };
  if (phase === 'over' && (lower === 'r' || key === 'Enter')) return { kind: 'restart' };
  if (phase !== 'playing') return null;
  if (lower === 'r') return { kind: 'restart' };
  if (lower === 't') return { kind: 'trash' };
  if (lower === 's') return { kind: 'serve' };
  const index = INGREDIENT_KEYS.indexOf(key);
  if (index !== -1) return { kind: 'ingredient', index };
  return null;
}
