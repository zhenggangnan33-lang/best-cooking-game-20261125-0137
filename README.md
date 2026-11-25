# Midnight Ramen Rush — 深夜拉面屋

[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/zhenggangnan33-lang/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/zhenggangnan33-lang/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

Run a late-night ramen stall under paper lanterns: boil the noodles at just the right
moment, build each bowl to match its ticket exactly, and serve it before the customer's
patience runs out — chain perfect serves and the tips stack up until closing time.

## How to play

Serve it with `node serve.ts` and open http://localhost:8080, or open `game/index.html`
from any static server. Keyboard and mouse, desktop browser, fully offline.

- **SPACE** — start the noodles boiling, then pull them again at the right moment.
- **Q / W / E** (or click a ladle) — ladle Shoyu, Miso or Tonkotsu broth into the bowl.
- **1–6** (or click a bin) — add Egg, Chashu, Nori, Negi, Corn or Naruto to the bowl.
- **Click a ticket** on the Order Board (or **TAB** to cycle) — choose who to serve.
- **ENTER** (or click SERVE) — serve the bowl to the selected customer.
- **X** — clear the bowl and start it over. **P** — pause.

## The five mechanics

1. **Ticket Order Board** — every customer pins a ticket to the board: one broth plus
   two or three toppings. Serve exactly what the ticket asks for.
2. **Noodle Timing Bar** — noodles boil on a live timing bar. Pull in the green band
   for perfect noodles; too early and they are hard, too late and they go soggy.
3. **Topping Assembly** — build the bowl topping by topping on the counter; the bowl
   shows its broth, noodles and toppings as you add them.
4. **Patience & Rush Hour** — every customer's patience meter drains while they wait.
   A walkout costs a heart (three hearts a night), and as the night goes on the waves
   get busier: customers arrive faster and wait less patiently.
5. **Combo Tips** — a perfect serve (perfect noodles, served while the customer is
   still happy) chains a combo; each link in the chain pays a bigger tip.

The shift lasts 3 minutes. Serve as many bowls as you can before the night timer hits
zero — or lose all three hearts and the stall closes early. Your best score is saved
in the browser.

## Files

- `game/index.html` + `game/src/` — the game: `config.js` (tuning), `world.js` (rules),
  `render.js` (drawing), `input.js` (keyboard + mouse), `shots.js` (screenshot scenes),
  `random.js` (seeded random), `main.js` (boot + loop).
- `screenshots/` — real renders of the game: the stall at opening, a bowl mid-assembly,
  and the closing-time score.
- `main.ts` — the hand-in program (Node 22, stdlib only): copies `game/` and
  `screenshots/` to the output directory and writes `dossier.json`.

Original work: all art is drawn in code, all names are invented for this game.
