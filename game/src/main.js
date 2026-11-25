// Rush Hour Kitchen: the game loop and the rules.
// One job: own the state, run the clock, apply player actions and
// hand the state to the renderer. Cooking, tickets and scoring live
// in their own modules; this file wires them together.

import { makeRng } from './random.js';
import { INGREDIENT_ORDER } from './menu.js';
import { makeBoard, tickBoard, matchingTicket, priceServe, removeTicket, SHIFT_SECONDS } from './orders.js';
import { drawGame } from './render.js';
import { actionAt, actionForKey, LAYOUT } from './input.js';

const SEED = 20261125;
const GRILL_SECONDS = 5;
const FRYER_SECONDS = 6;
const DONE_WINDOW = 7; // seconds a cooked item waits before it burns
const MAX_TRAY = 6;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function newState() {
  return {
    phase: 'title',
    now: 0,
    elapsed: 0,
    timeLeft: SHIFT_SECONDS,
    coins: 0,
    served: 0,
    missed: 0,
    hearts: 3,
    board: makeBoard(makeRng(SEED)),
    grill: [null, null],
    fryer: null,
    tray: [],
    toasts: [],
    hover: null,
    matchTicket: null,
  };
}

let state = newState();
let lastTs = 0;
let frames = 0;

// Scale the fixed 1024x640 kitchen to the window, keeping its shape.
function fitCanvas() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = LAYOUT.width * dpr;
  canvas.height = LAYOUT.height * dpr;
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  ctx.setTransform(canvas.width / LAYOUT.width, 0, 0, canvas.height / LAYOUT.height, 0, 0);
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

function toast(text, color = '#2e2a26') {
  state.toasts.push({ text, x: 512, y: 250, life: 1, color });
  if (state.toasts.length > 4) state.toasts.shift();
}

function startShift() {
  state = newState();
  state.phase = 'playing';
  state.board.spawnIn = 1.0;
}

function endShift() {
  state.phase = 'over';
}

function cookSlot(slot, dt) {
  if (!slot) return;
  slot.t += dt;
  if (slot.state === 'cooking' && slot.t >= slot.dur) slot.state = 'done';
  else if (slot.state === 'done' && slot.t >= slot.dur + DONE_WINDOW) slot.state = 'burnt';
}

function takeFromStation(slot, label) {
  if (!slot) return;
  if (slot.state === 'done') {
    if (state.tray.length >= MAX_TRAY) {
      toast('Tray is full — serve or trash it!');
      return;
    }
    state.tray.push(slot.item);
    return { taken: slot.item };
  }
  if (slot.state === 'burnt') {
    toast(`${label} burnt — tossed!`);
    return { cleared: true };
  }
  return null;
}

function applyAction(action) {
  if (!action) return;
  if (action.kind === 'start') {
    startShift();
    return;
  }
  if (action.kind === 'restart') {
    startShift();
    return;
  }
  if (state.phase !== 'playing') return;

  if (action.kind === 'ingredient') {
    const id = INGREDIENT_ORDER[action.index];
    if (id === 'patty') {
      const free = state.grill.findIndex((s) => s === null);
      if (free === -1) {
        toast('Grill is full!');
        return;
      }
      state.grill[free] = { item: 'patty', t: 0, dur: GRILL_SECONDS, state: 'cooking' };
      return;
    }
    if (id === 'fries') {
      if (state.fryer) {
        toast('Fryer is busy!');
        return;
      }
      state.fryer = { item: 'fries', t: 0, dur: FRYER_SECONDS, state: 'cooking' };
      return;
    }
    if (state.tray.length >= MAX_TRAY) {
      toast('Tray is full — serve or trash it!');
      return;
    }
    state.tray.push(id);
    return;
  }

  if (action.kind === 'grill') {
    const slot = state.grill[action.slot];
    const result = takeFromStation(slot, 'Patty');
    if (result && (result.taken || result.cleared)) state.grill[action.slot] = null;
    return;
  }
  if (action.kind === 'fryer') {
    const result = takeFromStation(state.fryer, 'Fries');
    if (result && (result.taken || result.cleared)) state.fryer = null;
    return;
  }
  if (action.kind === 'trash') {
    if (state.tray.length > 0) {
      state.tray = [];
      toast('Tray trashed');
    }
    return;
  }
  if (action.kind === 'serve') {
    const ticket = matchingTicket(state.board, state.tray);
    if (!ticket) {
      toast(state.tray.length === 0 ? 'Tray is empty!' : 'No ticket wants this dish!');
      return;
    }
    const pay = priceServe(ticket);
    state.coins += pay.total;
    state.served += 1;
    removeTicket(state.board, ticket.id);
    state.tray = [];
    toast(`Served ${ticket.dish.name}!  +$${pay.total}  (tip $${pay.tip})`, '#2e7d32');
  }
}

function toCanvasCoords(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * LAYOUT.width,
    y: ((event.clientY - rect.top) / rect.height) * LAYOUT.height,
  };
}

canvas.addEventListener('pointermove', (event) => {
  state.hover = toCanvasCoords(event);
});
canvas.addEventListener('pointerdown', (event) => {
  const pos = toCanvasCoords(event);
  applyAction(actionAt(pos.x, pos.y, state.phase));
});
window.addEventListener('keydown', (event) => {
  if (event.repeat) return;
  const action = actionForKey(event.key, state.phase);
  if (action) {
    event.preventDefault();
    applyAction(action);
  }
});

// --- Screenshot staging -------------------------------------------------
// ?shot=cover|play|serve|end drops the game straight into a state the
// kitchen reaches in normal play, so a screenshot shows real gameplay.
function stageShot(kind) {
  startShift();
  if (kind === 'cover') {
    state.elapsed = 45;
    state.timeLeft = 135;
    state.coins = 24;
    state.served = 2;
    state.board.tickets = [
      { id: 1, dishId: 'cheese', dish: { name: 'Cheeseburger', recipe: ['bun', 'patty', 'cheese', 'lettuce'], price: 10 }, timeLeft: 32, total: 42, born: 1 },
      { id: 2, dishId: 'classic', dish: { name: 'Classic Burger', recipe: ['bun', 'patty', 'lettuce'], price: 8 }, timeLeft: 24, total: 48, born: 1 },
      { id: 3, dishId: 'friesOnly', dish: { name: 'Crispy Fries', recipe: ['fries'], price: 4 }, timeLeft: 18, total: 48, born: 1 },
    ];
    state.grill = [
      { item: 'patty', t: 5, dur: GRILL_SECONDS, state: 'done' },
      { item: 'patty', t: 3, dur: GRILL_SECONDS, state: 'cooking' },
    ];
    state.fryer = { item: 'fries', t: 6, dur: FRYER_SECONDS, state: 'done' };
    state.tray = ['bun', 'patty', 'cheese', 'lettuce'];
  } else if (kind === 'play') {
    state.elapsed = 20;
    state.timeLeft = 160;
    state.coins = 8;
    state.board.tickets = [
      { id: 1, dishId: 'classic', dish: { name: 'Classic Burger', recipe: ['bun', 'patty', 'lettuce'], price: 8 }, timeLeft: 38, total: 48, born: 1 },
      { id: 2, dishId: 'friesOnly', dish: { name: 'Crispy Fries', recipe: ['fries'], price: 4 }, timeLeft: 30, total: 48, born: 1 },
    ];
    state.grill = [{ item: 'patty', t: 2, dur: GRILL_SECONDS, state: 'cooking' }, null];
    state.tray = ['bun'];
  } else if (kind === 'serve') {
    state.elapsed = 100;
    state.timeLeft = 80;
    state.coins = 52;
    state.served = 5;
    state.board.tickets = [
      { id: 4, dishId: 'double', dish: { name: 'Double Stack', recipe: ['bun', 'patty', 'patty', 'cheese', 'tomato'], price: 14 }, timeLeft: 26, total: 36, born: 1 },
      { id: 5, dishId: 'garden', dish: { name: 'Garden Burger', recipe: ['bun', 'patty', 'lettuce', 'tomato'], price: 11 }, timeLeft: 15, total: 42, born: 1 },
    ];
    state.grill = [null, null];
    state.fryer = null;
    state.tray = ['bun', 'patty', 'patty', 'cheese', 'tomato'];
  } else if (kind === 'end') {
    state.phase = 'over';
    state.coins = 87;
    state.served = 9;
    state.missed = 3;
    state.hearts = 0;
    state.timeLeft = 0;
  }
}

// --- Main loop ----------------------------------------------------------
function frame(ts) {
  const dt = Math.min(0.1, (ts - lastTs) / 1000 || 0);
  lastTs = ts;
  state.now = ts / 1000;

  if (state.phase === 'playing') {
    state.elapsed += dt;
    state.timeLeft = Math.max(0, SHIFT_SECONDS - state.elapsed);
    const expired = tickBoard(state.board, dt, state.elapsed);
    for (const ticket of expired) {
      state.missed += 1;
      state.hearts -= 1;
      toast(`Order #${ticket.id} missed!  -1 heart`, '#e05252');
    }
    for (const slot of state.grill) cookSlot(slot, dt);
    cookSlot(state.fryer, dt);
    state.matchTicket = matchingTicket(state.board, state.tray);
    for (const toastMsg of state.toasts) toastMsg.life -= dt / 2.2;
    state.toasts = state.toasts.filter((t) => t.life > 0);
    if (state.hearts <= 0 || state.timeLeft <= 0) endShift();
  }

  drawGame(ctx, state);
  frames += 1;
  if (frames === 2) window.__shotReady = true;
  requestAnimationFrame(frame);
}

// Debug + test hooks: the play-test reads these, never the player.
window.__kitchen = {
  state: () => state,
  start: startShift,
  apply: applyAction,
  layout: LAYOUT,
};

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) stageShot(shot);
requestAnimationFrame(frame);
