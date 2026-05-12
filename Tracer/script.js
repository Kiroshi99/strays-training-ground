const gridBox = document.getElementById("grid-box");
const targetSequenceEl = document.getElementById("target-sequence");
const messageBox = document.getElementById("message-box");
const timerFill = document.getElementById("timer-fill");
const timeText = document.getElementById("time-text");
const successCountEl = document.getElementById("success-count");
const timeInput = document.getElementById("time-input");
const startBtn = document.getElementById("start-btn");

const ROWS = 8;
const COLS = 8;

const TARGET_LENGTH = 4;
const MOVE_INTERVAL = 1000;

let TIME_LIMIT = 20.0;

let grid = [];
let target = [];

let correctStart = 0;
let cursor = 0;
let selected = [];

let timeLeft = TIME_LIMIT;

let timer;
let moveTimer;

let gameOver = true;
let successCount = 0;

function randomDigit() {
  return Math.floor(Math.random() * 10);
}

function createTarget() {
  target = [];

  for (let i = 0; i < TARGET_LENGTH; i++) {
    target.push(randomDigit());
  }
}

function createGrid() {
  clearInterval(timer);
  clearInterval(moveTimer);

  gameOver = false;
  selected = [];

  createTarget();

  grid = Array.from({ length: ROWS * COLS }, randomDigit);

  correctStart = Math.floor(Math.random() * grid.length);

  const indexes = getSequenceIndexes(correctStart);

  for (let i = 0; i < target.length; i++) {
    grid[indexes[i]] = target[i];
  }

  cursor = 0;
  timeLeft = TIME_LIMIT;

  renderTarget();
  renderGrid();
  updateTimer();

  messageBox.textContent = "Find the START of the target sequence";

  timer = setInterval(() => {
    if (gameOver) return;

    timeLeft -= 0.1;

    if (timeLeft <= 0) {
      timeLeft = 0;
      loseGame();
    }

    updateTimer();
  }, 100);

  moveTimer = setInterval(() => {
    if (gameOver) return;

    moveNumbersLeft();
    renderGrid();
  }, MOVE_INTERVAL);
}

function renderTarget() {
  targetSequenceEl.innerHTML = "";

  target.forEach(number => {
    const span = document.createElement("span");
    span.textContent = number;
    targetSequenceEl.appendChild(span);
  });
}

function renderGrid() {
  gridBox.innerHTML = "";

  const preview = gameOver ? [] : getSequenceIndexes(cursor);

  grid.forEach((number, index) => {
    const cell = document.createElement("div");

    cell.className = "cell";
    cell.textContent = number;

    if (preview.includes(index)) {
      cell.classList.add("preview");
    }

    if (selected.includes(index)) {
      cell.classList.add("selected");
    }

    cell.addEventListener("click", () => {
      if (gameOver) return;

      cursor = index;
      selectSequence();
    });

    gridBox.appendChild(cell);
  });
}

function getLeftWrapIndex(index) {
  const row = Math.floor(index / COLS);
  const col = index % COLS;

  let newRow = row;
  let newCol = col - 1;

  if (newCol < 0) {
    newRow = row - 1;
    newCol = COLS - 1;
  }

  if (newRow < 0) {
    newRow = ROWS - 1;
    newCol = COLS - 1;
  }

  return newRow * COLS + newCol;
}

function getRightWrapIndex(index) {
  const row = Math.floor(index / COLS);
  const col = index % COLS;

  let newRow = row;
  let newCol = col + 1;

  if (newCol >= COLS) {
    newRow = row + 1;
    newCol = 0;
  }

  if (newRow >= ROWS) {
    newRow = 0;
    newCol = 0;
  }

  return newRow * COLS + newCol;
}

function getSequenceIndexes(startIndex) {
  const indexes = [];

  let index = startIndex;

  for (let i = 0; i < target.length; i++) {
    indexes.push(index);
    index = getRightWrapIndex(index);
  }

  return indexes;
}

function moveNumbersLeft() {
  const newGrid = [...grid];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const currentIndex = row * COLS + col;
      const newIndex = getLeftWrapIndex(currentIndex);

      newGrid[newIndex] = grid[currentIndex];
    }
  }

  grid = newGrid;

  correctStart = getLeftWrapIndex(correctStart);
}

function moveCursor(direction) {
  if (gameOver) return;

  const row = Math.floor(cursor / COLS);

  if (direction === "up" && row > 0) {
    cursor -= COLS;
  }

  if (direction === "down" && row < ROWS - 1) {
    cursor += COLS;
  }

  if (direction === "left") {
    cursor = getLeftWrapIndex(cursor);
  }

  if (direction === "right") {
    cursor = getRightWrapIndex(cursor);
  }

  renderGrid();
}

function selectSequence() {
  if (gameOver) return;

  selected = getSequenceIndexes(cursor);

  renderGrid();

  if (cursor === correctStart) {
    winGame();
  } else {
    wrongAnswer();
  }
}

function wrongAnswer() {
  messageBox.textContent = "Wrong sequence.";

  timeLeft = Math.max(0, timeLeft - 1.5);

  document.querySelectorAll(".cell").forEach((cell, index) => {
    if (selected.includes(index)) {
      cell.classList.add("wrong");
    }
  });

  setTimeout(() => {
    selected = [];
    renderGrid();
  }, 320);
}

function winGame() {
  gameOver = true;

  clearInterval(timer);
  clearInterval(moveTimer);

  selected = getSequenceIndexes(correctStart);

  renderGrid();

  successCount++;

  successCountEl.textContent = `Success: ${successCount}`;

  messageBox.textContent = "ACCESS GRANTED";

  setTimeout(() => {
    createGrid();
  }, 1200);
}

function loseGame() {
  gameOver = true;

  clearInterval(timer);
  clearInterval(moveTimer);

  selected = getSequenceIndexes(correctStart);

  renderGrid();

  messageBox.textContent = "ACCESS DENIED";
}

function updateTimer() {
  const percent = (timeLeft / TIME_LIMIT) * 100;

  timerFill.style.width = `${percent}%`;
  timeText.textContent = `Time: ${timeLeft.toFixed(1)}s`;
}

function startGameFromInput() {
  const value = Number(timeInput.value);

  if (!value || value < 5) {
    TIME_LIMIT = 5;
    timeInput.value = 5;
  } else if (value > 300) {
    TIME_LIMIT = 300;
    timeInput.value = 300;
  } else {
    TIME_LIMIT = value;
  }

  successCount = 0;
  successCountEl.textContent = "Success: 0";

  createGrid();
}

startBtn.addEventListener("click", startGameFromInput);

timeInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    startGameFromInput();
  }
});

document.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();

  if (event.target === timeInput) {
    return;
  }

  if (key === "w" || event.key === "ArrowUp") {
    moveCursor("up");
  }

  if (key === "s" || event.key === "ArrowDown") {
    moveCursor("down");
  }

  if (key === "a" || event.key === "ArrowLeft") {
    moveCursor("left");
  }

  if (key === "d" || event.key === "ArrowRight") {
    moveCursor("right");
  }

  if (key === " " || key === "enter") {
    event.preventDefault();
    selectSequence();
  }

  if (key === "r") {
    startGameFromInput();
  }
});

target = [0, 0, 0, 0];

grid = Array.from(
  { length: ROWS * COLS },
  () => ""
);

renderTarget();
renderGrid();

timeText.textContent = "Time: 0.0s";

timerFill.style.width = "0%";

messageBox.textContent =
  "Choose time and press START";