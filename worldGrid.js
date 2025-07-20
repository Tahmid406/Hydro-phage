class GridCell {
  constructor(rowId, colId) {
    this.rowId = rowId;
    this.colId = colId;
    this.isInView = true;

    this.heightBounds = {
      ub: rowId * rowSize,
      lb: min((rowId + 1) * rowSize, arenaHeight),
    };

    this.widthBounds = {
      ub: colId * colSize,
      lb: min((colId + 1) * colSize, arenaWidth),
    };

    this.agents = [];
    this.plants = [];
    this.waterPools = [];
    this.dangers = [];
  }

  getCenterPosition() {
    const centerX = (this.widthBounds.ub + this.widthBounds.lb) / 2;
    const centerY = (this.heightBounds.ub + this.heightBounds.lb) / 2;
    return createVector(centerX, centerY);
  }

  showGrid() {
    noFill();
    stroke(50); // You can keep it here or set outside once
    strokeWeight(1);

    let x = this.widthBounds.ub;
    let y = this.heightBounds.ub;
    let w = this.widthBounds.lb - this.widthBounds.ub;
    let h = this.heightBounds.lb - this.heightBounds.ub;

    rect(x, y, w, h);
  }
}

for (let row = 0; row < totalRows; row++) {
  let gridRow = [];
  for (let col = 0; col < totalCols; col++) {
    gridRow.push(new GridCell(row, col));
    console.log(row, col);
  }
  grid.push(gridRow);
}
