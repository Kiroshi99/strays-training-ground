// ========================================
// GET HTML ELEMENTS
// ========================================

// Target colour bar
const targetBar = document.getElementById("target-bar");

// Area where letters exist
const lettersArea = document.getElementById("letters-area");

// Play button
const playButton = document.getElementById("play-button");

// Restart button
const restartButton = document.getElementById("restart-button");

// Loading popup
const loadingScreen = document.getElementById("loading-screen");

// Score text
const scoreDisplay = document.getElementById("score-display");

// Timer text
const timerDisplay = document.getElementById("timer-display");


// ========================================
// GAME VARIABLES
// ========================================

// Is game running?
let gameRunning = false;

// Letter spawn interval
let letterInterval;

// Timer interval
let timerInterval;

// Current score
let score = 0;

// Game start timestamp
let startTime = 0;

// Current target colour
let targetColor = "";


// ========================================
// GAME DATA
// ========================================

// Possible keyboard letters
const keys = ["A", "S", "D", "F", "H", "J", "K", "L"];

// Possible colours
const colors = ["green", "orange", "pink"];


// ========================================
// DIFFICULTY SETTINGS
// ========================================

const difficultySettings = {

  // Easy mode
  easy: {

    // How fast letters move
    speed: 2500,

    // How often letters spawn
    spawnRate: 1200,
  },

  // Hard mode
  hard: {

    speed: 1100,

    spawnRate: 900,
  },

  // Extreme mode
  extreme: {

    speed: 800,

    spawnRate: 600,
  },
};


// Default difficulty
let currentDifficulty = difficultySettings.easy;


// ========================================
// DIFFICULTY BUTTON LOGIC
// ========================================

document.querySelectorAll(".difficulty-btn").forEach((btn) => {

  // When difficulty button clicked
  btn.addEventListener("click", () => {

    // Remove active effect from all buttons
    document.querySelectorAll(".difficulty-btn").forEach((b) => {
      b.classList.remove("active");
    });

    // Add active effect to clicked button
    btn.classList.add("active");

    // Change difficulty settings
    currentDifficulty = difficultySettings[btn.dataset.difficulty];
  });
});


// ========================================
// PLAY BUTTON
// ========================================

playButton.addEventListener("click", () => {

  // Prevent starting twice
  if (gameRunning) return;

  // Show loading screen
  loadingScreen.style.display = "block";

  // Delay before game starts
  setTimeout(() => {

    // Hide loading screen
    loadingScreen.style.display = "none";

    // Start game
    startGame();

  }, 800);
});


// ========================================
// RESTART BUTTON
// ========================================

restartButton.addEventListener("click", () => {

  // Restart game
  startGame();
});


// ========================================
// START GAME
// ========================================

function startGame() {

  // Stop old intervals
  clearInterval(letterInterval);
  clearInterval(timerInterval);

  // Remove all letters
  lettersArea.innerHTML = "";

  // Reset score
  score = 0;

  // Update score display
  updateScoreDisplay();

  // Reset timer text
  timerDisplay.textContent = "Time: 0s";

  // Game is now running
  gameRunning = true;

  // Save current timestamp
  startTime = Date.now();

  // Hide buttons
  restartButton.style.display = "none";
  playButton.style.display = "none";

  // Generate first target colour
  generateTarget();

  // Spawn first letter immediately
  createLetter();

  // Spawn letters repeatedly
  letterInterval = setInterval(() => {

    createLetter();

  }, currentDifficulty.spawnRate);

  // Update timer every second
  timerInterval = setInterval(() => {

    updateTimer();

  }, 1000);

  // Prevent duplicate listeners
  document.removeEventListener("keydown", handleKeyPress);

  // Listen for key presses
  document.addEventListener("keydown", handleKeyPress);
}


// ========================================
// GENERATE TARGET COLOUR
// ========================================

function generateTarget() {

  // Pick random colour
  targetColor = colors[Math.floor(Math.random() * colors.length)];

  // Change target bar colour
  targetBar.style.background = targetColor;
}


// ========================================
// CREATE LETTER
// ========================================

function createLetter() {

  // Stop if game ended
  if (!gameRunning) return;

  // Create HTML letter
  const letter = document.createElement("div");

  // Pick random key
  const key = keys[Math.floor(Math.random() * keys.length)];

  // Pick random colour
  const color = colors[Math.floor(Math.random() * colors.length)];

  // Add CSS class
  letter.className = "letter";

  // Set displayed text
  letter.textContent = key;

  // Set text colour
  letter.style.color = color;

  // Random X position
  letter.style.left = `${Math.random() * 85}%`;

  // Spawn below screen
  letter.style.top = `${lettersArea.clientHeight}px`;

  // Save colour
  letter.dataset.color = color;

  // Was it pressed already?
  letter.dataset.handled = "false";

  // Does player need to hit it?
  letter.dataset.mustHit = "false";

  // Add to screen
  lettersArea.appendChild(letter);

  // Animation starting timestamp
  let start = null;


  // ========================================
  // LETTER MOVEMENT LOOP
  // ========================================

  function animate(timestamp) {

    // Stop animation if game ended
    if (!gameRunning || !letter.parentElement) return;

    // Save first timestamp
    if (!start) start = timestamp;

    // Animation progress
    const progress =
      (timestamp - start) / currentDifficulty.speed;

    // Game area height
    const gameHeight = lettersArea.clientHeight;

    // Y movement calculation
    const y =
      gameHeight - progress * (gameHeight + 100);

    // Apply position
    letter.style.top = `${y}px`;

    // Letter position
    const letterRect = letter.getBoundingClientRect();

    // Bar position
    const targetRect = targetBar.getBoundingClientRect();


    // Is letter touching bar?
    const insideBar =
      letterRect.bottom >= targetRect.top &&
      letterRect.top <= targetRect.bottom;


    // Did letter fully pass above bar?
    const leftBar =
      letterRect.bottom < targetRect.top;


    // ========================================
    // CORRECT LETTER ENTERED BAR
    // ========================================

    if (
      insideBar &&
      letter.dataset.color === targetColor &&
      letter.dataset.handled === "false"
    ) {

      // Player now MUST hit this letter
      letter.dataset.mustHit = "true";
    }


    // ========================================
    // PLAYER MISSED CORRECT LETTER
    // ========================================

    if (
      leftBar &&
      letter.dataset.mustHit === "true" &&
      letter.dataset.handled === "false"
    ) {

      // End game
      gameFail(
        `You missed a correct letter: ${letter.textContent}`
      );

      return;
    }


    // Continue animation
    if (progress < 1) {

      requestAnimationFrame(animate);

    } else {

      // Remove letter when off screen
      if (letter.parentElement) {
        letter.remove();
      }
    }
  }

  // Start animation
  requestAnimationFrame(animate);
}


// ========================================
// HANDLE KEY PRESS
// ========================================

function handleKeyPress(e) {

  // Ignore if game ended
  if (!gameRunning) return;

  // Convert pressed key to uppercase
  const pressedKey = e.key.toUpperCase();

  // Ignore keys not in allowed list
  if (!keys.includes(pressedKey)) return;

  // Get all letters
  const letters = Array.from(
    document.querySelectorAll(".letter")
  );

  // Target bar position
  const targetRect = targetBar.getBoundingClientRect();


  // Check every letter
  for (const letter of letters) {

    // Letter position
    const rect = letter.getBoundingClientRect();

    // Is letter inside target bar?
    const insideBar =
      rect.bottom >= targetRect.top &&
      rect.top <= targetRect.bottom;


    // ========================================
    // CORRECT INPUT
    // ========================================

    if (
      letter.textContent === pressedKey &&
      letter.dataset.color === targetColor &&
      insideBar &&
      letter.dataset.handled === "false"
    ) {

      // Mark as pressed
      letter.dataset.handled = "true";

      // Add score
      score++;

      // Update score display
      updateScoreDisplay();

      // Generate new target colour
      generateTarget();

      // ========================================
      // FADE EFFECT
      // ========================================

      // Add fade animation class
      letter.classList.add("fade-out");

      // Remove after animation finishes
      setTimeout(() => {

        if (letter.parentElement) {
          letter.remove();
        }

      }, 250);

      return;
    }
  }


  // ========================================
  // WRONG INPUT
  // ========================================

  gameFail("Wrong key or bad timing.");
}


// ========================================
// UPDATE SCORE
// ========================================

function updateScoreDisplay() {

  scoreDisplay.textContent = `Score: ${score}`;
}


// ========================================
// UPDATE TIMER
// ========================================

function updateTimer() {

  // Seconds passed
  const elapsed =
    Math.floor((Date.now() - startTime) / 1000);

  // Update timer text
  timerDisplay.textContent = `Time: ${elapsed}s`;
}


// ========================================
// GAME OVER
// ========================================

function gameFail(reason) {

  // Prevent double fail
  if (!gameRunning) return;

  // Stop game
  gameRunning = false;

  // Stop spawning letters
  clearInterval(letterInterval);

  // Stop timer
  clearInterval(timerInterval);

  // Remove keyboard listener
  document.removeEventListener(
    "keydown",
    handleKeyPress
  );

  // Show buttons again
  restartButton.style.display = "inline-block";
  playButton.style.display = "inline-block";

  // Show game over popup
  alert(`Game Over! ${reason}`);
}