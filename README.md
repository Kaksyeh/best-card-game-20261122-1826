# Ember Court — rob the Baron of his last ember

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/Kaksyeh/best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/Kaksyeh/best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

**Ember Court** is an original turn-based card duel for the make.fun best-card-game bounty: you are the Ember Warden, duelling the Ash Baron, an AI who shows his intent before he strikes. Both start at 30 life. Each turn you gain ember (growing by 1, up to 10), draw a card, and play cards from your hand of 5 — click a card or press 1–5, Space ends the turn.

Four suits, told apart by colour AND shape: Flame (red flame — damage), Frost (blue snowflake — shield), Leaf (green leaf — heal), Stone (grey mountain — lasting armour). Cards combine: Flame after Frost deals double damage (kindled), Leaf after Stone draws an extra card. The Baron's hand stays face-down; his played card is revealed with a visible intent icon before it resolves, so you can read him and counter.

## Run it

Open `game/index.html` in a desktop browser, or serve the folder and visit it. No build step, no network — static files only.

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` to the output and writes `dossier.json` via the kit's `buildDossier`.
