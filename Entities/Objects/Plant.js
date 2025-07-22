class Plant {
  constructor(position) {
    this.pos = position.copy();
    this.sizeMatue = random(plantSize.lb, plantSize.ub);
    this.sizeInit = (this.sizeMatue - plantSize.lb) / 2;
    this.size = this.sizeInit;
    this.nutrition = map(this.sizeMatue, plantSize.lb, plantSize.ub, 25, 100);
    this.growing = true;
    this.bloomPhase = 0;

    this.debug = false;

    // Visual enhancement properties
    this.typeBerry = random() < 0.5;
    this.swayOffset = random(TWO_PI); // Random starting point for swaying
    this.leafAngles = []; // For individual leaf rotations
    this.bloomPhase = 0; // For flower blooming animation
    this.hasFlower = random() < 0.3; // 30% chance to have flowers
    this.windTime = 0; // For wind animation

    // Generate random leaf angles
    for (let i = 0; i < 6; i++) {
      this.leafAngles.push(random(TWO_PI));
    }

    const { row, col } = getGridCoordsFromPos(this.pos);
    this.currentGrid = getGridCell(row, col);
  }

  grow() {
    if (!this.growing) return;
    this.size += 0.01;
    if (this.size >= this.sizeMatue) {
      this.currentGrid.plants.push(this);
      this.growing = false;
      this.bloomPhase = 0; // Start bloom animation when mature
    }
  }

  deplete() {
    // Deplete nutrition
    this.nutrition -= 0.4;

    // Clamp to non-negative
    if (this.nutrition <= 0.01)
      this.currentGrid.plants.splice(this.currentGrid.plants.indexOf(this), 1);
    this.nutrition = max(this.nutrition, 0);

    // Update size based on remaining nutrition (inverse mapping)
    this.size = map(this.nutrition, 0, 100, 0, plantSize.ub / 1.2);
  }

  // Method 1: Layered leaves with depth
  drawLayered() {
    push();
    translate(this.pos.x, this.pos.y);

    let healthColor = map(this.nutrition, 0, 100, 0, 255);
    let swayAmount = sin(this.windTime * 0.03 + this.swayOffset) * 2;
    rotate(swayAmount * 0.1);

    // Shadow
    fill(0, 0, 0, 30);
    noStroke();
    ellipse(2, 2, this.size * 2.2);

    // Stem
    stroke(34, 139, 34);
    strokeWeight(max(1, this.size * 0.1));
    line(0, this.size * 0.3, 0, this.size * 0.8);

    // Multiple leaf layers
    for (let layer = 0; layer < 3; layer++) {
      let layerSize = this.size * (1 - layer * 0.2);
      let layerAlpha = 255 - layer * 50;

      for (let i = 0; i < 6; i++) {
        let angle = (TWO_PI / 6) * i + this.leafAngles[i] + layer * 0.3;
        let leafX = cos(angle) * layerSize * 0.7;
        let leafY = sin(angle) * layerSize * 0.7;

        push();
        translate(leafX, leafY);
        rotate(angle + PI / 2);

        // Leaf gradient
        if (this.growing) {
          fill(0, max(100, healthColor * 0.7), 0, layerAlpha);
        } else {
          fill(0, healthColor, 0, layerAlpha);
        }

        noStroke();
        ellipse(0, 0, layerSize * 0.8, layerSize * 1.2);

        // Leaf vein
        stroke(0, healthColor * 0.5, 0, layerAlpha * 0.7);
        strokeWeight(0.5);
        line(0, -layerSize * 0.4, 0, layerSize * 0.4);

        pop();
      }
    }

    // Center bud/flower (growing or bloomed)
    this.bloomPhase += 0.02;

    if (this.growing) {
      // Growing indicator: pulsing green bud
      let growPulse = sin(this.bloomPhase * 1.5) * this.size * 0.2;
      fill(100, 255, 100, 120);
      noStroke();
      ellipse(0, 0, max(3, growPulse));
    } else if (this.hasFlower) {
      // Bloomed flower
      let bloomSize = sin(this.bloomPhase) * this.size * 0.3;
      fill(255, 100, 150, 200);
      noStroke();
      ellipse(0, 0, max(2, bloomSize));
    }

    pop();
    this.windTime += 1;
  }

  // Method 3: Bushy plant with berries
  drawBush() {
    push();
    translate(this.pos.x, this.pos.y);

    let healthColor = map(this.nutrition, 0, 100, 0, 255);
    let swayAmount = sin(this.windTime * 0.03 + this.swayOffset) * 0.3; // Much gentler sway

    // Main bush body with organic shape
    fill(0, healthColor, 0, 180);
    noStroke();

    // Create bushy appearance with multiple overlapping circles
    for (let i = 0; i < 8; i++) {
      let angle = (TWO_PI / 8) * i;
      let baseOffsetX = cos(angle) * this.size * 0.6;
      let baseOffsetY = sin(angle) * this.size * 0.6;

      // Only apply very subtle sway to the entire bush, not individual leaves
      let offsetX = baseOffsetX + swayAmount;
      let offsetY = baseOffsetY;

      // Fixed leaf size to prevent jumping
      let leafSize = this.size * 0.8;

      // Leaf clusters
      if (this.growing) {
        fill(0, healthColor * 0.8, 0, 120);
      } else {
        fill(0, healthColor, 0, 160);
      }

      ellipse(offsetX, offsetY, leafSize);

      // Highlight on leaves
      fill(50, healthColor, 50, 80);
      ellipse(
        offsetX - leafSize * 0.2,
        offsetY - leafSize * 0.2,
        leafSize * 0.4
      );
    }

    // Center core
    fill(0, healthColor * 0.7, 0, 200);
    ellipse(swayAmount, 0, this.size * 0.8);

    // Growing pulse effect (center glow)
    if (this.growing) {
      this.bloomPhase += 0.02;
      let growPulse = sin(this.bloomPhase * 1.5) * this.size * 0.4;
      fill(80, 255, 80, 90);
      noStroke();
      ellipse(swayAmount, 0, max(4, growPulse));
    }

    // Berries/fruits (if mature and has flowers) - fixed positions
    if (!this.growing && this.hasFlower) {
      // Use fixed berry positions based on plant position to prevent jumping
      let berryPositions = [
        { angle: 0.5, dist: 0.5 },
        { angle: 2.1, dist: 0.4 },
        { angle: 3.8, dist: 0.6 },
        { angle: 5.2, dist: 0.45 },
      ];

      for (let i = 0; i < berryPositions.length; i++) {
        let berry = berryPositions[i];
        let berryX = cos(berry.angle) * this.size * berry.dist + swayAmount;
        let berryY = sin(berry.angle) * this.size * berry.dist;

        fill(150, 50, 50, 200);
        noStroke();
        ellipse(berryX, berryY, 4);

        // Berry highlight
        fill(200, 100, 100, 150);
        ellipse(berryX - 1, berryY - 1, 2);
      }
    }

    pop();
    this.windTime += 1;
  }

  // Main draw method
  draw() {
    // Choose your preferred plant style by uncommenting one:

    if (this.typeBerry) this.drawBush();
    else this.drawLayered();
  }
}
