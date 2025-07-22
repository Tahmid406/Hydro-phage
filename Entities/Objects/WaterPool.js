class WaterPool {
  constructor(position) {
    this.pos = position.copy();
    this.size = 25;
    this.time = 0; // For animation
    this.ripples = []; // For ripple effects
    this.shimmerOffset = random(1000); // Random shimmer starting point

    const { row, col } = getGridCoordsFromPos(this.pos);
    this.currentGrid = getGridCell(row, col);
    this.currentGrid.waterPools.push(this);
  }

  // Method 2: Layered water with shimmer effects
  drawLayered() {
    push();
    translate(this.pos.x, this.pos.y);

    // Base water layer
    fill(30, 100, 150, 80);
    noStroke();
    ellipse(0, 0, this.size * 2.5);

    // Main water body
    fill(52, 152, 219, 120);
    ellipse(0, 0, this.size * 2);

    // Lighter center
    fill(100, 200, 255, 100);
    ellipse(0, 0, this.size * 1.2);

    // Shimmer effect
    for (let i = 0; i < 3; i++) {
      let shimmerX =
        cos(this.time * 0.02 + i * 2 + this.shimmerOffset) * this.size * 0.3;
      let shimmerY =
        sin(this.time * 0.03 + i * 1.5 + this.shimmerOffset) * this.size * 0.3;
      fill(200, 230, 255, 60);
      ellipse(shimmerX, shimmerY, 8, 4);
    }

    pop();
    this.time += 1;
  }

  // Method 3: Animated ripples
  drawWithRipples() {
    push();
    translate(this.pos.x, this.pos.y);

    // Main water body
    fill(52, 152, 219, 180);
    noStroke();
    ellipse(0, 0, this.size * 2);

    // Darker edge
    stroke(30, 100, 150, 100);
    strokeWeight(2);
    noFill();
    ellipse(0, 0, this.size * 2);

    // Animated ripples
    for (let i = 0; i < this.ripples.length; i++) {
      let ripple = this.ripples[i];
      stroke(200, 230, 255, ripple.alpha);
      strokeWeight(1);
      noFill();
      ellipse(0, 0, ripple.size);

      ripple.size += 2;
      ripple.alpha -= 3;

      if (ripple.alpha <= 0) {
        this.ripples.splice(i, 1);
        i--;
      }
    }

    // Randomly add new ripples
    if (random() < 0.0002) {
      // Generate a position within 60px of this.pos in both x and y
      let offset;
      const halfArea = 60; // half of 120
      const minClear = this.size / 2;

      do {
        offset = createVector(
          random(-halfArea, halfArea),
          random(-halfArea, halfArea)
        );
      } while (abs(offset.x) < minClear && abs(offset.y) < minClear);

      const plantPos = p5.Vector.add(this.pos, offset);
      const plant = new Plant(plantPos);
      plants.push(plant);
      this.ripples.push({
        size: this.size * 0.5,
        alpha: 100,
      });
    }

    pop();
  }

  draw() {
    this.drawLayered(); // Layered with shimmer (default)
    this.drawWithRipples(); // Animated ripples
  }
}
