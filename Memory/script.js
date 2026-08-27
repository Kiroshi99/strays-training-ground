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
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14c1.66 0 3-1.34 3-3S8.66 8 7 8s-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm14-2l-4.18 4.18A3.01 3.01 0 0 1 17 14c0 1.66-1.34 3-3 3s-3-1.34-3-3c0-.34.06-.67.17-.97L9 14.83l-1.59-1.59L6 14.83 4.41 13.24l-1.59 1.59L1.24 13.24 7 7.47l1.41 1.41L10 7.29l4.54-4.54c.39-.39 1.02-.39 1.41 0l3.54 3.54c.39.39.39 1.02 0 1.41z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C7.58 3 4 4.79 4 7s3.58 4 8 4 8-1.79 8-4-3.58-4-8-4zM4 9v3c0 2.21 3.58 4 8 4s8-1.79 8-4V9c0 2.21-3.58 4-8 4s-8-1.79-8-4zm0 5v3c0 2.21 3.58 4 8 4s8-1.79 8-4v-3c0 2.21-3.58 4-8 4s-8-1.79-8-4z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h12v2h-2v2h2v2h-2v2h2v2h-2v2h2v2H6v-2h2v-2H6v-2h2v-2H6V8h2V6H6V4zm3 4v8h6V8H9zm1 1h4v6h-4V9z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 12h-4v-2h4v2zm0 4h-4v-2h4v2zm6-3.82c.6-.34 1-.96 1-1.68V9c0-1.1-.9-2-2-2h-1.18C17.14 5.77 15.72 5 14 5h-4c-1.72 0-3.14.77-3.82 2H5c-1.1 0-2 .9-2 2v1.5c0 .72.4 1.34 1 1.68V14c0 1.1.9 2 2 2h1v4h10v-4h1c1.1 0 2-.9 2-2v-1.82zM17 14H7v-4h10v4z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10zm-10-7l-4 4h3v2h2v-2h3l-4-4z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1C8.676 1 6 3.676 6 7h2c0-2.276 1.724-4 4-4s4 1.724 4 4v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 12c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>'
];

// 4x4 board = 8 matching pairs. Pick a fresh 8 icons each round.
const pairCount = 8;

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

  // Randomly choose 8 of the SVG icons, then duplicate them into pairs.
  const selectedIcons = [...icons]
    .sort(() => Math.random() - 0.5)
    .slice(0, pairCount);

  cards = [...selectedIcons, ...selectedIcons];

  cards.sort(() => Math.random() - 0.5);

  cards.forEach((icon, index) => {

    const card = document.createElement("div");

    card.classList.add("card");

    // Use an ID for matching and keep the SVG separately for rendering.
    const iconId = selectedIcons.indexOf(icon);
    card.dataset.iconId = String(iconId);
    card.dataset.iconSvg = icon;

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

  card.innerHTML =
    card.dataset.iconSvg;

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
    card1.dataset.iconId ===
    card2.dataset.iconId
  ) {

    card1.classList.add("matched");

    card2.classList.add("matched");

    flippedCards = [];

    matchedPairs++;

    updateUI();

    if (matchedPairs === pairCount) {

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
    matchedPairs < pairCount
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
    `${matchedPairs} / ${pairCount}`;

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
