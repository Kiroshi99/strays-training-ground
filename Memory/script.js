const gameBoard = document.getElementById("game-board");

const pairsDisplay = document.getElementById("pairs");
const attemptsDisplay = document.getElementById("attempts");

const timerDisplay = document.getElementById("timer");

const progressFill = document.getElementById("progress-fill");

const resultScreen = document.getElementById("result-screen");
const resultTitle = document.getElementById("result-title");
const resultText = document.getElementById("result-text");

const startBtn = document.getElementById("start-btn");

const timeInput = document.getElementById("time-input");
const attemptsInput = document.getElementById("attempts-input");

/* ===== ICONS ===== */

const icons = [
  "🛡️",
  "⚙️",
  "👁️",
  "🔒",
  "⚡",
  "💛",
  "📶",
  "↩️"
];

let cards = [];

let flippedCards = [];

let matchedPairs = 0;

let attempts = 0;

let maxAttempts = 16;

let maxTime = 45;

let timeLeft = 45;

let timerInterval;

let lockBoard = false;

let gameActive = false;

/* ===== CREATE BOARD ===== */

function createBoard() {

  gameBoard.innerHTML = "";

  cards = [...icons, ...icons];

  cards.sort(() => Math.random() - 0.5);

  cards.forEach(icon => {

    const card = document.createElement("div");

    card.classList.add("card");

    card.dataset.icon = icon;

    /* ===== DEFAULT ? ===== */

    card.textContent = "?";

    card.addEventListener("click", () => flipCard(card));

    gameBoard.appendChild(card);

  });
}

/* ===== START GAME ===== */

function startGame() {

  resultScreen.style.display = "none";

  maxTime =
    Number(timeInput.value);

  maxAttempts =
    Number(attemptsInput.value);

  matchedPairs = 0;

  attempts = 0;

  flippedCards = [];

  lockBoard = false;

  gameActive = true;

  timeLeft = maxTime;

  updateUI();

  createBoard();

  clearInterval(timerInterval);

  timerInterval =
    setInterval(updateTimer, 100);
}

/* ===== FLIP ===== */

function flipCard(card) {

  if (!gameActive) return;

  if (lockBoard) return;

  if (card.classList.contains("flipped")) return;

  if (card.classList.contains("matched")) return;

  if (flippedCards.length >= 2) return;

  card.classList.add("flipped");

  card.textContent =
    card.dataset.icon;

  flippedCards.push(card);

  if (flippedCards.length === 2) {

    attempts++;

    updateUI();

    checkMatch();
  }
}

/* ===== MATCH ===== */

function checkMatch() {

  const [card1, card2] =
    flippedCards;

  if (
    card1.dataset.icon ===
    card2.dataset.icon
  ) {

    card1.classList.add("matched");

    card2.classList.add("matched");

    flippedCards = [];

    matchedPairs++;

    updateUI();

    if (matchedPairs === icons.length) {

      endGame(true);
    }

  } else {

    lockBoard = true;

    setTimeout(() => {

      card1.classList.remove("flipped");

      card2.classList.remove("flipped");

      card1.textContent = "?";

      card2.textContent = "?";

      flippedCards = [];

      lockBoard = false;

      if (attempts >= maxAttempts) {

        endGame(false);
      }

    }, 700);
  }

  if (
    attempts >= maxAttempts &&
    matchedPairs < icons.length
  ) {

    setTimeout(() => endGame(false), 750);
  }
}

/* ===== TIMER ===== */

function updateTimer() {

  if (!gameActive) return;

  timeLeft -= 0.1;

  if (timeLeft <= 0) {

    timeLeft = 0;

    updateUI();

    endGame(false);

    return;
  }

  updateUI();
}

/* ===== UI ===== */

function updateUI() {

  pairsDisplay.textContent =
    `${matchedPairs} / ${icons.length}`;

  attemptsDisplay.textContent =
    `${attempts} / ${maxAttempts}`;

  timerDisplay.textContent =
    `Time: ${timeLeft.toFixed(1)}s`;

  const percentage =
    (timeLeft / maxTime) * 100;

  progressFill.style.width =
    `${percentage}%`;
}

/* ===== END ===== */

function endGame(success) {

  gameActive = false;

  clearInterval(timerInterval);

  resultScreen.style.display =
    "flex";

  if (success) {

    resultTitle.textContent =
      "ACCESS GRANTED";

    resultTitle.style.color =
      "#00ff99";

    resultText.textContent =
      "System successfully breached.";

  } else {

    resultTitle.textContent =
      "ACCESS DENIED";

    resultTitle.style.color =
      "#ff3366";

    resultText.textContent =
      "Memory trace failed.";
  }
}

/* ===== RESTART ===== */

function restartGame() {

  startGame();
}

/* ===== START BUTTON ===== */

startBtn.addEventListener(
  "click",
  startGame
);

/* ===== CREATE INITIAL ? BOARD ===== */

createBoard();

updateUI();