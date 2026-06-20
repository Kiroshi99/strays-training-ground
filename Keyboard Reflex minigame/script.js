// ========================================
// GET HTML ELEMENTS
// ========================================

const targetBar = document.getElementById("target-bar");
const lettersArea = document.getElementById("letters-area");
const playButton = document.getElementById("play-button");
const restartButton = document.getElementById("restart-button");
const loadingScreen = document.getElementById("loading-screen");
const scoreDisplay = document.getElementById("score-display");
const timerDisplay = document.getElementById("timer-display");


// ========================================
// GAME VARIABLES
// ========================================

let gameRunning = false;
let gameOver = false;
let countdownActive = false;

let letterInterval;
let timerInterval;
let countdownTimeout;

let score = 0;
let startTime = 0;
let targetColor = "";


// ========================================
// GAME DATA
// ========================================

const keys = ["A", "S", "D", "F", "H", "J", "K", "L"];
const colors = ["green", "orange", "pink"];


// ========================================
// DIFFICULTY SETTINGS
// ========================================

const difficultySettings = {
  easy: {
    speed: 2500,
    spawnRate: 1200,
  },

  hard: {
    speed: 850,
    spawnRate: 700,
  },

  extreme: {
    speed: 650,
    spawnRate: 480,
  },
};

let currentDifficulty = difficultySettings.easy;


// ========================================
// DIFFICULTY BUTTONS
// ========================================

document.querySelectorAll(".difficulty-btn").forEach((btn) => {
  btn.addEventListener("click", () => {

    // Cannot change difficulty during a game or countdown
    if (gameRunning || countdownActive) return;

    document.querySelectorAll(".difficulty-btn").forEach((b) => {
      b.classList.remove("active");
    });

    btn.classList.add("active");

    currentDifficulty = difficultySettings[btn.dataset.difficulty];
  });
});


// ========================================
// PLAY / RESTART BUTTONS
// ========================================

playButton.addEventListener("click", () => {
  showStartCountdown();
});

restartButton.addEventListener("click", () => {
  showStartCountdown();
});


// ========================================
// 3-SECOND START NOTIFICATION
// ========================================

function showStartCountdown() {

  // Prevent duplicate countdowns
  if (gameRunning || countdownActive) return;

  countdownActive = true;
  gameOver = false;

  // Hide buttons during countdown
  playButton.style.display = "none";
  restartButton.style.display = "none";

  // Show notification
  loadingScreen.innerHTML = `
    <div class="game-over-message">
      <h2>GET READY</h2>
      <p>Starting in 3 seconds...</p>
    </div>
  `;

  loadingScreen.style.display = "block";

  // Start after 3 seconds
  countdownTimeout = setTimeout(() => {
    countdownActive = false;
    loadingScreen.style.display = "none";
    startGame();
  }, 3000);
}


// ========================================
// START GAME
// ========================================

function startGame() {

  clearInterval(letterInterval);
  clearInterval(timerInterval);

  lettersArea.innerHTML = "";

  score = 0;
  gameRunning = true;
  gameOver = false;
  countdownActive = false;

  updateScoreDisplay();

  timerDisplay.textContent = "Time: 0s";

  startTime = Date.now();

  restartButton.style.display = "none";
  playButton.style.display = "none";

  generateTarget();

  createLetter();

  letterInterval = setInterval(() => {
    createLetter();
  }, currentDifficulty.spawnRate);

  timerInterval = setInterval(() => {
    updateTimer();
  }, 1000);
}


// ========================================
// GENERATE TARGET COLOUR
// ========================================

function generateTarget() {
  targetColor = colors[Math.floor(Math.random() * colors.length)];
  targetBar.style.background = targetColor;
}


// ========================================
// CREATE LETTER
// ========================================

function createLetter() {

  if (!gameRunning) return;

  const letter = document.createElement("div");

  const key = keys[Math.floor(Math.random() * keys.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];

  letter.className = "letter";
  letter.textContent = key;
  letter.style.color = color;

  letter.style.left = `${Math.random() * 85}%`;
  letter.style.top = `${lettersArea.clientHeight}px`;

  letter.dataset.color = color;
  letter.dataset.handled = "false";
  letter.dataset.mustHit = "false";

  lettersArea.appendChild(letter);

  let start = null;

  function animate(timestamp) {

    if (!gameRunning || !letter.parentElement) return;

    if (!start) start = timestamp;

    const progress =
      (timestamp - start) / currentDifficulty.speed;

    const gameHeight = lettersArea.clientHeight;

    const y =
      gameHeight - progress * (gameHeight + 100);

    letter.style.top = `${y}px`;

    const letterRect = letter.getBoundingClientRect();
    const targetRect = targetBar.getBoundingClientRect();

    const insideBar =
      letterRect.bottom >= targetRect.top &&
      letterRect.top <= targetRect.bottom;

    const leftBar =
      letterRect.bottom < targetRect.top;

    // Correct-coloured letter entered the target bar
    if (
      insideBar &&
      letter.dataset.color === targetColor &&
      letter.dataset.handled === "false"
    ) {
      letter.dataset.mustHit = "true";
    }

    // Correct letter passed without being pressed
    if (
      leftBar &&
      letter.dataset.mustHit === "true" &&
      letter.dataset.handled === "false"
    ) {
      gameFail(
        `You missed a correct letter: ${letter.textContent}`
      );

      return;
    }

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      if (letter.parentElement) {
        letter.remove();
      }
    }
  }

  requestAnimationFrame(animate);
}


// ========================================
// KEYBOARD INPUT
// ========================================

function handleKeyPress(e) {

  // Restart after failing with Space or Enter
  if (!gameRunning) {

    if (
      gameOver &&
      !countdownActive &&
      (e.code === "Space" || e.key === "Enter")
    ) {
      e.preventDefault();
      showStartCountdown();
    }

    return;
  }

  const pressedKey = e.key.toUpperCase();

  // Ignore anything except game keys
  if (!keys.includes(pressedKey)) return;

  const letters = Array.from(
    document.querySelectorAll(".letter")
  );

  const targetRect = targetBar.getBoundingClientRect();

  for (const letter of letters) {

    const rect = letter.getBoundingClientRect();

    const insideBar =
      rect.bottom >= targetRect.top &&
      rect.top <= targetRect.bottom;

    // Correct key, colour, and timing
    if (
      letter.textContent === pressedKey &&
      letter.dataset.color === targetColor &&
      insideBar &&
      letter.dataset.handled === "false"
    ) {
      letter.dataset.handled = "true";

      score++;
      updateScoreDisplay();

      generateTarget();

      letter.classList.add("fade-out");

      setTimeout(() => {
        if (letter.parentElement) {
          letter.remove();
        }
      }, 250);

      return;
    }
  }

  // Wrong letter or wrong timing
  gameFail("Wrong key or bad timing.");
}


// ========================================
// SCORE / TIMER
// ========================================

function updateScoreDisplay() {
  scoreDisplay.textContent = `Score: ${score}`;
}

function updateTimer() {
  const elapsed =
    Math.floor((Date.now() - startTime) / 1000);

  timerDisplay.textContent = `Time: ${elapsed}s`;
}


// ========================================
// GAME OVER
// ========================================

function gameFail(reason) {

  if (!gameRunning) return;

  gameRunning = false;
  gameOver = true;
  countdownActive = false;

  clearInterval(letterInterval);
  clearInterval(timerInterval);
  clearTimeout(countdownTimeout);

  lettersArea.innerHTML = "";

  restartButton.style.display = "inline-block";
  playButton.style.display = "inline-block";

  loadingScreen.innerHTML = `
    <div class="game-over-message">
      <h2>GAME OVER</h2>
      <p>${reason}</p>
      <p>Score: <b>${score}</b></p>
      <p>Press <b>SPACE</b> or <b>ENTER</b> to play again</p>
    </div>
  `;

  loadingScreen.style.display = "block";
}


// ========================================
// KEYBOARD LISTENER
// ========================================

document.addEventListener("keydown", handleKeyPress);
