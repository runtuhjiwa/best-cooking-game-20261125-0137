// The menu of Rush Hour Kitchen: every ingredient and every dish.
// One tiny job: the data the kitchen cooks from. Nothing here knows
// about the canvas, the loop or the score — just names, recipes and prices.

export const INGREDIENTS = {
  bun: { name: 'Bun', key: '1', color: '#e8b25c', dark: '#b97f2e' },
  patty: { name: 'Patty', key: '2', color: '#8a5a2b', dark: '#5f3c17' },
  lettuce: { name: 'Lettuce', key: '3', color: '#5cb85c', dark: '#3d8b3d' },
  tomato: { name: 'Tomato', key: '4', color: '#e05252', dark: '#b02e2e' },
  cheese: { name: 'Cheese', key: '5', color: '#f5c542', dark: '#c99a17' },
  fries: { name: 'Fries', key: '6', color: '#f2d06b', dark: '#c9a13b' },
  drink: { name: 'Drink', key: '7', color: '#7ec8e3', dark: '#3f8fb0' },
};

// The order ingredients are listed on a ticket, left to right.
export const INGREDIENT_ORDER = ['bun', 'patty', 'lettuce', 'tomato', 'cheese', 'fries', 'drink'];

// Dishes. recipe is a multiset of ingredient ids; the tray must match
// it exactly (order does not matter) to serve the ticket.
export const DISHES = {
  classic: {
    name: 'Classic Burger',
    recipe: ['bun', 'patty', 'lettuce'],
    price: 8,
    tier: 1,
  },
  cheese: {
    name: 'Cheeseburger',
    recipe: ['bun', 'patty', 'cheese', 'lettuce'],
    price: 10,
    tier: 1,
  },
  garden: {
    name: 'Garden Burger',
    recipe: ['bun', 'patty', 'lettuce', 'tomato'],
    price: 11,
    tier: 2,
  },
  friesOnly: {
    name: 'Crispy Fries',
    recipe: ['fries'],
    price: 4,
    tier: 1,
  },
  double: {
    name: 'Double Stack',
    recipe: ['bun', 'patty', 'patty', 'cheese', 'tomato'],
    price: 14,
    tier: 2,
  },
  combo: {
    name: 'Combo Meal',
    recipe: ['bun', 'patty', 'cheese', 'fries', 'drink'],
    price: 16,
    tier: 3,
  },
};

// Dishes a phase of the shift may deal. Phase 0 is the calm opening,
// phase 2 is the dinner rush.
export const PHASE_DISHES = [
  ['classic', 'cheese', 'friesOnly'],
  ['classic', 'cheese', 'garden', 'friesOnly', 'double'],
  ['cheese', 'garden', 'double', 'combo', 'friesOnly'],
];

// Count how many of each ingredient a list holds.
export function countIngredients(list) {
  const counts = {};
  for (const id of list) counts[id] = (counts[id] || 0) + 1;
  return counts;
}

// True when two ingredient lists hold the same multiset.
export function sameDish(a, b) {
  if (a.length !== b.length) return false;
  const ca = countIngredients(a);
  const cb = countIngredients(b);
  for (const key of Object.keys(ca)) {
    if (ca[key] !== cb[key]) return false;
  }
  return true;
}
