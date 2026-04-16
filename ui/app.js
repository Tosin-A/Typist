/* ─────────────────────────────────────────────────────────────
   Typist — Frontend Engine
   Electric blue design system · auto-adaptive sessions ·
   per-key error tracking · insights · hand guide · speed test
───────────────────────────────────────────────────────────── */

// ── API bridge ────────────────────────────────────────────────
const API = {
  _call(method, ...args) {
    if (window.pywebview?.api) return window.pywebview.api[method](...args);
    return Promise.resolve(STUBS[method]?.(...args) ?? "{}");
  },
  getSettings()           { return this._call("get_settings"); },
  updateSettings(p)       { return this._call("update_settings", p); },
  startSession()          { return this._call("start_session"); },
  startAdaptiveSession()  { return this._call("start_adaptive_session"); },
  startSpeedTest()        { return this._call("start_speed_test"); },
  finishSession(p)        { return this._call("finish_session", p); },
  getDashboard()          { return this._call("get_dashboard"); },
  getAnalytics()          { return this._call("get_analytics"); },
  quitApp()               { return this._call("quit_app"); },
  minimizeApp()           { return this._call("minimize_app"); },
};

// ── Browser stubs ─────────────────────────────────────────────
const STUBS = {
  get_settings: () => JSON.stringify({
    mode: "sentences", dark_mode: true, sound_enabled: true,
    autostart_enabled: true, custom_text: "",
    text_case: "sentence", punctuation: true, session_length: "medium",
  }),
  start_session: () => JSON.stringify({
    text: "the quick brown fox jumps over the lazy dog and then runs back again quite fast to prove speed matters in typing practice every day for everyone",
    mode: "sentences", difficulty: "intermediate",
    word_count: 29, char_count: 146,
    quote_of_day: "practice makes perfect every single day",
    difficulty_info: { level: "intermediate", label: "Intermediate", avg_wpm: 45, wpm_target: 65, progress_to_next: 45 },
    adapted_for: ["q", "z", "x"],
  }),
  start_adaptive_session: () => JSON.stringify({
    text: "quiz quartz fox vex exact zip axiom quill quote zeal fox quartz vex",
    mode: "adaptive", difficulty: "intermediate",
    word_count: 13, char_count: 68,
    quote_of_day: "focus on what trips you up",
    difficulty_info: { level: "intermediate", label: "Intermediate", avg_wpm: 45, wpm_target: 65, progress_to_next: 45 },
    adapted_for: ["q", "z", "x", "p", "b"],
  }),
  start_speed_test: () => JSON.stringify({
    text: "the quick brown fox jumps over the lazy dog and then runs back again to prove a point about speed and agility in typing practice for all learners who want to improve their words per minute score consistently",
    mode: "speed_test", difficulty: "intermediate",
    word_count: 38, char_count: 207,
    quote_of_day: "speed is skill in motion",
    difficulty_info: { level: "intermediate", label: "Intermediate", avg_wpm: 45, wpm_target: 65 },
    adapted_for: [],
    time_limit: 60,
  }),
  finish_session: () => JSON.stringify({
    ok: true, streak: 7, is_new_best: true, all_time_best: 52,
    progress: [
      { date: "2026-04-10", wpm: 42 }, { date: "2026-04-11", wpm: 45 },
      { date: "2026-04-12", wpm: 43 }, { date: "2026-04-13", wpm: 48 },
      { date: "2026-04-14", wpm: 50 }, { date: "2026-04-15", wpm: 52 },
    ],
  }),
  get_dashboard: () => JSON.stringify({
    streak: 3, last_wpm: 52,
    progress: [
      { date: "2026-04-10", wpm: 42 }, { date: "2026-04-11", wpm: 45 },
      { date: "2026-04-13", wpm: 48 }, { date: "2026-04-14", wpm: 50 }, { date: "2026-04-15", wpm: 52 },
    ],
    difficulty_info: { level: "intermediate", label: "Intermediate", avg_wpm: 47, wpm_target: 65 },
    settings: { mode: "sentences", dark_mode: true, sound_enabled: true, autostart_enabled: true,
                custom_text: "", text_case: "sentence", punctuation: true, session_length: "medium" },
    quote_of_day: "practice makes perfect every single day",
    top_problem_chars: ["q", "z", "x"],
    top_problem_errors: { q: 12, z: 9, x: 7 },
  }),
  get_analytics: () => JSON.stringify({
    key_errors: { q: 12, z: 9, x: 7, p: 6, b: 5, v: 4, y: 3, w: 2 },
    all_key_errors: { q: 12, z: 9, x: 7, p: 6, b: 5, v: 4, y: 3, w: 2 },
    top_problem_chars: ["q", "z", "x", "p", "b", "v"],
    progress: [
      { date: "2026-04-10", wpm: 42 }, { date: "2026-04-11", wpm: 45 },
      { date: "2026-04-13", wpm: 48 }, { date: "2026-04-14", wpm: 50 }, { date: "2026-04-15", wpm: 52 },
    ],
    accuracy_history: [
      { date: "2026-04-10", accuracy: 88 }, { date: "2026-04-11", accuracy: 91 },
      { date: "2026-04-13", accuracy: 89 }, { date: "2026-04-14", accuracy: 93 }, { date: "2026-04-15", accuracy: 95 },
    ],
    difficulty_info: { level: "intermediate", label: "Intermediate", avg_wpm: 47, wpm_target: 65, progress_to_next: 36 },
    total_sessions: 18,
  }),
};

// ── App state ─────────────────────────────────────────────────
let appSettings = {};
let sessionData  = {};
let typingState  = {
  text: "", typed: "",
  startTime: null, timerInterval: null, countdownInterval: null,
  wpm: 0, accuracy: 100, errorCount: 0,
  keyErrors: {},  // { char: count } — actual char expected, not typed
  finished: false,
  isSpeedTest: false, timeLimit: 0,
};

// ── Screen router ─────────────────────────────────────────────
const screens = {
  home:         document.getElementById("screen-home"),
  typing:       document.getElementById("screen-typing"),
  results:      document.getElementById("screen-results"),
  settings:     document.getElementById("screen-settings"),
  analytics:    document.getElementById("screen-analytics"),
  "hand-guide": document.getElementById("screen-hand-guide"),
};

function showScreen(name) {
  Object.values(screens).forEach(s => { s.classList.remove("active"); s.style.display = "none"; });
  const t = screens[name];
  if (!t) return;
  t.style.display = "flex";
  requestAnimationFrame(() => t.classList.add("active"));
}

// ── Sound ─────────────────────────────────────────────────────
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playTone(freq, dur, type = "sine", vol = 0.07) {
  if (!appSettings.sound_enabled) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = type; osc.frequency.value = freq;
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + dur);
  } catch (_) {}
}
const Sound = {
  keystroke() { playTone(780, 0.04, "sine", 0.035); },
  error()     { playTone(200, 0.14, "square", 0.055); },
  complete()  { [520, 655, 780, 1040].forEach((f,i) => setTimeout(() => playTone(f, 0.18, "sine", 0.09), i * 80)); },
};

// ── Chart renderer ────────────────────────────────────────────
function hexToRgba(hex, a) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

function renderChart(canvasId, points, valueKey = "wpm", color = "#4d7de8") {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.offsetWidth || canvas.width;
  const H = canvas.offsetHeight || canvas.height;
  canvas.width = W; canvas.height = H;
  ctx.clearRect(0, 0, W, H);

  if (!points || points.length < 2) {
    ctx.fillStyle = "#3a3228";
    ctx.font = "11px system-ui"; ctx.textAlign = "center";
    ctx.fillText("Not enough data yet", W/2, H/2);
    return;
  }

  const values = points.map(p => p[valueKey] ?? p.wpm);
  const minV = Math.max(0, Math.min(...values) - 5);
  const maxV = Math.max(...values) + 5;
  const pad  = { t: 6, r: 6, b: 22, l: 34 };
  const cW   = W - pad.l - pad.r;
  const cH   = H - pad.t - pad.b;
  const toX  = i => pad.l + (i / (points.length-1)) * cW;
  const toY  = v => pad.t + cH - ((v - minV) / (maxV - minV)) * cH;

  const isDark = document.body.classList.contains("dark");
  ctx.strokeStyle = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  ctx.lineWidth = 1;
  [0, 0.5, 1].forEach(t => {
    const y = pad.t + t * cH;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + cW, y); ctx.stroke();
  });

  const g = ctx.createLinearGradient(0, pad.t, 0, pad.t + cH);
  g.addColorStop(0, hexToRgba(color, 0.28));
  g.addColorStop(1, hexToRgba(color, 0.02));
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(values[0]));
  for (let i = 1; i < points.length; i++) {
    const cp = (toX(i-1) + toX(i)) / 2;
    ctx.bezierCurveTo(cp, toY(values[i-1]), cp, toY(values[i]), toX(i), toY(values[i]));
  }
  ctx.lineTo(toX(points.length-1), pad.t + cH);
  ctx.lineTo(toX(0), pad.t + cH);
  ctx.closePath();
  ctx.fillStyle = g; ctx.fill();

  ctx.beginPath();
  ctx.moveTo(toX(0), toY(values[0]));
  for (let i = 1; i < points.length; i++) {
    const cp = (toX(i-1) + toX(i)) / 2;
    ctx.bezierCurveTo(cp, toY(values[i-1]), cp, toY(values[i]), toX(i), toY(values[i]));
  }
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();

  points.forEach((p, i) => {
    ctx.beginPath(); ctx.arc(toX(i), toY(values[i]), 3, 0, Math.PI*2);
    ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = isDark ? "#0a0e1a" : "#f0f2f8"; ctx.lineWidth = 1.5; ctx.stroke();
  });

  const dimColor = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)";
  ctx.fillStyle = dimColor; ctx.font = "10px system-ui";
  ctx.textAlign = "right"; ctx.fillText(Math.round(maxV), pad.l-3, pad.t+6);
  ctx.fillText(Math.round(minV), pad.l-3, pad.t+cH+2);
  ctx.textAlign = "left";  ctx.fillText(points[0].date.slice(5), pad.l, H-4);
  ctx.textAlign = "right"; ctx.fillText(points[points.length-1].date.slice(5), pad.l+cW, H-4);
}

// ── Typing text renderer ───────────────────────────────────────
function renderTypingText(text, typed) {
  const el = document.getElementById("typing-text");
  if (!el) return;
  el.innerHTML = text.split("").map((ch, i) => {
    let cls = i < typed.length ? (typed[i] === ch ? "char-correct" : "char-wrong")
            : i === typed.length ? "char-cursor" : "char-pending";
    const esc = ch === "<" ? "&lt;" : ch === ">" ? "&gt;" : ch === "&" ? "&amp;" : ch === " " ? "&#32;" : ch;
    return `<span class="${cls}">${esc}</span>`;
  }).join("");
  el.querySelector(".char-cursor")?.scrollIntoView({ block: "nearest" });
}

// ── WPM/accuracy ───────────────────────────────────────────────
function computeStats(text, typed, elapsedMs) {
  const mins = Math.max(elapsedMs / 60000, 0.0001);
  const wpm  = Math.round((typed.length / 5) / mins);
  let errors = 0;
  for (let i = 0; i < typed.length; i++) if (typed[i] !== text[i]) errors++;
  const accuracy = typed.length === 0 ? 100
    : Math.round(((typed.length - errors) / typed.length) * 100);
  return { wpm: Math.max(0, wpm), accuracy: Math.max(0, accuracy), errorCount: errors };
}

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
}

// ── Keyboard SVG ───────────────────────────────────────────────
const KB = {
  rows: [
    ['`','1','2','3','4','5','6','7','8','9','0','-','='],
    ['Q','W','E','R','T','Y','U','I','O','P','[',']','\\'],
    ['A','S','D','F','G','H','J','K','L',';',"'"],
    ['Z','X','C','V','B','N','M',',','.','/'],
  ],
  offsets: [0, 0.5, 0.75, 1.25],
  fingerMap: {
    L_PINKY:  ['`','1','Q','A','Z'],
    L_RING:   ['2','W','S','X'],
    L_MIDDLE: ['3','E','D','C'],
    L_INDEX:  ['4','5','R','T','F','G','V','B'],
    R_INDEX:  ['6','7','Y','U','H','J','N','M'],
    R_MIDDLE: ['8','I','K',','],
    R_RING:   ['9','O','L','.'],
    R_PINKY:  ['0','-','=','P','[',']','\\',';',"'",'/'],
  },
  // Cool-toned palette; right index uses app accent (electric blue)
  colors: {
    L_PINKY:  '#a78bfa',
    L_RING:   '#818cf8',
    L_MIDDLE: '#22d3ee',
    L_INDEX:  '#4ade80',
    R_INDEX:  '#4d7de8',  // ← app accent color
    R_MIDDLE: '#fb923c',
    R_RING:   '#f87171',
    R_PINKY:  '#e879f9',
  },
  labels: {
    L_PINKY:  'L. Pinky',
    L_RING:   'L. Ring',
    L_MIDDLE: 'L. Middle',
    L_INDEX:  'L. Index',
    R_INDEX:  'R. Index',
    R_MIDDLE: 'R. Middle',
    R_RING:   'R. Ring',
    R_PINKY:  'R. Pinky',
  },
};

// Build char → finger lookup once
const KEY_FINGER = {};
for (const [finger, keys] of Object.entries(KB.fingerMap)) {
  for (const k of keys) KEY_FINGER[k.toUpperCase()] = finger;
}

const HOME_KEYS = new Set(['A','S','D','F','J','K','L',';']);

function renderKeyboardSVG(containerId, problemKeys = []) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const KW = 35, KH = 35, GAP = 4, PITCH = KW + GAP;
  const problems = new Set((problemKeys || []).map(k => k.toUpperCase()));
  const isDark   = document.body.classList.contains("dark");
  const textClr  = isDark ? "#e8e0d8" : "#1a0f08";

  let rects = [];
  KB.rows.forEach((row, ri) => {
    const xOff = KB.offsets[ri] * PITCH;
    row.forEach((key, ki) => {
      const x      = Math.round(xOff + ki * PITCH);
      const y      = ri * PITCH;
      const finger = KEY_FINGER[key.toUpperCase()];
      const clr    = finger ? KB.colors[finger] : '#94a3b8';
      const isProblem = problems.has(key.toUpperCase());
      const isHome    = HOME_KEYS.has(key.toUpperCase());
      const fillOp    = isProblem ? 0.30 : 0.12;
      const stroke    = isProblem ? '#f87171' : clr;
      const sw        = isProblem ? 2.5 : isHome ? 1.8 : 1;
      const label     = key.length > 1 ? key.slice(0,2) : key;

      rects.push(`
        <rect x="${x}" y="${y}" width="${KW}" height="${KH}" rx="5"
          fill="${clr}" fill-opacity="${fillOp}"
          stroke="${stroke}" stroke-width="${sw}"/>
        ${isHome && !isProblem ? `<circle cx="${x+KW/2}" cy="${y+KH-6}" r="2.5" fill="${clr}" opacity="0.65"/>` : ''}
        ${isProblem ? `<circle cx="${x+KW-5}" cy="${y+5}" r="4" fill="#f87171" opacity="0.9"/>` : ''}
        <text x="${x+KW/2}" y="${y+KH/2+5}" text-anchor="middle"
          font-size="${label.length > 1 ? 9 : 12}"
          font-family="'JetBrains Mono',monospace"
          font-weight="${isProblem ? '700' : '500'}"
          fill="${isProblem ? '#f87171' : textClr}">${label}</text>
      `);
    });
  });

  // Space bar
  const spY  = 4 * PITCH, spX = Math.round(2.5 * PITCH), spW = 7 * PITCH - GAP;
  rects.push(`
    <rect x="${spX}" y="${spY}" width="${spW}" height="${KH}" rx="5"
      fill="#94a3b8" fill-opacity="0.08" stroke="#94a3b8" stroke-width="1"/>
    <text x="${spX+spW/2}" y="${spY+KH/2+5}" text-anchor="middle"
      font-size="10" font-family="'Manrope',system-ui" fill="${textClr}" opacity="0.45">SPACE</text>
  `);

  const svgW = Math.round(13*PITCH + Math.max(...KB.offsets)*PITCH + 12);
  const svgH = 5*PITCH + 2;
  container.innerHTML = `
    <svg viewBox="0 0 ${svgW} ${svgH}" width="100%" style="max-width:580px;display:block;margin:auto">
      <g transform="translate(3,3)">${rects.join('')}</g>
    </svg>`;
}

function renderFingerLegend(containerId, problemKeys = []) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const ps = new Set((problemKeys || []).map(k => k.toUpperCase()));
  const problemFingers = new Set();
  for (const k of ps) if (KEY_FINGER[k]) problemFingers.add(KEY_FINGER[k]);

  el.innerHTML = Object.entries(KB.labels).map(([finger, label]) => `
    <div class="legend-item">
      <div class="legend-dot" style="background:${KB.colors[finger]}"></div>
      <span>${label}</span>
      ${problemFingers.has(finger) ? '<span class="legend-warn">needs work</span>' : ''}
    </div>
  `).join('');
}

// ── Home screen ────────────────────────────────────────────────
async function initHome() {
  // Time-of-day greeting
  const greetEl = document.getElementById("time-greeting");
  if (greetEl) greetEl.textContent = getTimeGreeting();

  try {
    const raw  = await API.getDashboard();
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;

    document.getElementById("home-streak").textContent = data.streak || 0;
    document.getElementById("home-wpm").textContent    = data.last_wpm > 0 ? data.last_wpm : "—";
    document.getElementById("home-level").textContent  = data.difficulty_info?.label ?? "—";
    const qEl = document.getElementById("home-quote");
    if (qEl) qEl.querySelector(".quote-text").textContent = data.quote_of_day || "…";

    appSettings = data.settings || {};
    applyTheme(appSettings.dark_mode !== false);

    // Focus strip — problem keys with error counts
    const errors   = data.top_problem_errors || {};
    const chars    = data.top_problem_chars || [];
    const strip    = document.getElementById("focus-strip");
    const keysRow  = document.getElementById("focus-keys-row");
    if (chars.length > 0) {
      keysRow.innerHTML = chars.map(k => {
        const count = errors[k] || "";
        return `<span class="focus-key-chip">${k}${count ? `<span class="chip-count">×${count}</span>` : ''}</span>`;
      }).join("");
      strip.style.display = "flex";
    } else {
      strip.style.display = "none";
    }

    const progress = data.progress || [];
    const empty    = document.getElementById("chart-empty");
    if (progress.length < 2) {
      empty.style.display = "block";
    } else {
      empty.style.display = "none";
      requestAnimationFrame(() => renderChart("progress-chart", progress));
    }
  } catch (err) {
    console.error("initHome:", err);
  }
}

// ── Session start ──────────────────────────────────────────────
async function startSession(mode = "normal") {
  try {
    let raw;
    if (mode === "adaptive")   raw = await API.startAdaptiveSession();
    else if (mode === "speed") raw = await API.startSpeedTest();
    else                       raw = await API.startSession();

    sessionData = typeof raw === "string" ? JSON.parse(raw) : raw;
    const isSpeed = sessionData.mode === "speed_test";
    const adapted = (sessionData.adapted_for || []);

    typingState = {
      text: sessionData.text,
      typed: "",
      startTime: null, timerInterval: null, countdownInterval: null,
      wpm: 0, accuracy: 100, errorCount: 0,
      keyErrors: {},
      finished: false,
      isSpeedTest: isSpeed,
      timeLimit: sessionData.time_limit || 0,
    };

    // Badges
    const modeLabel = { speed_test: "speed test", adaptive: "adaptive", sentences: "sentences",
                        common: "words", programming: "code", custom: "custom" };
    document.getElementById("typing-mode-badge").textContent       = modeLabel[sessionData.mode] || sessionData.mode;
    document.getElementById("typing-difficulty-badge").textContent = sessionData.difficulty;

    const adaptedBadge = document.getElementById("typing-adapted-badge");
    if (adapted.length > 0 && sessionData.mode !== "speed_test") {
      adaptedBadge.title   = `Adapted for: ${adapted.join(", ")}`;
      adaptedBadge.style.display = "inline-flex";
    } else {
      adaptedBadge.style.display = "none";
    }

    document.getElementById("live-wpm").textContent  = "0";
    document.getElementById("live-acc").textContent  = "100";
    document.getElementById("live-time").textContent = "0:00";
    document.getElementById("typing-progress-fill").style.width = "0%";
    document.getElementById("cursor-hint").style.opacity = "1";

    const countdownWrap = document.getElementById("live-countdown-wrap");
    const countdownEl   = document.getElementById("live-countdown");
    if (isSpeed) {
      countdownWrap.style.display = "flex";
      countdownEl.textContent     = sessionData.time_limit;
      countdownEl.className       = "live-val countdown-val";
    } else {
      countdownWrap.style.display = "none";
    }

    renderTypingText(typingState.text, "");
    showScreen("typing");
    setTimeout(() => {
      const inp = document.getElementById("typing-input");
      inp.value = "";
      inp.focus();
      resetIdleTimer();
    }, 80);

  } catch (err) {
    console.error("startSession:", err);
  }
}

// ── Typing input handler ───────────────────────────────────────
function handleTypingInput(e) {
  if (typingState.finished) return;
  const input = e.target;
  const typed  = input.value;
  resetIdleTimer();

  if (typed.length === 1) document.getElementById("cursor-hint").style.opacity = "0";

  if (!typingState.startTime && typed.length > 0) {
    typingState.startTime    = Date.now();
    typingState.timerInterval = setInterval(updateLiveTimer, 200);

    if (typingState.isSpeedTest && typingState.timeLimit > 0) {
      let remaining = typingState.timeLimit;
      typingState.countdownInterval = setInterval(() => {
        remaining--;
        const el = document.getElementById("live-countdown");
        if (el) {
          el.textContent = remaining;
          if (remaining <= 10) el.classList.add("urgent");
        }
        if (remaining <= 0) finishSession();
      }, 1000);
    }
  }

  const prev   = typingState.typed;
  const isNew  = typed.length > prev.length;
  if (isNew) {
    const expected = typingState.text[typed.length - 1];
    const actual   = typed[typed.length - 1];
    if (actual !== expected) {
      // Record the key that was SUPPOSED to be pressed
      if (expected && expected !== " ") {
        typingState.keyErrors[expected] = (typingState.keyErrors[expected] || 0) + 1;
      }
      Sound.error();
    } else {
      Sound.keystroke();
      // Flash gold if this was an adapted problem key typed correctly
      flashProblemKeyCorrect(expected);
    }
  }

  typingState.typed = typed;
  renderTypingText(typingState.text, typed);

  const elapsed = typingState.startTime ? Date.now() - typingState.startTime : 0;
  const stats   = computeStats(typingState.text, typed, elapsed);
  typingState.wpm        = stats.wpm;
  typingState.accuracy   = stats.accuracy;
  typingState.errorCount = stats.errorCount;

  document.getElementById("live-wpm").textContent = stats.wpm;
  document.getElementById("live-acc").textContent = stats.accuracy;
  document.getElementById("typing-progress-fill").style.width =
    `${Math.min(100, (typed.length / typingState.text.length) * 100)}%`;

  // Normal sessions complete on text end; speed tests complete on timer
  if (!typingState.isSpeedTest && typed.length >= typingState.text.length) finishSession();
}

function updateLiveTimer() {
  if (!typingState.startTime || typingState.finished) return;
  document.getElementById("live-time").textContent = formatTime(Date.now() - typingState.startTime);
}

// ── Finish session ─────────────────────────────────────────────
async function finishSession() {
  if (typingState.finished) return;
  typingState.finished = true;
  clearInterval(typingState.timerInterval);
  clearInterval(typingState.countdownInterval);
  Sound.complete();

  const elapsed = typingState.startTime ? Date.now() - typingState.startTime : 0;
  const stats   = computeStats(typingState.text, typingState.typed, elapsed);

  const payload = JSON.stringify({
    wpm:        stats.wpm,
    accuracy:   stats.accuracy,
    time_s:     Math.round(elapsed / 1000),
    errors:     stats.errorCount,
    mode:       sessionData.mode,
    difficulty: sessionData.difficulty,
    key_errors: typingState.keyErrors,
  });

  try {
    const raw    = await API.finishSession(payload);
    const result = typeof raw === "string" ? JSON.parse(raw) : raw;

    // Results screen
    const titles = { speed_test: "Speed Test Result", adaptive: "Adaptive Session Done" };
    document.getElementById("results-title").textContent = titles[sessionData.mode] || "Session Complete";
    document.getElementById("results-streak-badge").textContent = `🔥 ${result.streak || 0} day streak`;

    // Animate stats in
    const wpmEl    = document.getElementById("res-wpm");
    const accEl    = document.getElementById("res-acc");
    const timeEl   = document.getElementById("res-time");
    const errEl    = document.getElementById("res-errors");
    wpmEl.textContent  = "0";
    accEl.textContent  = "0%";
    timeEl.textContent = "0s";
    errEl.textContent  = "0";

    renderSessionFaults(typingState.keyErrors);
    showScreen("results");

    // Stagger count-up animations
    setTimeout(() => animateCount(wpmEl, stats.wpm), 80);
    setTimeout(() => animateCount(accEl, stats.accuracy, "%"), 180);
    setTimeout(() => {
      const elapsed_s = Math.round(elapsed / 1000);
      animateCount(timeEl, elapsed_s, "s");
    }, 280);
    setTimeout(() => animateCount(errEl, stats.errorCount), 360);

    // New best badge
    const bestBadge = document.getElementById("new-best-badge");
    if (bestBadge) {
      bestBadge.style.display = result.is_new_best ? "inline-flex" : "none";
    }

    // Flawless glow on accuracy cell
    const accItem = accEl?.closest(".score-item");
    if (stats.accuracy === 100 && accItem) accItem.classList.add("flawless");
    else accItem?.classList.remove("flawless");

    // Streak milestone
    const milestoneEl = document.getElementById("streak-milestone-msg");
    if (milestoneEl) {
      const msg = getStreakMessage(result.streak || 0);
      milestoneEl.textContent = msg || "";
      milestoneEl.style.display = msg ? "block" : "none";
    }

    // Confetti on new best or perfect accuracy
    if (result.is_new_best || stats.accuracy === 100) {
      setTimeout(launchConfetti, 400);
    }

    setTimeout(() => {
      const canvas = document.getElementById("results-chart");
      if (canvas) canvas.style.opacity = "0";
      renderChart("results-chart", result.progress || []);
      setTimeout(() => { if (canvas) canvas.style.opacity = "1"; }, 60);
    }, 50);

  } catch (err) {
    console.error("finishSession:", err);
    showScreen("results");
  }
}

function renderSessionFaults(keyErrors) {
  const block     = document.getElementById("session-faults");
  const keysEl    = document.getElementById("faults-keys");
  const sorted    = Object.entries(keyErrors || {}).sort((a,b) => b[1]-a[1]).slice(0, 8);
  if (!sorted.length) { block.style.display = "none"; return; }

  const max = sorted[0][1];
  block.style.display = "flex";
  keysEl.innerHTML = sorted.map(([ch, count]) => {
    const ratio = count / max;
    const cls   = ratio > 0.6 ? "high" : ratio > 0.3 ? "med" : "low";
    return `<span class="fault-key-chip ${cls}">${ch}<span class="chip-count">×${count}</span></span>`;
  }).join("");
}

// ── Settings screen ────────────────────────────────────────────
async function initSettings() {
  try {
    const raw = await API.getSettings();
    const s   = typeof raw === "string" ? JSON.parse(raw) : raw;
    appSettings = s;

    // Mode
    document.querySelectorAll("#mode-grid .option-btn").forEach(b =>
      b.classList.toggle("active", b.dataset.mode === s.mode));
    toggleCustomTextArea(s.mode === "custom");
    document.getElementById("custom-text-input").value = s.custom_text || "";

    // Case
    document.querySelectorAll("#case-grid .option-btn").forEach(b =>
      b.classList.toggle("active", b.dataset.case === (s.text_case || "sentence")));

    // Length
    document.querySelectorAll("#length-grid .option-btn").forEach(b =>
      b.classList.toggle("active", b.dataset.length === (s.session_length || "medium")));

    // Toggles
    document.getElementById("toggle-punctuation").checked  = s.punctuation !== false;
    document.getElementById("toggle-dark").checked         = s.dark_mode !== false;
    document.getElementById("toggle-sound").checked        = s.sound_enabled !== false;
    document.getElementById("toggle-autostart").checked    = s.autostart_enabled !== false;
    document.getElementById("settings-saved-msg").classList.remove("show");
  } catch (err) { console.error("initSettings:", err); }
}

function toggleCustomTextArea(show) {
  document.getElementById("custom-text-input").style.display = show ? "block" : "none";
}

async function saveSettings() {
  const mode   = document.querySelector("#mode-grid .option-btn.active")?.dataset.mode || "sentences";
  const textCase = document.querySelector("#case-grid .option-btn.active")?.dataset.case || "sentence";
  const length = document.querySelector("#length-grid .option-btn.active")?.dataset.length || "medium";

  const payload = JSON.stringify({
    mode,
    custom_text:       document.getElementById("custom-text-input").value,
    text_case:         textCase,
    session_length:    length,
    punctuation:       document.getElementById("toggle-punctuation").checked,
    dark_mode:         document.getElementById("toggle-dark").checked,
    sound_enabled:     document.getElementById("toggle-sound").checked,
    autostart_enabled: document.getElementById("toggle-autostart").checked,
  });

  try {
    const raw    = await API.updateSettings(payload);
    const result = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (result.ok !== false) {
      appSettings = JSON.parse(payload);
      applyTheme(appSettings.dark_mode);
      const msg = document.getElementById("settings-saved-msg");
      msg.classList.add("show");
      setTimeout(() => msg.classList.remove("show"), 2200);
    }
  } catch (err) { console.error("saveSettings:", err); }
}

// ── Analytics ──────────────────────────────────────────────────
async function initAnalytics() {
  const body = document.getElementById("analytics-body");
  body.innerHTML = '<div class="loading-state">Loading insights…</div>';
  try {
    const raw  = await API.getAnalytics();
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    renderAnalytics(data, body);
  } catch (err) {
    body.innerHTML = '<div class="loading-state">Could not load data.</div>';
    console.error("initAnalytics:", err);
  }
}

function renderAnalytics(data, body) {
  const info       = data.difficulty_info || {};
  const keyErrors  = data.key_errors || {};
  const progress   = data.progress || [];
  const total      = data.total_sessions || 0;
  const lastWpm    = progress.length ? progress[progress.length-1].wpm : 0;
  const topChars   = data.top_problem_chars || [];
  const progressPct = info.progress_to_next || 0;

  const errorEntries = Object.entries(keyErrors).sort((a,b) => b[1]-a[1]);
  const maxErr       = errorEntries[0]?.[1] || 1;

  const errorBars = !errorEntries.length
    ? `<div class="no-errors-msg">No errors recorded yet — keep practicing!</div>`
    : errorEntries.slice(0, 10).map(([ch, count]) => {
        const pct   = Math.round((count / maxErr) * 100);
        const ratio = count / maxErr;
        const color = ratio > 0.6 ? '#f87171' : ratio > 0.3 ? '#f59e0b' : '#4d7de8';
        return `
          <div class="error-row">
            <div class="error-char">${ch}</div>
            <div class="error-bar-wrap">
              <div class="error-bar-fill" style="width:${pct}%;background:${color}"></div>
            </div>
            <div class="error-count">×${count}</div>
          </div>`;
      }).join('');

  body.innerHTML = `
    <div class="analytics-stats-row">
      <div class="analytics-stat">
        <span class="analytics-stat-val" style="color:var(--accent)">${lastWpm || '—'}</span>
        <span class="analytics-stat-lbl">Avg WPM</span>
      </div>
      <div class="analytics-stat">
        <span class="analytics-stat-val">${total}</span>
        <span class="analytics-stat-lbl">Sessions</span>
      </div>
      <div class="analytics-stat">
        <span class="analytics-stat-val" style="color:var(--green)">${topChars.length || 0}</span>
        <span class="analytics-stat-lbl">Keys to improve</span>
      </div>
    </div>

    <div class="setting-section">
      <div class="setting-section-title">Current Level</div>
      <div class="level-block">
        <div class="level-block-top">
          <span class="level-name">${info.label || '—'}</span>
          <span class="level-target">Target: ${info.wpm_target || '?'} WPM</span>
        </div>
        <div class="level-bar">
          <div class="level-bar-fill" style="width:${progressPct}%"></div>
        </div>
        <span class="level-pct">${progressPct}% to next level · avg ${info.avg_wpm || 0} WPM</span>
      </div>
    </div>

    <div class="setting-section">
      <div class="setting-section-title">Error Heatmap — keys that trip you up most</div>
      <div class="error-list">${errorBars}</div>
    </div>

    ${progress.length >= 2 ? `
    <div class="setting-section">
      <div class="setting-section-title">WPM Trend</div>
      <div class="analytics-chart-wrap">
        <canvas id="analytics-chart" height="80"></canvas>
      </div>
    </div>` : ''}

    ${topChars.length > 0 ? `
    <div class="setting-section">
      <div class="setting-section-title">Auto-adaptation — these keys are woven into every session</div>
      <div class="focus-strip" style="display:flex">
        <span class="focus-strip-label">Focus keys</span>
        <div class="focus-keys">
          ${topChars.map(k => {
            const c = (data.key_errors || {})[k] || '';
            return `<span class="focus-key-chip">${k}${c ? `<span class="chip-count">×${c}</span>` : ''}</span>`;
          }).join('')}
        </div>
      </div>
    </div>` : ''}
  `;

  if (progress.length >= 2) {
    setTimeout(() => renderChart("analytics-chart", progress), 50);
  }
}

// ── Hand guide ─────────────────────────────────────────────────
async function initHandGuide() {
  let problemKeys = [];
  try {
    const raw  = await API.getDashboard();
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    problemKeys = data.top_problem_chars || [];
  } catch (_) {}
  renderKeyboardSVG("keyboard-svg-container", problemKeys);
  renderFingerLegend("finger-legend", problemKeys);
}

// ── Theme ──────────────────────────────────────────────────────
function applyTheme(dark) {
  document.body.classList.toggle("dark",  dark !== false);
  document.body.classList.toggle("light", dark === false);
}

// ── Keyboard shortcuts ─────────────────────────────────────────
document.addEventListener("keydown", e => {
  const current = Object.entries(screens).find(([, s]) => s.classList.contains("active"))?.[0];
  if (e.key === "Escape") {
    if (current === "typing") {
      if (confirm("Skip this session?")) {
        clearInterval(typingState.timerInterval);
        clearInterval(typingState.countdownInterval);
        typingState.finished = true;
        showScreen("home");
      } else {
        document.getElementById("typing-input").focus();
      }
    } else if (["settings","analytics","hand-guide"].includes(current)) {
      showScreen("home");
      initHome();
    }
  }
});

// ── Bind UI events ─────────────────────────────────────────────
function bindEvents() {
  // HOME
  document.getElementById("btn-start").addEventListener("click", () => startSession("normal"));
  document.getElementById("btn-adaptive").addEventListener("click", () => startSession("adaptive"));
  document.getElementById("btn-speed-test").addEventListener("click", () => startSession("speed"));
  document.getElementById("btn-skip").addEventListener("click", () => {
    if (confirm("Skip today?")) API.quitApp();
  });
  document.getElementById("btn-settings-open").addEventListener("click", () => {
    initSettings(); showScreen("settings");
  });
  document.getElementById("btn-analytics-open").addEventListener("click", () => {
    showScreen("analytics"); initAnalytics();
  });
  document.getElementById("btn-hand-guide-open").addEventListener("click", () => {
    showScreen("hand-guide"); initHandGuide();
  });

  // TYPING
  document.getElementById("typing-input").addEventListener("input", handleTypingInput);
  document.getElementById("btn-escape").addEventListener("click", () => {
    if (confirm("Skip this session?")) {
      clearInterval(typingState.timerInterval);
      clearInterval(typingState.countdownInterval);
      typingState.finished = true;
      showScreen("home");
    } else {
      document.getElementById("typing-input").focus();
    }
  });

  // RESULTS
  document.getElementById("btn-practice-again").addEventListener("click", () => startSession("normal"));
  document.getElementById("btn-practice-adaptive").addEventListener("click", () => startSession("adaptive"));
  document.getElementById("btn-go-home").addEventListener("click", () => {
    showScreen("home"); initHome();
  });

  // SETTINGS — option button groups
  document.querySelectorAll("#mode-grid .option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#mode-grid .option-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      toggleCustomTextArea(btn.dataset.mode === "custom");
    });
  });
  document.querySelectorAll("#case-grid .option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#case-grid .option-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
  document.querySelectorAll("#length-grid .option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#length-grid .option-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
  document.getElementById("btn-save-settings").addEventListener("click", saveSettings);
  document.getElementById("btn-settings-back").addEventListener("click", () => {
    showScreen("home"); initHome();
  });

  // ANALYTICS / HAND GUIDE back
  document.getElementById("btn-analytics-back").addEventListener("click", () => {
    showScreen("home"); initHome();
  });
  document.getElementById("btn-hand-guide-back").addEventListener("click", () => showScreen("home"));

  // Live toggles
  document.getElementById("toggle-sound").addEventListener("change", e => {
    appSettings.sound_enabled = e.target.checked;
  });
  document.getElementById("toggle-dark").addEventListener("change", e => {
    applyTheme(e.target.checked);
  });
}

// ── Delight: time-of-day greeting ─────────────────────────────
function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return "Late night session";
  if (h < 12) return "Morning warmup";
  if (h < 17) return "Afternoon practice";
  if (h < 21) return "Evening drill";
  return "Night owl mode";
}

// ── Delight: streak milestone messages ────────────────────────
function getStreakMessage(streak) {
  if (streak >= 30) return "30 days straight. You've built something real.";
  if (streak >= 14) return "Two weeks in. This is becoming who you are.";
  if (streak >= 7)  return "One full week. The habit is forming.";
  if (streak >= 3)  return "Three days running. Keep going.";
  return null;
}

// ── Delight: count-up animation ───────────────────────────────
function animateCount(el, target, suffix = '', duration = 700) {
  if (!el) return;
  const start     = parseFloat(el.textContent) || 0;
  const startTime = performance.now();
  function step(now) {
    const t = Math.min((now - startTime) / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - t, 3);
    const value = Math.round(start + (target - start) * eased);
    el.textContent = value + suffix;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── Delight: confetti burst ───────────────────────────────────
function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.opacity = "1";

  // Blue-spectrum particle palette
  const colors = ['#4d7de8','#7ba4f0','#a5c0f8','#ffffff','#818cf8','#22d3ee','#93c5fd'];
  const particles = Array.from({ length: 90 }, () => ({
    x: canvas.width * 0.5 + (Math.random() - 0.5) * 160,
    y: canvas.height * 0.38,
    vx: (Math.random() - 0.5) * 9,
    vy: -(Math.random() * 8 + 4),
    w:  Math.random() * 8 + 4,
    h:  Math.random() * 5 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.25,
    life: 1,
    decay: Math.random() * 0.012 + 0.008,
  }));

  let frame;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of particles) {
      p.x   += p.vx;
      p.vy  += 0.22;
      p.y   += p.vy;
      p.rot += p.spin;
      p.life -= p.decay;
      if (p.life <= 0) continue;
      alive = true;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (alive) {
      frame = requestAnimationFrame(draw);
    } else {
      canvas.style.opacity = "0";
    }
  }
  cancelAnimationFrame(frame);
  draw();
}

// ── Delight: idle cursor breathing ───────────────────────────
let _idleTimer = null;
function resetIdleTimer() {
  clearTimeout(_idleTimer);
  const inp = document.getElementById("typing-input");
  if (!inp) return;
  inp.classList.remove("cursor-idle");
  _idleTimer = setTimeout(() => {
    if (!typingState.finished && !typingState.startTime) {
      inp.classList.add("cursor-idle");
    }
  }, 2000);
}

// ── Delight: problem key correct flash ───────────────────────
function flashProblemKeyCorrect(char) {
  const spans = document.querySelectorAll("#typing-text .char-correct");
  // Flash the most recently correct span if it matches a problem char
  const adapted = new Set((sessionData.adapted_for || []).map(c => c.toLowerCase()));
  if (!adapted.has(char?.toLowerCase())) return;
  const last = spans[spans.length - 1];
  if (!last) return;
  last.classList.add("char-problem-correct");
  setTimeout(() => last.classList.remove("char-problem-correct"), 600);
}

// ── Boot ───────────────────────────────────────────────────────
function boot() {
  bindEvents();
  applyTheme(true);
  showScreen("home");
  initHome();

  // Console easter egg
  console.log(
    "%cTypist",
    "font-size:28px;font-weight:900;color:#4d7de8;font-family:'Manrope',system-ui",
  );
  console.log("%cBuilt for people who type with intent.", "color:#7ba4f0;font-size:13px");
}

window.addEventListener("pywebviewready", boot);
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => { if (!window.pywebview) boot(); });
} else {
  if (!window.pywebview) boot();
}
