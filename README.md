# Hydro-phage
# 🌱 Ecosystem Simulation

A miniature ecosystem where autonomous agents survive, adapt, and evolve in a closed environment. Watch as tiny digital creatures navigate their world, searching for food and water while making decisions that shape the next generation.

<!-- Add your basic simulation image here -->
![Ecosystem Simulation](images/simulation-basic.png)

## ✨ Features

- **Autonomous Agents**: Self-governing entities with survival instincts
- **Resource Management**: Dynamic food and water systems
- **Emergent Behavior**: Complex patterns arising from simple rules
- **Grid-Based Optimization**: Efficient spatial queries for smooth performance
- **Handcrafted Logic**: No external AI libraries - pure vector math and logic

## 🎯 How It Works

### Agents
Each agent is an autonomous creature with:
- **Position & Velocity**: Navigate through the world
- **Internal Resources**: Food and water levels that decay over time
- **Memory System**: Remember water locations for future use
- **Decision Making**: Choose between wandering, eating, drinking, or resting

<!-- Add your object identification image here -->
![Object Guide](images/object-guide.png)

### Environment
- **Plants**: Randomly distributed food sources with nutrition values
- **Water Pools**: Limited hydration sources clustered toward the center
- **Grid System**: Optimized spatial partitioning for efficient neighbor detection

### Behavior System

<!-- Add your AI flowchart here -->
![Agent AI Flowchart](images/ai-flowchart.png)

Agents follow a simple but effective decision tree:
1. **Survival Priority**: Water becomes critical below 50%
2. **Food Seeking**: Hunt for plants when food drops below 75%
3. **Memory Usage**: Return to known water sources when needed
4. **Wandering**: Explore randomly when needs are met

## 🚀 Current Development

### Active Features
- ✅ Agent survival mechanics
- ✅ Resource consumption and depletion  
- ✅ Spatial memory system
- ✅ Grid-based world optimization

### Coming Soon
- 🔄 **Reproduction System**: Agents will reproduce when resources are abundant
- 🔄 **Aging & Death**: Population cycling with natural lifespans
- 🔄 **Nesting Behavior**: Agents build nests to store resources and reproduce
- 🔄 **Evolutionary Traits**: Mutations affecting speed, sensing, and efficiency

## 🔮 Future Vision

### Planned Features
- **🦁 Predator Agents**: Aggressive hunters that prey on other agents
- **🏠 Resource Gathering**: Agents collect materials to build shelters
- **⚔️ Faction System**: Group dynamics with competition and alliances

## 🛠️ Technical Details

Built entirely from scratch using:
- Pure JavaScript/Canvas for rendering
- Custom vector mathematics
- Grid-based spatial partitioning
- Finite state machine behavior trees

No external physics engines or AI libraries - every behavior emerges from carefully crafted logic.

## 🎮 Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/ecosystem-simulation.git

# Navigate to project directory
cd ecosystem-simulation

# Open in your preferred development environment
# Launch index.html in a web browser
```

## 📊 Performance

The grid-based system enables smooth simulation of hundreds of agents by:
- Reducing computational complexity for proximity searches
- Optimizing resource detection and pathfinding
- Enabling scalable ecosystem growth

## 🤝 Contributing

Contributions are welcome! Whether it's bug fixes, new features, or performance improvements, feel free to open an issue or submit a pull request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*Watch life unfold in this digital petri dish where survival, adaptation, and evolution create endless emergent stories.*
