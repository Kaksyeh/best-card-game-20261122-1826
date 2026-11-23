// Card definitions, deck building and drawing. One job: know the cards.
export const SUITS = {
  flame: { name: 'Flame', color: '#c22', verb: 'burns', desc: 'Deals damage' },
  frost: { name: 'Frost', color: '#2a7fd8', verb: 'shields', desc: 'Blocks the next hit' },
  leaf:  { name: 'Leaf',  color: '#2a8a3a', verb: 'mends',  desc: 'Heals life' },
  stone: { name: 'Stone', color: '#777',  verb: 'fortifies', desc: 'Lasting armour' },
};

// [id, suit, name, cost, value]
const CARD_DEFS = [
  ['spark',   'flame', 'Ember Spark', 1, 3],
  ['lash',    'flame', 'Flame Lash',  2, 5],
  ['brand',   'flame', 'Firebrand',   3, 8],
  ['wildfire','flame', 'Wildfire',    4, 11],
  ['veil',    'frost', 'Frost Veil',  1, 4],
  ['ward',    'frost', 'Ice Ward',    2, 7],
  ['glacier', 'frost', 'Glacier Wall',3, 10],
  ['spring',  'leaf',  'Spring Leaf', 1, 3],
  ['verdant', 'leaf',  'Verdant Mend',2, 5],
  ['bloom',   'leaf',  'Bloom',       3, 6],
  ['pebble',  'stone', 'Pebble Guard',1, 2],
  ['skin',    'stone', 'Stone Skin',  2, 3],
  ['mountain','stone', 'Mountain Hold',3, 5],
];

export function makeCard(def, uid) {
  return { uid, id: def[0], suit: def[1], name: def[2], cost: def[3], value: def[4] };
}

export function buildDeck() {
  const deck = [];
  let uid = 0;
  for (const def of CARD_DEFS) {
    // Three copies of each Flame: the duel is a race, and a hand full of
    // Stone with no burn in sight stalls it. 12 burn of 30 cards (40%)
    // keeps every hand threatening while the other suits stay at two.
    const copies = def[1] === 'flame' ? 3 : 2;
    for (let k = 0; k < copies; k++) deck.push(makeCard(def, def[0] + k + (uid++)));
  }
  return shuffle(deck);
}

export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Draw up to n cards from deck into hand (hand cap 7); reshuffles discard when empty.
export function drawCards(fighter, n) {
  let drawn = 0;
  for (let i = 0; i < n; i++) {
    if (fighter.hand.length >= 7) break;
    if (fighter.deck.length === 0) {
      if (fighter.discard.length === 0) break;
      fighter.deck = shuffle(fighter.discard.splice(0));
    }
    fighter.hand.push(fighter.deck.pop());
    drawn++;
  }
  return drawn;
}
