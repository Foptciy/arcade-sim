const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const creditsEl = document.querySelector("#credits");
const levelEl = document.querySelector("#level");
const bestEl = document.querySelector("#best");
const statusEl = document.querySelector("#status");
const startButton = document.querySelector("#startButton");

const keys = new Set();
const state = {
  running: false,
  paused: false,
  score: 0,
  credits: 3,
  level: 1,
  best: Number(localStorage.getItem("arcade-sim-best") || 0),
  playerX: canvas.width / 2,
  pulse: 0,
  objects: [],
  lastTime: 0,
  spawnTimer: 0,
};

bestEl.textContent = String(state.best).padStart(6, "0");

function setText(element, value, width = 2) { element.textContent = String(value).padStart(width, "0"); }
function updateHud() { setText(scoreEl, state.score, 6); setText(creditsEl, state.credits); setText(levelEl, state.level); setText(bestEl, state.best, 6); }

function resetRound() {
  state.running = true;
  state.paused = false;
  state.score = 0;
  state.level = 1;
  state.playerX = canvas.width / 2;
  state.pulse = 0;
  state.objects = [];
  state.spawnTimer = 0;
  statusEl.textContent = "ROUND ACTIVE // COLLECT THE CREDITS";
  startButton.textContent = "Restart game";
  updateHud();
}

function spawnObject() {
  const good = Math.random() > .24;
  state.objects.push({
    x: 26 + Math.random() * (canvas.width - 52),
    y: -22,
    size: good ? 9 : 12,
    speed: 80 + state.level * 10 + Math.random() * 55,
    good,
    spin: Math.random() * Math.PI,
  });
}

function startPulse() {
  if (!state.running || state.paused) return;
  state.pulse = 1;
  const cleared = state.objects.filter((object) => Math.abs(object.x - state.playerX) < 58 && object.y > canvas.height - 150);
  cleared.forEach((object) => { object.y = canvas.height + 100; if (object.good) state.score += 25; });
}

function endRound() {
  state.running = false;
  state.credits = Math.max(0, state.credits - 1);
  if (state.score > state.best) { state.best = state.score; localStorage.setItem("arcade-sim-best", String(state.best)); }
  statusEl.textContent = state.credits ? "GAME OVER // INSERT COIN TO RETRY" : "OUT OF CREDITS // REFRESH TO RECHARGE";
  startButton.textContent = state.credits ? "Play again" : "Refresh credits";
  updateHud();
}

function update(delta) {
  const direction = (keys.has("ArrowRight") || keys.has("d") ? 1 : 0) - (keys.has("ArrowLeft") || keys.has("a") ? 1 : 0);
  state.playerX = Math.max(28, Math.min(canvas.width - 28, state.playerX + direction * 330 * delta));
  state.pulse = Math.max(0, state.pulse - delta * 2.6);
  state.spawnTimer -= delta;
  if (state.spawnTimer <= 0) { spawnObject(); state.spawnTimer = Math.max(.25, .78 - state.level * .045); }
  for (const object of state.objects) { object.y += object.speed * delta; object.spin += delta * 4; }
  for (const object of state.objects) {
    if (object.y < canvas.height - 38 || object.y > canvas.height - 10) continue;
    if (Math.abs(object.x - state.playerX) < object.size + 23) {
      if (object.good) { state.score += 10; } else { endRound(); return; }
      object.y = canvas.height + 80;
    }
  }
  state.objects = state.objects.filter((object) => object.y < canvas.height + 40);
  const nextLevel = Math.floor(state.score / 100) + 1;
  if (nextLevel !== state.level) { state.level = nextLevel; statusEl.textContent = `LEVEL ${state.level} // KEEP THE ROOM ALIVE`; }
  updateHud();
}

function draw() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#090d26"); gradient.addColorStop(1, "#120b25");
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(80,245,222,.08)"; ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
  for (let y = 0; y < canvas.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
  for (const object of state.objects) {
    ctx.save(); ctx.translate(object.x, object.y); ctx.rotate(object.spin);
    ctx.shadowBlur = 18; ctx.shadowColor = object.good ? "#ffe682" : "#ff4fa3"; ctx.fillStyle = object.good ? "#ffe682" : "#ff4fa3";
    ctx.beginPath(); ctx.moveTo(0, -object.size); ctx.lineTo(object.size, 0); ctx.lineTo(0, object.size); ctx.lineTo(-object.size, 0); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  const y = canvas.height - 32;
  ctx.shadowBlur = 20; ctx.shadowColor = "#50f5de"; ctx.fillStyle = "#50f5de";
  ctx.beginPath(); ctx.moveTo(state.playerX, y - 25); ctx.lineTo(state.playerX + 22, y + 18); ctx.lineTo(state.playerX, y + 10); ctx.lineTo(state.playerX - 22, y + 18); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = "rgba(80,245,222,.18)"; ctx.fillRect(state.playerX - 4, y + 18, 8, 32);
  if (state.pulse > 0) { ctx.strokeStyle = `rgba(255,79,163,${state.pulse})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(state.playerX, y, 42 + (1 - state.pulse) * 40, 0, Math.PI * 2); ctx.stroke(); }
  if (!state.running || state.paused) { ctx.fillStyle = "rgba(7,10,24,.62)"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = "#f4f7ff"; ctx.textAlign = "center"; ctx.font = "700 22px Trebuchet MS"; ctx.fillText(state.paused ? "PAUSED" : "PRESS START", canvas.width / 2, canvas.height / 2); }
}

function frame(time) {
  const delta = Math.min(.05, (time - state.lastTime) / 1000 || 0);
  state.lastTime = time;
  if (state.running && !state.paused) update(delta);
  draw(); requestAnimationFrame(frame);
}

window.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keys.add(key);
  if (["ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();
  if (event.key === " ") startPulse();
  if (key === "p" && state.running) { state.paused = !state.paused; statusEl.textContent = state.paused ? "PAUSED // PRESS P TO RESUME" : "ROUND ACTIVE // COLLECT THE CREDITS"; }
});
window.addEventListener("keyup", (event) => keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key));
startButton.addEventListener("click", () => { if (!state.credits) { state.credits = 3; updateHud(); } resetRound(); });
updateHud(); requestAnimationFrame(frame);

