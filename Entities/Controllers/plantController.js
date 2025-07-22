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
