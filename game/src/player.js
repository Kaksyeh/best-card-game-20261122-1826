// Fighter state: life, ember, armour, shield, deck, hand, discard. One job: hold a duelist.
import { buildDeck, drawCards } from './deck.js';

export function createFighter(name) {
  return {
    name,
    life: 30, maxLife: 30,
    armor: 0, shield: 0,
    ember: 0, maxEmber: 0,
    deck: buildDeck(), hand: [], discard: [],
    lastPlayedSuit: null,
  };
}

export function startTurn(fighter, turn) {
  fighter.maxEmber = Math.min(turn, 10);
  fighter.ember = fighter.maxEmber;
  drawCards(fighter, 1);
}

export function dealOpeningHand(fighter) {
  drawCards(fighter, 5);
}

// Damage resolution: shield absorbs the next hit first (then is spent),
// lasting armour shaves every hit. Returns damage that reached life.
export function applyDamage(target, amount) {
  let blocked = 0;
  if (target.shield > 0 && amount > 0) {
    blocked = Math.min(target.shield, amount);
    amount -= blocked;
    target.shield = 0;
  }
  const soaked = Math.min(target.armor, amount);
  amount -= soaked;
  if (amount > 0) target.life = Math.max(0, target.life - amount);
  return { dealt: amount, blocked, soaked };
}

export function heal(fighter, amount) {
  const before = fighter.life;
  fighter.life = Math.min(fighter.maxLife, fighter.life + amount);
  return fighter.life - before;
}
