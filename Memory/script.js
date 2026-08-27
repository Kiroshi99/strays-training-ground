const gameBoard = document.getElementById('game-board');
const pairsDisplay = document.getElementById('pairs');
const attemptsDisplay = document.getElementById('attempts');
const timerDisplay = document.getElementById('timer');
const progressFill = document.getElementById('progress-fill');
const resultScreen = document.getElementById('result-screen');
const resultTitle = document.getElementById('result-title');
const resultText = document.getElementById('result-text');
const startBtn = document.getElementById('start-btn');
const timeInput = document.getElementById('time-input');
const attemptsInput = document.getElementById('attempts-input');

/*
 * Familiar memory symbols drawn specifically for this minigame.
 * No external icon library required.
 */
const icons = [
  {
    id: 'lock',
    svg: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 10V7.4a4 4 0 0 1 8 0V10h-2V7.4a2 2 0 0 0-4 0V10H8z"/>
      <rect x="5" y="9" width="14" height="12" rx="2.2"/>
      <circle class="icon-cutout" cx="12" cy="14.5" r="1.55"/>
      <rect class="icon-cutout" x="11.35" y="15.5" width="1.3" height="2.6" rx=".5"/>
    </svg>`
  },

  {
    id: 'key',
    svg: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill-rule="evenodd" d="M8 4.5a5.2 5.2 0 1 0 3.7 8.85l2.15 2.15 1.5-1.5 1.35 1.35-1.5 1.5 1.25 1.25-1.7 1.7-5.15-5.15A5.2 5.2 0 0 0 8 4.5zm0 2.25a2.95 2.95 0 1 1 0 5.9 2.95 2.95 0 0 1 0-5.9z"/>
    </svg>`
  },

  {
    id: 'shield',
    svg: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.4 20 5.7v5.35c0 5.1-3.15 9.15-8 10.65-4.85-1.5-8-5.55-8-10.65V5.7L12 2.4z"/>
      <path class="icon-cutout" d="m8.15 11.7 2.35 2.35 5.35-5.45 1.35 1.35-6.7 6.75-3.7-3.65 1.35-1.35z"/>
    </svg>`
  },

  {
    id: 'star',
    svg: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <polygon points="12,2.4 14.9,8.35 21.5,9.3 16.7,13.95 17.85,20.5 12,17.4 6.15,20.5 7.3,13.95 2.5,9.3 9.1,8.35"/>
    </svg>`
  },

  {
    id: 'heart',
    svg: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21 4.15 13.55C.85 10.45 2.35 5 6.75 4.35 9.05 4 10.85 5.15 12 6.8c1.15-1.65 2.95-2.8 5.25-2.45 4.4.65 5.9 6.1 2.6 9.2L12 21z"/>
    </svg>`
  },

  {
    id: 'bolt',
    svg: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <polygon points="13.3,1.8 5.9,12.9 10.8,12.9 9.55,22.2 18.25,9.75 13.25,9.75"/>
    </svg>`
  },

  {
    id: 'gear',
    svg: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <g>
        <rect x="10.6" y="1.25" width="2.8" height="4.2" rx=".8"/>
        <rect x="10.6" y="18.55" width="2.8" height="4.2" rx=".8"/>
        <rect x="18.55" y="10.6" width="4.2" height="2.8" rx=".8"/>
        <rect x="1.25" y="10.6" width="4.2" height="2.8" rx=".8"/>

        <rect
          x="16.3"
          y="3.35"
          width="2.8"
          height="4.2"
          rx=".8"
          transform="rotate(45 17.7 5.45)"
        />

        <rect
          x="4.9"
          y="16.75"
          width="2.8"
          height="4.2"
          rx=".8"
          transform="rotate(45 6.3 18.85)"
        />

        <rect
          x="16.75"
          y="16.3"
          width="4.2"
          height="2.8"
          rx=".8"
          transform="rotate(45 18.85 17.7)"
        />

        <rect
          x="3.35"
          y="4.9"
          width="4.2"
          height="2.8"
          rx=".8"
          transform="rotate(45 5.45 6.3)"
        />
      </g>

      <circle cx="12" cy="12" r="7.15"/>
      <circle class="icon-cutout" cx="12" cy="12" r="3.15"/>
    </svg>`
  },

  {
    id: 'wifi',
    svg: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.25 8.5C7.65 3.35 16.35 3.35 21.75 8.5l-1.8 1.85c-4.4-4.15-11.5-4.15-15.9 0L2.25 8.5z"/>
      <path d="M6 12.35c3.35-3.2 8.65-3.2 12 0l-1.85 1.85c-2.3-2.15-6-2.15-8.3 0L6 12.35z"/>
      <path d="M9.6 16.1c1.35-1.35 3.45-1.35 4.8 0L12 18.6l-2.4-2.5z"/>
      <circle cx="12" cy="20.15" r="1.2"/>
    </svg>`
  }
];

let flippedCards = [];
let matchedPairs = 0;

/*
 * attempts = WRONG guesses only.
 * Correct pairs DO NOT consume an attempt.
 */
let attempts = 0;

/*
 * totalTurns = total number of pairs the player has selected.
 * Used only for statistics.
 */
let totalTurns = 0;

let maxAttempts = 16;
let maxTime = 45;
let timeLeft = 45;

let timerInterval = null;

let lockBoard = false;
let gameActive = false;
let gameEnded = false;


/* =========================================================
   SHUFFLE
========================================================= */

function shuffle(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}


/* =========================================================
   NUMBER VALIDATION
========================================================= */

function clampNumber(value, min, max, fallback) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, number));
}


/* =========================================================
   CREATE BOARD
========================================================= */

function createBoard() {
  gameBoard.innerHTML = '';

  /*
   * Two copies of each icon = one pair.
   *
   * 8 icons
   * 16 cards
   * 8 pairs
   */
  const deck = shuffle([
    ...icons,
    ...icons
  ]);

  deck.forEach((icon, index) => {

    const card = document.createElement('button');

    card.type = 'button';
    card.className = 'card';

    card.dataset.icon = icon.id;
    card.dataset.cardIndex = index;

    card.setAttribute(
      'aria-label',
      'Hidden memory card'
    );

    card.innerHTML = `
      <span class="card-inner">

        <span class="card-face card-front">

          <span class="card-question">
            ?
          </span>

          <span class="card-corner"></span>

        </span>


        <span class="card-face card-back">

          <span class="memory-icon">
            ${icon.svg}
          </span>

        </span>

      </span>
    `;

    card.addEventListener(
      'click',
      () => flipCard(card)
    );

    gameBoard.appendChild(card);
  });
}


/* =========================================================
   START GAME
========================================================= */

function startGame() {

  clearInterval(timerInterval);

  /*
   * Read values from the UI.
   */
  maxTime = clampNumber(
    timeInput.value,
    10,
    300,
    45
  );

  maxAttempts = Math.round(
    clampNumber(
      attemptsInput.value,
      1,
      99,
      16
    )
  );

  timeInput.value = maxTime;
  attemptsInput.value = maxAttempts;


  /*
   * Reset game statistics.
   */
  matchedPairs = 0;

  attempts = 0;

  totalTurns = 0;

  flippedCards = [];

  lockBoard = false;

  gameActive = true;

  gameEnded = false;

  timeLeft = maxTime;


  /*
   * Hide previous result.
   */
  resultScreen.style.display = 'none';

  resultScreen.classList.remove(
    'success',
    'failure'
  );


  /*
   * Generate a new random board.
   */
  createBoard();

  updateUI();


  /*
   * Start timer.
   */
  timerInterval = setInterval(
    updateTimer,
    100
  );
}


/* =========================================================
   CARD CLICK
========================================================= */

function flipCard(card) {

  /*
   * Ignore clicks when game cannot accept input.
   */
  if (!gameActive) return;

  if (gameEnded) return;

  if (lockBoard) return;

  if (flippedCards.length >= 2) return;


  /*
   * Prevent clicking the same card twice.
   */
  if (
    card.classList.contains('flipped') ||
    card.classList.contains('matched')
  ) {
    return;
  }


  /*
   * Reveal card.
   */
  card.classList.add('flipped');

  card.setAttribute(
    'aria-label',
    'Revealed memory card'
  );

  flippedCards.push(card);


  /*
   * Once two cards are selected,
   * check whether they match.
   */
  if (flippedCards.length === 2) {

    /*
     * Every pair selection counts as a turn,
     * but NOT necessarily an attempt.
     */
    totalTurns++;

    resolvePair();
  }
}


/* =========================================================
   CHECK PAIR
========================================================= */

function resolvePair() {

  const [card1, card2] = flippedCards;

  const isMatch =
    card1.dataset.icon === card2.dataset.icon;

  lockBoard = true;


  /* =====================================================
     CORRECT MATCH
  ===================================================== */

  if (isMatch) {

    setTimeout(() => {

      if (!gameActive) return;


      card1.classList.add('matched');
      card2.classList.add('matched');


      card1.setAttribute(
        'aria-label',
        'Matched memory card'
      );

      card2.setAttribute(
        'aria-label',
        'Matched memory card'
      );


      matchedPairs++;


      flippedCards = [];

      lockBoard = false;


      updateUI();


      /*
       * Player found every pair.
       */
      if (matchedPairs === icons.length) {

        endGame(true);

      }

    }, 220);


    /*
     * IMPORTANT:
     *
     * Correct pair does NOT increase attempts.
     */
    return;
  }


  /* =====================================================
     WRONG MATCH
  ===================================================== */

  card1.classList.add('wrong');
  card2.classList.add('wrong');


  /*
   * ONLY incorrect pairs consume attempts.
   */
  attempts++;

  updateUI();


  setTimeout(() => {

    if (!gameActive) return;


    /*
     * Hide incorrect cards again.
     */
    card1.classList.remove(
      'flipped',
      'wrong'
    );

    card2.classList.remove(
      'flipped',
      'wrong'
    );


    card1.setAttribute(
      'aria-label',
      'Hidden memory card'
    );

    card2.setAttribute(
      'aria-label',
      'Hidden memory card'
    );


    flippedCards = [];

    lockBoard = false;


    /*
     * Only fail AFTER the player has actually
     * consumed every allowed wrong attempt.
     */
    if (attempts >= maxAttempts) {

      endGame(false);

    }

  }, 720);
}


/* =========================================================
   TIMER
========================================================= */

function updateTimer() {

  if (!gameActive || gameEnded) {
    return;
  }


  timeLeft = Math.max(
    0,
    timeLeft - 0.1
  );


  updateUI();


  /*
   * Time failure.
   */
  if (timeLeft <= 0) {

    endGame(false);

  }
}


/* =========================================================
   UPDATE HUD
========================================================= */

function updateUI() {

  /*
   * Pair progress.
   */
  pairsDisplay.textContent =
    `${matchedPairs} / ${icons.length}`;


  /*
   * Attempts now means WRONG guesses.
   */
  attemptsDisplay.textContent =
    `${attempts} / ${maxAttempts}`;


  /*
   * Timer.
   */
  timerDisplay.textContent =
    `Time: ${Math.max(0, timeLeft).toFixed(1)}s`;


  /*
   * Progress bar.
   */
  const percentage =
    maxTime > 0
      ? (timeLeft / maxTime) * 100
      : 0;


  progressFill.style.width =
    `${Math.max(
      0,
      Math.min(100, percentage)
    )}%`;


  /*
   * Timer warning states.
   */
  progressFill.classList.toggle(
    'warning',
    percentage <= 45 &&
    percentage > 20
  );


  progressFill.classList.toggle(
    'danger',
    percentage <= 20
  );
}


/* =========================================================
   END GAME
========================================================= */

function endGame(success) {

  /*
   * Prevent game ending more than once.
   */
  if (gameEnded) {
    return;
  }


  gameEnded = true;

  gameActive = false;

  lockBoard = true;


  clearInterval(timerInterval);

  timerInterval = null;


  /*
   * Reset result classes.
   */
  resultScreen.classList.remove(
    'success',
    'failure'
  );


  resultScreen.classList.add(
    success
      ? 'success'
      : 'failure'
  );


  resultScreen.style.display = 'flex';


  /* =====================================================
     SUCCESS
  ===================================================== */

  if (success) {

    resultTitle.textContent =
      'MEMORY VERIFIED';


    resultText.textContent =
      `All ${icons.length} pairs matched in ${totalTurns} turns with ${attempts}/${maxAttempts} failed attempts.`;

  }


  /* =====================================================
     TIMER FAILURE
  ===================================================== */

  else if (timeLeft <= 0) {

    resultTitle.textContent =
      'TRACE EXPIRED';


    resultText.textContent =
      `${matchedPairs}/${icons.length} pairs recovered before time ran out.`;

  }


  /* =====================================================
     ATTEMPT FAILURE
  ===================================================== */

  else {

    resultTitle.textContent =
      'MEMORY FAILED';


    resultText.textContent =
      `${matchedPairs}/${icons.length} pairs recovered after ${attempts}/${maxAttempts} failed attempts.`;

  }
}


/* =========================================================
   RESTART GAME
========================================================= */

function restartGame() {

  startGame();

}


/* =========================================================
   BUTTON
========================================================= */

startBtn.addEventListener(
  'click',
  startGame
);


/* =========================================================
   INITIAL DISPLAY
========================================================= */

createBoard();

updateUI();
