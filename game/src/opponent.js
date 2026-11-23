// The Ash Baron's brain. One job: pick sensible plays the player can read and counter.
// Heuristic: heal when hurt, fortify when low, attack when ahead, block a big threat.
export function choosePlays(ai, player) {
  const plays = [];
  let ember = ai.ember;
  const hand = [...ai.hand];
  const affordable = (suit) => hand.filter(c => c.suit === suit && c.cost <= ember);
  const best = (cards) => cards.sort((a, b) => b.value - a.value || a.cost - b.cost)[0];

  // One card a turn: the Baron is a duellist, not a flood. Two cards a turn
  // let him out-heal and out-shield the player's whole hand, so no duel
  // ever ended. One card keeps his intent readable and the duel winnable.
  // Above 12 life the Baron ONLY attacks: letting him shield or fortify at
  // full life walled every flame the player played (playtests stalled at
  // 31 turns with the Baron at 25+), so a healthy Baron spends his ember
  // on burn or holds it.
  let pick = null;
  if (ai.life <= 8) {
    pick = best(affordable('leaf')) || best(affordable('stone'));
  } else if (ai.life <= 12) {
    pick = best(affordable('stone')) || best(affordable('leaf'));
  } else {
    pick = best(affordable('flame'));
  }
  if (!pick) return plays;
  plays.push(pick);
  ember -= pick.cost;
  hand.splice(hand.indexOf(pick), 1);
  return plays;
}

// The intent the player sees before the Baron's cards resolve.
export function intentText(card) {
  if (!card) return '';
  const verbs = { flame: 'will BURN for', frost: 'will SHIELD for', leaf: 'will MEND for', stone: 'will FORTIFY for' };
  return `The Baron ${verbs[card.suit]} ${card.value}`;
}
