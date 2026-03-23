// ================= STATE =================
let usage = 0;
let tariff = Number(localStorage.getItem("tariff")) || 50;
let balance = Number(localStorage.getItem("balance")) || 5000;
let alertThreshold = Number(localStorage.getItem("alertThreshold")) || 1000;

let appliances = {
  ac: false,
  fan: false,
  light: false,
  fridge: false
};

let usageHistory = JSON.parse(localStorage.getItem("usageHistory")) || [];

// ================= NAVIGATION =================
function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}

// ================= DARK MODE =================
document.getElementById("toggleMode").onclick = () => {
  document.body.classList.toggle("light-mode");
};

// ================= APPLIANCE =================
function toggleAppliance(name) {
  appliances[name] = !appliances[name];
}

// ================= SIMULATION =================
setInterval(() => {
  let increment = 0;

  if (appliances.ac) increment += 2;
  if (appliances.fan) increment += 0.5;
  if (appliances.light) increment += 0.2;
  if (appliances.fridge) increment += 1;

  usage += increment;
  usageHistory.push(usage);

  if (usageHistory.length > 30) usageHistory.shift();

  updateUI();
  updateChart();
  runAI();

  localStorage.setItem("usageHistory", JSON.stringify(usageHistory));
}, 2000);

// ================= UI =================
function updateUI() {
  let cost = usage * tariff;

  document.getElementById("usage").innerText = usage.toFixed(2) + " kWh";
  document.getElementById("cost").innerText = "₦" + cost.toFixed(2);
  document.getElementById("balance").innerText = "₦" + balance.toFixed(2);
  document.getElementById("tariffDisplay").innerText = "₦" + tariff + "/kWh";

  // Deduct balance gradually
  balance -= cost * 0.01;

  checkAlerts(cost);
}

// ================= CHART =================
const ctx = document.getElementById("usageChart").getContext("2d");

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "Electricity Usage",
      data: [],
      borderColor: "#38bdf8",
      fill: false
    }]
  }
});

function updateChart() {
  chart.data.labels.push("");
  chart.data.datasets[0].data.push(usage);

  if (chart.data.labels.length > 30) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }

  chart.update();
}

// ================= AI =================
function runAI() {
  if (usageHistory.length < 5) return;

  let last5 = usageHistory.slice(-5);
  let avg = last5.reduce((a, b) => a + b, 0) / 5;

  document.getElementById("prediction").innerText =
    "Predicted next usage: " + avg.toFixed(2) + " kWh";

  // Recommendation
  let recommendation = avg > 50
    ? "⚠ High usage predicted. Reduce AC usage."
    : "✅ Usage is within normal range.";

  document.getElementById("recommendation").innerText = recommendation;

  // Anomaly detection
  let latest = usageHistory[usageHistory.length - 1];
  let deviation = Math.abs(latest - avg);

  if (deviation > 20) {
    document.getElementById("anomaly").innerText =
      "⚠ Anomaly detected: sudden spike in usage!";
  } else {
    document.getElementById("anomaly").innerText =
      "No anomalies detected.";
  }
}

// ================= ALERTS =================
function checkAlerts(cost) {
  let alerts = [];

  if (cost > alertThreshold) {
    alerts.push("⚠ High electricity cost!");
  }

  if (balance < 1000) {
    alerts.push("⚠ Low balance!");
  }

  document.getElementById("alertsList").innerHTML =
    alerts.map(a => `<li>${a}</li>`).join("");
}

// ================= SETTINGS =================
function saveSettings() {
  tariff = Number(document.getElementById("tariffInput").value);
  alertThreshold = Number(document.getElementById("alertInput").value);
  balance = Number(document.getElementById("balanceInput").value);

  localStorage.setItem("tariff", tariff);
  localStorage.setItem("alertThreshold", alertThreshold);
  localStorage.setItem("balance", balance);

  alert("Settings saved!");
}

// ================= CSV EXPORT =================
function exportCSV() {
  let csv = "Usage\n" + usageHistory.join("\n");

  let blob = new Blob([csv], { type: "text/csv" });
  let url = URL.createObjectURL(blob);

  let a = document.createElement("a");
  a.href = url;
  a.download = "usage.csv";
  a.click();
}