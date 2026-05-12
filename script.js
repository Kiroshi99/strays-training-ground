const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const timerDisplay = document.getElementById("timer");
const gameOverScreen = document.getElementById("game-over-screen");
const finalTime = document.getElementById("final-time");
const statusText = document.getElementById("status");

canvas.width = 600;
canvas.height = 600;

canvas.style.cursor = "none";

let dot;
let virtualCursor = { x: 300, y: 300 };

let isCursorInside = false;
let elapsedTime = 0;
let gameOver = false;
let gameStarted = false;
let nextMovementChange = 0;
let animationId = null;

function getRandomSpeed() {
  const minSpeed = 0.25;
  const maxSpeed = 0.66;

  return (
    (Math.random() * (maxSpeed - minSpeed) + minSpeed) *
    (Math.random() < 0.5 ? -1 : 1)
  );
}

function setNextMovementChange() {
  nextMovementChange = Date.now() + (Math.random() * 5000 + 5000);
}

function randomizeMovement() {
  dot.dx = getRandomSpeed();
  dot.dy = getRandomSpeed();
  setNextMovementChange();
}

function startGame() {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  dot = {
    x: canvas.width / 2,
    y: canvas.height / 2,

    radius: 32,
    radiusChange: 0.03,
    minRadius: 26,
    maxRadius: 42,

    dx: getRandomSpeed(),
    dy: getRandomSpeed(),

    startTime: Date.now(),
    initialDelay: 2500
  };

  virtualCursor.x = dot.x;
  virtualCursor.y = dot.y;

  isCursorInside = true;
  elapsedTime = 0;
  gameOver = false;
  gameStarted = true;

  setNextMovementChange();

  gameOverScreen.style.display = "none";
  statusText.innerHTML = `<span id="status-light"></span>SIGNAL LOCKED`;

  gameLoop();
}

function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgGradient.addColorStop(0, "#020617");
  bgGradient.addColorStop(0.5, "#08111f");
  bgGradient.addColorStop(1, "#000000");

  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(0,255,255,0.07)";
  ctx.lineWidth = 1;

  for (let x = 0; x <= canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawDot() {
  const pulse = Math.sin(Date.now() / 220) * 4;

  const glow = ctx.createRadialGradient(
    dot.x,
    dot.y,
    dot.radius * 0.2,
    dot.x,
    dot.y,
    dot.radius + 30 + pulse
  );

  glow.addColorStop(0, "rgba(255,255,255,0.95)");
  glow.addColorStop(0.25, "rgba(0,255,255,0.9)");
  glow.addColorStop(0.55, "rgba(255,0,255,0.35)");
  glow.addColorStop(1, "rgba(0,255,153,0)");

  ctx.beginPath();
  ctx.arc(dot.x, dot.y, dot.radius + 30 + pulse, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  const orbGradient = ctx.createLinearGradient(
    dot.x - dot.radius,
    dot.y - dot.radius,
    dot.x + dot.radius,
    dot.y + dot.radius
  );

  orbGradient.addColorStop(0, "#ff00ff");
  orbGradient.addColorStop(0.5, "#00d4ff");
  orbGradient.addColorStop(1, "#00ff99");

  ctx.beginPath();
  ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
  ctx.fillStyle = orbGradient;
  ctx.fill();

  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.stroke();
}

function drawVirtualCursor() {
  ctx.beginPath();
  ctx.arc(virtualCursor.x, virtualCursor.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();

  ctx.strokeStyle = "#00ffff";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function updateDotPosition() {
  if (Date.now() - dot.startTime <= dot.initialDelay) {
    return;
  }

  statusText.innerHTML = `<span id="status-light"></span>SIGNAL MOVING`;

  if (Date.now() >= nextMovementChange) {
    randomizeMovement();
  }

  dot.x += dot.dx;
  dot.y += dot.dy;

  if (dot.x + dot.radius > canvas.width) {
    dot.x = canvas.width - dot.radius;
    dot.dx = -Math.abs(dot.dx);
  }

  if (dot.x - dot.radius < 0) {
    dot.x = dot.radius;
    dot.dx = Math.abs(dot.dx);
  }

  if (dot.y + dot.radius > canvas.height) {
    dot.y = canvas.height - dot.radius;
    dot.dy = -Math.abs(dot.dy);
  }

  if (dot.y - dot.radius < 0) {
    dot.y = dot.radius;
    dot.dy = Math.abs(dot.dy);
  }

  dot.radius += dot.radiusChange;

  if (dot.radius > dot.maxRadius || dot.radius < dot.minRadius) {
    dot.radiusChange = -dot.radiusChange;
  }
}

function checkCollision() {
  if (gameOver || !gameStarted) return;

  const distance = Math.sqrt(
    (virtualCursor.x - dot.x) ** 2 +
    (virtualCursor.y - dot.y) ** 2
  );

  if (distance > dot.radius) {
    endGame();
  }
}

document.addEventListener("mousemove", event => {
  if (!gameStarted || gameOver) return;

  virtualCursor.x += event.movementX;
  virtualCursor.y += event.movementY;

  virtualCursor.x = Math.max(0, Math.min(canvas.width, virtualCursor.x));
  virtualCursor.y = Math.max(0, Math.min(canvas.height, virtualCursor.y));

  checkCollision();
});

function gameLoop() {
  if (gameOver) return;

  const rawTime =
    (Date.now() - dot.startTime - dot.initialDelay) / 1000;

  elapsedTime = Math.max(0, rawTime);

  timerDisplay.textContent = `Time: ${elapsedTime.toFixed(1)}s`;

  drawBackground();
  drawDot();
  drawVirtualCursor();
  updateDotPosition();
  checkCollision();

  animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
  gameOver = true;
  gameStarted = false;

  if (document.pointerLockElement) {
    document.exitPointerLock();
  }

  finalTime.textContent =
    `You survived for ${elapsedTime.toFixed(1)} seconds.`;

  gameOverScreen.style.display = "flex";
}

function restartGame() {
  showStartOverlay();
}

function showStartOverlay() {
  gameOverScreen.style.display = "none";

  const oldOverlay = document.getElementById("start-overlay");
  if (oldOverlay) oldOverlay.remove();

  const startOverlay = document.createElement("div");
  startOverlay.id = "start-overlay";
  startOverlay.innerHTML = `<h1>CLICK TO START</h1>`;

  startOverlay.style.position = "fixed";
  startOverlay.style.inset = "0";
  startOverlay.style.display = "flex";
  startOverlay.style.justifyContent = "center";
  startOverlay.style.alignItems = "center";
  startOverlay.style.background = "rgba(2,6,18,0.96)";
  startOverlay.style.zIndex = "9999";
  startOverlay.style.cursor = "pointer";
  startOverlay.style.fontSize = "38px";
  startOverlay.style.fontWeight = "bold";
  startOverlay.style.color = "white";
  startOverlay.style.textShadow =
    "0 0 15px #ff00ff, 0 0 25px #00ffff";

  document.body.appendChild(startOverlay);

  startOverlay.addEventListener("click", () => {
    canvas.requestPointerLock();

    startOverlay.remove();

    startGame();
  });
}

showStartOverlay();