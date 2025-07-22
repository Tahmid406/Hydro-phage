function keyPressed() {
  if (keyCode === LEFT_ARROW) arrowKeys.left = true;
  if (keyCode === RIGHT_ARROW) arrowKeys.right = true;
  if (keyCode === UP_ARROW) arrowKeys.up = true;
  if (keyCode === DOWN_ARROW) arrowKeys.down = true;
}

function keyReleased() {
  if (keyCode === LEFT_ARROW) arrowKeys.left = false;
  if (keyCode === RIGHT_ARROW) arrowKeys.right = false;
  if (keyCode === UP_ARROW) arrowKeys.up = false;
  if (keyCode === DOWN_ARROW) arrowKeys.down = false;
}

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
