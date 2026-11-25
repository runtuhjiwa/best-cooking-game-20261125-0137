// Rush Hour Kitchen — the entry program (Node 22, standard library only).
//
// The game itself is the plain static files under game/ (game/index.html
// plus its ES modules, no library, no network request), and the
// screenshots are the maker's own renders of it in screenshots/. This
// program hands both in: it copies game/ and screenshots/ from beside
// this file into /output and writes /output/dossier.json, the summary
// the judge reads, with the vendored make.fun library.
//
// Play it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps match the scorer's own: the dossier text is capped, and the
// entry stays inside the limits a valid entry must meet (at most 4
// screenshots, each at most 256 KiB; game/ at most 993 files and 48 MiB
// in all, with no path over 1000 bytes). The two runs the grader does
// must write identical bytes, so nothing here depends on the clock or
// on any file outside this repository.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

console.log(`Rush Hour Kitchen handed in: ${join(out, 'dossier.json')}`);
