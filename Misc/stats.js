// Initialize the chart
const ctx = document.getElementById("statsChart").getContext("2d");
const statsChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [], // Time labels (will be populated dynamically)
    datasets: [
      {
        label: "Agents",
        data: [],
        borderColor: "#00B3D3",
        backgroundColor: "rgba(100, 100, 100, 0.1)",
        borderWidth: 2,
        fill: false,
        tension: 0.1,
      },
      {
        label: "Plants",
        data: [],
        borderColor: "#01DC77",
        backgroundColor: "rgba(100, 100, 100, 0.1)",
        borderWidth: 2,
        fill: false,
        tension: 0.1,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "white",
          font: {
            size: 10,
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: false,
        },
        ticks: {
          color: "white",
          font: {
            size: 8,
          },
          maxTicksLimit: 6,
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        display: true,
        title: {
          display: false,
        },
        ticks: {
          color: "white",
          font: {
            size: 8,
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  },
});

// Function to update the chart with new data
function updateStatsChart() {
  if (typeof num_agents !== "undefined" && typeof num_plants !== "undefined") {
    // Create time labels based on data points (every 30 seconds)
    const labels = [];
    for (let i = 0; i < num_agents.length; i++) {
      labels.push(`${i * 15}s`);
    }

    // Update chart data
    statsChart.data.labels = labels;
    statsChart.data.datasets[0].data = [...num_agents];
    statsChart.data.datasets[1].data = [...num_plants];

    // Keep only the last 20 data points for better visibility
    if (labels.length > 20) {
      statsChart.data.labels = labels.slice(-20);
      statsChart.data.datasets[0].data = num_agents.slice(-20);
      statsChart.data.datasets[1].data = num_plants.slice(-20);
    }

    statsChart.update("none"); // Update without animation for better performance
  }
}

//===== Utility Function to Record Stats =====
function startPopulationStatsTracker(intervalSeconds = 15) {
  setInterval(() => {
    num_agents.push(agents.length);
    num_plants.push(plants.length);
    updateStatsChart();
  }, intervalSeconds * 1000);
}
