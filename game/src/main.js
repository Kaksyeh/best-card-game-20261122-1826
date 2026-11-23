// Game loop: turns, combos, AI reveals, win/loss, staged scenes. One job: run the duel.
import { SUITS, makeCard } from './deck.js';
import { createFighter, startTurn, dealOpeningHand, applyDamage, heal } from './player.js';
import { choosePlays, intentText } from './opponent.js';
import { renderAll, confetti } from './render.js';
import { Sound } from './audio.js';
import { bindInput } from './input.js';

const sound = new Sound();
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const state = {
  screen: 'title', turn: 1, inputOn: false,
  player: null, baron: null,
  playerPlayed: [], baronPlayed: [],
  kindled: false, intent: '', log: 'Your move, Warden.',
  onPlayCard: null,
};

function newGame() {
  state.player = createFighter('Ember Warden');
  state.baron = createFighter('Ash Baron');
  state.turn = 1;
  state.playerPlayed = []; state.baronPlayed = [];
  state.kindled = false; state.intent = '';
  dealOpeningHand(state.player);
  dealOpeningHand(state.baron);
  // Guaranteed opener: a starting hand with no burn stalls the whole duel
  // (the first playtest timed out at 31 turns that way), so swap in flames
  // until the Warden opens with two.
  ensureOpeningFlames(state.player);
  state.screen = 'duel';
  state.inputOn = true;
  startTurn(state.player, 1);
  state.log = 'Turn 1 — play a card, then end your turn.';
  sound.deal();
  renderAll(state);
}

// Swap non-Flame cards out of the opening hand until it holds two Flames.
function ensureOpeningFlames(fighter) {
  for (let i = fighter.hand.filter(c => c.suit === 'flame').length; i < 2; i++) {
    const fi = fighter.deck.findIndex(c => c.suit === 'flame');
    if (fi < 0) break;
    const ni = fighter.hand.findIndex(c => c.suit !== 'flame');
    if (ni < 0) break;
    const [flame] = fighter.deck.splice(fi, 1);
    const [old] = fighter.hand.splice(ni, 1);
    fighter.hand.push(flame);
    fighter.deck.push(old);
  }
}

// Resolve one played card. `by` is the fighter who played it, `foe` the other side.
function resolveCard(card, by, foe, byPlayer) {
  const s = SUITS[card.suit];
  if (card.suit === 'flame') {
    let dmg = card.value;
    if (byPlayer && state.kindled) { dmg *= 2; state.kindled = false; }
    const r = applyDamage(foe, dmg);
    sound.hit();
    if (r.blocked) sound.block();
    state.log = `${by.name}'s ${card.name} burns ${foe.name} for ${r.dealt}` +
      (r.blocked ? ` (${r.blocked} blocked)` : '') + (r.soaked ? ` (${r.soaked} soaked by armour)` : '') + '.';
  } else if (card.suit === 'frost') {
    by.shield += card.value;
    sound.block();
    state.log = `${by.name} raises ${card.name}: shield ${card.value}.`;
    if (byPlayer) state.kindled = true; // next Flame doubles
  } else if (card.suit === 'leaf') {
    const got = heal(by, card.value);
    sound.heal();
    state.log = `${by.name} mends ${got} life with ${card.name}.`;
    if (byPlayer && by.lastPlayedSuit === 'stone') {
      // Leaf after Stone draws an extra card.
      const n = drawInto(by, 1);
      state.log += ` Leaf after Stone — drew ${n} extra card${n === 1 ? '' : 's'}.`;
    }
  } else if (card.suit === 'stone') {
    by.armor += card.value;
    sound.play();
    state.log = `${by.name} gains ${card.value} lasting armour from ${card.name}.`;
  }
  by.lastPlayedSuit = card.suit;
  by.discard.push(card);
}

function drawInto(fighter, n) {
  // local draw (deck.js drawCards needs no UI); inline to avoid a cycle.
  let drawn = 0;
  for (let i = 0; i < n; i++) {
    if (fighter.hand.length >= 7) break;
    if (fighter.deck.length === 0) {
      if (fighter.discard.length === 0) break;
      fighter.deck = fighter.discard.splice(0);
      for (let j = fighter.deck.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [fighter.deck[j], fighter.deck[k]] = [fighter.deck[k], fighter.deck[j]];
      }
    }
    fighter.hand.push(fighter.deck.pop());
    drawn++;
  }
  return drawn;
}

function checkEnd() {
  if (state.baron.life <= 0) {
    state.screen = 'win';
    state.inputOn = false;
    document.getElementById('winDetail').textContent =
      `The duel ended on turn ${state.turn} — you stand with ${state.player.life} life.`;
    sound.win();
    confetti(document.getElementById('winScreen'));
    renderAll(state);
    return true;
  }
  if (state.player.life <= 0) {
    state.screen = 'loss';
    state.inputOn = false;
    document.getElementById('lossDetail').textContent =
      `The Baron endures with ${state.baron.life} life on turn ${state.turn}.`;
    sound.lose();
    renderAll(state);
    return true;
  }
  return false;
}

function playCardByUid(uid) {
  if (!state.inputOn || state.screen !== 'duel') return;
  const idx = state.player.hand.findIndex(c => c.uid === uid);
  if (idx < 0) return;
  const card = state.player.hand[idx];
  if (card.cost > state.player.ember) return;
  state.player.ember -= card.cost;
  state.player.hand.splice(idx, 1);
  state.playerPlayed.push(card);
  sound.play();
  resolveCard(card, state.player, state.baron, true);
  renderAll(state);
  checkEnd();
}

async function endTurn() {
  if (!state.inputOn || state.screen !== 'duel') return;
  state.inputOn = false;
  state.playerPlayed = [];
  renderAll(state);
  // Baron's turn: reveal intent, then resolve.
  startTurn(state.baron, state.turn);
  const plays = choosePlays(state.baron, state.player);
  state.baronPlayed = [];
  if (plays.length) {
    state.intent = intentText(plays[0]) + ' — answer it if you can!';
    state.log = 'The Baron reveals his intent…';
    renderAll(state);
    await sleep(900);
    for (const card of plays) {
      state.baron.hand.splice(state.baron.hand.indexOf(card), 1);
      state.baron.ember -= card.cost;
      state.baronPlayed.push(card);
      resolveCard(card, state.baron, state.player, false);
      renderAll(state);
      if (checkEnd()) { state.intent = ''; return; }
      await sleep(500);
    }
  } else {
    state.log = 'The Baron holds his cards and passes.';
  }
  state.intent = '';
  state.baronPlayed = [];
  // Next player turn. Scout rule: a hand with no burn stalls the duel,
  // so a Warden with no Flame in hand draws one extra card.
  state.turn++;
  state.playerPlayed = [];
  state.baron.lastPlayedSuit = null;
  startTurn(state.player, state.turn);
  sound.deal();
  state.log = `Turn ${state.turn} — ${state.player.ember} ember, draw a card, make your play.`;
  if (!state.player.hand.some(c => c.suit === 'flame')) {
    let n = 0;
    for (let i = 0; i < 2 && !state.player.hand.some(c => c.suit === 'flame'); i++) n += drawInto(state.player, 1);
    if (n) state.log += ` No burn in hand — you scout ${n} extra card${n === 1 ? '' : 's'} to find one.`;
  }
  state.inputOn = true;
  renderAll(state);
}

function startDuel() { newGame(); }

// --- Staged scenes for screenshots (?scene=title|duel|win|loss) ---
function applyScene(scene) {
  if (scene === 'duel') {
    newGame();
    // Fixed mid-game table: turn 4, Baron threatening, Warden holding answers.
    state.turn = 4;
    state.player.life = 24; state.baron.life = 19;
    state.player.maxEmber = 4; state.player.ember = 4;
    state.baron.maxEmber = 4; state.baron.ember = 2;
    const defs = [
      ['veil', 'frost', 'Frost Veil', 1, 4], ['lash', 'flame', 'Flame Lash', 2, 5],
      ['brand', 'flame', 'Firebrand', 3, 7], ['spring', 'leaf', 'Spring Leaf', 1, 3],
      ['skin', 'stone', 'Stone Skin', 2, 3],
    ];
    state.player.hand = defs.map((d, i) => makeCard(d, 'scene' + i));
    state.baron.hand = state.baron.hand.slice(0, 4);
    state.baronPlayed = [makeCard(['lash', 'flame', 'Flame Lash', 2, 5], 'sceneb1')];
    state.intent = 'The Baron will BURN for 5 — answer it if you can!';
    state.log = 'Turn 4 — the Baron raises a burning brand. Frost will blunt it.';
    renderAll(state);
  } else if (scene === 'win') {
    newGame();
    state.baron.life = 0;
    state.screen = 'win';
    state.inputOn = false;
    document.getElementById('winDetail').textContent = 'The duel ended on turn 6 — you stand with 17 life.';
    sound.win();
    renderAll(state);
    confetti(document.getElementById('winScreen'));
  } else if (scene === 'loss') {
    newGame();
    state.player.life = 0;
    state.screen = 'loss';
    state.inputOn = false;
    document.getElementById('lossDetail').textContent = 'The Baron endures with 11 life on turn 7.';
    renderAll(state);
  }
}

state.onPlayCard = playCardByUid;
bindInput({
  onStart: startDuel,
  onRestart: () => { newGame(); },
  onEndTurn: () => { endTurn(); },
  onMute: () => sound.toggleMute(),
  onPlayIndex: (i) => {
    if (!state.inputOn) return;
    const card = state.player.hand[i];
    if (card) playCardByUid(card.uid);
  },
});

// Fresh state for the title screen.
state.player = createFighter('Ember Warden');
state.baron = createFighter('Ash Baron');
dealOpeningHand(state.player);
dealOpeningHand(state.baron);
renderAll(state);

const scene = new URLSearchParams(location.search).get('scene');
if (scene) applyScene(scene);
