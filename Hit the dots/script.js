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

const redTarget = `
radial-gradient(circle,
  white 0%,
  white 6%,

  red 7%,
  red 20%,

  white 21%,
  white 26%,

  red 27%,
  red 55%,

  rgba(255, 0, 0, 0.65) 70%,
  rgba(255, 0, 0, 0.15) 100%
)`;

const greenTarget = `
radial-gradient(circle,
  white 0%,
  white 6%,

  #00ff66 7%,
  #00ff66 20%,

  white 21%,
  white 26%,

  #00ff66 27%,
  #00ff66 55%,

  rgba(0, 255, 102, 0.65) 70%,
  rgba(0, 255, 102, 0.15) 100%
)`;

const difficulties = {
  easy: {
    gameTime: 45,
    dotTime: 1000,
    shrinkTime: 1000,
    maxHits: 14,
    maxMissed: 3,
    targetSize: 50,
    clickBonus: 22
  },

  medium: {
    gameTime: 22,
    dotTime: 600,
    shrinkTime: 600,
    maxHits: 14,
    maxMissed: 3,
    targetSize: 48,
    clickBonus: 16
  },

  hard: {
    gameTime: 20,
    dotTime: 550,
    shrinkTime: 550,
    maxHits: 14,
    maxMissed: 3,
    targetSize: 48,
    clickBonus: 18
  },

  extreme: {
    gameTime: 18,
    dotTime: 400,
    shrinkTime: 400,
    maxHits: 14,
    maxMissed: 3,
    targetSize: 48,
    clickBonus: 16
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
let clickBonus = difficulties[currentDifficulty].clickBonus;

let gameTimer;
let dotTimeout;
let shrinkAnimation;

let gameRunning = false;
let clickedLock = false;

let targetCenterX = 0;
let targetCenterY = 0;

startBtn.addEventListener("click", startGame);
gameArea.addEventListener("click", checkHit);

document.querySelectorAll(".difficulty-btn").forEach(button => {
  button.addEventListener("click", () => {
    if (gameRunning) return;

    document.querySelectorAll(".difficulty-btn").forEach(btn => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    currentDifficulty = button.dataset.difficulty;

    gameTime = difficulties[currentDifficulty].gameTime;
    dotTime = difficulties[currentDifficulty].dotTime;
    shrinkTime = difficulties[currentDifficulty].shrinkTime;
    maxHits = difficulties[currentDifficulty].maxHits;
    maxMissed = difficulties[currentDifficulty].maxMissed;
    targetSize = difficulties[currentDifficulty].targetSize;
    clickBonus = difficulties[currentDifficulty].clickBonus;

    hits = 0;
    missed = 0;
    timeLeft = gameTime;

    hitsText.textContent = `HITS: ${hits}/${maxHits}`;
    missedText.textContent = `MISSED: ${missed}/${maxMissed}`;
    message.textContent = `Difficulty selected: ${currentDifficulty.toUpperCase()}`;

    resultBox.className = "";
    resultBox.style.display = "none";

    progress.style.transition = "none";
    progress.style.width = "100%";
  });
});

function startGame() {
  hits = 0;
  missed = 0;
  timeLeft = gameTime;

  gameRunning = true;
  clickedLock = false;

  hitsText.textContent = `HITS: ${hits}/${maxHits}`;
  missedText.textContent = `MISSED: ${missed}/${maxMissed}`;
  message.textContent = "Click the targets before they disappear!";

  resultBox.className = "";
  resultBox.style.display = "none";

  startBtn.style.display = "none";

  progress.style.transition = "none";
  progress.style.width = "100%";

  setTimeout(() => {
    progress.style.transition = `width ${gameTime}s linear`;
    progress.style.width = "0%";
  }, 20);

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

  if (shrinkAnimation) {
    shrinkAnimation.cancel();
  }

  clickedLock = false;

  const areaWidth = gameArea.clientWidth;
  const areaHeight = gameArea.clientHeight;

  target.style.width = `${targetSize}px`;
  target.style.height = `${targetSize}px`;
  target.style.borderRadius = "50%";
  target.style.overflow = "hidden";

  target.style.background = redTarget;
  target.style.backgroundSize = "100% 100%";
  target.style.backgroundPosition = "center";
  target.style.backgroundRepeat = "no-repeat";

  target.style.boxShadow = `
    0 0 8px #ff0000,
    0 0 18px #ff0000,
    0 0 35px rgba(255, 0, 0, 0.8)
  `;

  target.style.transform = "scale(1)";

  const x = Math.random() * (areaWidth - targetSize);
  const y = Math.random() * (areaHeight - targetSize);

  target.style.left = `${x}px`;
  target.style.top = `${y}px`;
  target.style.display = "block";

  targetCenterX = x + targetSize / 2;
  targetCenterY = y + targetSize / 2;

  setTimeout(() => {
    if (!gameRunning || clickedLock) return;

    shrinkAnimation = target.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(0.45)" }
      ],
      {
        duration: shrinkTime,
        easing: "linear",
        fill: "forwards"
      }
    );
  }, 20);

  dotTimeout = setTimeout(() => {
    if (!gameRunning || clickedLock) return;

    missed++;
    missedText.textContent = `MISSED: ${missed}/${maxMissed}`;

    target.style.display = "none";

    if (missed >= maxMissed) {
      endGame(false);
    } else {
      spawnTarget();
    }
  }, dotTime);
}

function checkHit(event) {
  if (!gameRunning || clickedLock) return;

  const rect = gameArea.getBoundingClientRect();

  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  const distance = Math.hypot(
    clickX - targetCenterX,
    clickY - targetCenterY
  );

  const clickRadius = targetSize / 2 + clickBonus;

  if (distance <= clickRadius) {
    hitTarget();
  }
}

function hitTarget() {
  if (!gameRunning || clickedLock) return;

  clickedLock = true;

  clearTimeout(dotTimeout);

  if (shrinkAnimation) {
    shrinkAnimation.cancel();
  }

  hits++;
  hitsText.textContent = `HITS: ${hits}/${maxHits}`;

  target.style.transform = "scale(1)";
  target.style.background = greenTarget;
  target.style.backgroundSize = "100% 100%";
  target.style.borderRadius = "50%";

  target.style.boxShadow = `
    0 0 8px #00ff66,
    0 0 18px #00ff66,
    0 0 35px rgba(0, 255, 102, 0.8)
  `;

  setTimeout(() => {
    target.style.display = "none";

    if (hits >= maxHits) {
      endGame(true);
    } else {
      spawnTarget();
    }
  }, 120);
}

function endGame(won) {
  gameRunning = false;
  clickedLock = false;

  clearInterval(gameTimer);
  clearTimeout(dotTimeout);

  if (shrinkAnimation) {
    shrinkAnimation.cancel();
  }

  target.style.display = "none";
  target.style.transform = "scale(1)";

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
