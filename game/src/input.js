// Midnight Ramen Rush — keyboard and mouse input, translated into game intents.
// Clicks are reported in logical 1280x720 coordinates; keys map to the same actions,
// so the whole stall runs on either hand.
import { BROTHS, LAYOUT, TOPPINGS } from './config.js';

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;

function pointIn(x, y, rect) {
  return x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;
}

export function createInput(canvas) {
  let actions = 0;
  let queued = null;
  let clicks = [];

  function logicalPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 1280,
      y: ((event.clientY - rect.top) / rect.height) * 720,
    };
  }

  function intentFromPoint(p) {
    // Tickets on the Order Board.
    for (let i = 0; i < 4; i += 1) {
      const rect = { x: LAYOUT.board.x + 8 + i * (LAYOUT.ticketW + LAYOUT.ticketGap), y: LAYOUT.board.y + 8, w: LAYOUT.ticketW, h: LAYOUT.ticketH };
      if (pointIn(p.x, p.y, rect)) return { select: i };
    }
    if (pointIn(p.x, p.y, LAYOUT.pot)) return { noodle: true };
    if (pointIn(p.x, p.y, LAYOUT.serve)) return { serve: true };
    if (pointIn(p.x, p.y, LAYOUT.clear)) return { clear: true };
    for (let i = 0; i < BROTHS.length; i += 1) {
      const rect = { x: LAYOUT.brothX0 + i * (LAYOUT.brothW + LAYOUT.brothGap), y: LAYOUT.brothY, w: LAYOUT.brothW, h: LAYOUT.brothH };
      if (pointIn(p.x, p.y, rect)) return { broth: BROTHS[i].id };
    }
    for (let i = 0; i < TOPPINGS.length; i += 1) {
      const rect = { x: LAYOUT.binX0 + i * (LAYOUT.binW + LAYOUT.binGap), y: LAYOUT.binsY, w: LAYOUT.binW, h: LAYOUT.binH };
      if (pointIn(p.x, p.y, rect)) return { topping: TOPPINGS[i].id };
    }
    return null;
  }

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const intent = intentFromPoint(logicalPoint(event));
    if (intent) queued = intent;
    else actions |= ACTION_CONFIRM;
    clicks.push(logicalPoint(event));
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === ' ' || key === 'enter') {
      if (key === ' ') { event.preventDefault(); queued = { noodle: true }; }
      else queued = { serve: true };
      actions |= ACTION_CONFIRM;
    } else if (key === 'p' || key === 'escape') {
      actions |= ACTION_PAUSE;
    } else if (key === 'tab') {
      event.preventDefault();
      queued = { cycle: true };
    } else if (key === 'x' || key === 'backspace') {
      queued = { clear: true };
    } else {
      const broth = BROTHS.find((b) => b.key === key);
      if (broth) { queued = { broth: broth.id }; return; }
      const topping = TOPPINGS.find((t) => t.key === key);
      if (topping) queued = { topping: topping.id };
    }
  });

  function takeActions() {
    const value = actions;
    actions = 0;
    return value;
  }

  function takeIntent() {
    const value = queued;
    queued = null;
    return value;
  }

  function takeClicks() {
    const value = clicks;
    clicks = [];
    return value;
  }

  return { takeActions, takeIntent, takeClicks };
}
