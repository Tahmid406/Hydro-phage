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
      if (!agent.partner && agent.age >= agent.minReproductiveAge) {
        if (agent.isMale && femaleLookingForPartner.length > 0) {
          agent.partner = femaleLookingForPartner[0];
          femaleLookingForPartner[0].partner = agent;
          femaleLookingForPartner.splice(0, 1);
        } else if (!femaleLookingForPartner.includes(agent))
          femaleLookingForPartner.push(agent);
      }

      if (agent.partner && agent.age >= agent.nextReproductionAge) {
        agent.readyToMate = true;

        // Schedule next reproduction
        agent.reproductionCooldown = Math.floor(Math.random() * 16 + 5); // 5 to 10
        agent.nextReproductionAge = agent.age + agent.reproductionCooldown;
      }

      // --- Old Age Death Logic ---
      if (agent.age >= agent.maxAge && !agent.oldAgeDeathStarted) {
        agent.deathTimerStart = currentMillis;
        agent.oldAgeDeathStarted = true;
        if (!agent.isMale && !agent.partner) {
          const index = femaleLookingForPartner.indexOf(agent);
          if (index !== -1) femaleLookingForPartner.splice(index, 1);
        }
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
