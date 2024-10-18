const canvas = document.getElementById("arena");
const ctx = canvas.getContext("2d");
const arenaRadius = canvas.width / 2;
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

let paddleAngle = 0;
let paddleLength = 40;
let orbX = centerX;
let orbY = centerY - 50;
let orbDX = 2;
let orbDY = 2;
let gameRunning = true;

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left - centerX;
  const mouseY = e.clientY - rect.top - centerY;
  paddleAngle = Math.atan2(mouseY, mouseX);
});

function drawArena() {
  ctx.beginPath();
  ctx.arc(centerX, centerY, arenaRadius - 1, 0, 2 * Math.PI);
  ctx.stroke();
}

function drawPaddle() {
  const paddleX = centerX + (arenaRadius - 10) * Math.cos(paddleAngle);
  const paddleY = centerY + (arenaRadius - 10) * Math.sin(paddleAngle);

  ctx.beginPath();
  ctx.moveTo(
    paddleX - (paddleLength / 2) * Math.sin(paddleAngle),
    paddleY + (paddleLength / 2) * Math.cos(paddleAngle)
  );
  ctx.lineTo(
    paddleX + (paddleLength / 2) * Math.sin(paddleAngle),
    paddleY - (paddleLength / 2) * Math.cos(paddleAngle)
  );
  ctx.stroke();
}

function drawOrb() {
  ctx.beginPath();
  ctx.arc(orbX, orbY, 5, 0, 2 * Math.PI);
  ctx.fill();
}

function update() {
  if (!gameRunning) return;

  orbX += orbDX;
  orbY += orbDY;

  // Bounce off the paddle
  const paddleX = centerX + (arenaRadius - 10) * Math.cos(paddleAngle);
  const paddleY = centerY + (arenaRadius - 10) * Math.sin(paddleAngle);
  const distToPaddle = Math.sqrt(
    Math.pow(orbX - paddleX, 2) + Math.pow(orbY - paddleY, 2)
  );
  if (distToPaddle < 5 + paddleLength / 2) {
    // Simple bounce for now, could be improved with angle calculations
    const normalX = (orbX - paddleX) / distToPaddle;
    const normalY = (orbY - paddleY) / distToPaddle;
    orbDX = orbDX - 2 * orbDX * normalX;
    orbDY = orbDY - 2 * orbDY * normalY;
  }

  // Check for collision with arena edge
  const distToCenter = Math.sqrt(
    Math.pow(orbX - centerX, 2) + Math.pow(orbY - centerY, 2)
  );
  if (distToCenter > arenaRadius - 5) {
    gameRunning = false;
    alert("Game Over!");
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawArena();
  drawPaddle();
  drawOrb();

  requestAnimationFrame(update);
}

update();
