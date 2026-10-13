
"use strict";

// ==========================================
// GAME SETTINGS
// ==========================================

const GRID_SIZE = 7;
const NUMBERS = 8;
const ROUNDS = 3;

const MEMORISE_TIME = 7;
const CLICK_TIME = 7;

// Four random squares per blink
const GROUP_SIZE = 4;

// Switch random group every 1 second
const BLINK_INTERVAL = 1000;

// ==========================================
// HTML ELEMENTS
// ==========================================

const grid = document.getElementById("grid");

const startBtn = document.getElementById("startBtn");

const roundText = document.getElementById("roundText");

const phaseText = document.getElementById("phaseText");

const timeText = document.getElementById("timeText");

const timerBar = document.getElementById("timerBar");

const instruction = document.getElementById("instruction");

// ==========================================
// GAME VARIABLES
// ==========================================

const tiles = [];

let round = 1;
let phase = "ready";

let sequence = [];
let expectedNumber = 1;

let blinkGroups = [];
let previousGroupKeys = [];

let timerId = null;
let blinkIntervalId = null;
let nextRoundId = null;

// ==========================================
// CREATE 7X7 GRID
// ==========================================

for (
  let i = 0;
  i < GRID_SIZE * GRID_SIZE;
  i++
) {
  const tile = document.createElement("button");

  tile.type = "button";
  tile.className = "tile";
  tile.disabled = true;

  tile.setAttribute(
    "aria-label",
    `Square ${i + 1}`
  );

  tile.addEventListener("click", () => {
    clickTile(i);
  });

  grid.appendChild(tile);
  tiles.push(tile);
}

// ==========================================
// START GAME
// ==========================================

startBtn.addEventListener("click", startGame);

function startGame() {
  clearTimers();

  round = 1;
  startBtn.disabled = true;

  beginRound();
}

// ==========================================
// STATUS MESSAGE
// ==========================================

function setInstruction(message, variant = "") {
  instruction.textContent = message;

  instruction.className =
    "instruction" +
    (variant ? ` ${variant}` : "");
}

// ==========================================
// BEGIN ROUND
// ==========================================

function beginRound() {
  clearTimers();

  expectedNumber = 1;
  previousGroupKeys = [];
  blinkGroups = [];

  // Random locations for numbers 1-8
  sequence = shuffledIndices(
    tiles.length
  ).slice(0, NUMBERS);

  phase = "memorise";

  roundText.innerHTML =
    `${String(round).padStart(2, "0")} ` +
    `<span>/ ${String(ROUNDS).padStart(2, "0")}</span>`;

  phaseText.textContent = "MEMORISE";

  setInstruction(
    "Memorise the glowing numbered squares [1–8]."
  );

  // Reset all 49 squares
  tiles.forEach((tile, i) => {
    const n = sequence.indexOf(i);

    tile.className =
      n === -1
        ? "tile"
        : "tile blink-tile";

    tile.textContent =
      n === -1
        ? ""
        : String(n + 1);

    tile.disabled = true;
  });

  // Start 7-second memorisation
  startTimer(
    "memorise",
    MEMORISE_TIME,
    beginClickPhase
  );

  // Show first group immediately
  showRandomGroup();

  // New random group every second
  blinkIntervalId = setInterval(() => {
    if (phase === "memorise") {
      showRandomGroup();
    }
  }, BLINK_INTERVAL);
}

// ==========================================
// RANDOM SHUFFLE
// ==========================================

function shuffledIndices(n) {
  const list = Array.from(
    { length: n },
    (_, i) => i
  );

  for (
    let i = list.length - 1;
    i > 0;
    i--
  ) {
    const j = Math.floor(
      Math.random() * (i + 1)
    );

    [list[i], list[j]] = [
      list[j],
      list[i]
    ];
  }

  return list;
}

// ==========================================
// GROUP IDENTIFIER
// ==========================================

function groupKey(group) {
  return [...group]
    .sort((a, b) => a - b)
    .join(",");
}

// ==========================================
// RANDOM BLINKING
// ==========================================

function showRandomGroup() {
  if (phase !== "memorise") return;

  // Create two groups of four.
  // Both groups together contain
  // all eight numbers.

  if (blinkGroups.length === 0) {
    let candidate;
    let attempts = 0;

    do {
      const shuffled =
        shuffledIndices(NUMBERS);

      candidate = [
        shuffled.slice(0, GROUP_SIZE),
        shuffled.slice(GROUP_SIZE)
      ];

      attempts++;

    } while (
      attempts < 100 &&
      candidate.some(group =>
        previousGroupKeys.includes(
          groupKey(group)
        )
      )
    );

    blinkGroups = candidate;
  }

  // Choose next random group
  const group = blinkGroups.shift();

  previousGroupKeys.push(
    groupKey(group)
  );

  // Remember last two groups
  if (previousGroupKeys.length > 2) {
    previousGroupKeys.shift();
  }

  // Turn previous numbers black
  sequence.forEach(position => {
    tiles[position].classList.remove("lit");
  });

  // Instantly light up four random numbers
  for (const numberIndex of group) {
    const position = sequence[numberIndex];

    tiles[position].classList.add("lit");
  }
}

// ==========================================
// CLICKING PHASE
// ==========================================

function beginClickPhase() {
  stopBlinking();

  // Hide numbers
  tiles.forEach(tile => {
    tile.className = "tile clickable";
    tile.textContent = "";
    tile.disabled = false;
  });

  phaseText.textContent = "RECALL";

  setInstruction(
    "Find the hidden squares in numerical order: 1 → 8."
  );

  // Start 7-second recall timer
  startTimer(
    "click",
    CLICK_TIME,
    () => {
      finish(
        false,
        "Time's up! Access denied."
      );
    }
  );
}

// ==========================================
// PLAYER CLICKS
// ==========================================

function clickTile(position) {
  if (phase !== "click") return;

  const tile = tiles[position];

  const wanted =
    sequence[expectedNumber - 1];

  // WRONG SQUARE
  if (position !== wanted) {
    tile.className = "tile wrong";

    finish(
      false,
      `Wrong square! Number ${expectedNumber} was elsewhere.`
    );

    return;
  }

  // CORRECT SQUARE
  tile.className = "tile correct";

  tile.textContent =
    String(expectedNumber);

  tile.disabled = true;
  expectedNumber++;

  // ALL EIGHT COMPLETED
  if (expectedNumber > NUMBERS) {
    clearTimers();

    phase = "transition";

    tiles.forEach(tile => {
      tile.disabled = true;
    });

    // FINAL ROUND
    if (round === ROUNDS) {
      finish(
        true,
        "All three rounds completed. Ammunation access granted."
      );
    } else {
      phaseText.textContent =
        "COMPLETE";

      setInstruction(
        `Round ${round} cleared! Loading next sequence…`,
        "success"
      );

      timeText.innerHTML =
        '0.0<span>s</span>';

      // Move to next round
      nextRoundId = setTimeout(() => {
        round++;
        beginRound();
      }, 950);
    }

  } else {
    setInstruction(
      `Correct! Now find number ${expectedNumber}.`
    );
  }
}

// ==========================================
// COUNTDOWN TIMER
// ==========================================

function startTimer(
  newPhase,
  seconds,
  onExpire
) {
  if (timerId !== null) {
    cancelAnimationFrame(timerId);
  }

  phase = newPhase;

  const deadline =
    performance.now() + seconds * 1000;

  function tick() {
    if (phase !== newPhase) return;

    const remaining = Math.max(
      0,
      (deadline - performance.now()) / 1000
    );

    // Countdown number
    timeText.innerHTML =
      `${remaining.toFixed(1)}<span>s</span>`;

    // Countdown bar
    timerBar.style.width =
      `${(remaining / seconds) * 100}%`;

    // When time expires
    if (remaining <= 0) {
      timerId = null;
      onExpire();
      return;
    }

    timerId = requestAnimationFrame(tick);
  }

  tick();
}

// ==========================================
// SUCCESS / FAILURE
// ==========================================

function finish(won, message) {
  clearTimers();

  phase = "finished";

  tiles.forEach(tile => {
    tile.disabled = true;
  });

  phaseText.textContent =
    won ? "SUCCESS" : "FAILED";

  setInstruction(
    message,
    won ? "success" : "failure"
  );

  startBtn.textContent =
    "PLAY AGAIN ↗";

  startBtn.disabled = false;

  timerBar.style.width = "0%";
}

// ==========================================
// STOP BLINKING
// ==========================================

function stopBlinking() {
  if (blinkIntervalId !== null) {
    clearInterval(blinkIntervalId);
    blinkIntervalId = null;
  }

  tiles.forEach(tile => {
    tile.classList.remove("lit");
  });
}

// ==========================================
// CLEAR ALL TIMERS
// ==========================================

function clearTimers() {
  if (timerId !== null) {
    cancelAnimationFrame(timerId);
    timerId = null;
  }

  if (nextRoundId !== null) {
    clearTimeout(nextRoundId);
    nextRoundId = null;
  }

  stopBlinking();
}
