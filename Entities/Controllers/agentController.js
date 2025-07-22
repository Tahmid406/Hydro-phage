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
