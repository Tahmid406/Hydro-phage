function getGridCoordsFromPos(pos) {
  const clampedX = constrain(pos.x, 0, arenaWidth - 1);
  const clampedY = constrain(pos.y, 0, arenaHeight - 1);

  const col = floor(clampedX / colSize);
  const row = floor(clampedY / rowSize);

  return { row, col };
}

function getGridCell(row, col) {
  if (row >= 0 && row < totalRows && col >= 0 && col < totalCols)
    return gridMap[row][col];
  return null;
}

function updateGridVisibility() {
  for (let row = 0; row < totalRows; row++) {
    for (let col = 0; col < totalCols; col++) {
      const grid = gridMap[row][col];
      const center = grid.getCenterPosition();

      const screenX = (center.x - offset.x) * zoom + width / 2;
      const screenY = (center.y - offset.y) * zoom + height / 2;

      const buffer = 50 * zoom;
      grid.isInView =
        screenX > -buffer &&
        screenX < width + buffer &&
        screenY > -buffer &&
        screenY < height + buffer;
    }
  }
}

function spawnPlantsLoop() {
  if (plants.length < maxPlants) {
    for (let i = 0; i < plantSpawnRate; i++) {
      const pos = createVector(random(arenaWidth), random(arenaHeight));
      const { row, col } = getGridCoordsFromPos(pos);
      const grid = getGridCell(row, col);

      let spawnable = true;

      // Check surrounding grid cells for existing plants
      const checkRadius = 1;
      for (let dr = -checkRadius; dr <= checkRadius; dr++) {
        for (let dc = -checkRadius; dc <= checkRadius; dc++) {
          const neighbor = getGridCell(row + dr, col + dc);
          if (neighbor && neighbor.plants && neighbor.plants.length > 0) {
            spawnable = false;
            break;
          }
        }
        if (!spawnable) break;
      }

      if (spawnable) {
        const plant = new Plant(pos);
        plants.push(plant);
      }
    }
  }

  // Schedule the next spawn at a random interval between 3–6 seconds
  const nextDelay = random(4000, 8000);
  setTimeout(spawnPlantsLoop, nextDelay);
}

function spawnWaterPools() {
  const center = createVector(arenaWidth / 2, arenaHeight / 2);
  let attempts = 0;
  const maxAttempts = 20;

  for (let i = 0; i < maxWaterPools; i++) {
    let spawnPos = null;
    let valid = false;

    while (!valid && attempts < maxAttempts) {
      attempts++;

      // Bias towards center
      const randomPos = createVector(random(arenaWidth), random(arenaHeight));
      const bias = 0.8;
      const candidate = p5.Vector.lerp(center, randomPos, bias);

      // Get grid coordinates
      const { row, col } = getGridCoordsFromPos(candidate);

      // Check surrounding grids for existing water
      let hasNearbyWater = false;
      for (let dr = -6; dr <= 6; dr++) {
        for (let dc = -6; dc <= 6; dc++) {
          const neighbor = getGridCell(row + dr, col + dc);
          if (neighbor && neighbor.waterPools.length > 0) {
            hasNearbyWater = true;
            break;
          }
        }
        if (hasNearbyWater) break;
      }

      if (!hasNearbyWater) {
        spawnPos = candidate;
        valid = true;
      }
    }

    if (spawnPos) {
      const water = new WaterPool(spawnPos);
      waterPools.push(water);
    }
  }
}

function updatePlantSystem() {
  // Only run cleanup every 1000ms
  if (currentMillis - lastPlantCleanupTime >= plantCleanupInterval) {
    lastPlantCleanupTime = currentMillis;

    const alivePlants = [];
    for (const plant of plants) {
      if (plant.nutrition > 0) alivePlants.push(plant);
      else {
        const idx = plant.currentGrid.plants.indexOf(plant);
        if (idx !== -1) plant.currentGrid.plants.splice(idx, 1);
      }
    }
    plants = alivePlants;
  }

  // Optional: also update growth (if not already elsewhere)
  plants.forEach((plant) => {
    plant.grow();
    if (plant.currentGrid.isInView) plant.draw();
  });
}

function updateAllAgents() {
  agents.forEach((agent) => {
    agent.update();
    if (agent.currentGrid.isInView) agent.draw();
  });
  if (currentMillis - lastAgentCleanupTime > agentCleanupInterval) {
    for (let agent of agents) {
      agent.refreshTarget();
      agent.age += 1;

      // --- Reproduction Logic ---
      if (
        agent.age >= agent.minReproductiveAge &&
        agent.age >= agent.nextReproductionAge
      ) {
        agent.reproduce();

        // Schedule next reproduction
        agent.reproductionCooldown = Math.floor(Math.random() * 16 + 5); // 5 to 10
        agent.nextReproductionAge = agent.age + agent.reproductionCooldown;
      }

      // --- Old Age Death Logic ---
      if (agent.age >= agent.maxAge && !agent.oldAgeDeathStarted) {
        agent.deathTimerStart = currentMillis;
        agent.oldAgeDeathStarted = true;
      }

      if (agent.waterMemo) {
        const breakDist = 1000;
        let dx = agent.pos.x - agent.waterMemo.pos.x;
        let dy = agent.pos.y - agent.waterMemo.pos.y;

        if (dx * dx + dy * dy > breakDist * breakDist) agent.waterMemo = null;
      }
    }
    lastAgentCleanupTime = currentMillis;
  }
}

// Hexagonal tech border
function drawHexBorder() {
  let hexSize = 30;
  let time = currentMillis * 0.001;

  strokeWeight(2);
  noFill();

  for (let x = -hexSize; x <= arenaWidth + hexSize; x += hexSize * 1.5) {
    for (let y = -hexSize; y <= arenaHeight + hexSize; y += hexSize * 1.5) {
      // Only draw if the center of hex is outside the arena
      if (x < 0 || x > arenaWidth || y < 0 || y > arenaHeight) {
        let alpha = map(sin(time + x * 0.01 + y * 0.01), -1, 1, 50, 200);
        stroke(100, 100, 100, alpha);
        drawHexagon(x + 8, y + 8, hexSize * 0.8);
      }
    }
  }

  // Main border
  stroke(100, 100, 100);
  strokeWeight(4);
  rect(0, 0, arenaWidth, arenaHeight);
}

function drawHexagon(x, y, size) {
  beginShape();
  for (let i = 0; i < 6; i++) {
    let angle = (TWO_PI / 6) * i;
    let px = x + cos(angle) * size;
    let py = y + sin(angle) * size;
    vertex(px, py);
  }
  endShape(CLOSE);
}

//===== Utility Function to Record Stats =====
function startPopulationStatsTracker(intervalSeconds = 15) {
  setInterval(() => {
    num_agents.push(agents.length);
    num_plants.push(plants.length);
    updateStatsChart();
  }, intervalSeconds * 1000);
}
