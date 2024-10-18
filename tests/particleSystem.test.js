const { JSDOM } = require('jsdom');

const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head>
<title>Interactive Particle System</title>
<style>
body {
  margin: 0;
  overflow: hidden;
  background-color: #000;
}
canvas {
  display: block;
}
.controls {
  position: absolute;
  top: 10px;
  left: 10px;
  color: white;
}
</style>
</head>
<body>

<div class="controls">
  <label for="numParticles">Number of Particles:</label>
  <input type="range" id="numParticles" min="10" max="500" value="100"><br>

  <label for="maxVelocity">Max Velocity:</label>
  <input type="range" id="maxVelocity" min="1" max="10" value="5"><br>

  <label for="particleSize">Particle Size:</label>
  <input type="range" id="particleSize" min="1" max="10" value="3"><br>

  <label for="interactionRadius">Interaction Radius:</label>
  <input type="range" id="interactionRadius" min="10" max="200" value="100"><br>

  <button id="resetButton">Reset</button>
  <label for="speedControl">Speed:</label>
  <input type="range" id="speedControl" min="0.1" max="2" step="0.1" value="1"><br>

  <label for="colorPicker">Color:</label>
  <input type="color" id="colorPicker" value="#ffffff"><br>

  <label for="gravity">Gravity:</label>
  <input type="checkbox" id="gravity"><br>

  <label for="effect">Effect:</label>
  <select id="effect">
    <option value="none">None</option>
    <option value="trails">Trails</option>
    <option value="glow">Glow</option>
  </select>
</div>

<canvas id="canvas"></canvas>

<script>
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let numParticles = 100;
let maxVelocity = 5;
let particleSize = 3;
let interactionRadius = 100;
let speedControl = 1;
let color = '#ffffff';
let gravity = false;
let effect = 'none';

// Get control elements
const numParticlesInput = document.getElementById('numParticles');
const maxVelocityInput = document.getElementById('maxVelocity');
const particleSizeInput = document.getElementById('particleSize');
const interactionRadiusInput = document.getElementById('interactionRadius');
const resetButton = document.getElementById('resetButton');
const speedControlInput = document.getElementById('speedControl');
const colorPicker = document.getElementById('colorPicker');
const gravityCheckbox = document.getElementById('gravity');
const effectSelect = document.getElementById('effect');

// Update variables on input change
numParticlesInput.addEventListener('input', () => {
  numParticles = numParticlesInput.value;
  init();
});
maxVelocityInput.addEventListener('input', () => {
  maxVelocity = maxVelocityInput.value;
});
particleSizeInput.addEventListener('input', () => {
  particleSize = particleSizeInput.value;
});
interactionRadiusInput.addEventListener('input', () => {
  interactionRadius = interactionRadiusInput.value;
});
resetButton.addEventListener('click', () => {
  numParticlesInput.value = 100;
  maxVelocityInput.value = 5;
  particleSizeInput.value = 3;
  interactionRadiusInput.value = 100;
  speedControlInput.value = 1;
  colorPicker.value = '#ffffff';
  gravityCheckbox.checked = false;
  effectSelect.value = 'none';

  numParticles = 100;
  maxVelocity = 5;
  particleSize = 3;
  interactionRadius = 100;
  speedControl = 1;
  color = '#ffffff';
  gravity = false;
  effect = 'none';

  init();
});
speedControlInput.addEventListener('input', () => {
  speedControl = speedControlInput.value;
});
colorPicker.addEventListener('input', () => {
  color = colorPicker.value;
});
gravityCheckbox.addEventListener('change', () => {
  gravity = gravityCheckbox.checked;
});
effectSelect.addEventListener('change', () => {
  effect = effectSelect.value;
  if (effect === 'trails') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Set canvas fill style for trails
  } else {
    ctx.fillStyle = 'rgba(0, 0, 0, 1)'; // Reset canvas fill style
  }
});

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = Math.random() * maxVelocity * 2 - maxVelocity;
    this.vy = Math.random() * maxVelocity * 2 - maxVelocity;
    this.history = [];
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, particleSize, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    if (effect === 'glow') {
      ctx.beginPath();
      ctx.arc(this.x, this.y, particleSize * 2, 0, Math.PI * 2);
      ctx.fillStyle = color.replace(')', ', 0.2)').replace('rgb', 'rgba');
      ctx.fill();
    }
  }

  update() {
    this.x += this.vx * speedControl;
    this.y += this.vy * speedControl;

    if (gravity) {
      this.vy += 0.1; // Apply gravity
    }

    // Bounce off walls
    if (this.x + particleSize > canvas.width || this.x - particleSize < 0) {
      this.vx = -this.vx;
    }
    if (this.y + particleSize > canvas.height || this.y - particleSize < 0) {
      this.vy = -this.vy;
    }

    this.history.push({ x: this.x, y: this.y });
    if (this.history.length > 10) { // Limit trail length
      this.history.shift();
    }

    if (effect === 'trails') {
      ctx.strokeStyle = color;
      for (let i = 0; i < this.history.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(this.history[i].x, this.history[i].y);
        ctx.lineTo(this.history[i + 1].x, this.history[i + 1].y);
        ctx.stroke();
      }
    }
  }
}

let particles = [];

function init() {
  particles = [];
  for (let i = 0; i < numParticles; i++) {
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    particles.push(new Particle(x, y));
  }
}

function animate() {
  requestAnimationFrame(animate);

  if (effect === 'trails') {
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fade trails
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();

    // Interact with mouse
    let dx = particles[i].x - mouseX;
    let dy = particles[i].y - mouseY;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < interactionRadius) {
      ctx.beginPath();
      ctx.moveTo(particles[i].x, particles[i].y);
      ctx.lineTo(mouseX, mouseY);
      ctx.strokeStyle = '#fff';
      ctx.stroke();
    }
  }
}

let mouseX = 0;
let mouseY = 0;

canvas.addEventListener('mousemove', (e) => {
  mouseX = clientX;
  mouseY = e.clientY;
});

init();
animate();
</script>

</body>
</html>
`);

const window = dom.window;
const document = window.document;

// Helper function to simulate user input
function simulateInput(elementId, value) {
  const element = document.getElementById(elementId);
  element.value = value;
  element.dispatchEvent(new window.Event("input"));
}

// Helper function to simulate mouse movement
function simulateMouseMove(x, y) {
  const event = new window.MouseEvent("mousemove", {
    clientX: x,
    clientY: y,
  });
  canvas.dispatchEvent(event);
}

// Helper function to get particle count
function getParticleCount() {
  return particles.length;
}

// Helper function to get particle speed
function getParticleSpeed(particle) {
  return Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
}

// Helper function to get particle color
function getParticleColor(particle) {
  return particle.fillStyle;
}

describe("Interactive Particle System", () => {
  let canvas, ctx, particles;

  beforeEach(() => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    particles = []; // Initialize particles array
  });

  it("should adjust the number of particles (Requirement 1)", () => {
    simulateInput("numParticles", 200);
    expect(getParticleCount()).toBe(200);
  });

  it("should update particle motion in real time (Requirement 2)", () => {
    const initialSpeed = getParticleSpeed(particles[0]);
    simulateInput("maxVelocity", 10);
    expect(getParticleSpeed(particles[0])).toBeGreaterThan(initialSpeed);
  });

  it("should respond to mouse movements (Requirement 3)", () => {
    const initialX = particles[0].x;
    simulateMouseMove(particles[0].x + 50, particles[0].y); // Move mouse near a particle
    // Allow some time for particles to react
    setTimeout(() => {
      expect(particles[0].x).not.toBe(initialX); // Expect particle to have moved
    }, 100);
  });

  // Requirement 4 (grouping particles) cannot be reliably tested with this setup
  // as it requires visual inspection and manual grouping which is not feasible
  // in a headless testing environment.

  it("should display particle paths (Requirement 5)", () => {
    simulateInput("effect", "trails");
    particles[0].update(); // Move the particle to create a trail
    expect(particles[0].history.length).toBeGreaterThan(0);
  });

  it("should reset all particle settings to their default values (Requirement 6)", () => {
    simulateInput("numParticles", 200);
    simulateInput("maxVelocity", 10);
    document.getElementById("resetButton").click();
    expect(getParticleCount()).toBe(100);
    expect(maxVelocity).toBe(5); // Check if maxVelocity is reset
  });

  it("should allow users to slow down or speed up the particle movement (Requirement 7)", () => {
    const initialSpeed = getParticleSpeed(particles[0]);
    simulateInput("speedControl", 0.5);
    expect(getParticleSpeed(particles[0])).toBeLessThan(initialSpeed);
  });

  it("should let users adjust how particles interact with each other (Requirement 8)", () => {
    simulateInput("interactionRadius", 50);
    expect(interactionRadius).toBe(50);
  });

  it("should allow users to customize the visual appearance of particles (Requirement 9)", () => {
    simulateInput("colorPicker", "#0000ff");
    expect(getParticleColor(particles[0])).toBe("#0000ff");
  });

  it("should allow users to apply gravity (Requirement 10)", () => {
    const initialVY = particles[0].vy;
    simulateInput("gravity", true);
    particles[0].update();
    expect(particles[0].vy).toBeGreaterThan(initialVY);
  });

  it("should let users switch between different visual effects (Requirement 11)", () => {
    simulateInput("effect", "glow");
    expect(effect).toBe("glow");
  });
});