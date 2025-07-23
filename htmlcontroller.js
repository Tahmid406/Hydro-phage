function togglePanel() {
  const panel = document.getElementsByClassName("sidepanel")[0];
  panel.style.right = currentlySelectedAgent ? "0px" : "-20vw";

  const header = document.getElementById("SelectedEntity");
  header.innerText = "Agent";

  if (currentlySelectedAgent) updateAgentPanel(currentlySelectedAgent);
}

function updateAgentPanel(agent) {
  document.getElementById("SelectedEntity").innerText = "Agent";

  // --- Hunger ---
  const hunger = Math.round(agent.food);
  const hungerBar = document.getElementById("hungerBar");
  hungerBar.style.width = hunger + "%";
  hungerBar.querySelector(".bar-text").innerText = hunger + "%";
  hungerBar.style.backgroundColor =
    hunger < 20 ? "#ff4444" : hunger < 50 ? "#ffaa44" : "#44aa44";

  // --- Thirst ---
  const thirst = Math.round(agent.water);
  const thirstBar = document.getElementById("thirstBar");
  thirstBar.style.width = thirst + "%";
  thirstBar.querySelector(".bar-text").innerText = thirst + "%";
  thirstBar.style.backgroundColor =
    thirst < 20 ? "#ff4444" : thirst < 50 ? "#ffaa44" : "#4488ff";

  // --- Age & Life Stage ---
  document.getElementById("age").innerText = `${agent.age} months`;
  const lifeStage = document.getElementById("life-stage");
  if (agent.age < agent.minReproductiveAge) {
    lifeStage.innerText = "Juvenile";
    lifeStage.style.color = "#88ccff";
  } else if (agent.age < agent.maxAge * 0.8) {
    lifeStage.innerText = agent.isMale ? "Adult Male" : "Adult Female";
    lifeStage.style.color = agent.isMale ? "#4488ff" : "#ff88cc";
  } else {
    lifeStage.innerText = "Elder";
    lifeStage.style.color = "#cccccc";
  }

  // --- Activity ---
  const activity = document.getElementById("activity-status");
  if (agent.mating && agent.partner) activity.innerText = "Mating";
  else if (agent.eating) activity.innerText = "Eating";
  else if (agent.drinking) activity.innerText = "Drinking";
  else if (agent.target instanceof Agent) activity.innerText = "Seeking Mate";
  else if (agent.target?.constructor?.name === "WaterPool")
    activity.innerText = "Seeking Water";
  else if (agent.target?.constructor?.name === "FoodPellet")
    activity.innerText = "Seeking Food";
  else activity.innerText = "Wandering";

  // --- Reproductive Status ---
  const repro = document.getElementById("reproductive-status");
  if (agent.age < agent.minReproductiveAge) {
    repro.innerText = `Matures in ${
      agent.minReproductiveAge - agent.age
    } months`;
  } else if (agent.readyToMate) {
    repro.innerText = "Ready to Mate";
  } else if (agent.age < agent.nextReproductionAge) {
    repro.innerText = "In Cooldown";
  } else {
    repro.innerText = "Not Fertile";
  }

  // --- Death Warning ---
  const warning = document.getElementById("deathWarning");
  if (agent.deathTimerStart || agent.oldAgeDeathStarted) {
    warning.style.display = "block";
    const timeLeft = Math.round(agent.timeBeforeDeath / 1000);
    document.getElementById("deathTimer").innerText = `${timeLeft}s`;

    if (timeLeft < 3) warning.style.backgroundColor = "#ff0000";
    else if (timeLeft < 10) warning.style.backgroundColor = "#ff4444";
    else warning.style.backgroundColor = "#ff8844";
  } else {
    warning.style.display = "none";
  }

  // --- Health ---
  const health = Math.round((agent.food + agent.water) / 2);
  const healthText = document.getElementById("health-indicator");
  healthText.innerText = `Health: ${health}%`;
  if (health < 20) healthText.style.color = "#ff4444";
  else if (health < 50) healthText.style.color = "#ffaa44";
  else if (health < 80) healthText.style.color = "#ffff44";
  else healthText.style.color = "#44ff44";
}
