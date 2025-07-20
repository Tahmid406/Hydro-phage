function togglePanel() {
  const panel = document.getElementsByClassName("sidepanel")[0];
  panel.style.right = currentlySelectedAgent ? "0px" : "-20vw";

  const header = document.getElementById("SelectedEntity");
  header.innerText = "Agent";
}

const activity = (agent) => {
  const thirsty = agent.water < 50;
  const hungry = agent.food < 75;

  const isAtWater = agent.target instanceof WaterPool;
  const isAtFood = agent.target instanceof Plant;

  // Actively drinking
  if (agent.drinking) return "Drinking Water";
  // Going to water
  if (thirsty && isAtWater) return "Moving to Water Pool";

  // Actively eating
  if (agent.eating) return "Eating Plant";
  // Going to food
  if (hungry && isAtFood) return "Moving to Food Source";

  // Searching for resources
  if (thirsty && hungry) return "Searching for Water and Food Source";
  if (thirsty) return "Searching for Water Source";
  if (hungry) return "Searching for Food Source";

  return "Wandering";
};

function updateAgentPanel(agent) {
  // Entity title
  document.getElementById("SelectedEntity").innerText = "Agent";

  // Activity status
  const eating = document.getElementById("eating-status");
  eating.innerText = activity(agent);

  // Age
  document.getElementById("age").innerText = agent.age + " months";

  // Hunger
  const hungerPercent = Math.round(agent.food);
  const hungerBar = document.getElementById("hungerBar");
  hungerBar.style.width = hungerPercent + "%";
  hungerBar.querySelector(".bar-text").innerText = hungerPercent + "%";

  // Thirst
  const thirstPercent = Math.round(agent.water);
  const thirstBar = document.getElementById("thirstBar");
  thirstBar.style.width = thirstPercent + "%";
  thirstBar.querySelector(".bar-text").innerText = thirstPercent + "%";

  // Target status
  const target = document.getElementById("target-status");
  target.style.color = agent.target ? "#00ff88" : "#ff8844";
  if (agent.target) target.innerText = agent.target.constructor.name;
  else target.innerText = "None";

  // Speed
  document.getElementById("speed").innerText =
    agent.vel.mag().toFixed(2) + " km/h";

  // Warning
  const warningContainer = document.getElementById("deathWarning");
  warningContainer.style.display = "None";
  if (agent.deathTimerStart || agent.oldAgeDeathStarted) {
    warningContainer.style.display = "block";
    document.getElementById("deathTimer").innerText = `${Math.round(
      agent.timeBeforeDeath / 1000
    )} s`;
  }
}
