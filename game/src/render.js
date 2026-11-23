// DOM rendering: hands, life bars, played cards, overlays. One job: draw the table.
import { SUITS } from './deck.js';

// Suit icons as inline SVG: flame, snowflake, leaf, mountain — colour AND shape, never text alone.
export function suitIcon(suit, color) {
  const c = color || SUITS[suit].color;
  if (suit === 'flame') return `<svg viewBox="0 0 64 64"><path d="M32 4 C40 18 52 24 52 40 a20 20 0 0 1 -40 0 C12 28 20 22 24 14 C26 22 30 24 32 26 C32 18 30 10 32 4 Z" fill="${c}"/><path d="M32 34 c6 5 10 9 10 15 a10 10 0 0 1 -20 0 c0 -6 4 -10 10 -15 Z" fill="#ffd76a"/></svg>`;
  if (suit === 'frost') return `<svg viewBox="0 0 64 64" stroke="${c}" stroke-width="5" stroke-linecap="round"><line x1="32" y1="6" x2="32" y2="58"/><line x1="10" y1="19" x2="54" y2="45"/><line x1="54" y1="19" x2="10" y2="45"/><circle cx="32" cy="32" r="7" fill="none"/></svg>`;
  if (suit === 'leaf') return `<svg viewBox="0 0 64 64"><path d="M52 12 C28 8 10 24 12 44 C14 58 32 58 44 46 C54 36 54 22 52 12 Z" fill="${c}"/><path d="M16 48 C26 38 38 28 50 16" stroke="#e8f5d0" stroke-width="3" fill="none"/></svg>`;
  return `<svg viewBox="0 0 64 64"><path d="M6 54 L24 16 L36 38 L44 24 L58 54 Z" fill="${c}"/><path d="M24 16 L30 28 L20 28 Z M44 24 L50 36 L40 36 Z" fill="#fff" opacity="0.7"/></svg>`;
}

function valueLabel(card) {
  return { flame: 'DMG', frost: 'SHIELD', leaf: 'HEAL', stone: 'ARMOUR' }[card.suit];
}

export function cardElement(card, opts = {}) {
  const el = document.createElement('div');
  el.className = `card ${card.suit}${opts.small ? ' small' : ''}${opts.played ? ' played' : ''}${opts.unplayable ? ' unplayable' : ''}`;
  el.dataset.uid = card.uid;
  const combo = opts.combo || '';
  el.innerHTML = `<div class="cost">${card.cost}</div>
    <div class="suitIcon">${suitIcon(card.suit)}</div>
    <div class="cname">${card.name}</div>
    <div class="cval" style="color:${SUITS[card.suit].color}">${card.value} ${valueLabel(card)}</div>
    <div class="cdesc">${SUITS[card.suit].desc}</div>
    ${combo ? `<div class="combo">${combo}</div>` : ''}`;
  return el;
}

export function renderAll(state) {
  const { player, baron } = state;
  document.getElementById('turnNum').textContent = state.turn;
  // Life
  document.getElementById('baronLife').textContent = baron.life;
  document.getElementById('baronLifeFill').style.width = (baron.life / baron.maxLife * 100) + '%';
  document.getElementById('playerLife').textContent = player.life;
  document.getElementById('playerLifeFill').style.width = (player.life / player.maxLife * 100) + '%';
  // Stats
  document.getElementById('baronStats').textContent =
    (baron.armor ? `Armour ${baron.armor}  ` : '') + (baron.shield ? `Shield ${baron.shield}` : '') || 'No guard up';
  document.getElementById('playerStats').textContent =
    (player.armor ? `Armour ${player.armor}  ` : '') + (player.shield ? `Shield ${player.shield}` : '') || 'No guard up';
  document.getElementById('baronHandCount').textContent = `${baron.hand.length} cards in hand`;
  // Opponent card backs
  const backs = document.getElementById('baronBacks');
  backs.innerHTML = '';
  for (let i = 0; i < Math.min(baron.hand.length, 7); i++) {
    const b = document.createElement('div'); b.className = 'back'; backs.appendChild(b);
  }
  // Ember pips
  const er = document.getElementById('emberRow');
  er.innerHTML = '<span style="margin-right:4px">Ember</span>';
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('span');
    p.className = 'pip' + (i < player.ember ? ' on' : '');
    if (i >= player.maxEmber) p.style.opacity = '.25';
    er.appendChild(p);
  }
  er.insertAdjacentHTML('beforeend', `<span style="margin-left:6px">${player.ember}/${player.maxEmber}</span>`);
  // Player hand
  const handEl = document.getElementById('hand');
  handEl.innerHTML = '';
  player.hand.forEach((card) => {
    let combo = '';
    if (state.kindled && card.suit === 'flame') combo = 'KINDLED ×2 DAMAGE';
    else if (player.lastPlayedSuit === 'stone' && card.suit === 'leaf') combo = 'AFTER STONE: DRAW A CARD';
    else if (player.lastPlayedSuit === 'frost' && card.suit === 'flame') combo = 'KINDLED ×2 DAMAGE';
    const el = cardElement(card, { unplayable: card.cost > player.ember || !state.inputOn, combo });
    el.addEventListener('click', () => state.onPlayCard && state.onPlayCard(card.uid));
    handEl.appendChild(el);
  });
  // Played cards
  const bp = document.getElementById('baronPlayed');
  bp.innerHTML = '';
  state.baronPlayed.forEach(c => bp.appendChild(cardElement(c, { small: true, played: true })));
  const pp = document.getElementById('playerPlayed');
  pp.innerHTML = '';
  state.playerPlayed.forEach(c => pp.appendChild(cardElement(c, { small: true, played: true })));
  document.getElementById('intent').textContent = state.intent || '';
  document.getElementById('log').textContent = state.log || '';
  document.getElementById('endBtn').disabled = !state.inputOn;
  // Overlays
  document.getElementById('titleScreen').classList.toggle('hidden', state.screen !== 'title');
  document.getElementById('winScreen').classList.toggle('hidden', state.screen !== 'win');
  document.getElementById('lossScreen').classList.toggle('hidden', state.screen !== 'loss');
}

export function confetti(container) {
  for (let i = 0; i < 40; i++) {
    const e = document.createElement('div');
    e.className = 'ember';
    e.style.left = (5 + Math.random() * 90) + '%';
    e.style.bottom = (Math.random() * 20) + 'px';
    e.style.animationDelay = (Math.random() * 2) + 's';
    e.style.animationDuration = (1.8 + Math.random() * 1.6) + 's';
    container.appendChild(e);
    setTimeout(() => e.remove(), 4500);
  }
}
