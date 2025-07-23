//===== Simlation Arena Settings =====
let zoom = 0.5;
let offset = { x: 0, y: 0 };

let arenaWidth, arenaHeight;
let currentMillis = 0;

let arrowKeys = { left: false, right: false, up: false, down: false };
let arrowPanSpeed = 3; // speed per frame (can adjust)
let movedSinceLastUpdate = 0;

//===== Click Settings =====
let isDragging = false;
let clickStart = { x: 0, y: 0 };
let lastMouse = { x: 0, y: 0 };

let clickThreshold = 10;

//===== Entity Settings =====
const totalAgents = 16;
const agentCleanupInterval = 5000;

let agents = [];
let lastAgentCleanupTime = 0;

let femaleLookingForPartner = [];

//===== World Item Settings =====
const maxPlants = 240;
const plantCleanupInterval = 3000;
const plantSize = { ub: 10, lb: 5 };
const plantSpawnRate = 12;
let lastPlantCleanupTime = 0;
let plants = [];

const maxWaterPools = 8;
let waterPools = [];

//===== Grid Settings =====
const colSize = 40;
const rowSize = 40;

let totalCols;
let totalRows;

let gridMap = [];

//===== DEBUG =====
let currentlySelectedAgent = null;
let currentlySelectedPlant = null;

//===== stats =====
let num_agents = [];
let num_plants = [];
