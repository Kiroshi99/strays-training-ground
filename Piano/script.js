
/* =====================================
   STRAYS RHYTHM LOCK
   NEON / XENON EDITION

   3 DIFFICULTY LEVELS
   EASY   = 1x SPEED
   NORMAL = 2x SPEED
   HARD   = 4x SPEED

   +1 POINT PER SUCCESSFUL HIT
===================================== */

const KEYMAP = ["a", "s", "d", "j", "k", "l"];

/* =====================================
   DIFFICULTY SETTINGS

   travel = milliseconds until a
   falling tile reaches the hit line.

   Smaller travel = faster notes.

   Each level is 2x faster.
===================================== */

const MODES = {

  easy: {
    travel: 2000,
    interval: 550,
    hitMargin: 22,
    maxMiss: 3,
    maxWrong: 3
  },

  normal: {
    travel: 1000,
    interval: 350,
    hitMargin: 22,
    maxMiss: 3,
    maxWrong: 3
  },

  hard: {
    travel: 750,
    interval: 250,
    hitMargin: 22,
    maxMiss: 3,
    maxWrong: 3
  }

};

/* =====================================
   HTML ELEMENTS
===================================== */

const $ = id => document.getElementById(id);

const stage = $("stage");
const notesLayer = $("notes");
const hitLine = $("hitLine");
const overlay = $("overlay");

const difficulty = $("difficulty");
const pauseBtn = $("pauseBtn");
const soundBtn = $("soundBtn");

const keys = [
  ...document.querySelectorAll(".keyboard button")
];

const lanes = [
  ...document.querySelectorAll(".lane")
];

/* =====================================
   GAME VARIABLES
===================================== */

let game;

let animationId = null;
let lastFrame = 0;

let soundEnabled = false;
let audioContext = null;

/* =====================================
   BEST SCORE STORAGE
===================================== */

const bestKey = () =>
  "strays-rhythm-one-point-" + difficulty.value;

function getBest() {

  try {

    return Number(
      localStorage.getItem(bestKey())
    ) || 0;

  } catch {

    return 0;

  }
}

function saveBest(score) {

  try {

    localStorage.setItem(
      bestKey(),
      String(score)
    );

  } catch {}

}

/* =====================================
   NEW GAME DATA
===================================== */

function newGame() {

  return {

    phase: "ready",

    time: 0,
    nextSpawn: 0,

    notes: [],

    score: 0,
    best: getBest(),

    misses: 0,
    wrong: 0,

    combo: 0,
    maxCombo: 0,

    config: MODES[difficulty.value]

  };

}

/* =====================================
   SOUND EFFECTS
===================================== */

function playSound(
  frequency,
  duration = 0.09,
  type = "sine"
) {

  if (!soundEnabled) return;

  try {

    const AudioClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioClass) return;

    if (!audioContext) {
      audioContext = new AudioClass();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const oscillator =
      audioContext.createOscillator();

    const volume =
      audioContext.createGain();

    const now =
      audioContext.currentTime;

    oscillator.type = type;

    oscillator.frequency.value =
      frequency;

    volume.gain.setValueAtTime(
      0.04,
      now
    );

    volume.gain.exponentialRampToValueAtTime(
      0.001,
      now + duration
    );

    oscillator.connect(volume);

    volume.connect(
      audioContext.destination
    );

    oscillator.start(now);

    oscillator.stop(
      now + duration + 0.01
    );

  } catch {}

}

/* =====================================
   UPDATE SCOREBOARD
===================================== */

function updateHUD() {

  $("scoreTop").textContent =
    game.score;

  $("scoreBottom").textContent =
    game.score;

  $("bestTop").textContent =
    game.best;

  $("bestBottom").textContent =
    game.best;

  $("misses").textContent =
    `${game.misses}/${game.config.maxMiss}`;

  $("wrong").textContent =
    `${game.wrong}/${game.config.maxWrong}`;

  $("combo").textContent =
    `Combo: ${game.combo} · Max: ${game.maxCombo}`;

  $("progressFill").style.width =
    `${Math.min(100, game.combo * 5)}%`;

  pauseBtn.disabled =
    game.phase === "ready" ||
    game.phase === "over";

  pauseBtn.textContent =
    game.phase === "paused"
      ? "Resume"
      : "Pause";

  difficulty.disabled =
    game.phase === "playing" ||
    game.phase === "paused";

}

/* =====================================
   OVERLAY
===================================== */

function showOverlay(
  title,
  message,
  buttonText
) {

  $("overlayTitle").textContent =
    title;

  $("overlayMessage").textContent =
    message;

  $("startBtn").textContent =
    buttonText;

  overlay.classList.add("active");

}

function hideOverlay() {

  overlay.classList.remove("active");

}

/* =====================================
   CLEAR FALLING NOTES
===================================== */

function clearNotes() {

  notesLayer.replaceChildren();

  if (game) {
    game.notes = [];
  }

}

/* =====================================
   RESET GAME
===================================== */

function resetGame() {

  cancelAnimationFrame(animationId);

  animationId = null;

  clearNotes();

  game = newGame();

  updateHUD();

  showOverlay(
    "RHYTHM LOCK",
    "Choose Easy (1x), Normal (2x), or Hard (4x). Hit the matching key when a neon tile reaches the cyan line. +1 for each hit.",
    "START GAME"
  );

}

/* =====================================
   START GAME
===================================== */

function startGame() {

  cancelAnimationFrame(animationId);

  animationId = null;

  clearNotes();

  game = newGame();

  game.phase = "playing";

  lastFrame = performance.now();

  hideOverlay();

  updateHUD();

  animationId =
    requestAnimationFrame(gameLoop);

}

/* =====================================
   PAUSE / RESUME
===================================== */

function togglePause() {

  if (game.phase === "playing") {

    game.phase = "paused";

    cancelAnimationFrame(animationId);

    animationId = null;

    showOverlay(
      "PAUSED",
      "Press resume when you're ready.",
      "RESUME"
    );

  } else if (game.phase === "paused") {

    game.phase = "playing";

    lastFrame = performance.now();

    hideOverlay();

    animationId =
      requestAnimationFrame(gameLoop);

  }

  updateHUD();

}

/* =====================================
   GAME OVER
===================================== */

function gameOver(reason) {

  if (game.phase !== "playing") return;

  game.phase = "over";

  cancelAnimationFrame(animationId);

  animationId = null;

  clearNotes();

  showOverlay(
    "GAME OVER",
    `${reason} Score: ${game.score} · Best: ${game.best} · Max combo: ${game.maxCombo}`,
    "PLAY AGAIN"
  );

  updateHUD();

  playSound(
    160,
    0.2,
    "triangle"
  );

}

/* =====================================
   SPAWN NEON TILE
===================================== */

function spawnNote(spawnTime) {

  const lane =
    Math.floor(Math.random() * 6);

  const element =
    document.createElement("div");

  element.className = "note";

  // Centre tile in its lane.
  element.style.left =
    `${(lane + 0.5) / 6 * 100}%`;

  notesLayer.appendChild(element);

  game.notes.push({

    lane,
    spawnTime,
    element

  });

}

/* =====================================
   REMOVE NOTE
===================================== */

function removeNote(note) {

  note.element.remove();

  const index =
    game.notes.indexOf(note);

  if (index !== -1) {

    game.notes.splice(
      index,
      1
    );

  }

}

/* =====================================
   FLOATING HIT FEEDBACK
===================================== */

function feedback(
  lane,
  label,
  kind
) {

  const element =
    document.createElement("div");

  element.className =
    `feedback ${kind}`;

  element.textContent =
    label;

  element.style.left =
    `${(lane + 0.5) / 6 * 100}%`;

  notesLayer.appendChild(element);

  setTimeout(() => {

    element.remove();

  }, 650);

}

/* =====================================
   KEYBOARD FLASH EFFECT
===================================== */

function flashKey(lane) {

  keys[lane].classList.add("pressed");

  lanes[lane].classList.remove("flash");

  void lanes[lane].offsetWidth;

  lanes[lane].classList.add("flash");

  setTimeout(() => {

    keys[lane].classList.remove("pressed");

  }, 120);

}

/* =====================================
   DISTANCE TO NEON HIT LINE
===================================== */

function distanceToLine(note) {

  const tile =
    note.element.getBoundingClientRect();

  const line =
    hitLine.getBoundingClientRect();

  const tileCentre =
    (tile.top + tile.bottom) / 2;

  const lineCentre =
    (line.top + line.bottom) / 2;

  return Math.abs(
    tileCentre - lineCentre
  );

}

/* =====================================
   COLLISION DETECTION

   A note must be touching or near
   the glowing cyan line to score.

   hitMargin provides some tolerance
   so hits don't feel unfair.
===================================== */

function isHittable(note) {

  const tile =
    note.element.getBoundingClientRect();

  const line =
    hitLine.getBoundingClientRect();

  const tolerance =
    game.config.hitMargin;

  return (

    tile.top <=
      line.bottom + tolerance &&

    tile.bottom >=
      line.top - tolerance

  );

}

/* =====================================
   HIT NOTE

   +1 SCORE PER SUCCESSFUL TILE
   NO MULTIPLIERS
===================================== */

function hitNote(lane) {

  if (game.phase !== "playing") {
    return;
  }

  flashKey(lane);

  // Find hittable tile in correct lane.
  const note = game.notes

    .filter(item =>
      item.lane === lane &&
      isHittable(item)
    )

    .sort((a, b) =>
      distanceToLine(a) -
      distanceToLine(b)
    )[0];

  /* =============================
     CORRECT HIT
  ============================= */

  if (note) {

    // Remove tile immediately,
    // preventing double scoring.
    removeNote(note);

    // Exactly 1 point.
    game.score += 1;

    game.combo++;

    game.maxCombo = Math.max(
      game.maxCombo,
      game.combo
    );

    if (game.score > game.best) {

      game.best = game.score;

      saveBest(game.best);

    }

    feedback(
      lane,
      "+1",
      "hit"
    );

    const frequencies = [
      262,
      294,
      330,
      392,
      440,
      523
    ];

    playSound(
      frequencies[lane]
    );

  }

  /* =============================
     WRONG KEY

     Another lane has a hittable
     note, but wrong key pressed.
  ============================= */

  else if (
    game.notes.some(isHittable)
  ) {

    game.wrong++;

    game.combo = 0;

    feedback(
      lane,
      "WRONG",
      "wrong"
    );

    playSound(
      110,
      0.12,
      "square"
    );

    if (
      game.wrong >=
      game.config.maxWrong
    ) {

      gameOver(
        "Too many wrong keys!"
      );

      return;

    }

  }

  /* =============================
     EARLY KEY PRESS

     No points awarded.
     No wrong penalty.
  ============================= */

  else {

    feedback(
      lane,
      "WAIT",
      "wait"
    );

  }

  updateHUD();

}

/* =====================================
   MAIN GAME LOOP

   EASY:   4000ms
   NORMAL: 2000ms
   HARD:   1000ms

   Each difficulty doubles the speed.
===================================== */

function gameLoop(now) {

  if (game.phase !== "playing") {
    return;
  }

  const delta = Math.min(
    Math.max(now - lastFrame, 0),
    55
  );

  lastFrame = now;

  game.time += delta;

  /* =============================
     SPAWN NEW TILES
  ============================= */

  while (
    game.time >= game.nextSpawn
  ) {

    spawnNote(
      game.nextSpawn
    );

    game.nextSpawn +=
      game.config.interval;

  }

  /* =============================
     FIND HIT LINE POSITION
  ============================= */

  const layer =
    notesLayer.getBoundingClientRect();

  const line =
    hitLine.getBoundingClientRect();

  const targetCentreY =
    (line.top + line.bottom) / 2 -
    layer.top;

  /* =============================
     MOVE ALL NEON TILES
  ============================= */

  for (const note of [...game.notes]) {

    const tileHeight =
      note.element.offsetHeight;

    const startTop =
      -tileHeight - 8;

    const targetTop =
      targetCentreY -
      tileHeight / 2;

    // Falling speed depends on
    // selected difficulty.
    const progress =
      (game.time - note.spawnTime) /
      game.config.travel;

    const y =
      startTop +
      progress *
      (targetTop - startTop);

    note.element.style.transform =
      `translate(-50%, ${y}px)`;

    /* =========================
       CHECK FOR MISSED TILE

       Only counts when tile
       passes the scoring zone.
    ========================= */

    const tile =
      note.element.getBoundingClientRect();

    if (
      tile.top >
      line.bottom +
      game.config.hitMargin
    ) {

      removeNote(note);

      game.misses++;

      game.combo = 0;

      feedback(
        note.lane,
        "MISS",
        "miss"
      );

      playSound(
        150,
        0.1,
        "sawtooth"
      );

      updateHUD();

      if (
        game.misses >=
        game.config.maxMiss
      ) {

        gameOver(
          "Too many missed notes!"
        );

        return;

      }

    }

  }

  animationId =
    requestAnimationFrame(gameLoop);

}

/* =====================================
   KEYBOARD INPUTS
===================================== */

document.addEventListener(
  "keydown",
  event => {

    // Prevent holding down a key
    // from registering repeated hits.
    if (event.repeat) return;

    if (
      ["INPUT", "TEXTAREA", "SELECT"]
      .includes(event.target.tagName)
    ) {
      return;
    }

    const key =
      event.key.toLowerCase();

    const lane =
      KEYMAP.indexOf(key);

    /* A S D J K L */

    if (lane !== -1) {

      event.preventDefault();

      hitNote(lane);

    }

    /* =========================
       SPACE = START / RESUME
    ========================= */

    if (event.code === "Space") {

      event.preventDefault();

      if (
        game.phase === "ready" ||
        game.phase === "over"
      ) {

        startGame();

      } else if (
        game.phase === "paused"
      ) {

        togglePause();

      }

    }

    /* =========================
       ESCAPE = PAUSE / RESUME
    ========================= */

    if (
      event.key === "Escape" &&
      ["playing", "paused"]
      .includes(game.phase)
    ) {

      togglePause();

    }

  }
);

/* =====================================
   MOUSE AND TOUCH CONTROLS
===================================== */

keys.forEach(
  (button, lane) => {

    button.addEventListener(
      "pointerdown",
      event => {

        event.preventDefault();

        hitNote(lane);

      }
    );

  }
);

/* =====================================
   START BUTTON
===================================== */

$("startBtn").addEventListener(
  "click",
  () => {

    if (game.phase === "paused") {

      togglePause();

    } else {

      startGame();

    }

  }
);

/* =====================================
   RESTART BUTTON
===================================== */

$("restartBtn").addEventListener(
  "click",
  startGame
);

/* =====================================
   PAUSE BUTTON
===================================== */

pauseBtn.addEventListener(
  "click",
  togglePause
);

/* =====================================
   DIFFICULTY SELECTION
===================================== */

difficulty.addEventListener(
  "change",
  resetGame
);

/* =====================================
   SOUND TOGGLE
===================================== */

soundBtn.addEventListener(
  "click",
  () => {

    soundEnabled = !soundEnabled;

    soundBtn.textContent =
      "Sound: " +
      (soundEnabled ? "On" : "Off");

    if (soundEnabled) {

      playSound(440);

    }

  }
);

/* =====================================
   AUTO PAUSE WHEN TAB HIDDEN
===================================== */

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.hidden &&
      game.phase === "playing"
    ) {

      togglePause();

    }

  }
);

/* =====================================
   INITIALISE GAME
===================================== */

resetGame();
