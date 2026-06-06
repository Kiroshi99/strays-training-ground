const allowedKeys = ["Q", "W", "E", "A", "S", "D", "F", "G", "H", "J"];

let difficulty = "medium";

const settings = {
  easy: { keys: 5, time: 18 },
  medium: { keys: 5, time: 10 },
  hard: { keys: 8, time: 7 }
};

let sequence = [];
let currentIndex = 0;
let currentSequence = 1;
let totalSequences = 3;

let timeLeft = 10;
let timer;
let running = false;
let paused = false;

const currentKey = document.getElementById("currentKey");
const keyRow = document.getElementById("keyRow");
const timerFill = document.getElementById("timerFill");
const timeText = document.getElementById("timeText");
const sequenceText = document.getElementById("sequenceText");
const screen = document.querySelector(".screen");

function addControls() {
  const controls = document.createElement("div");
  controls.className = "controls";

  controls.innerHTML = `
    <button onclick="setDifficulty('easy')" id="easyBtn">Easy</button>
    <button onclick="setDifficulty('medium')" id="mediumBtn">Medium</button>
    <button onclick="setDifficulty('hard')" id="hardBtn">Hard</button>
    <button onclick="pauseGame()" id="pauseBtn">Pause</button>
    <button onclick="stopGame()" id="stopBtn">Stop</button>
  `;

  document.querySelector(".title").after(controls);
}

function setDifficulty(level) {
  difficulty = level;
  currentSequence = 1;

  document.querySelectorAll(".controls button").forEach(btn => {
    btn.classList.remove("selected");
  });

  document.getElementById(level + "Btn").classList.add("selected");

  document.querySelectorAll(".stage").forEach((stageBox, i) => {
    stageBox.classList.toggle("active", i === 0);
  });

  newSequence();
}

function generateSequence() {
  const config = settings[difficulty];
  sequence = [];

  for (let i = 0; i < config.keys; i++) {
    const randomKey = allowedKeys[Math.floor(Math.random() * allowedKeys.length)];
    sequence.push(randomKey);
  }
}

function newSequence() {
  clearInterval(timer);

  generateSequence();

  currentIndex = 0;
  running = true;
  paused = false;

  document.querySelector(".game").classList.remove("wrong");
  document.getElementById("pauseBtn").textContent = "Pause";

  sequenceText.textContent = `${currentSequence}/${totalSequences}`;

  makeCompletedRow();
  resetTimer();
  renderCurrentKey();
  renderQueue();
  startTimer();
}

function makeCompletedRow() {
  let oldRow = document.querySelector(".completed-row");

  if (oldRow) {
    oldRow.remove();
  }

  const row = document.createElement("div");
  row.className = "completed-row";
  screen.appendChild(row);
}

function renderCurrentKey() {
  currentKey.classList.remove("correct-flash");
  currentKey.textContent = sequence[currentIndex];
}

function renderQueue() {
  const remainingKeys = sequence.slice(currentIndex + 1);

  keyRow.innerHTML = remainingKeys
    .map(key => `<div class="key-box">${key}</div>`)
    .join("");
}

function resetTimer() {
  const config = settings[difficulty];

  timeLeft = config.time;
  timeText.textContent = `${timeLeft.toFixed(1)}s`;
  timerFill.style.width = "100%";
}

function startTimer() {
  const config = settings[difficulty];

  timer = setInterval(() => {
    if (!running || paused) return;

    timeLeft -= 0.1;

    timeText.textContent = `${timeLeft.toFixed(1)}s`;
    timerFill.style.width = `${Math.max(0, (timeLeft / config.time) * 100)}%`;

    if (timeLeft <= 0) {
      failGame("TIME OUT");
    }
  }, 100);
}

function handleCorrectKey() {
  const completedRow = document.querySelector(".completed-row");

  const completedBox = document.createElement("div");
  completedBox.className = "completed-key";
  completedBox.textContent = sequence[currentIndex];

  completedRow.appendChild(completedBox);

  currentKey.classList.add("correct-flash");

  setTimeout(() => {
    currentIndex++;

    if (currentIndex >= sequence.length) {
      completeSequence();
      return;
    }

    renderCurrentKey();
    renderQueue();
  }, 180);
}

function completeSequence() {
  clearInterval(timer);

  document.querySelectorAll(".stage")[currentSequence - 1].classList.add("active");

  if (currentSequence >= totalSequences) {
    winGame();
    return;
  }

  currentSequence++;

  document.querySelectorAll(".stage")[currentSequence - 1].classList.add("active");

  currentKey.classList.remove("correct-flash");
  currentKey.textContent = "✓";
  timeText.textContent = "NEXT SEQUENCE";

  setTimeout(() => {
    newSequence();
  }, 700);
}

function failGame(text) {
  clearInterval(timer);

  running = false;
  paused = false;

  document.querySelector(".game").classList.add("wrong");

  currentKey.classList.remove("correct-flash");
  currentKey.textContent = "X";
  timeText.textContent = text;

  document.getElementById("pauseBtn").textContent = "Pause";
}

function winGame() {
  clearInterval(timer);

  running = false;
  paused = false;

  currentKey.classList.remove("correct-flash");
  currentKey.textContent = "✓";
  timeText.textContent = "ACCESS GRANTED";
  timerFill.style.width = "100%";

  document.getElementById("pauseBtn").textContent = "Pause";
}

function pauseGame() {
  if (!running) return;

  paused = !paused;

  document.getElementById("pauseBtn").textContent = paused ? "Resume" : "Pause";
  currentKey.textContent = paused ? "Ⅱ" : sequence[currentIndex];
}

function stopGame() {
  clearInterval(timer);

  running = false;
  paused = false;

  currentKey.classList.remove("correct-flash");
  currentKey.textContent = "■";
  timeText.textContent = "STOPPED";
  timerFill.style.width = "0%";

  document.getElementById("pauseBtn").textContent = "Pause";
}

document.addEventListener("keydown", e => {
  if (!running || paused) return;

  const pressed = e.key.toUpperCase();
  const neededKey = sequence[currentIndex];

  if (!allowedKeys.includes(pressed)) return;

  if (pressed === neededKey) {
    handleCorrectKey();
  } else {
    failGame("WRONG KEY");
  }
});

addControls();
setDifficulty("medium");
