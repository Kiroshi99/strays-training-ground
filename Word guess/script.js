
// ========================================
// STRAYS WORD BREAKER
// 5 LETTERS | 6 GUESSES
// GUESS HISTORY ENABLED
// ========================================

// WORD LIST

const WORDS = [
  "APPLE", "BRAVE", "CHAIR", "CLOUD", "DREAM",
  "EARTH", "FLAME", "GHOST", "HOUSE", "LIGHT",
  "MONEY", "NIGHT", "OCEAN", "PARTY", "QUEEN",
  "RIVER", "SNAKE", "TRAIN", "UNITY", "VOICE",
  "WATER", "YOUNG", "ZEBRA", "CRIME", "CHASE",
  "SPEED", "SHOOT", "GUARD", "RADIO", "ALARM",
  "BRAIN", "CROWN", "DEVIL", "ENEMY", "FIGHT",
  "GRACE", "HEART", "INDEX", "JUDGE", "KNIFE",
  "LASER", "MAGIC", "NURSE", "ORDER", "POWER",
  "QUICK", "ROBOT", "STORM", "TRUST", "VALUE",
  "WORLD", "ANGEL", "BEACH", "CHESS", "DANCE",
  "EVENT", "FRUIT", "GIANT", "HONEY", "IMAGE",
  "JUICE", "LEMON", "MANGO", "MOTOR", "PILOT",
  "PIZZA", "PLANT", "SUGAR", "TIGER", "TOWER",
  "WHEEL", "WITCH", "BLOOD", "BLACK", "BLOCK",
  "CRASH", "DRIVE", "DRIFT", "FIELD", "FLASH",
  "GREEN", "GROUP", "HAPPY", "HOTEL", "LEGAL",
  "LUNCH", "METAL", "MOUSE", "MUSIC", "PAINT",
  "PHONE", "PLANE", "PRIZE", "PUNCH", "ROUND",
  "SCORE", "SHIFT", "SKILL", "SMART", "SMILE",
  "SOLVE", "SPACE", "SPELL", "SQUAD", "STAGE",
  "STEAL", "STEEL", "STONE", "STRAY", "STYLE",
  "SWEET", "SWORD", "TABLE", "TEACH", "THEFT",
  "THINK", "THREE", "THROW", "TOUCH", "TRACK",
  "TRADE", "TRIAL", "TRICK", "TRUCK", "TRUTH",
  "UNDER", "VALID", "VAULT", "VIDEO", "VISIT",
  "WATCH", "WHITE", "WHOLE", "WORTH", "WRITE"
];

// GAME SETTINGS

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

let secretWord = "";
let previousWord = "";

let currentGuess = "";
let guessesUsed = 0;

let gameOver = false;
let showingResult = false;

// Stores previous guesses
let guessHistory = [];

const board = document.getElementById("board");
const message = document.getElementById("message");
const historyContainer = document.getElementById("history");

const attemptDisplay =
  document.getElementById("attempt");

const remainingDisplay =
  document.getElementById("remaining");

// ========================================
// START NEW GAME
// ========================================

function startGame() {

  const availableWords = WORDS.filter(
    word => word !== previousWord
  );

  secretWord = availableWords[
    Math.floor(Math.random() * availableWords.length)
  ];

  previousWord = secretWord;

  currentGuess = "";
  guessesUsed = 0;

  gameOver = false;
  showingResult = false;

  guessHistory = [];

  message.textContent = "Type your first guess!";
  message.style.color = "#00d9ff";

  createBoard();
  renderHistory();
  updateStats();
}

// ========================================
// CREATE FIVE ACTIVE BOXES
// ========================================

function createBoard() {

  board.innerHTML = "";

  for (let i = 0; i < WORD_LENGTH; i++) {

    const tile = document.createElement("div");

    tile.className = "tile";

    board.appendChild(tile);
  }
}

// ========================================
// UPDATE ACTIVE BOXES
// ========================================

function updateBoard() {

  for (let i = 0; i < WORD_LENGTH; i++) {

    const tile = board.children[i];

    const letter = currentGuess[i] || "";

    tile.textContent = letter;

    tile.classList.toggle(
      "filled",
      letter !== ""
    );
  }
}

// ========================================
// CLEAR FOR NEXT GUESS
// ========================================

function nextGuess() {

  if (gameOver) return;

  currentGuess = "";
  showingResult = false;

  for (const tile of board.children) {

    tile.textContent = "";
    tile.className = "tile";
  }

  message.textContent =
    "Guess " + (guessesUsed + 1) + " of 6";

  message.style.color = "#00d9ff";
}

// ========================================
// CHECK LETTER POSITIONS
// ========================================

function checkGuess(guess, answer) {

  const result =
    Array(WORD_LENGTH).fill("absent");

  const remainingLetters = {};

  // First pass: exact positions

  for (let i = 0; i < WORD_LENGTH; i++) {

    if (guess[i] === answer[i]) {

      result[i] = "correct";

    } else {

      const letter = answer[i];

      remainingLetters[letter] =
        (remainingLetters[letter] || 0) + 1;
    }
  }

  // Second pass: wrong positions

  for (let i = 0; i < WORD_LENGTH; i++) {

    if (result[i] === "correct") continue;

    const letter = guess[i];

    if ((remainingLetters[letter] || 0) > 0) {

      result[i] = "present";
      remainingLetters[letter]--;
    }
  }

  return result;
}

// ========================================
// ADD GUESS TO HISTORY
// ========================================

function addToHistory(guess, results) {

  guessHistory.push({
    word: guess,
    results: [...results]
  });

  renderHistory();
}

// ========================================
// RENDER ALL GUESS HISTORY
// ========================================

function renderHistory() {

  historyContainer.innerHTML = "";

  if (guessHistory.length === 0) {

    const empty = document.createElement("p");

    empty.className = "empty-history";
    empty.textContent = "No guesses yet.";

    historyContainer.appendChild(empty);

    return;
  }

  guessHistory.forEach((entry, index) => {

    // Create entry container

    const historyEntry =
      document.createElement("div");

    historyEntry.className = "history-entry";

    // Guess number

    const number =
      document.createElement("div");

    number.className = "history-number";

    number.textContent = "#" + (index + 1);

    historyEntry.appendChild(number);

    // Create 5-letter history row

    const row =
      document.createElement("div");

    row.className = "history-row";

    for (let i = 0; i < WORD_LENGTH; i++) {

      const tile =
        document.createElement("div");

      tile.className =
        "history-tile " + entry.results[i];

      tile.textContent = entry.word[i];

      row.appendChild(tile);
    }

    historyEntry.appendChild(row);

    historyContainer.appendChild(historyEntry);
  });
}

// ========================================
// SUBMIT GUESS
// ========================================

function submitGuess() {

  if (gameOver || showingResult) return;

  if (currentGuess.length !== WORD_LENGTH) {

    message.textContent =
      "You need exactly 5 letters!";

    message.style.color = "#ffbb55";

    return;
  }

  const guess = currentGuess;

  const results = checkGuess(
    guess,
    secretWord
  );

  // Colour active boxes

  for (let i = 0; i < WORD_LENGTH; i++) {

    const tile = board.children[i];

    tile.className =
      "tile " + results[i];
  }

  // Count attempt

  guessesUsed++;

  // SAVE GUESS TO HISTORY
  addToHistory(guess, results);

  updateStats();

  // ====================================
  // WIN
  // ====================================

  if (guess === secretWord) {

    gameOver = true;

    message.textContent =
      "ACCESS GRANTED! Correct word: " +
      secretWord +
      " | Attempts: " +
      guessesUsed;

    message.style.color = "#22dd99";

    return;
  }

  // ====================================
  // LOSE AFTER SIX GUESSES
  // ====================================

  if (guessesUsed >= MAX_GUESSES) {

    gameOver = true;

    message.textContent =
      "ACCESS DENIED! The word was " +
      secretWord;

    message.style.color = "#ff5555";

    return;
  }

  // Wait until the player starts typing
  // before clearing the active row.

  showingResult = true;

  message.textContent =
    "Incorrect! " +
    (MAX_GUESSES - guessesUsed) +
    " attempts remaining. Type your next guess.";

  message.style.color = "#00d9ff";
}

// ========================================
// UPDATE STATS
// ========================================

function updateStats() {

  const nextAttempt = Math.min(
    guessesUsed + 1,
    MAX_GUESSES
  );

  attemptDisplay.textContent =
    nextAttempt + " / " + MAX_GUESSES;

  remainingDisplay.textContent =
    MAX_GUESSES - guessesUsed;
}

// ========================================
// PHYSICAL KEYBOARD
// ========================================

document.addEventListener("keydown", event => {

  if (
    event.ctrlKey ||
    event.altKey ||
    event.metaKey
  ) return;

  // Ignore typing in other input fields
  const target = event.target;

  if (
    target instanceof HTMLElement &&
    (
      target.matches("input, textarea, select") ||
      target.isContentEditable
    )
  ) return;

  if (gameOver) return;

  const key = event.key.toUpperCase();

  // ENTER

  if (key === "ENTER") {

    event.preventDefault();

    if (showingResult) {
      nextGuess();
    } else {
      submitGuess();
    }

    return;
  }

  // BACKSPACE

  if (key === "BACKSPACE") {

    event.preventDefault();

    if (showingResult) {
      nextGuess();
      return;
    }

    currentGuess =
      currentGuess.slice(0, -1);

    updateBoard();

    return;
  }

  // LETTERS A-Z

  if (/^[A-Z]$/.test(key)) {

    if (showingResult) {
      nextGuess();
    }

    if (currentGuess.length < WORD_LENGTH) {

      currentGuess += key;

      updateBoard();
    }
  }
});

// ========================================
// NEW GAME BUTTON
// ========================================

document.getElementById("newGame")
  .addEventListener("click", startGame);

// ========================================
// INITIALISE
// ========================================

startGame();
