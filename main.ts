// Midnight Ramen Rush — the hand-in program (Node 22, standard library only).
//
// The game itself is plain static files in game/ beside this file: an index.html that
// opens in a desktop browser and plays offline, with its ES modules under game/src/.
// This program hands those files in. It copies game/ and screenshots/ into the output
// directory (MAKEFUN_OUTPUT_DIR outside the grader, /output inside it) and writes
// /output/dossier.json, the summary the judge reads, using the vendored make.fun
// library at ./vendor/makefun-game.ts.
//
// Run it locally to check the hand-in shape:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the game itself with `node serve.ts` and open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// The folder this file lives in, so the copies are found wherever the program runs from.
// The build is deterministic: the same repository always writes the same /output bytes,
// which the grader checks by running the program twice and comparing the two runs.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's own caps: the text cap shapes the dossier's bytes, and the rest refuse an
// entry the scorer would refuse — more than 4 screenshots or one over 256 KiB, more than
// 993 files in game/ or 48 MiB of game files in all, or a path under game/ over 1000 bytes.
// game/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
