/* ─────────────────────────────────────────────────────────────
   Typist 2.0 — Frontend Engine
   Sidebar nav · Onboarding · Learn/Curriculum · Gamification
   Leaderboard · Profile · Adaptive sessions · Key drill
───────────────────────────────────────────────────────────── */

// ── API bridge ────────────────────────────────────────────────
const API = {
  _call(method, ...args) {
    if (window.pywebview?.api) return window.pywebview.api[method](...args);
    return Promise.resolve(STUBS[method]?.(...args) ?? "{}");
  },
  getSettings()              { return this._call("get_settings"); },
  updateSettings(p)          { return this._call("update_settings", p); },
  startSession()             { return this._call("start_session"); },
  startAdaptiveSession()     { return this._call("start_adaptive_session"); },
  startSpeedTest()           { return this._call("start_speed_test"); },
  startKeyDrill(p)           { return this._call("start_key_drill", p); },
  finishSession(p)           { return this._call("finish_session", p); },
  getDashboard()             { return this._call("get_dashboard"); },
  getAnalytics()             { return this._call("get_analytics"); },
  quitApp()                  { return this._call("quit_app"); },
  minimizeApp()              { return this._call("minimize_app"); },
  // v2
  getUser()                  { return this._call("get_user"); },
  setUsername(p)             { return this._call("set_username", p); },
  completeOnboarding(p)      { return this._call("complete_onboarding", p); },
  getCurriculum()            { return this._call("get_curriculum"); },
  startLesson(p)             { return this._call("start_lesson", p); },
  getGamification()          { return this._call("get_gamification"); },
  getProfile()               { return this._call("get_profile"); },
  getLeaderboard(p)          { return this._call("get_leaderboard", p); },
  addFriend(p)               { return this._call("add_friend", p); },
  searchUsers(p)             { return this._call("search_users", p); },
  checkForUpdate()           { return this._call("check_for_update"); },
  openReleasesPage()         { return this._call("open_releases_page"); },
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
  start_lesson: (payload) => {
    const p = JSON.parse(payload);
    return JSON.stringify({
      text: "the quick brown fox jumps over the lazy dog and we practice with great care",
      mode: "sentences", difficulty: "intermediate",
      word_count: 15, char_count: 75,
      quote_of_day: "every lesson builds the foundation",
      difficulty_info: { level: "beginner", label: "Beginner", avg_wpm: 20, wpm_target: 25 },
      adapted_for: [],
      lesson_id: p.lesson_id,
      lesson_title: "Home Row Heroes",
      target_wpm: 25,
    });
  },
  finish_session: () => JSON.stringify({
    ok: true, streak: 7, is_new_best: true, all_time_best: 52,
    xp_earned: 48, xp_total: 248, level: 2, rank: "Novice",
    level_progress: { level: 2, xp_in_level: 98, xp_to_next: 150, pct: 65 },
    new_badges: [],
    lesson_result: null,
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
  start_key_drill: (payload) => {
    const keys = JSON.parse(payload).keys || [];
    const tokens = keys.flatMap(k =>
      ['a','e','i','o','u','s','t','n','r','h'].map(c => c !== k ? `${k}${c} ${c}${k}` : '')
    ).filter(Boolean);
    const text = (keys.join(' ') + ' ' + tokens.join(' ')).trim().toLowerCase().slice(0, 180);
    return JSON.stringify({
      text: text || 'qa aq qe eq qi iq qo oq qu uq qaq qeq qiq',
      mode: 'key_drill', difficulty: 'intermediate',
      word_count: 30, char_count: 180,
      quote_of_day: 'precision beats speed',
      difficulty_info: { level: 'intermediate', label: 'Intermediate', avg_wpm: 45, wpm_target: 65, progress_to_next: 45 },
      adapted_for: keys,
    });
  },
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
    ],
    difficulty_info: { level: "intermediate", label: "Intermediate", avg_wpm: 47, wpm_target: 65, progress_to_next: 36 },
    total_sessions: 18,
  }),
  get_user: () => JSON.stringify({
    username: null, device_id: "stub-device", friend_code: "ABC123",
    onboarded: false, baseline_wpm: 0, supabase_id: null,
  }),
  set_username: (p) => {
    const { username } = JSON.parse(p);
    if (!username || username.length < 3) return JSON.stringify({ ok: false, error: "Too short" });
    return JSON.stringify({ ok: true, username });
  },
  complete_onboarding: (p) => {
    const { baseline_wpm } = JSON.parse(p);
    const track = baseline_wpm >= 50 ? "developer" : "general";
    return JSON.stringify({ ok: true, baseline_wpm, recommended_track: track });
  },
  get_curriculum: () => JSON.stringify({
    tracks: {
      general: {
        track: "general", unlocked: true, completed_count: 0, total_count: 20,
        lessons: Array.from({length:20},(_,i)=>({
          id:`general_${i+1}`, track:"general", number:i+1,
          title:`Lesson ${i+1}`, description:"Practice makes perfect",
          mode:"sentences", floor_wpm:15+i*3, target_multiplier:0.80+i*0.008,
          min_accuracy:80, estimated_minutes:3,
          status: i===0?"available":"locked",
          target_wpm: 25+i*3,
          completion: null,
        })),
      },
      developer: {
        track: "developer", unlocked: false, completed_count: 0, total_count: 15,
        lessons: [],
      },
      code: {
        track: "code", unlocked: false, completed_count: 0, total_count: 10,
        lessons: [],
      },
    },
    total_completed: 0,
    baseline_wpm: 0,
  }),
  get_gamification: () => JSON.stringify({
    xp: 248, level: 2, rank: "Novice",
    level_progress: { level: 2, xp_in_level: 98, xp_to_next: 150, pct: 65 },
    badges: ["first_session"],
  }),
  get_profile: () => JSON.stringify({
    user: { username: "demo_user", friend_code: "ABC123" },
    xp: 248, level: 2, rank: "Novice",
    level_progress: { level: 2, xp_in_level: 98, xp_to_next: 150, pct: 65 },
    badges: ["first_session", "streak_3"],
    stats: { sessions: 18, best_wpm: 52, avg_accuracy: 91, streak: 7 },
    progress: [
      { date: "2026-04-10", wpm: 42 }, { date: "2026-04-15", wpm: 52 },
    ],
    key_errors: { q: 12, z: 9, x: 7, p: 6 },
  }),
  get_leaderboard: (p) => {
    const { filter } = JSON.parse(p || '{}');
    if (filter === "friends") return JSON.stringify({ entries: [], user_rank: null, user_entry: null, offline: false });
    return JSON.stringify({
      entries: [
        { rank: 1, username: "type_god", rank_label: "Legend", best_wpm: 145, avg_accuracy: 97, sessions: 312 },
        { rank: 2, username: "swift_coder", rank_label: "Master", best_wpm: 118, avg_accuracy: 95, sessions: 211 },
        { rank: 3, username: "keymaster", rank_label: "Expert", best_wpm: 103, avg_accuracy: 94, sessions: 189 },
        { rank: 4, username: "demo_user",  rank_label: "Novice", best_wpm: 52,  avg_accuracy: 91, sessions: 18, is_me: true },
      ],
      user_rank: 4, offline: false,
    });
  },
  add_friend: (p) => JSON.stringify({ ok: false, error: "offline" }),
  search_users: (p) => JSON.stringify({ results: [] }),
};

// ── SVG icon library ──────────────────────────────────────────
const ICONS = {
  keyboard:    `<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/>`,
  flame:       `<path d="M12 2c-1.5 3-4 5.5-4 8.5a4 4 0 008 0C16 7.5 13.5 5 12 2z"/><path d="M12 12c-1 1.5-2 2.5-2 3.5a2 2 0 004 0c0-1-.5-2.5-2-3.5z"/>`,
  calendar:    `<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`,
  trophy:      `<path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/>`,
  zap:         `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
  chevronUp:   `<polyline points="18 15 12 9 6 15"/>`,
  wind:        `<path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2"/>`,
  hash:        `<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>`,
  target:      `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>`,
  bookOpen:    `<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>`,
  code:        `<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>`,
  terminal:    `<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>`,
  medal:       `<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>`,
  users:       `<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>`,
  lock:        `<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>`,
  checkCircle: `<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`,
  star:        `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
  award:       `<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>`,
  gold:        `<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>`,
  silver:      `<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
  bronze:      `<circle cx="12" cy="12" r="10"/><path d="M9 9h6M9 12h6M9 15h6"/>`,
};
function icon(name, { size = 16, cls = '' } = {}) {
  const paths = ICONS[name] || ICONS.star;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon ${cls}" aria-hidden="true">${paths}</svg>`;
}

// ── All badge metadata (for profile display) ──────────────────
const ALL_BADGES = [
  { id: "first_session",    name: "First Keystroke",  desc: "Complete your first session",    iconKey: "keyboard" },
  { id: "streak_3",         name: "Three-Peat",       desc: "3-day streak",                   iconKey: "flame"    },
  { id: "streak_7",         name: "Week Warrior",     desc: "7-day streak",                   iconKey: "calendar" },
  { id: "streak_30",        name: "Habit Locked",     desc: "30-day streak",                  iconKey: "trophy"   },
  { id: "wpm_40",           name: "Getting Fast",     desc: "Hit 40 WPM",                     iconKey: "zap"      },
  { id: "wpm_60",           name: "Speed Typist",     desc: "Hit 60 WPM",                     iconKey: "chevronUp"},
  { id: "wpm_80",           name: "Rapid Fire",       desc: "Hit 80 WPM",                     iconKey: "wind"     },
  { id: "wpm_100",          name: "Century",          desc: "Hit 100 WPM",                    iconKey: "hash"     },
  { id: "perfect_accuracy", name: "Flawless",         desc: "100% accuracy in a session",     iconKey: "target"   },
  { id: "track_general",    name: "Well Rounded",     desc: "Complete the General track",     iconKey: "bookOpen" },
  { id: "track_developer",  name: "Code Fingers",     desc: "Complete the Developer track",   iconKey: "code"     },
  { id: "first_code",       name: "Syntax Wizard",    desc: "Complete a code drill",          iconKey: "terminal" },
  { id: "top_100",          name: "Top 100",          desc: "Reach top 100 on leaderboard",   iconKey: "medal"    },
  { id: "first_friend",     name: "Social Typist",    desc: "Add your first friend",          iconKey: "users"    },
];
const BADGE_MAP = Object.fromEntries(ALL_BADGES.map(b => [b.id, b]));

// ── App state ─────────────────────────────────────────────────
let appSettings      = {};
let sessionData      = {};
let currentUser      = null;   // { username, friend_code, onboarded, baseline_wpm, ... }
let currentLessonId  = null;   // lesson id if in lesson mode
let homeTopProblemChars = [];
let keyDrillAllErrors   = {};
let keyDrillSelected    = new Set();
let activeLbFilter   = "global";

let typingState = {
  text: "", typed: "",
  startTime: null, timerInterval: null, countdownInterval: null,
  wpm: 0, accuracy: 100, errorCount: 0,
  keyErrors: {},
  finished: false,
  isSpeedTest: false, timeLimit: 0,
};

// Onboarding assessment state
let obAssessState = {
  active: false, text: "", typed: "",
  startTime: null, countdownInterval: null, wpm: 0,
};

// ── Screen router ─────────────────────────────────────────────
const SIDEBAR_SCREENS = new Set(["learn","home","leaderboard","profile"]);
const FULLSCREEN_SCREENS = new Set(["typing","results","onboarding","settings","analytics","hand-guide","key-drill"]);

const screens = {
  onboarding:   document.getElementById("screen-onboarding"),
  learn:        document.getElementById("screen-learn"),
  home:         document.getElementById("screen-home"),
  typing:       document.getElementById("screen-typing"),
  results:      document.getElementById("screen-results"),
  leaderboard:  document.getElementById("screen-leaderboard"),
  profile:      document.getElementById("screen-profile"),
  settings:     document.getElementById("screen-settings"),
  analytics:    document.getElementById("screen-analytics"),
  "hand-guide": document.getElementById("screen-hand-guide"),
  "key-drill":  document.getElementById("screen-key-drill"),
};

function showScreen(name) {
  Object.values(screens).forEach(s => {
    if (s) { s.classList.remove("active"); s.style.display = "none"; }
  });
  const t = screens[name];
  if (!t) return;
  t.style.display = "flex";
  requestAnimationFrame(() => t.classList.add("active"));

  // Sidebar visibility
  const wantSidebar = SIDEBAR_SCREENS.has(name);
  document.body.classList.toggle("with-sidebar", wantSidebar);

  // Update active sidebar button
  if (wantSidebar) {
    document.querySelectorAll(".sidebar-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.screen === name);
    });
  }
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
function renderTypingText(text, typed, containerId = "typing-text") {
  const el = document.getElementById(containerId);
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
// ── Edit-distance helpers ─────────────────────────────────────
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  // Use two-row rolling array for memory efficiency
  let prev = Array.from({length: n + 1}, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const curr = [i];
    for (let j = 1; j <= n; j++) {
      curr[j] = a[i-1] === b[j-1]
        ? prev[j-1]
        : 1 + Math.min(prev[j], curr[j-1], prev[j-1]);
    }
    prev = curr;
  }
  return prev[n];
}

/**
 * Returns a penalty weight (0–1) for a single typed word vs its target.
 *   0.0  — perfect match or trivially readable (1-char typo on a word ≥ 4 chars)
 *   0.3  — minor typo: 1 edit on a 3-char word, or 2 edits on a long word
 *   0.7  — noticeably wrong but still guessable
 *   1.0  — too far off to be readable
 */
function wordPenalty(typed, target) {
  if (!target) return 1.0;
  if (typed === target) return 0.0;
  const dist   = levenshtein(typed.toLowerCase(), target.toLowerCase());
  const maxLen = Math.max(typed.length, target.length);
  if (dist === 1 && maxLen >= 4) return 0.0;   // "recieve" → "receive": forgiven
  if (dist === 1 && maxLen >= 3) return 0.15;  // "teh" → "the": almost forgiven
  if (dist === 2 && maxLen >= 6) return 0.3;   // two slips on a long word
  if (dist === 2 && maxLen >= 4) return 0.5;
  if (dist <= maxLen * 0.4)      return 0.7;   // less than 40% of word changed
  return 1.0;
}

function computeStats(text, typed, elapsedMs) {
  const mins = Math.max(elapsedMs / 60000, 0.0001);

  // ── Character-level errors (for key-fault display & accuracy %) ──
  let charErrors = 0;
  for (let i = 0; i < typed.length; i++) if (typed[i] !== text[i]) charErrors++;

  // ── Word-level fuzzy penalty (for WPM) ───────────────────────────
  const typedWords  = typed.trimEnd().split(/\s+/);
  const targetWords = text.split(/\s+/);
  let penaltyScore  = 0;
  for (let i = 0; i < typedWords.length; i++) {
    penaltyScore += wordPenalty(typedWords[i], targetWords[i] || '');
  }

  const grossWpm = (typed.length / 5) / mins;
  // Deduct 0.5 WPM per penalty-point per minute — readable typos barely register
  const netWpm   = Math.max(0, Math.round(grossWpm - (penaltyScore * 0.5 / mins)));

  const accuracy = typed.length === 0 ? 100
    : Math.round(((typed.length - charErrors) / typed.length) * 100);

  return {
    wpm:        netWpm,
    grossWpm:   Math.round(grossWpm),
    accuracy:   Math.max(0, accuracy),
    errorCount: charErrors,    // raw char errors shown in UI / key fault heatmap
  };
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
  colors: {
    L_PINKY: '#a78bfa', L_RING: '#818cf8', L_MIDDLE: '#22d3ee', L_INDEX: '#4ade80',
    R_INDEX: '#4d7de8', R_MIDDLE: '#fb923c', R_RING: '#f87171', R_PINKY: '#e879f9',
  },
  labels: {
    L_PINKY: 'L. Pinky', L_RING: 'L. Ring', L_MIDDLE: 'L. Middle', L_INDEX: 'L. Index',
    R_INDEX: 'R. Index', R_MIDDLE: 'R. Middle', R_RING: 'R. Ring', R_PINKY: 'R. Pinky',
  },
};

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

  const spY = 4*PITCH, spX = Math.round(2.5*PITCH), spW = 7*PITCH - GAP;
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

// ── Sidebar user info ─────────────────────────────────────────
function updateSidebarUser(user, gamif) {
  if (!user?.username) return;
  const userEl    = document.getElementById("sidebar-user");
  const avatarEl  = document.getElementById("sidebar-avatar");
  const nameEl    = document.getElementById("sidebar-username");
  const rankEl    = document.getElementById("sidebar-rank");
  const xpBarEl   = document.getElementById("sidebar-xp-bar");
  const xpFillEl  = document.getElementById("sidebar-xp-fill");

  if (userEl)   userEl.style.display = "flex";
  if (avatarEl) avatarEl.textContent = user.username[0].toUpperCase();
  if (nameEl)   nameEl.textContent   = user.username;
  if (rankEl)   rankEl.textContent   = gamif?.rank || "Novice";

  if (xpBarEl)  xpBarEl.style.display = "block";
  if (xpFillEl && gamif?.level_progress) {
    xpFillEl.style.width = `${gamif.level_progress.pct || 0}%`;
  }
}

// ── Home screen ────────────────────────────────────────────────
async function initHome() {
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

    const errors  = data.top_problem_errors || {};
    const chars   = data.top_problem_chars  || [];
    homeTopProblemChars = chars;
    const strip   = document.getElementById("focus-strip");
    const keysRow = document.getElementById("focus-keys-row");
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

// ── Learn screen ───────────────────────────────────────────────
let curriculumData = null;
let activeTrack    = "general";

async function initLearn() {
  const subtitleEl = document.getElementById("learn-subtitle");
  const statsEl    = document.getElementById("learn-header-stats");

  try {
    const raw  = await API.getCurriculum();
    curriculumData = typeof raw === "string" ? JSON.parse(raw) : raw;

    const completed = curriculumData.total_completed || 0;
    if (subtitleEl) subtitleEl.textContent = completed > 0 ? `${completed} lessons complete` : "Start your journey";

    // Streak in header
    if (statsEl) {
      try {
        const dr = await API.getDashboard();
        const dd = typeof dr === "string" ? JSON.parse(dr) : dr;
        if (dd.streak > 0) {
          statsEl.innerHTML = `<span class="learn-streak-pill">${icon('flame', {size:13})} ${dd.streak} day streak</span>`;
        }
      } catch (_) {}
    }

    renderLearnTrack(activeTrack);
  } catch (err) {
    const list = document.getElementById("lesson-list");
    if (list) list.innerHTML = '<div class="loading-state">Could not load curriculum.</div>';
    console.error("initLearn:", err);
  }
}

function renderLearnTrack(track) {
  activeTrack = track;
  const tabs = document.querySelectorAll(".track-tab");
  tabs.forEach(t => t.classList.toggle("active", t.dataset.track === track));

  const list = document.getElementById("lesson-list");
  if (!list || !curriculumData) return;

  const trackData = curriculumData.tracks?.[track];
  if (!trackData) { list.innerHTML = ""; return; }

  if (!trackData.unlocked) {
    const req = track === "developer" ? "Complete 5 General lessons to unlock"
              : track === "code"      ? "Complete 10 General lessons to unlock"
              : "";
    list.innerHTML = `
      <div class="track-locked-msg">
        <div class="track-locked-icon">${icon('lock', {size:32})}</div>
        <h3>Track Locked</h3>
        <p>${req}</p>
      </div>`;
    return;
  }

  const lessons = trackData.lessons || [];
  if (!lessons.length) { list.innerHTML = '<div class="loading-state">No lessons yet.</div>'; return; }

  list.innerHTML = lessons.map(lesson => {
    const isLocked    = lesson.status === "locked";
    const isCompleted = lesson.status === "completed";
    const isAvailable = lesson.status === "available";

    const numHtml = isLocked
      ? `<div class="lesson-num lesson-num-locked">${icon('lock', {size:14})}</div>`
      : `<div class="lesson-num">${lesson.number}</div>`;

    const statusIcon = isCompleted
      ? icon('checkCircle', {size:14, cls:'status-icon-done'})
      : isAvailable
        ? icon('chevronRight', {size:14, cls:'status-icon-next'})
        : '';

    const doneWpm = isCompleted && lesson.completion
      ? `<div class="lesson-done-wpm">${icon('checkCircle', {size:12})} ${lesson.completion.wpm} WPM</div>`
      : '';

    return `
      <div class="lesson-card ${lesson.status}" data-lesson-id="${lesson.id}">
        ${numHtml}
        <div class="lesson-info">
          <div class="lesson-title">${lesson.title}</div>
          <div class="lesson-desc">${lesson.description}</div>
        </div>
        <div class="lesson-meta">
          ${isLocked ? '' : `<div class="lesson-target">${lesson.target_wpm} WPM</div>`}
          <div class="lesson-time">~${lesson.estimated_minutes} min</div>
          ${doneWpm}
        </div>
        <div class="lesson-status-icon">${statusIcon}</div>
      </div>`;
  }).join("");

  // Wire lesson card clicks
  list.querySelectorAll(".lesson-card:not(.locked)").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.lessonId;
      if (id) startLesson(id);
    });
  });
}

async function startLesson(lessonId) {
  try {
    const raw  = await API.startLesson(JSON.stringify({ lesson_id: lessonId }));
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;

    currentLessonId = lessonId;
    sessionData = data;
    const adapted = data.adapted_for || [];

    typingState = {
      text: data.text, typed: "",
      startTime: null, timerInterval: null, countdownInterval: null,
      wpm: 0, accuracy: 100, errorCount: 0,
      keyErrors: {}, finished: false,
      isSpeedTest: false, timeLimit: 0,
    };

    // Typing screen badges
    document.getElementById("typing-mode-badge").textContent       = "lesson";
    document.getElementById("typing-difficulty-badge").textContent = data.difficulty || "";

    const adaptedBadge = document.getElementById("typing-adapted-badge");
    adaptedBadge.style.display = "none";

    const lessonBadge  = document.getElementById("typing-lesson-badge");
    const retryBtn     = document.getElementById("btn-retry-lesson");
    if (data.lesson_title) {
      lessonBadge.textContent = data.lesson_title;
      lessonBadge.style.display = "inline-flex";
      if (retryBtn) retryBtn.style.display = "inline-flex";
    } else {
      lessonBadge.style.display = "none";
      if (retryBtn) retryBtn.style.display = "none";
    }

    // Show target WPM
    const targetWrap = document.getElementById("live-target-wrap");
    const targetVal  = document.getElementById("live-target");
    if (data.target_wpm) {
      targetVal.textContent  = data.target_wpm;
      targetWrap.style.display = "flex";
    } else {
      targetWrap.style.display = "none";
    }

    document.getElementById("live-wpm").textContent  = "0";
    document.getElementById("live-acc").textContent  = "100";
    document.getElementById("live-time").textContent = "0:00";
    document.getElementById("typing-progress-fill").style.width = "0%";
    document.getElementById("cursor-hint").style.opacity = "1";
    document.getElementById("live-countdown-wrap").style.display = "none";

    renderTypingText(typingState.text, "");
    showScreen("typing");
    setTimeout(() => {
      const inp = document.getElementById("typing-input");
      inp.value = "";
      inp.focus();
      resetIdleTimer();
    }, 80);
  } catch (err) {
    console.error("startLesson:", err);
  }
}

// ── Session start ──────────────────────────────────────────────
async function startSession(mode = "normal", keyDrillKeys = []) {
  currentLessonId = null;
  try {
    let raw;
    if (mode === "adaptive")   raw = await API.startAdaptiveSession();
    else if (mode === "speed") raw = await API.startSpeedTest();
    else if (mode === "key_drill") raw = await API.startKeyDrill(JSON.stringify({ keys: keyDrillKeys }));
    else                       raw = await API.startSession();

    sessionData = typeof raw === "string" ? JSON.parse(raw) : raw;
    const isSpeed = sessionData.mode === "speed_test";
    const adapted = sessionData.adapted_for || [];

    typingState = {
      text: sessionData.text, typed: "",
      startTime: null, timerInterval: null, countdownInterval: null,
      wpm: 0, accuracy: 100, errorCount: 0,
      keyErrors: {}, finished: false,
      isSpeedTest: isSpeed, timeLimit: sessionData.time_limit || 0,
    };

    const modeLabel = { speed_test: "speed test", adaptive: "adaptive", sentences: "sentences",
                        common: "words", programming: "code", custom: "custom", key_drill: "key drill" };
    document.getElementById("typing-mode-badge").textContent       = modeLabel[sessionData.mode] || sessionData.mode;
    document.getElementById("typing-difficulty-badge").textContent = sessionData.difficulty;

    const adaptedBadge = document.getElementById("typing-adapted-badge");
    if (adapted.length > 0 && sessionData.mode !== "speed_test") {
      adaptedBadge.title = `Adapted for: ${adapted.join(", ")}`;
      adaptedBadge.style.display = "inline-flex";
    } else {
      adaptedBadge.style.display = "none";
    }

    const lessonBadge = document.getElementById("typing-lesson-badge");
    lessonBadge.style.display = "none";
    const retryBtnFree = document.getElementById("btn-retry-lesson");
    if (retryBtnFree) retryBtnFree.style.display = "none";

    const targetWrap = document.getElementById("live-target-wrap");
    targetWrap.style.display = "none";

    document.getElementById("live-wpm").textContent  = "0";
    document.getElementById("live-acc").textContent  = "100";
    document.getElementById("live-time").textContent = "0:00";
    document.getElementById("typing-progress-fill").style.width = "0%";
    document.getElementById("cursor-hint").style.opacity = "1";

    const countdownWrap = document.getElementById("live-countdown-wrap");
    const countdownEl   = document.getElementById("live-countdown");
    if (isSpeed) {
      countdownWrap.style.display = "flex";
      countdownEl.textContent = sessionData.time_limit;
      countdownEl.className   = "live-val countdown-val";
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

  const prev  = typingState.typed;
  const isNew = typed.length > prev.length;
  if (isNew) {
    const expected = typingState.text[typed.length - 1];
    const actual   = typed[typed.length - 1];
    if (actual !== expected) {
      if (expected && expected !== " ") {
        typingState.keyErrors[expected] = (typingState.keyErrors[expected] || 0) + 1;
      }
      Sound.error();
    } else {
      Sound.keystroke();
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
    wpm:        stats.wpm,       // net WPM (penalised for errors)
    gross_wpm:  stats.grossWpm,  // raw speed before penalty
    accuracy:   stats.accuracy,
    time_s:     Math.round(elapsed / 1000),
    errors:     stats.errorCount,
    mode:       sessionData.mode,
    difficulty: sessionData.difficulty,
    key_errors: typingState.keyErrors,
    lesson_id:  currentLessonId || null,
  });

  try {
    const raw    = await API.finishSession(payload);
    const _raw   = typeof raw === "string" ? JSON.parse(raw) : raw;
    // Flatten gamification fields to top level so the rest of the UI can use them directly
    const result = { ..._raw, ...(_raw.gamification || {}) };

    const titles = { speed_test: "Speed Test Result", adaptive: "Adaptive Session Done", key_drill: "Drill Complete", lesson: "Lesson Complete" };
    const titleKey = currentLessonId ? "lesson" : sessionData.mode;
    document.getElementById("results-title").textContent = titles[titleKey] || "Session Complete";
    document.getElementById("results-streak-badge").innerHTML = `${icon('flame', {size:13})} ${result.streak || 0} day streak`;

    const wpmEl      = document.getElementById("res-wpm");
    const grossWpmEl = document.getElementById("res-gross-wpm");
    const accEl      = document.getElementById("res-acc");
    const timeEl     = document.getElementById("res-time");
    const errEl      = document.getElementById("res-errors");
    wpmEl.textContent  = "0";
    accEl.textContent  = "0%";
    timeEl.textContent = "0s";
    errEl.textContent  = "0";

    // Show gross WPM if it differs from net (i.e. errors were made)
    if (grossWpmEl) {
      if (stats.grossWpm > stats.wpm) {
        grossWpmEl.textContent = `${stats.grossWpm} gross`;
        grossWpmEl.style.display = "block";
      } else {
        grossWpmEl.style.display = "none";
      }
    }

    renderSessionFaults(typingState.keyErrors);
    renderLessonResult(result.lesson_result);
    renderXpRow(result);
    renderResultActions(result.lesson_result, result.next_lesson);

    showScreen("results");

    setTimeout(() => animateCount(wpmEl, stats.wpm), 80);
    setTimeout(() => animateCount(accEl, stats.accuracy, "%"), 180);
    setTimeout(() => animateCount(timeEl, Math.round(elapsed / 1000), "s"), 280);
    setTimeout(() => animateCount(errEl, stats.errorCount), 360);

    const bestBadge = document.getElementById("new-best-badge");
    if (bestBadge) bestBadge.style.display = result.is_new_best ? "inline-flex" : "none";

    const accItem = accEl?.closest(".score-item");
    if (stats.accuracy === 100 && accItem) accItem.classList.add("flawless");
    else accItem?.classList.remove("flawless");

    const milestoneEl = document.getElementById("streak-milestone-msg");
    if (milestoneEl) {
      const msg = getStreakMessage(result.streak || 0);
      milestoneEl.textContent = msg || "";
      milestoneEl.style.display = msg ? "block" : "none";
    }

    if (result.is_new_best || stats.accuracy === 100) setTimeout(launchConfetti, 400);

    // Level-up toast
    if (result.leveled_up) showLevelUpToast(result.level);

    // Refresh sidebar XP
    if (result.level_progress && currentUser) {
      updateSidebarUser(currentUser, result);
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

function renderLessonResult(lessonResult) {
  const banner = document.getElementById("lesson-result-banner");
  const content = document.getElementById("lesson-result-content");
  if (!banner || !lessonResult) { if (banner) banner.style.display = "none"; return; }

  banner.style.display = "block";
  banner.className = `lesson-result-banner ${lessonResult.passed ? "passed" : "failed"}`;

  if (lessonResult.passed) {
    const grossNote = lessonResult.gross_wpm && lessonResult.gross_wpm > lessonResult.actual_wpm
      ? `<span class="dot">·</span><span class="gross-wpm-note">${lessonResult.gross_wpm} gross</span>`
      : '';
    content.innerHTML = `
      <div class="lesson-result-row">
        <span class="lesson-result-status passed">${icon('checkCircle', {size:16})} Passed</span>
        <span class="lesson-result-name">${lessonResult.lesson_title || ''}</span>
      </div>
      <div class="lesson-result-meta">
        <span>${lessonResult.actual_wpm} net WPM</span>
        ${grossNote}
        <span class="dot">·</span>
        <span>${lessonResult.actual_accuracy}% accuracy</span>
        <span class="dot">·</span>
        <span>Target: ${lessonResult.target_wpm} WPM</span>
      </div>`;
  } else {
    const wpmShort = lessonResult.wpm_short || 0;
    const accShort = lessonResult.accuracy_short || 0;
    let reason = [];
    if (wpmShort > 0) reason.push(`${wpmShort} WPM short of target (need ${lessonResult.target_wpm})`);
    if (accShort > 0) reason.push(`accuracy ${lessonResult.actual_accuracy}% — need ${lessonResult.min_accuracy}%`);
    content.innerHTML = `
      <div class="lesson-result-row">
        <span class="lesson-result-status failed">${icon('target', {size:16})} Not quite</span>
        <span class="lesson-result-name">${lessonResult.lesson_title || ''}</span>
      </div>
      <div class="lesson-result-meta">${reason.join(' · ')}</div>`;
  }
}

function renderResultActions(lessonResult, nextLesson) {
  const el = document.getElementById("results-actions");
  if (!el) return;

  const hasFaults = Object.keys(typingState.keyErrors || {}).length > 0;

  if (lessonResult) {
    // ── Lesson mode ──
    if (lessonResult.passed) {
      // Passed: drive them forward
      if (nextLesson) {
        el.innerHTML = `
          <button class="btn-primary" id="rab-next">${icon('chevronRight', {size:15})} Next Lesson</button>
          <button class="btn-ghost" id="rab-curriculum">Back to Lessons</button>`;
        document.getElementById("rab-next").addEventListener("click", () => startLesson(nextLesson.id));
      } else {
        // Track complete
        el.innerHTML = `
          <button class="btn-primary" id="rab-curriculum">View Curriculum</button>`;
      }
      document.getElementById("rab-curriculum")?.addEventListener("click", () => { showScreen("learn"); initLearn(); });
    } else {
      // Failed: encourage a retry, with drill as secondary
      el.innerHTML = `
        <button class="btn-primary" id="rab-retry">${icon('zap', {size:15})} Try Again</button>
        ${hasFaults ? `<button class="btn-outline" id="rab-drill">Drill Weak Keys</button>` : ''}
        <button class="btn-ghost" id="rab-curriculum">Back to Lessons</button>`;
      document.getElementById("rab-retry")?.addEventListener("click", () => currentLessonId && startLesson(currentLessonId));
      document.getElementById("rab-drill")?.addEventListener("click", () => {
        const faultKeys = Object.entries(typingState.keyErrors).sort((a, b) => b[1]-a[1]).slice(0, 6).map(([k]) => k);
        showKeyDrillScreen(faultKeys);
      });
      document.getElementById("rab-curriculum")?.addEventListener("click", () => { showScreen("learn"); initLearn(); });
    }
  } else {
    // ── Free practice / key drill / speed test ──
    el.innerHTML = `
      <button class="btn-primary" id="rab-again">Practice Again</button>
      ${hasFaults ? `<button class="btn-outline" id="rab-drill">Drill Weak Keys</button>` : ''}
      <button class="btn-ghost" id="rab-home">Back to Learn</button>`;
    document.getElementById("rab-again")?.addEventListener("click", () => startSession("normal"));
    document.getElementById("rab-drill")?.addEventListener("click", () => {
      const faultKeys = Object.entries(typingState.keyErrors).sort((a, b) => b[1]-a[1]).slice(0, 6).map(([k]) => k);
      showKeyDrillScreen(faultKeys);
    });
    document.getElementById("rab-home")?.addEventListener("click", () => { showScreen("learn"); initLearn(); });
  }
}

function renderXpRow(result) {
  const xpRow    = document.getElementById("xp-row");
  const xpEarned = document.getElementById("xp-earned-display");
  const xpFill   = document.getElementById("res-xp-fill");
  const xpInfo   = document.getElementById("xp-level-info");
  const badgesRow = document.getElementById("new-badges-row");

  if (!xpRow) return;
  const xp = result.xp_earned || 0;
  if (!xp && !(result.new_badges?.length)) { xpRow.style.display = "none"; return; }

  xpRow.style.display = "flex";
  if (xpEarned) xpEarned.textContent = `+${xp} XP`;

  const lp = result.level_progress;
  if (lp) {
    if (xpFill) setTimeout(() => { xpFill.style.width = `${lp.pct || 0}%`; }, 300);
    if (xpInfo) xpInfo.textContent = `Level ${lp.level} · ${lp.xp_in_level}/${lp.xp_to_next} XP`;
  }

  if (badgesRow) {
    const newBadges = result.new_badges || [];
    if (newBadges.length > 0) {
      badgesRow.innerHTML = newBadges.map((id, i) => {
        const b = BADGE_MAP[id] || { name: id, iconKey: "award" };
        return `<span class="new-badge-chip" style="animation-delay:${0.3 + i * 0.15}s">${icon(b.iconKey || 'award', {size:13})} ${b.name}</span>`;
      }).join("");
    } else {
      badgesRow.innerHTML = "";
    }
  }
}

function showLevelUpToast(level) {
  const toast = document.createElement("div");
  toast.className = "level-up-toast";
  toast.textContent = `Level ${level} reached!`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

function renderSessionFaults(keyErrors) {
  const block  = document.getElementById("session-faults");
  const keysEl = document.getElementById("faults-keys");
  const sorted = Object.entries(keyErrors || {}).sort((a,b) => b[1]-a[1]).slice(0, 8);
  if (!sorted.length) { block.style.display = "none"; return; }

  const max = sorted[0][1];
  block.style.display = "flex";
  keysEl.innerHTML = sorted.map(([ch, count]) => {
    const ratio = count / max;
    const cls   = ratio > 0.6 ? "high" : ratio > 0.3 ? "med" : "low";
    return `<span class="fault-key-chip ${cls}">${ch}<span class="chip-count">×${count}</span></span>`;
  }).join("");
}

// ── Key drill screen ───────────────────────────────────────────
const DRILL_KB_ROWS = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['z','x','c','v','b','n','m'],
];
const DRILL_KB_OFFSETS_PX = [0, 35, 87];

async function showKeyDrillScreen(preselected = []) {
  try {
    const raw  = await API.getAnalytics();
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    keyDrillAllErrors = data.key_errors || {};
  } catch (_) {
    keyDrillAllErrors = {};
  }
  keyDrillSelected = new Set(preselected.map(k => k.toLowerCase()));
  renderDrillKeyboard();
  updateDrillSelection();
  showScreen("key-drill");
}

function renderDrillKeyboard() {
  const container = document.getElementById("drill-keyboard");
  if (!container) return;

  container.innerHTML = DRILL_KB_ROWS.map((row, ri) => {
    const offsetPx = DRILL_KB_OFFSETS_PX[ri];
    const keys = row.map(k => {
      const count      = keyDrillAllErrors[k] || 0;
      const isSelected = keyDrillSelected.has(k);
      const isProblem  = count > 0;
      const cls = ["drill-key", isSelected && "selected", isProblem && "problem"].filter(Boolean).join(" ");
      return `<button class="${cls}" data-key="${k}" title="${isProblem ? `×${count} errors` : k}">
        <span class="drill-key-char">${k}</span>
        ${count > 0 ? `<span class="drill-key-count">×${count}</span>` : ""}
      </button>`;
    }).join("");
    return `<div class="drill-key-row" style="padding-left:${offsetPx}px">${keys}</div>`;
  }).join("");

  container.querySelectorAll(".drill-key").forEach(btn => {
    btn.addEventListener("click", () => {
      const k = btn.dataset.key;
      if (keyDrillSelected.has(k)) {
        keyDrillSelected.delete(k);
        btn.classList.remove("selected");
      } else {
        keyDrillSelected.add(k);
        btn.classList.add("selected");
      }
      updateDrillSelection();
    });
  });
}

function updateDrillSelection() {
  const chipsEl  = document.getElementById("drill-selected-keys");
  const startBtn = document.getElementById("btn-start-key-drill");
  if (!chipsEl) return;

  if (keyDrillSelected.size === 0) {
    chipsEl.innerHTML = `<span class="drill-no-selection">None — click keys above to select</span>`;
    if (startBtn) startBtn.disabled = true;
  } else {
    chipsEl.innerHTML = Array.from(keyDrillSelected).sort().map(k => {
      const count = keyDrillAllErrors[k] || 0;
      return `<span class="drill-sel-chip">${k}${count ? `<span class="chip-count">×${count}</span>` : ""}</span>`;
    }).join("");
    if (startBtn) startBtn.disabled = false;
  }
}

// ── Leaderboard screen ─────────────────────────────────────────
async function initLeaderboard(filter = activeLbFilter) {
  activeLbFilter = filter;
  document.querySelectorAll(".lb-filter-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.filter === filter));

  const content = document.getElementById("lb-content");
  if (!content) return;
  content.innerHTML = '<div class="loading-state">Loading…</div>';

  try {
    const raw  = await API.getLeaderboard(JSON.stringify({ filter }));
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;

    if (data.offline) {
      content.innerHTML = `<div class="lb-offline-msg">Leaderboard requires an internet connection. Connect Supabase to enable cloud features.</div>`;
      return;
    }

    const entries = data.entries || [];
    if (!entries.length) {
      content.innerHTML = `<div class="lb-empty">${filter === "friends" ? "Add friends to see them here." : "No scores yet — complete a session to appear."}</div>`;
      return;
    }

    const TOP3_ICONS = [
      `<span class="lb-medal gold">${icon('award', {size:16})}</span>`,
      `<span class="lb-medal silver">${icon('award', {size:16})}</span>`,
      `<span class="lb-medal bronze">${icon('award', {size:16})}</span>`,
    ];
    content.innerHTML = `<div class="lb-table">${entries.map((e, i) => `
      <div class="lb-row ${e.is_me ? "me" : ""}">
        <div class="lb-rank-num ${i < 3 ? "top3" : ""}">${i < 3 ? TOP3_ICONS[i] : e.rank || i+1}</div>
        <div class="lb-avatar">${(e.username || "?")[0].toUpperCase()}</div>
        <div class="lb-username">${e.username || "—"}</div>
        <span class="lb-rank-badge">${e.rank_label || "Novice"}</span>
        <div style="text-align:right">
          <div class="lb-wpm">${e.best_wpm || 0}</div>
          <div class="lb-wpm-lbl">WPM</div>
        </div>
        <div class="lb-meta">${e.avg_accuracy || 0}% acc</div>
      </div>`).join("")}</div>`;
  } catch (err) {
    content.innerHTML = '<div class="loading-state">Could not load leaderboard.</div>';
    console.error("initLeaderboard:", err);
  }
}

async function addFriend() {
  const input = document.getElementById("lb-friend-input");
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;

  const content = document.getElementById("lb-content");
  try {
    const raw    = await API.addFriend(JSON.stringify({ query: val }));
    const result = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (result.ok) {
      input.value = "";
      initLeaderboard("friends");
    } else {
      if (content) {
        const msg = document.createElement("div");
        msg.className = "lb-offline-msg";
        msg.textContent = result.error || "Could not add friend.";
        content.prepend(msg);
        setTimeout(() => msg.remove(), 3000);
      }
    }
  } catch (err) {
    console.error("addFriend:", err);
  }
}

// ── Profile screen ─────────────────────────────────────────────
async function initProfile() {
  const body = document.getElementById("profile-body");
  if (!body) return;
  body.innerHTML = '<div class="loading-state">Loading profile…</div>';

  try {
    const raw  = await API.getProfile();
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    renderProfile(data, body);
  } catch (err) {
    body.innerHTML = '<div class="loading-state">Could not load profile.</div>';
    console.error("initProfile:", err);
  }
}

function renderProfile(data, body) {
  const user        = data.user || {};
  const lp          = data.level_progress || {};
  const stats       = data.stats || {};
  const earnedBadges = new Set(data.badges || []);
  const keyErrors   = data.key_errors || {};
  const progress    = data.progress || [];

  const errEntries = Object.entries(keyErrors).sort((a,b) => b[1]-a[1]).slice(0, 8);
  const maxErr     = errEntries[0]?.[1] || 1;

  const errorBars = !errEntries.length
    ? `<div class="no-errors-msg">No errors recorded yet.</div>`
    : errEntries.map(([ch, count]) => {
        const pct   = Math.round((count / maxErr) * 100);
        const color = pct > 60 ? '#f87171' : pct > 30 ? '#f59e0b' : '#4d7de8';
        return `<div class="error-row">
          <div class="error-char">${ch}</div>
          <div class="error-bar-wrap"><div class="error-bar-fill" style="width:${pct}%;background:${color}"></div></div>
          <div class="error-count">×${count}</div>
        </div>`;
      }).join('');

  body.innerHTML = `
    <div class="profile-hero">
      <div class="profile-avatar">${(user.username || "?")[0].toUpperCase()}</div>
      <div class="profile-hero-info">
        <div class="profile-username-row">
          <span class="profile-username">${user.username || "—"}</span>
          <span class="profile-rank-badge">${data.rank || "Novice"}</span>
        </div>
        ${user.friend_code ? `<div class="profile-friend-code">Friend code: <span>${user.friend_code}</span></div>` : ''}
      </div>
    </div>

    <div class="profile-xp-block">
      <div class="profile-xp-top">
        <span class="profile-level">Level ${lp.level || data.level || 1}</span>
        <span class="profile-xp-nums">${lp.xp_in_level || 0} / ${lp.xp_to_next || 150} XP</span>
      </div>
      <div class="profile-xp-bar-track">
        <div class="profile-xp-bar-fill" id="profile-xp-fill" style="width:0%"></div>
      </div>
    </div>

    <div class="profile-stats-row">
      <div class="profile-stat">
        <span class="profile-stat-val">${stats.sessions || 0}</span>
        <span class="profile-stat-lbl">Sessions</span>
      </div>
      <div class="profile-stat">
        <span class="profile-stat-val" style="color:var(--accent)">${stats.best_wpm || 0}</span>
        <span class="profile-stat-lbl">Best WPM</span>
      </div>
      <div class="profile-stat">
        <span class="profile-stat-val" style="color:var(--green)">${stats.avg_accuracy || 0}%</span>
        <span class="profile-stat-lbl">Avg Acc</span>
      </div>
      <div class="profile-stat">
        <span class="profile-stat-val" style="color:var(--amber)">${stats.streak || 0}</span>
        <span class="profile-stat-lbl">Streak</span>
      </div>
    </div>

    <div class="setting-section">
      <div class="setting-section-title">Badges</div>
      <div class="badge-grid">
        ${ALL_BADGES.map(b => `
          <div class="badge-item ${earnedBadges.has(b.id) ? "earned" : "unearned"}">
            <div class="badge-icon">${icon(b.iconKey || 'star', {size:20})}</div>
            <div class="badge-name">${b.name}</div>
            <div class="badge-desc">${b.desc}</div>
          </div>`).join('')}
      </div>
    </div>

    ${progress.length >= 2 ? `
    <div class="setting-section">
      <div class="setting-section-title">WPM Trend</div>
      <div class="analytics-chart-wrap">
        <canvas id="profile-chart" height="80"></canvas>
      </div>
    </div>` : ''}

    ${errEntries.length > 0 ? `
    <div class="setting-section">
      <div class="setting-section-title">Key Error Heatmap</div>
      <div class="error-list">${errorBars}</div>
    </div>` : ''}
  `;

  // Animate XP bar
  setTimeout(() => {
    const fill = document.getElementById("profile-xp-fill");
    if (fill) fill.style.width = `${lp.pct || 0}%`;
  }, 100);

  if (progress.length >= 2) {
    setTimeout(() => renderChart("profile-chart", progress), 100);
  }
}

// ── Settings screen ────────────────────────────────────────────
async function initSettings() {
  try {
    const raw = await API.getSettings();
    const s   = typeof raw === "string" ? JSON.parse(raw) : raw;
    appSettings = s;

    document.querySelectorAll("#mode-grid .option-btn").forEach(b =>
      b.classList.toggle("active", b.dataset.mode === s.mode));
    toggleCustomTextArea(s.mode === "custom");
    document.getElementById("custom-text-input").value = s.custom_text || "";

    document.querySelectorAll("#case-grid .option-btn").forEach(b =>
      b.classList.toggle("active", b.dataset.case === (s.text_case || "sentence")));

    document.querySelectorAll("#length-grid .option-btn").forEach(b =>
      b.classList.toggle("active", b.dataset.length === (s.session_length || "medium")));

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
  const mode      = document.querySelector("#mode-grid .option-btn.active")?.dataset.mode || "sentences";
  const textCase  = document.querySelector("#case-grid .option-btn.active")?.dataset.case || "sentence";
  const length    = document.querySelector("#length-grid .option-btn.active")?.dataset.length || "medium";

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
  }
}

function renderAnalytics(data, body) {
  const prog      = data.progression       || {};
  const weekly    = data.weekly_summary    || {};
  const weeklyPrg = data.weekly_progress   || [];
  const milestones= data.milestones        || [];
  const keyErrors = data.key_errors        || {};
  const progress  = data.progress          || [];

  // ── Helper: delta badge ──────────────────────────────────────
  function deltaBadge(val, unit = '') {
    if (val === null || val === undefined) return '';
    const sign = val > 0 ? '+' : '';
    const cls  = val > 0 ? 'delta-up' : val < 0 ? 'delta-down' : 'delta-flat';
    return `<span class="delta-badge ${cls}">${sign}${val}${unit}</span>`;
  }

  // ── Progression hero ─────────────────────────────────────────
  const improvement = prog.improvement || 0;
  const improvSign  = improvement >= 0 ? '+' : '';
  const heroHtml = `
    <div class="progression-hero">
      <div class="prog-hero-item">
        <span class="prog-hero-val dim">${prog.baseline_wpm || '—'}</span>
        <span class="prog-hero-lbl">Started at</span>
      </div>
      <div class="prog-hero-arrow">${icon('chevronRight', {size:20})}</div>
      <div class="prog-hero-item">
        <span class="prog-hero-val accent">${prog.current_wpm || '—'}</span>
        <span class="prog-hero-lbl">Current avg</span>
      </div>
      <div class="prog-hero-arrow">${icon('chevronRight', {size:20})}</div>
      <div class="prog-hero-item">
        <span class="prog-hero-val best">${prog.best_wpm || '—'}</span>
        <span class="prog-hero-lbl">Personal best</span>
      </div>
    </div>
    <div class="prog-improvement ${improvement >= 0 ? 'positive' : 'negative'}">
      ${icon(improvement >= 0 ? 'chevronUp' : 'zap', {size:14})}
      ${improvSign}${improvement} WPM since you started · ${prog.total_sessions || 0} sessions · ${prog.days_active || 0} days active
    </div>`;

  // ── Weekly summary ───────────────────────────────────────────
  const tw = weekly.this_week || {};
  const lw = weekly.last_week || {};
  const weekHtml = `
    <div class="weekly-grid">
      <div class="weekly-col">
        <div class="weekly-col-head">This week</div>
        <div class="weekly-stat-row">
          <span class="weekly-stat-val accent">${tw.avg_wpm || 0}</span>
          <span class="weekly-stat-lbl">avg WPM</span>
          ${deltaBadge(weekly.wpm_delta)}
        </div>
        <div class="weekly-stat-row">
          <span class="weekly-stat-val">${tw.avg_accuracy || 0}%</span>
          <span class="weekly-stat-lbl">accuracy</span>
          ${deltaBadge(weekly.accuracy_delta, '%')}
        </div>
        <div class="weekly-stat-row">
          <span class="weekly-stat-val">${tw.sessions || 0}</span>
          <span class="weekly-stat-lbl">sessions</span>
          ${deltaBadge(weekly.sessions_delta)}
        </div>
      </div>
      <div class="weekly-divider"></div>
      <div class="weekly-col dim">
        <div class="weekly-col-head">Last week</div>
        <div class="weekly-stat-row">
          <span class="weekly-stat-val">${lw.avg_wpm || 0}</span>
          <span class="weekly-stat-lbl">avg WPM</span>
        </div>
        <div class="weekly-stat-row">
          <span class="weekly-stat-val">${lw.avg_accuracy || 0}%</span>
          <span class="weekly-stat-lbl">accuracy</span>
        </div>
        <div class="weekly-stat-row">
          <span class="weekly-stat-val">${lw.sessions || 0}</span>
          <span class="weekly-stat-lbl">sessions</span>
        </div>
      </div>
    </div>`;

  // ── Milestones ────────────────────────────────────────────────
  const msHtml = milestones.length === 0
    ? `<div class="no-errors-msg">Complete sessions to unlock milestones.</div>`
    : milestones.slice(-8).reverse().map(m => {
        const d = m.date ? new Date(m.date).toLocaleDateString('en-GB', {day:'numeric', month:'short'}) : '';
        const iconKey = m.type === 'best_wpm' ? 'trophy'
                      : m.type === 'first_session' ? 'zap' : 'checkCircle';
        return `<div class="milestone-row">
          <span class="milestone-icon ${m.type === 'best_wpm' ? 'gold' : ''}">${icon(iconKey, {size:14})}</span>
          <span class="milestone-label">${m.label}</span>
          <span class="milestone-val">${m.value} WPM</span>
          <span class="milestone-date">${d}</span>
        </div>`;
      }).join('');

  // ── Error heatmap ─────────────────────────────────────────────
  const errorEntries = Object.entries(keyErrors).sort((a,b) => b[1]-a[1]);
  const maxErr = errorEntries[0]?.[1] || 1;
  const errorBars = !errorEntries.length
    ? `<div class="no-errors-msg">No errors recorded yet.</div>`
    : errorEntries.slice(0, 10).map(([ch, count]) => {
        const pct   = Math.round((count / maxErr) * 100);
        const ratio = count / maxErr;
        const color = ratio > 0.6 ? '#f87171' : ratio > 0.3 ? '#f59e0b' : '#4d7de8';
        return `<div class="error-row">
          <div class="error-char">${ch}</div>
          <div class="error-bar-wrap"><div class="error-bar-fill" style="width:${pct}%;background:${color}"></div></div>
          <div class="error-count">×${count}</div>
        </div>`;
      }).join('');

  // ── Layout ────────────────────────────────────────────────────
  body.innerHTML = `
    <div class="setting-section">
      <div class="setting-section-title">Your progression</div>
      ${heroHtml}
    </div>

    <div class="setting-section">
      <div class="setting-section-title">Weekly comparison</div>
      ${weekHtml}
    </div>

    ${weeklyPrg.length >= 2 ? `
    <div class="setting-section">
      <div class="setting-section-title">All-time WPM trend</div>
      <div class="analytics-chart-wrap">
        <canvas id="analytics-chart" height="90"></canvas>
      </div>
    </div>` : progress.length >= 2 ? `
    <div class="setting-section">
      <div class="setting-section-title">Recent WPM trend</div>
      <div class="analytics-chart-wrap">
        <canvas id="analytics-chart" height="90"></canvas>
      </div>
    </div>` : ''}

    <div class="setting-section">
      <div class="setting-section-title">Milestones</div>
      <div class="milestones-list">${msHtml}</div>
    </div>

    <div class="setting-section">
      <div class="setting-section-title">Keys that trip you up</div>
      <div class="error-list">${errorBars}</div>
    </div>
  `;

  // Render chart — prefer weekly grouped data for all-time view
  const chartData = weeklyPrg.length >= 2
    ? weeklyPrg.map(w => ({ date: w.week_start, wpm: w.wpm }))
    : progress;
  if (chartData.length >= 2) {
    setTimeout(() => renderChart("analytics-chart", chartData), 50);
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

// ── Onboarding ─────────────────────────────────────────────────
let obUsername    = "";
let obStep        = 1;

function showObStep(n) {
  obStep = n;
  document.querySelectorAll(".onboarding-step").forEach(s => s.classList.remove("active"));
  const step = document.getElementById(`ob-step-${n}`);
  if (step) step.classList.add("active");
}

async function handleObNext1() {
  const input = document.getElementById("ob-username-input");
  const hint  = document.getElementById("ob-username-hint");
  const val   = input.value.trim();

  const valid = /^[a-zA-Z0-9_]{3,20}$/.test(val);
  if (!valid) {
    input.classList.add("error");
    hint.textContent = "3–20 characters, letters, numbers, underscores only";
    hint.classList.add("error-msg");
    return;
  }
  input.classList.remove("error");
  hint.classList.remove("error-msg");
  hint.textContent = "3–20 characters, letters, numbers, underscores";

  try {
    const raw  = await API.setUsername(JSON.stringify({ username: val }));
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!data.ok) {
      hint.textContent = data.error || "That username isn't available.";
      hint.classList.add("error-msg");
      return;
    }
    obUsername = val;
    showObStep(2);
  } catch (err) {
    console.error("setUsername:", err);
  }
}

// Onboarding assessment (30-second typing test)
let obAssessText = "the quick brown fox jumps over the lazy dog and then runs back again to prove speed matters in typing practice every single day for everyone who aspires to type with ease";

async function startObAssessment() {
  const step2 = document.getElementById("ob-step-2");
  if (!step2) return;

  // Replace content with mini typing arena
  step2.innerHTML = `
    <div class="ob-assess-icon">${icon('keyboard', {size:36})}</div>
    <h2 class="ob-step-title">Type for 30 seconds</h2>
    <div class="ob-live-stats">
      <span class="ob-countdown" id="ob-countdown">30</span>
      <span class="ob-live-wpm" id="ob-live-wpm">0 WPM</span>
    </div>
    <div class="ob-typing-arena">
      <div class="ob-typing-text" id="ob-typing-text"></div>
      <textarea id="ob-typing-input" class="typing-input"
        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></textarea>
    </div>`;

  renderTypingText(obAssessText, "", "ob-typing-text");

  const inputEl = document.getElementById("ob-typing-input");
  inputEl.value = "";

  obAssessState = {
    active: true, text: obAssessText, typed: "",
    startTime: null, countdownInterval: null, wpm: 0,
  };

  inputEl.addEventListener("input", handleObAssessInput);
  setTimeout(() => inputEl.focus(), 80);
}

function handleObAssessInput(e) {
  if (!obAssessState.active) return;
  const typed = e.target.value;

  if (!obAssessState.startTime && typed.length > 0) {
    obAssessState.startTime = Date.now();
    let remaining = 30;
    obAssessState.countdownInterval = setInterval(() => {
      remaining--;
      const cdEl = document.getElementById("ob-countdown");
      if (cdEl) {
        cdEl.textContent = remaining;
        if (remaining <= 5) cdEl.classList.add("urgent");
      }
      if (remaining <= 0) finishObAssessment(typed);
    }, 1000);
  }

  obAssessState.typed = typed;
  renderTypingText(obAssessState.text, typed, "ob-typing-text");

  const elapsed = obAssessState.startTime ? Date.now() - obAssessState.startTime : 0;
  const stats   = computeStats(obAssessState.text, typed, elapsed);
  obAssessState.wpm = stats.wpm;
  const wpmEl = document.getElementById("ob-live-wpm");
  if (wpmEl) wpmEl.textContent = `${stats.wpm} WPM`;

  if (typed.length >= obAssessState.text.length) finishObAssessment(typed);
}

async function finishObAssessment(typed) {
  if (!obAssessState.active) return;
  obAssessState.active = false;
  clearInterval(obAssessState.countdownInterval);

  const elapsed = obAssessState.startTime ? Date.now() - obAssessState.startTime : 30000;
  const stats   = computeStats(obAssessState.text, typed || obAssessState.typed, elapsed);
  const wpm     = stats.wpm;

  try {
    const raw  = await API.completeOnboarding(JSON.stringify({ baseline_wpm: wpm }));
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;

    const displayEl = document.getElementById("ob-baseline-display");
    if (displayEl) displayEl.innerHTML = `${wpm} <span>WPM</span>`;

    const recEl = document.getElementById("ob-track-recommendation");
    if (recEl) {
      const track = data.recommended_track || "general";
      const msg = track === "developer"
        ? "Nice! We'll start you on the Developer track."
        : wpm >= 25
          ? "Good baseline! Starting you on General — Intermediate."
          : "We'll start you at the beginning of the General track.";
      recEl.textContent = msg;
    }

    showObStep(3);
  } catch (err) {
    console.error("completeOnboarding:", err);
    showObStep(3);
  }
}

async function finishOnboarding() {
  try {
    const raw  = await API.getUser();
    currentUser = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (_) {}
  await initLearn();
  showScreen("learn");
}

// ── Theme ──────────────────────────────────────────────────────
function applyTheme(dark) {
  document.body.classList.toggle("dark",  dark !== false);
  document.body.classList.toggle("light", dark === false);
}

// ── Keyboard shortcuts ─────────────────────────────────────────
document.addEventListener("keydown", e => {
  const current = Object.entries(screens).find(([, s]) => s?.classList.contains("active"))?.[0];
  if (e.key === "Escape") {
    if (current === "typing") {
      clearInterval(typingState.timerInterval);
      clearInterval(typingState.countdownInterval);
      typingState.finished = true;
      if (currentLessonId) { showScreen("learn"); }
      else { showScreen("home"); initHome(); }
    } else if (["settings","analytics","hand-guide","key-drill"].includes(current)) {
      showScreen("home"); initHome();
    }
  }
});

// ── Bind UI events ─────────────────────────────────────────────
function bindEvents() {
  // SIDEBAR nav
  document.querySelectorAll(".sidebar-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.screen;
      if (target === "learn")        { showScreen("learn");        initLearn();       }
      else if (target === "home")    { showScreen("home");         initHome();        }
      else if (target === "leaderboard") { showScreen("leaderboard"); initLeaderboard(); }
      else if (target === "profile") { showScreen("profile");      initProfile();     }
    });
  });

  // Sidebar settings button
  document.getElementById("btn-sidebar-settings")?.addEventListener("click", () => {
    initSettings(); showScreen("settings");
  });

  // HOME
  document.getElementById("btn-start")?.addEventListener("click", () => startSession("normal"));
  document.getElementById("btn-adaptive")?.addEventListener("click", () => showKeyDrillScreen(homeTopProblemChars));
  document.getElementById("btn-speed-test")?.addEventListener("click", () => startSession("speed"));
  document.getElementById("btn-skip")?.addEventListener("click", () => {
    if (confirm("Skip today?")) API.quitApp();
  });
  document.getElementById("btn-settings-open")?.addEventListener("click", () => {
    initSettings(); showScreen("settings");
  });
  document.getElementById("btn-analytics-open")?.addEventListener("click", () => {
    showScreen("analytics"); initAnalytics();
  });
  document.getElementById("btn-hand-guide-open")?.addEventListener("click", () => {
    showScreen("hand-guide"); initHandGuide();
  });

  // TYPING
  document.getElementById("typing-input")?.addEventListener("input", handleTypingInput);
  document.getElementById("btn-retry-lesson")?.addEventListener("click", () => {
    if (!currentLessonId) return;
    clearInterval(typingState.timerInterval);
    clearInterval(typingState.countdownInterval);
    typingState.finished = true;
    startLesson(currentLessonId);
  });
  document.getElementById("btn-escape")?.addEventListener("click", () => {
    clearInterval(typingState.timerInterval);
    clearInterval(typingState.countdownInterval);
    typingState.finished = true;
    if (currentLessonId) { showScreen("learn"); }
    else { showScreen("home"); }
  });

  // RESULTS — buttons are rendered dynamically by renderResultActions()

  // SETTINGS options
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
  document.getElementById("btn-save-settings")?.addEventListener("click", saveSettings);
  document.getElementById("btn-settings-back")?.addEventListener("click", () => {
    showScreen("home"); initHome();
  });

  // ANALYTICS / HAND GUIDE back
  document.getElementById("btn-analytics-back")?.addEventListener("click", () => {
    showScreen("home"); initHome();
  });
  document.getElementById("btn-hand-guide-back")?.addEventListener("click", () => showScreen("home"));

  // KEY DRILL
  document.getElementById("btn-key-drill-back")?.addEventListener("click", () => {
    showScreen("home"); initHome();
  });
  document.getElementById("btn-start-key-drill")?.addEventListener("click", () => {
    const keys = Array.from(keyDrillSelected);
    if (keys.length > 0) startSession("key_drill", keys);
  });
  document.getElementById("btn-drill-clear")?.addEventListener("click", () => {
    keyDrillSelected.clear();
    document.querySelectorAll(".drill-key.selected").forEach(b => b.classList.remove("selected"));
    updateDrillSelection();
  });
  document.getElementById("btn-drill-auto-select")?.addEventListener("click", () => {
    const topKeys = Object.entries(keyDrillAllErrors)
      .sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k);
    if (!topKeys.length) return;
    keyDrillSelected = new Set(topKeys);
    renderDrillKeyboard();
    updateDrillSelection();
  });

  // LEARN track tabs
  document.querySelectorAll(".track-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      if (!curriculumData) return;
      renderLearnTrack(tab.dataset.track);
    });
  });

  // LEADERBOARD filters
  document.querySelectorAll(".lb-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => initLeaderboard(btn.dataset.filter));
  });
  document.getElementById("btn-add-friend")?.addEventListener("click", addFriend);
  document.getElementById("lb-friend-input")?.addEventListener("keydown", e => {
    if (e.key === "Enter") addFriend();
  });

  // ONBOARDING
  document.getElementById("btn-ob-next-1")?.addEventListener("click", handleObNext1);
  document.getElementById("ob-username-input")?.addEventListener("keydown", e => {
    if (e.key === "Enter") handleObNext1();
  });
  document.getElementById("btn-ob-start-assessment")?.addEventListener("click", startObAssessment);
  document.getElementById("btn-ob-skip-assessment")?.addEventListener("click", async () => {
    try {
      await API.completeOnboarding(JSON.stringify({ baseline_wpm: 0 }));
    } catch (_) {}
    finishOnboarding();
  });
  document.getElementById("btn-ob-finish")?.addEventListener("click", finishOnboarding);

  // Live toggles
  document.getElementById("toggle-sound")?.addEventListener("change", e => {
    appSettings.sound_enabled = e.target.checked;
  });
  document.getElementById("toggle-dark")?.addEventListener("change", e => {
    applyTheme(e.target.checked);
  });
}

// ── Delight ───────────────────────────────────────────────────
function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return "Late night session";
  if (h < 12) return "Morning warmup";
  if (h < 17) return "Afternoon practice";
  if (h < 21) return "Evening drill";
  return "Night owl mode";
}

function getStreakMessage(streak) {
  if (streak >= 30) return "30 days straight. You've built something real.";
  if (streak >= 14) return "Two weeks in. This is becoming who you are.";
  if (streak >= 7)  return "One full week. The habit is forming.";
  if (streak >= 3)  return "Three days running. Keep going.";
  return null;
}

function animateCount(el, target, suffix = '', duration = 700) {
  if (!el) return;
  const start     = parseFloat(el.textContent) || 0;
  const startTime = performance.now();
  function step(now) {
    const t     = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = Math.round(start + (target - start) * eased);
    el.textContent = value + suffix;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.opacity = "1";

  const colors = ['#4d7de8','#7ba4f0','#a5c0f8','#ffffff','#818cf8','#22d3ee','#93c5fd'];
  const particles = Array.from({ length: 90 }, () => ({
    x: canvas.width * 0.5 + (Math.random() - 0.5) * 160,
    y: canvas.height * 0.38,
    vx: (Math.random() - 0.5) * 9,
    vy: -(Math.random() * 8 + 4),
    w: Math.random() * 8 + 4,
    h: Math.random() * 5 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.25,
    life: 1, decay: Math.random() * 0.012 + 0.008,
  }));

  let frame;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of particles) {
      p.x += p.vx; p.vy += 0.22; p.y += p.vy;
      p.rot += p.spin; p.life -= p.decay;
      if (p.life <= 0) continue;
      alive = true;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (alive) { frame = requestAnimationFrame(draw); }
    else { canvas.style.opacity = "0"; }
  }
  cancelAnimationFrame(frame);
  draw();
}

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

function flashProblemKeyCorrect(char) {
  const spans   = document.querySelectorAll("#typing-text .char-correct");
  const adapted = new Set((sessionData.adapted_for || []).map(c => c.toLowerCase()));
  if (!adapted.has(char?.toLowerCase())) return;
  const last = spans[spans.length - 1];
  if (!last) return;
  last.classList.add("char-problem-correct");
  setTimeout(() => last.classList.remove("char-problem-correct"), 600);
}

// ── Boot ───────────────────────────────────────────────────────
async function boot() {
  bindEvents();
  applyTheme(true);

  // Check if user has completed onboarding
  try {
    const raw  = await API.getUser();
    currentUser = typeof raw === "string" ? JSON.parse(raw) : raw;
    appSettings.sound_enabled = true; // default until settings loaded

    if (!currentUser || !currentUser.onboarded) {
      showScreen("onboarding");
    } else {
      // Load gamification for sidebar
      try {
        const gr   = await API.getGamification();
        const gamif = typeof gr === "string" ? JSON.parse(gr) : gr;
        updateSidebarUser(currentUser, gamif);
      } catch (_) {}
      await initLearn();
      showScreen("learn");
    }
  } catch (err) {
    console.error("boot:", err);
    showScreen("onboarding");
  }

  // Non-blocking update check — runs in background after UI is ready
  checkForUpdate();

  console.log(
    "%cTypist 2.0",
    "font-size:28px;font-weight:900;color:#4d7de8;font-family:'Manrope',system-ui",
  );
  console.log("%cBuilt for people who type with intent.", "color:#7ba4f0;font-size:13px");
}

async function checkForUpdate() {
  try {
    const raw = await API.checkForUpdate();
    const res = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (res?.has_update) {
      const banner = document.getElementById("update-banner");
      const text   = document.getElementById("update-banner-text");
      text.textContent = `Typist ${res.latest_version} is available (you have ${res.current_version}).`;
      banner.classList.remove("hidden");
      document.body.classList.add("has-update");
    }
  } catch (_) {}
}

function openReleasesPage() {
  API.openReleasesPage();
}

window.addEventListener("pywebviewready", boot);
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => { if (!window.pywebview) boot(); });
} else {
  if (!window.pywebview) boot();
}
