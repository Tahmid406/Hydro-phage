function mousePressed() {
  if (mouseButton === LEFT) {
    isDragging = true;
    lastMouse.x = mouseX;
    lastMouse.y = mouseY;
    clickStart.x = mouseX;
    clickStart.y = mouseY;
  }

  // Temporarily disable culling to prevent flickering
  // for (let row = 0; row < totalRows; row++) {
  //   for (let col = 0; col < totalCols; col++) {
  //     gridMap[row][col].isInView = true;
  //   }
  // }
}

function mouseDragged() {
  if (isDragging) {
    let dx = (mouseX - lastMouse.x) / zoom;
    let dy = (mouseY - lastMouse.y) / zoom;
    offset.x -= dx;
    offset.y -= dy;

    lastMouse.x = mouseX;
    lastMouse.y = mouseY;
  }
}

function mouseReleased() {
  if (mouseButton === LEFT) {
    let distMoved = dist(mouseX, mouseY, clickStart.x, clickStart.y);
    if (distMoved < clickThreshold) trySelectEntity(mouseX, mouseY);
    else updateGridVisibility();
    isDragging = false;
  }
}

// Mouse wheel zoom
function mouseWheel(event) {
  let sensitivity = 0.001;
  let zoomAmount = 1 - event.delta * sensitivity;

  let beforeZoom = screenToWorld(mouseX, mouseY);
  zoom *= zoomAmount;
  zoom = constrain(zoom, 0.1, 5);
  let afterZoom = screenToWorld(mouseX, mouseY);

  offset.x += beforeZoom.x - afterZoom.x;
  offset.y += beforeZoom.y - afterZoom.y;

  updateGridVisibility(); // recalculate visibility after zoom

  return false;
}

// Convert screen (mouse) coordinates to world coordinates
function screenToWorld(x, y) {
  let wx = (x - width / 2) / zoom + offset.x;
  let wy = (y - height / 2) / zoom + offset.y;
  return createVector(wx, wy);
}

// ===== DEBUG =====
function trySelectEntity() {
  // Step 0: Clear previous selections
  if (currentlySelectedAgent) currentlySelectedAgent.debug = false;
  if (currentlySelectedPlant) currentlySelectedPlant.debug = false;

  currentlySelectedAgent = null;
  currentlySelectedPlant = null;

  // Step 1: Convert screen coords to world coords
  const worldX = (mouseX - width / 2) / zoom + offset.x;
  const worldY = (mouseY - height / 2) / zoom + offset.y;
  const cursor = createVector(worldX, worldY);

  // Step 2: Find nearby agents + plants from surrounding grids
  const { row, col } = getGridCoordsFromPos(cursor);
  const scanRadius = 1;
  let nearbyObjects = [];

  for (let dr = -scanRadius; dr <= scanRadius; dr++) {
    for (let dc = -scanRadius; dc <= scanRadius; dc++) {
      const neighbor = getGridCell(row + dr, col + dc);
      if (neighbor) {
        if (neighbor.agents) nearbyObjects.push(...neighbor.agents);
        if (neighbor.plants) nearbyObjects.push(...neighbor.plants);
      }
    }
  }

  // Step 3: Find the closest object (agent or plant)
  let closestObject = null;
  let closestObjectDist = Infinity;
  for (let object of nearbyObjects) {
    const d = p5.Vector.dist(cursor, object.pos);
    if (d < closestObjectDist) {
      closestObjectDist = d;
      closestObject = object;
    }
  }

  // Step 4: Select it if within 100px
  const scaledThreshold = 20 / zoom; // smaller threshold at high zoom
  if (closestObject && closestObjectDist <= scaledThreshold) {
    closestObject.debug = true;
    if (closestObject instanceof Agent) {
      currentlySelectedAgent = closestObject;
      // console.log("Selected Agent:", closestObject);
    } else if (closestObject instanceof Plant) {
      currentlySelectedPlant = closestObject;
      // console.log("Selected plant:", closestObject);
    }
  }

  if (currentlySelectedAgent || currentlySelectedPlant) {
    for (let row = 0; row < totalRows; row++) {
      for (let col = 0; col < totalCols; col++) {
        gridMap[row][col].isInView = true;
      }
    }
  }

  togglePanel(); // Optional UI update
}
