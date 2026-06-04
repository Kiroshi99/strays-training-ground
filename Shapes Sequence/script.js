const grid = document.getElementById("grid");
const targetDisplay = document.getElementById("targetDisplay");
const message = document.getElementById("message");
const timerText = document.getElementById("timerText");
const timerFill = document.getElementById("timerFill");
const startBtn = document.getElementById("startBtn");
const gameTimeInput = document.getElementById("gameTime");
const successCountText = document.getElementById("successCount");

const colour = "#d8b347";

const cellSize = 54;
const gap = 6;
const gridPadding = 10;

let maxTime = 15;
let timeLeft = 0;
let successCount = 0;

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

let targets = [];
let gridData = [];
let selectorRow = 4;
let selectorCol = 3;
let gameOver = true;
let selectorState = "normal";
let flashTimeout;

let moveInterval;
let timerInterval;

function svgShape(type) {
  const stroke = `stroke="${colour}" stroke-width="7" stroke-linejoin="round"`;
  const fill = `fill="${colour}"`;
  const noFill = `fill="none"`;

  const svgs = {
    "circle-filled": `
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="24" ${fill}/>
      </svg>`,

    "circle-filled-outline": `
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="25"
          fill="rgba(216,179,71,0.25)"
          stroke="${colour}"
          stroke-width="7"/>
        <circle cx="50" cy="50" r="15" fill="${colour}"/>
      </svg>`,

    "double-ring": `
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="27"
          fill="none"
          stroke="${colour}"
          stroke-width="6"/>
        <circle cx="50" cy="50" r="15"
          fill="none"
          stroke="${colour}"
          stroke-width="6"/>
        <circle cx="50" cy="50" r="5" fill="${colour}"/>
      </svg>`,

    "dot": `
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="10" ${fill}/>
      </svg>`,

    "triangle-filled": `
      <svg viewBox="0 0 100 100">
        <polygon points="50,18 80,75 20,75" ${fill}/>
      </svg>`,

    "triangle-outline": `
      <svg viewBox="0 0 100 100">
        <polygon points="50,18 80,75 20,75" ${noFill} ${stroke}/>
      </svg>`,

    "triangle-down-outline": `
      <svg viewBox="0 0 100 100">
        <polygon points="20,25 80,25 50,82" ${noFill} ${stroke}/>
      </svg>`,

    "square-filled": `
      <svg viewBox="0 0 100 100">
        <rect x="34" y="34" width="32" height="32" ${fill}/>
      </svg>`,

    "square-outline": `
      <svg viewBox="0 0 100 100">
        <rect x="34" y="34" width="32" height="32" ${noFill} ${stroke}/>
      </svg>`,

    "diamond-filled": `
      <svg viewBox="0 0 100 100">
        <polygon points="50,22 78,50 50,78 22,50" ${fill}/>
      </svg>`,

    "diamond-small-filled": `
      <svg viewBox="0 0 100 100">
        <polygon points="50,28 72,50 50,72 28,50" fill="${colour}"/>
      </svg>`,

    "diamond-double-outline": `
      <svg viewBox="0 0 100 100">
        <polygon points="50,20 80,50 50,80 20,50"
          fill="none"
          stroke="${colour}"
          stroke-width="6"
          stroke-linejoin="round"/>
        <polygon points="50,34 66,50 50,66 34,50"
          fill="none"
          stroke="${colour}"
          stroke-width="5"
          stroke-linejoin="round"/>
      </svg>`,

    "diamond-outline": `
      <svg viewBox="0 0 100 100">
        <polygon points="50,22 78,50 50,78 22,50" ${noFill} ${stroke}/>
      </svg>`,

    "pentagon-filled": `
      <svg viewBox="0 0 100 100">
        <polygon points="50,16 80,38 70,78 30,78 20,38" ${fill}/>
      </svg>`,

    "pentagon-outline": `
      <svg viewBox="0 0 100 100">
        <polygon points="50,16 80,38 70,78 30,78 20,38" ${noFill} ${stroke}/>
      </svg>`,

    "hexagon-outline": `
      <svg viewBox="0 0 100 100">
        <polygon points="30,18 70,18 88,50 70,82 30,82 12,50" ${noFill} ${stroke}/>
      </svg>`,

    "hexagon-filled-outline": `
      <svg viewBox="0 0 100 100">
        <polygon points="30,18 70,18 88,50 70,82 30,82 12,50"
          fill="rgba(216,179,71,0.25)"
          stroke="${colour}"
          stroke-width="7"
          stroke-linejoin="round"/>
      </svg>`,

    "oval-filled": `
      <svg viewBox="0 0 100 100">
        <ellipse cx="50" cy="50" rx="26" ry="18" ${fill}/>
      </svg>`,

    "oval-small-filled": `
      <svg viewBox="0 0 100 100">
        <ellipse cx="50" cy="50" rx="24" ry="12" fill="${colour}"/>
      </svg>`,

    "oval-vertical-filled": `
      <svg viewBox="0 0 100 100">
        <path
          d="M50 14
             C70 14 82 34 82 54
             C82 74 68 88 50 88
             C32 88 18 74 18 54
             C18 34 30 14 50 14 Z"
          fill="${colour}"/>
      </svg>`,

    "oval-outline": `
      <svg viewBox="0 0 100 100">
        <ellipse cx="50" cy="50" rx="28" ry="13" ${noFill} ${stroke}/>
      </svg>`,

    "star-filled": `
      <svg viewBox="0 0 100 100">
        <polygon points="50,10 61,38 90,38 67,56 76,86 50,68 24,86 33,56 10,38 39,38" ${fill}/>
      </svg>`,

    "star-outline": `
      <svg viewBox="0 0 100 100">
        <polygon points="50,10 61,38 90,38 67,56 76,86 50,68 24,86 33,56 10,38 39,38" ${noFill} ${stroke}/>
      </svg>`,

    "ring": `
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="25" ${noFill} ${stroke}/>
        <circle cx="50" cy="50" r="11" ${noFill} ${stroke}/>
      </svg>`
  };

  return svgs[type];
}

function randomShape() {
  return shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
}

function generateTargets() {
  targets = [];

  while (targets.length < 3) {
    const shape = randomShape();
    if (!targets.includes(shape)) targets.push(shape);
  }
}

function generateGrid() {
  gridData = [];

  for (let i = 0; i < 64; i++) {
    gridData.push(randomShape());
  }

  const startIndex = selectorRow * 8 + selectorCol;
  gridData[startIndex] = targets[0];
  gridData[startIndex + 1] = targets[1];
  gridData[startIndex + 2] = targets[2];
}

function renderTargets() {
  targetDisplay.innerHTML = "";

  targets.forEach(target => {
    const box = document.createElement("div");
    box.innerHTML = svgShape(target);
    targetDisplay.appendChild(box);
  });
}

function renderGrid() {
  grid.innerHTML = "";

  gridData.forEach(shape => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.innerHTML = svgShape(shape);
    grid.appendChild(cell);
  });

  const selector = document.createElement("div");
  selector.className = "selector-box";

  if (selectorState === "correct") selector.classList.add("selector-correct");
  if (selectorState === "wrong") selector.classList.add("selector-wrong");

  selector.style.left = `${gridPadding + selectorCol * (cellSize + gap)}px`;
  selector.style.top = `${gridPadding + selectorRow * (cellSize + gap)}px`;

  grid.appendChild(selector);
}

function moveSelector(direction) {
  if (gameOver) return;

  selectorState = "normal";

  if (direction === "up" && selectorRow > 0) selectorRow--;
  if (direction === "down" && selectorRow < 7) selectorRow++;
  if (direction === "left" && selectorCol > 0) selectorCol--;
  if (direction === "right" && selectorCol < 5) selectorCol++;

  renderGrid();
}

function checkSelection() {
  if (gameOver) return;

  const startIndex = selectorRow * 8 + selectorCol;

  const selected = [
    gridData[startIndex],
    gridData[startIndex + 1],
    gridData[startIndex + 2]
  ];

  const correct =
    selected[0] === targets[0] &&
    selected[1] === targets[1] &&
    selected[2] === targets[2];

  clearTimeout(flashTimeout);

  if (correct) {
    selectorState = "correct";
    message.textContent = "CORRECT SEQUENCE";
    renderGrid();

    setTimeout(winGame, 500);
  } else {
    selectorState = "wrong";
    message.textContent = "WRONG SEQUENCE";
    renderGrid();

    flashTimeout = setTimeout(() => {
      selectorState = "normal";
      renderGrid();
    }, 450);
  }
}

function shiftLeft() {
  if (gameOver) return;

  gridData.shift();
  gridData.push(randomShape());

  renderGrid();
}

function updateTimerDisplay() {
  timerText.textContent = timeLeft.toFixed(1) + "s";
  timerFill.style.width = `${(timeLeft / maxTime) * 100}%`;
}

function startTimer() {
  timerInterval = setInterval(() => {
    if (gameOver) return;

    timeLeft -= 0.1;

    if (timeLeft <= 0) {
      timeLeft = 0;
      updateTimerDisplay();
      loseGame();
      return;
    }

    updateTimerDisplay();
  }, 100);
}

function winGame() {
  gameOver = true;
  successCount++;
  successCountText.textContent = successCount;

  clearInterval(moveInterval);
  clearInterval(timerInterval);

  message.textContent = "ACCESS GRANTED.";
}

function loseGame() {
  gameOver = true;

  clearInterval(moveInterval);
  clearInterval(timerInterval);

  message.textContent = "TIME EXPIRED! ACCESS DENIED.";
}

function startGame() {
  clearInterval(moveInterval);
  clearInterval(timerInterval);
  clearTimeout(flashTimeout);

  maxTime = Number(gameTimeInput.value) || 15;
  timeLeft = maxTime;

  gameOver = false;
  selectorState = "normal";

  selectorRow = 4;
  selectorCol = 3;

  generateTargets();
  generateGrid();
  renderTargets();
  renderGrid();
  updateTimerDisplay();

  message.textContent = "Find the START of the target sequence";

  moveInterval = setInterval(shiftLeft, 1000);
  startTimer();
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "arrowup" || key === "w") moveSelector("up");
  if (key === "arrowdown" || key === "s") moveSelector("down");
  if (key === "arrowleft" || key === "a") moveSelector("left");
  if (key === "arrowright" || key === "d") moveSelector("right");

  if (key === "enter" || key === " ") checkSelection();
});

startBtn.addEventListener("click", startGame);

generateTargets();
generateGrid();
renderTargets();
renderGrid();
updateTimerDisplay();