class Agent {
  constructor(position) {
    this.pos = position.copy();
    this.vel = createVector(random(-5, 5), random(-5, 5));
    this.size = 15;
    this.acceleration = 0.01;
    this.maxSpeed = 3;
    this.heading = 0;
    this.food = 20;
    this.water = 20;

    this.isMale = random() < 0.5;
    this.partner = null;
    this.readyToMate = false;
    this.mating = false;
    this.matingTimeout = 2000;
    this.matingStartTime = null;

    this.age = 0;
    this.minReproductiveAge = Math.floor(random(16, 25));
    this.reproductionCooldown = Math.floor(random(5, 16));
    this.nextReproductionAge = this.age + this.reproductionCooldown;

    this.maxAge = Math.floor(random(48, 60));
    this.oldAgeDeathStarted = false;

    this.alive = true;
    this.deathTimerStart = null;
    this.deathTimeout = 10000;
    this.timeBeforeDeath = null;

    const { row, col } = getGridCoordsFromPos(this.pos);
    this.currentGrid = getGridCell(row, col);
    this.proximityRadius = 4;
    this.scanGrids = [];
    this.proximity = {
      food: [],
      water: [],
      danger: [],
    };

    this.target = null;
    this.eating = null;
    this.drinking = null;
    this.waterMemo = null;

    this.debug = false;
  }

  lookForDanger() {
    let dangers = [];
    for (let grid of this.scanGrids) dangers.push(...grid.dangers);
    return dangers;
  }

  updateProximity() {
    //while Eating, only look for danger
    this.scanGrids = [];
    const scanRadius = this.proximityRadius;
    this.proximity.food = [];
    this.proximity.danger = [];
    for (let dr = -scanRadius; dr <= scanRadius; dr++) {
      for (let dc = -scanRadius; dc <= scanRadius; dc++) {
        if (dr * dr + dc * dc <= scanRadius * scanRadius) {
          const neighbor = getGridCell(
            this.currentGrid.rowId + dr,
            this.currentGrid.colId + dc
          );
          if (!neighbor) continue;
          this.scanGrids.push(neighbor);

          //Look For Danger
          if (neighbor.dangers.length > 0)
            this.proximity.danger.push(...neighbor.dangers);

          //Look For Food
          if (neighbor.plants.length > 0)
            this.proximity.food.push(...neighbor.plants);

          //Look For Water
          if (neighbor.waterPools.length > 0)
            this.waterMemo = neighbor.waterPools[0];
        }
      }
    }
  }

  moveTowards(target) {
    if (!target) return;
    let dir = p5.Vector.sub(target.pos, this.pos);
    let distance = dir.mag();

    if (distance <= target.size * 2) {
      this.vel.mult(0);
      this.heading = dir.heading();

      // Select appropriate action
      if (target instanceof WaterPool)
        this.drinking = true; // flag to distinguish
      else if (target instanceof Plant) this.eating = target;
      else {
        this.matingStartTime = currentMillis;
        this.mating = true;
        this.target.matingStartTime = currentMillis;
        this.target.mating = true;
      }
    } else {
      dir.normalize();
      let speedFactor = constrain(
        map(distance, 250, target.size, this.maxSpeed, 0),
        0.15,
        this.maxSpeed
      );

      let desiredVel = dir.mult(speedFactor);
      this.vel = p5.Vector.lerp(this.vel, desiredVel, this.acceleration * 10);
    }
  }

  mate() {
    if (
      currentMillis - this.matingStartTime >= this.matingTimeout &&
      this.mating
    ) {
      this.mating = false;
      this.partner.mating = false;
      this.readyToMate = false;
      this.partner.readyToMate = false;
      this.target = null;
      this.partner.target = null;
      this.vel.add(p5.Vector.random2D().setMag(1));
      this.partner.vel.add(p5.Vector.random2D().setMag(1));
    }
  }

  reproduce() {
    // 1. Courtship / Mating Animation Trigger
    this.mate();
    // 2. At the end of mating, this.mating will be turned false in this.mate() and new agents will be born
    if (!this.mating) {
      this.partner.food -= 10;
      this.partner.water -= 15;
      for (let i = 0; i < Math.floor(random() * 3 + 1); i++) {
        const agent = new Agent(
          createVector(this.partner.pos.x, this.partner.pos.y)
        );
        agent.waterMemo = this.partner.waterMemo;
        agents.push(agent);
      }

      // Schedule next reproduction
      this.reproductionCooldown = Math.floor(Math.random() * 6 + 5);
      this.nextReproductionAge = this.age + this.reproductionCooldown;
      this.partner.reproductionCooldown = Math.floor(Math.random() * 6 + 5);
      this.partner.nextReproductionAge =
        this.age + this.partner.reproductionCooldown;
    }
  }

  eatPlant() {
    this.food += 0.25;
    this.eating.deplete();
    // When done eating
    if (this.eating.nutrition <= 0 || this.food >= 100) {
      this.target = null;
      this.eating = null;
      const minSpeed = 2;
      this.vel = p5.Vector.fromAngle(this.heading).mult(minSpeed);
    }
  }
  drinkWater() {
    this.water += 0.25;
    // When done eating
    if (this.water >= 100) {
      this.target = null;
      this.drinking = null;
      const minSpeed = 3;
      this.vel = p5.Vector.fromAngle(this.heading).mult(minSpeed);
    }
  }

  die() {
    this.alive = false;

    // Remove from current grid
    const idxGrid = this.currentGrid.agents.indexOf(this);
    if (idxGrid !== -1) this.currentGrid.agents.splice(idxGrid, 1);

    // Remove from global agent array
    const idxWorld = agents.indexOf(this);
    if (idxWorld !== -1) agents.splice(idxWorld, 1);

    if (this.partner) {
      this.partner.partner = null;
      this.partner = null;
    }

    if (this.debug) currentlySelectedAgent = null;
    togglePanel();
  }

  update() {
    if (this.mating) {
      this.reproduce();
      return;
    }

    // Start/Stop Death Sequence
    if (this.deathTimerStart || this.oldAgeDeathStarted) {
      const elapsed = currentMillis - this.deathTimerStart;
      this.timeBeforeDeath = this.deathTimeout - elapsed;
      if (this.timeBeforeDeath <= 0) this.die();
    }

    if ((this.food <= 0 || this.water <= 0) && !this.deathTimerStart)
      this.deathTimerStart = currentMillis;
    else if (this.deathTimerStart && this.food > 0 && this.water > 0)
      this.deathTimerStart = null;

    // Eat or Drink
    if (this.eating) {
      this.eatPlant();
      return;
    } else if (this.drinking) {
      this.drinkWater();
      return;
    }

    if (this.partner && this.readyToMate && this.partner.readyToMate) {
      if (this.target) this.moveTowards(this.target);
      else this.target = this.partner;
    }
    // If thirsty, drink
    else if (
      this.water < 25 &&
      this.waterMemo
      // this.food > 5
      // this.proximity.danger.length === 0
    ) {
      if (this.target) this.moveTowards(this.target);
      else this.target = this.waterMemo;
    }
    // Else, eat if hungry and safe
    else if (
      this.food < 50 &&
      this.proximity.food.length > 0
      // this.water > 5
      // this.proximity.danger.length === 0
    ) {
      if (this.target && this.target.nutrition > 0)
        this.moveTowards(this.target);
      else this.target = this.proximity.food[0];
    }

    this.pos.add(this.vel);
    if (this.vel.mag() > 0.01) this.heading = this.vel.heading();

    //Grid Proximity update
    const { row, col } = getGridCoordsFromPos(this.pos);
    const previousGrid = this.currentGrid;
    this.currentGrid = getGridCell(row, col);
    if (previousGrid != this.currentGrid) {
      // Grid re-assignment
      const idx = previousGrid.agents.indexOf(this);
      if (idx !== -1) previousGrid.agents.splice(idx, 1);
      this.updateProximity();
      this.currentGrid.agents.push(this);
    }
    // this.proximity.danger = this.lookForDanger(); //async look for danger

    // Gradually increase hunger
    this.food -= 0.02;
    this.water -= 0.03;

    // Arena boundary checks
    if (this.pos.x > arenaWidth && this.vel.x > 0) this.vel.x *= -1;
    if (this.pos.x < 0 && this.vel.x < 0) this.vel.x *= -1;
    if (this.pos.y > arenaHeight && this.vel.y > 0) this.vel.y *= -1;
    if (this.pos.y < 0 && this.vel.y < 0) this.vel.y *= -1;
  }

  refreshTarget() {
    if (this.debug) updateAgentPanel(this);
    if (this.target && this.target.nutrition < 0.1) this.target = null;
    else if (this.target instanceof Agent && !this.target.alive)
      this.target = null;
    if (this.partner && !this.partner.alive) this.partner = null;
    if ((!this.target || this.target.nutrition < 0.1) && this.vel.mag() < 1)
      this.vel.setMag(1);
  }

  drawBasicCharacter() {
    // Calculate dynamic properties for appearance
    const healthRatio = (this.food + this.water) / 100;
    const ageRatio = this.age / this.maxAge;
    const reproductiveAge =
      this.age >= this.minReproductiveAge && this.age <= this.maxAge * 0.8;

    // Dynamic colors based on agent state
    let bodyHue = map(healthRatio, 0, 1, 0, 120); // Red to green based on health
    let bodySat = map(ageRatio, 0, 1, 80, 40); // Less saturated as agent ages
    let bodyBright = map(healthRatio, 0, 1, 40, 90); // Brighter when healthy

    // Reproductive glow
    if (reproductiveAge && this.age >= this.nextReproductionAge)
      bodyBright = min(100, bodyBright + 15);

    // Dynamic size based on health and age
    let dynamicSize =
      this.size * (0.8 + healthRatio * 0.2) * (1 - ageRatio * 0.1);

    // Animation adjustments for feeding states
    let bodyPulse = 1;
    let mouthScale = 1;

    if (this.eating || this.drinking) {
      const time = currentMillis * 0.01;
      if (this.eating) {
        const eatCycle = sin(time * 8) * 0.5 + 0.5;
        mouthScale = 0.5 + eatCycle * 0.8;
        bodyPulse = 1 + sin(time * 6) * 0.05;
        bodyBright = min(100, bodyBright + 5);
      }
      if (this.drinking) {
        const drinkCycle = sin(time * 6) * 0.5 + 0.5;
        mouthScale = 0.7 + drinkCycle * 0.6;
        bodyPulse = 1 + sin(time * 4) * 0.03;
        bodySat = min(100, bodySat + 10);
      }
    }

    dynamicSize *= bodyPulse;

    // Draw the agent
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.heading);

    colorMode(HSB, 360, 100, 100);

    // Main body - teardrop shape
    fill(bodyHue, bodySat, bodyBright);
    noStroke();
    beginShape();
    vertex(dynamicSize * 0.8, 0);
    vertex(-dynamicSize * 0.3, dynamicSize * 0.4);
    vertex(-dynamicSize * 0.5, 0);
    vertex(-dynamicSize * 0.3, -dynamicSize * 0.4);
    endShape(CLOSE);

    // Eye
    fill(0, 0, 100);
    ellipse(dynamicSize * 0.2, 0, dynamicSize * 0.2);

    // Pupil
    fill(0, 0, 0);
    ellipse(dynamicSize * 0.25, 0, dynamicSize * 0.1);

    // Animated mouth/beak (only visible when feeding)
    if (this.eating || this.drinking) {
      colorMode(RGB, 255);
      fill(50, 50, 50);
      ellipse(
        dynamicSize * 0.6,
        0,
        dynamicSize * 0.15 * mouthScale,
        dynamicSize * 0.1 * mouthScale
      );
      colorMode(HSB, 360, 100, 100);
    }

    // Tail
    fill(bodyHue, bodySat, bodyBright * 0.8);
    triangle(
      -dynamicSize * 0.3,
      -dynamicSize * 0.2,
      -dynamicSize * 0.3,
      dynamicSize * 0.2,
      -dynamicSize * 0.6,
      0
    );

    colorMode(RGB, 255);
    pop();
  }

  // Feeding animation effects (eating/drinking)
  drawFeedingAnimation() {
    const healthRatio = (this.food + this.water) / 100;
    const ageRatio = this.age / this.maxAge;
    const dynamicSize =
      this.size * (0.85 + healthRatio * 0.15) * (1 - ageRatio * 0.05);

    let baseColor = [255, 255, 255];
    let glowColor = "rgba(255, 255, 255, 0.8)";
    let strokeCol = color(255, 255, 255, 30);

    if (this.eating) {
      baseColor = [120, 255, 120];
      glowColor = "rgba(120, 255, 120, 0.8)";
      strokeCol = color(120, 255, 120, 40);
    }

    if (this.drinking) {
      baseColor = [120, 180, 255];
      glowColor = "rgba(120, 180, 255, 0.8)";
      strokeCol = color(120, 180, 255, 40);
    }

    // Subtle glow ring
    push();
    drawingContext.shadowBlur = 4;
    drawingContext.shadowColor = glowColor;

    noFill();
    stroke(strokeCol);
    ellipse(this.pos.x, this.pos.y, dynamicSize * 2);

    drawingContext.shadowBlur = 0;
    pop();
  }

  drawMatingAnimation() {
    if (!this.partner || !this.matingStartTime) return;

    const matingProgress =
      (currentMillis - this.matingStartTime) / this.matingTimeout;
    const time = currentMillis * 0.01;

    push();
    translate(this.pos.x, this.pos.y);

    const distance = dist(
      this.pos.x,
      this.pos.y,
      this.partner.pos.x,
      this.partner.pos.y
    );

    // === Phase 1: Aura Pulse ===
    if (matingProgress < 0.4) {
      const pulseSize = this.size * (1.5 + sin(time) * 0.3);
      fill(this.isMale ? color(280, 60, 100, 40) : color(340, 60, 100, 40));
      noStroke();
      ellipse(0, 0, pulseSize);
    }

    // === Phase 2: Heart Between Partners ===
    else if (matingProgress < 0.8 && distance < this.size * 4) {
      stroke(255, 100, 150, 120);
      strokeWeight(2);
      line(
        0,
        0,
        this.partner.pos.x - this.pos.x,
        this.partner.pos.y - this.pos.y
      );

      // Simple floating heart
      const heartOffset = sin(time) * 10;
      const heartX = (this.partner.pos.x - this.pos.x) / 2;
      const heartY = (this.partner.pos.y - this.pos.y) / 2 + heartOffset;

      fill(255, 100, 150, 180);
      noStroke();
      ellipse(heartX - 3, heartY, 6, 6);
      ellipse(heartX + 3, heartY, 6, 6);
      triangle(heartX - 6, heartY, heartX + 6, heartY, heartX, heartY + 8);
    }

    pop();
  }

  drawDebugInfo() {
    // Show current grid
    // if (this.currentGrid) {
    //   this.currentGrid.showGrid();
    // }

    // // Show scan grids
    // for (let grid of this.scanGrids) {
    //   if (grid && grid.showGrid) {
    //     grid.showGrid();
    //   }
    // }

    // Show target line
    if (this.target) {
      const tipX = this.pos.x + cos(this.heading) * this.size;
      const tipY = this.pos.y + sin(this.heading) * this.size;

      push();
      if (this.target instanceof Plant)
        stroke(0, 255, 0, 100); // Green line to food
      else stroke(52, 152, 219, 100); // Blue line to water

      line(tipX, tipY, this.target.pos.x, this.target.pos.y);
      pop();
    }

    // Show agent stats as text
    push();
    fill(255);
    textSize(10);
    const statsX = this.pos.x + this.size + 5;
    const statsY = this.pos.y - 20;

    text(
      `F:${Math.floor(this.food)} W:${Math.floor(this.water)}`,
      statsX,
      statsY
    );
    text(`Age:${this.age}/${this.maxAge}`, statsX, statsY + 12);
    text(`Speed:${this.vel.mag().toFixed(1)}`, statsX, statsY + 24);
    pop();

    //Show memoized water location
    push();
    if (this.waterMemo) {
      stroke(100, 200, 255, 20);
      line(this.pos.x, this.pos.y, this.waterMemo.pos.x, this.waterMemo.pos.y);
    }

    //Show partner
    if (this.partner) {
      stroke(255, 0, 0, 20);
      line(this.pos.x, this.pos.y, this.partner.pos.x, this.partner.pos.y);
    }

    // Show proximity radius
    noFill();
    stroke(255, 255, 0, 50);
    ellipse(this.pos.x, this.pos.y, this.proximityRadius * 2);

    // Show velocity vector
    stroke(255, 0, 255, 150);
    const velMag = this.vel.mag() * 10; // Scale for visibility
    line(
      this.pos.x,
      this.pos.y,
      this.pos.x + this.vel.x * 10,
      this.pos.y + this.vel.y * 10
    );
    pop();
  }

  draw() {
    // Draw basic character
    this.drawBasicCharacter();
    // if (this.partner) {
    //   stroke(255, 0, 0);
    //   line(this.pos.x, this.pos.y, this.partner.pos.x, this.partner.pos.y);
    // }

    if (this.mating) this.drawMatingAnimation();

    // Draw eating/drinking animations if active
    if (this.eating || this.drinking) this.drawFeedingAnimation();

    // Draw debug info if enabled
    if (this.debug) this.drawDebugInfo();
  }
}
