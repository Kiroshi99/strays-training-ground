"use strict";

/* ============================================================
   UNTANGLE MINIGAME

   Drag the nodes until none of the connecting lines cross.
   ============================================================ */

const CONFIG = {
  width: 640,
  height: 460,

  // Keeps nodes away from the outside border.
  margin: 24,

  // Time limit in seconds.
  timeLimit: 60,

  // Node sizes based on how many lines connect to the node.
  nodeRadius: {
    5: 15,
    4: 13,
    2: 11,
  },
};

/*
  Nodes 0–1 have five connections.
  Nodes 2–4 have four connections.
  Nodes 5–7 have two connections.
*/

const EDGES = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],

  [1, 2],
  [1, 3],
  [1, 4],

  [2, 3],

  [0, 5],
  [4, 5],

  [1, 6],
  [4, 6],

  [2, 7],
  [3, 7],
];

const NODE_COUNT = 8;

const DEGREE = Array(NODE_COUNT).fill(0);

EDGES.forEach(([start, end]) => {
  DEGREE[start]++;
  DEGREE[end]++;
});

/* ============================================================
   DOM ELEMENTS
   ============================================================ */

const svg = document.getElementById("board");

const crossingsElement =
  document.getElementById("crossings");

const timeElement =
  document.getElementById("time");

const timerFill =
  document.getElementById("timer-fill");

const overlay =
  document.getElementById("overlay");

const overlayText =
  document.getElementById("overlay-text");

const showDegreeCheckbox =
  document.getElementById("show-deg");

const restartButton =
  document.getElementById("restart");

const againButton =
  document.getElementById("again");

const SVG_NAMESPACE =
  "http://www.w3.org/2000/svg";

/* ============================================================
   GAME STATE
   ============================================================ */

let points = [];

let lineElements = [];
let nodeElements = [];
let labelElements = [];

let draggedNodeIndex = null;

let startTime = 0;
let animationFrameId = null;

let gameOver = false;

/* ============================================================
   HELPERS
   ============================================================ */

function createSvgElement(tag, attributes = {}) {
  const element = document.createElementNS(
    SVG_NAMESPACE,
    tag
  );

  Object.entries(attributes).forEach(
    ([attribute, value]) => {
      element.setAttribute(attribute, value);
    }
  );

  return element;
}

function shuffleArray(array) {
  for (let index = array.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1)
    );

    [array[index], array[randomIndex]] = [
      array[randomIndex],
      array[index],
    ];
  }

  return array;
}

/*
  Checks whether two separate line segments cross.

  Shared endpoints are ignored elsewhere because connected
  lines are allowed to touch at their common node.
*/

function segmentsCross(a, b, c, d) {
  function orientation(point1, point2, point3) {
    const result =
      (point2.x - point1.x) *
        (point3.y - point1.y) -
      (point2.y - point1.y) *
        (point3.x - point1.x);

    return Math.sign(result);
  }

  const orientation1 = orientation(a, b, c);
  const orientation2 = orientation(a, b, d);

  const orientation3 = orientation(c, d, a);
  const orientation4 = orientation(c, d, b);

  return (
    orientation1 !== orientation2 &&
    orientation3 !== orientation4 &&
    orientation1 !== 0 &&
    orientation3 !== 0
  );
}

/* ============================================================
   RANDOM STARTING LAYOUT
   ============================================================ */

function createScrambledLayout() {
  const centreX = CONFIG.width / 2;
  const centreY = CONFIG.height / 2;

  /*
    Randomises which node receives each position around
    the centre of the board.
  */

  const positions = shuffleArray(
    [...Array(NODE_COUNT).keys()]
  );

  points = positions.map((position) => {
    const angle =
      (position / NODE_COUNT) * Math.PI * 2 -
      Math.PI / 2;

    const radius =
      120 + Math.random() * 70;

    return {
      x:
        centreX +
        Math.cos(angle) * radius +
        (Math.random() * 50 - 25),

      y:
        centreY +
        Math.sin(angle) * radius * 0.75 +
        (Math.random() * 40 - 20),
    };
  });

  /*
    Do not allow the game to begin already solved
    or with barely any crossings.
  */

  const result = countCrossings();

  if (result.count < 3) {
    createScrambledLayout();
  }
}

/* ============================================================
   CROSSING DETECTION
   ============================================================ */

function countCrossings() {
  const crossingEdges = new Set();

  let crossingCount = 0;

  for (
    let firstEdgeIndex = 0;
    firstEdgeIndex < EDGES.length;
    firstEdgeIndex++
  ) {
    for (
      let secondEdgeIndex = firstEdgeIndex + 1;
      secondEdgeIndex < EDGES.length;
      secondEdgeIndex++
    ) {
      const [a, b] = EDGES[firstEdgeIndex];
      const [c, d] = EDGES[secondEdgeIndex];

      /*
        Lines that share the same node are supposed
        to touch, so they are not counted.
      */

      const sharesNode =
        a === c ||
        a === d ||
        b === c ||
        b === d;

      if (sharesNode) {
        continue;
      }

      const isCrossing = segmentsCross(
        points[a],
        points[b],
        points[c],
        points[d]
      );

      if (isCrossing) {
        crossingEdges.add(firstEdgeIndex);
        crossingEdges.add(secondEdgeIndex);

        crossingCount++;
      }
    }
  }

  return {
    count: crossingCount,
    crossingEdges,
  };
}

/* ============================================================
   BUILD SVG
   ============================================================ */

function buildBoard() {
  svg.innerHTML = "";

  lineElements = [];
  nodeElements = [];
  labelElements = [];

  const edgeGroup =
    createSvgElement("g");

  const nodeGroup =
    createSvgElement("g");

  svg.append(edgeGroup, nodeGroup);

  /*
    Create every connecting line first so the nodes
    always appear above the lines.
  */

  EDGES.forEach(() => {
    const line = createSvgElement("line", {
      class: "edge",
    });

    edgeGroup.appendChild(line);
    lineElements.push(line);
  });

  /*
    Create node circles, glows and optional labels.
  */

  points.forEach((point, nodeIndex) => {
    const nodeRadius =
      CONFIG.nodeRadius[DEGREE[nodeIndex]] || 12;

    const glow = createSvgElement("circle", {
      class: "node-glow",
      r: nodeRadius + 4,
    });

    const dot = createSvgElement("circle", {
      class: "node",
      r: nodeRadius,
      "data-index": nodeIndex,
    });

    const label = createSvgElement("text", {
      class: "deg-label",
    });

    label.textContent = DEGREE[nodeIndex];

    nodeGroup.append(glow, dot, label);

    nodeElements.push({
      dot,
      glow,
    });

    labelElements.push(label);
  });

  renderBoard();
}

/* ============================================================
   RENDER BOARD
   ============================================================ */

function renderBoard() {
  const result = countCrossings();

  const crossingCount = result.count;
  const crossingEdges = result.crossingEdges;

  /*
    Update every line position and colour.
  */

  EDGES.forEach(([startNode, endNode], edgeIndex) => {
    const line = lineElements[edgeIndex];

    line.setAttribute(
      "x1",
      points[startNode].x
    );

    line.setAttribute(
      "y1",
      points[startNode].y
    );

    line.setAttribute(
      "x2",
      points[endNode].x
    );

    line.setAttribute(
      "y2",
      points[endNode].y
    );

    line.classList.toggle(
      "crossing",
      crossingEdges.has(edgeIndex)
    );
  });

  /*
    Update node and label positions.
  */

  points.forEach((point, nodeIndex) => {
    const node = nodeElements[nodeIndex];

    node.dot.setAttribute("cx", point.x);
    node.dot.setAttribute("cy", point.y);

    node.glow.setAttribute("cx", point.x);
    node.glow.setAttribute("cy", point.y);

    labelElements[nodeIndex].setAttribute(
      "x",
      point.x
    );

    labelElements[nodeIndex].setAttribute(
      "y",
      point.y + 4
    );

    labelElements[nodeIndex].style.display =
      showDegreeCheckbox.checked
        ? ""
        : "none";
  });

  crossingsElement.textContent =
    crossingCount;

  crossingsElement.classList.toggle(
    "clear",
    crossingCount === 0
  );

  /*
    The player wins immediately when no lines cross.
  */

  if (crossingCount === 0 && !gameOver) {
    endGame(true);
  }
}

/* ============================================================
   POINTER POSITION
   ============================================================ */

function getBoardCoordinates(event) {
  const boardRectangle =
    svg.getBoundingClientRect();

  return {
    x:
      ((event.clientX - boardRectangle.left) /
        boardRectangle.width) *
      CONFIG.width,

    y:
      ((event.clientY - boardRectangle.top) /
        boardRectangle.height) *
      CONFIG.height,
  };
}

/* ============================================================
   DRAGGING
   ============================================================ */

svg.addEventListener(
  "pointerdown",
  (event) => {
    if (gameOver) {
      return;
    }

    const targetNode =
      event.target.closest(".node");

    if (!targetNode) {
      return;
    }

    draggedNodeIndex = Number(
      targetNode.dataset.index
    );

    svg.setPointerCapture(event.pointerId);
  }
);

svg.addEventListener(
  "pointermove",
  (event) => {
    if (
      draggedNodeIndex === null ||
      gameOver
    ) {
      return;
    }

    const pointer =
      getBoardCoordinates(event);

    const margin = CONFIG.margin;

    /*
      Keep the dragged node inside the board.
    */

    points[draggedNodeIndex].x = Math.max(
      margin,
      Math.min(
        CONFIG.width - margin,
        pointer.x
      )
    );

    points[draggedNodeIndex].y = Math.max(
      margin,
      Math.min(
        CONFIG.height - margin,
        pointer.y
      )
    );

    renderBoard();
  }
);

svg.addEventListener(
  "pointerup",
  () => {
    draggedNodeIndex = null;
  }
);

svg.addEventListener(
  "pointercancel",
  () => {
    draggedNodeIndex = null;
  }
);

/* ============================================================
   TIMER
   ============================================================ */

function updateTimer() {
  const elapsedSeconds =
    (performance.now() - startTime) / 1000;

  const remainingSeconds = Math.max(
    0,
    CONFIG.timeLimit - elapsedSeconds
  );

  timeElement.textContent =
    remainingSeconds.toFixed(1);

  const remainingFraction =
    remainingSeconds / CONFIG.timeLimit;

  timerFill.style.width =
    `${remainingFraction * 100}%`;

  timerFill.classList.toggle(
    "low",
    remainingFraction < 0.25
  );

  if (remainingSeconds <= 0) {
    endGame(false);
    return;
  }

  animationFrameId =
    requestAnimationFrame(updateTimer);
}

/* ============================================================
   GAME FLOW
   ============================================================ */

function startGame() {
  gameOver = false;
  draggedNodeIndex = null;

  overlay.hidden = true;

  createScrambledLayout();
  buildBoard();

  startTime = performance.now();

  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }

  animationFrameId =
    requestAnimationFrame(updateTimer);
}

function endGame(won) {
  gameOver = true;
  draggedNodeIndex = null;

  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }

  overlayText.textContent = won
    ? "BREACH SUCCESSFUL"
    : "CONNECTION LOST";

  overlayText.classList.toggle(
    "fail",
    !won
  );

  overlay.hidden = false;
}

/* ============================================================
   BUTTONS
   ============================================================ */

restartButton.addEventListener(
  "click",
  startGame
);

againButton.addEventListener(
  "click",
  startGame
);

showDegreeCheckbox.addEventListener(
  "change",
  renderBoard
);

/* Start automatically when the page loads. */

startGame();