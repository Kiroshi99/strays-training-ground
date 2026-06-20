const MAX_EDGE_BOXES = 2;
const DEFAULT_TIME_LIMIT = 30;

const SHAPE_COLOUR = "#d8b347";

const LEVELS = {
  1: {
    rows: 8,
    cols: 8,
    selectionLength: 3,
    startRow: 4, // Human row 5
    startCol: 3, // Human column 4
    moveInterval: 750,
    label: "LEVEL 1 — 3 BOXES · 8 × 8 GRID"
  },

  2: {
    rows: 8,
    cols: 8,
    selectionLength: 4,
    startRow: 4, // Human row 5
    startCol: 3, // Human column 4
    moveInterval: 650,
    label: "LEVEL 2 — 4 BOXES · 8 × 8 GRID"
  },

  3: {
    rows: 10,
    cols: 10,
    selectionLength: 4,
    startRow: 5, // Human row 6
    startCol: 5, // Human column 6
    moveInterval: 550,
    label: "LEVEL 3 — 4 BOXES · 10 × 10 GRID"
  }
};

const shapeTypes = [
  "circle-filled",
  "circle-filled-outline",
  "double-ring",
  "dot",

  "triangle-filled",
  "triangle-outline",
  "triangle-down-outline",

  "square-filled",
  "square-outline",

  "diamond-filled",
  "diamond-small-filled",
  "diamond-double-outline",
  "diamond-outline",

  "pentagon-filled",
  "pentagon-outline",

  "hexagon-outline",
  "hexagon-filled-outline",

  "oval-filled",
  "oval-small-filled",
  "oval-vertical-filled",
  "oval-outline",

  "star-filled",
  "star-outline",

  "ring"
];

const gamePanel = document.getElementById("gamePanel");
const grid = document.getElementById("grid");
const targetDisplay = document.getElementById("targetDisplay");
const message = document.getElementById("message");
const timerText = document.getElementById("timerText");
const timerFill = document.getElementById("timerFill");
const startBtn = document.getElementById("startBtn");
const gameTimeInput = document.getElementById("gameTime");
const successCountText = document.getElementById("successCount");
const levelInfo = document.getElementById("levelInfo");
const selectionCountText = document.getElementById("selectionCount");

const levelButtons = [
  ...document.querySelectorAll(".level-btn")
];

let activeLevel = 1;

let rows = 8;
let cols = 8;
let totalCells = 64;

let selectionLength = 3;

let startRow = 4;
let startCol = 3;
let startIndex = 35;

let maxSelectorStartCol = 7;

let target = [];
let gridData = [];

let selectorStartIndex = 0;
let targetStartIndex = 0;

let maxTime = DEFAULT_TIME_LIMIT;
let timeLeft = DEFAULT_TIME_LIMIT;

let successCount = 0;

let gameActive = false;
let hasBoard = false;

let timerFrame = null;
let moveInterval = null;
let gameStartedAt = 0;

let correctIndexes = [];
let wrongIndexes = [];

function svgShape(type) {
  const stroke =
    `stroke="${SHAPE_COLOUR}" stroke-width="7" stroke-linejoin="round"`;

  const fill =
    `fill="${SHAPE_COLOUR}"`;

  const noFill =
    `fill="none"`;

  const svgs = {
    "circle-filled": `
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="24" ${fill}/>
      </svg>
    `,

    "circle-filled-outline": `
      <svg viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="25"
          fill="rgba(216,179,71,0.25)"
          stroke="${SHAPE_COLOUR}"
          stroke-width="7"
        />
        <circle cx="50" cy="50" r="15" ${fill}/>
      </svg>
    `,

    "double-ring": `
      <svg viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="27"
          fill="none"
          stroke="${SHAPE_COLOUR}"
          stroke-width="6"
        />
        <circle
          cx="50"
          cy="50"
          r="15"
          fill="none"
          stroke="${SHAPE_COLOUR}"
          stroke-width="6"
        />
        <circle cx="50" cy="50" r="5" ${fill}/>
      </svg>
    `,

    "dot": `
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="10" ${fill}/>
      </svg>
    `,

    "triangle-filled": `
      <svg viewBox="0 0 100 100">
        <polygon points="50,18 80,75 20,75" ${fill}/>
      </svg>
    `,

    "triangle-outline": `
      <svg viewBox="0 0 100 100">
        <polygon
          points="50,18 80,75 20,75"
          ${noFill}
          ${stroke}
        />
      </svg>
    `,

    "triangle-down-outline": `
      <svg viewBox="0 0 100 100">
        <polygon
          points="20,25 80,25 50,82"
          ${noFill}
          ${stroke}
        />
      </svg>
    `,

    "square-filled": `
      <svg viewBox="0 0 100 100">
        <rect x="34" y="34" width="32" height="32" ${fill}/>
      </svg>
    `,

    "square-outline": `
      <svg viewBox="0 0 100 100">
        <rect
          x="34"
          y="34"
          width="32"
          height="32"
          ${noFill}
          ${stroke}
        />
      </svg>
    `,

    "diamond-filled": `
      <svg viewBox="0 0 100 100">
        <polygon points="50,22 78,50 50,78 22,50" ${fill}/>
      </svg>
    `,

    "diamond-small-filled": `
      <svg viewBox="0 0 100 100">
        <polygon points="50,28 72,50 50,72 28,50" ${fill}/>
      </svg>
    `,

    "diamond-double-outline": `
      <svg viewBox="0 0 100 100">
        <polygon
          points="50,20 80,50 50,80 20,50"
          fill="none"
          stroke="${SHAPE_COLOUR}"
          stroke-width="6"
          stroke-linejoin="round"
        />
        <polygon
          points="50,34 66,50 50,66 34,50"
          fill="none"
          stroke="${SHAPE_COLOUR}"
          stroke-width="5"
          stroke-linejoin="round"
        />
      </svg>
    `,

    "diamond-outline": `
      <svg viewBox="0 0 100 100">
        <polygon
          points="50,22 78,50 50,78 22,50"
          ${noFill}
          ${stroke}
        />
      </svg>
    `,

    "pentagon-filled": `
      <svg viewBox="0 0 100 100">
        <polygon points="50,16 80,38 70,78 30,78 20,38" ${fill}/>
      </svg>
    `,

    "pentagon-outline": `
      <svg viewBox="0 0 100 100">
        <polygon
          points="50,16 80,38 70,78 30,78 20,38"
          ${noFill}
          ${stroke}
        />
      </svg>
    `,

    "hexagon-outline": `
      <svg viewBox="0 0 100 100">
        <polygon
          points="30,18 70,18 88,50 70,82 30,82 12,50"
          ${noFill}
          ${stroke}
        />
      </svg>
    `,

    "hexagon-filled-outline": `
      <svg viewBox="0 0 100 100">
        <polygon
          points="30,18 70,18 88,50 70,82 30,82 12,50"
          fill="rgba(216,179,71,0.25)"
          stroke="${SHAPE_COLOUR}"
          stroke-width="7"
          stroke-linejoin="round"
        />
      </svg>
    `,

    "oval-filled": `
      <svg viewBox="0 0 100 100">
        <ellipse cx="50" cy="50" rx="26" ry="18" ${fill}/>
      </svg>
    `,

    "oval-small-filled": `
      <svg viewBox="0 0 100 100">
        <ellipse cx="50" cy="50" rx="24" ry="12" ${fill}/>
      </svg>
    `,

    "oval-vertical-filled": `
      <svg viewBox="0 0 100 100">
        <path
          d="M50 14
             C70 14 82 34 82 54
             C82 74 68 88 50 88
             C32 88 18 74 18 54
             C18 34 30 14 50 14 Z"
          ${fill}
        />
      </svg>
    `,

    "oval-outline": `
      <svg viewBox="0 0 100 100">
        <ellipse
          cx="50"
          cy="50"
          rx="28"
          ry="13"
          ${noFill}
          ${stroke}
        />
      </svg>
    `,

    "star-filled": `
      <svg viewBox="0 0 100 100">
        <polygon
          points="50,10 61,38 90,38 67,56 76,86 50,68 24,86 33,56 10,38 39,38"
          ${fill}
        />
      </svg>
    `,

    "star-outline": `
      <svg viewBox="0 0 100 100">
        <polygon
          points="50,10 61,38 90,38 67,56 76,86 50,68 24,86 33,56 10,38 39,38"
          ${noFill}
          ${stroke}
        />
      </svg>
    `,

    "ring": `
      <svg viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="25"
          ${noFill}
          ${stroke}
        />
        <circle
          cx="50"
          cy="50"
          r="11"
          ${noFill}
          ${stroke}
        />
      </svg>
    `
  };

  return svgs[type];
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function randomShape() {
  return shapeTypes[randomInt(shapeTypes.length)];
}

function wrapIndex(index) {
  return ((index % totalCells) + totalCells) % totalCells;
}

function wrapRow(row) {
  return ((row % rows) + rows) % rows;
}

function indexToPosition(index) {
  const safeIndex = wrapIndex(index);

  return {
    row: Math.floor(safeIndex / cols),
    col: safeIndex % cols
  };
}

function getGridValue(index) {
  const position = indexToPosition(index);

  return gridData[position.row][position.col];
}

function setGridValue(index, value) {
  const position = indexToPosition(index);

  gridData[position.row][position.col] = value;
}

function getSequenceIndexes(startIndex) {
  return Array.from(
    { length: selectionLength },
    (_, offset) => wrapIndex(startIndex + offset)
  );
}

function getSelectorIndexes() {
  return getSequenceIndexes(selectorStartIndex);
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
    { length: selectionLength },
    () => randomShape()
  );
}

function countTargetMatches() {
  let matches = 0;

  getAllowedTargetStarts().forEach((start) => {
    const match = target.every((shape, offset) => {
      return getGridValue(start + offset) === shape;
    });

    if (match) {
      matches++;
    }
  });

  return matches;
}

function buildBoard() {
  createTarget();

  const allowedStarts = getAllowedTargetStarts().filter(
    (index) => index !== startIndex
  );

  do {
    gridData = Array.from(
      { length: rows },
      () => Array.from(
        { length: cols },
        () => randomShape()
      )
    );

    targetStartIndex =
      allowedStarts[randomInt(allowedStarts.length)];

    target.forEach((shape, offset) => {
      setGridValue(targetStartIndex + offset, shape);
    });
  } while (countTargetMatches() !== 1);

  selectorStartIndex = startIndex;

  correctIndexes = [];
  wrongIndexes = [];

  hasBoard = true;
}

function renderWaitingTarget() {
  targetDisplay.innerHTML = "";

  for (let index = 0; index < selectionLength; index++) {
    const placeholder = document.createElement("span");

    placeholder.className = "target-placeholder";
    placeholder.textContent = "?";

    targetDisplay.appendChild(placeholder);
  }
}

function renderTarget() {
  targetDisplay.innerHTML = "";

  target.forEach((shape) => {
    const holder = document.createElement("div");

    holder.className = "target-shape";
    holder.innerHTML = svgShape(shape);

    targetDisplay.appendChild(holder);
  });
}

function renderGrid() {
  grid.innerHTML = "";

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
      cell.innerHTML = svgShape(getGridValue(index));

      if (previewIndexes.includes(index)) {
        cell.classList.add("preview");
      }

      if (correctIndexes.includes(index)) {
        cell.classList.add("correct");
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

    grid.appendChild(cell);
  }
}

function getCellFromIndex(index) {
  return grid.querySelector(
    `[data-index="${wrapIndex(index)}"]`
  );
}

function paintSelection() {
  grid.querySelectorAll(".preview").forEach((cell) => {
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

  setMessage(
    "Board is moving — find the START of the target sequence."
  );
}

function moveBoardLeft() {
  if (!gameActive) {
    return;
  }

  const oldBoard = gridData.flat();

  const movedBoard = oldBoard.map((_, index) => {
    return oldBoard[wrapIndex(index + 1)];
  });

  gridData = Array.from({ length: rows }, (_, row) => {
    const rowStart = row * cols;

    return movedBoard.slice(
      rowStart,
      rowStart + cols
    );
  });

  targetStartIndex = wrapIndex(targetStartIndex - 1);

  renderGrid();
}

function setMessage(text, type = "") {
  message.textContent = text;
  message.className = `message ${type}`;
}

function updateTimerDisplay() {
  const percent = Math.max(
    0,
    (timeLeft / maxTime) * 100
  );

  timerText.textContent =
    `${Math.max(0, timeLeft).toFixed(1)}s`;

  timerFill.style.width = `${percent}%`;

  successCountText.textContent = successCount;
}

function selectionMatchesTarget() {
  return selectorStartIndex === targetStartIndex;
}

function stopGame() {
  gameActive = false;

  cancelAnimationFrame(timerFrame);
  clearInterval(moveInterval);

  timerFrame = null;
  moveInterval = null;
}

function endWithFailure(text, selectedIndexes = []) {
  const actualTargetIndexes =
    getSequenceIndexes(targetStartIndex);

  correctIndexes = actualTargetIndexes;

  wrongIndexes = selectedIndexes.filter((index) => {
    return !actualTargetIndexes.includes(index);
  });

  stopGame();
  renderGrid();

  setMessage(text, "bad");
  updateTimerDisplay();
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

    updateTimerDisplay();
    return;
  }

  endWithFailure(
    "ACCESS DENIED — wrong sequence. Correct boxes are green.",
    getSelectorIndexes()
  );
}

function timerTick(now) {
  if (!gameActive) {
    return;
  }

  timeLeft =
    maxTime - (now - gameStartedAt) / 1000;

  updateTimerDisplay();

  if (timeLeft <= 0) {
    timeLeft = 0;

    endWithFailure(
      "ACCESS DENIED — time expired. Correct boxes are green."
    );

    return;
  }

  timerFrame = requestAnimationFrame(timerTick);
}

function getTimeFromInput() {
  const value = Number(gameTimeInput.value);

  if (!value || value < 5) {
    gameTimeInput.value = 5;
    return 5;
  }

  if (value > 300) {
    gameTimeInput.value = 300;
    return 300;
  }

  return value;
}

function startGame() {
  stopGame();

  maxTime = getTimeFromInput();
  timeLeft = maxTime;

  buildBoard();

  gameActive = true;
  gameStartedAt = performance.now();

  renderTarget();
  renderGrid();

  setMessage(
    "Board is moving — find the START of the target sequence."
  );

  updateTimerDisplay();

  timerFrame = requestAnimationFrame(timerTick);

  moveInterval = setInterval(() => {
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

  selectionLength = config.selectionLength;

  startRow = config.startRow;
  startCol = config.startCol;
  startIndex = startRow * cols + startCol;

  maxSelectorStartCol =
    cols - selectionLength + MAX_EDGE_BOXES;

  selectorStartIndex = startIndex;

  gamePanel.dataset.level = levelNumber;

  successCount = 0;

  maxTime = getTimeFromInput();
  timeLeft = maxTime;

  target = [];
  gridData = [];

  hasBoard = false;

  correctIndexes = [];
  wrongIndexes = [];

  levelInfo.textContent = config.label;
  selectionCountText.textContent = selectionLength;

  levelButtons.forEach((button) => {
    button.classList.toggle(
      "active",
      Number(button.dataset.level) === levelNumber
    );
  });

  renderWaitingTarget();
  renderGrid();

  setMessage(
    "Choose a game time, then press START."
  );

  updateTimerDisplay();
}

levelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    changeLevel(Number(button.dataset.level));
  });
});

startBtn.addEventListener("click", startGame);

gameTimeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    startGame();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.target === gameTimeInput || !gameActive) {
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
