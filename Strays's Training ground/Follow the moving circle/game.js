const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 600;

let dot = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 29,
  radiusChange: 0.005,
  minRadius: 29,
  maxRadius: 35,
  dx: getRandomSpeed(),
  dy: getRandomSpeed(),
  startTime: Date.now(),
  initialDelay: 5000
};

let isCursorInside = false;
let elapsedTime = 0;

function drawDot() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#2C2F33';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2, true);
  ctx.fillStyle = 'yellow';
  ctx.fill();
  ctx.closePath();
}

function drawTimer() {
  ctx.font = '20px Arial';
  ctx.fillStyle = 'black';
  ctx.fillText(`Time: ${elapsedTime.toFixed(1)}s`, 10, 30);
}

function getRandomSpeed() {
  const minSpeed = 0.3;
  const maxSpeed = 0.8;
  return (Math.random() * (maxSpeed - minSpeed) + minSpeed) * (Math.random() < 0.5 ? -1 : 1);
}

function getUnpredictableSpeed() {
  const minSpeed = 0.3;
  const maxSpeed = 0.8;
  return (Math.random() * (maxSpeed - minSpeed) + minSpeed) * (Math.random() < 0.5 ? -1 : 1);
}

function updateDotPosition() {
  if (Date.now() - dot.startTime > dot.initialDelay) {
    dot.x += dot.dx;
    dot.y += dot.dy;

    if (dot.x + dot.radius > canvas.width) {
      dot.x = canvas.width - dot.radius;
      dot.dx = getRandomSpeed();
      dot.dy = getRandomSpeed();
    }

    if (dot.x - dot.radius < 0) {
      dot.x = dot.radius;
      dot.dx = getRandomSpeed();
      dot.dy = getRandomSpeed();
    }

    if (dot.y + dot.radius > canvas.height) {
      dot.y = canvas.height - dot.radius;
      dot.dx = getRandomSpeed();
      dot.dy = getRandomSpeed();
    }

    if (dot.y - dot.radius < 0) {
      dot.y = dot.radius;
      dot.dx = getRandomSpeed();
      dot.dy = getRandomSpeed();
    }

    dot.radius += dot.radiusChange;
    if (dot.radius > dot.maxRadius || dot.radius < dot.minRadius) {
      dot.radiusChange = -dot.radiusChange;
    }
  }
}

function checkCollision(cursorX, cursorY) {
  const distance = Math.sqrt((cursorX - dot.x) ** 2 + (cursorY - dot.y) ** 2);

  if (!isCursorInside && distance <= dot.radius) {
    isCursorInside = true;
  }

  if (isCursorInside && distance > dot.radius) {
    alert(`Game Over! You survived for ${elapsedTime.toFixed(1)} seconds.`);
    document.location.reload();
  }
}

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  checkCollision(mouseX, mouseY);
});

function gameLoop() {
  elapsedTime = (Date.now() - dot.startTime - dot.initialDelay) / 1000;
  drawDot();
  drawTimer();
  updateDotPosition();
  requestAnimationFrame(gameLoop);
}

gameLoop();
