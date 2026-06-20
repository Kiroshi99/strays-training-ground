const TARGET_LENGTH = 4;
const MAX_EDGE_BOXES = 2;
const DEFAULT_TIME_LIMIT = 30;

const LEVELS = {
  1: {
    rows: 8,
    cols: 8,
    startRow: 4,
    startCol: 4,
    moveInterval: 750,
    label: "LEVEL 1 — 8 × 8 GRID"
  },

  2: {
    rows: 10,
    cols: 10,
    startRow: 5,
    startCol: 5,
    moveInterval: 550,
    label: "LEVEL 2 — 10 × 10 GRID"
  }
};

const gameWrap = document.getElementById("game-wrap");
const gridBox = document.getElementById("grid-box");
const targetSequenceEl = document.getElementById("target-sequence");
const messageBox = document.getElementById("message-box");
const timerFill = document.getElementById("timer-fill");
const timeText = document.getElementById("time-text");
const successCountEl = document.getElementById("success-count");
const timeInput = document.getElementById("time-input");
const startBtn = document.getElementById("start-btn");
const levelInfo = document.getElementById("level-info");
const levelButtons = [...document.querySelectorAll(".level-btn")];

let activeLevel = 1;

let rows = 8;
let cols = 8;
let totalCells = 64;

let startRow = 4;
let startCol = 4;
let startIndex = 36;

let maxSelectorStartCol = 6;

let board = [];
let target = [];

let selectorStartIndex = 0;
let targetStartIndex = 0;

let successCount = 0;
let gameActive = false;
let hasBoard = false;

let timeLimit = DEFAULT_TIME_LIMIT;
let timeLeft = DEFAULT_TIME_LIMIT;
let startedAt = 0;

let timerFrame = null;
let movementTimer = null;

let wrongIndexes = [];
let correctIndexes = [];

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function wrapIndex(index) {
  return ((index % totalCells) + totalCells) % totalCells;
}

function wrapRow(row) {
  return ((row % rows) + rows) % rows;
}

function shuffle(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index--) {
    const randomIndex = randomInt(index + 1);

    [copy[index], copy[randomIndex]] = [
      copy[randomIndex],
      copy[index]
    ];
  }

  return copy;
}

function indexToPosition(index) {
  const safeIndex = wrapIndex(index);

  return {
    row: Math.floor(safeIndex / cols),
    col: safeIndex % cols
  };
}

function getBoardValue(index) {
  const position = indexToPosition(index);
  return board[position.row][position.col];
}

function setBoardValue(index, value) {
  const position = indexToPosition(index);
  board[position.row][position.col] = value;
}

function getSequenceIndexesFromStart(startIndex) {
  return Array.from(
    { length: TARGET_LENGTH },
    (_, offset) => wrapIndex(startIndex + offset)
  );
}

function getSelectorIndexes() {
  return getSequenceIndexesFromStart(selectorStartIndex);
}

function getAllowedTargetStarts() {
  const starts = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col <= maxSelectorStartCol; col++) {
      starts.push(row * cols + col);
    }
  }

  return starts;
}

function createTarget() {
  target = Array.from(
    { length: TARGET_LENGTH },
    () => randomInt(10)
  );
}

function countReachableTargetMatches() {
  let matches = 0;

  getAllowedTargetStarts().forEach((start) => {
    const isMatch = target.every((digit, offset) => {
      return getBoardValue(start + offset) === digit;
    });

    if (isMatch) {
      matches++;
    }
  });

  return matches;
}

function buildBoard() {
  createTarget();

  const validStarts = getAllowedTargetStarts().filter(
    (index) => index !== startIndex
  );

  for (let attempt = 0; attempt < 500; attempt++) {
    board = Array.from(
      { length: rows },
      () => Array.from({ length: cols }, () => randomInt(10))
    );

    targetStartIndex = validStarts[randomInt(validStarts.length)];

    target.forEach((digit, offset) => {
      setBoardValue(targetStartIndex + offset, digit);
    });

    if (countReachableTargetMatches() === 1) {
      break;
    }
  }

  selectorStartIndex = startIndex;
  wrongIndexes = [];
  correctIndexes = [];
  hasBoard = true;
}

function renderWaitingTarget() {
  targetSequenceEl.innerHTML = "";

  for (let index = 0; index < TARGET_LENGTH; index++) {
    const placeholder = document.createElement("span");

    placeholder.className = "target-digit placeholder";
    placeholder.textContent = "?";

    targetSequenceEl.appendChild(placeholder);
  }
}

function renderTarget() {
  targetSequenceEl.innerHTML = "";

  target.forEach((digit) => {
    const span = document.createElement("span");

    span.className = "target-digit";
    span.textContent = digit;

    targetSequenceEl.appendChild(span);
  });
}

function renderGrid() {
  gridBox.innerHTML = "";

  const previewIndexes = gameActive
    ? getSelectorIndexes()
    : [];

  for (let index = 0; index < totalCells; index++) {
    const cell = document.createElement("button");

    cell.className = "cell";
    cell.type = "button";
    cell.dataset.index = index;

    if (!hasBoard) {
      cell.classList.add("idle");
      cell.disabled = true;
    } else {
      cell.textContent = getBoardValue(index);

      if (previewIndexes.includes(index)) {
        cell.classList.add("preview");
      }

      if (correctIndexes.includes(index)) {
        cell.classList.add("selected");
      }

      if (wrongIndexes.includes(index)) {
        cell.classList.add("wrong");
      }

      cell.addEventListener("click", () => {
        if (!gameActive) {
          return;
        }

        moveSelectorToIndex(index);
        confirmSelection();
      });
    }

    gridBox.appendChild(cell);
  }
}

function getCellFromIndex(index) {
  return gridBox.querySelector(
    `[data-index="${wrapIndex(index)}"]`
  );
}

function paintSelection() {
  gridBox.querySelectorAll(".preview").forEach((cell) => {
    cell.classList.remove("preview");
  });

  getSelectorIndexes().forEach((index) => {
    const cell = getCellFromIndex(index);

    if (cell) {
      cell.classList.add("preview");
    }
  });
}

function moveSelectorToIndex(index) {
  const position = indexToPosition(index);

  selectorStartIndex =
    position.row * cols +
    Math.min(position.col, maxSelectorStartCol);

  paintSelection();
}

function moveBoardLeft() {
  if (!gameActive) {
    return;
  }

  const oldBoard = board.flat();

  const movedBoard = oldBoard.map((_, index) => {
    return oldBoard[wrapIndex(index + 1)];
  });

  board = Array.from({ length: rows }, (_, row) => {
    const rowStart = row * cols;

    return movedBoard.slice(rowStart, rowStart + cols);
  });

  targetStartIndex = wrapIndex(targetStartIndex - 1);

  renderGrid();
}

function setMessage(text, type = "") {
  messageBox.textContent = text;
  messageBox.className = type;
}

function updateHud() {
  const percent = Math.max(0, (timeLeft / timeLimit) * 100);

  timerFill.style.width = `${percent}%`;
  timeText.textContent = `Time: ${Math.max(0, timeLeft).toFixed(1)}s`;
  successCountEl.textContent = `Success: ${successCount}`;
}

function moveSelector(rowChange, colChange) {
  if (!gameActive) {
    return;
  }

  const current = indexToPosition(selectorStartIndex);

  let nextRow = current.row;
  let nextCol = current.col;

  if (rowChange !== 0) {
    nextRow = wrapRow(current.row + rowChange);
  }

  if (colChange > 0) {
    if (current.col >= maxSelectorStartCol) {
      nextRow = wrapRow(current.row + 1);
      nextCol = 0;
    } else {
      nextCol = current.col + 1;
    }
  }

  if (colChange < 0) {
    if (current.col <= 0) {
      nextRow = wrapRow(current.row - 1);
      nextCol = maxSelectorStartCol;
    } else {
      nextCol = current.col - 1;
    }
  }

  selectorStartIndex = nextRow * cols + nextCol;

  paintSelection();

  setMessage("Board is moving — find the START of the target sequence.");
}

function selectionMatchesTarget() {
  return selectorStartIndex === targetStartIndex;
}

function stopGame() {
  gameActive = false;

  cancelAnimationFrame(timerFrame);
  clearInterval(movementTimer);

  timerFrame = null;
  movementTimer = null;
}

function endWithFailure(message) {
  wrongIndexes = getSelectorIndexes();
  correctIndexes = getSequenceIndexesFromStart(targetStartIndex);

  stopGame();
  renderGrid();

  setMessage(message, "bad");
  updateHud();
}

function confirmSelection() {
  if (!gameActive) {
    return;
  }

  if (selectionMatchesTarget()) {
    correctIndexes = getSelectorIndexes();
    wrongIndexes = [];

    successCount++;

    stopGame();
    renderGrid();

    setMessage(
      "ACCESS GRANTED — press START for another target.",
      "good"
    );

    updateHud();
    return;
  }

  endWithFailure(
    "ACCESS DENIED — wrong sequence. Correct boxes are green."
  );
}

function tick(now) {
  if (!gameActive) {
    return;
  }

  timeLeft = timeLimit - (now - startedAt) / 1000;

  updateHud();

  if (timeLeft <= 0) {
    timeLeft = 0;

    endWithFailure(
      "ACCESS DENIED — time expired. Correct boxes are green."
    );

    return;
  }

  timerFrame = requestAnimationFrame(tick);
}

function getTimeFromInput() {
  const value = Number(timeInput.value);

  if (!value || value < 5) {
    timeInput.value = 5;
    return 5;
  }

  if (value > 300) {
    timeInput.value = 300;
    return 300;
  }

  return value;
}

function startGame() {
  stopGame();

  timeLimit = getTimeFromInput();
  timeLeft = timeLimit;

  buildBoard();

  renderTarget();
  renderGrid();

  setMessage("Board is moving — find the START of the target sequence.");

  gameActive = true;
  startedAt = performance.now();

  updateHud();

  timerFrame = requestAnimationFrame(tick);

  movementTimer = setInterval(() => {
    moveBoardLeft();
  }, LEVELS[activeLevel].moveInterval);
}

function changeLevel(levelNumber) {
  stopGame();

  activeLevel = levelNumber;

  const config = LEVELS[levelNumber];

  rows = config.rows;
  cols = config.cols;
  totalCells = rows * cols;

  startRow = config.startRow;
  startCol = config.startCol;
  startIndex = startRow * cols + startCol;

  maxSelectorStartCol =
    cols - TARGET_LENGTH + MAX_EDGE_BOXES;

  gameWrap.dataset.level = levelNumber;

  successCount = 0;
  timeLimit = getTimeFromInput();
  timeLeft = timeLimit;

  board = [];
  target = [];
  hasBoard = false;

  wrongIndexes = [];
  correctIndexes = [];

  levelInfo.textContent = config.label;

  levelButtons.forEach((button) => {
    button.classList.toggle(
      "active",
      Number(button.dataset.level) === levelNumber
    );
  });

  renderWaitingTarget();
  renderGrid();

  setMessage("Choose a game time, then press START.");
  updateHud();
}

levelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    changeLevel(Number(button.dataset.level));
  });
});

startBtn.addEventListener("click", startGame);

timeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    startGame();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.target === timeInput || !gameActive) {
    return;
  }

  const key = event.key.toLowerCase();

  if (key === "w" || event.key === "ArrowUp") {
    event.preventDefault();
    moveSelector(-1, 0);
  }

  if (key === "s" || event.key === "ArrowDown") {
    event.preventDefault();
    moveSelector(1, 0);
  }

  if (key === "a" || event.key === "ArrowLeft") {
    event.preventDefault();
    moveSelector(0, -1);
  }

  if (key === "d" || event.key === "ArrowRight") {
    event.preventDefault();
    moveSelector(0, 1);
  }

  if (event.key === "Enter" || event.code === "Space") {
    event.preventDefault();
    confirmSelection();
  }
});

changeLevel(1);
