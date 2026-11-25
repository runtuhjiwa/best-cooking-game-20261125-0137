// Orders for Rush Hour Kitchen: the ticket board.
// One tiny job: deal tickets, run their countdowns, and price a serve.
// It knows nothing about the canvas or the mouse.

import { DISHES, PHASE_DISHES, sameDish } from './menu.js';

export const MAX_TICKETS = 3;
export const SHIFT_SECONDS = 180;

export function makeBoard(rng) {
  return {
    rng,
    tickets: [],
    nextId: 1,
    spawnIn: 1.5,
  };
}

// Which phase of the shift are we in? 0 = opening, 1 = lunch, 2 = rush.
export function phaseAt(elapsed) {
  if (elapsed < 60) return 0;
  if (elapsed < 120) return 1;
  return 2;
}

// Seconds between new tickets in this phase.
export function spawnInterval(phase) {
  return [13, 10, 7][phase];
}

// How long a ticket lives, in seconds.
export function ticketLifetime(phase) {
  return [48, 42, 36][phase];
}

export function dealTicket(board, elapsed) {
  const phase = phaseAt(elapsed);
  const dishId = board.rng.pick(PHASE_DISHES[phase]);
  const ticket = {
    id: board.nextId++,
    dishId,
    dish: DISHES[dishId],
    timeLeft: ticketLifetime(phase),
    total: ticketLifetime(phase),
    // A fresh ticket pops in; render uses this for a slide-in.
    born: 0,
  };
  board.tickets.push(ticket);
  return ticket;
}

// Advance the board by dt seconds. Returns the tickets that expired.
export function tickBoard(board, dt, elapsed) {
  const expired = [];
  for (const ticket of board.tickets) {
    ticket.timeLeft -= dt;
    ticket.born += dt;
  }
  board.tickets = board.tickets.filter((ticket) => {
    if (ticket.timeLeft <= 0) {
      expired.push(ticket);
      return false;
    }
    return true;
  });
  board.spawnIn -= dt;
  if (board.spawnIn <= 0 && board.tickets.length < MAX_TICKETS) {
    dealTicket(board, elapsed);
    board.spawnIn = spawnInterval(phaseAt(elapsed));
  }
  return expired;
}

// Find the open ticket a tray matches, if any.
export function matchingTicket(board, tray) {
  if (tray.length === 0) return null;
  for (const ticket of board.tickets) {
    if (sameDish(tray, ticket.dish.recipe)) return ticket;
  }
  return null;
}

// Price a serve: the dish price plus a tip that grows the faster you serve.
export function priceServe(ticket) {
  const speed = Math.max(0, ticket.timeLeft / ticket.total);
  const tip = Math.round(ticket.dish.price * 0.5 * speed);
  return { price: ticket.dish.price, tip, total: ticket.dish.price + tip };
}

export function removeTicket(board, id) {
  board.tickets = board.tickets.filter((ticket) => ticket.id !== id);
}
