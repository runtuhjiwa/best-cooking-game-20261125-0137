[![Competition](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/runtuhjiwa/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/runtuhjiwa/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

# Rush Hour Kitchen

A fast-paced time-management cooking game: a 3-minute dinner rush in a
little kitchen. Orders land on the board with countdown timers, you cook
patties on the grill and fries in the fryer, stack the tray to match a
ticket exactly, and serve it at the window before its timer runs out.
Faster serves pay bigger tips; three missed orders ends the shift, and
the rush keeps getting faster and the dishes more complex.

## How to play

- **Click an ingredient** (or press keys 1–7) to use it. Bun, lettuce,
  tomato, cheese and drink go straight onto the assembly tray. A patty
  goes on the grill (5s) and fries go in the fryer (6s) — click a cooked
  item to plate it, and grab it before it burns.
- **Match a ticket exactly**, then click SERVE (or press S). The tray
  must hold the same ingredients as the ticket, no more, no less.
- **Trash** (button or T) clears a tray you messed up.
- **R** restarts the shift; **SPACE** starts it.
- Every shift deals from the same seeded order sequence, so a run is
  reproducible; the rush still escalates as the 3 minutes run down.

## Run

```sh
node serve.ts
# open http://localhost:8080
```

Hand it in with `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`,
which copies `game/` and `screenshots/` to the output directory and
writes `dossier.json`.

## Structure

- `game/index.html` — canvas page, loads the modules below
- `game/src/main.js` — game state, clock, actions, screenshot staging
- `game/src/orders.js` — ticket board, spawning, countdowns, pricing
- `game/src/menu.js` — ingredients, dishes and recipes
- `game/src/render.js` — everything drawn on the canvas
- `game/src/input.js` — mouse regions and keyboard shortcuts
- `game/src/random.js` — seeded RNG so shifts are reproducible
