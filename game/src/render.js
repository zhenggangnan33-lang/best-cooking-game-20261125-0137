// Midnight Ramen Rush — everything the player sees: the night-market kitchen, the Ticket
// Order Board, the Noodle Timing Bar, the topping bins, the assembly bowl, the customers
// with their patience meters, and the title / pause / game-over screens. Drawing only:
// it never changes the rules.
import { BROTHS, FIELD, LAYOUT, NOODLE, PALETTE, TOPPINGS } from './config.js';

export const SCREEN_TITLE = 0;
export const SCREEN_PLAY = 1;
export const SCREEN_PAUSED = 2;
export const SCREEN_OVER = 3;

const CUSTOMER_COLOURS = ['#ff8a5c', '#6ec6ff', '#ffd94d', '#c9a0ff'];

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, colour, align, bold) {
  ctx.fillStyle = colour;
  ctx.font = `${bold ? '700' : '400'} ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

function patienceColour(share) {
  return share > 0.5 ? PALETTE.green : share > 0.25 ? PALETTE.gold : PALETTE.red;
}

function drawTicket(ctx, customer, x, y, selected) {
  const w = LAYOUT.ticketW;
  const h = LAYOUT.ticketH;
  ctx.save();
  rr(ctx, x, y, w, h, 10);
  ctx.fillStyle = selected ? '#ffe9a8' : '#fff8e6';
  ctx.fill();
  ctx.lineWidth = selected ? 4 : 2;
  ctx.strokeStyle = selected ? PALETTE.red : '#b89a6a';
  ctx.stroke();
  if (!customer.active) {
    text(ctx, '— empty —', x + w / 2, y + h / 2, 15, '#9a8a70', 'center');
    ctx.restore();
    return;
  }
  const ticket = customer.ticket;
  const share = Math.max(0, customer.patience / customer.patienceMax);
  text(ctx, `#${customer.slot + 1}  ${ticket.brothName}`, x + 10, y + 22, 16, PALETTE.boardInk, 'left', true);
  ticket.toppingNames.forEach((name, i) => {
    text(ctx, `• ${name}`, x + 10, y + 44 + i * 18, 14, '#5a4632');
  });
  // Patience meter on the ticket itself.
  ctx.fillStyle = '#e0d0b0';
  rr(ctx, x + 10, y + h - 20, w - 20, 10, 5);
  ctx.fill();
  ctx.fillStyle = patienceColour(share);
  rr(ctx, x + 10, y + h - 20, (w - 20) * share, 10, 5);
  ctx.fill();
  ctx.restore();
}

function drawTimingBar(ctx, pot) {
  const bar = LAYOUT.timingBar;
  const max = NOODLE.barMax;
  ctx.fillStyle = '#241722';
  rr(ctx, bar.x, bar.y, bar.w, bar.h, 8);
  ctx.fill();
  // Perfect band, then the good band, so the target reads at a glance.
  const px = bar.x + (NOODLE.perfectFrom / max) * bar.w;
  const pw = ((NOODLE.perfectUntil - NOODLE.perfectFrom) / max) * bar.w;
  ctx.fillStyle = '#3f7a3a';
  ctx.fillRect(bar.x + (NOODLE.hardUntil / max) * bar.w, bar.y, ((NOODLE.soggyAfter - NOODLE.hardUntil) / max) * bar.w, bar.h);
  ctx.fillStyle = PALETTE.green;
  ctx.fillRect(px, bar.y, pw, bar.h);
  if (pot.state === 'boiling') {
    const fx = bar.x + Math.min(1, pot.seconds / max) * bar.w;
    ctx.fillStyle = '#fff';
    ctx.fillRect(fx - 2, bar.y - 4, 4, bar.h + 8);
  }
  text(ctx, 'PERFECT', px + pw / 2, bar.y - 6, 12, PALETTE.green, 'center', true);
  text(ctx, pot.state === 'boiling' ? `BOILING ${pot.seconds.toFixed(1)}s — pull in the green!` : 'Pot empty — click it to start noodles', bar.x, bar.y + 36, 13, PALETTE.muted);
}

function drawBowl(ctx, bowl) {
  const b = LAYOUT.bowl;
  ctx.fillStyle = '#f5e6c8';
  rr(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#b89a6a';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'YOUR BOWL — match the ticket!', b.x + 14, b.y + 24, 15, PALETTE.boardInk, 'left', true);
  // The bowl itself.
  const cx = b.x + 105;
  const cy = b.y + 92;
  const broth = BROTHS.find((x) => x.id === bowl.broth);
  ctx.beginPath();
  ctx.arc(cx, cy, 56, 0, Math.PI * 2);
  ctx.fillStyle = '#d94f3d';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, 45, 0, Math.PI * 2);
  ctx.fillStyle = broth ? broth.colour : '#e8dcc0';
  ctx.fill();
  if (bowl.noodle) {
    ctx.strokeStyle = bowl.noodleQuality === 'perfect' ? '#ffe9a8' : bowl.noodleQuality === 'soggy' ? '#c9b18a' : '#f7e8c3';
    ctx.lineWidth = 4;
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.moveTo(cx - 34, cy - 16 + i * 10);
      ctx.quadraticCurveTo(cx, cy - 24 + i * 10, cx + 34, cy - 16 + i * 10);
      ctx.stroke();
    }
  }
  // Toppings land on the bowl as coloured dots.
  bowl.toppings.forEach((id, i) => {
    const topping = TOPPINGS.find((t) => t.id === id);
    if (!topping) return;
    const angle = (i / Math.max(1, bowl.toppings.length)) * Math.PI * 2 - Math.PI / 2;
    const tx = cx + Math.cos(angle) * 24;
    const ty = cy + Math.sin(angle) * 18;
    ctx.beginPath();
    ctx.arc(tx, ty, 10, 0, Math.PI * 2);
    ctx.fillStyle = topping.dot;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
  });
  // Bowl contents as two short lines under the bowl, so nothing runs off the panel.
  const tops = bowl.toppings.length ? bowl.toppings.map((id) => TOPPINGS.find((t) => t.id === id).name).join(' + ') : '—';
  text(ctx, `${bowl.brothName || 'No broth'}  •  ${bowl.noodle ? bowl.noodleQuality.toUpperCase() : 'no noodles'}`, b.x + 14, b.y + 168, 15, PALETTE.boardInk, 'left', true);
  text(ctx, `Toppings: ${tops}`, b.x + 14, b.y + 188, 14, '#5a4632');
  text(ctx, bowl.noodle && bowl.broth ? 'Ready to serve — hit ENTER!' : 'Build the bowl, then serve.', b.x + 14, b.y + 206, 13, bowl.noodle && bowl.broth ? '#2c7a2c' : '#9a8a70', 'left', true);
}

function drawCustomer(ctx, customer, state) {
  const slotW = 300;
  const x = 40 + customer.slot * slotW + 60;
  const y = LAYOUT.customersY + 30;
  const share = customer.active ? Math.max(0, customer.patience / customer.patienceMax) : 0;
  const bob = customer.active ? Math.sin(state.elapsed * 2 + customer.slot * 1.7) * 3 : 0;
  // Patience bar over the customer's head.
  if (customer.active) {
    ctx.fillStyle = '#241722';
    rr(ctx, x - 55, y - 78, 110, 12, 6);
    ctx.fill();
    ctx.fillStyle = patienceColour(share);
    rr(ctx, x - 55, y - 78, 110 * share, 12, 6);
    ctx.fill();
    text(ctx, customer.mood === 'waiting' ? `${Math.ceil(customer.patience)}s` : '', x, y - 84, 13, PALETTE.text, 'center', true);
  }
  // A simple night-market regular: round head, shoulders, apron colour per slot.
  ctx.beginPath();
  ctx.arc(x, y - 38 + bob, 26, 0, Math.PI * 2);
  ctx.fillStyle = '#f2c9a0';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - 9, y - 42 + bob, 4, 0, Math.PI * 2);
  ctx.arc(x + 9, y - 42 + bob, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#241722';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 34, y + 34);
  ctx.quadraticCurveTo(x, y - 22 + bob, x + 34, y + 34);
  ctx.closePath();
  ctx.fillStyle = customer.active ? CUSTOMER_COLOURS[customer.slot] : '#5a4a55';
  ctx.fill();
  if (!customer.active) text(ctx, '—', x, y - 10, 18, PALETTE.muted, 'center');
  else if (state.selected === customer.slot) {
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y - 38 + bob, 33, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawOverlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(20, 12, 22, 0.82)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  ctx.fillStyle = PALETTE.board;
  rr(ctx, 240, 110, 800, 500, 18);
  ctx.fill();
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, title, 640, 190, 44, accent || PALETTE.boardInk, 'center', true);
  lines.forEach((line, i) => {
    text(ctx, line.text, 640, 240 + i * 34, line.size || 19, line.colour || PALETTE.boardInk, 'center', line.bold);
  });
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function draw(state, screen, best) {
    const scale = Math.min(canvas.width / FIELD.width, canvas.height / FIELD.height);
    const ox = (canvas.width - FIELD.width * scale) / 2;
    const oy = (canvas.height - FIELD.height * scale) / 2;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = PALETTE.night;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale, 0, 0, scale, ox + (state.shake > 0 ? (Math.random() - 0.5) * state.shake * 30 : 0), oy);
    ctx.clearRect(-20, -20, FIELD.width + 40, FIELD.height + 40);

    // Night wall, paper lanterns and string lights.
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(0, 0, FIELD.width, 520);
    ctx.fillStyle = PALETTE.wallLower;
    ctx.fillRect(0, 500, FIELD.width, 20);
    for (let i = 0; i < 9; i += 1) {
      const lx = 60 + i * 145;
      ctx.strokeStyle = '#6b4a3a';
      ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, 26); ctx.stroke();
      ctx.beginPath(); ctx.arc(lx, 46, 20, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 ? '#ff5a4e' : '#f2c94c';
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 220, 140, 0.9)';
      ctx.font = '700 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(i % 2 ? '拉' : '麺', lx, 51);
    }
    text(ctx, '深夜拉面屋', 1180, 40, 26, '#f2c94c', 'right', true);

    // Ticket Order Board.
    ctx.fillStyle = PALETTE.board;
    rr(ctx, LAYOUT.board.x, LAYOUT.board.y, LAYOUT.board.w, LAYOUT.board.h, 10);
    ctx.fill();
    text(ctx, 'ORDER BOARD  — click a ticket to serve it', LAYOUT.board.x + 12, LAYOUT.board.y - 2 + 0, 13, PALETTE.gold, 'left', true);
    // (label sits on the board's top edge; tickets below it)
    state.customers.forEach((c, i) => {
      drawTicket(ctx, c, LAYOUT.board.x + 8 + i * (LAYOUT.ticketW + LAYOUT.ticketGap), LAYOUT.board.y + 8, state.selected === i && c.active);
    });

    // Noodle pot + timing bar.
    const pot = LAYOUT.pot;
    ctx.fillStyle = '#241722';
    rr(ctx, pot.x - 8, pot.y - 8, pot.w + 16, pot.h + 60, 12);
    ctx.fill();
    ctx.fillStyle = '#241722';
    rr(ctx, pot.x - 8, pot.y - 30, 170, 22, 8);
    ctx.fill();
    text(ctx, 'NOODLE POT  [SPACE]', pot.x, pot.y - 14, 14, PALETTE.gold, 'left', true);
    ctx.beginPath();
    ctx.ellipse(pot.x + pot.w / 2, pot.y + 55, 88, 40, 0, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.pot;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(pot.x + pot.w / 2, pot.y + 50, 74, 30, 0, 0, Math.PI * 2);
    ctx.fillStyle = state.pot.state === 'boiling' ? '#e8a13c' : '#3a3a44';
    ctx.fill();
    if (state.pot.state === 'boiling') {
      ctx.strokeStyle = '#fff2c0';
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i += 1) {
        const bx = pot.x + 50 + i * 50;
        ctx.beginPath();
        ctx.moveTo(bx, pot.y + 40);
        ctx.quadraticCurveTo(bx + 8, pot.y + 22, bx, pot.y + 8);
        ctx.stroke();
      }
    }
    drawTimingBar(ctx, state.pot);

    // Broth ladles.
    text(ctx, 'BROTH  [Q/W/E]', LAYOUT.brothX0, LAYOUT.brothY - 8, 13, PALETTE.gold, 'left', true);
    BROTHS.forEach((broth, i) => {
      const x = LAYOUT.brothX0 + i * (LAYOUT.brothW + LAYOUT.brothGap);
      const y = LAYOUT.brothY;
      rr(ctx, x, y, LAYOUT.brothW, LAYOUT.brothH, 10);
      ctx.fillStyle = state.bowl.broth === broth.id ? '#ffe9a8' : '#f5e6c8';
      ctx.fill();
      ctx.lineWidth = state.bowl.broth === broth.id ? 4 : 2;
      ctx.strokeStyle = state.bowl.broth === broth.id ? PALETTE.red : '#b89a6a';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + LAYOUT.brothW / 2, y + 20, 12, 0, Math.PI * 2);
      ctx.fillStyle = broth.dot;
      ctx.fill();
      text(ctx, broth.name, x + LAYOUT.brothW / 2, y + 46, 12, PALETTE.boardInk, 'center', true);
    });

    // Assembly bowl, serve and clear.
    drawBowl(ctx, state.bowl);
    const serve = LAYOUT.serve;
    rr(ctx, serve.x, serve.y, serve.w, serve.h, 12);
    ctx.fillStyle = state.bowl.noodle && state.bowl.broth ? '#d94f3d' : '#8a6a55';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    text(ctx, 'SERVE  [ENTER]', serve.x + serve.w / 2, serve.y + 34, 22, '#fff', 'center', true);
    const clear = LAYOUT.clear;
    rr(ctx, clear.x, clear.y, clear.w, clear.h, 10);
    ctx.fillStyle = '#4a3a44';
    ctx.fill();
    text(ctx, 'Clear bowl  [X]', clear.x + clear.w / 2, clear.y + 24, 14, PALETTE.text, 'center');

    // Topping bins on the counter.
    text(ctx, 'TOPPINGS  — click a bin or press 1–6', LAYOUT.binX0, LAYOUT.binsY - 10, 14, PALETTE.gold, 'left', true);
    TOPPINGS.forEach((topping, i) => {
      const x = LAYOUT.binX0 + i * (LAYOUT.binW + LAYOUT.binGap);
      const y = LAYOUT.binsY;
      const inBowl = state.bowl.toppings.includes(topping.id);
      rr(ctx, x, y, LAYOUT.binW, LAYOUT.binH, 10);
      ctx.fillStyle = inBowl ? '#ffe9a8' : '#f5e6c8';
      ctx.fill();
      ctx.lineWidth = inBowl ? 4 : 2;
      ctx.strokeStyle = inBowl ? PALETTE.red : '#b89a6a';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + LAYOUT.binW / 2, y + 34, 20, 0, Math.PI * 2);
      ctx.fillStyle = topping.dot;
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '700 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(topping.key, x + LAYOUT.binW / 2, y + 39);
      text(ctx, topping.name, x + LAYOUT.binW / 2, y + 72, 14, PALETTE.boardInk, 'center', true);
      text(ctx, inBowl ? '✓ in bowl' : '', x + LAYOUT.binW / 2, y + 88, 11, '#2c7a2c', 'center', true);
    });

    // Counter and customers.
    ctx.fillStyle = PALETTE.counterTop;
    ctx.fillRect(0, LAYOUT.counterY, FIELD.width, 16);
    ctx.fillStyle = PALETTE.counter;
    ctx.fillRect(0, LAYOUT.counterY + 16, FIELD.width, FIELD.height - LAYOUT.counterY - 16);
    state.customers.forEach((c) => drawCustomer(ctx, c, state));

    // HUD: timer, score, combo, hearts, wave.
    const mins = Math.floor(state.timeLeft / 60);
    const secs = Math.floor(state.timeLeft % 60);
    const timeText = `${mins}:${String(secs).padStart(2, '0')}`;
    ctx.fillStyle = 'rgba(20, 12, 22, 0.85)';
    rr(ctx, 24, 660, 1232, 44, 10);
    ctx.fill();
    text(ctx, `⏱  NIGHT TIMER  ${timeText}`, 44, 690, 22, state.timeLeft < 30 ? PALETTE.red : PALETTE.text, 'left', true);
    text(ctx, `SCORE ${state.score}`, 330, 690, 22, PALETTE.gold, 'left', true);
    text(ctx, `TIPS ¥${state.tips}`, 520, 690, 20, PALETTE.text, 'left', true);
    text(ctx, state.combo > 1 ? `🔥 COMBO x${state.combo}` : 'Combo —', 680, 690, 20, PALETTE.gold, 'left', true);
    text(ctx, `❤ ${'♥'.repeat(Math.max(0, state.hearts))}${'♡'.repeat(Math.max(0, 3 - state.hearts))}`, 880, 690, 20, PALETTE.red, 'left', true);
    text(ctx, `WAVE ${state.wave}  •  Served ${state.served}`, 1060, 690, 18, PALETTE.muted, 'left', true);
    if (state.messageTimer > 0) {
      text(ctx, state.message, 640, 548, 20, '#fff', 'center', true);
    }

    // Screens.
    if (screen === SCREEN_TITLE) {
      drawOverlay(ctx, 'MIDNIGHT RAMEN RUSH', [
        { text: '深夜拉面屋 — run a late-night ramen stall until closing time', size: 20 },
        { text: '1  Ticket Order Board — cook what each ticket asks for', size: 19 },
        { text: '2  Noodle Timing Bar — pull in the green for perfect noodles', size: 19 },
        { text: '3  Topping Assembly — Q/W/E broth, 1–6 toppings, match the ticket', size: 19 },
        { text: '4  Patience & Rush Hour — patience drains; nights get busier', size: 19 },
        { text: '5  Combo Tips — perfect serves in a row pay bigger tips', size: 19 },
        { text: 'SPACE noodles  •  ENTER serve  •  TAB pick a customer  •  P pause', size: 18, colour: '#8a5a2b', bold: true },
        { text: 'Press SPACE or click to open the stall!', size: 22, colour: '#c94f3d', bold: true },
      ], '#c94f3d');
    } else if (screen === SCREEN_PAUSED) {
      drawOverlay(ctx, 'PAUSED', [
        { text: 'The noodles can wait. The customers cannot.', size: 20 },
        { text: 'Press P or SPACE to get back to the stove.', size: 19 },
      ]);
    } else if (screen === SCREEN_OVER) {
      drawOverlay(ctx, state.won ? 'CLOSING TIME — NIGHT DONE!' : 'THE STALL CLOSES EARLY…', [
        { text: `Final score: ${state.score}   •   Tips earned: ¥${state.tips}`, size: 22, bold: true },
        { text: `Bowls served: ${state.served}   •   Perfect serves: ${state.perfectServes}`, size: 20 },
        { text: `Best combo: x${state.bestCombo}   •   Customers lost: ${state.walkouts}`, size: 20 },
        { text: `Best score: ${Math.max(best, state.score)}`, size: 20 },
        { text: 'Press SPACE or click to run another night!', size: 22, colour: '#c94f3d', bold: true },
      ], '#c94f3d');
      // Tonight's plates, ready on the counter: three finished bowls.
      const plateBroths = ['#8a5a2b', '#c98a4b', '#f0e0c0'];
      const plateDots = [['#f2c94c', '#c94f3d'], ['#2c4f38', '#4f9e3a'], ['#e8a91c', '#e86a8a']];
      for (let i = 0; i < 3; i += 1) {
        const cx = 490 + i * 150;
        const cy = 480;
        ctx.beginPath();
        ctx.arc(cx, cy, 52, 0, Math.PI * 2);
        ctx.fillStyle = '#d94f3d';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, 40, 0, Math.PI * 2);
        ctx.fillStyle = plateBroths[i];
        ctx.fill();
        ctx.strokeStyle = '#f7e8c3';
        ctx.lineWidth = 3;
        for (let j = 0; j < 3; j += 1) {
          ctx.beginPath();
          ctx.moveTo(cx - 28, cy - 12 + j * 10);
          ctx.quadraticCurveTo(cx, cy - 18 + j * 10, cx + 28, cy - 12 + j * 10);
          ctx.stroke();
        }
        plateDots[i].forEach((dot, j) => {
          ctx.beginPath();
          ctx.arc(cx - 14 + j * 28, cy + 6, 8, 0, Math.PI * 2);
          ctx.fillStyle = dot;
          ctx.fill();
        });
      }
      text(ctx, '— tonight’s plates, served —', 640, 560, 16, '#8a5a2b', 'center');
    }
  }

  return { draw };
}
