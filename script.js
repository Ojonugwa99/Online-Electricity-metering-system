/* =============================================================
   VoltIQ — Smart Electricity Metering System
   script.js — Complete Application Logic
   Features: Dashboard, Appliances, Billing, Analytics, AI Insights, Alerts, Settings
============================================================= */

'use strict';

// ============================================================
// SECTION 1: APPLICATION STATE & CONSTANTS
// ============================================================

/**
 * Nigerian electricity tariff bands (NERC rates)
 */
const TARIFF_BANDS = {
  A: { name: 'Band A', rate: 68, hours: '20+ hrs/day' },
  B: { name: 'Band B', rate: 63, hours: '16–20 hrs/day' },
  C: { name: 'Band C', rate: 58, hours: '12–16 hrs/day' },
  D: { name: 'Band D', rate: 52, hours: '8–12 hrs/day' },
  E: { name: 'Band E', rate: 40, hours: '<8 hrs/day' }
};

/**
 * Appliance definitions with wattage and icon/color data
 */
const APPLIANCE_DEFS = [
  { id: 'ac',      name: 'Air Conditioner', watts: 1500, icon: '❄️',  color: '#4a9eff', glow: '#4a9eff' },
  { id: 'fridge',  name: 'Refrigerator',    watts: 150,  icon: '🧊',  color: '#00e5a0', glow: '#00e5a0' },
  { id: 'tv',      name: 'Television',      watts: 120,  icon: '📺',  color: '#a855f7', glow: '#a855f7' },
  { id: 'fan',     name: 'Ceiling Fan',     watts: 75,   icon: '🌀',  color: '#4a9eff', glow: '#4a9eff' },
  { id: 'heater',  name: 'Water Heater',    watts: 3000, icon: '🔥',  color: '#ff7c3a', glow: '#ff7c3a' },
  { id: 'washer',  name: 'Washing Machine', watts: 500,  icon: '🫧',  color: '#00e5a0', glow: '#00e5a0' },
  { id: 'bulb1',   name: 'Light (Living)',  watts: 12,   icon: '💡',  color: '#f5c518', glow: '#f5c518' },
  { id: 'bulb2',   name: 'Light (Bedroom)', watts: 9,    icon: '🕯️',  color: '#f5c518', glow: '#f5c518' },
  { id: 'microwave',name: 'Microwave',      watts: 1200, icon: '📡',  color: '#ff7c3a', glow: '#ff7c3a' },
  { id: 'laptop',  name: 'Laptop',          watts: 65,   icon: '💻',  color: '#a855f7', glow: '#a855f7' },
  { id: 'pump',    name: 'Water Pump',      watts: 750,  icon: '🚿',  color: '#4a9eff', glow: '#4a9eff' },
  { id: 'iron',    name: 'Electric Iron',   watts: 1000, icon: '♨️',  color: '#ff4d6d', glow: '#ff4d6d' },
];

/**
 * Default application settings
 */
const DEFAULT_SETTINGS = {
  tariffBand:        'A',
  customRate:        null,
  accountType:       'prepaid',
  vat:               7.5,
  dailyThreshold:    20,
  monthlyThreshold:  300,
  lowBalanceAlert:   500,
  spikeSensitivity:  'medium',
  currency:          '₦',
  theme:             'dark',
  interval:          2000,
  aiEnabled:         true,
  soundEnabled:      false
};

// ---- App-wide state object ----
let state = {
  user: null,          // Logged-in user object
  settings: { ...DEFAULT_SETTINGS },
  appliances: {},      // { id: boolean (on/off) }
  balance: 5000,       // Prepaid balance in currency
  totalMeterKwh: 0,    // Cumulative meter reading
  todayKwh: 0,         // Today's consumption
  monthKwh: 0,         // This month's consumption
  liveReadings: [],    // Last 20 power readings (W)
  dailyHistory: [],    // 30 days of kWh values
  hourlyHistory: [],   // 24-hour distribution
  alerts: [],          // System alerts array
  transactions: [],    // Billing transaction log
  billHistory: [],     // Monthly bill records
  paidBills: {},       // { "YYYY-MM": true }
  charts: {},          // Chart.js instances
  tickInterval: null,  // Meter tick timer
  historyTab: 'daily', // Current chart tab
  lastSpikeAlert: 0,   // Timestamp of last spike alert
};

// ============================================================
// SECTION 2: STORAGE — localStorage wrapper
// ============================================================

/**
 * Save entire app state to localStorage
 */
function saveState() {
  try {
    const toSave = {
      user:         state.user,
      settings:     state.settings,
      balance:      state.balance,
      totalMeterKwh: state.totalMeterKwh,
      todayKwh:     state.todayKwh,
      monthKwh:     state.monthKwh,
      appliances:   state.appliances,
      alerts:       state.alerts.slice(0, 50),    // cap saved alerts
      transactions: state.transactions.slice(0, 100),
      billHistory:  state.billHistory,
      paidBills:    state.paidBills,
      dailyHistory: state.dailyHistory,
      hourlyHistory: state.hourlyHistory,
    };
    localStorage.setItem('voltiq_state', JSON.stringify(toSave));
  } catch (e) {
    console.warn('Save failed:', e);
  }
}

/**
 * Load state from localStorage, merging with defaults
 */
function loadState() {
  try {
    const raw = localStorage.getItem('voltiq_state');
    if (!raw) return false;
    const saved = JSON.parse(raw);
    Object.assign(state, saved);
    state.settings = { ...DEFAULT_SETTINGS, ...(saved.settings || {}) };
    return true;
  } catch (e) {
    return false;
  }
}

// ============================================================
// SECTION 3: AUTHENTICATION
// ============================================================

/**
 * Switch between login and signup tabs
 */
function switchAuthTab(tab) {
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('signup-form').classList.toggle('hidden', tab !== 'signup');
  document.querySelectorAll('.tab-btn').forEach((btn, i) => {
    btn.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'signup'));
  });
}

/**
 * Handle login button click (demo mode — no real auth)
 */
function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;

  if (!email || !pass) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  // Load existing state or create new demo user
  const hasSaved = loadState();
  if (!hasSaved || !state.user) {
    state.user = {
      name:      'Demo User',
      email:     email,
      meterNo:   'MTR-443291',
      accountType: 'prepaid',
      address:   '12 Solar Street, Lekki, Lagos',
      phone:     '+234 801 234 5678',
      joinDate:  new Date().toISOString(),
    };
    initFreshData();
  }

  enterApp();
}

/**
 * Handle signup button click
 */
function handleSignup() {
  const name  = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const meter = document.getElementById('signup-meter').value.trim();
  const type  = document.getElementById('signup-type').value;
  const pass  = document.getElementById('signup-pass').value;

  if (!name || !email || !meter || !pass) {
    showToast('Please fill all fields', 'error');
    return;
  }

  state.user = {
    name, email, meterNo: meter,
    accountType: type,
    address: '', phone: '',
    joinDate: new Date().toISOString()
  };
  state.settings.accountType = type;
  state.balance = type === 'prepaid' ? 5000 : 0;
  initFreshData();
  saveState();
  enterApp();
}

/**
 * Transition from login to app
 */
function enterApp() {
  document.getElementById('login-screen').classList.remove('active');
  document.getElementById('app-screen').classList.add('active');
  populateUserUI();
  applyTheme(state.settings.theme);
  startMeterTick();
  renderAppliances();
  updateAllDashboard();
  updateBillingUI();
  renderAlerts();
  populateSettingsForm();
  runAIAnalysis();
  navigateTo('dashboard', document.querySelector('[data-page="dashboard"]'));
}

/**
 * Logout — clear session and reload
 */
function handleLogout() {
  saveState();
  clearInterval(state.tickInterval);
  document.getElementById('app-screen').classList.remove('active');
  document.getElementById('login-screen').classList.add('active');
  state.user = null;
  showToast('Logged out successfully', 'info');
}

// ============================================================
// SECTION 4: DATA INITIALIZATION
// ============================================================

/**
 * Generate realistic historical data for a fresh account
 */
function initFreshData() {
  // Initialize appliances (all off by default, fridge always on)
  APPLIANCE_DEFS.forEach(a => {
    state.appliances[a.id] = (a.id === 'fridge');
  });

  // Generate 30 days of daily history (kWh) using random walk
  state.dailyHistory = [];
  let base = 8 + Math.random() * 6; // 8–14 kWh/day base
  for (let i = 29; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const isWeekend = [0, 6].includes(day.getDay());
    const variation = (Math.random() - 0.5) * 3;
    const weekendBoost = isWeekend ? 2.5 : 0;
    const val = Math.max(2, base + variation + weekendBoost);
    base = base + (Math.random() - 0.5) * 0.5; // drift
    state.dailyHistory.push(parseFloat(val.toFixed(2)));
  }

  // Generate 24-hour distribution
  state.hourlyHistory = generateHourlyProfile();

  // Set current values from history
  state.todayKwh = state.dailyHistory[state.dailyHistory.length - 1] || 0;
  state.monthKwh = state.dailyHistory.slice(-30).reduce((a, b) => a + b, 0);
  state.totalMeterKwh = state.dailyHistory.reduce((a, b) => a + b, 0) + 1248.3;

  // Seed live readings
  const baseWatts = calcLiveWatts();
  state.liveReadings = Array(20).fill(0).map(() =>
    Math.max(50, baseWatts + (Math.random() - 0.5) * 200)
  );

  // Generate some demo transactions
  state.transactions = [];
  state.billHistory  = [];
  if (state.settings.accountType === 'prepaid') {
    state.balance = 5000;
    addTransaction('Top Up', 5000, 5000, 'success');
    addTransaction('Consumption', -347, 4653, 'success');
  } else {
    for (let m = 5; m >= 1; m--) {
      const d = new Date();
      d.setMonth(d.getMonth() - m);
      const kwh = 200 + Math.random() * 150;
      const amt = kwh * getRate();
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      state.billHistory.push({ month: d.toLocaleString('default',{month:'long',year:'numeric'}), kwh: parseFloat(kwh.toFixed(1)), amount: parseFloat(amt.toFixed(2)), key });
      state.paidBills[key] = true;
    }
  }
}

/**
 * Generates an hourly consumption profile (24 values)
 * Higher usage in morning and evening peaks
 */
function generateHourlyProfile() {
  const profile = [];
  const peaks = {0:.3,1:.2,2:.15,3:.1,4:.1,5:.2,6:.5,7:.8,8:.9,9:.7,10:.6,11:.6,12:.7,13:.6,14:.5,15:.5,16:.6,17:.8,18:1,19:1,20:.9,21:.8,22:.6,23:.4};
  for (let h = 0; h < 24; h++) {
    profile.push(parseFloat(((peaks[h] || 0.5) * 3 + Math.random() * 0.5).toFixed(2)));
  }
  return profile;
}

// ============================================================
// SECTION 5: METER TICK ENGINE
// ============================================================

/**
 * Calculate current live wattage from active appliances
 */
function calcLiveWatts() {
  return APPLIANCE_DEFS.reduce((sum, a) => {
    return sum + (state.appliances[a.id] ? a.watts : 0);
  }, 0);
}

/**
 * Get current tariff rate (custom or band default)
 */
function getRate() {
  if (state.settings.customRate && state.settings.customRate > 0) {
    return state.settings.customRate;
  }
  return TARIFF_BANDS[state.settings.tariffBand]?.rate || 68;
}

/**
 * Start the meter tick — runs every N ms (configurable)
 * Updates consumption, balance, and triggers checks
 */
function startMeterTick() {
  if (state.tickInterval) clearInterval(state.tickInterval);
  const interval = state.settings.interval || 2000;

  state.tickInterval = setInterval(() => {
    const baseWatts = calcLiveWatts();
    // Add small random noise ±5% to simulate real meter
    const noise = baseWatts * (0.95 + Math.random() * 0.1);
    const watts = Math.max(10, noise);

    // Convert W to kWh for this tick period (interval ms → hours)
    const hoursElapsed = (interval / 1000) / 3600;
    const kwhTick = (watts / 1000) * hoursElapsed;

    // Update running totals
    state.totalMeterKwh += kwhTick;
    state.todayKwh      += kwhTick;
    state.monthKwh      += kwhTick;

    // Update live readings buffer (keep last 20)
    state.liveReadings.push(watts);
    if (state.liveReadings.length > 20) state.liveReadings.shift();

    // Deduct from prepaid balance
    if (state.settings.accountType === 'prepaid') {
      const cost = kwhTick * getRate();
      state.balance = Math.max(0, state.balance - cost);
      checkLowBalance();
    }

    // Update hourly distribution
    const hour = new Date().getHours();
    if (!state.hourlyHistory[hour]) state.hourlyHistory[hour] = 0;
    state.hourlyHistory[hour] = parseFloat((state.hourlyHistory[hour] + kwhTick).toFixed(4));

    // Run threshold checks
    checkDailyThreshold();
    checkSpike(watts);

    // Update the UI
    updateDashboardLive(watts);

    // Periodically save
    if (Math.random() < 0.05) saveState();

  }, interval);
}

// ============================================================
// SECTION 6: DASHBOARD UI UPDATES
// ============================================================

/**
 * Full dashboard update (on page load or tab switch)
 */
function updateAllDashboard() {
  updateKPICards();
  updateMeterDisplay();
  updateLiveChart();
  updateHistoryChart(state.historyTab);
}

/**
 * Lightweight live update (called every tick)
 */
function updateDashboardLive(watts) {
  // Only update visible elements for performance
  updateKPICards();
  updateMeterDisplay();
  updateLiveChartPoint(watts);
  updateLiveChip(watts);
}

/**
 * Update KPI summary cards
 */
function updateKPICards() {
  const cur    = state.settings.currency;
  const rate   = getRate();
  const todayC = (state.todayKwh * rate).toFixed(2);
  const monC   = (state.monthKwh * rate).toFixed(2);
  const watts  = calcLiveWatts();
  const onCount = APPLIANCE_DEFS.filter(a => state.appliances[a.id]).length;

  setText('kpi-today',       `${state.todayKwh.toFixed(2)} <span>kWh</span>`);
  setText('kpi-today-cost',  `${cur}${Number(todayC).toLocaleString()}`);
  setText('kpi-month',       `${state.monthKwh.toFixed(2)} <span>kWh</span>`);
  setText('kpi-month-cost',  `${cur}${Number(monC).toLocaleString()}`);
  setText('kpi-power',       `${watts.toFixed(0)} <span>W</span>`);
  setText('kpi-active-count',`${onCount} appliance${onCount !== 1 ? 's' : ''} ON`);

  // Trend indicators (vs yesterday)
  const yesterday = state.dailyHistory[state.dailyHistory.length - 2] || state.todayKwh;
  const trendPct  = yesterday > 0 ? (((state.todayKwh - yesterday) / yesterday) * 100).toFixed(1) : 0;
  const trendEl   = document.getElementById('kpi-today-trend');
  if (trendEl) {
    trendEl.textContent = `${trendPct > 0 ? '↑' : '↓'} ${Math.abs(trendPct)}%`;
    trendEl.style.color = trendPct > 10 ? 'var(--accent-red)' : 'var(--accent-green)';
  }

  // Balance / credit card
  if (state.settings.accountType === 'prepaid') {
    setText('kpi-balance',      `${cur}${state.balance.toFixed(2)}`);
    setText('kpi-balance-label','Prepaid Balance');
    setText('kpi-balance-sub',  `≈ ${(state.balance / rate).toFixed(1)} kWh left`);
    const balEl = document.getElementById('kpi-balance');
    if (balEl) balEl.style.color = state.balance < state.settings.lowBalanceAlert ? 'var(--accent-red)' : '';
  } else {
    const billAmt = (state.monthKwh * rate).toFixed(2);
    setText('kpi-balance',      `${cur}${Number(billAmt).toLocaleString()}`);
    setText('kpi-balance-label','Monthly Bill');
    setText('kpi-balance-sub',  'Postpaid');
  }
}

/**
 * Update the digital meter display
 */
function updateMeterDisplay() {
  const digits = state.totalMeterKwh.toFixed(1).padStart(7, '0');
  const el = document.getElementById('meter-digits');
  if (el) el.textContent = digits.split('').join(' ');

  const rate = getRate();
  const cur  = state.settings.currency;
  const band = state.settings.tariffBand;

  setText('meta-meter-id',     state.user?.meterNo || 'MTR-000000');
  setText('meta-tariff-band',  `Band ${band}`);
  setText('meta-rate',         `${cur}${rate}/kWh`);
  setText('meta-account-type', capitalize(state.settings.accountType));
}

/**
 * Update live appliance load chip on appliances page
 */
function updateLiveChip(watts) {
  const el = document.getElementById('live-load-chip');
  if (el) el.textContent = `${watts.toFixed(0)}W`;
}

// ============================================================
// SECTION 7: CHARTS
// ============================================================

/** Chart.js default theme config */
function chartDefaults() {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  return {
    gridColor:  isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
    textColor:  isDark ? '#8892aa' : '#4a5470',
    fontFamily: "'Space Mono', monospace",
  };
}

/**
 * Initialize or update the live power chart (line chart)
 */
function updateLiveChart() {
  const ctx = document.getElementById('liveChart');
  if (!ctx) return;
  const { gridColor, textColor } = chartDefaults();
  const labels = state.liveReadings.map((_, i) => i + 1);

  if (state.charts.live) {
    state.charts.live.data.labels = labels;
    state.charts.live.data.datasets[0].data = [...state.liveReadings];
    state.charts.live.update('none');
    return;
  }

  state.charts.live = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Power (W)',
        data: [...state.liveReadings],
        borderColor: '#00e5a0',
        backgroundColor: 'rgba(0,229,160,0.08)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => `${ctx.parsed.y.toFixed(0)} W` }
        }
      },
      scales: {
        x: { display: false },
        y: {
          grid: { color: gridColor },
          ticks: { color: textColor, font: { family: "'Space Mono', monospace", size: 10 },
                   callback: v => `${v}W` }
        }
      }
    }
  });
}

/**
 * Push a single point to the live chart (more efficient than full re-render)
 */
function updateLiveChartPoint(watts) {
  if (!state.charts.live) { updateLiveChart(); return; }
  const chart = state.charts.live;
  chart.data.labels.push(chart.data.labels.length + 1);
  chart.data.datasets[0].data.push(watts);
  if (chart.data.labels.length > 20) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  chart.update('none');
}

/**
 * Render the history chart (daily/weekly/monthly tabs)
 */
function updateHistoryChart(tab = 'daily') {
  state.historyTab = tab;
  const ctx = document.getElementById('historyChart');
  if (!ctx) return;

  const { gridColor, textColor } = chartDefaults();
  let labels, data, label;

  if (tab === 'daily') {
    // Last 14 days
    const slice = state.dailyHistory.slice(-14);
    labels = slice.map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (slice.length - 1 - i));
      return d.toLocaleDateString('en', { weekday: 'short', day: 'numeric' });
    });
    data   = slice;
    label  = 'Daily (kWh)';
  } else if (tab === 'weekly') {
    // Last 8 weeks (sum of 7-day chunks)
    const weeks = [];
    const wLabels = [];
    for (let w = 7; w >= 0; w--) {
      const chunk = state.dailyHistory.slice(Math.max(0, state.dailyHistory.length - (w+1)*7),
                                              state.dailyHistory.length - w*7);
      weeks.push(parseFloat(chunk.reduce((a,b) => a+b, 0).toFixed(2)));
      const d = new Date();
      d.setDate(d.getDate() - w * 7);
      wLabels.push(`Wk ${d.toLocaleDateString('en', { month:'short', day:'numeric' })}`);
    }
    labels = wLabels; data = weeks; label = 'Weekly (kWh)';
  } else {
    // Last 6 months
    const months = [];
    const mLabels = [];
    for (let m = 5; m >= 0; m--) {
      const d = new Date();
      d.setMonth(d.getMonth() - m);
      mLabels.push(d.toLocaleDateString('en', { month: 'short' }));
      const base = state.dailyHistory.slice(-30 * (m + 1), -30 * m || undefined);
      months.push(parseFloat(base.reduce((a, b) => a + b, 0).toFixed(1)));
    }
    labels = mLabels; data = months; label = 'Monthly (kWh)';
  }

  if (state.charts.history) {
    state.charts.history.data.labels = labels;
    state.charts.history.data.datasets[0].data = data;
    state.charts.history.update();
    return;
  }

  state.charts.history = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label,
        data,
        backgroundColor: 'rgba(245,197,24,0.7)',
        borderColor: '#f5c518',
        borderWidth: 2,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor, font: { size: 10 } } },
        y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => `${v} kWh` } }
      }
    }
  });
}

/**
 * Switch history chart tab
 */
function switchHistoryTab(tab, btn) {
  document.querySelectorAll('.chart-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  if (state.charts.history) {
    state.charts.history.destroy();
    state.charts.history = null;
  }
  updateHistoryChart(tab);
}

/**
 * Render the appliance pie chart
 */
function renderAppliancePieChart() {
  const ctx = document.getElementById('appliancePieChart');
  if (!ctx) return;

  const activeAppliances = APPLIANCE_DEFS.filter(a => state.appliances[a.id]);
  if (activeAppliances.length === 0) {
    if (state.charts.pie) { state.charts.pie.destroy(); state.charts.pie = null; }
    return;
  }

  const labels = activeAppliances.map(a => a.name);
  const data   = activeAppliances.map(a => a.watts);
  const colors = activeAppliances.map(a => a.color);

  if (state.charts.pie) {
    state.charts.pie.data.labels = labels;
    state.charts.pie.data.datasets[0].data = data;
    state.charts.pie.data.datasets[0].backgroundColor = colors;
    state.charts.pie.update();
    return;
  }

  state.charts.pie = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data, backgroundColor: colors,
        borderWidth: 2, borderColor: 'var(--bg-base)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: '#8892aa', font: { size: 11 }, padding: 12 }
        },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.label}: ${ctx.parsed}W (${((ctx.parsed / data.reduce((a,b)=>a+b,0))*100).toFixed(1)}%)`
          }
        }
      }
    }
  });
}

/**
 * Render analytics charts (weekly compare, hourly, monthly trend)
 */
function renderAnalyticsCharts() {
  const { gridColor, textColor } = chartDefaults();

  // ---- Weekly Comparison ----
  const ctxW = document.getElementById('weeklyCompareChart');
  if (ctxW) {
    const thisWeek = state.dailyHistory.slice(-7);
    const lastWeek = state.dailyHistory.slice(-14, -7);
    const wLabels  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

    if (state.charts.weeklyCompare) state.charts.weeklyCompare.destroy();
    state.charts.weeklyCompare = new Chart(ctxW, {
      type: 'bar',
      data: {
        labels: wLabels,
        datasets: [
          { label: 'This Week', data: thisWeek, backgroundColor: 'rgba(245,197,24,0.8)', borderRadius: 4 },
          { label: 'Last Week', data: lastWeek, backgroundColor: 'rgba(74,158,255,0.5)', borderRadius: 4 },
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: textColor, font: { size: 11 } } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => `${v}` } }
        }
      }
    });
  }

  // ---- Hourly Distribution ----
  const ctxH = document.getElementById('hourlyChart');
  if (ctxH) {
    const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,'0')}:00`);
    if (state.charts.hourly) state.charts.hourly.destroy();
    state.charts.hourly = new Chart(ctxH, {
      type: 'bar',
      data: {
        labels: hours,
        datasets: [{
          label: 'Avg kWh',
          data: state.hourlyHistory,
          backgroundColor: hours.map((_, i) => {
            // Colour peak hours differently
            if (i >= 18 && i <= 21) return 'rgba(255,77,109,0.8)';
            if (i >= 6  && i <= 9)  return 'rgba(245,197,24,0.8)';
            return 'rgba(0,229,160,0.6)';
          }),
          borderRadius: 3,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor, font: { size: 9 }, maxRotation: 45 } },
          y: { grid: { color: gridColor }, ticks: { color: textColor } }
        }
      }
    });
  }

  // ---- Monthly Trend + Prediction ----
  const ctxM = document.getElementById('monthlyTrendChart');
  if (ctxM) {
    const { historicalLabels, historicalData, predLabels, predData } = buildMonthlyPrediction();
    if (state.charts.monthlyTrend) state.charts.monthlyTrend.destroy();
    state.charts.monthlyTrend = new Chart(ctxM, {
      type: 'line',
      data: {
        labels: [...historicalLabels, ...predLabels],
        datasets: [
          {
            label: 'Actual (kWh)',
            data: historicalData,
            borderColor: '#f5c518',
            backgroundColor: 'rgba(245,197,24,0.08)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 3,
          },
          {
            label: 'Predicted (kWh)',
            data: [...new Array(historicalData.length).fill(null), ...predData],
            borderColor: '#a855f7',
            borderDash: [5, 5],
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 3,
            pointStyle: 'triangle',
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: textColor, font: { size: 11 } } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor, font: { size: 10 } } },
          y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => `${v} kWh` } }
        }
      }
    });
  }

  // Update stat boxes
  const avg   = (state.dailyHistory.reduce((a, b) => a + b, 0) / state.dailyHistory.length).toFixed(2);
  const peak  = Math.max(...state.dailyHistory).toFixed(2);
  const low   = Math.min(...state.dailyHistory).toFixed(2);
  const { predData: futureData } = buildMonthlyPrediction();
  const predicted = futureData.reduce((a, b) => a + b, 0).toFixed(1);

  setText('stat-avg-daily', `${avg} kWh`);
  setText('stat-peak-day',  `${peak} kWh`);
  setText('stat-low-day',   `${low} kWh`);
  setText('stat-predicted', `${predicted} kWh`);
}

// ============================================================
// SECTION 8: AI ANALYSIS ENGINE
// ============================================================

/**
 * Linear regression — returns slope and intercept for a data series
 * Used to predict future consumption
 */
function linearRegression(data) {
  const n = data.length;
  const sumX  = data.reduce((s, _, i) => s + i, 0);
  const sumY  = data.reduce((s, v) => s + v, 0);
  const sumXY = data.reduce((s, v, i) => s + i * v, 0);
  const sumX2 = data.reduce((s, _, i) => s + i * i, 0);

  const slope     = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

/**
 * Moving average smoothing
 */
function movingAverage(data, window = 3) {
  return data.map((_, i) => {
    const slice = data.slice(Math.max(0, i - window + 1), i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

/**
 * Predict next N days using linear regression + noise
 */
function predictNextDays(n = 7) {
  const data = state.dailyHistory.slice(-30);
  const { slope, intercept } = linearRegression(data);
  const smoothed = movingAverage(data);
  const lastSmoothed = smoothed[smoothed.length - 1];

  return Array.from({ length: n }, (_, i) => {
    const predicted = intercept + slope * (data.length + i);
    // Blend prediction with last smoothed value for stability
    const blended = predicted * 0.6 + lastSmoothed * 0.4;
    const noise = (Math.random() - 0.5) * 0.8;
    return Math.max(1, parseFloat((blended + noise).toFixed(2)));
  });
}

/**
 * Build monthly prediction data for the trend chart
 */
function buildMonthlyPrediction() {
  const months     = [];
  const mLabels    = [];
  for (let m = 5; m >= 0; m--) {
    const d = new Date();
    d.setMonth(d.getMonth() - m);
    mLabels.push(d.toLocaleDateString('en', { month: 'short', year: '2-digit' }));
    const base = state.dailyHistory.slice(-30 * (m + 1), -30 * m || undefined);
    months.push(parseFloat(base.reduce((a, b) => a + b, 0).toFixed(1)));
  }

  // Predict next 3 months using linear regression on monthly totals
  const { slope, intercept } = linearRegression(months);
  const predData   = [];
  const predLabels = [];
  for (let p = 1; p <= 3; p++) {
    const d = new Date();
    d.setMonth(d.getMonth() + p);
    predLabels.push(d.toLocaleDateString('en', { month: 'short', year: '2-digit' }));
    const val = Math.max(0, intercept + slope * (months.length + p - 1));
    predData.push(parseFloat(val.toFixed(1)));
  }

  return { historicalLabels: mLabels, historicalData: months, predLabels, predData };
}

/**
 * Anomaly detection — compares each reading to rolling average
 * Spike threshold: 2× average (configurable)
 */
function detectAnomalies() {
  const data = state.dailyHistory;
  const avg  = data.reduce((a, b) => a + b, 0) / data.length;
  const std  = Math.sqrt(data.reduce((s, v) => s + (v - avg) ** 2, 0) / data.length);

  const sensitivityMultiplier = { low: 3, medium: 2, high: 1.5 };
  const mult = sensitivityMultiplier[state.settings.spikeSensitivity] || 2;
  const spikeThreshold = avg + mult * std;
  const lowThreshold   = Math.max(0.5, avg - mult * std);

  const anomalies = [];

  // Find recent high spikes
  data.slice(-7).forEach((val, i) => {
    const dayOffset = 7 - i;
    if (val > spikeThreshold) {
      const d = new Date();
      d.setDate(d.getDate() - dayOffset);
      anomalies.push({
        type: 'critical',
        icon: '⚡',
        title: `Unusual Spike Detected`,
        desc: `${d.toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}: ${val.toFixed(2)} kWh (${((val/avg - 1)*100).toFixed(0)}% above average of ${avg.toFixed(2)} kWh)`,
      });
    }
  });

  // Find very low consumption (possible outage)
  data.slice(-7).forEach((val, i) => {
    const dayOffset = 7 - i;
    if (val < lowThreshold && val < 1) {
      const d = new Date();
      d.setDate(d.getDate() - dayOffset);
      anomalies.push({
        type: 'info',
        icon: '🔌',
        title: 'Very Low Consumption',
        desc: `${d.toLocaleDateString('en', { weekday: 'long' })}: Only ${val.toFixed(2)} kWh recorded. Possible outage or meter issue.`,
      });
    }
  });

  // Check current live load vs average
  const currentWatts = calcLiveWatts();
  if (currentWatts > 3000) {
    anomalies.push({
      type: 'warning',
      icon: '🔥',
      title: 'High Simultaneous Load',
      desc: `Current load is ${currentWatts}W with ${APPLIANCE_DEFS.filter(a => state.appliances[a.id]).length} appliances running. Consider staggering usage.`,
    });
  }

  if (anomalies.length === 0) {
    anomalies.push({
      type: 'info',
      icon: '✅',
      title: 'No Anomalies Detected',
      desc: 'Your consumption pattern is within normal range for the past 7 days.',
    });
  }

  return anomalies;
}

/**
 * Rule-based AI recommendations
 * Analyses current state and returns actionable advice
 */
function generateRecommendations() {
  const recs   = [];
  const rate   = getRate();
  const cur    = state.settings.currency;
  const avg    = state.dailyHistory.reduce((a, b) => a + b, 0) / state.dailyHistory.length;
  const onApps = APPLIANCE_DEFS.filter(a => state.appliances[a.id]);
  const hour   = new Date().getHours();
  const isOffPeak = (hour >= 22 || hour <= 6);

  // AC running during peak hours
  if (state.appliances['ac'] && !isOffPeak) {
    const acWatts = APPLIANCE_DEFS.find(a => a.id === 'ac').watts;
    const hourSaving = (acWatts / 1000) * rate;
    recs.push({
      icon: '❄️',
      title: 'Shift AC to Off-Peak Hours',
      desc: 'Air conditioning accounts for ~50% of electricity bills. Running it between 10 PM–6 AM can reduce costs significantly.',
      savings: `Potential saving: ${cur}${(hourSaving * 6).toFixed(0)}/night`,
    });
  }

  // Heater and AC running simultaneously
  if (state.appliances['heater'] && state.appliances['ac']) {
    recs.push({
      icon: '⚠️',
      title: 'Heater & AC Running Simultaneously',
      desc: 'Water heater and air conditioner running at the same time wastes over 4,500W. Turn off the heater when the AC is active.',
      savings: `Saving: ${cur}${((3000/1000) * rate).toFixed(0)}/hr`,
    });
  }

  // Lights still on during the day
  const isDaytime = (hour >= 7 && hour <= 17);
  if (isDaytime && (state.appliances['bulb1'] || state.appliances['bulb2'])) {
    recs.push({
      icon: '💡',
      title: 'Lights On During Daytime',
      desc: 'You have lights running between 7 AM–6 PM. Use natural light to save energy.',
      savings: `Saving: ${cur}${((21/1000) * rate * 8).toFixed(0)}/day`,
    });
  }

  // High consumption trend
  const recentAvg = state.dailyHistory.slice(-7).reduce((a,b)=>a+b,0) / 7;
  if (recentAvg > avg * 1.2) {
    recs.push({
      icon: '📈',
      title: 'Above-Average Consumption This Week',
      desc: `Your recent 7-day average (${recentAvg.toFixed(2)} kWh) is ${((recentAvg/avg - 1)*100).toFixed(0)}% above your usual average. Review appliance usage.`,
      savings: `Could save ${cur}${((recentAvg - avg) * rate * 30).toFixed(0)}/month`,
    });
  }

  // Upgrade to efficient appliances
  if (state.appliances['heater']) {
    recs.push({
      icon: '🌡️',
      title: 'Solar Water Heater Upgrade',
      desc: 'Replacing your 3,000W electric heater with a solar water heater eliminates one of the largest power consumers in your home.',
      savings: `Saving: ${cur}${((3000/1000) * rate * 2).toFixed(0)}/day`,
    });
  }

  // Off-peak suggestion
  if (!isOffPeak && onApps.length > 3) {
    recs.push({
      icon: '🕙',
      title: 'Shift Heavy Loads to Off-Peak Hours',
      desc: 'Running washing machine, iron, or microwave between 10 PM–6 AM reduces strain on the grid and can lower your bill.',
      savings: null,
    });
  }

  // Low balance warning
  if (state.settings.accountType === 'prepaid' && state.balance < state.settings.lowBalanceAlert * 2) {
    recs.push({
      icon: '💳',
      title: 'Top Up Your Prepaid Balance',
      desc: `Your balance (${cur}${state.balance.toFixed(0)}) is getting low. Top up to avoid unexpected power interruption.`,
      savings: null,
    });
  }

  // Always add a general tip
  recs.push({
    icon: '🔋',
    title: 'Unplug Standby Appliances',
    desc: 'TVs, chargers, and microwaves on standby consume 5–10% of household electricity. Unplug when not in use.',
    savings: `Saving: ${cur}${(0.1 * state.monthKwh * rate / 30).toFixed(0)}/day`,
  });

  return recs;
}

/**
 * Calculate an efficiency score (0–100) based on consumption trends
 */
function calcEfficiencyScore() {
  const avg    = state.dailyHistory.reduce((a, b) => a + b, 0) / state.dailyHistory.length;
  const recent = state.dailyHistory.slice(-7).reduce((a, b) => a + b, 0) / 7;
  const onCount = APPLIANCE_DEFS.filter(a => state.appliances[a.id]).length;
  const hour   = new Date().getHours();

  let score = 100;
  // Penalise if recent usage is higher than average
  if (recent > avg) score -= Math.min(30, ((recent / avg - 1) * 100));
  // Penalise for high simultaneous load
  if (onCount > 6) score -= (onCount - 6) * 5;
  // Penalise for AC on during peak hours
  if (state.appliances['ac'] && hour >= 9 && hour <= 20) score -= 10;
  // Penalise for heater + AC
  if (state.appliances['heater'] && state.appliances['ac']) score -= 15;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Run full AI analysis and update the UI
 */
function runAIAnalysis() {
  if (!state.settings.aiEnabled) return;

  // Anomalies
  const anomalies = detectAnomalies();
  const anomalyEl = document.getElementById('anomaly-list');
  if (anomalyEl) {
    anomalyEl.innerHTML = anomalies.map(a => `
      <div class="anomaly-item ${a.type}">
        <span class="anomaly-icon">${a.icon}</span>
        <div>
          <div class="anomaly-title">${a.title}</div>
          <div class="anomaly-desc">${a.desc}</div>
        </div>
      </div>
    `).join('');
  }

  // Recommendations
  const recs  = generateRecommendations();
  const recEl = document.getElementById('recommendations-list');
  if (recEl) {
    recEl.innerHTML = recs.map(r => `
      <div class="rec-item">
        <span class="rec-icon">${r.icon}</span>
        <div>
          <div class="rec-title">${r.title}</div>
          <div class="rec-desc">${r.desc}</div>
          ${r.savings ? `<div class="rec-savings">${r.savings}</div>` : ''}
        </div>
      </div>
    `).join('');
  }

  // Efficiency Score
  const score  = calcEfficiencyScore();
  const offset = 314 - (314 * score / 100);
  const ringEl = document.getElementById('score-ring-fill');
  const ringTxt = document.getElementById('score-ring-text');
  if (ringEl)  { ringEl.style.strokeDashoffset = offset; ringEl.style.stroke = scoreColor(score); }
  if (ringTxt) { ringTxt.textContent = score; ringTxt.style.color = scoreColor(score); }
  setText('ai-score-val', `${score}/100`);
  const scoreEl = document.getElementById('ai-score-val');
  if (scoreEl) scoreEl.style.color = scoreColor(score);

  const labels = { 90:'Excellent', 75:'Good', 55:'Average', 35:'Below Average', 0:'Poor' };
  const label  = Object.keys(labels).reverse().find(k => score >= k) || 'Poor';
  setText('ai-score-sub', `${labels[label]} — Based on last 30 days`);

  // Prediction chart
  renderPredictionChart();

  // Update analytics charts
  renderAnalyticsCharts();
}

function scoreColor(score) {
  if (score >= 80) return '#00e5a0';
  if (score >= 60) return '#f5c518';
  if (score >= 40) return '#ff7c3a';
  return '#ff4d6d';
}

/**
 * Render the 7-day prediction chart on AI insights page
 */
function renderPredictionChart() {
  const ctx = document.getElementById('predictionChart');
  if (!ctx) return;

  const { gridColor, textColor } = chartDefaults();
  const historical = state.dailyHistory.slice(-7);
  const predictions = predictNextDays(7);
  const confLow  = predictions.map(v => v * 0.88);
  const confHigh = predictions.map(v => v * 1.12);

  const hLabels = historical.map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (7 - i));
    return d.toLocaleDateString('en', { weekday: 'short', day: 'numeric' });
  });

  const pLabels = predictions.map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d.toLocaleDateString('en', { weekday: 'short', day: 'numeric' });
  });

  if (state.charts.prediction) state.charts.prediction.destroy();

  state.charts.prediction = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [...hLabels, ...pLabels],
      datasets: [
        {
          label: 'Actual (kWh)',
          data: [...historical, ...new Array(7).fill(null)],
          borderColor: '#f5c518',
          borderWidth: 2.5,
          pointRadius: 4,
          tension: 0.4,
          fill: false,
        },
        {
          label: 'Predicted (kWh)',
          data: [...new Array(7).fill(null), ...predictions],
          borderColor: '#a855f7',
          borderDash: [6, 3],
          borderWidth: 2,
          pointRadius: 4,
          tension: 0.4,
          fill: false,
        },
        {
          label: 'Upper Bound',
          data: [...new Array(7).fill(null), ...confHigh],
          borderColor: 'rgba(168,85,247,0.2)',
          borderWidth: 1,
          pointRadius: 0,
          fill: '+1',
          backgroundColor: 'rgba(168,85,247,0.06)',
        },
        {
          label: 'Lower Bound',
          data: [...new Array(7).fill(null), ...confLow],
          borderColor: 'rgba(168,85,247,0.2)',
          borderWidth: 1,
          pointRadius: 0,
        },
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: textColor, font: { size: 11 }, filter: (item) => item.index < 2 } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor, font: { size: 10 } } },
        y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => `${v} kWh` } }
      }
    }
  });
}

// ============================================================
// SECTION 9: APPLIANCES MANAGEMENT
// ============================================================

/**
 * Render appliance cards on the appliances page
 */
function renderAppliances() {
  const grid = document.getElementById('appliance-grid');
  if (!grid) return;

  grid.innerHTML = APPLIANCE_DEFS.map(a => {
    const isOn = !!state.appliances[a.id];
    return `
      <div class="appliance-card ${isOn ? 'on' : ''}"
           id="app-card-${a.id}"
           style="--glow-color:${a.glow}"
           onclick="toggleAppliance('${a.id}')">
        <span class="appliance-icon">${a.icon}</span>
        <div class="appliance-name">${a.name}</div>
        <div class="appliance-watt">${a.watts}W</div>
        <div class="appliance-toggle"></div>
        <div class="appliance-status">${isOn ? 'ON' : 'OFF'}</div>
      </div>
    `;
  }).join('');

  updateLiveChip(calcLiveWatts());
  renderAppliancePieChart();
}

/**
 * Toggle an appliance on/off and update all dependent state
 */
function toggleAppliance(id) {
  state.appliances[id] = !state.appliances[id];
  const card = document.getElementById(`app-card-${id}`);
  if (card) {
    card.classList.toggle('on', state.appliances[id]);
    card.querySelector('.appliance-status').textContent = state.appliances[id] ? 'ON' : 'OFF';
  }

  const watts = calcLiveWatts();
  updateLiveChip(watts);
  updateKPICards();
  renderAppliancePieChart();

  const app = APPLIANCE_DEFS.find(a => a.id === id);
  showToast(`${app?.name} turned ${state.appliances[id] ? 'ON' : 'OFF'}`, 'info');
  saveState();
}

// ============================================================
// SECTION 10: BILLING SYSTEM
// ============================================================

/**
 * Switch between prepaid and postpaid billing mode views
 */
function switchBillingMode(mode) {
  document.getElementById('prepaid-section').classList.toggle('hidden', mode !== 'prepaid');
  document.getElementById('postpaid-section').classList.toggle('hidden', mode !== 'postpaid');
  document.getElementById('prepaid-tab').classList.toggle('active', mode === 'prepaid');
  document.getElementById('postpaid-tab').classList.toggle('active', mode === 'postpaid');
}

/**
 * Update all billing UI elements
 */
function updateBillingUI() {
  const cur  = state.settings.currency;
  const rate = getRate();
  const mode = state.settings.accountType;

  // Detect correct tab based on account type
  switchBillingMode(mode);

  // ---- Prepaid ----
  const maxBalance = 10000;
  const pct = Math.min(100, (state.balance / maxBalance) * 100);
  setText('prepaid-balance-display', `${cur}${state.balance.toFixed(2)}`);
  setText('prepaid-units-left', `≈ ${(state.balance / rate).toFixed(1)} kWh remaining`);
  const barEl = document.getElementById('balance-bar');
  if (barEl) { barEl.style.width = `${pct}%`; barEl.style.background = pct < 20 ? '#ff4d6d' : ''; }

  // ---- Postpaid Bill Breakdown ----
  const baseAmt   = parseFloat((state.monthKwh * rate).toFixed(2));
  const vatAmt    = parseFloat((baseAmt * state.settings.vat / 100).toFixed(2));
  const fixedAmt  = 500; // fixed service charge
  const totalAmt  = baseAmt + vatAmt + fixedAmt;

  const breakdown = document.getElementById('bill-breakdown');
  if (breakdown) {
    breakdown.innerHTML = [
      { label: `Energy (${state.monthKwh.toFixed(2)} kWh × ${cur}${rate})`, val: baseAmt },
      { label: `Fixed Service Charge`, val: fixedAmt },
      { label: `VAT (${state.settings.vat}%)`, val: vatAmt },
    ].map(l => `
      <div class="bill-line">
        <span>${l.label}</span>
        <strong>${cur}${l.val.toLocaleString()}</strong>
      </div>
    `).join('');
  }
  setText('bill-total', `Total: ${cur}${totalAmt.toFixed(2)}`);

  // ---- Bill History ----
  const histEl = document.getElementById('bill-history');
  if (histEl) {
    if (state.billHistory.length === 0) {
      histEl.innerHTML = '<div class="empty-state">No bill history yet.</div>';
    } else {
      histEl.innerHTML = state.billHistory.slice(-6).reverse().map(b => `
        <div class="bill-history-item">
          <span class="bill-month">${b.month}</span>
          <span class="bill-amt">${cur}${b.amount.toLocaleString()}</span>
          <span class="bill-status ${state.paidBills[b.key] ? 'paid' : 'unpaid'}">
            ${state.paidBills[b.key] ? '✓ Paid' : 'Unpaid'}
          </span>
        </div>
      `).join('');
    }
  }

  // ---- Transaction Log ----
  renderTransactionTable();
}

/**
 * Render transaction table rows
 */
function renderTransactionTable() {
  const cur = state.settings.currency;
  const tbody = document.getElementById('transaction-tbody');
  if (!tbody) return;

  if (state.transactions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">No transactions yet</td></tr>';
    return;
  }

  tbody.innerHTML = state.transactions.slice().reverse().slice(0, 20).map(t => `
    <tr>
      <td>${t.date}</td>
      <td>${t.type}</td>
      <td style="color:${t.amount > 0 ? 'var(--accent-green)' : 'var(--accent-red)'}">
        ${t.amount > 0 ? '+' : ''}${cur}${Math.abs(t.amount).toFixed(2)}
      </td>
      <td>${cur}${t.balanceAfter.toFixed(2)}</td>
      <td><span class="status-tag ${t.status}">${capitalize(t.status)}</span></td>
    </tr>
  `).join('');
}

/**
 * Add a transaction record to the log
 */
function addTransaction(type, amount, balanceAfter, status = 'success') {
  state.transactions.push({
    date: new Date().toLocaleString(),
    type, amount, balanceAfter, status
  });
}

/**
 * Top up prepaid balance
 */
function topUp(amount) {
  if (!amount || amount <= 0) { showToast('Enter a valid amount', 'error'); return; }
  const max = 50000;
  if (amount > max) { showToast(`Maximum top-up is ${state.settings.currency}${max}`, 'error'); return; }

  state.balance += amount;
  const prev = state.balance - amount;
  addTransaction('Top Up', amount, state.balance, 'success');
  addAlert('success', '✅', 'Top Up Successful', `${state.settings.currency}${amount} added. New balance: ${state.settings.currency}${state.balance.toFixed(2)}`);
  showToast(`${state.settings.currency}${amount.toLocaleString()} added successfully!`, 'success');
  updateBillingUI();
  updateKPICards();
  saveState();

  // Clear custom input
  const inp = document.getElementById('custom-topup');
  if (inp) inp.value = '';
}

/**
 * Redeem a token code (demo — any 4-4-4 pattern works)
 */
function redeemToken() {
  const code = document.getElementById('token-input').value.trim();
  if (!code) { showToast('Enter a token code', 'error'); return; }

  // Simple validation: accept any code matching pattern XXXX-XXXX-XXXX
  const valid = /^\d{4}-\d{4}-\d{4}$/.test(code);
  if (valid) {
    const amount = 1000 + Math.floor(Math.random() * 2000);
    topUp(amount);
    document.getElementById('token-input').value = '';
  } else {
    showToast('Invalid token format. Use XXXX-XXXX-XXXX', 'error');
  }
}

/**
 * Pay current postpaid bill
 */
function payBill() {
  const rate  = getRate();
  const vatAmt = (state.monthKwh * rate) * (state.settings.vat / 100);
  const total = (state.monthKwh * rate) + vatAmt + 500;
  const now   = new Date();
  const key   = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

  state.paidBills[key] = true;
  addAlert('success', '✅', 'Bill Payment Successful', `${state.settings.currency}${total.toFixed(2)} paid for ${now.toLocaleString('en',{month:'long'})}`);
  showToast(`Bill of ${state.settings.currency}${total.toFixed(2)} paid!`, 'success');
  updateBillingUI();
  saveState();
}

/**
 * Export usage data as CSV
 */
function exportCSV() {
  const cur  = state.settings.currency;
  const rate = getRate();
  const rows = [
    ['Day', 'Date', 'Usage (kWh)', `Cost (${cur})`, 'Notes'],
  ];

  state.dailyHistory.slice(-30).forEach((kwh, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    rows.push([
      i + 1,
      d.toLocaleDateString(),
      kwh.toFixed(2),
      (kwh * rate).toFixed(2),
      i === 29 ? 'Today' : ''
    ]);
  });

  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `voltiq_usage_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('CSV exported successfully!', 'success');
}

// ============================================================
// SECTION 11: ALERT SYSTEM
// ============================================================

/**
 * Check and fire daily usage threshold alert
 */
function checkDailyThreshold() {
  if (state.todayKwh > state.settings.dailyThreshold) {
    const key = `daily_${new Date().toDateString()}`;
    if (!state._firedAlerts) state._firedAlerts = {};
    if (!state._firedAlerts[key]) {
      state._firedAlerts[key] = true;
      addAlert('critical', '⚡', 'Daily Usage Limit Exceeded',
        `Today's usage (${state.todayKwh.toFixed(2)} kWh) has exceeded your daily alert threshold of ${state.settings.dailyThreshold} kWh.`);
      showToast('⚡ Daily usage threshold exceeded!', 'warning');
    }
  }
}

/**
 * Check and fire low balance alert
 */
function checkLowBalance() {
  if (state.settings.accountType !== 'prepaid') return;
  const key = `lowbal_${Math.floor(Date.now() / 3600000)}`; // once per hour
  if (!state._firedAlerts) state._firedAlerts = {};
  if (state.balance < state.settings.lowBalanceAlert && !state._firedAlerts[key]) {
    state._firedAlerts[key] = true;
    addAlert('critical', '💳', 'Low Prepaid Balance',
      `Your balance is ${state.settings.currency}${state.balance.toFixed(2)}, below the alert threshold of ${state.settings.currency}${state.settings.lowBalanceAlert}. Top up now.`);
    showToast('💳 Low balance alert!', 'warning');
    updateBillingUI();
  }
}

/**
 * Check for instantaneous power spike
 */
function checkSpike(watts) {
  const avg = state.liveReadings.length > 5
    ? state.liveReadings.slice(0, -1).reduce((a, b) => a + b, 0) / (state.liveReadings.length - 1)
    : 0;
  if (avg === 0) return;

  const mult = { low: 3, medium: 2, high: 1.5 }[state.settings.spikeSensitivity] || 2;
  const now  = Date.now();

  if (watts > avg * mult && (now - state.lastSpikeAlert) > 30000) {
    state.lastSpikeAlert = now;
    addAlert('warning', '📈', 'Power Spike Detected',
      `Unusual spike: ${watts.toFixed(0)}W vs avg ${avg.toFixed(0)}W. Check connected appliances.`);
  }
}

/**
 * Add an alert to the alert list (with dedup by title+hour)
 */
function addAlert(type, icon, title, message) {
  const alert = {
    id: Date.now(),
    type, icon, title, message,
    time: new Date().toLocaleTimeString(),
    read: false,
  };
  state.alerts.unshift(alert);
  if (state.alerts.length > 50) state.alerts.pop();

  renderAlerts();
  updateAlertBadge();
}

/**
 * Render the alerts page
 */
function renderAlerts() {
  const container = document.getElementById('alerts-container');
  if (!container) return;

  if (state.alerts.length === 0) {
    container.innerHTML = '<div class="empty-state">No alerts at this time. ✓</div>';
    return;
  }

  container.innerHTML = state.alerts.map(a => `
    <div class="alert-item ${a.type}" id="alert-${a.id}">
      <span class="alert-icon">${a.icon}</span>
      <div class="alert-body">
        <div class="alert-title">${a.title}</div>
        <div class="alert-msg">${a.message}</div>
        <div class="alert-time">${a.time}</div>
      </div>
      <button class="alert-close" onclick="dismissAlert(${a.id})">✕</button>
    </div>
  `).join('');
}

/**
 * Dismiss a single alert
 */
function dismissAlert(id) {
  state.alerts = state.alerts.filter(a => a.id !== id);
  renderAlerts();
  updateAlertBadge();
}

/**
 * Clear all alerts
 */
function clearAllAlerts() {
  state.alerts = [];
  renderAlerts();
  updateAlertBadge();
}

/**
 * Update the alert badge count in sidebar and topbar
 */
function updateAlertBadge() {
  const count = state.alerts.filter(a => !a.read).length;
  const badge = document.getElementById('alert-badge');
  const notif = document.getElementById('notif-count');

  if (badge) { badge.textContent = count; badge.classList.toggle('hidden', count === 0); }
  if (notif) { notif.textContent = count; notif.classList.toggle('hidden', count === 0); }
}

// ============================================================
// SECTION 12: SETTINGS
// ============================================================

/**
 * Populate settings form from current state
 */
function populateSettingsForm() {
  const s = state.settings;
  setVal('s-tariff-band',    s.tariffBand);
  setVal('s-custom-rate',    s.customRate || '');
  setVal('s-account-type',   s.accountType);
  setVal('s-vat',            s.vat);
  setVal('s-daily-threshold',s.dailyThreshold);
  setVal('s-monthly-threshold', s.monthlyThreshold);
  setVal('s-low-balance',    s.lowBalanceAlert);
  setVal('s-spike-sensitivity', s.spikeSensitivity);
  setVal('s-currency',       s.currency);
  setVal('s-theme',          s.theme);
  setVal('s-interval',       s.interval);

  if (state.user) {
    setVal('s-name',    state.user.name || '');
    setVal('s-email',   state.user.email || '');
    setVal('s-address', state.user.address || '');
    setVal('s-phone',   state.user.phone || '');
  }

  const aiToggle = document.getElementById('s-ai-toggle');
  if (aiToggle) aiToggle.checked = !!s.aiEnabled;
  const soundToggle = document.getElementById('s-sound-toggle');
  if (soundToggle) soundToggle.checked = !!s.soundEnabled;
}

/**
 * Save settings from form to state
 */
function saveSettings() {
  state.settings.tariffBand      = getVal('s-tariff-band');
  state.settings.customRate      = parseFloat(getVal('s-custom-rate')) || null;
  state.settings.accountType     = getVal('s-account-type');
  state.settings.vat             = parseFloat(getVal('s-vat')) || 7.5;
  state.settings.dailyThreshold  = parseFloat(getVal('s-daily-threshold')) || 20;
  state.settings.monthlyThreshold= parseFloat(getVal('s-monthly-threshold')) || 300;
  state.settings.lowBalanceAlert = parseFloat(getVal('s-low-balance')) || 500;
  state.settings.spikeSensitivity= getVal('s-spike-sensitivity');
  state.settings.currency        = getVal('s-currency');
  state.settings.interval        = parseInt(getVal('s-interval')) || 2000;
  state.settings.aiEnabled       = document.getElementById('s-ai-toggle')?.checked ?? true;
  state.settings.soundEnabled    = document.getElementById('s-sound-toggle')?.checked ?? false;

  if (state.user) {
    state.user.name    = getVal('s-name');
    state.user.email   = getVal('s-email');
    state.user.address = getVal('s-address');
    state.user.phone   = getVal('s-phone');
  }

  applyTheme(state.settings.theme);
  populateUserUI();
  startMeterTick(); // Restart with new interval
  updateAllDashboard();
  updateBillingUI();
  saveState();
  showToast('Settings saved successfully!', 'success');
}

/**
 * Reset all settings to defaults
 */
function resetSettings() {
  state.settings = { ...DEFAULT_SETTINGS };
  populateSettingsForm();
  applyTheme(state.settings.theme);
  showToast('Settings reset to defaults', 'info');
}

/**
 * Set theme via settings dropdown
 */
function setTheme(theme) {
  state.settings.theme = theme;
  applyTheme(theme);
}

// ============================================================
// SECTION 13: NAVIGATION
// ============================================================

/**
 * Navigate to a page by name
 */
function navigateTo(pageName, linkEl) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.classList.add('hidden');
  });

  // Show target page
  const target = document.getElementById(`page-${pageName}`);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('active');
  }

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (linkEl) linkEl.classList.add('active');

  // Update page title
  const titles = {
    dashboard:   'Dashboard',
    appliances:  'Appliances',
    billing:     'Billing',
    analytics:   'Analytics',
    'ai-insights': 'AI Insights',
    alerts:      'Alerts',
    settings:    'Settings',
  };
  setText('page-title', titles[pageName] || pageName);

  // Page-specific renders
  if (pageName === 'analytics')   renderAnalyticsCharts();
  if (pageName === 'ai-insights') runAIAnalysis();
  if (pageName === 'appliances')  { renderAppliances(); renderAppliancePieChart(); }
  if (pageName === 'billing')     updateBillingUI();
  if (pageName === 'alerts')      renderAlerts();
  if (pageName === 'dashboard')   { updateAllDashboard(); }

  // Close mobile sidebar
  closeSidebar();
}

// ============================================================
// SECTION 14: UI UTILITIES
// ============================================================

/**
 * Apply theme to document root
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme || 'dark');
  const sel = document.getElementById('s-theme');
  if (sel) sel.value = theme || 'dark';

  // Recreate charts with new theme colors
  setTimeout(() => {
    Object.values(state.charts).forEach(c => { if (c) { try { c.update(); } catch(e) {} } });
  }, 50);
}

/**
 * Toggle between dark and light theme
 */
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  state.settings.theme = next;
  applyTheme(next);
  saveState();
}

/**
 * Toggle mobile sidebar
 */
function toggleSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebar-overlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('visible');
}

function closeSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebar-overlay');
  sidebar.classList.remove('open');
  overlay.classList.remove('visible');
}

/**
 * Show a toast notification
 * @param {string} message
 * @param {'info'|'success'|'error'|'warning'} type
 */
function showToast(message, type = 'info') {
  const icons = { info: 'ℹ', success: '✓', error: '✕', warning: '⚠' };
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => { toast.remove(); }, 3200);
}

/**
 * Populate user info in the sidebar/topbar
 */
function populateUserUI() {
  if (!state.user) return;
  const initials = (state.user.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  setText('nav-name',    state.user.name || 'User');
  setText('nav-meter',   state.user.meterNo || 'MTR-000000');
  setText('nav-avatar',  initials);
  setText('topbar-meter', state.user.meterNo || 'MTR-000000');
}

// ---- Helper functions ----
function setText(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

// ============================================================
// SECTION 15: INITIALIZATION
// ============================================================

/**
 * Bootstrap the application on page load
 */
document.addEventListener('DOMContentLoaded', () => {
  // Try to restore previous session
  const hasSaved = loadState();

  if (hasSaved && state.user) {
    // Auto-login if user was previously logged in
    enterApp();
  } else {
    // Show login screen
    document.getElementById('login-screen').classList.add('active');
  }

  // Seed some startup alerts if no state
  if (state.alerts.length === 0 && state.user) {
    addAlert('info', '👋', 'Welcome to VoltIQ',
      'Your smart meter is connected and monitoring. Check the AI Insights tab for personalized recommendations.');
    addAlert('warning', '⚡', 'Meter Reading Reminder',
      'Your meter reading will be automatically updated every month for billing purposes.');
  }
});

/**
 * Auto-update daily history at midnight (simulate day rollover)
 */
function checkDayRollover() {
  const now  = new Date();
  const key  = now.toDateString();
  if (!state._lastDay) state._lastDay = key;

  if (state._lastDay !== key) {
    state._lastDay = key;
    // Push today's total into history
    state.dailyHistory.push(parseFloat(state.todayKwh.toFixed(2)));
    if (state.dailyHistory.length > 365) state.dailyHistory.shift();

    // Generate new bill entry for postpaid
    if (state.settings.accountType === 'postpaid') {
      const rate = getRate();
      const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
      const monthKey  = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
      const exists    = state.billHistory.find(b => b.key === monthKey);
      if (!exists) {
        state.billHistory.push({
          month: monthName,
          kwh: parseFloat(state.monthKwh.toFixed(2)),
          amount: parseFloat((state.monthKwh * rate).toFixed(2)),
          key: monthKey,
        });
      }
    }

    // Reset today's counter
    state.todayKwh = 0;
    saveState();
  }
}

// Check for day rollover every minute
setInterval(checkDayRollover, 60000);

// Periodic AI analysis every 30 seconds
setInterval(() => {
  if (state.user && state.settings.aiEnabled) {
    // Only if on AI insights page
    const aiPage = document.getElementById('page-ai-insights');
    if (aiPage && aiPage.classList.contains('active')) {
      runAIAnalysis();
    }
  }
}, 30000);
