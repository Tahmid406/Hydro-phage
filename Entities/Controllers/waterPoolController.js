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
