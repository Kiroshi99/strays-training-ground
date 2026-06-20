const ROWS = 10;
const COLS = 10;
const TOTAL_CELLS = ROWS * COLS;

const SELECTOR_WIDTH = 4;
const MAX_EDGE_BOXES = 2;

const MAX_SELECTOR_START_COL =
  COLS - SELECTOR_WIDTH + MAX_EDGE_BOXES;

/* Lower number = faster board movement */
const MOVE_INTERVAL_MS = 550;

/* Human Row 6, Column 6 */
const START_ROW = 5;
const START_COL = 5;
const START_INDEX = START_ROW * COLS + START_COL;

/*
3 × 3 dot patterns:

0 3 6
1 4 7
2 5 8
*/
const DOT_POSITIONS = [
  [1, 1],
  [1, 2],
  [1, 3],

  [2, 1],
  [2, 2],
  [2, 3],

  [3, 1],
  [3, 2],
  [3, 3]
];

/* All 511 non-empty 3 × 3 dot patterns */
const PATTERNS = Array.from({ length: 511 }, (_, index) => {
  const mask = index + 1;
  const pattern = [];

  for (let dot = 0; dot < 9; dot++) {
    if (mask & (1 << dot)) {
      pattern.push(dot);
    }
  }

  return pattern;
});

const grid = document.getElementById("grid");
const targetSequence = document.getElementById("targetSequence");
const message = document.getElementById("message");
const timeLabel = document.getElementById("timeLabel");
const successLabel = document.getElementById("successLabel");
const progressFill = document.getElementById("progressFill");
const gameTimeInput = document.getElementById("gameTime");
const startButton = document.getElementById("startButton");

let board = [];
let target = [];

let selectorStartIndex = START_INDEX;
let targetStartIndex = 0;

let success = 0;
let active = false;
let hasBoard = false;

let duration = 30;
let remaining = 30;
let startedAt = 0;

let animationFrame = null;
let moveInterval = null;

let correctIndexes = [];
let wrongIndexes = [];

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function wrapIndex(index) {
  return ((index % TOTAL_CELLS) + TOTAL_CELLS) % TOTAL_CELLS;
}

function wrapRow(row) {
  return ((row % ROWS) + ROWS) % ROWS;
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
    row: Math.floor(safeIndex / COLS),
    col: safeIndex % COLS
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

function getSequenceIndexes(startIndex) {
  return Array.from(
    { length: SELECTOR_WIDTH },
    (_, offset) => wrapIndex(startIndex + offset)
  );
}

function getSelectorIndexes() {
  return getSequenceIndexes(selectorStartIndex);
}

function getAllowedTargetStarts() {
  const starts = [];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col <= MAX_SELECTOR_START_COL; col++) {
      starts.push(row * COLS + col);
    }
  }

  return starts;
}

function createTarget() {
  const allPatternIndexes = PATTERNS.map((_, index) => index);

  return shuffle(allPatternIndexes).slice(0, SELECTOR_WIDTH);
}

function countTargetMatchesInLoop() {
  let matches = 0;

  for (let start = 0; start < TOTAL_CELLS; start++) {
    const isMatch = target.every((pattern, offset) => {
      return getBoardValue(start + offset) === pattern;
    });

    if (isMatch) {
      matches++;
    }
  }

  return matches;
}

function buildBoard() {
  target = createTarget();

  const validStarts = getAllowedTargetStarts().filter(
    (index) => index !== START_INDEX
  );

  do {
    board = Array.from(
      { length: ROWS },
      () => Array.from(
        { length: COLS },
        () => randomInt(PATTERNS.length)
      )
    );

    targetStartIndex =
      validStarts[randomInt(validStarts.length)];

    target.forEach((pattern, offset) => {
      setBoardValue(targetStartIndex + offset, pattern);
    });
  } while (countTargetMatchesInLoop() !== 1);

  selectorStartIndex = START_INDEX;

  correctIndexes = [];
  wrongIndexes = [];

  hasBoard = true;
}

function makeBraille(patternIndex) {
  const braille = document.createElement("span");

  braille.className = "braille";

  PATTERNS[patternIndex].forEach((dotIndex) => {
    const dot = document.createElement("span");
    const [column, row] = DOT_POSITIONS[dotIndex];

    dot.className = "dot";
    dot.style.gridColumn = column;
    dot.style.gridRow = row;

    braille.appendChild(dot);
  });

  return braille;
}

function renderTarget() {
  targetSequence.innerHTML = "";

  target.forEach((patternIndex) => {
    const tile = document.createElement("div");

    tile.className = "target-tile";
    tile.appendChild(makeBraille(patternIndex));

    targetSequence.appendChild(tile);
  });
}

function renderWaitingTarget() {
  targetSequence.innerHTML = "";

  for (let index = 0; index < SELECTOR_WIDTH; index++) {
    const tile = document.createElement("div");

    tile.className = "target-tile";
    tile.textContent = "?";
    tile.style.color = "#6d3568";
    tile.style.fontSize = "24px";
    tile.style.fontWeight = "900";

    targetSequence.appendChild(tile);
  }
}

function renderGrid() {
  grid.innerHTML = "";

  const selectedIndexes = active
    ? getSelectorIndexes()
    : [];

  for (let index = 0; index < TOTAL_CELLS; index++) {
    const cell = document.createElement("button");

    cell.className = "cell";
    cell.type = "button";
    cell.dataset.index = index;

    if (!hasBoard) {
      cell.classList.add("idle");
      cell.disabled = true;
    } else {
      cell.appendChild(makeBraille(getBoardValue(index)));

      if (selectedIndexes.includes(index)) {
        cell.classList.add("selected");
      }

      /* Green must win if wrong selection overlaps actual answer */
      if (correctIndexes.includes(index)) {
        cell.classList.add("correct");
      } else if (wrongIndexes.includes(index)) {
        cell.classList.add("wrong");
      }

      cell.addEventListener("click", () => {
        if (!active) {
          return;
        }

        moveSelectorToIndex(index);
        confirmSelection();
      });
    }

    grid.appendChild(cell);
  }
}

function getCellFromIndex(index) {
  return grid.querySelector(
    `[data-index="${wrapIndex(index)}"]`
  );
}

function paintSelection() {
  grid.querySelectorAll(".selected").forEach((cell) => {
    cell.classList.remove("selected");
  });

  getSelectorIndexes().forEach((index) => {
    const cell = getCellFromIndex(index);

    if (cell) {
      cell.classList.add("selected");
    }
  });
}

function moveSelectorToIndex(index) {
  const position = indexToPosition(index);

  selectorStartIndex =
    position.row * COLS +
    Math.min(position.col, MAX_SELECTOR_START_COL);

  paintSelection();
}

function scrollBoardLeft() {
  if (!active) {
    return;
  }

  const oldBoard = board.flat();

  const movedBoard = oldBoard.map((_, index) => {
    return oldBoard[wrapIndex(index + 1)];
  });

  board = Array.from({ length: ROWS }, (_, row) => {
    const rowStart = row * COLS;

    return movedBoard.slice(rowStart, rowStart + COLS);
  });

  /* Target moves with the board */
  targetStartIndex = wrapIndex(targetStartIndex - 1);

  renderGrid();
}

function setMessage(text, type = "") {
  message.textContent = text;
  message.className = `message ${type}`;
}

function updateHud() {
  const percent = Math.max(0, remaining / duration);

  timeLabel.textContent = `${Math.max(0, remaining).toFixed(1)}s`;
  successLabel.textContent = success;
  progressFill.style.width = `${percent * 100}%`;
}

function moveSelector(rowChange, colChange) {
  if (!active) {
    return;
  }

  const current = indexToPosition(selectorStartIndex);

  let nextRow = current.row;
  let nextCol = current.col;

  if (rowChange !== 0) {
    nextRow = wrapRow(current.row + rowChange);
  }

  if (colChange > 0) {
    if (current.col >= MAX_SELECTOR_START_COL) {
      nextRow = wrapRow(current.row + 1);
      nextCol = 0;
    } else {
      nextCol = current.col + 1;
    }
  }

  if (colChange < 0) {
    if (current.col <= 0) {
      nextRow = wrapRow(current.row - 1);
      nextCol = MAX_SELECTOR_START_COL;
    } else {
      nextCol = current.col - 1;
    }
  }

  selectorStartIndex = nextRow * COLS + nextCol;

  paintSelection();

  setMessage(
    "Board is moving — find the START of the target."
  );
}

function selectionMatchesTarget() {
  return selectorStartIndex === targetStartIndex;
}

function stopGame() {
  active = false;

  cancelAnimationFrame(animationFrame);
  clearInterval(moveInterval);

  animationFrame = null;
  moveInterval = null;
}

function endWithFailure(text, selectedIndexes = []) {
  const answerIndexes =
    getSequenceIndexes(targetStartIndex);

  correctIndexes = answerIndexes;

  wrongIndexes = selectedIndexes.filter((index) => {
    return !answerIndexes.includes(index);
  });

  stopGame();
  renderGrid();

  setMessage(text, "bad");
  updateHud();
}

function confirmSelection() {
  if (!active) {
    return;
  }

  if (selectionMatchesTarget()) {
    correctIndexes = getSelectorIndexes();
    wrongIndexes = [];

    success++;

    stopGame();
    renderGrid();

    setMessage(
      "TARGET FOUND — press START for another board.",
      "good"
    );

    updateHud();
    return;
  }

  endWithFailure(
    "ACCESS DENIED — wrong sequence. Correct boxes are green.",
    getSelectorIndexes()
  );
}

function tick(now) {
  if (!active) {
    return;
  }

  remaining = duration - (now - startedAt) / 1000;

  updateHud();

  if (remaining <= 0) {
    remaining = 0;

    endWithFailure(
      "TIME UP — correct boxes are green."
    );

    return;
  }

  animationFrame = requestAnimationFrame(tick);
}

function getTimeFromInput() {
  const value = Number(gameTimeInput.value);

  if (!value || value < 5) {
    gameTimeInput.value = 5;
    return 5;
  }

  if (value > 60) {
    gameTimeInput.value = 60;
    return 60;
  }

  return value;
}

function startGame() {
  stopGame();

  duration = getTimeFromInput();
  remaining = duration;

  /* Fresh target and fresh board every Start */
  buildBoard();

  renderTarget();
  renderGrid();

  active = true;
  startedAt = performance.now();

  setMessage(
    "Board is moving — find the START of the target."
  );

  updateHud();

  animationFrame = requestAnimationFrame(tick);

  moveInterval = setInterval(() => {
    scrollBoardLeft();
  }, MOVE_INTERVAL_MS);
}

startButton.addEventListener("click", startGame);

gameTimeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    startGame();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.target === gameTimeInput || !active) {
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

/* Waiting screen before START */
renderWaitingTarget();
renderGrid();

setMessage("Choose a game time, then press START.");
updateHud();
