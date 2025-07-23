// Hexagonal tech border
function drawHexBorder() {
  let hexSize = 30;
  let time = currentMillis * 0.001;

  noFill();

  // for (let x = -hexSize; x <= arenaWidth + hexSize; x += hexSize * 1.5) {
  //   for (let y = -hexSize; y <= arenaHeight + hexSize; y += hexSize * 1.5) {
  //     // Only draw if the center of hex is outside the arena
  //     if (x < 0 || x > arenaWidth || y < 0 || y > arenaHeight) {
  //       let alpha = map(sin(time + x * 0.01 + y * 0.01), -1, 1, 50, 200);
  //       stroke(100, 100, 100, alpha);
  //       drawHexagon(x + 8, y + 8, hexSize * 0.8);
  //     }
  //   }
  // }

  // Main border
  stroke(100, 100, 100, 10);
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
