// Rendering for Rush Hour Kitchen: everything the player sees.
// One tiny job: draw the kitchen, tickets, stations, tray and HUD on
// the canvas from the game state. It never changes the state.

import { INGREDIENTS, INGREDIENT_ORDER } from './menu.js';
import { LAYOUT } from './input.js';

const W = LAYOUT.width;
const H = LAYOUT.height;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'left', bold = false) {
  ctx.fillStyle = color;
  ctx.font = `${bold ? 'bold ' : ''}${size}px Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// One ingredient icon, drawn from shapes at (cx, cy) with size s.
export function drawIngredient(ctx, id, cx, cy, s) {
  const u = s / 40;
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'bun') {
    ctx.fillStyle = '#e8b25c';
    ctx.beginPath();
    ctx.arc(0, 2 * u, 15 * u, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#d99a3d';
    ctx.fillRect(-15 * u, 2 * u, 30 * u, 5 * u);
    ctx.fillStyle = '#fff2cf';
    ctx.beginPath();
    ctx.arc(-6 * u, -6 * u, 1.6 * u, 0, Math.PI * 2);
    ctx.arc(5 * u, -9 * u, 1.6 * u, 0, Math.PI * 2);
    ctx.arc(9 * u, -3 * u, 1.4 * u, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'patty') {
    ctx.fillStyle = '#8a5a2b';
    rr(ctx, -16 * u, -7 * u, 32 * u, 14 * u, 6 * u);
    ctx.fill();
    ctx.fillStyle = '#6b4420';
    rr(ctx, -12 * u, -3 * u, 24 * u, 4 * u, 2 * u);
    ctx.fill();
  } else if (id === 'lettuce') {
    ctx.fillStyle = '#5cb85c';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.ellipse(Math.cos(a) * 9 * u, Math.sin(a) * 5 * u, 8 * u, 5 * u, a, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.fillStyle = '#3d8b3d';
    ctx.beginPath();
    ctx.arc(0, 0, 5 * u, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'tomato') {
    ctx.fillStyle = '#e05252';
    ctx.beginPath();
    ctx.arc(0, 2 * u, 13 * u, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f28b8b';
    ctx.beginPath();
    ctx.arc(-4 * u, -2 * u, 4 * u, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3d8b3d';
    ctx.fillRect(-2 * u, -13 * u, 4 * u, 6 * u);
  } else if (id === 'cheese') {
    ctx.fillStyle = '#f5c542';
    ctx.beginPath();
    ctx.moveTo(-15 * u, 8 * u);
    ctx.lineTo(15 * u, 8 * u);
    ctx.lineTo(0, -10 * u);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c99a17';
    ctx.beginPath();
    ctx.arc(-6 * u, 3 * u, 2 * u, 0, Math.PI * 2);
    ctx.arc(6 * u, 2 * u, 2 * u, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'fries') {
    ctx.fillStyle = '#d93b3b';
    ctx.beginPath();
    ctx.moveTo(-12 * u, -2 * u);
    ctx.lineTo(12 * u, -2 * u);
    ctx.lineTo(9 * u, 14 * u);
    ctx.lineTo(-9 * u, 14 * u);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f2d06b';
    for (let i = -2; i <= 2; i++) {
      ctx.fillRect(i * 5 * u - 2 * u, -14 * u + Math.abs(i) * 2 * u, 4 * u, 16 * u);
    }
  } else if (id === 'drink') {
    ctx.fillStyle = '#e8e8e8';
    ctx.beginPath();
    ctx.moveTo(-10 * u, -12 * u);
    ctx.lineTo(10 * u, -12 * u);
    ctx.lineTo(7 * u, 14 * u);
    ctx.lineTo(-7 * u, 14 * u);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#7ec8e3';
    ctx.fillRect(-8 * u, -6 * u, 16 * u, 16 * u);
    ctx.strokeStyle = '#e05252';
    ctx.lineWidth = 3 * u;
    ctx.beginPath();
    ctx.moveTo(4 * u, -10 * u);
    ctx.lineTo(10 * u, -18 * u);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHeart(ctx, x, y, s, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 20, s / 20);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-12, -4, -6, -12, 0, -5);
  ctx.bezierCurveTo(6, -12, 12, -4, 0, 6);
  ctx.closePath();
  ctx.fillStyle = filled ? '#e05252' : '#9a938a';
  ctx.fill();
  ctx.restore();
}

function drawTicket(ctx, ticket, rect) {
  const urgent = ticket.timeLeft < 12;
  const slide = Math.min(1, ticket.born * 4);
  const x = rect.x - (1 - slide) * 40;
  ctx.save();
  ctx.globalAlpha = 0.4 + 0.6 * slide;
  ctx.fillStyle = urgent && Math.floor(ticket.born * 4) % 2 === 0 ? '#ffe9e9' : '#fffdf5';
  rr(ctx, x, rect.y, rect.w, rect.h, 8);
  ctx.fill();
  ctx.strokeStyle = urgent ? '#e05252' : '#d8c9a3';
  ctx.lineWidth = urgent ? 2.5 : 1.5;
  ctx.stroke();
  text(ctx, `#${ticket.id}  ${ticket.dish.name}`, x + 10, rect.y + 16, 15, '#2e2a26', 'left', true);
  text(ctx, `$${ticket.dish.price}`, x + rect.w - 10, rect.y + 16, 15, '#2e7d32', 'right', true);
  // Ingredient icons in recipe order.
  let ix = x + 18;
  for (const id of ticket.dish.recipe) {
    drawIngredient(ctx, id, ix, rect.y + 36, 22);
    ix += 26;
  }
  // Countdown bar.
  const frac = Math.max(0, ticket.timeLeft / ticket.total);
  const barColor = frac > 0.5 ? '#5cb85c' : frac > 0.25 ? '#f5a623' : '#e05252';
  ctx.fillStyle = '#e8e0d0';
  rr(ctx, x + 10, rect.y + 48, rect.w - 20, 6, 3);
  ctx.fill();
  ctx.fillStyle = barColor;
  rr(ctx, x + 10, rect.y + 48, (rect.w - 20) * frac, 6, 3);
  ctx.fill();
  text(ctx, `${Math.ceil(ticket.timeLeft)}s`, x + rect.w - 10, rect.y + 36, 12, '#6b6259', 'right');
  ctx.restore();
}

function drawCookSlot(ctx, rect, slot, label) {
  ctx.fillStyle = '#3a3a3f';
  rr(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fill();
  ctx.strokeStyle = '#1c1c1f';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, label, rect.x + rect.w / 2, rect.y + 12, 11, '#cfc8bd', 'center', true);
  if (!slot) {
    text(ctx, 'empty', rect.x + rect.w / 2, rect.y + 52, 13, '#8a8378', 'center');
    return;
  }
  const cx = rect.x + rect.w / 2;
  if (slot.state === 'burnt') {
    drawIngredient(ctx, slot.item, cx, rect.y + 40, 40);
    ctx.fillStyle = 'rgba(20,20,20,0.55)';
    rr(ctx, rect.x + 6, rect.y + 22, rect.w - 12, 48, 8);
    ctx.fill();
    text(ctx, 'BURNT! click to toss', cx, rect.y + 64, 11, '#fff', 'center', true);
    return;
  }
  drawIngredient(ctx, slot.item, cx, rect.y + 40, 40);
  const frac = Math.min(1, slot.t / slot.dur);
  ctx.fillStyle = '#55555c';
  rr(ctx, rect.x + 10, rect.y + rect.h - 13, rect.w - 20, 8, 4);
  ctx.fill();
  ctx.fillStyle = slot.state === 'done' ? '#5cb85c' : '#f5a623';
  rr(ctx, rect.x + 10, rect.y + rect.h - 13, (rect.w - 20) * frac, 8, 4);
  ctx.fill();
  if (slot.state === 'done') {
    text(ctx, 'READY — click to plate', cx, rect.y + 64, 11, '#fff', 'center', true);
    ctx.fillStyle = 'rgba(92,184,92,0.25)';
    rr(ctx, rect.x + 4, rect.y + 20, rect.w - 8, 50, 8);
    ctx.fill();
  }
}

export function drawGame(ctx, state) {
  // Wall and floor.
  ctx.fillStyle = '#f3dfae';
  ctx.fillRect(0, 0, W, 300);
  ctx.fillStyle = '#c98f5f';
  ctx.fillRect(0, 300, W, H - 300);
  ctx.fillStyle = '#b97f2e';
  ctx.fillRect(0, 296, W, 8);
  // Top bar.
  ctx.fillStyle = '#2e2a26';
  ctx.fillRect(0, 0, W, 54);
  text(ctx, 'RUSH HOUR KITCHEN', 16, 28, 22, '#ffd98a', 'left', true);
  text(ctx, `COINS $${state.coins}`, 300, 28, 20, '#ffd98a', 'left', true);
  // Shift timer.
  const tFrac = Math.max(0, state.timeLeft / 180);
  ctx.fillStyle = '#55504a';
  rr(ctx, 470, 18, 220, 18, 9);
  ctx.fill();
  ctx.fillStyle = tFrac > 0.17 ? '#5cb85c' : '#e05252';
  rr(ctx, 470, 18, 220 * tFrac, 18, 9);
  ctx.fill();
  const mm = Math.floor(Math.max(0, state.timeLeft) / 60);
  const ss = Math.floor(Math.max(0, state.timeLeft) % 60).toString().padStart(2, '0');
  text(ctx, `${mm}:${ss}`, 580, 28, 16, '#ffffff', 'center', true);
  text(ctx, `Served ${state.served}`, 720, 28, 16, '#fffdf5', 'left');
  for (let i = 0; i < 3; i++) drawHeart(ctx, 855 + i * 30, 27, 22, i < state.hearts);
  text(ctx, 'SHIFT', 975, 28, 13, '#cfc8bd', 'center');

  if (state.phase === 'title') {
    drawTitle(ctx);
    return;
  }
  if (state.phase === 'over') {
    drawKitchen(ctx, state);
    drawGameOver(ctx, state);
    return;
  }
  drawKitchen(ctx, state);
}

function drawKitchen(ctx, state) {
  // Order board.
  text(ctx, 'ORDER BOARD', 16, 62, 13, '#6b4a1f', 'left', true);
  for (let i = 0; i < LAYOUT.tickets.length; i++) {
    const ticket = state.board.tickets[i];
    if (ticket) drawTicket(ctx, ticket, LAYOUT.tickets[i]);
    else {
      ctx.fillStyle = 'rgba(255,253,245,0.45)';
      rr(ctx, LAYOUT.tickets[i].x, LAYOUT.tickets[i].y, 300, 58, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(120,100,60,0.5)';
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, 'waiting for orders…', LAYOUT.tickets[i].x + 150, LAYOUT.tickets[i].y + 30, 13, '#8a7a5c', 'center');
    }
  }

  // Stations.
  text(ctx, 'GRILL  (patties 5s)', 16, 280, 13, '#6b4a1f', 'left', true);
  for (let i = 0; i < 2; i++) drawCookSlot(ctx, LAYOUT.grill[i], state.grill[i], i === 0 ? 'GRILL 1' : 'GRILL 2');
  text(ctx, 'FRYER  (fries 6s)', 336, 280, 13, '#6b4a1f', 'left', true);
  drawCookSlot(ctx, LAYOUT.fryer, state.fryer, 'FRYER');
  text(ctx, 'ASSEMBLY COUNTER', 506, 280, 13, '#6b4a1f', 'left', true);
  drawTray(ctx, state);
  text(ctx, 'SERVING WINDOW', 776, 280, 13, '#6b4a1f', 'left', true);
  drawServe(ctx, state);

  // Ingredient counter.
  text(ctx, 'INGREDIENTS  —  click or press 1–7', 16, 442, 13, '#fff3d6', 'left', true);
  for (let i = 0; i < INGREDIENT_ORDER.length; i++) {
    const id = INGREDIENT_ORDER[i];
    const r = LAYOUT.ingredients[i];
    const ing = INGREDIENTS[id];
    const hovered = state.hover && state.hover.x >= r.x && state.hover.x < r.x + r.w && state.hover.y >= r.y && state.hover.y < r.y + r.h;
    ctx.fillStyle = hovered ? '#ffe9b8' : '#fffdf5';
    rr(ctx, r.x, r.y, r.w, r.h, 10);
    ctx.fill();
    ctx.strokeStyle = '#d8c9a3';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    drawIngredient(ctx, id, r.x + r.w / 2, r.y + 40, 52);
    text(ctx, ing.name, r.x + r.w / 2, r.y + 82, 14, '#2e2a26', 'center', true);
    text(ctx, `[${ing.key}]`, r.x + r.w / 2, r.y + 98, 11, '#8a8378', 'center');
  }

  // Hint + toasts.
  text(ctx, 'Cook patties & fries, stack the tray to match a ticket, then SERVE before it expires.  T = trash tray   S = serve   R = restart', 16, 586, 13, '#fff3d6', 'left');
  for (const toast of state.toasts) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, toast.life));
    text(ctx, toast.text, toast.x, toast.y - (1 - toast.life) * 30, 20, toast.color, 'center', true);
    ctx.restore();
  }
}

function drawTray(ctx, state) {
  const r = LAYOUT.tray;
  ctx.fillStyle = '#a9703f';
  rr(ctx, r.x, r.y, r.w, r.h, 10);
  ctx.fill();
  ctx.strokeStyle = '#7a4a22';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Plate.
  ctx.fillStyle = '#fffdf5';
  ctx.beginPath();
  ctx.ellipse(r.x + 105, r.y + 56, 86, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d8c9a3';
  ctx.stroke();
  if (state.tray.length === 0) {
    text(ctx, 'empty tray', r.x + 105, r.y + 56, 14, '#8a7a5c', 'center');
  } else {
    // Stack the tray's ingredients as layers on the plate.
    let x = r.x + 105 - (state.tray.length - 1) * 15;
    for (const id of state.tray) {
      drawIngredient(ctx, id, x, r.y + 56, 34);
      x += 30;
    }
  }
  // Trash button.
  const t = LAYOUT.trash;
  ctx.fillStyle = '#e05252';
  rr(ctx, t.x, t.y, t.w, t.h, 6);
  ctx.fill();
  text(ctx, 'TRASH', t.x + t.w / 2, t.y + t.h / 2 + 1, 12, '#fff', 'center', true);
}

function drawServe(ctx, state) {
  const r = LAYOUT.serve;
  const match = state.matchTicket;
  const ready = state.tray.length > 0 && match;
  ctx.fillStyle = '#fffdf5';
  rr(ctx, r.x, r.y, r.w, r.h, 10);
  ctx.fill();
  ctx.strokeStyle = '#7a4a22';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Bell on the counter.
  ctx.fillStyle = '#f5c542';
  ctx.beginPath();
  ctx.arc(r.x + 96, r.y + 22, 13, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(r.x + 83, r.y + 22, 26, 5);
  if (ready) {
    const pulse = 0.75 + 0.25 * Math.sin(state.now * 6);
    ctx.fillStyle = `rgba(92,184,92,${pulse})`;
    rr(ctx, r.x + 36, r.y + 40, 120, 34, 8);
    ctx.fill();
    text(ctx, 'SERVE!', r.x + 96, r.y + 58, 18, '#fff', 'center', true);
    text(ctx, `#${match.id} ${match.dish.name}`, r.x + 96, r.y + 84, 10, '#2e7d32', 'center', true);
  } else if (state.tray.length > 0) {
    ctx.fillStyle = '#e8e0d0';
    rr(ctx, r.x + 36, r.y + 40, 120, 34, 8);
    ctx.fill();
    text(ctx, 'SERVE', r.x + 96, r.y + 58, 18, '#8a8378', 'center', true);
    text(ctx, 'no ticket wants this', r.x + 96, r.y + 84, 10, '#8a8378', 'center');
  } else {
    text(ctx, 'serve a dish here', r.x + 96, r.y + 58, 14, '#8a8378', 'center');
  }
}

function drawTitle(ctx) {
  ctx.fillStyle = 'rgba(46,42,38,0.55)';
  ctx.fillRect(0, 54, W, H - 54);
  ctx.fillStyle = '#fffdf5';
  rr(ctx, 212, 120, 600, 380, 16);
  ctx.fill();
  ctx.strokeStyle = '#d8c9a3';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'RUSH HOUR', 512, 180, 44, '#e05252', 'center', true);
  text(ctx, 'KITCHEN', 512, 226, 44, '#2e2a26', 'center', true);
  text(ctx, 'A 3-minute dinner rush. Cook, stack, serve — don\'t burn it!', 512, 272, 16, '#6b6259', 'center');
  text(ctx, '1  Click ingredients (or keys 1–7) to build dishes', 512, 316, 15, '#2e2a26', 'center');
  text(ctx, '2  Patties grill in 5s, fries fry in 6s — grab them before they burn', 512, 342, 15, '#2e2a26', 'center');
  text(ctx, '3  Match a ticket exactly, then SERVE it before its timer runs out', 512, 368, 15, '#2e2a26', 'center');
  text(ctx, 'Faster serves pay bigger tips. 3 missed orders ends the shift.', 512, 394, 15, '#2e2a26', 'center');
  const pulse = 0.85 + 0.15 * Math.sin(Date.now() / 300);
  ctx.fillStyle = `rgba(92,184,92,${pulse})`;
  rr(ctx, LAYOUT.start.x, LAYOUT.start.y, LAYOUT.start.w, LAYOUT.start.h, 12);
  ctx.fill();
  text(ctx, '▶  START SHIFT  (click or SPACE)', 512, LAYOUT.start.y + 33, 20, '#fff', 'center', true);
}

function drawGameOver(ctx, state) {
  ctx.fillStyle = 'rgba(46,42,38,0.72)';
  ctx.fillRect(0, 54, W, H - 54);
  ctx.fillStyle = '#fffdf5';
  rr(ctx, 262, 120, 500, 410, 16);
  ctx.fill();
  ctx.strokeStyle = '#d8c9a3';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'SHIFT OVER!', 512, 180, 38, '#e05252', 'center', true);
  text(ctx, `Final score:  $${state.coins}`, 512, 240, 24, '#2e2a26', 'center', true);
  text(ctx, `Dishes served: ${state.served}    Missed: ${state.missed}`, 512, 282, 17, '#6b6259', 'center');
  const verdict = state.coins >= 120 ? 'Head chef material!' : state.coins >= 60 ? 'Solid shift, chef!' : 'The rush got you — try again!';
  text(ctx, verdict, 512, 322, 17, '#2e7d32', 'center', true);
  const pulse = 0.85 + 0.15 * Math.sin(Date.now() / 300);
  ctx.fillStyle = `rgba(92,184,92,${pulse})`;
  rr(ctx, LAYOUT.restart.x, LAYOUT.restart.y, LAYOUT.restart.w, LAYOUT.restart.h, 12);
  ctx.fill();
  text(ctx, '↻  PLAY AGAIN  (click or R)', 512, LAYOUT.restart.y + 33, 20, '#fff', 'center', true);
}
