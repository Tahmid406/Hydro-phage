function setup() {
  frameRate(60);

  createCanvas(windowWidth, windowHeight);
  arenaWidth = 3600;
  arenaHeight = 1800;
  offset = { x: arenaWidth / 2, y: arenaHeight / 2 };

  //===== Generate Grid =====
  totalCols = Math.ceil(arenaWidth / colSize);
  totalRows = Math.ceil(arenaHeight / rowSize);

  for (let row = 0; row < totalRows; row++) {
    let gridRow = [];
    for (let col = 0; col < totalCols; col++) {
      gridRow.push(new GridCell(row, col));
    }
    gridMap.push(gridRow);
  }

  //===== Generate World Objects =====
  spawnWaterPools();
  spawnPlantsLoop();

  //===== Generate Agents =====
  for (let i = 0; i < totalAgents; i++) {
    const agent = new Agent(
      createVector(random(arenaWidth), random(arenaHeight))
    );
    agent.food = 100;
    agent.water = 100;
    agents.push(agent);
  }

  startPopulationStatsTracker();
}

function draw() {
  background(30);
  currentMillis = millis();

  handleArrowKeyPanning();

  // Center and apply zoom + offset
  translate(width / 2, height / 2);
  scale(zoom);
  translate(-offset.x, -offset.y);

  if (currentlySelectedAgent) {
    zoom = lerp(zoom, 1, 0.025);
    offset.x = lerp(offset.x, currentlySelectedAgent.pos.x, 0.025);
    offset.y = lerp(offset.y, currentlySelectedAgent.pos.y, 0.025);
  }
  // Draw arena
  drawHexBorder();

  waterPools.forEach((waterPool) => waterPool.draw());

  updatePlantSystem();
  updateAllAgents();
}
