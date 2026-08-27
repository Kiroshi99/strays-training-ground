const target = document.getElementById("target");
const gameArea = document.getElementById("game-area");
const hitsText = document.getElementById("hits");
const missedText = document.getElementById("missed");
const message = document.getElementById("message");
const progress = document.getElementById("progress");
const startBtn = document.getElementById("start-btn");

const resultBox = document.createElement("div");
resultBox.id = "result-box";
gameArea.appendChild(resultBox);

// Tuned to feel progressively harder without relying on invisible hitboxes.
// target lifetime is the reaction window; the visible target and clickable
// target shrink together because the click handler lives on #target itself.
const difficulties = {
  easy: {
    gameTime: 35,
    dotTime: 1100,
    shrinkTime: 1100,
    maxHits: 15,
    maxMissed: 3,
    targetSize: 55,
    spawnDelay: 220
  },

  medium: {
    gameTime: 28,
    dotTime: 850,
    shrinkTime: 850,
    maxHits: 15,
    maxMissed: 3,
    targetSize: 55,
    spawnDelay: 180
  },

  hard: {
    gameTime: 24,
    dotTime: 650,
    shrinkTime: 650,
    maxHits: 15,
    maxMissed: 3,
    targetSize: 55,
    spawnDelay: 150
  },

  extreme: {
    gameTime: 22,
    dotTime: 500,
    shrinkTime: 500,
    maxHits: 15,
    maxMissed: 3,
    targetSize: 55,
    spawnDelay: 120
  }
};

let currentDifficulty = "medium";

let hits = 0;
let missed = 0;
let timeLeft = difficulties[currentDifficulty].gameTime;

let gameTime = difficulties[currentDifficulty].gameTime;
let dotTime = difficulties[currentDifficulty].dotTime;
let shrinkTime = difficulties[currentDifficulty].shrinkTime;
let maxHits = difficulties[currentDifficulty].maxHits;
let maxMissed = difficulties[currentDifficulty].maxMissed;
let targetSize = difficulties[currentDifficulty].targetSize;
let spawnDelay = difficulties[currentDifficulty].spawnDelay;

let gameTimer;
let dotTimeout;
let shrinkAnimation;
let spawnTimeout;

let gameRunning = false;
let clickedLock = false;

startBtn.addEventListener("click", startGame);

// Only the actual target is clickable. CSS transforms affect hit testing,
// so as the target shrinks, the clickable area shrinks with it.
target.addEventListener("click", event => {
  event.stopPropagation();
  hitTarget();
});

document.querySelectorAll(".difficulty-btn").forEach(button => {
  button.addEventListener("click", () => {
    if (gameRunning) return;

    document.querySelectorAll(".difficulty-btn").forEach(btn => {
      btn.classList.remove("active");
    });

    button.classList.add("active");
    currentDifficulty = button.dataset.difficulty;
    applyDifficulty(currentDifficulty);

    hits = 0;
    missed = 0;
    timeLeft = gameTime;

    updateCounters();
    message.textContent = `Difficulty selected: ${currentDifficulty.toUpperCase()}`;

    resultBox.className = "";
    resultBox.style.display = "none";

    progress.style.transition = "none";
    progress.style.width = "100%";
  });
});

function applyDifficulty(name) {
  const config = difficulties[name];

  gameTime = config.gameTime;
  dotTime = config.dotTime;
  shrinkTime = config.shrinkTime;
  maxHits = config.maxHits;
  maxMissed = config.maxMissed;
  targetSize = config.targetSize;
  spawnDelay = config.spawnDelay;
}

function updateCounters() {
  hitsText.textContent = `HITS: ${hits}/${maxHits}`;
  missedText.textContent = `MISSED: ${missed}/${maxMissed}`;
}

function startGame() {
  clearGameTimers();
  applyDifficulty(currentDifficulty);

  hits = 0;
  missed = 0;
  timeLeft = gameTime;

  gameRunning = true;
  clickedLock = false;

  updateCounters();
  message.textContent = "Click the targets before they disappear!";

  resultBox.className = "";
  resultBox.style.display = "none";

  startBtn.style.display = "none";

  progress.style.transition = "none";
  progress.style.width = "100%";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      progress.style.transition = `width ${gameTime}s linear`;
      progress.style.width = "0%";
    });
  });

  startGameTimer();
  spawnTarget();
}

function startGameTimer() {
  clearInterval(gameTimer);

  gameTimer = setInterval(() => {
    timeLeft--;

    if (timeLeft <= 0) {
      endGame(false);
    }
  }, 1000);
}

function spawnTarget() {
  if (!gameRunning) return;

  clearTimeout(dotTimeout);
  clearTimeout(spawnTimeout);

  if (shrinkAnimation) {
    shrinkAnimation.cancel();
    shrinkAnimation = null;
  }

  clickedLock = false;
  target.classList.remove("hit");

  const areaWidth = gameArea.clientWidth;
  const areaHeight = gameArea.clientHeight;
  const padding = 12;

  target.style.width = `${targetSize}px`;
  target.style.height = `${targetSize}px`;
  target.style.transform = "scale(1)";

  const maxX = Math.max(padding, areaWidth - targetSize - padding);
  const maxY = Math.max(padding, areaHeight - targetSize - padding);
  const x = padding + Math.random() * Math.max(0, maxX - padding);
  const y = padding + Math.random() * Math.max(0, maxY - padding);

  target.style.left = `${x}px`;
  target.style.top = `${y}px`;
  target.style.display = "block";

  // Shrink the rendered element itself. The browser also shrinks its
  // hit-tested area, so there is no hidden click bonus around the dot.
  shrinkAnimation = target.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(0.25)" }
    ],
    {
      duration: shrinkTime,
      easing: "linear",
      fill: "forwards"
    }
  );

  dotTimeout = setTimeout(() => {
    if (!gameRunning || clickedLock) return;

    missed++;
    updateCounters();

    target.style.display = "none";

    if (missed >= maxMissed) {
      endGame(false);
    } else {
      spawnTimeout = setTimeout(spawnTarget, spawnDelay);
    }
  }, dotTime);
}

function hitTarget() {
  if (!gameRunning || clickedLock || target.style.display === "none") return;

  clickedLock = true;
  clearTimeout(dotTimeout);

  if (shrinkAnimation) {
    shrinkAnimation.cancel();
    shrinkAnimation = null;
  }

  hits++;
  updateCounters();

  target.style.transform = "scale(1)";
  target.classList.add("hit");

  setTimeout(() => {
    target.style.display = "none";
    target.classList.remove("hit");

    if (hits >= maxHits) {
      endGame(true);
    } else if (gameRunning) {
      spawnTimeout = setTimeout(spawnTarget, spawnDelay);
    }
  }, 110);
}

function clearGameTimers() {
  clearInterval(gameTimer);
  clearTimeout(dotTimeout);
  clearTimeout(spawnTimeout);

  if (shrinkAnimation) {
    shrinkAnimation.cancel();
    shrinkAnimation = null;
  }
}

function endGame(won) {
  if (!gameRunning) return;

  gameRunning = false;
  clickedLock = false;

  clearGameTimers();

  target.style.display = "none";
  target.style.transform = "scale(1)";
  target.classList.remove("hit");

  progress.style.transition = "none";

  if (won) {
    resultBox.className = "result-success";
    resultBox.innerHTML = `
      TARGET<br>
      ACQUIRED!
      <small>${hits}/${maxHits} HITS</small>
    `;
  } else {
    resultBox.className = "result-failed";
    resultBox.innerHTML = `
      TARGET<br>
      FAILED!
      <small>${hits}/${maxHits} HITS</small>
    `;
  }

  message.textContent = "";

  startBtn.textContent = "PLAY AGAIN";
  startBtn.style.display = "block";
}
