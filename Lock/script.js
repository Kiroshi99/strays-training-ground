const topLevel = document.getElementById("topLevel");
const centerLevel = document.getElementById("centerLevel");
const message = document.getElementById("message");

const timeText = document.getElementById("timeText");
const scoreText = document.getElementById("scoreText");
const highScoreText = document.getElementById("highScoreText");
const difficultyText = document.getElementById("difficultyText");

const hitBtn = document.getElementById("hitBtn");
const difficultyButtons = document.querySelectorAll(".difficulty");

const playerOrbit = document.getElementById("playerOrbit");
const targetOrbit = document.getElementById("targetOrbit");

const game = document.querySelector(".game");

let playing = false;
let waitingForFirstPress = true;

let score = 0;
let highScore = Number(localStorage.getItem("lockPickHighScore")) || 0;

let selectedDifficulty = "Easy";
let selectedSpeed = 140;

let lineAngle = 0;
let previousLineAngle = 0;

let pinAngle = 100;

let direction = 1;

let speed = selectedSpeed;

/*
  Bigger = easier.
  Smaller = harder.
*/
let hitWindow = 24;

let timeLeft = 10.0;

let lastTime = 0;
let rafId = null;

let graceTime = 0;

function setOrangePinAngle(deg) {
  playerOrbit.style.transform = `rotate(${deg}deg)`;
}

function setPinkLineAngle(deg) {
  targetOrbit.style.transform = `rotate(${deg}deg)`;
}

function normaliseAngle(angle) {
  return (angle + 360) % 360;
}

function smallestAngleDiff(a, b) {
  let diff = Math.abs(normaliseAngle(a) - normaliseAngle(b)) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateScoreDisplay() {
  topLevel.textContent = score;
  centerLevel.textContent = score;
  scoreText.textContent = score;
  highScoreText.textContent = highScore;
  difficultyText.textContent = selectedDifficulty;
}

function crossedAngle(previousAngle, currentAngle, targetAngle, dir) {
  previousAngle = normaliseAngle(previousAngle);
  currentAngle = normaliseAngle(currentAngle);
  targetAngle = normaliseAngle(targetAngle);

  if (dir === 1) {
    if (previousAngle < currentAngle) {
      return targetAngle > previousAngle && targetAngle <= currentAngle;
    }

    if (previousAngle > currentAngle) {
      return targetAngle > previousAngle || targetAngle <= currentAngle;
    }
  }

  if (dir === -1) {
    if (previousAngle > currentAngle) {
      return targetAngle < previousAngle && targetAngle >= currentAngle;
    }

    if (previousAngle < currentAngle) {
      return targetAngle < previousAngle || targetAngle >= currentAngle;
    }
  }

  return false;
}

function isPastTarget() {
  const diff = smallestAngleDiff(lineAngle, pinAngle);

  if (diff <= hitWindow + 8) {
    return false;
  }

  if (direction === 1) {
    const passedAngle = normaliseAngle(pinAngle + hitWindow + 8);
    return crossedAngle(pinAngle, lineAngle, passedAngle, direction);
  }

  const passedAngle = normaliseAngle(pinAngle - hitWindow - 8);
  return crossedAngle(pinAngle, lineAngle, passedAngle, direction);
}

function setNextPinPosition() {
  if (direction === 1) {
    pinAngle = normaliseAngle(lineAngle + randomBetween(85, 165));
  } else {
    pinAngle = normaliseAngle(lineAngle - randomBetween(85, 165));
  }

  setOrangePinAngle(pinAngle);
}

function saveHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("lockPickHighScore", highScore);
  }

  updateScoreDisplay();
}

function prepareGame() {
  cancelAnimationFrame(rafId);

  playing = false;
  waitingForFirstPress = true;

  score = 0;

  speed = selectedSpeed;
  hitWindow = 24;
  timeLeft = 10.0;

  lineAngle = 0;
  previousLineAngle = 0;

  direction = 1;

  pinAngle = 100;

  graceTime = 0;

  updateScoreDisplay();
  setPinkLineAngle(lineAngle);
  setOrangePinAngle(pinAngle);

  message.textContent = "Press E or SPACE to start";
  timeText.textContent = timeLeft.toFixed(1);
}

function beginMovement() {
  if (!waitingForFirstPress) return;

  waitingForFirstPress = false;
  playing = true;

  previousLineAngle = lineAngle;

  graceTime = 0.25;

  message.textContent = "Hit when the bar reaches the orb";

  lastTime = performance.now();
  rafId = requestAnimationFrame(loop);
}

function loop(now) {
  if (!playing) return;

  const delta = (now - lastTime) / 1000;
  lastTime = now;

  previousLineAngle = lineAngle;

  lineAngle = normaliseAngle(lineAngle + speed * delta * direction);

  setPinkLineAngle(lineAngle);

  timeLeft -= delta;
  timeText.textContent = Math.max(0, timeLeft).toFixed(1);

  if (graceTime > 0) {
    graceTime -= delta;
  } else {
    const failAngle =
      direction === 1
        ? normaliseAngle(pinAngle + hitWindow + 8)
        : normaliseAngle(pinAngle - hitWindow - 8);

    if (crossedAngle(previousLineAngle, lineAngle, failAngle, direction)) {
      loseGame("Missed it!");
      return;
    }
  }

  if (timeLeft <= 0) {
    loseGame("Time's up!");
    return;
  }

  rafId = requestAnimationFrame(loop);
}

function hit() {
  if (waitingForFirstPress) {
    beginMovement();
    return;
  }

  if (!playing) {
    prepareGame();
    beginMovement();
    return;
  }

  const diff = smallestAngleDiff(lineAngle, pinAngle);

  if (diff <= hitWindow) {
    successStep();
    return;
  }

  /*
    If you press when the bar is not inside the target:
    - if it is before the target = Too early
    - if it has already passed = Missed it
  */
  if (hasLinePassedTarget()) {
    loseGame("Missed it!");
  } else {
    loseGame("Too early!");
  }
}

function hasLinePassedTarget() {
  const current = normaliseAngle(lineAngle);
  const target = normaliseAngle(pinAngle);

  if (direction === 1) {
    if (target <= current) {
      return current - target > hitWindow;
    }

    return false;
  }

  if (direction === -1) {
    if (target >= current) {
      return target - current > hitWindow;
    }

    return false;
  }

  return false;
}

function successStep() {
  game.classList.remove("success-flash");
  void game.offsetWidth;
  game.classList.add("success-flash");

  score++;

  saveHighScore();

  speed = selectedSpeed;
  hitWindow = 24;

  timeLeft += 1.2;

  direction *= -1;

  setNextPinPosition();

  updateScoreDisplay();

  message.textContent = direction === 1 ? "Nice! Right" : "Nice! Left";
}

function loseGame(text) {
  playing = false;
  waitingForFirstPress = false;

  cancelAnimationFrame(rafId);

  saveHighScore();

  message.textContent = `${text} Final Score: ${score}`;

  game.classList.remove("fail-shake");
  void game.offsetWidth;
  game.classList.add("fail-shake");
}

difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    difficultyButtons.forEach((btn) => btn.classList.remove("active"));

    button.classList.add("active");

    selectedDifficulty = button.dataset.name;
    selectedSpeed = Number(button.dataset.speed);

    prepareGame();
  });
});

hitBtn.addEventListener("click", hit);

document.addEventListener("keydown", function (e) {
  if (e.code === "Space" || e.code === "KeyE") {
    e.preventDefault();
    hit();
  }
});

prepareGame();