// The screenshot scenes behind ?shot=start|play|end. Each one plays the real rules forward
// from a fresh world for a fixed number of steps, steered by a simple autopilot (start the
// noodles when a customer waits, pull them in the perfect band, ladle the ticket's broth,
// add the ticket's toppings in order, serve the moment the bowl matches), so the frame is
// what a short game really looks like and the same seed always gives the same frame.
import { NOODLE, STEP } from './config.js';
import { EVENT_OVER } from './world.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const START_SECONDS = 5;
const PLAY_SECONDS = 24;
const END_LIMIT_SECONDS = 200;
const SAMPLE = 1 / 30;

/** The autopilot's one decision per step: return the intent the world should run. */
function autopilot(world) {
  const state = world.state;
  const customer = state.customers[state.selected] && state.customers[state.selected].active
    ? state.customers[state.selected]
    : state.customers.find((c) => c.active);
  if (!customer) return null;
  if (state.selected !== customer.slot) return { select: customer.slot };
  const bowl = state.bowl;
  const ticket = customer.ticket;
  if (!bowl.noodle && state.pot.state === 'idle') return { noodle: true };
  if (state.pot.state === 'boiling' && state.pot.seconds >= (NOODLE.perfectFrom + NOODLE.perfectUntil) / 2) return { noodle: true };
  if (bowl.noodle) {
    if (!bowl.broth) return { broth: ticket.broth };
    for (const topping of ticket.toppings) {
      if (!bowl.toppings.includes(topping)) return { topping };
    }
    return { serve: true };
  }
  return null;
}

/**
 * Set `world` to the named scene (start, play or end; any other name is start) and return the
 * screen to draw over it and the best score to show.
 */
export function stageShot(name, world) {
  world.reset();
  if (name !== 'play' && name !== 'end') {
    for (let index = 0; index < START_SECONDS / STEP; index += 1) world.step(STEP, null, true);
    return { screen: SCREEN_TITLE, best: 0 };
  }
  const limit = name === 'end' ? END_LIMIT_SECONDS : PLAY_SECONDS;
  for (let index = 0; index < limit / STEP; index += 1) {
    const events = world.step(STEP, autopilot(world), false);
    if (events & EVENT_OVER) break;
    // The play scene freezes mid-assembly: noodles in the bowl and the first
    // topping already on, the ticket still waiting — a dish being built.
    if (name === 'play' && world.state.bowl.noodle && world.state.bowl.toppings.length >= 1) break;
  }
  const over = world.state.over;
  return { screen: over ? SCREEN_OVER : SCREEN_PLAY, best: world.state.score };
}
