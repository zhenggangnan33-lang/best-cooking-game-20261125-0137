// Midnight Ramen Rush — the rules and the state, with no drawing and no browser in it:
// the Ticket Order Board, the Noodle Timing Bar, Topping Assembly, Patience & Rush Hour,
// and Combo Tips. step() advances one fixed step and returns what happened as bit flags,
// so the caller can react without the world knowing about screens or sound.
import { BROTHS, FIELD, HEARTS, LAYOUT, NOODLE, PATIENCE, SCORE, SHIFT_SECONDS, SPAWN, TOPPINGS } from './config.js';

export const EVENT_SERVE = 1;
export const EVENT_PERFECT = 2;
export const EVENT_LEAVE = 4;
export const EVENT_OVER = 8;
export const EVENT_WRONG = 16;
export const EVENT_NOODLE = 32;

const MAX_CUSTOMERS = 4;

function pickTicket(random, wave) {
  const broth = BROTHS[Math.floor(random() * BROTHS.length)];
  const count = wave >= 3 ? 3 : 2;
  const pool = TOPPINGS.slice();
  const toppings = [];
  while (toppings.length < count && pool.length > 0) {
    toppings.push(pool.splice(Math.floor(random() * pool.length), 1)[0]);
  }
  return { broth: broth.id, brothName: broth.name, toppings: toppings.map((t) => t.id), toppingNames: toppings.map((t) => t.name) };
}

function noodleQuality(seconds) {
  if (seconds < NOODLE.hardUntil) return 'hard';
  if (seconds < NOODLE.perfectFrom) return 'good';
  if (seconds <= NOODLE.perfectUntil) return 'perfect';
  if (seconds <= NOODLE.soggyAfter) return 'good';
  return 'soggy';
}

export function createWorld(random) {
  const customers = [];
  for (let i = 0; i < MAX_CUSTOMERS; i += 1) {
    customers.push({ active: false, ticket: null, patience: 0, patienceMax: 1, mood: 'waiting', flash: 0, slot: i });
  }
  const pot = { state: 'idle', seconds: 0 };
  const bowl = { broth: null, brothName: '', toppings: [], noodle: null, noodleQuality: '' };
  const state = {
    customers, pot, bowl,
    score: 0, tips: 0, served: 0, perfectServes: 0, walkouts: 0,
    combo: 0, bestCombo: 0, hearts: HEARTS,
    elapsed: 0, timeLeft: SHIFT_SECONDS, wave: 1,
    spawnTimer: 4, selected: 0, message: 'Welcome to the stall!', messageTimer: 0,
    shake: 0, over: false, won: false,
  };

  function reset() {
    for (const c of customers) { c.active = false; c.ticket = null; c.patience = 0; c.mood = 'waiting'; c.flash = 0; }
    pot.state = 'idle'; pot.seconds = 0;
    bowl.broth = null; bowl.brothName = ''; bowl.toppings = []; bowl.noodle = null; bowl.noodleQuality = '';
    state.score = 0; state.tips = 0; state.served = 0; state.perfectServes = 0; state.walkouts = 0;
    state.combo = 0; state.bestCombo = 0; state.hearts = HEARTS;
    state.elapsed = 0; state.timeLeft = SHIFT_SECONDS; state.wave = 1;
    state.spawnTimer = 4; state.selected = 0;
    state.message = 'First customer coming… start the noodles!'; state.messageTimer = 3;
    state.shake = 0; state.over = false; state.won = false;
  }

  function say(text, seconds) {
    state.message = text; state.messageTimer = seconds;
  }

  function progress() {
    return Math.min(1, state.elapsed / SHIFT_SECONDS);
  }

  function spawnCustomer() {
    for (const c of customers) {
      if (c.active) continue;
      const patienceMax = PATIENCE.start + (PATIENCE.end - PATIENCE.start) * progress();
      c.active = true; c.ticket = pickTicket(random, state.wave);
      c.patience = patienceMax; c.patienceMax = patienceMax; c.mood = 'waiting'; c.flash = 0;
      if (state.selected >= 0 && !customers[state.selected].active) state.selected = c.slot;
      return true;
    }
    return false;
  }

  function startNoodle() {
    if (pot.state !== 'idle' || bowl.noodle) return false;
    pot.state = 'boiling'; pot.seconds = 0;
    say('Noodles in! Watch the timing bar…', 2);
    return true;
  }

  function pullNoodle() {
    if (pot.state !== 'boiling') return null;
    const quality = noodleQuality(pot.seconds);
    pot.state = 'idle'; pot.seconds = 0;
    bowl.noodle = quality; bowl.noodleQuality = quality;
    say(quality === 'perfect' ? 'Perfect noodles! Golden pull!' : quality === 'good' ? 'Noodles pulled — decent.' : quality === 'hard' ? 'Too hard! Undercooked.' : 'Soggy! Overcooked.', 2);
    return quality;
  }

  function addBroth(id) {
    const broth = BROTHS.find((b) => b.id === id);
    if (!broth) return false;
    bowl.broth = broth.id; bowl.brothName = broth.name;
    return true;
  }

  function addTopping(id) {
    if (bowl.toppings.includes(id) || bowl.toppings.length >= 4) return false;
    bowl.toppings.push(id);
    return true;
  }

  function clearBowl() {
    bowl.broth = null; bowl.brothName = ''; bowl.toppings = []; bowl.noodle = null; bowl.noodleQuality = '';
  }

  function bowlMatches(ticket) {
    if (!bowl.noodle || bowl.broth !== ticket.broth) return false;
    if (bowl.toppings.length !== ticket.toppings.length) return false;
    return ticket.toppings.every((t) => bowl.toppings.includes(t));
  }

  function serve() {
    const customer = customers[state.selected];
    if (!customer || !customer.active) { say('Pick a customer ticket first!', 2); return 0; }
    if (!bowl.noodle) { say('No noodles in the bowl yet!', 2); return EVENT_WRONG; }
    if (!bowlMatches(customer.ticket)) {
      state.shake = 0.35;
      say('Wrong bowl! Check the ticket: broth + toppings must match.', 2.5);
      return EVENT_WRONG;
    }
    const quality = bowl.noodleQuality;
    const patienceShare = customer.patience / customer.patienceMax;
    let points = SCORE.base + Math.round(SCORE.tipMax * patienceShare);
    if (quality === 'perfect') points += SCORE.perfectNoodle;
    else if (quality === 'good') points += SCORE.goodNoodle;
    else points += SCORE.badNoodle;
    const perfectServe = quality === 'perfect' && patienceShare > 0.5;
    if (perfectServe) {
      state.combo += 1;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
      state.perfectServes += 1;
      points += Math.round(points * 0.25 * state.combo);
    } else {
      state.combo = 0;
    }
    const tip = Math.max(0, points - SCORE.base);
    state.score += points; state.tips += tip; state.served += 1;
    customer.active = false; customer.mood = 'served'; customer.flash = 1;
    clearBowl();
    say(perfectServe ? `PERFECT SERVE! +${points} (combo x${state.combo})` : `Served! +${points}`, 2.5);
    return perfectServe ? EVENT_SERVE | EVENT_PERFECT : EVENT_SERVE;
  }

  /**
   * One fixed step. `action` is the player's intent this step:
   * { noodle: true } toggles the pot, { broth, topping } add to the bowl,
   * { serve: true } serves the selected ticket, { select } picks a ticket,
   * { clear: true } empties the bowl. With `harmless` set (the title screen's
   * backdrop) customers arrive and wait but patience never runs out.
   */
  function step(dt, action, harmless) {
    let events = 0;
    if (state.over) return events;
    state.elapsed += dt;
    state.timeLeft = Math.max(0, SHIFT_SECONDS - state.elapsed);
    state.wave = Math.min(4, 1 + Math.floor(state.elapsed / 45));
    if (state.messageTimer > 0) state.messageTimer -= dt;
    if (state.shake > 0) state.shake = Math.max(0, state.shake - dt);
    for (const c of customers) if (c.flash > 0) c.flash = Math.max(0, c.flash - dt * 2);

    if (action) {
      if (typeof action.select === 'number' && customers[action.select] && customers[action.select].active) state.selected = action.select;
      if (action.noodle) {
        if (pot.state === 'idle') startNoodle();
        else if (pullNoodle()) events |= EVENT_NOODLE;
      }
      if (action.broth) addBroth(action.broth);
      if (action.topping) addTopping(action.topping);
      if (action.clear) { clearBowl(); say('Bowl cleared.', 1.5); }
      if (action.serve) events |= serve();
    }

    if (pot.state === 'boiling') pot.seconds += dt;

    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      if (spawnCustomer()) state.spawnTimer = SPAWN.start + (SPAWN.end - SPAWN.start) * progress() + random() * 3;
      else state.spawnTimer = 2;
    }

    for (const c of customers) {
      if (!c.active || harmless) continue;
      c.patience -= dt;
      if (c.patience <= 0) {
        c.active = false; c.mood = 'left';
        state.walkouts += 1; state.hearts -= 1; state.combo = 0; state.shake = 0.4;
        say('A customer stormed off! Lost a heart.', 2.5);
        events |= EVENT_LEAVE;
        if (state.hearts <= 0) {
          state.over = true; state.won = false;
          events |= EVENT_OVER;
        }
      }
    }

    if (!state.over && state.timeLeft <= 0) {
      state.over = true; state.won = state.hearts > 0;
      events |= EVENT_OVER;
    }
    return events;
  }

  reset();
  return { state, reset, step, startNoodle, pullNoodle, addBroth, addTopping, clearBowl, serve, spawnCustomer, bowlMatches, noodleQuality };
}
