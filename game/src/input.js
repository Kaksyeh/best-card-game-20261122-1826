// Keyboard + mouse input. One job: turn presses into game actions.
export function bindInput(hooks) {
  document.getElementById('startBtn').addEventListener('click', hooks.onStart);
  document.getElementById('winAgainBtn').addEventListener('click', hooks.onRestart);
  document.getElementById('lossRetryBtn').addEventListener('click', hooks.onRestart);
  document.getElementById('restartBtn').addEventListener('click', hooks.onRestart);
  document.getElementById('endBtn').addEventListener('click', hooks.onEndTurn);
  document.getElementById('muteBtn').addEventListener('click', () => {
    const muted = hooks.onMute();
    document.getElementById('muteBtn').textContent = muted ? 'SOUND: OFF' : 'SOUND: ON';
  });
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); hooks.onEndTurn(); }
    else if (e.key >= '1' && e.key <= '5') hooks.onPlayIndex(Number(e.key) - 1);
    else if (e.key === 'm' || e.key === 'M') document.getElementById('muteBtn').click();
    else if (e.key === 'r' || e.key === 'R') hooks.onRestart();
  });
}
