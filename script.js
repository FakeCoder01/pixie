// Game elements
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over");
const levelCompleteScreen = document.getElementById("level-complete");
const levelSelectScreen = document.getElementById("level-select");
const startBtn = document.getElementById("start-btn");
const levelSelectBtn = document.getElementById("level-select-btn");
const nextLevelBtn = document.getElementById("next-level-btn");
const selectLevelBtn = document.getElementById("select-level-btn");
const restartBtn = document.getElementById("restart-btn");
const menuBtn = document.getElementById("menu-btn");
const backToMenuBtn = document.getElementById("back-to-menu");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const levelDisplay = document.getElementById("level");
const coinsDisplay = document.getElementById("coins");
const finalScoreDisplay = document.getElementById("final-score");
const levelScoreDisplay = document.getElementById("level-score");
const soundToggle = document.getElementById("sound-toggle");
const mainMenuReturnBtn = document.getElementById("main-menu-return-btn");
const progressBar = document.getElementById("progress-bar");
const levelCards = document.querySelectorAll(".level-card");
const levelName = document.getElementById("level-name");
const modalOverlay = document.getElementById("retroModalOverlay");
const closeModalBtn = document.getElementById("closeModalBtn");
const musicToggleButton = document.getElementById("musicToggleButton");
const musicIcon = musicToggleButton.querySelector(".music-icon");

// Game state
let isMusicOn = false;
let gameRunning = false;
let score = 0;
let coins = 0;
let lives = 3;
let currentLevel = 1;
let soundEnabled = false;
let worldWidth = 8000;
let cameraOffset = 0;
let gameTime = 0;
let completedLevels = [1];
let lastTime = 0;

// Player
const player = {
  x: 50,
  y: 400,
  width: 24,
  height: 32,
  speed: 5,
  runSpeed: 8,
  velX: 0,
  velY: 0,
  jumpForce: -15,
  gravity: 0.8,
  isJumping: false,
  facing: "right",
  color: "#00ffcc",
};

// Game objects
let platforms = [];
let coinsArray = [];
let enemies = [];
let movingPlatforms = [];
let spikes = [];
let springs = [];
let treasures = [];
let decorations = [];
let levelCompleted = false;
let keys = {};

// Level data
const levelThemes = [
  {
    name: "FOREST OF WONDERS",
    bg: "#1ac8ce",
    ground: "#006600",
    platform: "#7a2108",
    accent: "#6b6c72",
    bgElements: ["#005500", "#007700"],
    fgElements: ["#d68c3e", "#d3d63e"],
  },
  {
    name: "SANDY DESERT",
    bg: "#ffcc66",
    ground: "#cc9900",
    platform: "#ba8234",
    accent: "#cc6600",
    bgElements: ["#eebb55", "#ddaa44"],
    fgElements: ["#ffcc44", "#ffdd66"],
  },
  {
    name: "MOUNTAIN PEAKS",
    bg: "#88aadd",
    ground: "#445566",
    platform: "#778899",
    accent: "#334455",
    bgElements: ["#6688cc", "#5577bb"],
    fgElements: ["#99aadd", "#aabbee"],
  },
  {
    name: "OCEAN DEPTHS",
    bg: "#0066aa",
    ground: "#004488",
    platform: "#0088cc",
    accent: "#00aaff",
    bgElements: ["#005599", "#004488"],
    fgElements: ["#00bbff", "#00ddff"],
  },
  {
    name: "VOLCANO ISLAND",
    bg: "#cc6600",
    ground: "#993300",
    platform: "#ff5500",
    accent: "#ff3300",
    bgElements: ["#bb5500", "#aa4400"],
    fgElements: ["#ff6600", "#ff8800"],
  },
  {
    name: "FROZEN CAVES",
    bg: "#aaddff",
    ground: "#77aaff",
    platform: "#cceeff",
    accent: "#88ccff",
    bgElements: ["#99ccee", "#88bbdd"],
    fgElements: ["#c4dbf2", "#eeffff"],
  },
  {
    name: "LAVA FIELDS",
    bg: "#550000",
    ground: "#330000",
    platform: "#ff5500",
    accent: "#ff0000",
    bgElements: ["#440000", "#330000"],
    fgElements: ["#ff3300", "#ff5500"],
  },
  {
    name: "MAGIC CASTLE",
    bg: "#9900cc",
    ground: "#660099",
    platform: "#cc66ff",
    accent: "#f9aef8",
    bgElements: ["#8800bb", "#7700aa"],
    fgElements: ["#dd77ff", "#ee99ff"],
  },
];

// Level names for UI
const levelNames = [
  "FOREST OF WONDERS",
  "SANDY DESERT",
  "MOUNTAIN PEAKS",
  "OCEAN DEPTHS",
  "VOLCANO ISLAND",
  "FROZEN CAVES",
  "LAVA FIELDS",
  "MAGIC CASTLE",
];

// Sound effects
const sounds = {
  jump: new Audio("sfx/jump.wav"),
  coin: new Audio("sfx/coin.wav"),
  hit: new Audio("sfx/hit.wav"),
  win: new Audio("sfx/win.wav"),
  gameOver: new Audio("sfx/lose.wav"),
  background: new Audio("sfx/background.mp3"),
  click: new Audio("sfx/click.wav"),
};

const MIN_GAP = 40; // The smallest horizontal gap between platforms
const MAX_GAP = 100; // The largest horizontal gap
const MAX_VERTICAL_CHANGE = 80; // How much higher or lower the next platform can be
const MIN_Y = 150; // Highest point a platform can generate
const MAX_Y = 500; // Lowest point a platform can generate

// Set sound volume
for (const key in sounds) {
  sounds[key].volume = 0.4;
  if (key === "coin") {
    sounds[key].volume = 0.5;
  }
}

// Initialize the game
function init() {
  createLevel(currentLevel);
  updateUI();
  setupEventListeners();

  // Start background music
  sounds.background.loop = true;
  if (soundEnabled) sounds.background.play();
}

function setupEventListeners() {
  window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
  });

  window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });

  startBtn.addEventListener("click", () => {
    if (soundEnabled) sounds.click.play();
    startScreen.style.display = "none";
    startGame();
  });

  levelSelectBtn.addEventListener("click", () => {
    if (soundEnabled) sounds.click.play();
    startScreen.style.display = "none";
    levelSelectScreen.style.display = "flex";
  });

  levelCards.forEach((card) => {
    card.addEventListener("click", () => {
      if (soundEnabled) sounds.click.play();
      const level = parseInt(card.dataset.level);
      currentLevel = level;
      levelSelectScreen.style.display = "none";
      startGame();
    });
  });

  nextLevelBtn.addEventListener("click", () => {
    if (soundEnabled) sounds.click.play();
    levelCompleteScreen.style.display = "none";
    currentLevel++;
    if (currentLevel > 8) currentLevel = 1;
    if (!completedLevels.includes(currentLevel)) {
      completedLevels.push(currentLevel);
    }
    startGame();
  });

  selectLevelBtn.addEventListener("click", () => {
    if (soundEnabled) sounds.click.play();
    levelCompleteScreen.style.display = "none";
    levelSelectScreen.style.display = "flex";
  });

  restartBtn.addEventListener("click", () => {
    if (soundEnabled) sounds.click.play();
    gameOverScreen.style.display = "none";
    startGame();
  });

  menuBtn.addEventListener("click", () => {
    if (soundEnabled) sounds.click.play();
    gameOverScreen.style.display = "none";
    startScreen.style.display = "flex";
  });

  mainMenuReturnBtn.addEventListener("click", () => {
    if (soundEnabled) sounds.click.play();
    levelSelectScreen.style.display = "none";
    gameOverScreen.style.display = "none";
    levelCompleteScreen.style.display = "none";

    startScreen.style.display = "flex";
  });

  backToMenuBtn.addEventListener("click", () => {
    if (soundEnabled) sounds.click.play();
    levelSelectScreen.style.display = "none";
    startScreen.style.display = "flex";
  });

  soundToggle.addEventListener("click", () => {
    if (soundEnabled) sounds.click.play();
    soundEnabled = !soundEnabled;
    soundToggle.textContent = `ЗВУК: ${soundEnabled ? "ON" : "OFF"}`;
    if (soundEnabled) {
      sounds.background.play();
    } else {
      sounds.background.pause();
    }
  });
}

function startGame() {
  gameRunning = true;
  score = 0;
  coins = 0;
  lives = 3;
  cameraOffset = 0;
  gameTime = 0;
  createLevel(currentLevel);
  updateUI();
  player.x = 50;
  player.y = 400;
  player.velX = 0;
  player.velY = 0;
  levelName.textContent = levelNames[currentLevel - 1];
  // gameLoop();
  requestAnimationFrame(gameLoop);

  // Update level cards
  levelCards.forEach((card) => {
    const level = parseInt(card.dataset.level);
    if (completedLevels.includes(level)) {
      card.classList.add("completed");
    } else {
      card.classList.remove("completed");
    }
  });
}

function createLevel(level) {
  platforms = [];
  coinsArray = [];
  enemies = [];
  movingPlatforms = [];
  spikes = [];
  springs = [];
  treasures = [];
  decorations = [];
  levelCompleted = false;

  const theme = levelThemes[level - 1];

  // Ground
  platforms.push({
    x: 0,
    y: 550,
    width: worldWidth,
    height: 50,
    color: theme.ground,
    ground: true,
  });

  // Level-specific content
  switch (level) {
    case 1: // Forest
      createForestLevel(theme);
      break;
    case 2: // Desert
      createDesertLevel(theme);
      break;
    case 3: // Mountain
      createMountainLevel(theme);
      break;
    case 4: // Ocean
      createOceanLevel(theme);
      break;
    case 5: // Volcano
      createVolcanoLevel(theme);
      break;
    case 6: // Ice Cave
      createIceCaveLevel(theme);
      break;
    case 7: // Lava Zone
      createLavaZoneLevel(theme);
      break;
    case 8: // Castle
      createCastleLevel(theme);
      break;
  }

  // Add treasure at the end
  treasures.push({
    x: worldWidth - 100,
    y: 450,
    width: 24,
    height: 24,
    color: "#ffff00",
  });
}

function createForestLevel(theme) {
  // State Variables
  // Keep track of the last platform's position.
  // Starts the first platform at a fixed position.
  let lastPlatformX = 0;
  let lastPlatformY = 450;
  let lastPlatformWidth = 200;

  // Platforms
  for (let i = 0; i < 40; i++) {
    if (i === 0) {
      platforms.push({
        x: lastPlatformX,
        y: lastPlatformY,
        width: lastPlatformWidth,
        height: 20,
        color: theme.platform,
      });
      continue;
    }

    const gap = Math.random() * (MAX_GAP - MIN_GAP) + MIN_GAP;
    const newX = lastPlatformX + lastPlatformWidth + gap;

    // Calculate the vertical position (Y)
    // The next platform is relative to the last one, with a random change.
    const verticalChange = (Math.random() - 0.5) * 2 * MAX_VERTICAL_CHANGE;
    let newY = lastPlatformY + verticalChange;

    // Clamps the Y value to keep it within the screen's vertical bounds
    newY = Math.max(MIN_Y, Math.min(newY, MAX_Y));

    // Gets random dimensions for the new platform
    const newWidth = Math.floor(Math.random() * 101) + 100;
    const newHeight = Math.floor(Math.random() * 11) + 14;

    platforms.push({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      color: theme.platform,
    });

    // Update the 'last' variables for the next iteration
    lastPlatformX = newX;
    lastPlatformY = newY;
    lastPlatformWidth = newWidth;

    // Coins
    for (let j = 0; j < 5; j++) {
      coinsArray.push({
        x: newX + 30 + j * 30,
        y: newY - 30,
        width: 12,
        height: 12,
        color: "#ffff00",
      });
    }

    // Enemies every 3 platforms
    if (i % 3 === 0) {
      enemies.push({
        x: newX + 80,
        y: newY - 30,
        width: 24,
        height: 24,
        speed: 1 + Math.random() * 1,
        color: theme.accent,
        direction: 1,
        type: "eagle",
        animationOffset: Math.random() * 10,
      });
    }

    // Decorations
    decorations.push({
      type: "tree",
      x: newX + 50,
      y: newY - 40,
      width: 30,
      height: 40,
      color: ["#3a1600", "#03a051"],
    });

    decorations.push({
      type: "bush",
      x: newX + Math.floor(Math.random() * 80) + 10,
      y: newY + Math.random(),
      width: 30,
      height: 20,
      color: "#16fc72",
    });
  }

  // Moving platforms
  for (let i = 0; i < 10; i++) {
    movingPlatforms.push({
      x: 300 + i * 600,
      y: 300,
      width: 80,
      height: 15,
      color: "#cc9966",
      startX: 300 + i * 600,
      endX: 500 + i * 600,
      speed: 1,
      direction: 1,
    });
  }

  // Springs
  springs.push({
    x: 500,
    y: 520,
    width: 20,
    height: 30,
    color: "#00ffff",
    power: 20,
  });
  springs.push({
    x: 2500,
    y: 520,
    width: 20,
    height: 30,
    color: "#00ffff",
    power: 20,
  });
  springs.push({
    x: 4500,
    y: 520,
    width: 20,
    height: 30,
    color: "#00ffff",
    power: 20,
  });
}

function createDesertLevel(theme) {
  // State Variables
  // Keep track of the last platform's position.
  // Starts the first platform at a fixed position.
  let lastPlatformX = 0;
  let lastPlatformY = 450;
  let lastPlatformWidth = 200;

  // Platforms
  for (let i = 0; i < 40; i++) {
    if (i === 0) {
      platforms.push({
        x: lastPlatformX,
        y: lastPlatformY,
        width: lastPlatformWidth,
        height: 20,
        color: theme.platform,
      });
      continue;
    }

    const gap = Math.random() * (MAX_GAP - MIN_GAP) + MIN_GAP;
    const newX = lastPlatformX + lastPlatformWidth + gap;

    // Calculate the vertical position (Y)
    // The next platform is relative to the last one, with a random change.
    const verticalChange = (Math.random() - 0.5) * 2 * MAX_VERTICAL_CHANGE;
    let newY = lastPlatformY + verticalChange;

    // Clamps the Y value to keep it within the screen's vertical bounds
    newY = Math.max(MIN_Y, Math.min(newY, MAX_Y));

    // Gets random dimensions for the new platform
    const newWidth = Math.floor(Math.random() * 101) + 100;
    const newHeight = Math.floor(Math.random() * 11) + 14;

    platforms.push({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      color: theme.platform,
    });

    // Update the 'last' variables for the next iteration
    lastPlatformX = newX;
    lastPlatformY = newY;
    lastPlatformWidth = newWidth;

    // Coins
    for (let j = 0; j < 6; j++) {
      coinsArray.push({
        x: newX + 30 + j * 30,
        y: newY - 30,
        width: 12,
        height: 12,
        color: "#ffff00",
      });
    }

    // Enemies every 3 platforms
    if (i % 3 === 0) {
      enemies.push({
        x: newX + 80,
        y: newY - 30,
        width: 32,
        height: 24,
        speed: 1.5,
        color: theme.accent,
        direction: 1,
        type: "scorpion",
        animationOffset: Math.random() * 10,
      });
    }

    // Decorations
    decorations.push({
      type: "cactus",
      x: newX + Math.floor(Math.random() * 100),
      y: newY - 40,
      width: 20,
      height: 60,
      color: "#00aa00",
    });

    decorations.push({
      type: "pyramid",
      x: newX + (Math.random() * 150 + 1),
      y: newY - 50,
      width: 60,
      height: 50,
      color: "#cc9900",
    });
  }

  // Moving platforms
  for (let i = 0; i < 8; i++) {
    movingPlatforms.push({
      x: 400 + i * 700,
      y: 300,
      width: 100,
      height: 15,
      color: "#6d4307",
      startX: 400 + i * 700,
      endX: 600 + i * 700,
      speed: 1.5,
      direction: 1,
    });
  }

  // Spikes
  for (let i = 0; i < 15; i++) {
    spikes.push({
      x: 800 + i * 300,
      y: 530,
      width: 20,
      height: 20,
      color: "#ff0000",
    });
  }
}

function createMountainLevel(theme) {
  // State Variables
  // Keep track of the last platform's position.
  // Starts the first platform at a fixed position.
  let lastPlatformX = 0;
  let lastPlatformY = 450;
  let lastPlatformWidth = 200;

  // Platforms
  for (let i = 0; i < 40; i++) {
    if (i === 0) {
      platforms.push({
        x: lastPlatformX,
        y: lastPlatformY,
        width: lastPlatformWidth,
        height: 20,
        color: theme.platform,
      });
      continue;
    }

    const gap = Math.random() * (MAX_GAP - MIN_GAP) + MIN_GAP;
    const newX = lastPlatformX + lastPlatformWidth + gap;

    // Calculate the vertical position (Y)
    // The next platform is relative to the last one, with a random change.
    const verticalChange = (Math.random() - 0.5) * 2 * MAX_VERTICAL_CHANGE;
    let newY = lastPlatformY + verticalChange;

    // Clamps the Y value to keep it within the screen's vertical bounds
    newY = Math.max(MIN_Y, Math.min(newY, MAX_Y));

    // Gets random dimensions for the new platform
    const newWidth = Math.floor(Math.random() * 101) + 100;
    const newHeight = Math.floor(Math.random() * 11) + 14;

    platforms.push({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      color: theme.platform,
    });

    // Update the 'last' variables for the next iteration
    lastPlatformX = newX;
    lastPlatformY = newY;
    lastPlatformWidth = newWidth;

    // Coins
    for (let j = 0; j < 5; j++) {
      coinsArray.push({
        x: newX + 30 + j * 30,
        y: newY - 30,
        width: 12,
        height: 12,
        color: "#ffff00",
      });
    }

    // Enemies every 3 platforms
    if (i % 3 === 0) {
      enemies.push({
        x: newX + 80,
        y: newY - 30,
        width: 28,
        height: 28,
        speed: 1.2,
        color: theme.accent,
        direction: 1,
        type: "eagle",
        animationOffset: Math.random() * 10,
      });
    }

    // Decorations
    decorations.push({
      type: "rock",
      x: newX + (Math.random() * 150 + 1),
      y: newY - 20,
      width: 30,
      height: 20,
      color: "#383838",
    });

    decorations.push({
      type: "tree",
      x: newX + (Math.random() * 150 + 1),
      y: newY - 40,
      width: 30,
      height: 40,
      color: ["#2e382e", "#336633"],
    });
  }

  // Moving platforms
  for (let i = 0; i < 10; i++) {
    movingPlatforms.push({
      x: 300 + i * 600,
      y: 250,
      width: 80,
      height: 15,
      color: "#cc9966",
      startY: 250,
      endY: 350,
      speed: 0.8,
      direction: 1,
      vertical: true,
    });
  }

  // Springs
  springs.push({
    x: 1000,
    y: 520,
    width: 20,
    height: 30,
    color: "#00ffff",
    power: 25,
  });
  springs.push({
    x: 3000,
    y: 520,
    width: 20,
    height: 30,
    color: "#00ffff",
    power: 25,
  });
}

function createOceanLevel(theme) {
  // State Variables
  // Keep track of the last platform's position.
  // Starts the first platform at a fixed position.
  let lastPlatformX = 0;
  let lastPlatformY = 450;
  let lastPlatformWidth = 200;

  // Platforms
  for (let i = 0; i < 40; i++) {
    if (i === 0) {
      platforms.push({
        x: lastPlatformX,
        y: lastPlatformY,
        width: lastPlatformWidth,
        height: 20,
        color: theme.platform,
      });
      continue;
    }

    const gap = Math.random() * (MAX_GAP - MIN_GAP) + MIN_GAP;
    const newX = lastPlatformX + lastPlatformWidth + gap;

    // Calculate the vertical position (Y)
    // The next platform is relative to the last one, with a random change.
    const verticalChange = (Math.random() - 0.5) * 2 * MAX_VERTICAL_CHANGE;
    let newY = lastPlatformY + verticalChange;

    // Clamps the Y value to keep it within the screen's vertical bounds
    newY = Math.max(MIN_Y, Math.min(newY, MAX_Y));

    // Gets random dimensions for the new platform
    const newWidth = Math.floor(Math.random() * 101) + 100;
    const newHeight = Math.floor(Math.random() * 11) + 14;

    platforms.push({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      color: theme.platform,
    });

    // Update the 'last' variables for the next iteration
    lastPlatformX = newX;
    lastPlatformY = newY;
    lastPlatformWidth = newWidth;

    // Coins
    for (let j = 0; j < 6; j++) {
      coinsArray.push({
        x: newX + 30 + j * 30,
        y: newY - 30,
        width: 12,
        height: 12,
        color: "#ffff00",
      });
    }

    // Enemies every 3 platforms
    if (i % 3 === 0) {
      enemies.push({
        x: newX + 80,
        y: newY - 30,
        width: 30,
        height: 24,
        speed: 1.3,
        color: theme.accent,
        direction: 1,
        type: "fish",
        animationOffset: Math.random() * 10,
      });
    }

    // Decorations
    decorations.push({
      type: "coral",
      x: newX + (Math.random() * 150 + 1),
      y: newY - 20,
      width: 30,
      height: 30,
      color: "#ff6666",
    });

    decorations.push({
      type: "seaweed",
      x: newX + (Math.random() * 150 + 1),
      y: newY - 40,
      width: 20,
      height: 50,
      color: "#00cc66",
    });
  }

  // Moving platforms
  for (let i = 0; i < 8; i++) {
    movingPlatforms.push({
      x: 400 + i * 700,
      y: 300,
      width: 100,
      height: 15,
      color: "#cc9966",
      startX: 400 + i * 700,
      endX: 600 + i * 700,
      speed: 1.2,
      direction: 1,
    });
  }

  // Springs
  springs.push({
    x: 1500,
    y: 520,
    width: 20,
    height: 30,
    color: "#00ffff",
    power: 30,
  });
  springs.push({
    x: 4500,
    y: 520,
    width: 20,
    height: 30,
    color: "#00ffff",
    power: 30,
  });
}

function createVolcanoLevel(theme) {
  // State Variables
  // Keep track of the last platform's position.
  // Starts the first platform at a fixed position.
  let lastPlatformX = 0;
  let lastPlatformY = 450;
  let lastPlatformWidth = 200;

  // Platforms
  for (let i = 0; i < 40; i++) {
    if (i === 0) {
      platforms.push({
        x: lastPlatformX,
        y: lastPlatformY,
        width: lastPlatformWidth,
        height: 20,
        color: theme.platform,
      });
      continue;
    }

    const gap = Math.random() * (MAX_GAP - MIN_GAP) + MIN_GAP;
    const newX = lastPlatformX + lastPlatformWidth + gap;

    // Calculate the vertical position (Y)
    // The next platform is relative to the last one, with a random change.
    const verticalChange = (Math.random() - 0.5) * 2 * MAX_VERTICAL_CHANGE;
    let newY = lastPlatformY + verticalChange;

    // Clamps the Y value to keep it within the screen's vertical bounds
    newY = Math.max(MIN_Y, Math.min(newY, MAX_Y));

    // Gets random dimensions for the new platform
    const newWidth = Math.floor(Math.random() * 101) + 100;
    const newHeight = Math.floor(Math.random() * 11) + 14;

    platforms.push({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      color: theme.platform,
    });

    // Update the 'last' variables for the next iteration
    lastPlatformX = newX;
    lastPlatformY = newY;
    lastPlatformWidth = newWidth;

    // Coins
    for (let j = 0; j < 5; j++) {
      coinsArray.push({
        x: newX + 30 + j * 30,
        y: newY - 30,
        width: 12,
        height: 12,
        color: "#ffff00",
      });
    }

    // Enemies every 3 platforms
    if (i % 3 === 0) {
      enemies.push({
        x: newX + 80,
        y: newY - 30,
        width: 28,
        height: 28,
        speed: 1.5,
        color: "#ff5500",
        direction: 1,
        type: "lava-blob",
        animationOffset: Math.random() * 10,
      });
    }

    // Decorations
    decorations.push({
      type: "volcano-rock",
      x: newX + (Math.random() * 150 + 1),
      y: newY - 20,
      width: 30,
      height: 20,
      color: "#663300",
    });

    decorations.push({
      type: "lava-geyser",
      x: newX + (Math.random() * 150 + 1),
      y: newY - 40,
      width: 20,
      height: 40,
      color: "#ff3300",
      pulse: Math.random() * 10,
    });
  }

  // Moving platforms (horizontal)
  for (let i = 0; i < 8; i++) {
    movingPlatforms.push({
      x: 400 + i * 700,
      y: 300,
      width: 100,
      height: 15,
      color: "#cc5500",
      startX: 400 + i * 700,
      endX: 600 + i * 700,
      speed: 1.5,
      direction: 1,
    });
  }

  // Hanging platforms (like Mario)
  for (let i = 0; i < 15; i++) {
    const chainLength = 60;
    const platformY = 200 + (i % 3) * 100;
    platforms.push({
      x: 500 + i * 400,
      y: platformY,
      width: 80,
      height: 15,
      color: "#cc9966",
      hanging: true,
      chainY: platformY - chainLength,
    });
  }

  // Lava pools
  for (let i = 0; i < 10; i++) {
    spikes.push({
      x: 300 + i * 700,
      y: 540,
      width: 200,
      height: 10,
      color: "#ff3300",
      type: "lava-pool",
    });
  }

  // Springs
  springs.push({
    x: 2000,
    y: 520,
    width: 20,
    height: 30,
    color: "#00ffff",
    power: 30,
  });
}

function createIceCaveLevel(theme) {
  // State Variables
  // Keep track of the last platform's position.
  // Starts the first platform at a fixed position.
  let lastPlatformX = 0;
  let lastPlatformY = 450;
  let lastPlatformWidth = 200;

  // Platforms
  for (let i = 0; i < 40; i++) {
    if (i === 0) {
      platforms.push({
        x: lastPlatformX,
        y: lastPlatformY,
        width: lastPlatformWidth,
        height: 20,
        color: theme.platform,
        slippery: true,
      });
      continue;
    }

    const gap = Math.random() * (MAX_GAP - MIN_GAP) + MIN_GAP;
    const newX = lastPlatformX + lastPlatformWidth + gap;

    // Calculate the vertical position (Y)
    // The next platform is relative to the last one, with a random change.
    const verticalChange = (Math.random() - 0.5) * 2 * MAX_VERTICAL_CHANGE;
    let newY = lastPlatformY + verticalChange;

    // Clamps the Y value to keep it within the screen's vertical bounds
    newY = Math.max(MIN_Y, Math.min(newY, MAX_Y));

    // Gets random dimensions for the new platform
    const newWidth = Math.floor(Math.random() * 101) + 100;
    const newHeight = Math.floor(Math.random() * 11) + 14;

    platforms.push({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      color: theme.platform,
    });

    // Update the 'last' variables for the next iteration
    lastPlatformX = newX;
    lastPlatformY = newY;
    lastPlatformWidth = newWidth;

    // Coins
    for (let j = 0; j < 6; j++) {
      coinsArray.push({
        x: newX + 30 + j * 30,
        y: newY - 30,
        width: 12,
        height: 12,
        color: "#ffff00",
      });
    }

    // Enemies every 4 platforms
    if (i % 4 === 0) {
      enemies.push({
        x: newX + 80,
        y: newY - 30,
        width: 30,
        height: 30,
        speed: 1.2,
        color: "#00aaff",
        direction: 1,
        type: "ice-golem",
        animationOffset: Math.random() * 10,
      });
    }

    // Decorations
    decorations.push({
      type: "ice-crystal",
      x: newX + (Math.random() * 150 + 1),
      y: newY - 40,
      width: 20,
      height: 40,
      color: "#aaddff",
    });

    decorations.push({
      type: "snow-pile",
      x: newX + (Math.random() * 150 + 1),
      y: newY - 20,
      width: 40,
      height: 20,
      color: "#ffffff",
    });
  }

  // Moving platforms (vertical)
  for (let i = 0; i < 10; i++) {
    movingPlatforms.push({
      x: 300 + i * 600,
      y: 250,
      width: 100,
      height: 15,
      color: "#88ccff",
      startY: 150,
      endY: 350,
      speed: 0.7,
      direction: 1,
      vertical: true,
    });
  }

  // Ice slides
  for (let i = 0; i < 8; i++) {
    platforms.push({
      x: 400 + i * 700,
      y: 300 - (i % 3) * 100,
      width: 300,
      height: 10,
      color: "#aaddff",
      angle: -0.2,
      slippery: true,
    });
  }

  // Icicles (hanging spikes)
  for (let i = 0; i < 20; i++) {
    spikes.push({
      x: 200 + i * 350,
      y: 100,
      width: 10,
      height: 40,
      color: "#ffffff",
      type: "icicle",
    });
  }
}

function createLavaZoneLevel(theme) {
  // State Variables
  // Keep track of the last platform's position.
  // Starts the first platform at a fixed position.
  let lastPlatformX = 0;
  let lastPlatformY = 450;
  let lastPlatformWidth = 200;

  // Platforms
  for (let i = 0; i < 40; i++) {
    if (i === 0) {
      platforms.push({
        x: lastPlatformX,
        y: lastPlatformY,
        width: lastPlatformWidth,
        height: 20,
        color: theme.platform,
      });
      continue;
    }

    const gap = Math.random() * (MAX_GAP - MIN_GAP) + MIN_GAP;
    const newX = lastPlatformX + lastPlatformWidth + gap;

    // Calculate the vertical position (Y)
    // The next platform is relative to the last one, with a random change.
    const verticalChange = (Math.random() - 0.5) * 2 * MAX_VERTICAL_CHANGE;
    let newY = lastPlatformY + verticalChange;

    // Clamps the Y value to keep it within the screen's vertical bounds
    newY = Math.max(MIN_Y, Math.min(newY, MAX_Y));

    // Gets random dimensions for the new platform
    const newWidth = Math.floor(Math.random() * 101) + 100;
    const newHeight = Math.floor(Math.random() * 11) + 14;

    platforms.push({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      color: theme.platform,
    });

    // Update the 'last' variables for the next iteration
    lastPlatformX = newX;
    lastPlatformY = newY;
    lastPlatformWidth = newWidth;

    // Coins
    for (let j = 0; j < 5; j++) {
      coinsArray.push({
        x: newX + 30 + j * 30,
        y: newY - 30,
        width: 12,
        height: 12,
        color: "#ffff00",
      });
    }

    // Enemies every 2 platforms
    if (i % 2 === 0) {
      enemies.push({
        x: newX + 80,
        y: newY - 30,
        width: 32,
        height: 32,
        speed: 1.3,
        color: "#ff5500",
        direction: 1,
        type: "fire-spirit",
        animationOffset: Math.random() * 10,
      });
    }

    // Decorations
    decorations.push({
      type: "lava-fall",
      x: newX + (Math.random() * 150 + 1),
      y: newY - 60,
      width: 30,
      height: 60,
      color: "#ff3300",
      pulse: Math.random() * 10,
    });

    decorations.push({
      type: "obsidian",
      x: newX + (Math.random() * 150 + 1),
      y: newY - 30,
      width: 40,
      height: 30,
      color: "#333333",
    });
  }

  // Moving platforms (horizontal with fire)
  for (let i = 0; i < 10; i++) {
    movingPlatforms.push({
      x: 300 + i * 600,
      y: 300,
      width: 100,
      height: 15,
      color: "#cc5500",
      startX: 300 + i * 600,
      endX: 500 + i * 600,
      speed: 1.8,
      direction: 1,
      hasFire: true,
    });
  }

  // Fire jets
  for (let i = 0; i < 15; i++) {
    spikes.push({
      x: 400 + i * 450,
      y: 530,
      width: 40,
      height: 20,
      color: "#ff5500",
      type: "fire-jet",
      active: Math.random() > 0.5,
    });
  }

  // Fireballs (flying enemies)
  for (let i = 0; i < 8; i++) {
    enemies.push({
      x: 300 + i * 800,
      y: 200,
      width: 24,
      height: 24,
      speed: 2.0,
      color: "#ff3300",
      direction: 1,
      type: "fireball",
      vertical: true,
      animationOffset: Math.random() * 10,
    });
  }
}

function createCastleLevel(theme) {
  // State Variables
  // Keep track of the last platform's position.
  // Starts the first platform at a fixed position.
  let lastPlatformX = 0;
  let lastPlatformY = 450;
  let lastPlatformWidth = 200;

  // Platforms
  for (let i = 0; i < 40; i++) {
    if (i === 0) {
      platforms.push({
        x: lastPlatformX,
        y: lastPlatformY,
        width: lastPlatformWidth,
        height: 20,
        color: theme.platform,
      });
      continue;
    }

    const gap = Math.random() * (MAX_GAP - MIN_GAP) + MIN_GAP;
    const newX = lastPlatformX + lastPlatformWidth + gap;

    // Calculate the vertical position (Y)
    // The next platform is relative to the last one, with a random change.
    const verticalChange = (Math.random() - 0.5) * 2 * MAX_VERTICAL_CHANGE;
    let newY = lastPlatformY + verticalChange;

    // Clamps the Y value to keep it within the screen's vertical bounds
    newY = Math.max(MIN_Y, Math.min(newY, MAX_Y));

    // Gets random dimensions for the new platform
    const newWidth = Math.floor(Math.random() * 101) + 100;
    const newHeight = Math.floor(Math.random() * 11) + 14;

    platforms.push({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      color: theme.platform,
    });

    // Update the 'last' variables for the next iteration
    lastPlatformX = newX;
    lastPlatformY = newY;
    lastPlatformWidth = newWidth;

    // Coins
    for (let j = 0; j < 5; j++) {
      coinsArray.push({
        x: newX + 30 + j * 30,
        y: newY - 30,
        width: 12,
        height: 12,
        color: "#ffff00",
      });
    }

    // Enemies every 3 platforms
    if (i % 3 === 0) {
      enemies.push({
        x: newY + 80,
        y: newY - 30,
        width: 26,
        height: 36,
        speed: 1.4,
        color: "#9900cc",
        direction: 1,
        type: "knight",
        animationOffset: Math.random() * 10,
      });
    }

    // Decorations
    decorations.push({
      type: "castle-tower",
      x: newX + (Math.random() * 150 + 1),
      y: newY - 80,
      width: 30,
      height: 80,
      color: "#aa88ff",
    });

    decorations.push({
      type: "banner",
      x: newX + (Math.random() * 150 + 1),
      y: newY - 60,
      width: 20,
      height: 40,
      color: "#ff00ff",
    });
  }

  // Moving platforms (vertical with magic)
  for (let i = 0; i < 12; i++) {
    movingPlatforms.push({
      x: 200 + i * 500,
      y: 200,
      width: 80,
      height: 15,
      color: "#cc66ff",
      startY: 150,
      endY: 350,
      speed: 0.9,
      direction: 1,
      vertical: true,
      magic: true,
    });
  }

  // Spikes (castle traps)
  for (let i = 0; i < 20; i++) {
    spikes.push({
      x: 300 + i * 350,
      y: 530,
      width: 30,
      height: 20,
      color: "#990000",
      type: "spike-trap",
    });
  }

  // Magic portals (springs with teleport effect)
  springs.push({
    x: 1000,
    y: 400,
    width: 40,
    height: 60,
    color: "#ff00ff",
    power: 0,
    portal: true,
    targetX: 3000,
    targetY: 300,
  });
  springs.push({
    x: 5000,
    y: 300,
    width: 40,
    height: 60,
    color: "#ff00ff",
    power: 0,
    portal: true,
    targetX: 1000,
    targetY: 400,
  });
}

function gameLoop(timestamp) {
  if (!gameRunning) return;

  if (lastTime === 0) {
    lastTime = timestamp;
  }

  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  gameTime += deltaTime;

  update(deltaTime);
  render();
  requestAnimationFrame(gameLoop);
}

function update(deltaTime) {
  // Update camera to follow player
  cameraOffset = player.x - 200;
  if (cameraOffset < 0) cameraOffset = 0;
  if (cameraOffset > worldWidth - canvas.width)
    cameraOffset = worldWidth - canvas.width;

  // Update progress bar
  progressBar.style.width = `${(player.x / worldWidth) * 100}%`;

  // Player movement
  player.velX = 0;
  const currentSpeed = keys["Shift"] ? player.runSpeed : player.speed;

  if (keys["ArrowLeft"]) {
    player.velX = -currentSpeed;
    player.facing = "left";
  }
  if (keys["ArrowRight"]) {
    player.velX = currentSpeed;
    player.facing = "right";
  }

  // Jumping
  if (keys[" "] && !player.isJumping) {
    player.velY = player.jumpForce;
    player.isJumping = true;
    if (soundEnabled) sounds.jump.play();
  }

  // Apply gravity
  player.velY += player.gravity;

  // Platform collision
  player.isJumping = true;

  player.x += player.velX;

  // Boundary checking
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > worldWidth)
    player.x = worldWidth - player.width;

  for (const platform of platforms) {
    if (
      player.x < platform.x + platform.width &&
      player.x + player.width > platform.x &&
      player.y + player.height <= platform.y &&
      player.y + player.height + player.velY >= platform.y &&
      platform?.ground !== true
    ) {
      player.y = platform.y - player.height;
      player.velY = 0;
      player.isJumping = false;
    }
  }

  // Moving platform collision
  for (const platform of movingPlatforms) {
    // Update moving platform
    if (platform.vertical) {
      platform.y += platform.speed * platform.direction;
      if (platform.y <= platform.startY || platform.y >= platform.endY) {
        platform.direction *= -1;
      }
    } else {
      platform.x += platform.speed * platform.direction;
      if (platform.x <= platform.startX || platform.x >= platform.endX) {
        platform.direction *= -1;
      }
    }

    // Collision detection
    if (
      player.x < platform.x + platform.width &&
      player.x + player.width > platform.x &&
      player.y + player.height <= platform.y &&
      player.y + player.height + player.velY >= platform.y
    ) {
      player.y = platform.y - player.height;
      player.velY = 0;
      player.isJumping = false;

      // Move player with platform
      if (!platform.vertical) {
        player.x += platform.speed * platform.direction;
      }
    }
  }

  player.y += player.velY;

  // Fall off screen
  if (player.y > canvas.height) {
    lives--;
    updateUI();
    player.x = 50;
    player.y = 400;
    player.velY = 0;
    if (soundEnabled) sounds.hit.play();

    if (lives <= 0) {
      gameOver();
    }
  }

  // Coin collection
  for (let i = coinsArray.length - 1; i >= 0; i--) {
    if (
      player.x < coinsArray[i].x + coinsArray[i].width &&
      player.x + player.width > coinsArray[i].x &&
      player.y < coinsArray[i].y + coinsArray[i].height &&
      player.y + player.height > coinsArray[i].y
    ) {
      coinsArray.splice(i, 1);
      score += 100;
      coins++;
      updateUI();
      if (soundEnabled) sounds.coin.play();
    }
  }

  // Treasure collection
  for (let i = treasures.length - 1; i >= 0; i--) {
    if (
      player.x < treasures[i].x + treasures[i].width &&
      player.x + player.width > treasures[i].x &&
      player.y < treasures[i].y + treasures[i].height &&
      player.y + player.height > treasures[i].y
    ) {
      treasures.splice(i, 1);
      score += 1000;
      levelCompleted = true;
      levelCompleteScreen.style.display = "flex";
      gameRunning = false;
      levelScoreDisplay.textContent = `SCORE: ${score.toString().padStart(5, "0")}`;
      if (!completedLevels.includes(currentLevel)) {
        completedLevels.push(currentLevel);
      }
      if (soundEnabled) {
        sounds.background.pause();
        sounds.win.play();
        // wait 2 seconds before playing background music again
        setTimeout(() => {
          sounds.background.loop = true;
          sounds.background.play();
        }, 2000);
      }
    }
  }

  // Spring collision
  for (const spring of springs) {
    if (
      player.x < spring.x + spring.width &&
      player.x + player.width > spring.x &&
      player.y + player.height <= spring.y &&
      player.y + player.height + player.velY >= spring.y
    ) {
      player.velY = -spring.power;
      player.isJumping = true;
    }
  }

  // Enemy movement and collision
  for (const enemy of enemies) {
    if (
      enemy.type === "eagle" ||
      enemy.type === "fish" ||
      enemy.type === "fireball"
    ) {
      // Flying enemy movement pattern
      enemy.x += enemy.speed * enemy.direction;
      enemy.y = enemy.y + Math.sin(gameTime / 500 + enemy.animationOffset) * 2;

      // Change direction if at edge
      if (enemy.x <= 0 || enemy.x + enemy.width >= worldWidth) {
        enemy.direction *= -1;
      }
    } else if (enemy.type === "fire-spirit" || enemy.type === "lava-blob") {
      // Floating enemy
      enemy.x += enemy.speed * enemy.direction;
      enemy.y = enemy.y + Math.sin(gameTime / 200 + enemy.animationOffset) * 2;

      // Change direction if at edge
      if (enemy.x <= 0 || enemy.x + enemy.width >= worldWidth) {
        enemy.direction *= -1;
      }
    } else if (enemy.type === "ice-golem") {
      // Sliding enemy
      enemy.x += enemy.speed * enemy.direction;
      enemy.y = enemy.y + Math.sin(gameTime / 300 + enemy.animationOffset) * 1;

      // Change direction if at edge
      if (enemy.x <= 0 || enemy.x + enemy.width >= worldWidth) {
        enemy.direction *= -1;
      }
    } else {
      // Ground enemy movement
      enemy.x += enemy.speed * enemy.direction;

      // Change direction if at edge
      if (enemy.x <= 0 || enemy.x + enemy.width >= worldWidth) {
        enemy.direction *= -1;
      }
    }

    // Collision with player
    if (
      player.x < enemy.x + enemy.width &&
      player.x + player.width > enemy.x &&
      player.y < enemy.y + enemy.height &&
      player.y + player.height > enemy.y
    ) {
      // If player is above enemy (jumping on it)
      if (
        player.velY > 0 &&
        player.y + player.height < enemy.y + enemy.height / 2
      ) {
        enemies.splice(enemies.indexOf(enemy), 1);
        player.velY = player.jumpForce * 0.8;
        score += 200;
        updateUI();
        if (soundEnabled) sounds.coin.play();
      } else {
        // Player hit by enemy
        lives--;
        updateUI();
        player.x = 50;
        player.y = 400;
        player.velY = 0;
        if (soundEnabled) sounds.hit.play();

        if (lives <= 0) {
          gameOver();
        }
      }
    }
  }

  // Spike collision
  for (const spike of spikes) {
    if (
      player.x < spike.x + spike.width &&
      player.x + player.width > spike.x &&
      player.y < spike.y + spike.height &&
      player.y + player.height > spike.y
    ) {
      lives--;
      updateUI();
      player.x = 50;
      player.y = 400;
      player.velY = 0;
      if (soundEnabled) sounds.hit.play();

      if (lives <= 0) {
        gameOver();
      }
    }
  }
}

function render() {
  // Clear canvas
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw background based on level
  drawBackground();

  // Draw game objects relative to camera
  ctx.save();
  ctx.translate(-cameraOffset, 0);

  // Draw platforms
  for (const platform of platforms) {
    ctx.fillStyle = platform.color;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

    // Draw chains for hanging platforms
    if (platform.hanging) {
      ctx.strokeStyle = "#999999";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(platform.x + platform.width / 2, platform.chainY);
      ctx.lineTo(platform.x + platform.width / 2, platform.y);
      ctx.stroke();
    }

    // Platform details
    ctx.fillStyle = "#000";
    for (let x = platform.x; x < platform.x + platform.width; x += 10) {
      for (let y = platform.y; y < platform.y + platform.height; y += 10) {
        if ((x + y) % 20 === 0) {
          ctx.fillRect(x, y, 5, 5);
        }
      }
    }
  }

  // Draw moving platforms
  for (const platform of movingPlatforms) {
    ctx.fillStyle = platform.color;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

    // Draw fire effect for lava platforms
    if (platform.hasFire) {
      const fireHeight = Math.sin(gameTime / 100) * 5 + 10;
      ctx.fillStyle = "#ff5500";
      ctx.fillRect(
        platform.x,
        platform.y - fireHeight,
        platform.width,
        fireHeight,
      );
    }

    // Platform details
    ctx.fillStyle = "#000";
    for (let x = platform.x; x < platform.x + platform.width; x += 10) {
      for (let y = platform.y; y < platform.y + platform.height; y += 10) {
        if ((x + y) % 20 === 0) {
          ctx.fillRect(x, y, 5, 5);
        }
      }
    }
  }

  // Draw coins
  for (const coin of coinsArray) {
    ctx.fillStyle = coin.color;
    ctx.beginPath();
    ctx.arc(
      coin.x + coin.width / 2,
      coin.y + coin.height / 2,
      coin.width / 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.fillStyle = "#ffaa00";
    ctx.beginPath();
    ctx.arc(
      coin.x + coin.width / 2,
      coin.y + coin.height / 2,
      coin.width / 4,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Coin shine
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(
      coin.x + coin.width / 3,
      coin.y + coin.height / 3,
      coin.width / 8,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Draw treasures
  for (const treasure of treasures) {
    ctx.fillStyle = treasure.color;
    ctx.beginPath();
    ctx.arc(
      treasure.x + treasure.width / 2,
      treasure.y + treasure.height / 2,
      treasure.width / 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(treasure.x + treasure.width / 2, treasure.y + 5);
    ctx.lineTo(
      treasure.x + treasure.width - 5,
      treasure.y + treasure.height - 5,
    );
    ctx.lineTo(treasure.x + 5, treasure.y + treasure.height - 5);
    ctx.closePath();
    ctx.fill();

    // Treasure shine
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.beginPath();
    ctx.arc(
      treasure.x + treasure.width / 3,
      treasure.y + treasure.height / 3,
      treasure.width / 8,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Draw enemies
  for (const enemy of enemies) {
    const animationOffset =
      Math.sin(gameTime / 200 + enemy.animationOffset) * 3;

    if (enemy.type === "eagle") {
      // Flying enemy
      ctx.fillStyle = enemy.color;
      ctx.beginPath();
      // Body
      ctx.ellipse(
        enemy.x + enemy.width / 2,
        enemy.y + enemy.height / 2 + animationOffset,
        enemy.width / 2,
        enemy.height / 2,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Wings
      const wingOffset = Math.sin(gameTime / 100) * 5;
      ctx.beginPath();
      ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
      ctx.lineTo(
        enemy.x + enemy.width / 2 - 15,
        enemy.y + enemy.height / 2 - 10 - wingOffset,
      );
      ctx.lineTo(enemy.x + enemy.width / 2 - 20, enemy.y + enemy.height / 2);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
      ctx.lineTo(
        enemy.x + enemy.width / 2 + 15,
        enemy.y + enemy.height / 2 - 10 - wingOffset,
      );
      ctx.lineTo(enemy.x + enemy.width / 2 + 20, enemy.y + enemy.height / 2);
      ctx.closePath();
      ctx.fill();

      // Eyes
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(
        enemy.x + enemy.width / 2 + 5,
        enemy.y + enemy.height / 3,
        3,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    } else if (enemy.type === "scorpion") {
      // Scorpion enemy
      ctx.fillStyle = enemy.color;
      // Body
      ctx.fillRect(enemy.x, enemy.y + 5, enemy.width, enemy.height - 5);

      // Tail
      ctx.beginPath();
      ctx.moveTo(enemy.x + enemy.width - 5, enemy.y + 5);
      ctx.lineTo(enemy.x + enemy.width + 10, enemy.y - 10);
      ctx.lineTo(enemy.x + enemy.width + 5, enemy.y);
      ctx.closePath();
      ctx.fill();

      // Claws
      ctx.beginPath();
      ctx.moveTo(enemy.x, enemy.y);
      ctx.lineTo(enemy.x - 10, enemy.y - 5);
      ctx.lineTo(enemy.x, enemy.y + 5);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(enemy.x, enemy.y);
      ctx.lineTo(enemy.x - 10, enemy.y + 10);
      ctx.lineTo(enemy.x, enemy.y + 5);
      ctx.closePath();
      ctx.fill();

      // Legs
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(enemy.x + 5 + i * 8, enemy.y + enemy.height);
        ctx.lineTo(enemy.x + i * 8, enemy.y + enemy.height + 10);
        ctx.strokeStyle = enemy.color;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Eyes
      ctx.fillStyle = "#000";
      ctx.fillRect(enemy.x + 5, enemy.y + 5, 3, 3);
      ctx.fillRect(enemy.x + 10, enemy.y + 5, 3, 3);
    } else if (enemy.type === "lava-blob") {
      // Lava blob enemy
      ctx.fillStyle = enemy.color;
      ctx.beginPath();
      ctx.arc(
        enemy.x + enemy.width / 2,
        enemy.y + enemy.height / 2 + animationOffset,
        enemy.width / 2,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Lava effect
      ctx.fillStyle = "#ff9900";
      ctx.beginPath();
      ctx.arc(
        enemy.x + enemy.width / 2,
        enemy.y + enemy.height / 2 + animationOffset,
        enemy.width / 3,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Eyes
      ctx.fillStyle = "#000";
      ctx.fillRect(enemy.x + 5, enemy.y + 8, 4, 4);
      ctx.fillRect(enemy.x + 15, enemy.y + 8, 4, 4);
    } else if (enemy.type === "ice-golem") {
      // Ice golem enemy
      ctx.fillStyle = enemy.color;
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

      // Ice details
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(enemy.x + i * 8, enemy.y, 4, 4);
        ctx.fillRect(enemy.x + i * 8, enemy.y + enemy.height - 4, 4, 4);
      }

      // Eyes
      ctx.fillStyle = "#000";
      ctx.fillRect(enemy.x + 8, enemy.y + 8, 4, 4);
      ctx.fillRect(enemy.x + 20, enemy.y + 8, 4, 4);
    } else if (enemy.type === "fire-spirit") {
      // Fire spirit enemy
      ctx.fillStyle = enemy.color;
      ctx.beginPath();
      ctx.arc(
        enemy.x + enemy.width / 2,
        enemy.y + enemy.height / 2 + animationOffset,
        enemy.width / 2,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Flame effect
      ctx.fillStyle = "#ff9900";
      ctx.beginPath();
      ctx.arc(
        enemy.x + enemy.width / 2,
        enemy.y + enemy.height / 2 + animationOffset,
        enemy.width / 3,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Eyes
      ctx.fillStyle = "#000";
      ctx.fillRect(enemy.x + 8, enemy.y + 8, 4, 4);
      ctx.fillRect(enemy.x + 20, enemy.y + 8, 4, 4);
    } else if (enemy.type === "fireball") {
      // Fireball enemy
      ctx.fillStyle = "#ff3300";
      ctx.beginPath();
      ctx.arc(
        enemy.x + enemy.width / 2,
        enemy.y + enemy.height / 2 + animationOffset,
        enemy.width / 2,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Flame core
      ctx.fillStyle = "#ffff00";
      ctx.beginPath();
      ctx.arc(
        enemy.x + enemy.width / 2,
        enemy.y + enemy.height / 2 + animationOffset,
        enemy.width / 3,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    } else if (enemy.type === "knight") {
      // Knight enemy
      ctx.fillStyle = enemy.color;
      // Body
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

      // Helmet
      ctx.fillRect(enemy.x - 2, enemy.y - 10, enemy.width + 4, 10);

      // Sword
      ctx.fillStyle = "#999999";
      ctx.fillRect(enemy.x + enemy.width - 5, enemy.y + 5, 15, 5);
    } else {
      // Standard ground enemy
      ctx.fillStyle = enemy.color;
      ctx.fillRect(
        enemy.x,
        enemy.y + animationOffset,
        enemy.width,
        enemy.height,
      );

      // Draw enemy eyes
      ctx.fillStyle = "#000";
      const eyeOffset = enemy.direction > 0 ? enemy.width - 8 : 8;
      ctx.fillRect(
        enemy.x + eyeOffset - 4,
        enemy.y + enemy.height / 3 + animationOffset,
        4,
        4,
      );
    }
  }

  // Draw spikes
  for (const spike of spikes) {
    ctx.fillStyle = spike.color;
    ctx.beginPath();
    ctx.moveTo(spike.x + spike.width / 2, spike.y);
    ctx.lineTo(spike.x, spike.y + spike.height);
    ctx.lineTo(spike.x + spike.width, spike.y + spike.height);
    ctx.closePath();
    ctx.fill();

    // For fire jets
    if (spike.type === "fire-jet" && spike.active) {
      const jetHeight = Math.sin(gameTime / 100) * 10 + 30;
      ctx.fillStyle = "#ff9900";
      ctx.fillRect(
        spike.x - 5,
        spike.y - jetHeight,
        spike.width + 10,
        jetHeight,
      );
    }
  }

  // Draw springs
  for (const spring of springs) {
    ctx.fillStyle = spring.color;
    ctx.fillRect(spring.x, spring.y, spring.width, spring.height);

    // Draw spring coils
    ctx.fillStyle = "#00aaff";
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(spring.x, spring.y + i * 8, spring.width, 3);
    }

    // For magic portals
    if (spring.portal) {
      ctx.fillStyle = "#ff00ff";
      ctx.beginPath();
      ctx.arc(
        spring.x + spring.width / 2,
        spring.y + spring.height / 2,
        spring.width / 2,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(
        spring.x + spring.width / 2,
        spring.y + spring.height / 2,
        spring.width / 4,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // Draw decorations
  for (const decor of decorations) {
    if (decor.type === "tree") {
      // Draw trunk
      ctx.fillStyle = decor.color[0];
      ctx.fillRect(
        decor.x + decor.width / 2 - 3,
        decor.y + decor.height / 2,
        6,
        decor.height / 2,
      );
      // Draw leaves
      ctx.fillStyle = decor.color[1];
      ctx.beginPath();
      ctx.arc(
        decor.x + decor.width / 2,
        decor.y + 5,
        decor.width / 2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    } else if (decor.type === "bush") {
      ctx.fillStyle = decor.color;

      ctx.beginPath();
      ctx.arc(decor.x, decor.y, decor.width / 3, 0, Math.PI * 2);
      ctx.arc(
        decor.x + decor.width / 2,
        decor.y,
        decor.width / 3,
        0,
        Math.PI * 2,
      );
      ctx.arc(decor.x + decor.width, decor.y, decor.width / 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (decor.type === "cactus") {
      ctx.fillStyle = decor.color;

      // Main stem
      ctx.fillRect(decor.x + decor.width / 2 - 3, decor.y, 6, decor.height);
      // Arms
      ctx.fillRect(decor.x - 5, decor.y + 20, 10, 5);
      ctx.fillRect(decor.x + decor.width - 5, decor.y + 40, 10, 5);
    } else if (decor.type === "volcano-rock") {
      ctx.fillStyle = decor.color;

      ctx.beginPath();
      ctx.arc(
        decor.x + decor.width / 2,
        decor.y + decor.height / 2,
        decor.width / 2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    } else if (decor.type === "lava-geyser") {
      ctx.fillStyle = decor.color;

      const geyserHeight = Math.sin(gameTime / 100 + decor.pulse) * 10 + 30;
      ctx.fillStyle = "#ff5500";
      ctx.fillRect(decor.x, decor.y - geyserHeight, decor.width, geyserHeight);
    } else if (decor.type === "ice-crystal") {
      ctx.fillStyle = decor.color;

      ctx.beginPath();
      ctx.moveTo(decor.x + decor.width / 2, decor.y);
      ctx.lineTo(decor.x, decor.y + decor.height);
      ctx.lineTo(decor.x + decor.width, decor.y + decor.height);
      ctx.closePath();
      ctx.fill();
    } else if (decor.type === "lava-fall") {
      ctx.fillStyle = decor.color;

      const lavaFlow = Math.sin(gameTime / 50 + decor.pulse) * 5;
      ctx.fillRect(decor.x, decor.y, decor.width, decor.height);
      ctx.fillStyle = "#ff9900";
      ctx.fillRect(decor.x + lavaFlow, decor.y, 10, decor.height);
    } else if (decor.type === "castle-tower") {
      ctx.fillStyle = decor.color;

      ctx.fillRect(decor.x, decor.y, decor.width, decor.height);
      // Tower top
      ctx.fillRect(decor.x - 5, decor.y, decor.width + 10, 10);
    } else if (decor.type === "banner") {
      ctx.fillStyle = decor.color;
      ctx.fillRect(decor.x, decor.y, decor.width, decor.height);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(decor.x + 5, decor.y + 10, decor.width - 10, 5);
    }
  }

  // Draw player
  drawPlayer();

  // Draw particles for visual effect
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * worldWidth;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 3;
    const alpha = Math.random() * 0.5;
    const theme = levelThemes[currentLevel - 1];
    ctx.fillStyle = `rgba(${parseInt(theme.accent.slice(1, 3), 16)}, ${parseInt(theme.accent.slice(3, 5), 16)}, ${parseInt(theme.accent.slice(5, 7), 16)}, ${alpha})`;
    ctx.fillRect(x, y, size, size);
  }

  ctx.restore();
}

function drawBackground() {
  const theme = levelThemes[currentLevel - 1];

  // Draw sky
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw distant mountains (parallax effect)
  ctx.fillStyle = theme.bgElements[0];
  for (let i = 0; i < 20; i++) {
    const x = ((i * 300 - cameraOffset * 0.1) % (canvas.width + 300)) - 150;
    const height = 100 + Math.sin(x / 100) * 30;
    ctx.beginPath();
    ctx.moveTo(x, 500);
    ctx.lineTo(x + 150, 400 - height);
    ctx.lineTo(x + 300, 500);
    ctx.fill();
  }

  // Draw closer mountains
  ctx.fillStyle = theme.bgElements[1];
  for (let i = 0; i < 15; i++) {
    const x = ((i * 250 - cameraOffset * 0.2) % (canvas.width + 250)) - 125;
    const height = 80 + Math.cos(x / 80) * 20;
    ctx.beginPath();
    ctx.moveTo(x, 500);
    ctx.lineTo(x + 125, 420 - height);
    ctx.lineTo(x + 250, 500);
    ctx.fill();
  }

  // Draw clouds (more parallax)
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 10; i++) {
    const x = ((i * 350 - cameraOffset * 0.3) % (canvas.width + 350)) - 175;
    const y = 80 + Math.sin(i) * 20;
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.arc(x + 20, y - 15, 30, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 25, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw stars in some levels
  if (currentLevel === 3 || currentLevel === 6 || currentLevel === 8) {
    for (let i = 0; i < 50; i++) {
      const x = ((i * 80 - cameraOffset * 0.05) % (canvas.width + 80)) - 40;
      const y = 50 + ((i * 17) % 150);
      const size = Math.random() * 2;
      const alpha = 0.5 + Math.sin(gameTime / 1000 + i) * 0.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(x, y, size, size);
    }
  }

  // Draw environment details based on level
  if (currentLevel === 1) {
    // Forest
    // Draw trees in background
    ctx.fillStyle = "#005500";
    for (let i = 0; i < 20; i++) {
      const x = ((i * 200 - cameraOffset * 0.6) % (canvas.width + 200)) - 100;
      ctx.fillRect(x - 5, 450, 10, 50);
      ctx.beginPath();
      ctx.arc(x, 430, 30, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (currentLevel === 4) {
    // Ocean
    // Draw bubbles
    for (let i = 0; i < 30; i++) {
      const x = ((i * 100 - cameraOffset * 0.4) % (canvas.width + 100)) - 50;
      const y = 300 + Math.sin(gameTime / 500 + i) * 100;
      const size = 3 + Math.sin(gameTime / 200 + i) * 2;
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (currentLevel === 5) {
    // Volcano
    // Draw lava glow
    const pulse = Math.sin(gameTime / 200) * 0.2 + 0.3;
    ctx.fillStyle = `rgba(255, 100, 0, ${pulse})`;
    ctx.fillRect(0, 520, canvas.width, 80);

    // Draw lava flows
    ctx.fillStyle = "#ff3300";
    for (let i = 0; i < 10; i++) {
      const x = ((i * 300 - cameraOffset * 0.2) % (canvas.width + 300)) - 150;
      const width = 100 + Math.sin(i) * 30;
      ctx.fillRect(x, 550, width, 20);
    }
  } else if (currentLevel === 6) {
    // Ice Cave
    // Draw snowflakes
    for (let i = 0; i < 50; i++) {
      const x = ((i * 40 - cameraOffset * 0.1) % (canvas.width + 40)) - 20;
      const y = (gameTime / 10 + i * 10) % 600;
      const size = 2 + Math.sin(i) * 1;
      ctx.fillStyle = "#e8e8e8";
      ctx.fillRect(x, y, size, size);
    }
  } else if (currentLevel === 7) {
    // Lava Zone
    // Draw lava glow
    const pulse = Math.sin(gameTime / 150) * 0.2 + 0.3;
    ctx.fillStyle = `rgba(255, 50, 0, ${pulse})`;
    ctx.fillRect(0, 520, canvas.width, 80);
  } else if (currentLevel === 8) {
    // Castle
    // Draw distant towers
    ctx.fillStyle = "#7700aa";
    for (let i = 0; i < 8; i++) {
      const x = ((i * 200 - cameraOffset * 0.3) % (canvas.width + 200)) - 100;
      ctx.fillRect(x, 400, 40, 150);
      ctx.fillRect(x - 5, 400, 50, 10);
    }
  }
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawPlayer() {
  const theme = levelThemes[currentLevel - 1];

  // --- Animation Calculations ---
  const legCycle = gameTime / 100;
  const legOffset = Math.sin(legCycle) * 4;
  const bodyBob = Math.sin(gameTime / 150) * 2;

  // Save the current canvas state
  ctx.save();

  // Position the player, including the body bob
  const pX = player.x;
  const pY = player.y + bodyBob;
  const pWidth = player.width;
  const pHeight = player.height;

  if (keys["Shift"]) {
    for (let i = 2; i >= 0; i--) {
      const alpha = 0.3 - i * 0.1;
      const trailX = pX - player.velocity.x * (i + 1) * 2;
      const trailY = pY + pHeight / 2;

      ctx.beginPath();
      ctx.arc(trailX + pWidth / 2, trailY, pWidth / (2 + i), 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(theme.accent, alpha);
      ctx.fill();
    }
  }

  // --- Draw Legs ---
  ctx.fillStyle = player.color;
  ctx.strokeStyle = "#2c3e50";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.roundRect(pX + 5, pY + pHeight - 5, 8, 12 + legOffset, 4);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(pX + pWidth - 13, pY + pHeight - 5, 8, 12 - legOffset, 4);
  ctx.fill();
  ctx.stroke();

  // --- Draw Player Body (as a rounded capsule) ---
  ctx.beginPath();
  ctx.moveTo(pX + 10, pY);
  ctx.lineTo(pX + pWidth - 10, pY);
  ctx.arcTo(pX + pWidth, pY, pX + pWidth, pY + 10, 10);
  ctx.lineTo(pX + pWidth, pY + pHeight - 10);
  ctx.arcTo(pX + pWidth, pY + pHeight, pX + pWidth - 10, pY + pHeight, 10);
  ctx.lineTo(pX + 10, pY + pHeight);
  ctx.arcTo(pX, pY + pHeight, pX, pY + pHeight - 10, 10);
  ctx.lineTo(pX, pY + 10);
  ctx.arcTo(pX, pY, pX + 10, pY, 10);
  ctx.closePath();

  // --- Apply Gradient for Shading ---
  const gradient = ctx.createLinearGradient(pX, pY, pX, pY + pHeight);
  gradient.addColorStop(0, player.color);
  gradient.addColorStop(1, hexToRgba(player.color, 0.7));
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.stroke();

  // --- Draw Visor/Goggles ---
  const visorCenterX = player.facing === "right" ? pX + pWidth - 12 : pX + 12;
  const visorCenterY = pY + pHeight * 0.4;

  ctx.beginPath();
  ctx.ellipse(visorCenterX, visorCenterY, 10, 8, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#2c3e50";
  ctx.fill();

  const reflection = ctx.createLinearGradient(
    visorCenterX - 10,
    visorCenterY - 8,
    visorCenterX + 10,
    visorCenterY + 8,
  );
  reflection.addColorStop(0, "rgba(255, 255, 255, 0.6)");
  reflection.addColorStop(0.5, "rgba(0, 102, 255, 0.4)");
  reflection.addColorStop(1, "rgba(0, 102, 255, 0.0)");
  ctx.fillStyle = reflection;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(visorCenterX + 3, visorCenterY - 2, 2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.fill();

  ctx.restore();
}

function gameOver() {
  gameRunning = false;
  finalScoreDisplay.textContent = `YOUR SCORE: ${score.toString().padStart(5, "0")}`;
  gameOverScreen.style.display = "flex";
  if (soundEnabled) {
    sounds.background.pause();
    sounds.gameOver.play();
    // wait 2 seconds before playing background music again
    setTimeout(() => {
      sounds.background.loop = true;
      sounds.background.play();
    }, 2000);
  }
}

function updateUI() {
  scoreDisplay.textContent = `SCORE: ${score.toString().padStart(5, "0")}`;
  coinsDisplay.textContent = `🟡 COINS: ${coins.toString().padStart(2, "0")}`;
  livesDisplay.textContent = `❤️ LIVES: ${lives} `;
  levelDisplay.textContent = `LEVEL: ${currentLevel}`;
}

// Function to open the modal
function openModal() {
  modalOverlay.classList.add("active");
}

// Function to close the modal
function closeModal() {
  modalOverlay.classList.remove("active");
}

// Event listener for close button
closeModalBtn.addEventListener("click", closeModal);

// Event listener for overlay click to close modal (optional, but common)
modalOverlay.addEventListener("click", (event) => {
  if (event.target === modalOverlay) {
    closeModal();
  }
});

// Event listener for music toggle button
musicToggleButton.addEventListener("click", () => {
  isMusicOn = !isMusicOn; // Toggle state
  if (isMusicOn) {
    musicToggleButton.classList.add("on");
    musicToggleButton.innerHTML =
      '<span class="music-icon">&#x266B;</span> ЗВУК: ON';
    soundEnabled = !soundEnabled;
    soundToggle.textContent = `ЗВУК: ${soundEnabled ? "ON" : "OFF"}`;
    if (soundEnabled) {
      sounds.click.play();
      sounds.background.play();
    } else {
      sounds.background.pause();
    }
  } else {
    musicToggleButton.classList.remove("on");
    musicToggleButton.innerHTML =
      '<span class="music-icon">&#x266B;</span> ЗВУК: OFF';

    soundEnabled = !soundEnabled;
    soundToggle.textContent = `ЗВУК: ${soundEnabled ? "ON" : "OFF"}`;
    if (soundEnabled) {
      sounds.click.play();
      sounds.background.play();
    } else {
      sounds.background.pause();
    }
  }
});

window.addEventListener("load", () => {
  openModal();
});

// Initialize the game
init();
