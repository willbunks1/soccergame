const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const roundTitle = document.getElementById("roundTitle");
const playerLineup = document.getElementById("playerLineup");
const newRoundButton = document.getElementById("newRoundButton");
const playerSetup = document.getElementById("playerSetup");
const playerForm = document.getElementById("playerForm");
const playerNameInput = document.getElementById("playerNameInput");
const playerNameDisplay = document.getElementById("playerNameDisplay");
const successRate = document.getElementById("successRate");
const successPercent = document.getElementById("successPercent");
const runTimer = document.getElementById("runTimer");
const leaderboardPanel = document.getElementById("leaderboardPanel");
const leaderboardList = document.getElementById("leaderboardList");
const runSummary = document.getElementById("runSummary");
const restartRunButton = document.getElementById("restartRunButton");
const fullscreenButton = document.getElementById("fullscreenButton");
const pitchHotspot = document.getElementById("pitchHotspot");
const readyPanel = document.getElementById("readyPanel");
const readyTitle = document.getElementById("readyTitle");
const readyLineup = document.getElementById("readyLineup");
const countdownDisplay = document.getElementById("countdownDisplay");

const PITCH_SCALE = canvas.height / 720;

const FIELD = {
  width: canvas.width,
  height: canvas.height,
  padding: canvas.height * 0.061,
  goalX: canvas.width - canvas.height * 0.081,
  goalTop: canvas.height / 2 - (112 * PITCH_SCALE) / 2,
  goalHeight: 112 * PITCH_SCALE,
  goalDepth: 32 * PITCH_SCALE
};

const MARKINGS = {
  penaltyWidth: 202 * PITCH_SCALE,
  penaltyHeight: 332 * PITCH_SCALE,
  goalAreaWidth: 78 * PITCH_SCALE,
  goalAreaHeight: 156 * PITCH_SCALE,
  penaltySpotDistance: 132 * PITCH_SCALE,
  penaltyArcRadius: 78 * PITCH_SCALE,
  centerCircleRadius: 82 * PITCH_SCALE
};

const CAMERA = {
  a: 0.98,
  b: 0.018,
  c: -0.06,
  d: 0.76,
  e: canvas.width * 0.025,
  f: canvas.height * 0.055
};

const SETTINGS = {
  gameSpeed: 0.75,
  playerRadius: 12,
  ballRadius: 6,
  maxDrag: 285,
  clickMoveThreshold: 14,
  quickTapBoostMs: 125,
  dribbleMoveDistance: FIELD.height * 0.2,
  kickPower: 0.045,
  friction: 0.994,
  minBallSpeed: 0.1,
  playerMoveSpeed: FIELD.height * 0.00105,
  ballCarrierSpeedScale: 0.8,
  aimingMoveSpeedScale: 0.2,
  aimingSpeedBlend: 0.28,
  directionAccelFrames: 24,
  directionAccelMultiplier: 1.32,
  quickTapSprintFrames: 28,
  quickTapSprintMultiplier: 1.3,
  quickTapComboWindowMs: 360,
  quickTapMaxStreak: 7,
  quickTapSprintStep: 0.18,
  quickTapSprintCadenceBonus: 0.34,
  quickTapSprintMaxMultiplier: 2.35,
  maxStamina: 1.8,
  staminaTapCost: 0.07,
  staminaRegen: 0.0024,
  staminaFatigueThreshold: 0.72,
  staminaEmptySpeedScale: 0.35,
  directionChangeAngle: 0.55,
  turnBrakeAngle: 0.68,
  turnBrakeRate: 0.16,
  turnAccelerationRate: 0.085,
  turnVelocityDrag: 0.992,
  shotSpeed: 6.4,
  superShotSpeed: 16.5,
  hardShotLiftThreshold: 7.4,
  maxBallHeight: FIELD.height * 0.07,
  ballGravity: 0.16,
  receiveShotDelayFrames: 30,
  receiveCarryMaxFrames: 178,
  receiveCarrySpaceDistance: FIELD.height * 0.13,
  passIntoRunThreshold: 0.5,
  passIntoRunQualityBonus: 0.13,
  directPassSettleMinFrames: 10,
  directPassSettleMaxFrames: 34,
  passPraiseFrames: 94,
  netBendFrames: 64,
  goalFlashFrames: 36,
  cameraShakeFrames: 28,
  speedLineFrames: 48,
  goalParticleCount: 72,
  goalieDiveFrames: 38,
  goalieCatchDistance: FIELD.height * 0.034,
  offsideLevelTolerance: FIELD.height * 0.006,
  passerPressDistance: FIELD.height * 0.26,
  passerBlockDistance: FIELD.height * 0.018,
  receiveDistance: 30,
  throughPassLeadFrames: 28,
  throughPassLeadDistance: FIELD.height * 0.055,
  blockDistance: 22,
  defenderBlockDistance: 25,
  defenderInterceptionSearchFrames: 168,
  defenderInterceptionFrameStep: 5,
  defenderInterceptionReachWindow: 24,
  defenderPassLaneBlockWindow: 30,
  defenderShotBlockDepth: 0.34,
  tackleDistance: 26,
  scorerTackleDistance: 24,
  looseBallSpeed: 0.9,
  looseBallClaimDistance: FIELD.height * 0.034,
  goalieClaimPassSpeed: 5.7,
  goalieClaimShotSpeed: 3.8,
  goalieClaimSearchFrames: 192,
  goalieClaimFrameStep: 6,
  goalieClaimBeatMargin: 2,
  goalieClaimLateWindow: 46,
  goalieClaimCommitFrames: 26,
  goalieClaimReactionBonus: 56,
  runDurationMs: 2.5 * 60 * 1000,
  leaderboardSize: 10,
  ballCarryOffset: 20,
  countdownFramesPerNumber: 60,
  restartDelayFrames: 120
};

const PLAYER_NAMES = ["Jakob", "Bastian", "Sebastian", "Leonard", "Simon", "Thomas", "Sven"];
const ABILITIES = ["PAC", "SHO", "PAS", "DEF", "PHY"];
const BASE_RATING = 50;
const MAX_RATING = 99;
const LEADERBOARD_KEY = "passingChallengeLeaderboard";
// Paste a Firebase Realtime Database URL here to make the leaderboard shared.
// Example: https://your-project-default-rtdb.europe-west1.firebasedatabase.app/leaderboard.json
const ONLINE_LEADERBOARD_URL = "";
const SITUATIONS = ["pass", "shot", "ambiguous", "space", "deepSpace"];
const KITS = {
  germanyHome: {
    shirtTop: "#ffffff",
    shirtBottom: "#ecefea",
    shorts: "#111111",
    socks: "#ffffff",
    number: "#111111",
    cuff: "#111111",
    accentBlack: "#101010",
    accentRed: "#d91f2c",
    accentGold: "#f2c230"
  },
  germanyDark: {
    shirtTop: "#20242b",
    shirtBottom: "#101319",
    shorts: "#111111",
    socks: "#d91f2c",
    number: "#ffffff",
    cuff: "#f2c230",
    accentBlack: "#080808",
    accentRed: "#d91f2c",
    accentGold: "#f2c230"
  },
  keeper: {
    shirtTop: "#133663",
    shirtBottom: "#071f3d",
    shorts: "#06182f",
    socks: "#8ee7d8",
    number: "#ffffff",
    cuff: "#8ee7d8",
    accentBlack: "#06182f",
    accentRed: "#ffffff",
    accentGold: "#8ee7d8"
  }
};

let passer;
let scorer;
let supporter;
let goalie;
let defenders = [];
let ball;
let playerRatings = loadPlayerRatings();
let currentSituation = "ambiguous";
let roundFrame = 0;
let countdownFrames = 0;
let attackStarted = false;
let attackFrame = 0;
let attackStartForwardRun = 0;
let lastPassQuality = 0;
let lastPassRunScore = 0;
let currentShooter = null;
let currentShotTarget = null;
let activeReceiver = null;
let releaseOffsideLine = null;
let releaseBallX = null;
let releaseScorerX = null;
let releaseScorerOffside = false;
let releaseOffsideByName = {};
let shotSaveAttempted = false;
let shotDangerSnapshot = false;
let receiveTimer = 0;
let receiveDuration = 0;
let receiverSettleTimer = 0;
let receiverSettleDuration = 0;
let receiveShotTarget = null;
let receiveCarryTarget = null;
let passPraiseTimer = 0;
let passPraiseText = "";
let passPraiseDetail = "";
let netBendTimer = 0;
let netBendY = 0;
let netBendX = 0;
let goalFlashTimer = 0;
let cameraShakeTimer = 0;
let speedLineTimer = 0;
let goalParticles = [];
let dragStart = null;
let dragPoint = null;
let dragStartTime = 0;
let lastQuickTapTime = 0;
let quickTapStreak = 0;
let dragging = false;
let aimingShooterSpeedScale = 1;
let playerName = "";
let playerStats = { goals: 0, attempts: 0 };
let runStats = { goals: 0, attempts: 0 };
let runStartTime = 0;
let runEndsAt = 0;
let runFinished = false;
let gameStarted = false;
let state = "setup";
let outcomeTimer = 0;
let animationFrameId = null;
let lastFullscreenButtonPress = 0;
let pitchControlsHideTimer = null;
let pitchUsesBrowserFullscreen = false;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function angleDifference(a, b) {
  return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
}

function getStatsKey(name) {
  return `passingChallengeStats:${name.toLowerCase()}`;
}

function loadStatsForPlayer(name) {
  try {
    const saved = localStorage.getItem(getStatsKey(name));
    const parsed = saved ? JSON.parse(saved) : null;

    return {
      goals: Math.max(0, Number(parsed?.goals) || 0),
      attempts: Math.max(0, Number(parsed?.attempts) || 0)
    };
  } catch (error) {
    return { goals: 0, attempts: 0 };
  }
}

function saveStatsForPlayer() {
  if (!playerName) {
    return;
  }

  try {
    localStorage.setItem(getStatsKey(playerName), JSON.stringify(playerStats));
  } catch (error) {
    // The game still works if browser storage is unavailable.
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function getConversionRate(stats) {
  return stats.attempts === 0 ? 0 : stats.goals / stats.attempts;
}

function formatPercent(rate) {
  return `${Math.round(rate * 100)}%`;
}

function updateSuccessRate() {
  const percentage = formatPercent(getConversionRate(runStats));

  playerNameDisplay.textContent = playerName || "Player";
  successRate.textContent = `${runStats.goals}/${runStats.attempts}`;
  successPercent.textContent = `${percentage} conversion`;
}

function getRunTimeRemaining() {
  if (!gameStarted || runFinished) {
    return 0;
  }

  return Math.max(0, runEndsAt - performance.now());
}

function updateRunTimer() {
  const remaining = !gameStarted
    ? SETTINGS.runDurationMs
    : runFinished
      ? 0
      : getRunTimeRemaining();
  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  runTimer.textContent = `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function recordAttempt(message) {
  if (!gameStarted || runFinished) {
    return;
  }

  runStats.attempts += 1;
  playerStats.attempts += 1;
  if (message === "GOAL!") {
    runStats.goals += 1;
    playerStats.goals += 1;
  }

  saveStatsForPlayer();
  updateSuccessRate();
}

function loadLeaderboard() {
  try {
    const saved = localStorage.getItem(LEADERBOARD_KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveLeaderboard(entries) {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
  } catch (error) {
    // Leaderboard display still works for the current run if storage is unavailable.
  }
}

function getOnlineLeaderboardUrl() {
  const url = ONLINE_LEADERBOARD_URL.trim();

  if (!url) {
    return "";
  }

  if (url.endsWith(".json")) {
    return url;
  }

  return `${url.replace(/\/$/, "")}/leaderboard.json`;
}

function normalizeLeaderboardEntry(entry) {
  const goals = Math.max(0, Math.floor(Number(entry?.goals) || 0));
  const attempts = Math.max(0, Math.floor(Number(entry?.attempts) || 0));

  return {
    name: String(entry?.name || "Player").trim().replace(/\s+/g, " ").slice(0, 18) || "Player",
    goals,
    attempts,
    conversionRate: attempts > 0 ? goals / attempts : 0,
    finishedAt: Math.max(0, Number(entry?.finishedAt) || 0)
  };
}

function sortLeaderboard(entries) {
  return entries
    .map(normalizeLeaderboardEntry)
    .filter((entry) => entry.attempts > 0)
    .sort((a, b) =>
      b.conversionRate - a.conversionRate ||
      b.goals - a.goals ||
      b.attempts - a.attempts ||
      b.finishedAt - a.finishedAt
    )
    .slice(0, SETTINGS.leaderboardSize);
}

function createRunLeaderboardEntry() {
  return {
    name: playerName,
    goals: runStats.goals,
    attempts: runStats.attempts,
    conversionRate: getConversionRate(runStats),
    finishedAt: Date.now()
  };
}

function saveRunToLocalLeaderboard(entry) {
  const leaderboard = sortLeaderboard([...loadLeaderboard(), entry]);

  saveLeaderboard(leaderboard);
  return leaderboard;
}

async function saveOnlineLeaderboardEntry(entry) {
  const url = getOnlineLeaderboardUrl();

  if (!url) {
    return false;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(normalizeLeaderboardEntry(entry))
  });

  if (!response.ok) {
    throw new Error("Could not save shared leaderboard entry.");
  }

  return true;
}

async function loadOnlineLeaderboard() {
  const url = getOnlineLeaderboardUrl();

  if (!url) {
    return null;
  }

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Could not load shared leaderboard.");
  }

  const data = await response.json();
  const entries = Array.isArray(data)
    ? data
    : Object.values(data || {});

  return sortLeaderboard(entries);
}

async function saveRunToLeaderboard() {
  const entry = createRunLeaderboardEntry();
  const localLeaderboard = saveRunToLocalLeaderboard(entry);

  if (!getOnlineLeaderboardUrl()) {
    return { leaderboard: localLeaderboard, source: "local" };
  }

  try {
    await saveOnlineLeaderboardEntry(entry);
    const onlineLeaderboard = await loadOnlineLeaderboard();

    if (onlineLeaderboard) {
      saveLeaderboard(onlineLeaderboard);
      return { leaderboard: onlineLeaderboard, source: "shared" };
    }
  } catch (error) {
    return { leaderboard: localLeaderboard, source: "local-fallback" };
  }

  return { leaderboard: localLeaderboard, source: "local-fallback" };
}

async function saveAndRenderLeaderboard() {
  const result = await saveRunToLeaderboard();

  renderLeaderboard(result.leaderboard, result.source);
}

function renderLeaderboard(leaderboard, source = "local") {
  const currentRate = getConversionRate(runStats);
  const visibleLeaderboard = sortLeaderboard(leaderboard);
  const sourceLabel = source === "shared"
    ? "Shared leaderboard"
    : source === "local-fallback"
      ? "Local leaderboard - shared save unavailable"
      : source === "saving"
        ? "Saving score..."
        : "Local leaderboard";

  runSummary.textContent = `${sourceLabel} - ${playerName}: ${runStats.goals}/${runStats.attempts} (${formatPercent(currentRate)} conversion)`;
  leaderboardList.innerHTML = visibleLeaderboard.length > 0 ? visibleLeaderboard.map((entry, index) => `
    <li>
      <span class="leaderboard-rank">#${index + 1}</span>
      <span class="leaderboard-name">${escapeHTML(entry.name)}</span>
      <span class="leaderboard-rate">${formatPercent(entry.conversionRate)}</span>
      <span class="leaderboard-record">${entry.goals}/${entry.attempts}</span>
    </li>
  `).join("") : `
    <li>
      <span class="leaderboard-rank">-</span>
      <span class="leaderboard-name">No scores yet</span>
      <span class="leaderboard-rate">0%</span>
      <span class="leaderboard-record">0/0</span>
    </li>
  `;
}

function finishRun(title = "Run complete") {
  if (runFinished || !gameStarted) {
    return;
  }

  runFinished = true;
  cancelDrag();
  state = "runEnd";
  outcomeTimer = 0;
  roundTitle.textContent = title;
  newRoundButton.disabled = true;
  readyPanel.hidden = true;
  exitPitchFullscreen();
  updateFullscreenButtonAvailability();
  updateRunTimer();
  leaderboardPanel.hidden = false;
  renderLeaderboard(loadLeaderboard(), "saving");
  saveAndRenderLeaderboard();
}

function triggerDirectionAcceleration(player) {
  player.accelTimer = SETTINGS.directionAccelFrames;
}

function applyCameraTransform() {
  ctx.setTransform(CAMERA.a, CAMERA.b, CAMERA.c, CAMERA.d, CAMERA.e, CAMERA.f);
}

function screenToWorld(point) {
  const det = CAMERA.a * CAMERA.d - CAMERA.b * CAMERA.c;
  const x = point.x - CAMERA.e;
  const y = point.y - CAMERA.f;

  return {
    x: (CAMERA.d * x - CAMERA.c * y) / det,
    y: (-CAMERA.b * x + CAMERA.a * y) / det
  };
}

function worldToScreen(point) {
  return {
    x: CAMERA.a * point.x + CAMERA.c * point.y + CAMERA.e,
    y: CAMERA.b * point.x + CAMERA.d * point.y + CAMERA.f
  };
}

function fieldX(percent) {
  return FIELD.padding + (FIELD.goalX - FIELD.padding) * percent;
}

function fieldY(percent) {
  return FIELD.padding + (FIELD.height - FIELD.padding * 2) * percent;
}

function createBaseRatings() {
  return PLAYER_NAMES.reduce((ratings, name) => {
    ratings[name] = ABILITIES.reduce((abilities, ability) => {
      abilities[ability] = BASE_RATING;
      return abilities;
    }, {});
    return ratings;
  }, {});
}

function loadPlayerRatings() {
  return createBaseRatings();
}

function getRating(name, ability) {
  return playerRatings[name]?.[ability] ?? BASE_RATING;
}

function getAbilityFactor(name, ability, weight = 0.01) {
  return 1 + (getRating(name, ability) - BASE_RATING) * weight;
}

function roundedRect(x, y, width, height, radius) {
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

function pickNames() {
  const shuffled = [...PLAYER_NAMES].sort(() => Math.random() - 0.5);
  return {
    passer: shuffled[0],
    scorer: shuffled[1],
    supporter: shuffled[2],
    goalie: shuffled[3],
    defenderOne: shuffled[4],
    defenderTwo: shuffled[5],
    defenderThree: shuffled[6]
  };
}

function pickSituation() {
  return SITUATIONS[Math.floor(Math.random() * SITUATIONS.length)];
}

function getSituationSetup(type) {
  if (type === "pass") {
    return {
      passer: { x: randomBetween(fieldX(0.09), fieldX(0.18)), y: randomBetween(fieldY(0.18), fieldY(0.82)), targetX: fieldX(0.52), targetY: randomBetween(fieldY(0.32), fieldY(0.68)) },
      scorer: { x: randomBetween(fieldX(0.42), fieldX(0.5)), y: randomBetween(fieldY(0.28), fieldY(0.72)), targetX: fieldX(0.86), targetY: randomBetween(FIELD.goalTop + 58, FIELD.goalTop + FIELD.goalHeight - 58), holdFrames: 36 },
      defenders: { lineX: randomBetween(fieldX(0.62), fieldX(0.7)), topY: randomBetween(fieldY(0.25), fieldY(0.38)), bottomY: randomBetween(fieldY(0.62), fieldY(0.75)) }
    };
  }

  if (type === "space") {
    const topPocket = Math.random() < 0.5;
    const scorerY = topPocket ? randomBetween(fieldY(0.18), fieldY(0.32)) : randomBetween(fieldY(0.68), fieldY(0.82));
    const pocketTargetY = clamp(
      scorerY + (FIELD.height / 2 - scorerY) * randomBetween(0.18, 0.34),
      FIELD.padding + FIELD.height * 0.1,
      FIELD.height - FIELD.padding - FIELD.height * 0.1
    );

    return {
      passer: { x: randomBetween(fieldX(0.12), fieldX(0.24)), y: randomBetween(fieldY(0.36), fieldY(0.64)), targetX: fieldX(0.5), targetY: randomBetween(fieldY(0.36), fieldY(0.64)) },
      scorer: { x: randomBetween(fieldX(0.34), fieldX(0.44)), y: scorerY, targetX: randomBetween(fieldX(0.68), fieldX(0.76)), targetY: pocketTargetY, holdFrames: Math.round(randomBetween(28, 52)) },
      defenders: {
        lineX: randomBetween(fieldX(0.62), fieldX(0.7)),
        topY: topPocket ? randomBetween(fieldY(0.43), fieldY(0.52)) : randomBetween(fieldY(0.25), fieldY(0.36)),
        bottomY: topPocket ? randomBetween(fieldY(0.64), fieldY(0.76)) : randomBetween(fieldY(0.48), fieldY(0.57))
      }
    };
  }

  if (type === "deepSpace") {
    const topPocket = Math.random() < 0.5;
    const scorerY = topPocket ? randomBetween(fieldY(0.2), fieldY(0.38)) : randomBetween(fieldY(0.62), fieldY(0.8));
    const targetY = clamp(
      scorerY + (FIELD.height / 2 - scorerY) * randomBetween(0.08, 0.22),
      FIELD.padding + FIELD.height * 0.11,
      FIELD.height - FIELD.padding - FIELD.height * 0.11
    );

    return {
      passer: { x: randomBetween(fieldX(0.2), fieldX(0.31)), y: randomBetween(fieldY(0.32), fieldY(0.68)), targetX: fieldX(0.6), targetY: randomBetween(fieldY(0.38), fieldY(0.62)) },
      scorer: { x: randomBetween(fieldX(0.3), fieldX(0.4)), y: scorerY, targetX: randomBetween(fieldX(0.62), fieldX(0.71)), targetY, holdFrames: Math.round(randomBetween(44, 76)) },
      defenders: {
        lineX: randomBetween(fieldX(0.66), fieldX(0.76)),
        topY: topPocket ? randomBetween(fieldY(0.54), fieldY(0.64)) : randomBetween(fieldY(0.22), fieldY(0.34)),
        bottomY: topPocket ? randomBetween(fieldY(0.7), fieldY(0.82)) : randomBetween(fieldY(0.42), fieldY(0.54))
      }
    };
  }

  if (type === "shot") {
    return {
      passer: { x: randomBetween(fieldX(0.43), fieldX(0.52)), y: randomBetween(fieldY(0.43), fieldY(0.57)), targetX: fieldX(0.78), targetY: randomBetween(fieldY(0.45), fieldY(0.55)) },
      scorer: { x: randomBetween(fieldX(0.53), fieldX(0.6)), y: randomBetween(fieldY(0.17), fieldY(0.83)), targetX: fieldX(0.82), targetY: randomBetween(FIELD.goalTop + 42, FIELD.goalTop + FIELD.goalHeight - 42), holdFrames: 100 },
      defenders: { lineX: randomBetween(fieldX(0.65), fieldX(0.73)), topY: randomBetween(fieldY(0.22), fieldY(0.36)), bottomY: randomBetween(fieldY(0.64), fieldY(0.78)) }
    };
  }

  return {
    passer: { x: randomBetween(fieldX(0.25), fieldX(0.34)), y: randomBetween(fieldY(0.28), fieldY(0.72)), targetX: fieldX(0.68), targetY: randomBetween(fieldY(0.38), fieldY(0.62)) },
    scorer: { x: randomBetween(fieldX(0.5), fieldX(0.59)), y: randomBetween(fieldY(0.23), fieldY(0.77)), targetX: fieldX(0.86), targetY: randomBetween(FIELD.goalTop + 48, FIELD.goalTop + FIELD.goalHeight - 48), holdFrames: 64 },
    defenders: { lineX: randomBetween(fieldX(0.66), fieldX(0.75)), topY: randomBetween(fieldY(0.23), fieldY(0.38)), bottomY: randomBetween(fieldY(0.62), fieldY(0.77)) }
  };
}

function getSupporterSetup(setup) {
  const scorerTopLane = setup.scorer.y < FIELD.height / 2;
  const laneY = scorerTopLane
    ? randomBetween(fieldY(0.58), fieldY(0.82))
    : randomBetween(fieldY(0.18), fieldY(0.42));
  const targetY = clamp(
    laneY + (FIELD.height / 2 - laneY) * randomBetween(0.12, 0.34),
    FIELD.goalTop + FIELD.height * 0.055,
    FIELD.goalTop + FIELD.goalHeight - FIELD.height * 0.055
  );

  return {
    x: clamp(
      setup.scorer.x - randomBetween(FIELD.height * 0.045, FIELD.height * 0.14),
      fieldX(0.24),
      fieldX(0.56)
    ),
    y: laneY,
    targetX: clamp(
      setup.scorer.targetX - randomBetween(FIELD.height * 0.035, FIELD.height * 0.15),
      fieldX(0.58),
      FIELD.goalX - FIELD.height * 0.08
    ),
    targetY,
    holdFrames: setup.scorer.holdFrames + Math.round(randomBetween(12, 48)),
    waveSize: 34,
    supportOffset: scorerTopLane ? FIELD.height * 0.11 : -FIELD.height * 0.11
  };
}

function getPlayerNumber(name) {
  return PLAYER_NAMES.indexOf(name) + 7;
}

function getSecondLastOpponentX() {
  const opponents = [...defenders, goalie].sort((a, b) => b.x - a.x);

  return opponents[1]?.x ?? FIELD.goalX;
}

function getOffsideLine(ballX = ball.x) {
  return Math.max(ballX, getSecondLastOpponentX());
}

function getOffBallAttackers() {
  return [scorer, supporter].filter(Boolean);
}

function getTeamAttackers() {
  return [passer, ...getOffBallAttackers()].filter(Boolean);
}

function getActiveReceiver() {
  return activeReceiver ?? scorer;
}

function isTeamAttacker(player) {
  return player === passer || getOffBallAttackers().includes(player);
}

function isOffBallAttacker(player) {
  return getOffBallAttackers().includes(player);
}

function isPlayerOffsideAt(player, playerX = player.x, ballX = ball.x) {
  const offsideLine = getOffsideLine(ballX);

  return playerX > offsideLine + SETTINGS.offsideLevelTolerance;
}

function isScorerOffsideAt(scorerX = scorer.x, ballX = ball.x) {
  return isPlayerOffsideAt(scorer, scorerX, ballX);
}

function isScorerOffside() {
  return isScorerOffsideAt();
}

function isAnyAttackerOffside() {
  return getOffBallAttackers().some((attacker) => isPlayerOffsideAt(attacker));
}

function getReceptionOffsideLine() {
  return releaseOffsideLine === null ? getOffsideLine() : releaseOffsideLine;
}

function isScorerOffsideOnReception() {
  return isPlayerOffsideOnReception(getActiveReceiver());
}

function isPlayerOffsideOnReception(player = getActiveReceiver()) {
  if (releaseOffsideLine === null || releaseBallX === null || !player) {
    return false;
  }

  // Offside is frozen at the release moment. Later receiver movement does not change it.
  return Boolean(releaseOffsideByName[player.name]);
}

function clearReleaseOffsideSnapshot() {
  releaseOffsideLine = null;
  releaseBallX = null;
  releaseScorerX = null;
  releaseScorerOffside = false;
  releaseOffsideByName = {};
}

function distanceToSegment(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  const amount = getSegmentProjectionAmount(point, start, end);

  return distance(point, {
    x: start.x + dx * amount,
    y: start.y + dy * amount
  });
}

function getSegmentProjectionAmount(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;

  return lengthSquared === 0 ? 0 : clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared, 0, 1);
}

function getAimedReceiver(vx, vy) {
  const aimLength = Math.hypot(vx, vy);

  if (aimLength < 1) {
    return getActiveReceiver();
  }

  const start = { x: ball.x, y: ball.y };
  const end = {
    x: ball.x + (vx / aimLength) * FIELD.height * 1.12,
    y: ball.y + (vy / aimLength) * FIELD.height * 1.12
  };
  const candidates = getOffBallAttackers()
    .map((attacker) => {
      const laneDistance = distanceToSegment(attacker, start, end);
      const projection = getSegmentProjectionAmount(attacker, start, end);
      const forwardValue = clamp((attacker.x - ball.x) / FIELD.height, -0.2, 0.7);

      return {
        attacker,
        projection,
        laneDistance,
        score: laneDistance - forwardValue * 26 + distance(attacker, ball) * 0.025
      };
    })
    .filter(({ projection, laneDistance }) => projection > 0.02 && laneDistance < FIELD.height * 0.115)
    .sort((a, b) => a.score - b.score);

  return candidates[0]?.attacker ?? null;
}

function getBestReceiverForLooseBall(range) {
  return getOffBallAttackers()
    .filter((attacker) => distance(attacker, ball) <= range)
    .sort((a, b) => {
      const activeBonusA = a === activeReceiver ? -SETTINGS.receiveDistance * 0.4 : 0;
      const activeBonusB = b === activeReceiver ? -SETTINGS.receiveDistance * 0.4 : 0;

      return distance(a, ball) + activeBonusA - (distance(b, ball) + activeBonusB);
    })[0] ?? null;
}

function getKickIntent(vx, vy) {
  const aimLength = Math.hypot(vx, vy);

  if (aimLength < 1) {
    return "pass";
  }

  const start = { x: ball.x, y: ball.y };
  const end = {
    x: ball.x + (vx / aimLength) * FIELD.height * 1.05,
    y: ball.y + (vy / aimLength) * FIELD.height * 1.05
  };
  const yAtGoal = vx === 0 ? Number.POSITIVE_INFINITY : ball.y + (vy / vx) * (FIELD.goalX - ball.x);
  const goalAimMargin = FIELD.height * 0.13;
  const aimedAtGoal =
    vx > 0 &&
    yAtGoal > FIELD.goalTop - goalAimMargin &&
    yAtGoal < FIELD.goalTop + FIELD.goalHeight + goalAimMargin;
  const aimedReceiver = getAimedReceiver(vx, vy);
  const aimedAtReceiver = Boolean(aimedReceiver);

  if (aimedAtGoal && (!aimedAtReceiver || isPlayerOffsideAt(aimedReceiver))) {
    return "shot";
  }

  return "pass";
}

function startRound() {
  if (!gameStarted || runFinished) {
    return;
  }

  readyPanel.hidden = true;
  currentSituation = pickSituation();

  const names = pickNames();
  const setup = getSituationSetup(currentSituation);
  const supporterSetup = getSupporterSetup(setup);

  passer = {
    role: "Passer",
    ownerKey: "passer",
    name: names.passer,
    number: getPlayerNumber(names.passer),
    x: setup.passer.x,
    y: setup.passer.y,
    targetX: setup.passer.targetX,
    targetY: setup.passer.targetY,
    color: KITS.germanyHome.shirtTop,
    moveAngle: null,
    accelTimer: 0,
    stamina: SETTINGS.maxStamina,
    staminaFlashTimer: 0
  };

  scorer = {
    role: "Scorer",
    ownerKey: "scorer",
    name: names.scorer,
    number: getPlayerNumber(names.scorer),
    x: setup.scorer.x,
    y: setup.scorer.y,
    color: KITS.germanyHome.shirtTop,
    targetX: setup.scorer.targetX,
    targetY: setup.scorer.targetY,
    laneY: setup.scorer.y,
    breakY: setup.scorer.targetY,
    holdFrames: setup.scorer.holdFrames,
    triggerX: setup.passer.targetX - 180,
    phase: Math.random() * Math.PI * 2,
    waveSize: 44,
    supportOffset: 0,
    moveAngle: null,
    accelTimer: 0,
    stamina: SETTINGS.maxStamina,
    staminaFlashTimer: 0
  };

  supporter = {
    role: "Attacker",
    ownerKey: "supporter",
    name: names.supporter,
    number: getPlayerNumber(names.supporter),
    x: supporterSetup.x,
    y: supporterSetup.y,
    color: KITS.germanyHome.shirtTop,
    targetX: supporterSetup.targetX,
    targetY: supporterSetup.targetY,
    laneY: supporterSetup.y,
    breakY: supporterSetup.targetY,
    holdFrames: supporterSetup.holdFrames,
    triggerX: setup.passer.targetX - 140,
    phase: Math.random() * Math.PI * 2,
    waveSize: supporterSetup.waveSize,
    supportOffset: supporterSetup.supportOffset,
    moveAngle: null,
    accelTimer: 0,
    stamina: SETTINGS.maxStamina,
    staminaFlashTimer: 0
  };

  goalie = {
    role: "Goalie",
    name: names.goalie,
    number: getPlayerNumber(names.goalie),
    x: FIELD.goalX - 54,
    y: FIELD.goalTop + FIELD.goalHeight / 2,
    color: KITS.keeper.shirtTop,
    baseX: FIELD.goalX - 54,
    baseY: FIELD.goalTop + FIELD.goalHeight / 2,
    diveStartX: FIELD.goalX - 54,
    diveStartY: FIELD.goalTop + FIELD.goalHeight / 2,
    diveTargetX: FIELD.goalX - 54,
    diveTargetY: FIELD.goalTop + FIELD.goalHeight / 2,
    diveDirection: 1,
    diveY: FIELD.goalTop + FIELD.goalHeight / 2,
    diveDuration: SETTINGS.goalieDiveFrames,
    diveTimer: 0,
    diving: false,
    claimTargetX: FIELD.goalX - 54,
    claimTargetY: FIELD.goalTop + FIELD.goalHeight / 2,
    claimCommitTimer: 0,
    moveAngle: null,
    accelTimer: 0
  };

  const defenderLineX = setup.defenders.lineX;
  const middleDefenderY = (setup.defenders.topY + setup.defenders.bottomY) / 2;
  const firstDefenderWait = Math.round(randomBetween(95, 170));
  const secondDefenderWait = Math.round(randomBetween(125, 230));
  const thirdDefenderWait = Math.round(randomBetween(105, 205));
  defenders = [
    {
      role: "Defender",
      name: names.defenderOne,
      number: getPlayerNumber(names.defenderOne),
      x: defenderLineX,
      homeX: defenderLineX,
      y: setup.defenders.topY,
      homeY: setup.defenders.topY,
      color: KITS.germanyDark.shirtTop,
      phase: Math.random() * Math.PI * 2,
      waitFrames: firstDefenderWait,
      willTackleScorer: Math.random() < 0.68,
      markOffsetY: -FIELD.height * 0.045,
      moveAngle: null,
      accelTimer: 0
    },
    {
      role: "Defender",
      name: names.defenderThree,
      number: getPlayerNumber(names.defenderThree),
      x: defenderLineX + randomBetween(-26, 22),
      homeX: defenderLineX + FIELD.height * 0.015,
      y: middleDefenderY + randomBetween(-FIELD.height * 0.028, FIELD.height * 0.028),
      homeY: middleDefenderY,
      color: KITS.germanyDark.shirtTop,
      phase: Math.random() * Math.PI * 2,
      waitFrames: thirdDefenderWait,
      willTackleScorer: Math.random() < 0.58,
      markOffsetY: 0,
      moveAngle: null,
      accelTimer: 0
    },
    {
      role: "Defender",
      name: names.defenderTwo,
      number: getPlayerNumber(names.defenderTwo),
      x: defenderLineX + randomBetween(-18, 26),
      homeX: defenderLineX,
      y: setup.defenders.bottomY,
      homeY: setup.defenders.bottomY,
      color: KITS.germanyDark.shirtTop,
      phase: Math.random() * Math.PI * 2,
      waitFrames: secondDefenderWait,
      willTackleScorer: Math.random() < 0.5,
      markOffsetY: FIELD.height * 0.045,
      moveAngle: null,
      accelTimer: 0
    }
  ];

  ball = {
    x: passer.x + SETTINGS.ballCarryOffset,
    y: passer.y,
    prevX: passer.x + SETTINGS.ballCarryOffset,
    prevY: passer.y,
    vx: 0,
    vy: 0,
    z: 0,
    vz: 0,
    owner: "passer"
  };

  keepAttackersOnsideAtStart();

  dragging = false;
  attackStarted = false;
  attackFrame = 0;
  attackStartForwardRun = 0;
  lastPassQuality = 0;
  lastPassRunScore = 0;
  currentShooter = null;
  currentShotTarget = null;
  activeReceiver = scorer;
  clearReleaseOffsideSnapshot();
  shotSaveAttempted = false;
  shotDangerSnapshot = false;
  receiveTimer = 0;
  receiveDuration = 0;
  receiverSettleTimer = 0;
  receiverSettleDuration = 0;
  receiveShotTarget = null;
  receiveCarryTarget = null;
  passPraiseTimer = 0;
  passPraiseText = "";
  passPraiseDetail = "";
  netBendTimer = 0;
  netBendY = FIELD.goalTop + FIELD.goalHeight / 2;
  netBendX = FIELD.goalX + FIELD.goalDepth;
  goalFlashTimer = 0;
  cameraShakeTimer = 0;
  speedLineTimer = 0;
  goalParticles = [];
  dragStart = null;
  dragPoint = null;
  dragStartTime = 0;
  lastQuickTapTime = 0;
  quickTapStreak = 0;
  state = "ready";
  roundFrame = 0;
  countdownFrames = 0;
  outcomeTimer = 0;
  roundTitle.textContent = "Choose pass or shot";
  playerLineup.textContent = `${passer.name}, ${scorer.name}, and ${supporter.name} attack against three defenders.`;
  readyTitle.textContent = "Lineup";
  countdownDisplay.textContent = "";
  readyLineup.innerHTML = [
    [passer.role, passer.name],
    [scorer.role, scorer.name],
    [supporter.role, supporter.name],
    [goalie.role, goalie.name],
    ...defenders.map((defender) => ["Defender", defender.name])
  ].map(([role, name]) => `
    <div class="lineup-item">
      <span class="lineup-role">${role}</span>
      <span class="lineup-name">${name}</span>
    </div>
  `).join("");
}

function keepAttackersOnsideAtStart() {
  const startingLine = getOffsideLine();
  const maxOnsideX = startingLine - FIELD.height * 0.067;
  const minUsefulDepth = Math.min(passer.x + FIELD.height * 0.18, maxOnsideX - FIELD.height * 0.014);

  getOffBallAttackers().forEach((attacker, index) => {
    const depthOffset = index * FIELD.height * 0.045;

    attacker.x = Math.min(attacker.x, maxOnsideX - depthOffset);
    attacker.x = Math.max(attacker.x, minUsefulDepth - depthOffset);
    attacker.laneY = attacker.y;
  });
}

function startGameForPlayer(name) {
  const cleanName = name.trim().replace(/\s+/g, " ").slice(0, 18);

  if (!cleanName) {
    playerNameInput.focus();
    return;
  }

  playerName = cleanName;
  playerStats = loadStatsForPlayer(playerName);
  gameStarted = true;
  startRun();

  if (shouldAutoEnterPitchFullscreen()) {
    enterPitchFullscreen();
  }

  if (!animationFrameId) {
    gameLoop();
  }
}

function startRun() {
  runStats = { goals: 0, attempts: 0 };
  runStartTime = performance.now();
  runEndsAt = runStartTime + SETTINGS.runDurationMs;
  runFinished = false;
  playerSetup.hidden = true;
  leaderboardPanel.hidden = true;
  newRoundButton.disabled = false;
  updateFullscreenButtonAvailability();
  updateSuccessRate();
  updateRunTimer();
  startRound();
}

function beginRound() {
  if (state !== "lineup") {
    return;
  }

  countdownFrames = 0;
  readyPanel.hidden = true;
  state = "ready";
  roundFrame = 0;
  roundTitle.textContent = "Choose pass or shot";
}

function skipCountdown(event) {
  if (state !== "lineup") {
    return;
  }

  event.preventDefault();
  beginRound();
}

function updateCountdownDisplay() {
  const number = Math.max(1, Math.ceil(countdownFrames / SETTINGS.countdownFramesPerNumber));
  countdownDisplay.textContent = number;
}

function getPointerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  const point = event.touches ? event.touches[0] : event;

  const screenPoint = {
    x: ((point.clientX - rect.left) / rect.width) * canvas.width,
    y: ((point.clientY - rect.top) / rect.height) * canvas.height
  };

  return screenToWorld(screenPoint);
}

function handleInputStart(event) {
  if (state === "lineup") {
    skipCountdown(event);
    return;
  }

  if (state !== "ready") {
    return;
  }

  const pointer = getPointerPosition(event);
  event.preventDefault();
  attackStarted = true;
  attackFrame = 0;
  attackStartForwardRun = getScorerSupportRun();
  dragging = true;
  dragStart = pointer;
  dragPoint = pointer;
  dragStartTime = performance.now();
}

function handleInputMove(event) {
  if (!dragging) {
    return;
  }

  event.preventDefault();
  const pointer = getPointerPosition(event);
  const dx = pointer.x - dragStart.x;
  const dy = pointer.y - dragStart.y;
  const dragLength = Math.hypot(dx, dy);
  const cappedLength = Math.min(dragLength, SETTINGS.maxDrag);
  const angle = Math.atan2(dy, dx);

  dragPoint = {
    x: dragStart.x + Math.cos(angle) * cappedLength,
    y: dragStart.y + Math.sin(angle) * cappedLength
  };
}

function handleInputEnd(event) {
  if (!dragging) {
    return;
  }

  if (state !== "ready") {
    dragging = false;
    dragStart = null;
    dragPoint = null;
    dragStartTime = 0;
    return;
  }

  event.preventDefault();
  const dx = dragStart.x - dragPoint.x;
  const dy = dragStart.y - dragPoint.y;
  const dragPower = Math.hypot(dx, dy);

  if (dragPower <= SETTINGS.clickMoveThreshold) {
    const quickTap = performance.now() - dragStartTime <= SETTINGS.quickTapBoostMs;
    startDribbleMove(dragPoint, quickTap);
    return;
  }

  const intent = getKickIntent(dx, dy);
  activeReceiver = getAimedReceiver(dx, dy) ?? getActiveReceiver();
  releaseOffsideLine = getOffsideLine();
  releaseBallX = ball.x;
  releaseScorerX = activeReceiver.x;
  releaseOffsideByName = getOffBallAttackers().reduce((snapshot, attacker) => {
    snapshot[attacker.name] = isPlayerOffsideAt(attacker, attacker.x, releaseBallX);
    return snapshot;
  }, {});

  const passAccuracy = getAbilityFactor(passer.name, "PAS", 0.006);
  const directShot = intent === "shot";
  const kickFactor = directShot
    ? getAbilityFactor(passer.name, "SHO", 0.007)
    : getAbilityFactor(passer.name, "PAS", 0.005);
  const error = directShot ? 1 / getAbilityFactor(passer.name, "SHO", 0.012) : 1 / passAccuracy;
  const angle = Math.atan2(dy, dx) + randomBetween(-0.075, 0.075) * error;
  const power = Math.hypot(dx, dy) * SETTINGS.kickPower * kickFactor;

  ball.vx = Math.cos(angle) * power;
  ball.vy = Math.sin(angle) * power;
  setBallLift(Math.hypot(ball.vx, ball.vy), directShot || power > SETTINGS.hardShotLiftThreshold);
  releaseScorerOffside = isPlayerOffsideAt(activeReceiver, releaseScorerX, releaseBallX);
  ball.owner = null;
  dragging = false;
  dragStart = null;
  dragPoint = null;
  dragStartTime = 0;

  if (intent === "shot") {
    state = "shot";
    currentShooter = passer;
    currentShotTarget = null;
    shotSaveAttempted = false;
    shotDangerSnapshot = isHighDangerChance(passer);
    roundTitle.textContent = `${passer.name} shoots!`;
    return;
  }

  state = "pass";
  triggerDirectionAcceleration(activeReceiver);
  defenders.forEach(triggerDirectionAcceleration);
  roundTitle.textContent = "Pass is moving";
}

function startDribbleMove(pointer, quickTap) {
  const dx = Math.max(pointer.x - passer.x, FIELD.height * 0.06);
  const dy = pointer.y - passer.y;
  const pointerAngle = Math.atan2(dy, dx);
  let sprintMultiplier = 1;

  if (quickTap) {
    const staminaBefore = spendStamina(passer, SETTINGS.staminaTapCost);
    sprintMultiplier = getQuickTapSprintMultiplier(performance.now(), staminaBefore);
  } else {
    quickTapStreak = 0;
  }

  const keepMomentum =
    quickTap &&
    quickTapStreak > 1 &&
    Number.isFinite(passer.moveAngle) &&
    angleDifference(pointerAngle, passer.moveAngle) < 1.05;
  const angle = keepMomentum ? passer.moveAngle : pointerAngle;
  const quickTapDistance = FIELD.height * (0.17 + quickTapStreak * 0.026);
  const moveDistance = quickTap
    ? clamp(quickTapDistance, FIELD.height * 0.13, SETTINGS.dribbleMoveDistance * 1.55)
    : clamp(distance(passer, pointer), FIELD.height * 0.1, SETTINGS.dribbleMoveDistance);

  ball.owner = "passer";
  ball.vx = 0;
  ball.vy = 0;
  ball.z = 0;
  ball.vz = 0;
  clearReleaseOffsideSnapshot();
  dragging = false;
  dragStart = null;
  dragPoint = null;
  dragStartTime = 0;
  state = "ready";
  passer.targetX = clamp(passer.x + Math.cos(angle) * moveDistance, FIELD.padding + FIELD.height * 0.08, FIELD.goalX - FIELD.height * 0.09);
  passer.targetY = clamp(passer.y + Math.sin(angle) * moveDistance, FIELD.padding + FIELD.height * 0.08, FIELD.height - FIELD.padding - FIELD.height * 0.08);

  if (quickTap) {
    triggerDirectionAcceleration(passer);
    const sprintFrames = SETTINGS.quickTapSprintFrames + Math.max(0, quickTapStreak - 1) * 3;
    passer.sprintTimer = Math.max(passer.sprintTimer || 0, sprintFrames);
    passer.sprintMultiplier = Math.max(passer.sprintMultiplier || 1, sprintMultiplier);
    passer.suppressDirectionBoostFrames = 0;
    roundTitle.textContent = quickTapStreak > 1 ? `${passer.name} accelerates` : `${passer.name} bursts forward`;
  } else {
    passer.accelTimer = 0;
    passer.sprintTimer = 0;
    passer.sprintMultiplier = 1;
    passer.suppressDirectionBoostFrames = 6;
    roundTitle.textContent = `${passer.name} changes direction`;
  }
}

function updatePasser() {
  if (!["lineup", "ready", "pass", "shot", "receive"].includes(state)) {
    return;
  }

  if (isLooseBall()) {
    movePlayerToward(passer, ball);
    return;
  }

  const dx = passer.targetX - passer.x;
  const dy = passer.targetY - passer.y;
  const length = Math.hypot(dx, dy);

  if (length < FIELD.height * 0.025) {
    chooseNextPasserRun();
  } else {
    movePlayerToward(passer, { x: passer.targetX, y: passer.targetY });
  }
}

function chooseNextPasserRun() {
  passer.targetX = clamp(
    passer.x + randomBetween(FIELD.height * 0.055, FIELD.height * 0.13),
    FIELD.padding + FIELD.height * 0.08,
    FIELD.goalX - FIELD.height * 0.09
  );
  passer.targetY = clamp(
    passer.y + randomBetween(-FIELD.height * 0.12, FIELD.height * 0.12),
    FIELD.padding + FIELD.height * 0.08,
    FIELD.height - FIELD.padding - FIELD.height * 0.08
  );
  triggerDirectionAcceleration(passer);
}

function isBallCarrier(player) {
  return getBallOwnerPlayer() === player;
}

function getBallOwnerPlayer() {
  return getTeamAttackers().find((player) => player.ownerKey === ball.owner) ?? null;
}

function getStaminaSpeedScale(player) {
  if (!isTeamAttacker(player)) {
    return 1;
  }

  const staminaRatio = clamp(getPlayerStamina(player) / SETTINGS.maxStamina, 0, 1);
  const freshRatio = clamp(staminaRatio / SETTINGS.staminaFatigueThreshold, 0, 1);

  return lerp(SETTINGS.staminaEmptySpeedScale, 1, Math.pow(freshRatio, 1.35));
}

function getMovementSpeedScale(player) {
  const carrierScale = isBallCarrier(player) ? SETTINGS.ballCarrierSpeedScale : 1;

  return carrierScale * getStaminaSpeedScale(player);
}

function getPlayerStamina(player) {
  return clamp(player?.stamina ?? SETTINGS.maxStamina, 0, SETTINGS.maxStamina);
}

function spendStamina(player, amount) {
  const staminaBefore = getPlayerStamina(player);

  player.stamina = clamp(staminaBefore - amount, 0, SETTINGS.maxStamina);
  player.staminaFlashTimer = 18;

  return staminaBefore;
}

function updateStamina() {
  getTeamAttackers().forEach((player) => {
    if (!player) {
      return;
    }

    if (player.staminaFlashTimer > 0) {
      player.staminaFlashTimer -= 1;
    }

    const regenScale = player.sprintTimer > 0 || dragging ? 0.32 : 1;
    player.stamina = clamp((player.stamina ?? SETTINGS.maxStamina) + SETTINGS.staminaRegen * regenScale, 0, SETTINGS.maxStamina);
  });
}

function getQuickTapSprintMultiplier(now, staminaBefore = 1) {
  const gap = lastQuickTapTime > 0 ? now - lastQuickTapTime : Number.POSITIVE_INFINITY;

  quickTapStreak = gap <= SETTINGS.quickTapComboWindowMs
    ? Math.min(quickTapStreak + 1, SETTINGS.quickTapMaxStreak)
    : 1;
  lastQuickTapTime = now;

  // Tap cadence is the main sprint driver: shorter gaps create a sharper burst,
  // while stamina only soft-limits the very longest button-mashing runs.
  const fastCadence = Number.isFinite(gap)
    ? Math.pow(clamp((SETTINGS.quickTapComboWindowMs - gap) / SETTINGS.quickTapComboWindowMs, 0, 1), 1.35)
    : 0;
  const cadenceBonus = fastCadence * SETTINGS.quickTapSprintCadenceBonus;

  const rawMultiplier = clamp(
    SETTINGS.quickTapSprintMultiplier + (quickTapStreak - 1) * SETTINGS.quickTapSprintStep + cadenceBonus,
    SETTINGS.quickTapSprintMultiplier,
    SETTINGS.quickTapSprintMaxMultiplier
  );
  const staminaRatio = clamp(staminaBefore / SETTINGS.maxStamina, 0, 1);
  const staminaLimit = lerp(0.56, 1, clamp((staminaRatio - 0.08) / 0.52, 0, 1));

  return Math.max(1, rawMultiplier * staminaLimit);
}

function movePlayerToward(player, target, speedScale = 1) {
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const length = Math.hypot(dx, dy);

  if (length <= 1) {
    if (player !== passer) {
      player.vx = (player.vx || 0) * 0.72;
      player.vy = (player.vy || 0) * 0.72;
      if (Math.hypot(player.vx, player.vy) < 0.04) {
        player.vx = 0;
        player.vy = 0;
      }
    }
    return;
  }

  if (length > 1) {
    const angle = Math.atan2(dy, dx);
    const movementScale = getMovementSpeedScale(player);
    const maxSpeed = SETTINGS.playerMoveSpeed * SETTINGS.gameSpeed * speedScale * movementScale;

    if (player !== passer) {
      moveNonPasserWithInertia(player, dx, dy, length, angle, maxSpeed);
      return;
    }

    const suppressDirectionBoost = player === passer && (player.suppressDirectionBoostFrames || 0) > 0;
    if (Number.isFinite(player.moveAngle) && !suppressDirectionBoost && angleDifference(angle, player.moveAngle) > SETTINGS.directionChangeAngle) {
      triggerDirectionAcceleration(player);
    }

    if (player.suppressDirectionBoostFrames > 0) {
      player.suppressDirectionBoostFrames -= 1;
    }

    player.moveAngle = angle;
    const accel = player.accelTimer > 0 ? SETTINGS.directionAccelMultiplier : 1;
    const sprint = player.sprintTimer > 0 ? (player.sprintMultiplier || SETTINGS.quickTapSprintMultiplier) : 1;
    const aimingScale = player === passer ? aimingShooterSpeedScale : 1;
    const speed = SETTINGS.playerMoveSpeed * SETTINGS.gameSpeed * speedScale * aimingScale * accel * sprint * movementScale;

    player.x += (dx / length) * speed;
    player.y += (dy / length) * speed;

    if (player.sprintTimer > 0) {
      player.sprintTimer -= 1;
      if (player.sprintTimer === 0) {
        player.sprintMultiplier = 1;
      }
    }

    if (player.accelTimer > 0) {
      player.accelTimer -= 1;
    }
  }
}

function moveNonPasserWithInertia(player, dx, dy, length, angle, maxSpeed) {
  const targetVx = (dx / length) * maxSpeed;
  const targetVy = (dy / length) * maxSpeed;
  const currentVx = player.vx || 0;
  const currentVy = player.vy || 0;
  const currentSpeed = Math.hypot(currentVx, currentVy);
  const currentAngle = currentSpeed > 0.05 ? Math.atan2(currentVy, currentVx) : angle;
  const sharpTurn = currentSpeed > maxSpeed * 0.38 && angleDifference(angle, currentAngle) > SETTINGS.turnBrakeAngle;
  const brakeStep = maxSpeed * SETTINGS.turnBrakeRate;

  if (sharpTurn) {
    const newSpeed = Math.max(0, currentSpeed - brakeStep);

    player.vx = Math.cos(currentAngle) * newSpeed;
    player.vy = Math.sin(currentAngle) * newSpeed;

    if (newSpeed <= maxSpeed * 0.12) {
      player.vx += (targetVx - player.vx) * SETTINGS.turnAccelerationRate;
      player.vy += (targetVy - player.vy) * SETTINGS.turnAccelerationRate;
    }
  } else {
    player.vx = currentVx + (targetVx - currentVx) * SETTINGS.turnAccelerationRate;
    player.vy = currentVy + (targetVy - currentVy) * SETTINGS.turnAccelerationRate;
  }

  const nextSpeed = Math.hypot(player.vx, player.vy);
  if (nextSpeed > maxSpeed) {
    player.vx = (player.vx / nextSpeed) * maxSpeed;
    player.vy = (player.vy / nextSpeed) * maxSpeed;
  }

  player.vx *= SETTINGS.turnVelocityDrag;
  player.vy *= SETTINGS.turnVelocityDrag;

  if (Math.hypot(player.vx, player.vy) < 0.015) {
    player.vx = 0;
    player.vy = 0;
  }

  player.x += player.vx;
  player.y += player.vy;
  player.moveAngle = Math.hypot(player.vx, player.vy) > 0.04 ? Math.atan2(player.vy, player.vx) : angle;
}

function getPlayerPlannedSpeed(player) {
  const baseSpeed = SETTINGS.playerMoveSpeed * SETTINGS.gameSpeed;
  const movementScale = getMovementSpeedScale(player);

  if (player !== passer) {
    const currentSpeed = Math.hypot(player.vx || 0, player.vy || 0);

    return Math.max(baseSpeed * movementScale * 0.55, currentSpeed);
  }

  const accel = player.accelTimer > 0 ? SETTINGS.directionAccelMultiplier : 1;
  const sprint = player.sprintTimer > 0 ? (player.sprintMultiplier || SETTINGS.quickTapSprintMultiplier) : 1;

  return baseSpeed * aimingShooterSpeedScale * accel * sprint * movementScale;
}

function updateScorer() {
  updateOffBallAttacker(scorer);
}

function updateSupporter() {
  updateOffBallAttacker(supporter);
}

function updateOffBallAttacker(attacker) {
  if (!attacker) {
    return;
  }

  if (!["lineup", "ready", "pass", "shot", "receive"].includes(state)) {
    return;
  }

  if (state === "receive" && attacker === getActiveReceiver()) {
    if (receiverSettleTimer > 0) {
      attacker.vx = (attacker.vx || 0) * 0.58;
      attacker.vy = (attacker.vy || 0) * 0.58;
      attacker.moveAngle = Math.atan2(FIELD.height / 2 - attacker.y, FIELD.goalX - attacker.x);
      return;
    }

    const target = receiveCarryTarget ?? {
      x: clamp(attacker.x + FIELD.height * 0.018, FIELD.padding + 40, FIELD.goalX - 45),
      y: clamp(attacker.y + (FIELD.height / 2 - attacker.y) * 0.025, FIELD.padding + 45, FIELD.height - FIELD.padding - 45)
    };

    movePlayerToward(attacker, target);
    return;
  }

  const target = getAttackerTarget(attacker);
  movePlayerToward(attacker, target);
}

function getScorerSupportRun() {
  return Math.min(roundFrame * 0.42, FIELD.height * 0.18);
}

function getScorerTarget() {
  return getAttackerTarget(scorer);
}

function getAttackerTarget(attacker) {
  if (isLooseBall()) {
    return ball;
  }

  if (state === "pass") {
    return attacker === getActiveReceiver()
      ? getAttackerPassTarget(attacker)
      : getSupportRunTarget(attacker);
  }

  if (state === "shot") {
    if (currentShooter !== attacker && attacker === getActiveReceiver() && ball.x < FIELD.goalX - FIELD.height * 0.035) {
      return getAttackerPassTarget(attacker);
    }

    return getSupportRunTarget(attacker);
  }

  const offsideLine = getOffsideLine();
  const onsideBuffer = FIELD.height * 0.075;
  const safeOnsideX = clamp(
    Math.min(offsideLine - onsideBuffer, ball.x - FIELD.height * 0.025),
    FIELD.padding + 40,
    FIELD.goalX - 45
  );
  const wave = Math.sin(roundFrame * 0.045 + attacker.phase) * (attacker.waveSize ?? 44);
  const laneY = clamp(attacker.laneY + wave, FIELD.padding + 64, FIELD.height - FIELD.padding - 64);

  if (isPlayerOffsideAt(attacker)) {
    if (attacker.accelTimer <= 0) {
      triggerDirectionAcceleration(attacker);
    }
    return {
      x: safeOnsideX,
      y: clamp(attacker.y + (laneY - attacker.y) * 0.45, FIELD.padding + 60, FIELD.height - FIELD.padding - 60)
    };
  }

  const preClickForwardRun = attackStarted ? attackStartForwardRun : getScorerSupportRun();
  const supportDepth = attacker === scorer ? 0 : FIELD.height * 0.055;
  const holdX = offsideLine - (attackStarted ? (currentSituation === "shot" ? 96 : 52) : 110) - supportDepth + preClickForwardRun;
  const shouldBreak =
    attackStarted &&
    currentSituation !== "shot" &&
    attackFrame > attacker.holdFrames;

  if (shouldBreak) {
    return {
      x: attacker.targetX,
      y: clamp(attacker.breakY + wave * 0.35, FIELD.padding + 60, FIELD.height - FIELD.padding - 60)
    };
  }

  return {
    x: Math.min(holdX, attacker.targetX - 96),
    y: laneY
  };
}

function getScorerPassTarget() {
  return getAttackerPassTarget(scorer);
}

function getSupportRunTarget(attacker) {
  const receiver = getActiveReceiver();
  const farPostY = receiver && receiver !== attacker
    ? clamp(FIELD.height - receiver.y, FIELD.padding + 56, FIELD.height - FIELD.padding - 56)
    : clamp(attacker.y + (FIELD.height / 2 - attacker.y) * 0.08, FIELD.padding + 45, FIELD.height - FIELD.padding - 45);

  return {
    x: clamp(FIELD.goalX - FIELD.height * (attacker === supporter ? 0.17 : 0.1), FIELD.padding + 40, FIELD.goalX - 38),
    y: clamp(farPostY + (attacker.supportOffset ?? 0) * 0.08, FIELD.padding + 45, FIELD.height - FIELD.padding - 45)
  };
}

function getAttackerPassTarget(attacker) {
  const spaceRound = ["space", "deepSpace"].includes(currentSituation);
  const finishLaneY = clamp(
    attacker.breakY + (FIELD.height / 2 - attacker.breakY) * (spaceRound ? 0.08 : 0.22),
    FIELD.goalTop + FIELD.height * 0.055,
    FIELD.goalTop + FIELD.goalHeight - FIELD.height * 0.055
  );
  const futurePassPoint = predictBallPosition(SETTINGS.throughPassLeadFrames);
  const throughPass =
    ball.vx > SETTINGS.playerMoveSpeed * 2.2 &&
    futurePassPoint.x > attacker.x + SETTINGS.throughPassLeadDistance;
  let bestPoint = throughPass ? futurePassPoint : predictBallPosition(18);
  let bestScore = Number.POSITIVE_INFINITY;
  const scorerSpeed = getPlayerPlannedSpeed(attacker);
  const goalDepthWeight = spaceRound ? 2.8 : 9;
  const pocketWeight = spaceRound ? 6.5 : 0;
  const minFrames = throughPass ? SETTINGS.throughPassLeadFrames : 6;

  // Search along the pass path and choose the point the scorer can realistically meet.
  // Space rounds value the open pocket more than always forcing the deepest run.
  for (let frames = minFrames; frames <= 132; frames += 3) {
    const passPoint = predictBallPosition(frames);

    if (
      passPoint.x < FIELD.padding ||
      passPoint.x > FIELD.goalX - FIELD.height * 0.035 ||
      passPoint.y < FIELD.padding ||
      passPoint.y > FIELD.height - FIELD.padding
    ) {
      continue;
    }

    if (throughPass && passPoint.x < attacker.x + SETTINGS.throughPassLeadDistance * 0.55) {
      continue;
    }

    const scorerTime = distance(attacker, passPoint) / scorerSpeed;
    const timingGap = Math.abs(scorerTime - frames);
    const canArrive = scorerTime <= frames + (throughPass ? 30 : 18);
    const goalValue = clamp((FIELD.goalX - passPoint.x) / FIELD.height, 0, 1);
    const laneValue = Math.abs(passPoint.y - finishLaneY) / FIELD.height;
    const pocketValue = Math.abs(passPoint.x - attacker.targetX) / FIELD.height;
    const leadValue = throughPass ? clamp((passPoint.x - attacker.x) / FIELD.height, 0, 0.7) : 0;
    const reachPenalty = canArrive ? 0 : (scorerTime - frames) * (throughPass ? 1.25 : 1.8);
    const score = timingGap * (throughPass ? 0.32 : 0.55) +
      reachPenalty +
      goalValue * (throughPass ? goalDepthWeight * 0.38 : goalDepthWeight) +
      laneValue * (throughPass ? 2.4 : 4) +
      pocketValue * pocketWeight -
      leadValue * 5.2;

    if (score < bestScore) {
      bestScore = score;
      bestPoint = passPoint;
    }
  }

  if (throughPass && attacker.accelTimer <= 0) {
    triggerDirectionAcceleration(attacker);
  }

  return {
    x: clamp(bestPoint.x, FIELD.padding + 40, FIELD.goalX - 45),
    y: clamp(bestPoint.y, FIELD.padding + 45, FIELD.height - FIELD.padding - 45)
  };
}

function predictBallPosition(frames) {
  const friction = SETTINGS.friction;
  const scaledFrames = frames * SETTINGS.gameSpeed;
  const travel = friction === 1 ? scaledFrames : (1 - Math.pow(friction, scaledFrames)) / (1 - friction);

  return {
    x: ball.x + ball.vx * travel,
    y: ball.y + ball.vy * travel
  };
}

function isLooseBall() {
  return ball.owner === null && ["pass", "shot"].includes(state) && Math.hypot(ball.vx, ball.vy) < SETTINGS.looseBallSpeed;
}

function isPointInsidePenaltyBox(point) {
  const boxLeft = FIELD.goalX - MARKINGS.penaltyWidth;
  const boxTop = FIELD.height / 2 - MARKINGS.penaltyHeight / 2;
  const boxBottom = FIELD.height / 2 + MARKINGS.penaltyHeight / 2;

  return point.x >= boxLeft && point.x <= FIELD.goalX && point.y >= boxTop && point.y <= boxBottom;
}

function isYInsideGoalMouth(y, margin = 0) {
  return y >= FIELD.goalTop + margin && y <= FIELD.goalTop + FIELD.goalHeight - margin;
}

function getGoalLineCrossY() {
  const previousX = ball.prevX ?? ball.x;
  const previousY = ball.prevY ?? ball.y;
  const dx = ball.x - previousX;

  if (Math.abs(dx) < 0.001) {
    return ball.y;
  }

  const amount = clamp((FIELD.goalX - previousX) / dx, 0, 1);
  return previousY + (ball.y - previousY) * amount;
}

function getShotPathYAtX(x) {
  const previousX = ball.prevX ?? ball.x;
  const previousY = ball.prevY ?? ball.y;
  const frameDx = ball.x - previousX;

  if (Math.abs(frameDx) > 0.001) {
    const amount = (x - previousX) / frameDx;
    return previousY + (ball.y - previousY) * amount;
  }

  if (Math.abs(ball.vx) > 0.001) {
    return ball.y + (ball.vy / ball.vx) * (x - ball.x);
  }

  return ball.y;
}

function shotTargetFinishesInsideGoal() {
  if (!currentShotTarget) {
    return true;
  }

  return isYInsideGoalMouth(currentShotTarget.y, SETTINGS.ballRadius * 0.35);
}

function isShotActuallyInGoal() {
  const previousX = ball.prevX ?? ball.x;
  const crossedFromField = previousX <= FIELD.goalX && ball.x >= FIELD.goalX && ball.vx > 0;

  if (!crossedFromField) {
    return false;
  }

  const frontCrossY = getGoalLineCrossY();
  const backNetY = currentShotTarget?.y ?? getShotPathYAtX(FIELD.goalX + FIELD.goalDepth * 0.85);
  const frontInside = isYInsideGoalMouth(frontCrossY, SETTINGS.ballRadius * 0.8);
  const backInside = isYInsideGoalMouth(backNetY, SETTINGS.ballRadius * 0.45);

  return frontInside && backInside && shotTargetFinishesInsideGoal();
}

function updateGoalie() {
  const goalMin = FIELD.goalTop + SETTINGS.playerRadius;
  const goalMax = FIELD.goalTop + FIELD.goalHeight - SETTINGS.playerRadius;
  const boxLeft = FIELD.goalX - MARKINGS.penaltyWidth;
  const boxTop = FIELD.height / 2 - MARKINGS.penaltyHeight / 2 + SETTINGS.playerRadius;
  const boxBottom = FIELD.height / 2 + MARKINGS.penaltyHeight / 2 - SETTINGS.playerRadius;
  let targetX = goalie.baseX;
  let targetY = goalie.baseY;
  const freshClaimTarget = getGoalieClaimTarget();

  if (freshClaimTarget) {
    goalie.claimTargetX = freshClaimTarget.x;
    goalie.claimTargetY = freshClaimTarget.y;
    goalie.claimCommitTimer = SETTINGS.goalieClaimCommitFrames;
  } else if (goalie.claimCommitTimer > 0) {
    goalie.claimCommitTimer -= 1;

    if (ball.owner === null && state === "pass" && isPointInsidePenaltyBox(ball)) {
      goalie.claimTargetX = ball.x;
      goalie.claimTargetY = ball.y;
    }
  }

  const claimTarget = goalie.claimCommitTimer > 0
    ? { x: goalie.claimTargetX, y: goalie.claimTargetY }
    : null;
  const claimingBall = Boolean(claimTarget);

  if (claimingBall) {
    targetX = claimTarget.x;
    targetY = claimTarget.y;
  } else if (state === "shot") {
    targetY = goalie.diving ? goalie.diveY : ball.y;
  } else if (state === "pass") {
    const receiver = getActiveReceiver();
    const receivingThreatY = clamp(receiver.y + (ball.y - receiver.y) * 0.45, goalMin, goalMax);
    const directBallThreatY = clamp(ball.y, goalMin, goalMax);
    targetY = receivingThreatY * 0.68 + directBallThreatY * 0.32;
  } else if (state === "receive") {
    targetY = clamp(getActiveReceiver().y, goalMin, goalMax);
  } else if (state === "ready") {
    const directShotY = clamp(passer.y + (FIELD.height / 2 - passer.y) * 0.35, goalMin, goalMax);
    const receiver = getActiveReceiver();
    const passThreatY = clamp(receiver.y + (receiver.breakY - receiver.y) * 0.28, goalMin, goalMax);
    const scorerMarked = defenders.some((defender) =>
      defender.willTackleScorer &&
      roundFrame > defender.waitFrames &&
      getOffBallAttackers().some((attacker) => distance(defender, attacker) < FIELD.height * 0.12)
    );
    let shotWeight = currentSituation === "shot" ? 0.72 : ["pass", "space", "deepSpace"].includes(currentSituation) ? 0.34 : 0.52;

    if (isAnyAttackerOffside()) {
      shotWeight += 0.22;
    } else if (scorerMarked) {
      shotWeight += 0.14;
    } else if (attackStarted) {
      shotWeight -= 0.1;
    }

    shotWeight = clamp(shotWeight, 0.24, 0.86);
    targetY = directShotY * shotWeight + passThreatY * (1 - shotWeight);
  }

  if (goalie.diving) {
    updateGoalieDive(boxLeft, goalMin, goalMax);
    return;
  }

  movePlayerToward(goalie, { x: targetX, y: targetY });
  goalie.x = clamp(goalie.x, boxLeft, goalie.baseX);
  goalie.y = claimingBall
    ? clamp(goalie.y, boxTop, boxBottom)
    : clamp(goalie.y, goalMin, goalMax);

  if (goalie.diveTimer > 0) {
    goalie.diveTimer -= 1;
    if (goalie.diveTimer === 0) {
      goalie.diving = false;
    }
  }
}

function updateGoalieDive(boxLeft, goalMin, goalMax) {
  const progress = clamp(1 - goalie.diveTimer / goalie.diveDuration, 0, 1);
  const eased = 1 - Math.pow(1 - progress, 3);
  const launchX = Math.sin(progress * Math.PI) * FIELD.height * 0.014;

  goalie.x = clamp(lerp(goalie.diveStartX, goalie.diveTargetX, eased) - launchX, boxLeft, goalie.baseX);
  goalie.y = clamp(lerp(goalie.diveStartY, goalie.diveTargetY, eased), goalMin, goalMax);

  goalie.diveTimer -= 1;
  if (goalie.diveTimer <= 0) {
    goalie.diveTimer = 0;
    goalie.diving = false;
  }
}

function getGoalieClaimTarget() {
  if (ball.owner !== null || !["pass", "shot"].includes(state)) {
    return null;
  }

  const ballSpeed = Math.hypot(ball.vx, ball.vy);
  const claimSpeed = state === "pass" ? SETTINGS.goalieClaimPassSpeed : SETTINGS.goalieClaimShotSpeed;
  const passClaimSpeed = Math.max(claimSpeed, SETTINGS.shotSpeed * 1.15);

  if (state === "shot" && ballSpeed > claimSpeed) {
    return null;
  }

  const claimCandidates = [];
  const maxFrames = SETTINGS.goalieClaimSearchFrames;
  const frameStep = SETTINGS.goalieClaimFrameStep;

  for (let frames = 0; frames <= maxFrames; frames += frameStep) {
    const claimPoint = frames === 0 ? ball : predictBallPosition(frames);

    if (!isPointInsidePenaltyBox(claimPoint)) {
      continue;
    }

    if (state === "pass" && ballSpeed > passClaimSpeed && frames < 18) {
      continue;
    }

    const goalieArrival = distance(goalie, claimPoint) / getRaceSpeed(goalie);
    const attackerArrival = getTeamAttackers().reduce((soonest, attacker) => {
      return Math.min(soonest, distance(attacker, claimPoint) / getRaceSpeed(attacker));
    }, Number.POSITIVE_INFINITY);
    const deepBoxBonus = claimPoint.x > FIELD.goalX - MARKINGS.penaltyWidth * 0.68 ? SETTINGS.goalieClaimReactionBonus : 24;
    const beatsAttackers = goalieArrival + SETTINGS.goalieClaimBeatMargin < attackerArrival + deepBoxBonus;
    const ballIsLooseEnough = ballSpeed < SETTINGS.looseBallSpeed * 1.7;
    const canReachRollingBall = state === "pass"
      ? goalieArrival <= frames + SETTINGS.goalieClaimLateWindow || (ballIsLooseEnough && frames <= 18)
      : goalieArrival <= frames + 8;

    if (beatsAttackers && canReachRollingBall && goalieArrival < 210) {
      claimCandidates.push({
        point: claimPoint,
        score: goalieArrival + frames * 0.12 - attackerArrival * 0.16 - deepBoxBonus * 0.08
      });
    }
  }

  claimCandidates.sort((a, b) => a.score - b.score);

  return claimCandidates[0]?.point ?? null;
}

function goalieShouldClaimBall() {
  return Boolean(getGoalieClaimTarget());
}

function getRaceSpeed(player) {
  const baseSpeed = SETTINGS.playerMoveSpeed * SETTINGS.gameSpeed;
  const currentSpeed = Math.hypot(player.vx || 0, player.vy || 0);

  return Math.max(baseSpeed, currentSpeed);
}

function getPassThreatPoint(receiver) {
  if (ball.owner !== null || state !== "pass") {
    return null;
  }

  const receiverSpeed = getRaceSpeed(receiver);
  const ballSpeed = Math.hypot(ball.vx, ball.vy);
  const throughPass = ball.vx > SETTINGS.playerMoveSpeed * 2.2;
  let bestThreat = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let frames = SETTINGS.defenderInterceptionFrameStep; frames <= SETTINGS.defenderInterceptionSearchFrames; frames += SETTINGS.defenderInterceptionFrameStep) {
    const passPoint = predictBallPosition(frames);

    if (
      passPoint.x < FIELD.padding ||
      passPoint.x > FIELD.goalX - FIELD.height * 0.025 ||
      passPoint.y < FIELD.padding ||
      passPoint.y > FIELD.height - FIELD.padding
    ) {
      continue;
    }

    const receiverArrival = distance(receiver, passPoint) / receiverSpeed;
    const canControl = receiverArrival <= frames + (throughPass ? 32 : 20);
    const timingGap = Math.abs(receiverArrival - frames);
    const danger = clamp((passPoint.x - fieldX(0.48)) / (FIELD.goalX - fieldX(0.48)), 0, 1);
    const boxDanger = isPointInsidePenaltyBox(passPoint) ? 1 : 0;
    const rollingSoon = ballSpeed < SETTINGS.looseBallSpeed * 1.6 ? 1 : 0;
    const score =
      timingGap * 0.56 +
      Math.max(0, receiverArrival - frames) * (throughPass ? 0.82 : 1.25) +
      frames * 0.045 -
      danger * 8 -
      boxDanger * 4 -
      rollingSoon * 2;

    if ((canControl || !bestThreat) && score < bestScore) {
      bestScore = score;
      bestThreat = {
        point: passPoint,
        frames,
        receiverArrival,
        score,
        danger
      };
    }
  }

  if (bestThreat) {
    return bestThreat;
  }

  const fallbackFrames = 36;
  return {
    point: predictBallPosition(fallbackFrames),
    frames: fallbackFrames,
    receiverArrival: distance(receiver, predictBallPosition(fallbackFrames)) / receiverSpeed,
    score: 0,
    danger: 0.5
  };
}

function getDefenderInterceptionTarget(defender, receiver, passThreat = null) {
  if (ball.owner !== null || state !== "pass") {
    return null;
  }

  const defenderSpeed = getRaceSpeed(defender);
  const receiverSpeed = getRaceSpeed(receiver);
  const threatFrame = passThreat?.frames ?? SETTINGS.defenderInterceptionSearchFrames;
  let bestTarget = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let frames = SETTINGS.defenderInterceptionFrameStep; frames <= SETTINGS.defenderInterceptionSearchFrames; frames += SETTINGS.defenderInterceptionFrameStep) {
    if (frames > threatFrame + 30) {
      break;
    }

    const passPoint = predictBallPosition(frames);

    if (
      passPoint.x < FIELD.padding ||
      passPoint.x > FIELD.goalX - FIELD.height * 0.025 ||
      passPoint.y < FIELD.padding ||
      passPoint.y > FIELD.height - FIELD.padding
    ) {
      continue;
    }

    const defenderArrival = distance(defender, passPoint) / defenderSpeed;
    const receiverArrival = distance(receiver, passPoint) / receiverSpeed;
    const canArrive = defenderArrival <= frames + SETTINGS.defenderInterceptionReachWindow;
    const canBeatReceiver =
      defenderArrival <= frames + SETTINGS.defenderPassLaneBlockWindow &&
      defenderArrival < receiverArrival + 12;

    if (!canArrive && !canBeatReceiver) {
      continue;
    }

    const goalDanger = clamp((passPoint.x - fieldX(0.5)) / (FIELD.goalX - fieldX(0.5)), 0, 1);
    const threatCloseness = passThreat
      ? clamp(1 - distance(passPoint, passThreat.point) / (FIELD.height * 0.28), 0, 1)
      : 0;
    const laneCloseness = clamp(1 - Math.abs(passPoint.y - defender.y) / (FIELD.height * 0.34), 0, 1);
    const score = defenderArrival +
      frames * 0.12 -
      goalDanger * 10 -
      threatCloseness * 7 -
      laneCloseness * 5 +
      Math.max(0, defenderArrival - receiverArrival) * 0.65;

    if (score < bestScore) {
      bestScore = score;
      bestTarget = {
        x: passPoint.x,
        y: passPoint.y,
        score
      };
    }
  }

  return bestTarget;
}

function getDefenderInterceptionPlans(receiver, passThreat = null) {
  const plans = defenders
    .map((defender) => ({
      defender,
      target: getDefenderInterceptionTarget(defender, receiver, passThreat)
    }))
    .filter((plan) => plan.target)
    .sort((a, b) => a.target.score - b.target.score);
  const assigned = new Map();
  const dangerousPass = (passThreat?.danger ?? 0) > 0.42 || isPointInsidePenaltyBox(passThreat?.point ?? ball);
  const maxHunters = Math.min(dangerousPass ? 2 : 1, plans.length);

  for (let i = 0; i < maxHunters; i += 1) {
    assigned.set(plans[i].defender, plans[i].target);
  }

  return assigned;
}

function getDefenderPassLaneBlockTarget(defender, receiver, passThreat, defenderLane) {
  if (!passThreat) {
    return null;
  }

  const start = { x: ball.x, y: ball.y };
  const end = passThreat.point;
  const segmentLength = distance(start, end);

  if (segmentLength < FIELD.height * 0.055) {
    return null;
  }

  const defenderSpeed = getRaceSpeed(defender);
  const sideStep = defenderLane * FIELD.height * 0.014;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy) || 1;
  const samples = [0.28, 0.4, 0.52, 0.64, 0.78, 0.88];
  let bestTarget = null;
  let bestScore = Number.POSITIVE_INFINITY;

  samples.forEach((amount) => {
    const point = {
      x: start.x + dx * amount + (-dy / length) * sideStep,
      y: start.y + dy * amount + (dx / length) * sideStep
    };

    if (
      point.x < FIELD.padding + 42 ||
      point.x > FIELD.goalX - 36 ||
      point.y < FIELD.padding + 36 ||
      point.y > FIELD.height - FIELD.padding - 36
    ) {
      return;
    }

    const ballArrival = passThreat.frames * amount;
    const defenderArrival = distance(defender, point) / defenderSpeed;
    const canCloseLane = defenderArrival <= ballArrival + SETTINGS.defenderPassLaneBlockWindow;
    const laneValue = clamp(1 - distanceToSegment(defender, start, end) / (FIELD.height * 0.42), 0, 1);
    const danger = clamp((point.x - fieldX(0.5)) / (FIELD.goalX - fieldX(0.5)), 0, 1);
    const receiverSide = point.x > receiver.x - FIELD.height * 0.04 ? 1 : 0;
    const score =
      Math.max(0, defenderArrival - ballArrival) * (canCloseLane ? 0.55 : 1.6) +
      defenderArrival * 0.34 -
      laneValue * 4 -
      danger * 6 -
      receiverSide * 3 -
      amount * 2;

    if (score < bestScore) {
      bestScore = score;
      bestTarget = {
        x: clamp(point.x, FIELD.padding + 50, FIELD.goalX - 38),
        y: clamp(point.y, FIELD.padding + 42, FIELD.height - FIELD.padding - 42),
        score
      };
    }
  });

  return bestTarget;
}

function getDefenderShotBlockTarget(defender, receiver, defenderLane, origin = receiver) {
  const topCorner = { x: FIELD.goalX, y: FIELD.goalTop + FIELD.goalHeight * 0.14 };
  const bottomCorner = { x: FIELD.goalX, y: FIELD.goalTop + FIELD.goalHeight * 0.86 };
  const hardCorner = Math.abs(goalie.y - topCorner.y) > Math.abs(goalie.y - bottomCorner.y) ? topCorner : bottomCorner;
  const fallbackTarget = {
    x: FIELD.goalX,
    y: clamp(origin.y + (FIELD.height / 2 - origin.y) * 0.32, FIELD.goalTop + 20, FIELD.goalTop + FIELD.goalHeight - 20)
  };
  const shotTarget = currentShotTarget ?? hardCorner ?? fallbackTarget;
  const depth = clamp(SETTINGS.defenderShotBlockDepth + Math.abs(defenderLane) * 0.045, 0.26, 0.52);
  const laneX = origin.x + (shotTarget.x - origin.x) * depth;
  const laneY = origin.y + (shotTarget.y - origin.y) * depth;
  const dx = shotTarget.x - origin.x;
  const dy = shotTarget.y - origin.y;
  const length = Math.hypot(dx, dy) || 1;
  const sideStep = defenderLane * FIELD.height * 0.026;

  return {
    x: clamp(laneX + (-dy / length) * sideStep, FIELD.padding + 50, FIELD.goalX - 38),
    y: clamp(laneY + (dx / length) * sideStep, FIELD.padding + 42, FIELD.height - FIELD.padding - 42)
  };
}

function updateDefenders() {
  if (!["ready", "pass", "shot", "receive"].includes(state)) {
    return;
  }

  const receiver = getActiveReceiver();
  const passThreat = state === "pass" ? getPassThreatPoint(receiver) : null;
  const passInterceptions = state === "pass" ? getDefenderInterceptionPlans(receiver, passThreat) : new Map();
  const carrierPressIndex = defenders.reduce((closestIndex, defender, index) => {
    const closestDistance = Math.abs(defenders[closestIndex].y - passer.y);
    const defenderDistance = Math.abs(defender.y - passer.y);

    return defenderDistance < closestDistance ? index : closestIndex;
  }, 0);
  const receiverPressIndex = defenders.reduce((closestIndex, defender, index) => {
    const closestDistance = Math.abs(defenders[closestIndex].y - receiver.y);
    const defenderDistance = Math.abs(defender.y - receiver.y);

    return defenderDistance < closestDistance ? index : closestIndex;
  }, 0);

  defenders.forEach((defender, index) => {
    const defenderLane = index - (defenders.length - 1) / 2;
    const laneOffsetY = defender.markOffsetY ?? defenderLane * FIELD.height * 0.045;
    const markTarget = getOffBallAttackers()
      .slice()
      .sort((a, b) => distance(defender, a) - distance(defender, b))[0] ?? receiver;
    const patrolY = defender.homeY + Math.sin(Date.now() / 900 + defender.phase) * 28;
    const markingScorer =
      state === "ready" &&
      !isAnyAttackerOffside() &&
      defender.willTackleScorer &&
      roundFrame > defender.waitFrames;
    const urgentPress = state === "ready" && isAnyAttackerOffside();
    const assignedToCarrier = index === carrierPressIndex;
    const passerGettingClose = distance(defender, passer) < SETTINGS.passerPressDistance;
    const passerBreakingLine = passer.x > defender.homeX - FIELD.height * 0.22;
    const timeToStep = roundFrame > defender.waitFrames * 0.72;
    const pressingPasser =
      state === "ready" &&
      !urgentPress &&
      (passerGettingClose || passerBreakingLine || (assignedToCarrier && timeToStep));
    let targetX = defender.homeX;
    let targetY = patrolY;

    // Once the pass is released, defenders either hunt the live ball path,
    // close the passing lane, or recover into the future shooting lane.
    if (isLooseBall()) {
      targetX = ball.x;
      targetY = ball.y;
    } else if (state === "pass") {
      const interceptionTarget = passInterceptions.get(defender);

      if (interceptionTarget) {
        targetX = interceptionTarget.x;
        targetY = interceptionTarget.y;
      } else {
        const passLaneTarget = getDefenderPassLaneBlockTarget(defender, receiver, passThreat, defenderLane);
        const shotBlockTarget = getDefenderShotBlockTarget(
          defender,
          receiver,
          defenderLane,
          passThreat?.point ?? receiver
        );
        const passNearlyArrived = (passThreat?.frames ?? 999) <= 24 || distance(ball, passThreat?.point ?? receiver) < FIELD.height * 0.12;
        const blockTarget = passNearlyArrived
          ? shotBlockTarget
          : passLaneTarget ?? shotBlockTarget;

        targetX = blockTarget.x;
        targetY = blockTarget.y;
      }
    } else if (urgentPress) {
      targetX = passer.x + FIELD.height * 0.035;
      targetY = passer.y;
    } else if (pressingPasser) {
      targetX = passer.x + FIELD.height * 0.025;
      targetY = passer.y;
    } else if (state === "shot") {
      const shotPathPoint = predictBallPosition(8 + index * 5);
      const canReachShotLane =
        shotPathPoint.x > defender.x - FIELD.height * 0.03 &&
        shotPathPoint.x < FIELD.goalX &&
        Math.abs(shotPathPoint.y - defender.y) < FIELD.height * 0.16;

      if (canReachShotLane) {
        targetX = shotPathPoint.x;
        targetY = shotPathPoint.y;
      } else {
        const blockTarget = getDefenderShotBlockTarget(defender, currentShooter ?? receiver, defenderLane);

        targetX = blockTarget.x;
        targetY = blockTarget.y;
      }
    } else if (state === "receive") {
      if (index === receiverPressIndex) {
        targetX = receiver.x - FIELD.height * 0.025;
        targetY = receiver.y + laneOffsetY * 0.5;
      } else {
        const blockTarget = getDefenderShotBlockTarget(defender, receiver, defenderLane);

        targetX = blockTarget.x;
        targetY = blockTarget.y;
      }
    } else if (markingScorer) {
      targetX = markTarget.x - FIELD.height * 0.025;
      targetY = markTarget.y + laneOffsetY;
    } else if (state === "ready") {
      targetX = defender.homeX + Math.sin(roundFrame * 0.025 + defender.phase) * FIELD.height * 0.018;
      targetY = receiver.y + defenderLane * FIELD.height * 0.067;
    }

    movePlayerToward(defender, { x: targetX, y: targetY });
    defender.x = clamp(defender.x, FIELD.padding + 50, FIELD.goalX - 42);
    defender.y = clamp(defender.y, FIELD.padding + 36, FIELD.height - FIELD.padding - 36);
  });
}

function updateBall() {
  if (state === "lineup") {
    ball.x = passer.x + SETTINGS.ballCarryOffset;
    ball.y = passer.y;
    ball.z = 0;
    ball.vz = 0;
    return;
  }

  const owner = getBallOwnerPlayer();

  if (owner) {
    ball.prevX = ball.x;
    ball.prevY = ball.y;
    ball.x = owner.x + SETTINGS.ballCarryOffset * (owner === passer ? 1 : 0.7);
    ball.y = owner.y;
    ball.z = 0;
    ball.vz = 0;
    return;
  }

  ball.prevX = ball.x;
  ball.prevY = ball.y;
  ball.x += ball.vx * SETTINGS.gameSpeed;
  ball.y += ball.vy * SETTINGS.gameSpeed;
  ball.vx *= SETTINGS.friction;
  ball.vy *= SETTINGS.friction;
  updateBallHeight();

  if (Math.hypot(ball.vx, ball.vy) < SETTINGS.minBallSpeed && ball.z === 0) {
    ball.vx = 0;
    ball.vy = 0;
    ball.vz = 0;
  }
}

function setBallLift(speed, lifted) {
  if (!lifted || speed < SETTINGS.hardShotLiftThreshold) {
    ball.z = 0;
    ball.vz = 0;
    return;
  }

  const liftPower = clamp((speed - SETTINGS.hardShotLiftThreshold) / (SETTINGS.superShotSpeed - SETTINGS.hardShotLiftThreshold), 0, 1);

  ball.z = SETTINGS.ballRadius * 0.5;
  ball.vz = 2.4 + liftPower * 5.2;
}

function updateBallHeight() {
  if ((ball.z || 0) <= 0 && (ball.vz || 0) <= 0) {
    ball.z = 0;
    ball.vz = 0;
    return;
  }

  ball.z = clamp((ball.z || 0) + (ball.vz || 0) * SETTINGS.gameSpeed, 0, SETTINGS.maxBallHeight);
  ball.vz = (ball.vz || 0) - SETTINGS.ballGravity * SETTINGS.gameSpeed;

  if (ball.z <= 0 && ball.vz < 0) {
    ball.z = 0;
    ball.vz = 0;
  }
}

function getShooterGoalCloseness(shooter) {
  return clamp((shooter.x - fieldX(0.45)) / (FIELD.goalX - fieldX(0.45)), 0, 1);
}

function getShooterKeeperRoom(shooter) {
  return clamp((distance(shooter, goalie) - FIELD.height * 0.13) / (FIELD.height * 0.36), 0, 1);
}

function getClosestDefenderDistance(player) {
  return defenders.reduce((closest, defender) => Math.min(closest, distance(defender, player)), Number.POSITIVE_INFINITY);
}

function hasClearShootingLane(shooter) {
  const topCorner = { x: FIELD.goalX, y: FIELD.goalTop + FIELD.goalHeight * 0.16 };
  const bottomCorner = { x: FIELD.goalX, y: FIELD.goalTop + FIELD.goalHeight * 0.84 };
  const centerGoal = { x: FIELD.goalX, y: FIELD.goalTop + FIELD.goalHeight * 0.5 };
  const laneWidth = FIELD.height * 0.038;
  const openLane = (target) => !defenders.some((defender) => {
    const amount = getSegmentProjectionAmount(defender, shooter, target);

    return amount > 0.08 && amount < 0.96 && distanceToSegment(defender, shooter, target) < laneWidth;
  });

  return openLane(topCorner) || openLane(bottomCorner) || openLane(centerGoal);
}

function isHighDangerChance(shooter) {
  if (!shooter || !isInsidePenaltyBox(shooter)) {
    return false;
  }

  const nearestDefender = getClosestDefenderDistance(shooter);
  const hasSpace = nearestDefender > FIELD.height * 0.105;
  const hasKeeperRoom = getShooterKeeperRoom(shooter) > 0.18;

  return hasSpace && hasKeeperRoom && hasClearShootingLane(shooter);
}

function getDangerZoneInfo() {
  const carrier = state === "receive"
    ? getActiveReceiver()
    : getBallOwnerPlayer() ?? (state === "ready" ? passer : null);

  if (!carrier || !isHighDangerChance(carrier)) {
    return null;
  }

  return {
    name: carrier.name,
    room: getShooterKeeperRoom(carrier),
    defenderDistance: getClosestDefenderDistance(carrier)
  };
}

function getShotQuality(shooter) {
  const closeness = getShooterGoalCloseness(shooter);
  const keeperRoom = getShooterKeeperRoom(shooter);
  const centrality = 1 - clamp(Math.abs(shooter.y - FIELD.height / 2) / (FIELD.height * 0.36), 0, 1);
  const highDanger = isHighDangerChance(shooter);
  const pressure = defenders.some((defender) => distance(defender, shooter) < FIELD.height * 0.12) ? 0.18 : 0;
  const shooting = getAbilityFactor(shooter.name, "SHO", 0.012);
  const inBox = isInsidePenaltyBox(shooter);
  const closeRangeBonus = closeness > 0.72 ? (closeness - 0.72) * 0.32 : 0;
  const roomBonus = keeperRoom * 0.2;
  const receiverShot = isOffBallAttacker(shooter);
  const runBonus = receiverShot ? lastPassRunScore * 0.18 : 0;
  const directPenalty = receiverShot ? (1 - lastPassRunScore) * 0.08 : 0;
  const cleanPassBonus = receiverShot ? 0.38 + lastPassQuality * 0.36 + runBonus - directPenalty : 0;
  const boxBonus = inBox ? 0.4 : 0;
  const baseChance = receiverShot ? 0.54 : 0.34;
  const normalQuality = clamp((baseChance + closeness * 0.34 + closeRangeBonus + roomBonus + centrality * 0.13 + cleanPassBonus + boxBonus - pressure * 0.65) * shooting, 0.14, 0.995);

  return highDanger ? Math.max(normalQuality, 0.992) : normalQuality;
}

function shootAtGoal(shooter, options = {}) {
  const quality = options.superShot ? clamp(getShotQuality(shooter) + 0.18, 0, 0.998) : getShotQuality(shooter);
  const accurate = Math.random() < quality;
  const target = options.target ?? getShotTarget(accurate, options.superShot);
  const dx = target.x - ball.x;
  const dy = target.y - ball.y;
  const length = Math.hypot(dx, dy);
  const shotSpeed = options.superShot ? SETTINGS.superShotSpeed : SETTINGS.shotSpeed;

  ball.vx = (dx / length) * shotSpeed;
  ball.vy = (dy / length) * shotSpeed;
  setBallLift(shotSpeed, options.superShot || shotSpeed >= SETTINGS.hardShotLiftThreshold);
  ball.owner = null;
  state = "shot";
  currentShooter = shooter;
  currentShotTarget = target;
  if (isOffBallAttacker(shooter)) {
    clearReleaseOffsideSnapshot();
  }
  shotSaveAttempted = false;
  shotDangerSnapshot = isHighDangerChance(shooter);
  startGoalieDive(target);
  roundTitle.textContent = `${shooter.name} shoots!`;
}

function getShotTarget(accurate, superShot = false) {
  if (!accurate) {
    return {
      x: FIELD.goalX + 10,
      y: randomBetween(FIELD.goalTop - 90, FIELD.goalTop + FIELD.goalHeight + 90)
    };
  }

  if (superShot) {
    const topCorner = FIELD.goalTop + FIELD.goalHeight * 0.08;
    const bottomCorner = FIELD.goalTop + FIELD.goalHeight * 0.92;
    const targetY = Math.abs(goalie.y - topCorner) > Math.abs(goalie.y - bottomCorner) ? topCorner : bottomCorner;

    return {
      x: FIELD.goalX + FIELD.goalDepth * 0.92,
      y: targetY
    };
  }

  return {
    x: FIELD.goalX + 10,
    y: randomBetween(FIELD.goalTop + 24, FIELD.goalTop + FIELD.goalHeight - 24)
  };
}

function getPassIntoRunScore(receiver) {
  const ballSpeed = Math.hypot(ball.vx, ball.vy);

  if (ballSpeed < 0.15) {
    return 0.15;
  }

  const futureBall = predictBallPosition(10);
  const receiverSpeed = Math.hypot(receiver.vx || 0, receiver.vy || 0);
  const receiverAngle = receiverSpeed > 0.04
    ? Math.atan2(receiver.vy || 0, receiver.vx || 0)
    : Math.atan2(receiver.targetY - receiver.y, receiver.targetX - receiver.x);
  const runX = Math.cos(receiverAngle);
  const runY = Math.sin(receiverAngle);
  const passAngle = Math.atan2(ball.vy, ball.vx);
  const alignment = clamp((Math.cos(passAngle - receiverAngle) + 1) / 2, 0, 1);
  const leadAlongRun = (futureBall.x - receiver.x) * runX + (futureBall.y - receiver.y) * runY;
  const leadScore = clamp((leadAlongRun - SETTINGS.receiveDistance * 0.15) / (FIELD.height * 0.08), 0, 1);
  const goalwardScore = clamp(ball.vx / ballSpeed, 0, 1);

  return clamp(leadScore * 0.52 + alignment * 0.34 + goalwardScore * 0.14, 0, 1);
}

function getReceiveQualityFloor(receiver, runScore, looseBall = false) {
  if (looseBall) {
    return isInsidePenaltyBox(receiver)
      ? lerp(0.72, 0.86, runScore)
      : lerp(0.52, 0.68, runScore);
  }

  return isInsidePenaltyBox(receiver)
    ? lerp(0.76, 0.9, runScore)
    : lerp(0.62, 0.8, runScore);
}

function setCompletedPassQuality(receiver, options = {}) {
  const runScore = getPassIntoRunScore(receiver);
  const floor = options.floor ?? getReceiveQualityFloor(receiver, runScore, options.looseBall);
  const runAdjustment = runScore * SETTINGS.passIntoRunQualityBonus - (1 - runScore) * 0.06;

  lastPassRunScore = runScore;
  lastPassQuality = clamp(Math.max(getCleanPassQuality(receiver, runScore), floor) + runAdjustment, 0, 1);
}

function getPassPraise(quality, carrying, receiver = getActiveReceiver()) {
  if (lastPassRunScore >= 0.72) {
    return {
      text: "INTO THE RUN!",
      detail: carrying ? `${receiver.name} can attack the gap` : `${receiver.name} finishes in stride`
    };
  }

  if (lastPassRunScore <= 0.34) {
    return {
      text: "TO FEET",
      detail: `${receiver.name} has to settle and restart`
    };
  }

  if (quality >= 0.92) {
    return {
      text: "PERFECT PASS!",
      detail: carrying ? `${receiver.name} can drive closer` : `${receiver.name} has a clean finish`
    };
  }

  if (quality >= 0.84) {
    return {
      text: "GREAT PASS!",
      detail: carrying ? `${receiver.name} attacks the space` : `${receiver.name} receives in stride`
    };
  }

  if (quality >= 0.72) {
    return {
      text: "CLEAN PASS!",
      detail: `${receiver.name} sets up the shot`
    };
  }

  return {
    text: "PASS RECEIVED",
    detail: `${receiver.name} adjusts quickly`
  };
}

function getReceiverCarryTarget(receiver = getActiveReceiver()) {
  const outsideBox = !isInsidePenaltyBox(receiver);
  const minimumQuality = outsideBox ? 0.56 : 0.68;

  if (lastPassQuality < minimumQuality || lastPassRunScore < 0.22) {
    return null;
  }

  const maxCarryX = FIELD.goalX - FIELD.height * 0.058;
  const roomToGoal = maxCarryX - receiver.x;

  if (roomToGoal < FIELD.height * 0.035) {
    return null;
  }

  const nearestFrontDefender = defenders.reduce((closest, defender) => {
    if (defender.x < receiver.x - FIELD.height * 0.035) {
      return closest;
    }

    return Math.min(closest, distance(defender, receiver));
  }, Number.POSITIVE_INFINITY);
  const immediateSpaceNeeded = outsideBox ? FIELD.height * 0.058 : FIELD.height * 0.085;
  const hasImmediateSpace = nearestFrontDefender > immediateSpaceNeeded;

  if (!hasImmediateSpace) {
    return null;
  }

  const passFactor = clamp((lastPassQuality - minimumQuality) / 0.28, 0, 1);
  const spaceFactor = clamp((nearestFrontDefender - immediateSpaceNeeded) / (FIELD.height * 0.26), 0, 1);
  const boxLeft = FIELD.goalX - MARKINGS.penaltyWidth;
  const pushTowardBox = outsideBox ? clamp(boxLeft + FIELD.height * 0.07 - receiver.x, 0, FIELD.height * 0.18) : 0;
  const wantedCarry = FIELD.height * (outsideBox ? 0.07 : 0.04) +
    passFactor * FIELD.height * (outsideBox ? 0.09 : 0.07) +
    spaceFactor * FIELD.height * (outsideBox ? 0.065 : 0.045) +
    pushTowardBox;
  const buildTarget = (carryDistance) => ({
    x: clamp(receiver.x + Math.min(carryDistance, roomToGoal), FIELD.padding + 40, maxCarryX),
    y: clamp(
      receiver.y + (FIELD.height / 2 - receiver.y) * 0.22,
      FIELD.goalTop + FIELD.height * 0.055,
      FIELD.goalTop + FIELD.goalHeight - FIELD.height * 0.055
    )
  });
  const runwayWidth = FIELD.height * (outsideBox ? 0.032 : 0.042);
  const isCarryTargetCrowded = (target) => defenders.some((defender) => {
    const laneAmount = getSegmentProjectionAmount(defender, receiver, target);
    const blocksRunway =
      laneAmount > 0.12 &&
      laneAmount < 1.04 &&
      distanceToSegment(defender, receiver, target) < runwayWidth;
    const closesTarget =
      defender.x > receiver.x - FIELD.height * 0.02 &&
      distance(defender, target) < FIELD.height * (outsideBox ? 0.05 : 0.07);

    return blocksRunway || closesTarget;
  });
  const carryOptions = [wantedCarry, wantedCarry * 0.78, wantedCarry * 0.58, wantedCarry * 0.42]
    .filter((carryDistance) => carryDistance > FIELD.height * 0.028);

  for (const carryDistance of carryOptions) {
    const target = buildTarget(carryDistance);

    if (!isCarryTargetCrowded(target)) {
      return target;
    }
  }

  return null;
}

function getReceiveDuration(carryTarget, receiver = getActiveReceiver()) {
  if (!carryTarget) {
    return SETTINGS.receiveShotDelayFrames;
  }

  const speed = Math.max(SETTINGS.playerMoveSpeed * SETTINGS.gameSpeed, 0.1);
  const carryFrames = Math.ceil(distance(receiver, carryTarget) / speed);
  const setShotFrames = Math.floor(SETTINGS.receiveShotDelayFrames * 0.48);

  return clamp(carryFrames + setShotFrames, SETTINGS.receiveShotDelayFrames, SETTINGS.receiveShotDelayFrames + SETTINGS.receiveCarryMaxFrames);
}

function startReceiveAnimation(receiver = getActiveReceiver()) {
  activeReceiver = receiver;
  receiveCarryTarget = getReceiverCarryTarget(receiver);
  receiverSettleDuration = lastPassRunScore < SETTINGS.passIntoRunThreshold
    ? Math.round(lerp(SETTINGS.directPassSettleMaxFrames, SETTINGS.directPassSettleMinFrames, lastPassRunScore / SETTINGS.passIntoRunThreshold))
    : 0;
  receiverSettleTimer = receiverSettleDuration;
  receiveDuration = getReceiveDuration(receiveCarryTarget, receiver) + receiverSettleDuration;
  receiveTimer = receiveDuration;
  receiveShotTarget = getReceiverAimedShotTarget(receiver);
  ball.owner = receiver.ownerKey;
  ball.vx = 0;
  ball.vy = 0;
  ball.z = 0;
  ball.vz = 0;
  state = "receive";
  currentShooter = receiver;

  if (receiverSettleTimer > 0) {
    receiver.vx = 0;
    receiver.vy = 0;
    receiver.accelTimer = 0;
  }

  const praise = getPassPraise(lastPassQuality, Boolean(receiveCarryTarget), receiver);
  passPraiseText = praise.text;
  passPraiseDetail = praise.detail;
  passPraiseTimer = SETTINGS.passPraiseFrames;
  roundTitle.textContent = receiveCarryTarget
    ? `${praise.text} ${receiver.name} drives forward`
    : receiverSettleTimer > 0
      ? `${praise.text} ${receiver.name} settles first`
      : `${praise.text} ${receiver.name} sets up the shot`;
}

function updateReceiveAnimation() {
  if (state !== "receive") {
    return;
  }

  const receiver = getActiveReceiver();

  if (receiverSettleTimer > 0) {
    receiverSettleTimer -= 1;
    receiveTimer -= 1;

    if (receiverSettleTimer === 0) {
      triggerDirectionAcceleration(receiver);
    }

    return;
  }

  if (receiveCarryTarget && distance(receiver, receiveCarryTarget) < FIELD.height * 0.012) {
    receiveCarryTarget = null;
    receiveTimer = Math.min(receiveTimer, Math.floor(SETTINGS.receiveShotDelayFrames * 0.6));
  }

  receiveTimer -= 1;

  if (receiveTimer <= 0) {
    receiveTimer = 0;
    receiveCarryTarget = null;
    receiveShotTarget = getReceiverAimedShotTarget(receiver);
    shootAtGoal(receiver, { superShot: true, target: receiveShotTarget });
  }
}

function getReceiverAimedShotTarget(receiver = getActiveReceiver()) {
  const topCorner = FIELD.goalTop + FIELD.goalHeight * 0.07;
  const bottomCorner = FIELD.goalTop + FIELD.goalHeight * 0.93;
  const idealY = Math.abs(goalie.y - topCorner) > Math.abs(goalie.y - bottomCorner) ? topCorner : bottomCorner;
  const shootingRating = getRating(receiver.name, "SHO");
  const skillControl = clamp((shootingRating - BASE_RATING) / (MAX_RATING - BASE_RATING), 0, 1);
  const errorRange = FIELD.goalHeight * clamp(
    0.095 - skillControl * 0.045 - lastPassQuality * 0.025 - lastPassRunScore * 0.035 + (1 - lastPassRunScore) * 0.02,
    0.018,
    0.11
  );
  const drift = randomBetween(-errorRange, errorRange);

  return {
    x: FIELD.goalX + FIELD.goalDepth * 0.98,
    y: clamp(idealY + drift, FIELD.goalTop - FIELD.goalHeight * 0.05, FIELD.goalTop + FIELD.goalHeight * 1.05)
  };
}

function isInsidePenaltyBox(player) {
  const boxLeft = FIELD.goalX - MARKINGS.penaltyWidth;
  const boxTop = FIELD.height / 2 - MARKINGS.penaltyHeight / 2;
  const boxBottom = FIELD.height / 2 + MARKINGS.penaltyHeight / 2;

  return player.x >= boxLeft && player.x <= FIELD.goalX && player.y >= boxTop && player.y <= boxBottom;
}

function startGoalieDive(target) {
  const anticipation = getAbilityFactor(goalie.name, "DEF", 0.006) * getAbilityFactor(goalie.name, "PAC", 0.004);
  const receiverShot = isOffBallAttacker(currentShooter);
  const readWindow = receiverShot
    ? FIELD.goalHeight * (0.18 + lastPassQuality * 0.18)
    : FIELD.goalHeight * 0.14;
  const lateRead = randomBetween(-readWindow, readWindow) / anticipation;

  goalie.diveStartX = goalie.x;
  goalie.diveStartY = goalie.y;
  goalie.diveY = clamp(target.y + lateRead, FIELD.goalTop + SETTINGS.playerRadius, FIELD.goalTop + FIELD.goalHeight - SETTINGS.playerRadius);
  goalie.diveTargetY = goalie.diveY;
  goalie.diveTargetX = clamp(goalie.baseX - FIELD.height * 0.045, FIELD.goalX - MARKINGS.penaltyWidth, goalie.baseX);
  goalie.diveDirection = goalie.diveY >= goalie.y ? 1 : -1;
  goalie.diveDuration = receiverShot ? SETTINGS.goalieDiveFrames * 2 : SETTINGS.goalieDiveFrames;
  goalie.diveTimer = goalie.diveDuration;
  goalie.diving = true;
}

function cancelDrag() {
  dragging = false;
  dragStart = null;
  dragPoint = null;
  dragStartTime = 0;
}

function updateAimingShooterSpeedScale() {
  const targetScale = dragging && state === "ready" ? SETTINGS.aimingMoveSpeedScale : 1;

  aimingShooterSpeedScale += (targetScale - aimingShooterSpeedScale) * SETTINGS.aimingSpeedBlend;
  if (Math.abs(aimingShooterSpeedScale - targetScale) < 0.01) {
    aimingShooterSpeedScale = targetScale;
  }
}

function spawnGoalEffects() {
  const impactY = clamp(ball.y, FIELD.goalTop, FIELD.goalTop + FIELD.goalHeight);

  netBendTimer = SETTINGS.netBendFrames;
  netBendY = impactY;
  netBendX = clamp(ball.x, FIELD.goalX, FIELD.goalX + FIELD.goalDepth * 2.2);
  goalFlashTimer = SETTINGS.goalFlashFrames;
  cameraShakeTimer = SETTINGS.cameraShakeFrames;
  speedLineTimer = SETTINGS.speedLineFrames;
  goalParticles = [];

  for (let i = 0; i < SETTINGS.goalParticleCount; i += 1) {
    const angle = randomBetween(-Math.PI * 0.85, Math.PI * 0.85);
    const speed = randomBetween(2.4, 9.8);
    const warm = i % 3;

    goalParticles.push({
      x: FIELD.goalX + randomBetween(4, FIELD.goalDepth * 1.5),
      y: impactY + randomBetween(-FIELD.goalHeight * 0.26, FIELD.goalHeight * 0.26),
      vx: Math.cos(angle) * speed + randomBetween(1.2, 5.8),
      vy: Math.sin(angle) * speed,
      life: randomBetween(36, 72),
      maxLife: 72,
      size: randomBetween(2.4, 7.8),
      color: warm === 0 ? "#ffffff" : warm === 1 ? "#f4c542" : "#ff4054"
    });
  }
}

function updateGoalEffects() {
  if (netBendTimer > 0) {
    netBendTimer -= 1;
  }

  if (goalFlashTimer > 0) {
    goalFlashTimer -= 1;
  }

  if (cameraShakeTimer > 0) {
    cameraShakeTimer -= 1;
  }

  if (speedLineTimer > 0) {
    speedLineTimer -= 1;
  }

  goalParticles = goalParticles
    .map((particle) => ({
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      vx: particle.vx * 0.96,
      vy: particle.vy * 0.96 + 0.08,
      life: particle.life - 1
    }))
    .filter((particle) => particle.life > 0);
}

function setOutcome(message) {
  if (["goal", "saved", "miss", "offside", "blocked", "tackled"].includes(state)) {
    return;
  }

  if (message === "GOAL!") {
    state = "goal";
  } else if (message === "Saved!") {
    state = "saved";
  } else if (message === "Offside!") {
    state = "offside";
  } else if (message === "Blocked!") {
    state = "blocked";
  } else if (message === "Tackled!") {
    state = "tackled";
  } else {
    state = "miss";
  }

  recordAttempt(message);
  cancelDrag();
  roundTitle.textContent = message;
  if (state === "goal") {
    spawnGoalEffects();
  }
  outcomeTimer = SETTINGS.restartDelayFrames;
}

function defenderCanTacklePasser(defender, reach) {
  const closeEnough = distance(defender, passer) <= reach;
  const goalSideOrLevel = defender.x >= passer.x;
  const bodyContact = Math.abs(defender.y - passer.y) <= SETTINGS.playerRadius * 2.2;

  return closeEnough && goalSideOrLevel && bodyContact;
}

function defenderCanTackleScorer(defender, reach) {
  const receiver = getActiveReceiver();

  if (ball.owner !== receiver?.ownerKey) {
    return false;
  }

  const closeEnough = distance(defender, receiver) <= reach;
  const bodyContact = Math.abs(defender.y - receiver.y) <= SETTINGS.playerRadius * 2.25;
  const closeEnoughFromBehind = defender.x > receiver.x - SETTINGS.playerRadius * 1.4;

  return closeEnough && bodyContact && closeEnoughFromBehind;
}

function goalieCanClaimBallNow() {
  if (ball.owner !== null || !["pass", "shot"].includes(state) || !isPointInsidePenaltyBox(ball)) {
    return false;
  }

  const ballSpeed = Math.hypot(ball.vx, ball.vy);
  const claimSpeed = state === "pass" ? SETTINGS.goalieClaimPassSpeed : SETTINGS.goalieClaimShotSpeed;
  const passInterceptionSpeed = Math.max(claimSpeed, SETTINGS.shotSpeed * 1.25);
  const claimDistance = state === "pass"
    ? SETTINGS.looseBallClaimDistance * 1.8
    : SETTINGS.looseBallClaimDistance * 1.25;

  const committedToClaim = (goalie.claimCommitTimer || 0) > 0;

  return (committedToClaim || ballSpeed <= (state === "pass" ? passInterceptionSpeed : claimSpeed)) &&
    distance(goalie, ball) <= claimDistance;
}

function isBallFullyOutsidePitch() {
  const radius = SETTINGS.ballRadius;
  const left = FIELD.padding - radius;
  const right = FIELD.goalX + radius;
  const top = FIELD.padding - radius;
  const bottom = FIELD.height - FIELD.padding + radius;

  return ball.x < left || ball.x > right || ball.y < top || ball.y > bottom;
}

function endRunForBallOut(message) {
  setOutcome(message);
  finishRun("Ball out");
}

function checkCollisions() {
  const ballOutsidePitch = isBallFullyOutsidePitch();

  if (["pass", "shot"].includes(state) && ballOutsidePitch && !(state === "shot" && ball.x >= FIELD.goalX)) {
    endRunForBallOut(state === "pass" ? "Missed pass!" : "Missed shot!");
    return;
  }

  if (goalieCanClaimBallNow()) {
    catchBallByGoalie();
    setOutcome("Saved!");
    return;
  }

  const passReceiver = state === "pass" ? getBestReceiverForLooseBall(SETTINGS.receiveDistance) : null;

  if (passReceiver) {
    activeReceiver = passReceiver;
    if (isPlayerOffsideOnReception(passReceiver)) {
      ball.vx = 0;
      ball.vy = 0;
      ball.z = 0;
      ball.vz = 0;
      setOutcome("Offside!");
      return;
    }

    setCompletedPassQuality(passReceiver);
    ball.x = passReceiver.x + SETTINGS.playerRadius + 4;
    ball.y = passReceiver.y;
    startReceiveAnimation(passReceiver);
    return;
  }

  if (isLooseBall()) {
    const claimDistance = SETTINGS.looseBallClaimDistance;

    if (distance(goalie, ball) <= claimDistance && isPointInsidePenaltyBox(ball)) {
      setOutcome("Saved!");
      return;
    }

    const looseReceiver = getBestReceiverForLooseBall(claimDistance);

    if (looseReceiver) {
      activeReceiver = looseReceiver;
      if (isPlayerOffsideOnReception(looseReceiver)) {
        ball.vx = 0;
        ball.vy = 0;
        ball.z = 0;
        ball.vz = 0;
        setOutcome("Offside!");
        return;
      }

      setCompletedPassQuality(looseReceiver, { looseBall: true });
      ball.x = looseReceiver.x + SETTINGS.playerRadius + 4;
      ball.y = looseReceiver.y;
      startReceiveAnimation(looseReceiver);
      return;
    }

    if (defenders.some((defender) => distance(defender, ball) <= claimDistance)) {
      setOutcome("Blocked!");
      return;
    }

    if (distance(passer, ball) <= claimDistance) {
      ball.owner = "passer";
      ball.vx = 0;
      ball.vy = 0;
      ball.z = 0;
      ball.vz = 0;
      clearReleaseOffsideSnapshot();
      state = "ready";
      roundTitle.textContent = `${passer.name} recovers`;
      return;
    }
  }

  const shotReceiver = state === "shot" ? getBestReceiverForLooseBall(SETTINGS.receiveDistance) : null;

  if (shotReceiver && currentShooter !== shotReceiver) {
    activeReceiver = shotReceiver;
    if (isPlayerOffsideOnReception(shotReceiver)) {
      ball.vx = 0;
      ball.vy = 0;
      ball.z = 0;
      ball.vz = 0;
      setOutcome("Offside!");
      return;
    }

    setCompletedPassQuality(shotReceiver, { floor: lerp(0.58, 0.76, getPassIntoRunScore(shotReceiver)) });
    ball.x = shotReceiver.x + SETTINGS.playerRadius + 4;
    ball.y = shotReceiver.y;
    startReceiveAnimation(shotReceiver);
    return;
  }

  if (state === "ready" && defenders.some((defender) =>
    defenderCanTacklePasser(defender, SETTINGS.passerBlockDistance *
      getAbilityFactor(defender.name, "DEF", 0.006) *
      getAbilityFactor(defender.name, "PHY", 0.004))
  )) {
    setOutcome("Tackled!");
    return;
  }

  if (state === "ready" && isAnyAttackerOffside() && defenders.some((defender) => defenderCanTacklePasser(
    defender,
    SETTINGS.tackleDistance * getAbilityFactor(defender.name, "PHY", 0.006)
  ))) {
    setOutcome("Tackled!");
    return;
  }

  if (state === "receive" && defenders.some((defender) => defenderCanTackleScorer(
    defender,
    SETTINGS.scorerTackleDistance *
      getAbilityFactor(defender.name, "DEF", 0.006) *
      getAbilityFactor(defender.name, "PHY", 0.004)
  ))) {
    setOutcome("Tackled!");
    return;
  }

  if ((state === "pass" || state === "shot") && defenders.some(defenderCanBlockBall)) {
    ball.vx *= -0.25;
    ball.vy *= 0.35;
    setOutcome("Blocked!");
    return;
  }

  if (state === "shot" && goalieCanReachShot()) {
    catchBallByGoalie();
    setOutcome("Saved!");
    return;
  }

  if (state === "shot" && ball.x >= FIELD.goalX) {
    const shotMessage = isShotActuallyInGoal() ? "GOAL!" : "Missed shot!";

    if (shotMessage === "GOAL!") {
      setOutcome(shotMessage);
    } else {
      endRunForBallOut(shotMessage);
    }
    return;
  }

}

function catchBallByGoalie() {
  ball.x = goalie.x - SETTINGS.ballRadius * 1.6;
  ball.y = goalie.y;
  ball.vx = 0;
  ball.vy = 0;
  ball.z = 0;
  ball.vz = 0;
  ball.owner = null;
}

function defenderCanBlockBall(defender) {
  const previousBall = {
    x: ball.prevX ?? ball.x,
    y: ball.prevY ?? ball.y
  };
  const pathAmount = getSegmentProjectionAmount(defender, previousBall, ball);
  const blockReach = SETTINGS.defenderBlockDistance * getAbilityFactor(defender.name, "DEF", 0.006);

  return pathAmount > 0.04 && distanceToSegment(defender, previousBall, ball) <= blockReach;
}

function getCleanPassQuality(receiver = getActiveReceiver(), runScore = lastPassRunScore) {
  const receiveGap = clamp(1 - distance(ball, receiver) / SETTINGS.receiveDistance, 0, 1);
  const passSpeed = Math.hypot(ball.vx, ball.vy);
  const speedQuality = clamp(passSpeed / SETTINGS.shotSpeed, 0.35, 1);
  const defenderPressure = defenders.reduce((closest, defender) => Math.min(closest, distance(defender, receiver)), Number.POSITIVE_INFINITY);
  const pressureQuality = clamp((defenderPressure - FIELD.height * 0.035) / (FIELD.height * 0.18), 0, 1);
  const boxQuality = isInsidePenaltyBox(receiver) ? 1 : 0.55;
  const depthQuality = clamp((receiver.x - fieldX(0.48)) / (FIELD.goalX - fieldX(0.48)), 0, 1);
  const strideQuality = clamp(runScore, 0, 1);

  return clamp(
    receiveGap * 0.14 +
      speedQuality * 0.13 +
      pressureQuality * 0.2 +
      boxQuality * 0.2 +
      depthQuality * 0.17 +
      strideQuality * 0.16,
    0,
    1
  );
}

function goalieCanReachShot() {
  if (shotSaveAttempted) {
    return false;
  }

  const diveReach = SETTINGS.blockDistance *
    getAbilityFactor(goalie.name, "DEF", 0.006) *
    getAbilityFactor(goalie.name, "PHY", 0.004) *
    (goalie.diving ? 2.35 : 1.12);
  const previousBall = {
    x: ball.prevX ?? ball.x,
    y: ball.prevY ?? ball.y
  };
  const pathAmount = getSegmentProjectionAmount(goalie, previousBall, ball);
  const pathDistance = distanceToSegment(goalie, previousBall, ball);
  const catchDistance = SETTINGS.goalieCatchDistance *
    getAbilityFactor(goalie.name, "DEF", 0.005) *
    getAbilityFactor(goalie.name, "PHY", 0.004);
  const inCatchZone = pathAmount > 0.02 && pathDistance <= catchDistance;

  if (inCatchZone) {
    shotSaveAttempted = true;
    return true;
  }

  const crossedKeeperPlane = previousBall.x <= goalie.x + SETTINGS.ballRadius && ball.x >= goalie.x - SETTINGS.ballRadius;
  const closeToKeeperX = Math.abs(ball.x - goalie.x) <= FIELD.height * 0.045;
  const onDivePath = pathDistance <= diveReach;

  if ((!crossedKeeperPlane && !closeToKeeperX) || !onDivePath) {
    return false;
  }

  shotSaveAttempted = true;

  const cleanReceiverShot = isOffBallAttacker(currentShooter) && lastPassQuality > 0.55;
  const activeShooter = currentShooter ?? passer;
  const shooterCloseness = getShooterGoalCloseness(activeShooter);
  const shooterRoom = getShooterKeeperRoom(activeShooter);
  const reachQuality = clamp(1 - pathDistance / diveReach, 0, 1);

  if (shotDangerSnapshot) {
    if (reachQuality > 0.96) {
      return true;
    }

    const dangerSaveChance = clamp(reachQuality * 0.22 - shooterRoom * 0.16, 0.01, 0.08);
    return Math.random() < dangerSaveChance;
  }

  if (cleanReceiverShot) {
    const insideBox = isInsidePenaltyBox(currentShooter);
    const cleanFinishPenalty = insideBox ? 0.2 : 0.12;
    const saveChance = clamp(
      reachQuality * 1.05 - lastPassQuality * 0.22 - cleanFinishPenalty - shooterCloseness * 0.1 - shooterRoom * 0.08,
      0.08,
      0.9
    );

    return reachQuality > 0.78 || Math.random() < saveChance;
  }

  if (reachQuality > 0.88) {
    return true;
  }

  const saveChance = clamp(reachQuality * 1.1 - shooterCloseness * 0.16 - shooterRoom * 0.12, 0.28, 0.96);
  return Math.random() < saveChance;
}

function update() {
  if (gameStarted && !runFinished) {
    updateRunTimer();
    if (getRunTimeRemaining() <= 0) {
      finishRun();
      updateGoalEffects();
      return;
    }
  }

  if (["lineup", "ready", "pass", "shot", "receive"].includes(state)) {
    roundFrame += 1;
  }

  if (state === "ready" && attackStarted) {
    attackFrame += 1;
  }

  updateAimingShooterSpeedScale();
  updateStamina();
  updatePasser();
  updateScorer();
  updateSupporter();
  updateGoalie();
  updateDefenders();
  updateBall();
  updateReceiveAnimation();
  checkCollisions();

  if (passPraiseTimer > 0) {
    passPraiseTimer -= 1;
  }

  if (outcomeTimer > 0) {
    outcomeTimer -= 1;
    if (outcomeTimer === 0 && !runFinished && ["goal", "saved", "miss", "offside", "blocked", "tackled"].includes(state)) {
      startRound();
    }
  }

  updateGoalEffects();
}

function drawField() {
  const left = FIELD.padding;
  const right = FIELD.goalX;
  const top = FIELD.padding;
  const bottom = FIELD.height - FIELD.padding;
  const middleY = FIELD.height / 2;
  const pitchScale = PITCH_SCALE;
  const penaltyWidth = MARKINGS.penaltyWidth;
  const penaltyHeight = MARKINGS.penaltyHeight;
  const goalAreaWidth = MARKINGS.goalAreaWidth;
  const goalAreaHeight = MARKINGS.goalAreaHeight;
  const penaltySpotX = right - MARKINGS.penaltySpotDistance;
  const penaltyBoxLeft = right - penaltyWidth;

  drawStadiumBackdrop(left, top, right, bottom, pitchScale);

  const grassGradient = ctx.createLinearGradient(left, top, right, bottom);
  grassGradient.addColorStop(0, "#3c8b43");
  grassGradient.addColorStop(0.42, "#2f7737");
  grassGradient.addColorStop(0.75, "#286332");
  grassGradient.addColorStop(1, "#1c4c27");
  ctx.fillStyle = grassGradient;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);

  drawBroadcastBoards(left, top, right, bottom, pitchScale);

  const stripeWidth = 92 * pitchScale;
  for (let x = left - stripeWidth; x < right + stripeWidth; x += stripeWidth) {
    const index = Math.floor((x - left) / stripeWidth);
    const shade = index % 2 === 0 ? "rgba(255, 255, 255, 0.055)" : "rgba(0, 0, 0, 0.085)";

    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x + stripeWidth, top);
    ctx.lineTo(x + stripeWidth * 0.82, bottom);
    ctx.lineTo(x - stripeWidth * 0.18, bottom);
    ctx.closePath();
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1.2 * pitchScale;
  for (let y = FIELD.padding; y < FIELD.height - FIELD.padding; y += 38 * pitchScale) {
    ctx.beginPath();
    ctx.moveTo(left, y + Math.sin(y * 0.012) * 3 * pitchScale);
    ctx.lineTo(right, y + Math.sin(y * 0.012 + 2.6) * 3 * pitchScale);
    ctx.stroke();
  }

  for (let i = 0; i < 220; i += 1) {
    const x = left + ((i * 97) % Math.floor(right - left));
    const y = top + ((i * 173) % Math.floor(bottom - top));
    const alpha = 0.04 + ((i % 7) * 0.006);

    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(x, y, 2.2 * pitchScale, 1.1 * pitchScale);
  }

  const goalMouthShade = ctx.createLinearGradient(FIELD.goalX - 58 * pitchScale, top, FIELD.goalX + 42 * pitchScale, top);
  goalMouthShade.addColorStop(0, "rgba(0, 0, 0, 0)");
  goalMouthShade.addColorStop(0.55, "rgba(0, 0, 0, 0.16)");
  goalMouthShade.addColorStop(1, "rgba(255, 255, 255, 0.08)");
  ctx.fillStyle = goalMouthShade;
  ctx.fillRect(FIELD.goalX - 58 * pitchScale, FIELD.padding, 100 * pitchScale, FIELD.height - FIELD.padding * 2);

  drawPitchWear(left, top, right, bottom, middleY, pitchScale);

  ctx.shadowColor = "rgba(255, 255, 255, 0.35)";
  ctx.shadowBlur = 7 * pitchScale;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.92)";
  ctx.lineWidth = 4.4 * pitchScale;
  ctx.strokeRect(left, top, right - left, bottom - top);

  // This view is one attacking half: the left boundary is the halfway line.
  ctx.beginPath();
  ctx.arc(left, middleY, MARKINGS.centerCircleRadius, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.beginPath();
  ctx.arc(left, middleY, 4 * pitchScale, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.92)";
  ctx.strokeRect(right - penaltyWidth, middleY - penaltyHeight / 2, penaltyWidth, penaltyHeight);
  ctx.strokeRect(right - goalAreaWidth, middleY - goalAreaHeight / 2, goalAreaWidth, goalAreaHeight);

  const arcLimit = clamp((penaltyBoxLeft - penaltySpotX) / MARKINGS.penaltyArcRadius, -1, 1);
  const arcStart = Math.acos(arcLimit);
  const arcEnd = Math.PI * 2 - arcStart;
  ctx.beginPath();
  ctx.arc(penaltySpotX, middleY, MARKINGS.penaltyArcRadius, arcStart, arcEnd);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  ctx.beginPath();
  ctx.arc(penaltySpotX, middleY, 4 * pitchScale, 0, Math.PI * 2);
  ctx.fill();

  const fieldVignette = ctx.createRadialGradient(FIELD.width * 0.48, FIELD.height * 0.48, FIELD.height * 0.18, FIELD.width * 0.5, FIELD.height * 0.5, FIELD.width * 0.65);
  fieldVignette.addColorStop(0, "rgba(255, 255, 255, 0.04)");
  fieldVignette.addColorStop(0.72, "rgba(0, 0, 0, 0)");
  fieldVignette.addColorStop(1, "rgba(0, 0, 0, 0.22)");
  ctx.fillStyle = fieldVignette;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);

  drawRealisticGoal();
}

function drawBroadcastBoards(left, top, right, bottom, pitchScale) {
  const boardHeight = 24 * pitchScale;
  const farY = top - boardHeight * 1.18;

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.28)";
  ctx.shadowBlur = 7 * pitchScale;
  ctx.shadowOffsetY = 3 * pitchScale;

  for (let x = left; x < right; x += 118 * pitchScale) {
    const segmentWidth = Math.min(118 * pitchScale, right - x);
    const theme = Math.floor((x - left) / (118 * pitchScale)) % 3;
    const boardGradient = ctx.createLinearGradient(x, farY, x + segmentWidth, farY + boardHeight);

    boardGradient.addColorStop(0, theme === 1 ? "#0f55aa" : "#064a9c");
    boardGradient.addColorStop(0.54, theme === 2 ? "#1182d6" : "#0b63bd");
    boardGradient.addColorStop(1, "#093a82");
    ctx.fillStyle = boardGradient;
    ctx.fillRect(x, farY, segmentWidth, boardHeight);

    if (theme === 1) {
      ctx.fillStyle = "#f3c544";
      ctx.beginPath();
      ctx.moveTo(x + segmentWidth * 0.08, farY);
      ctx.lineTo(x + segmentWidth * 0.28, farY);
      ctx.lineTo(x + segmentWidth * 0.18, farY + boardHeight);
      ctx.lineTo(x, farY + boardHeight);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = `900 ${13 * pitchScale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(theme === 2 ? "PASS" : "KLOSTER", x + segmentWidth * 0.54, farY + boardHeight * 0.55);
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
  ctx.lineWidth = 1.2 * pitchScale;
  ctx.beginPath();
  ctx.moveTo(left, top - 1.5 * pitchScale);
  ctx.lineTo(right, top - 1.5 * pitchScale);
  ctx.stroke();
  ctx.restore();
}

function drawPitchWear(left, top, right, bottom, middleY, pitchScale) {
  ctx.save();

  const boxLeft = FIELD.goalX - MARKINGS.penaltyWidth;
  const goalMouthX = FIELD.goalX - MARKINGS.goalAreaWidth * 0.45;
  const centerWear = ctx.createRadialGradient(boxLeft + MARKINGS.penaltyWidth * 0.45, middleY, FIELD.height * 0.08, boxLeft + MARKINGS.penaltyWidth * 0.45, middleY, FIELD.height * 0.38);
  centerWear.addColorStop(0, "rgba(236, 224, 151, 0.11)");
  centerWear.addColorStop(0.48, "rgba(192, 172, 99, 0.045)");
  centerWear.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = centerWear;
  ctx.fillRect(left, top, right - left, bottom - top);

  const mouthWear = ctx.createRadialGradient(goalMouthX, middleY, FIELD.height * 0.03, goalMouthX, middleY, FIELD.height * 0.18);
  mouthWear.addColorStop(0, "rgba(218, 203, 132, 0.16)");
  mouthWear.addColorStop(0.52, "rgba(180, 150, 86, 0.06)");
  mouthWear.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = mouthWear;
  ctx.fillRect(goalMouthX - FIELD.height * 0.22, middleY - FIELD.height * 0.22, FIELD.height * 0.44, FIELD.height * 0.44);

  ctx.globalAlpha = 0.72;
  for (let i = 0; i < 420; i += 1) {
    const x = left + ((i * 167) % Math.floor(right - left));
    const y = top + ((i * 313) % Math.floor(bottom - top));
    const length = (4 + (i % 11)) * pitchScale;
    const hue = i % 4 === 0 ? "rgba(255, 255, 255, 0.08)" : i % 4 === 1 ? "rgba(8, 45, 14, 0.12)" : "rgba(205, 230, 181, 0.055)";

    ctx.strokeStyle = hue;
    ctx.lineWidth = 0.8 * pitchScale;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y + Math.sin(i) * 1.6 * pitchScale);
    ctx.stroke();
  }

  ctx.restore();
}

function drawStadiumBackdrop(left, top, right, bottom, pitchScale) {
  const standGradient = ctx.createLinearGradient(0, 0, FIELD.width, FIELD.height);

  standGradient.addColorStop(0, "#08110d");
  standGradient.addColorStop(0.42, "#101a16");
  standGradient.addColorStop(1, "#030807");
  ctx.fillStyle = standGradient;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);

  const topStand = ctx.createLinearGradient(left, 0, right, top * 1.18);
  topStand.addColorStop(0, "rgba(7, 15, 15, 0.92)");
  topStand.addColorStop(0.5, "rgba(33, 45, 48, 0.86)");
  topStand.addColorStop(1, "rgba(4, 12, 10, 0.74)");
  ctx.fillStyle = topStand;
  ctx.fillRect(0, 0, FIELD.width, top * 1.18);

  const bottomStand = ctx.createLinearGradient(left, bottom, right, FIELD.height);
  bottomStand.addColorStop(0, "rgba(4, 11, 9, 0.7)");
  bottomStand.addColorStop(0.45, "rgba(37, 48, 49, 0.84)");
  bottomStand.addColorStop(1, "rgba(7, 13, 12, 0.96)");
  ctx.fillStyle = bottomStand;
  ctx.fillRect(0, bottom - 12 * pitchScale, FIELD.width, FIELD.height - bottom + 12 * pitchScale);

  for (let i = 0; i < 110; i += 1) {
    const rowTop = i % 2 === 0 ? top * 0.24 : FIELD.height - top * 0.44;
    const x = left + ((i * 53) % Math.floor(right - left));
    const y = rowTop + ((i * 29) % Math.floor(top * 0.48));
    const color = i % 5 === 0 ? "rgba(244, 197, 66, 0.5)" : i % 3 === 0 ? "rgba(255, 255, 255, 0.34)" : "rgba(88, 177, 255, 0.25)";

    ctx.fillStyle = color;
    ctx.fillRect(x, y, 4.8 * pitchScale, 2.4 * pitchScale);
  }

  const lightPositions = [
    { x: left + FIELD.height * 0.18, y: top * 0.2 },
    { x: right - FIELD.height * 0.22, y: top * 0.18 },
    { x: left + FIELD.height * 0.28, y: FIELD.height - top * 0.18 },
    { x: right - FIELD.height * 0.28, y: FIELD.height - top * 0.16 }
  ];

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  lightPositions.forEach((light, index) => {
    const glow = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, FIELD.height * 0.28);

    glow.addColorStop(0, index % 2 === 0 ? "rgba(255, 255, 255, 0.42)" : "rgba(196, 230, 255, 0.34)");
    glow.addColorStop(0.18, "rgba(244, 247, 226, 0.16)");
    glow.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(light.x, light.y, FIELD.height * 0.28, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawRealisticGoal() {
  const pitchScale = PITCH_SCALE;
  const elapsed = netBendTimer > 0 ? 1 - netBendTimer / SETTINGS.netBendFrames : 1;
  const impactKick = netBendTimer > 0 ? Math.sin(Math.min(elapsed * Math.PI * 1.65, Math.PI)) * Math.pow(1 - elapsed, 0.28) : 0;
  const elasticWave = netBendTimer > 0 ? Math.sin(elapsed * 30) * Math.pow(1 - elapsed, 1.25) : 0;
  const frontX = FIELD.goalX;
  const topY = FIELD.goalTop;
  const bottomY = FIELD.goalTop + FIELD.goalHeight;
  const frameDepth = FIELD.goalDepth * 2.62;
  const rearShiftY = 0;
  const lift = {
    x: -FIELD.goalDepth * 0.24,
    y: -FIELD.goalDepth * 0.86
  };
  const impactY = netBendY || (topY + bottomY) / 2;
  const impactX = netBendX || frontX + FIELD.goalDepth * 1.2;
  const bendAmount = FIELD.goalDepth * (2.55 * impactKick + 0.7 * elasticWave);
  const postWidth = 8.8 * pitchScale;
  const frontTopBase = { x: frontX, y: topY };
  const frontBottomBase = { x: frontX, y: bottomY };
  const rearTopBase = { x: frontX + frameDepth, y: topY + rearShiftY };
  const rearBottomBase = { x: frontX + frameDepth, y: bottomY + rearShiftY };
  const frontTopHigh = addPoint(frontTopBase, lift);
  const frontBottomHigh = addPoint(frontBottomBase, lift);
  const rearTopHigh = addPoint(rearTopBase, lift);
  const rearBottomHigh = addPoint(rearBottomBase, lift);

  function addPoint(point, offset) {
    return {
      x: point.x + offset.x,
      y: point.y + offset.y
    };
  }

  function lerpPoint(start, end, amount) {
    return {
      x: lerp(start.x, end.x, amount),
      y: lerp(start.y, end.y, amount)
    };
  }

  function quadPoint(corners, u, v) {
    const top = lerpPoint(corners[0], corners[1], u);
    const bottom = lerpPoint(corners[3], corners[2], u);

    return lerpPoint(top, bottom, v);
  }

  function netWarp(point, strength = 1) {
    if (netBendTimer <= 0) {
      return point;
    }

    const projectedY = point.y - lift.y * 0.55;
    const localImpact = Math.pow(1 - clamp(Math.abs(projectedY - impactY) / (FIELD.goalHeight * 0.42), 0, 1), 1.75);
    const depthRatio = clamp((point.x - frontX) / frameDepth, 0, 1);
    const ripple = Math.sin(depthRatio * Math.PI * 2.4 + elapsed * 28) * FIELD.goalDepth * 0.06 * impactKick * localImpact;

    return {
      x: point.x + bendAmount * localImpact * Math.pow(depthRatio, 0.8) * strength,
      y: point.y + ripple * strength
    };
  }

  function drawPath(points) {
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
  }

  function strokeTube(points, width, glow = 0.28, alpha = 1) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.strokeStyle = "rgba(4, 14, 9, 0.34)";
    ctx.lineWidth = width * 1.22;
    drawPath(points.map((point) => ({ x: point.x + 3.2 * pitchScale, y: point.y + 5.6 * pitchScale })));
    ctx.stroke();

    ctx.shadowColor = `rgba(255, 255, 255, ${glow})`;
    ctx.shadowBlur = 12 * pitchScale;
    ctx.strokeStyle = `rgba(244, 247, 242, ${alpha})`;
    ctx.lineWidth = width;
    drawPath(points);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.74})`;
    ctx.lineWidth = width * 0.32;
    drawPath(points.map((point) => ({ x: point.x - width * 0.08, y: point.y - width * 0.14 })));
    ctx.stroke();
    ctx.restore();
  }

  function drawNetPanel(corners, columns, rows, fillColor, lineColor, borderColor, warpStrength = 1) {
    const warpedCorners = corners.map((point) => netWarp(point, warpStrength));

    ctx.save();
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.moveTo(warpedCorners[0].x, warpedCorners[0].y);
    warpedCorners.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.closePath();
    ctx.fill();

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(255, 255, 255, 0.2)";
    ctx.shadowBlur = netBendTimer > 0 ? 5 * pitchScale : 1.5 * pitchScale;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 0.72 * pitchScale;

    for (let row = 1; row < rows; row += 1) {
      const v = row / rows;
      const points = [];

      for (let step = 0; step <= 18; step += 1) {
        points.push(netWarp(quadPoint(corners, step / 18, v), warpStrength));
      }

      drawPath(points);
      ctx.stroke();
    }

    for (let column = 1; column < columns; column += 1) {
      const u = column / columns;
      const points = [];

      for (let step = 0; step <= 18; step += 1) {
        points.push(netWarp(quadPoint(corners, u, step / 18), warpStrength));
      }

      drawPath(points);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.1 * pitchScale;
    drawPath([...warpedCorners, warpedCorners[0]]);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  const shadowGradient = ctx.createLinearGradient(frontX, topY, frontX + frameDepth, bottomY);

  shadowGradient.addColorStop(0, "rgba(0, 0, 0, 0.16)");
  shadowGradient.addColorStop(0.55, "rgba(0, 0, 0, 0.32)");
  shadowGradient.addColorStop(1, "rgba(0, 0, 0, 0.12)");
  ctx.fillStyle = shadowGradient;
  ctx.beginPath();
  ctx.moveTo(frontTopBase.x - 8 * pitchScale, frontTopBase.y + 13 * pitchScale);
  ctx.lineTo(rearTopBase.x + 18 * pitchScale, rearTopBase.y + 28 * pitchScale);
  ctx.lineTo(rearBottomBase.x + 18 * pitchScale, rearBottomBase.y + 28 * pitchScale);
  ctx.lineTo(frontBottomBase.x - 8 * pitchScale, frontBottomBase.y + 13 * pitchScale);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  drawNetPanel(
    [frontTopHigh, rearTopHigh, rearBottomHigh, frontBottomHigh],
    10,
    9,
    "rgba(242, 250, 248, 0.038)",
    netBendTimer > 0 ? "rgba(255, 255, 255, 0.58)" : "rgba(244, 250, 248, 0.24)",
    "rgba(255, 255, 255, 0.18)",
    1
  );

  drawNetPanel(
    [rearTopHigh, rearBottomHigh, rearBottomBase, rearTopBase],
    8,
    5,
    "rgba(238, 248, 248, 0.034)",
    netBendTimer > 0 ? "rgba(255, 255, 255, 0.54)" : "rgba(232, 242, 240, 0.22)",
    "rgba(255, 255, 255, 0.15)",
    1.16
  );

  drawNetPanel(
    [frontTopHigh, rearTopHigh, rearTopBase, frontTopBase],
    8,
    4,
    "rgba(238, 248, 248, 0.026)",
    netBendTimer > 0 ? "rgba(255, 255, 255, 0.5)" : "rgba(232, 242, 240, 0.2)",
    "rgba(255, 255, 255, 0.13)",
    0.82
  );

  drawNetPanel(
    [frontBottomHigh, rearBottomHigh, rearBottomBase, frontBottomBase],
    8,
    4,
    "rgba(238, 248, 248, 0.026)",
    netBendTimer > 0 ? "rgba(255, 255, 255, 0.5)" : "rgba(232, 242, 240, 0.2)",
    "rgba(255, 255, 255, 0.13)",
    0.82
  );

  if (netBendTimer > 0) {
    const ringAlpha = Math.pow(1 - elapsed, 0.7);
    const ringRadius = FIELD.goalHeight * (0.12 + elapsed * 0.68);

    ctx.save();
    ctx.globalAlpha = ringAlpha;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3.5 * pitchScale;
    ctx.beginPath();
    ctx.ellipse(impactX + FIELD.goalDepth * impactKick * 0.8, impactY - FIELD.goalDepth * 0.18, ringRadius * 0.9, ringRadius * 0.35, -0.12, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#f4c542";
    ctx.lineWidth = 2.2 * pitchScale;
    for (let i = 0; i < 18; i += 1) {
      const angle = (i / 18) * Math.PI * 2;
      const start = ringRadius * 0.34;
      const end = ringRadius * (0.72 + (i % 3) * 0.12);
      const sx = impactX + Math.cos(angle) * start;
      const sy = impactY + Math.sin(angle) * start * 0.42;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(impactX + Math.cos(angle) * end, impactY + Math.sin(angle) * end * 0.42);
      ctx.stroke();
    }
    ctx.restore();
  }

  strokeTube([frontTopBase, rearTopBase], postWidth * 0.46, 0.08, 0.74);
  strokeTube([frontBottomBase, rearBottomBase], postWidth * 0.46, 0.08, 0.74);
  strokeTube([rearTopBase, rearBottomBase], postWidth * 0.42, 0.06, 0.58);
  strokeTube([rearTopBase, rearTopHigh], postWidth * 0.78, 0.18, 0.9);
  strokeTube([rearBottomBase, rearBottomHigh], postWidth * 0.78, 0.18, 0.9);
  strokeTube([rearTopHigh, rearBottomHigh], postWidth * 0.74, 0.18, 0.9);
  strokeTube([frontTopHigh, rearTopHigh], postWidth * 0.72, 0.16, 0.92);
  strokeTube([frontBottomHigh, rearBottomHigh], postWidth * 0.72, 0.16, 0.92);
  strokeTube([frontTopBase, frontTopHigh], postWidth * 1.08, 0.34, 1);
  strokeTube([frontBottomBase, frontBottomHigh], postWidth * 1.08, 0.34, 1);
  strokeTube([frontTopHigh, frontBottomHigh], postWidth * 1.12, 0.38, 1);

  ctx.save();
  ctx.shadowColor = "rgba(255, 255, 255, 0.42)";
  ctx.shadowBlur = 6 * pitchScale;
  [frontTopHigh, frontBottomHigh, rearTopHigh, rearBottomHigh].forEach((post, index) => {
    const radius = postWidth * (index < 2 ? 0.34 : 0.24);
    const cap = ctx.createRadialGradient(post.x - radius * 0.28, post.y - radius * 0.32, radius * 0.1, post.x, post.y, radius);

    cap.addColorStop(0, "rgba(255, 255, 255, 1)");
    cap.addColorStop(0.58, "rgba(238, 242, 236, 0.98)");
    cap.addColorStop(1, "rgba(185, 198, 187, 0.9)");
    ctx.fillStyle = cap;
    ctx.beginPath();
    ctx.arc(post.x, post.y, radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawGoal() {
  const pitchScale = PITCH_SCALE;
  const elapsed = netBendTimer > 0 ? 1 - netBendTimer / SETTINGS.netBendFrames : 1;
  const impactKick = netBendTimer > 0 ? Math.sin(Math.min(elapsed * Math.PI * 1.65, Math.PI)) * Math.pow(1 - elapsed, 0.28) : 0;
  const elasticWave = netBendTimer > 0 ? Math.sin(elapsed * 30) * Math.pow(1 - elapsed, 1.25) : 0;
  const frontX = FIELD.goalX;
  const topY = FIELD.goalTop;
  const bottomY = FIELD.goalTop + FIELD.goalHeight;
  const backX = FIELD.goalX + FIELD.goalDepth * 2.7;
  const backTopY = topY - FIELD.goalDepth * 1.08;
  const backBottomY = bottomY + FIELD.goalDepth * 0.86;
  const impactY = netBendY || (topY + bottomY) / 2;
  const impactX = netBendX || frontX + FIELD.goalDepth * 1.2;
  const bendAmount = FIELD.goalDepth * (2.9 * impactKick + 0.86 * elasticWave);
  const postWidth = 7.2 * pitchScale;

  function getBendForT(t) {
    const y = lerp(topY, bottomY, t);
    const impact = Math.pow(1 - clamp(Math.abs(y - impactY) / (FIELD.goalHeight * 0.42), 0, 1), 1.7);
    const meshWave = netBendTimer > 0 ? Math.sin(t * 8 + elapsed * 34) * FIELD.goalDepth * 0.18 * Math.pow(1 - elapsed, 1.1) : 0;

    return bendAmount * impact + meshWave;
  }

  function frontPoint(t) {
    return {
      x: frontX,
      y: lerp(topY, bottomY, t)
    };
  }

  function backPoint(t) {
    const sag = Math.sin(t * Math.PI) * FIELD.goalDepth * 0.16;

    return {
      x: backX + getBendForT(t),
      y: lerp(backTopY, backBottomY, t) + sag
    };
  }

  function surfacePoint(s, t) {
    const front = frontPoint(t);
    const back = backPoint(t);
    const belly = Math.sin(s * Math.PI) * Math.sin(t * Math.PI) * FIELD.goalDepth * 0.12;
    const pull = getBendForT(t) * s * 0.22;

    return {
      x: lerp(front.x, back.x, s) + pull,
      y: lerp(front.y, back.y, s) + belly
    };
  }

  function netPath() {
    const frontTop = surfacePoint(0, 0);
    const backTop = surfacePoint(1, 0);
    const backBottom = surfacePoint(1, 1);
    const frontBottom = surfacePoint(0, 1);

    ctx.beginPath();
    ctx.moveTo(frontTop.x, frontTop.y);
    ctx.lineTo(backTop.x, backTop.y);
    ctx.lineTo(backBottom.x, backBottom.y);
    ctx.lineTo(frontBottom.x, frontBottom.y);
    ctx.closePath();
  }

  function strokeTube(points, width, glow = 0.32) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = `rgba(255, 255, 255, ${glow})`;
    ctx.shadowBlur = 9 * pitchScale;
    ctx.strokeStyle = "rgba(238, 241, 238, 0.98)";
    ctx.lineWidth = width;
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.78)";
    ctx.lineWidth = width * 0.36;
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x - width * 0.08, point.y - width * 0.08);
      } else {
        ctx.lineTo(point.x - width * 0.08, point.y - width * 0.08);
      }
    });
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.beginPath();
  ctx.moveTo(surfacePoint(0, 0).x - 9 * pitchScale, surfacePoint(0, 0).y + 15 * pitchScale);
  ctx.lineTo(surfacePoint(1, 0).x + 18 * pitchScale, surfacePoint(1, 0).y + 28 * pitchScale);
  ctx.lineTo(surfacePoint(1, 1).x + 18 * pitchScale, surfacePoint(1, 1).y + 28 * pitchScale);
  ctx.lineTo(surfacePoint(0, 1).x - 9 * pitchScale, surfacePoint(0, 1).y + 15 * pitchScale);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  const netFill = ctx.createLinearGradient(frontX, topY, backX + FIELD.goalDepth, bottomY);
  netFill.addColorStop(0, "rgba(255, 255, 255, 0.05)");
  netFill.addColorStop(0.36, "rgba(255, 255, 255, 0.16)");
  netFill.addColorStop(0.74, "rgba(238, 248, 250, 0.12)");
  netFill.addColorStop(1, "rgba(94, 152, 170, 0.06)");
  ctx.fillStyle = netFill;
  netPath();
  ctx.fill();

  ctx.save();
  netPath();
  ctx.clip();
  ctx.shadowColor = "rgba(255, 255, 255, 0.34)";
  ctx.shadowBlur = netBendTimer > 0 ? 8 * pitchScale : 2 * pitchScale;
  ctx.lineCap = "round";
  ctx.lineWidth = 0.95 * pitchScale;

  const drawSurfaceLine = (points, color, width = 0.95 * pitchScale) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
  };

  for (let t = 0.1; t < 0.98; t += 0.1) {
    const points = [];

    for (let s = 0; s <= 1.001; s += 0.08) {
      points.push(surfacePoint(s, t + Math.sin(s * Math.PI) * 0.015));
    }

    drawSurfaceLine(points, netBendTimer > 0 ? "rgba(255, 255, 255, 0.72)" : "rgba(238, 244, 242, 0.3)");
  }

  for (let s = 0.12; s < 0.98; s += 0.105) {
    const points = [];

    for (let t = 0; t <= 1.001; t += 0.08) {
      points.push(surfacePoint(s + Math.sin(t * Math.PI) * 0.014 * impactKick, t));
    }

    drawSurfaceLine(points, netBendTimer > 0 ? "rgba(255, 255, 255, 0.68)" : "rgba(238, 244, 242, 0.24)");
  }

  const drawHexMesh = () => {
    const cellS = 0.108;
    const cellT = 0.105;
    let row = 0;

    for (let t = 0.08; t < 0.96; t += cellT * 0.88) {
      const stagger = row % 2 === 0 ? 0 : cellS * 0.5;

      for (let s = 0.08 + stagger; s < 0.96; s += cellS) {
        const hex = [
          surfacePoint(s - cellS * 0.42, t - cellT * 0.2),
          surfacePoint(s, t - cellT * 0.5),
          surfacePoint(s + cellS * 0.42, t - cellT * 0.2),
          surfacePoint(s + cellS * 0.42, t + cellT * 0.22),
          surfacePoint(s, t + cellT * 0.52),
          surfacePoint(s - cellS * 0.42, t + cellT * 0.22),
          surfacePoint(s - cellS * 0.42, t - cellT * 0.2)
        ];

        drawSurfaceLine(
          hex,
          netBendTimer > 0 ? "rgba(255, 255, 255, 0.78)" : "rgba(246, 250, 247, 0.48)",
          0.78 * pitchScale
        );
      }

      row += 1;
    }
  };

  drawHexMesh();

  drawSurfaceLine([
    surfacePoint(0, 0),
    surfacePoint(1, 0),
    surfacePoint(1, 1),
    surfacePoint(0, 1),
    surfacePoint(0, 0)
  ], "rgba(255, 255, 255, 0.58)", 1.6 * pitchScale);
  ctx.restore();

  if (netBendTimer > 0) {
    const ringAlpha = Math.pow(1 - elapsed, 0.7);
    const ringRadius = FIELD.goalHeight * (0.12 + elapsed * 0.68);

    ctx.save();
    ctx.globalAlpha = ringAlpha;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3.5 * pitchScale;
    ctx.beginPath();
    ctx.ellipse(impactX + FIELD.goalDepth * impactKick * 0.8, impactY - FIELD.goalDepth * 0.18, ringRadius * 0.9, ringRadius * 0.35, -0.12, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#f4c542";
    ctx.lineWidth = 2.2 * pitchScale;
    for (let i = 0; i < 18; i += 1) {
      const angle = (i / 18) * Math.PI * 2;
      const start = ringRadius * 0.34;
      const end = ringRadius * (0.72 + (i % 3) * 0.12);
      const sx = impactX + Math.cos(angle) * start;
      const sy = impactY + Math.sin(angle) * start * 0.42;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(impactX + Math.cos(angle) * end, impactY + Math.sin(angle) * end * 0.42);
      ctx.stroke();
    }
    ctx.restore();
  }

  const frontTop = surfacePoint(0, 0);
  const frontBottom = surfacePoint(0, 1);
  const backTop = surfacePoint(1, 0);
  const backBottom = surfacePoint(1, 1);

  strokeTube([
    backTop,
    backBottom
  ], postWidth * 0.5, 0.12);
  strokeTube([
    frontTop,
    backTop
  ], postWidth * 0.7, 0.14);
  strokeTube([
    frontBottom,
    backBottom
  ], postWidth * 0.64, 0.12);
  strokeTube([
    frontTop,
    frontBottom
  ], postWidth * 1.18, 0.36);

  ctx.save();
  ctx.fillStyle = "rgba(246, 248, 244, 0.98)";
  ctx.shadowColor = "rgba(255, 255, 255, 0.34)";
  ctx.shadowBlur = 5 * pitchScale;
  [frontTop, frontBottom, backTop, backBottom].forEach((post) => {
    ctx.beginPath();
    ctx.arc(post.x, post.y, postWidth * 0.42, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawOffsideLine() {
  if (!["ready", "pass"].includes(state)) {
    return;
  }

  const lineX = state === "pass" ? getReceptionOffsideLine() : getOffsideLine();
  const offsideNow = state === "pass" ? isScorerOffsideOnReception() : isAnyAttackerOffside();
  const clampedLineX = clamp(lineX, FIELD.padding, FIELD.goalX);
  ctx.strokeStyle = offsideNow ? "rgba(240, 93, 79, 0.85)" : "rgba(244, 197, 66, 0.65)";
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 10]);
  ctx.beginPath();
  ctx.moveTo(clampedLineX, FIELD.padding);
  ctx.lineTo(clampedLineX, FIELD.height - FIELD.padding);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(10, 32, 16, 0.7)";
  ctx.fillRect(clampedLineX - 42, FIELD.padding + 8, 84, 24);
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 12px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("OFFSIDE", clampedLineX, FIELD.padding + 20);

  drawAssistantReferee(clampedLineX, offsideNow);
}

function drawAssistantReferee(lineX, offsideNow) {
  const sideY = FIELD.padding - 18 * PITCH_SCALE;
  const runPhase = roundFrame * 0.36;
  const stride = Math.sin(runPhase);
  const counter = Math.cos(runPhase);
  const bob = Math.abs(counter) * 1.8;
  const flagWave = Math.sin(roundFrame * 0.28) * 2.4;
  const label = "Collina";

  ctx.save();
  ctx.translate(lineX, sideY + bob);
  ctx.scale(0.58, 0.58);

  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.beginPath();
  ctx.ellipse(2, 33, 28, 7, -0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(244, 247, 242, 0.65)";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-18, 38);
  ctx.lineTo(18, 38);
  ctx.stroke();

  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 5.4;
  ctx.beginPath();
  ctx.moveTo(-7, 15);
  ctx.lineTo(-14 - stride * 5, 31 + Math.max(0, stride) * 6);
  ctx.moveTo(7, 15);
  ctx.lineTo(14 + stride * 5, 31 + Math.max(0, -stride) * 6);
  ctx.stroke();

  ctx.strokeStyle = "#151515";
  ctx.lineWidth = 3.8;
  ctx.beginPath();
  ctx.moveTo(-14 - stride * 5, 31 + Math.max(0, stride) * 6);
  ctx.lineTo(-24 - stride * 8, 35 + Math.max(0, -stride) * 6);
  ctx.moveTo(14 + stride * 5, 31 + Math.max(0, -stride) * 6);
  ctx.lineTo(24 + stride * 8, 35 + Math.max(0, stride) * 6);
  ctx.stroke();

  ctx.strokeStyle = "#101010";
  ctx.lineWidth = 5.8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-11, -3);
  ctx.lineTo(-20 - counter * 5, 11 - stride * 8);
  ctx.moveTo(11, -3);
  ctx.lineTo(23 + counter * 4, offsideNow ? -23 : 10 + stride * 7);
  ctx.stroke();

  ctx.strokeStyle = "#f1c49b";
  ctx.lineWidth = 4.4;
  ctx.beginPath();
  ctx.moveTo(-20 - counter * 5, 11 - stride * 8);
  ctx.lineTo(-25 - counter * 5, 18 - stride * 8);
  ctx.moveTo(23 + counter * 4, offsideNow ? -23 : 10 + stride * 7);
  ctx.lineTo(27 + counter * 4, offsideNow ? -32 : 18 + stride * 7);
  ctx.stroke();

  const shirtGradient = ctx.createLinearGradient(-13, -11, 13, 21);
  shirtGradient.addColorStop(0, "#2a2a2a");
  shirtGradient.addColorStop(0.58, "#080808");
  shirtGradient.addColorStop(1, "#000000");
  ctx.fillStyle = shirtGradient;
  ctx.beginPath();
  roundedRect(-13, -10, 26, 31, 7);
  ctx.fill();

  ctx.strokeStyle = "#f0f0f0";
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.moveTo(-6, -8);
  ctx.lineTo(0, -2);
  ctx.lineTo(6, -8);
  ctx.stroke();

  ctx.fillStyle = "#f4c542";
  ctx.beginPath();
  ctx.arc(-7, -1, 2.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#101010";
  ctx.lineWidth = 5.5;
  ctx.beginPath();
  ctx.moveTo(-8, 20);
  ctx.lineTo(8, 20);
  ctx.stroke();

  const flagBase = offsideNow ? { x: 27 + counter * 4, y: -32 } : { x: 27 + counter * 4, y: 18 + stride * 7 };
  const flagTop = offsideNow ? { x: 19 + counter * 4, y: -56 } : { x: 42 + counter * 4, y: 3 + stride * 7 };
  ctx.strokeStyle = "rgba(235, 240, 235, 0.96)";
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(flagBase.x, flagBase.y);
  ctx.lineTo(flagTop.x, flagTop.y);
  ctx.stroke();

  ctx.fillStyle = offsideNow ? "#ff4054" : "#f4c542";
  ctx.beginPath();
  ctx.moveTo(flagTop.x, flagTop.y);
  ctx.lineTo(flagTop.x + 18, flagTop.y + 7 + flagWave);
  ctx.lineTo(flagTop.x + 2, flagTop.y + 18);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#f1c49b";
  ctx.beginPath();
  ctx.arc(0, -21, 8.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.24)";
  ctx.beginPath();
  ctx.arc(-2.8, -23.8, 2.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#151515";
  ctx.lineWidth = 1.7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-5, -23);
  ctx.lineTo(-1, -24);
  ctx.moveTo(2, -24);
  ctx.lineTo(6, -23);
  ctx.moveTo(-3, -17);
  ctx.lineTo(4, -17);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.arc(0, -21, 8.5, -Math.PI * 0.82, -Math.PI * 0.18);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.font = `900 ${11 * PITCH_SCALE}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const labelWidth = Math.max(50 * PITCH_SCALE, ctx.measureText(label).width + 13 * PITCH_SCALE);
  const labelY = sideY + 68 * PITCH_SCALE;

  ctx.fillStyle = "rgba(4, 12, 8, 0.74)";
  ctx.beginPath();
  roundedRect(lineX - labelWidth / 2, labelY - 10 * PITCH_SCALE, labelWidth, 20 * PITCH_SCALE, 7 * PITCH_SCALE);
  ctx.fill();

  ctx.strokeStyle = offsideNow ? "rgba(255, 64, 84, 0.78)" : "rgba(244, 197, 66, 0.62)";
  ctx.lineWidth = 1.1 * PITCH_SCALE;
  ctx.beginPath();
  roundedRect(lineX - labelWidth / 2, labelY - 10 * PITCH_SCALE, labelWidth, 20 * PITCH_SCALE, 7 * PITCH_SCALE);
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.fillText(label, lineX, labelY + 0.5 * PITCH_SCALE);
  ctx.restore();
}

function getPlayerKit(player) {
  if (player.role === "Goalie") {
    return KITS.keeper;
  }

  return player.role === "Defender" ? KITS.germanyDark : KITS.germanyHome;
}

function drawChestGraphic(kit) {
  ctx.save();
  ctx.beginPath();
  roundedRect(-13, -8, 26, 30, 7);
  ctx.clip();

  ctx.fillStyle = kit.accentBlack;
  ctx.beginPath();
  ctx.moveTo(-13, -5);
  ctx.lineTo(0, 2);
  ctx.lineTo(13, -5);
  ctx.lineTo(13, 0);
  ctx.lineTo(0, 7);
  ctx.lineTo(-13, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = kit.accentRed;
  ctx.beginPath();
  ctx.moveTo(-13, 1);
  ctx.lineTo(0, 8);
  ctx.lineTo(13, 1);
  ctx.lineTo(13, 5);
  ctx.lineTo(0, 12);
  ctx.lineTo(-13, 5);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = kit.accentGold;
  ctx.beginPath();
  ctx.moveTo(-13, 6);
  ctx.lineTo(0, 13);
  ctx.lineTo(13, 6);
  ctx.lineTo(13, 10);
  ctx.lineTo(0, 17);
  ctx.lineTo(-13, 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function getRunAnimation(player) {
  const canAnimate = Number.isFinite(player.moveAngle) && !["goal", "saved", "miss", "offside", "blocked", "tackled"].includes(state);
  const phaseSeed = (player.phase || player.number || 1) * 1.37;
  const aimingCarrier = dragging && state === "ready" && player === passer;
  const sprinting = (player.sprintTimer || 0) > 0;
  const baseSpeed = SETTINGS.playerMoveSpeed * SETTINGS.gameSpeed || 1;
  const plannedSpeed = getPlayerPlannedSpeed(player);
  const actualSpeed = Math.hypot(player.vx || 0, player.vy || 0);
  const gaitSpeed = player === passer || actualSpeed < baseSpeed * 0.08 ? plannedSpeed : actualSpeed;
  const moving = canAnimate && gaitSpeed > baseSpeed * 0.06;
  const speedRatio = moving
    ? clamp(gaitSpeed / baseSpeed, 0.25, 2.2)
    : 0;
  const tempo = moving ? (aimingCarrier ? 0.18 : 0.33 + speedRatio * 0.13 + (sprinting ? 0.07 : 0)) : 0.08;
  const intensity = moving ? (aimingCarrier ? 0.36 : clamp(0.76 + speedRatio * 0.22, 0.84, 1.28)) : 0.16;
  const cycle = roundFrame * tempo + phaseSeed;
  const stride = Math.sin(cycle) * intensity;
  const counter = Math.cos(cycle) * intensity;
  const lift = Math.pow(Math.abs(counter), 0.72) * intensity;
  const drive = Math.sin(cycle);
  const cadenceSnap = Math.sin(cycle + Math.PI * 0.18);

  return {
    moving,
    aimingCarrier,
    stride,
    counter,
    lift,
    drive,
    speedRatio,
    bodyRotation: Number.isFinite(player.moveAngle) ? player.moveAngle + Math.PI / 2 : 0,
    bodyBob: Math.abs(counter) * (moving ? (aimingCarrier ? 0.65 : 1.45 + speedRatio * 0.34) : 0.35),
    headBob: Math.abs(counter) * (moving ? (aimingCarrier ? 0.42 : 0.74 + speedRatio * 0.18) : 0.2),
    torsoLean: moving ? clamp(counter * 0.012, -0.04, 0.04) : 0,
    forwardLean: moving ? clamp(-2.2 - speedRatio * 2.2, -6.2, -2.2) : 0,
    shoulderRoll: moving ? -counter * 1.35 : 0,
    hipRoll: moving ? counter * 0.72 : 0,
    legReach: moving ? 10.8 + speedRatio * 2.8 : 4,
    trailReach: moving ? 5.6 + speedRatio * 2.2 : 1.2,
    kneeLift: moving ? 7.4 + speedRatio * 3.2 : 2.4,
    armReach: moving ? 14.6 + speedRatio * 4.2 : 5,
    armSwing: moving ? clamp(0.78 + speedRatio * 0.22, 0.78, 1.24) : 0.16,
    footTurn: moving ? cadenceSnap * 0.2 : 0,
    contact: moving ? Math.abs(drive) : 0,
    plantWeight: moving ? Math.pow(Math.abs(drive), 0.65) : 0
  };
}

function drawRunWake(player, run, isDefender) {
  if (!run.moving) {
    return;
  }

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.moveAngle || 0);
  ctx.globalCompositeOperation = "screen";
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = isDefender ? "rgba(244, 197, 66, 0.5)" : "rgba(255, 255, 255, 0.62)";
  for (let i = 0; i < 4; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const y = 18 + side * (5 + i * 2);
    const start = -18 - i * 8;

    ctx.lineWidth = 2.4 - i * 0.25;
    ctx.beginPath();
    ctx.moveTo(start, y);
    ctx.lineTo(start - 28 - run.lift * 8, y + side * 3);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTurfContact(player, run, isDefender) {
  if (!run.moving) {
    return;
  }

  const angle = player.moveAngle || 0;
  const plantSide = run.stride >= 0 ? -1 : 1;
  const lateral = plantSide * (5 + Math.abs(run.stride) * 2.8);
  const behind = 19 + run.lift * 1.6;
  const footX = player.x + Math.cos(angle + Math.PI / 2) * lateral - Math.cos(angle) * behind;
  const footY = player.y + Math.sin(angle + Math.PI / 2) * lateral - Math.sin(angle) * behind;

  ctx.save();
  ctx.translate(footX, footY);
  ctx.rotate((player.moveAngle || 0) + Math.PI);
  ctx.globalAlpha = 0.16 + run.lift * 0.12;
  ctx.fillStyle = isDefender ? "rgba(244, 197, 66, 0.36)" : "rgba(255, 255, 255, 0.34)";
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.ellipse(-i * 5 - run.lift * 4, (i - 2) * 2.2, 2.4, 1.1, Math.sin(i) * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBootLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function strokeRunnerLimb(points, color, width, shadowAlpha = 0.28) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (shadowAlpha > 0) {
    ctx.strokeStyle = `rgba(4, 9, 8, ${shadowAlpha})`;
    ctx.lineWidth = width + 2.8;
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x + 1.8, point.y + 2.2);
      } else {
        ctx.lineTo(point.x + 1.8, point.y + 2.2);
      }
    });
    ctx.stroke();
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = Math.max(0.9, width * 0.22);
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x - 0.8, point.y - 0.7);
    } else {
      ctx.lineTo(point.x - 0.8, point.y - 0.7);
    }
  });
  ctx.stroke();
  ctx.restore();
}

function drawRunnerBoot(x, y, angle, planted, accent = "rgba(255, 255, 255, 0.58)") {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  if (planted) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
    ctx.beginPath();
    ctx.ellipse(-0.6, 2.2, 8.4, 2.7, 0.04, 0, Math.PI * 2);
    ctx.fill();
  }

  const bootLength = planted ? 9.4 : 8;
  const bootHeight = planted ? 3.15 : 2.7;

  ctx.fillStyle = "#111111";
  ctx.beginPath();
  ctx.moveTo(-bootLength * 0.58, -bootHeight * 0.78);
  ctx.lineTo(bootLength * 0.22, -bootHeight);
  ctx.quadraticCurveTo(bootLength * 0.68, -bootHeight * 0.72, bootLength, 0);
  ctx.quadraticCurveTo(bootLength * 0.62, bootHeight * 0.82, bootLength * 0.1, bootHeight);
  ctx.lineTo(-bootLength * 0.66, bootHeight * 0.75);
  ctx.quadraticCurveTo(-bootLength * 0.86, 0, -bootLength * 0.58, -bootHeight * 0.78);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.ellipse(1.6, -0.55, 2.6, 0.62, -0.16, 0, Math.PI * 2);
  ctx.fill();

  if (planted) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.36)";
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.arc(-3 + i * 3, bootHeight + 0.55, 0.72, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function traceRunnerTorso(yOffset = 0) {
  ctx.beginPath();
  ctx.moveTo(-12.4, -9 + yOffset);
  ctx.bezierCurveTo(-16.8, -1.5 + yOffset, -14.2, 13.2 + yOffset, -10.1, 20.4 + yOffset);
  ctx.quadraticCurveTo(0, 25 + yOffset, 10.1, 20.4 + yOffset);
  ctx.bezierCurveTo(14.2, 13.2 + yOffset, 16.8, -1.5 + yOffset, 12.4, -9 + yOffset);
  ctx.quadraticCurveTo(0, -13.2 + yOffset, -12.4, -9 + yOffset);
  ctx.closePath();
}

function drawStaminaBar(player) {
  if (!isTeamAttacker(player)) {
    return;
  }

  const stamina = getPlayerStamina(player);
  const staminaRatio = clamp(stamina / SETTINGS.maxStamina, 0, 1);
  const shouldShow = player === passer || isBallCarrier(player) || staminaRatio < 0.995 || player.sprintTimer > 0;

  if (!shouldShow) {
    return;
  }

  const width = 44;
  const height = 5;
  const x = player.x - width / 2;
  const y = player.y - SETTINGS.playerRadius - 34;
  const flash = (player.staminaFlashTimer || 0) > 0;
  const fillColor = staminaRatio > 0.48 ? "#4ee27f" : staminaRatio > 0.22 ? "#f4c542" : "#ff4054";

  ctx.save();
  ctx.fillStyle = flash ? "rgba(255, 255, 255, 0.34)" : "rgba(4, 12, 8, 0.58)";
  ctx.beginPath();
  roundedRect(x - 2, y - 2, width + 4, height + 4, 4);
  ctx.fill();

  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.beginPath();
  roundedRect(x, y, width, height, 3);
  ctx.fill();

  ctx.fillStyle = fillColor;
  ctx.beginPath();
  roundedRect(x, y, width * staminaRatio, height, 3);
  ctx.fill();
  ctx.restore();
}

function drawPlayer(player) {
  if (player.role === "Goalie" && player.diving) {
    drawDivingGoalie(player);
    return;
  }

  const isDefender = player.role === "Defender";
  const kit = getPlayerKit(player);
  const shortColor = kit.shorts;
  const sockColor = kit.socks;
  const skin = "#f1c49b";
  const spriteScale = 0.64;
  const run = getRunAnimation(player);
  const torsoY = run.forwardLean;
  const hipY = 16.6 + torsoY * 0.12;
  const shoulderY = -5 + torsoY;

  function makeLeg(side, drive) {
    const forward = clamp(Math.max(0, drive), 0, 1.35);
    const backward = clamp(Math.max(0, -drive), 0, 1.35);
    const hip = {
      x: side * (4.4 + run.hipRoll * 0.1),
      y: hipY
    };
    const knee = {
      x: side * (4 + forward * 0.9 - backward * 0.55) - side * run.hipRoll * 0.18,
      y: hipY + 8.4 - forward * run.kneeLift + backward * 3.8 - run.lift * 0.12
    };
    const foot = {
      x: side * (3.35 + backward * 0.95 - forward * 0.26) - side * run.counter * 0.42,
      y: hipY + 19.2 - forward * (run.legReach + 3.2) + backward * run.trailReach
    };

    return {
      side,
      drive,
      hip,
      knee,
      foot,
      planted: backward > 0.42 && run.contact > 0.38,
      bootAngle: -Math.PI / 2 + side * 0.03 + (drive > 0 ? -0.1 : 0.16) + run.footTurn * side
    };
  }

  function makeArm(side, drive) {
    const forward = clamp(Math.max(0, drive), 0, 1.35);
    const backward = clamp(Math.max(0, -drive), 0, 1.35);
    const pump = run.armSwing;
    const shoulder = {
      x: side * (13.8 + run.shoulderRoll * 0.08),
      y: shoulderY - 0.8
    };
    const elbow = {
      x: side * (17.6 - forward * 1.8 + backward * 2.6),
      y: shoulderY + 5.2 - forward * (10.2 * pump) + backward * (7.6 * pump)
    };
    const hand = {
      x: side * (16.2 - forward * 2.6 + backward * 3.4),
      y: shoulderY + 10.8 - forward * (run.armReach + 1.4) + backward * (8.6 + run.speedRatio * 2)
    };

    return { shoulder, elbow, hand, forward, backward };
  }

  function drawRunnerArm(arm, shadowAlpha = 0.22) {
    strokeRunnerLimb([arm.shoulder, arm.elbow], kit.shirtTop, 6.7, shadowAlpha);
    strokeRunnerLimb([arm.elbow, arm.hand], skin, 4.9, shadowAlpha * 0.82);

    ctx.fillStyle = kit.cuff;
    ctx.beginPath();
    ctx.ellipse(arm.elbow.x, arm.elbow.y, 3.6, 2.3, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(arm.hand.x, arm.hand.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  const leftLeg = makeLeg(-1, run.drive);
  const rightLeg = makeLeg(1, -run.drive);
  const leftArm = makeArm(-1, -run.drive);
  const rightArm = makeArm(1, run.drive);
  const headX = run.drive * 0.55;
  const headY = -27 + torsoY - run.headBob;

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.fillStyle = "rgba(4, 12, 6, 0.18)";
  ctx.beginPath();
  ctx.ellipse(-28, 29, 34, 8, -0.42, 0, Math.PI * 2);
  ctx.fill();
  if (Number.isFinite(player.moveAngle)) {
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = isDefender ? "#e5eefc" : "#ffffff";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i += 1) {
      const offset = 13 + i * 9;
      const ox = Math.cos(player.moveAngle + Math.PI) * offset;
      const oy = Math.sin(player.moveAngle + Math.PI) * offset;

      ctx.beginPath();
      ctx.moveTo(ox - 8, oy + 18 + i * 2);
      ctx.lineTo(ox - 24, oy + 22 + i * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
  drawRunWake(player, run, isDefender);
  drawTurfContact(player, run, isDefender);

  ctx.save();
  ctx.translate(player.x, player.y - run.bodyBob * 0.35);
  ctx.rotate(run.bodyRotation);
  ctx.scale(spriteScale, spriteScale);
  ctx.transform(1, 0, run.torsoLean, 1, 0, 0);

  ctx.save();
  ctx.globalAlpha = 0.72;
  [leftLeg, rightLeg]
    .sort((a, b) => b.foot.y - a.foot.y)
    .forEach((leg) => {
      strokeRunnerLimb([leg.hip, leg.knee], shortColor, leg.planted ? 5.5 : 4.9, 0.18);
      strokeRunnerLimb([leg.knee, leg.foot], sockColor, leg.planted ? 4.1 : 3.7, 0.16);

      ctx.fillStyle = leg.planted ? "rgba(255, 255, 255, 0.22)" : "rgba(0, 0, 0, 0.1)";
      ctx.beginPath();
      ctx.arc(leg.knee.x, leg.knee.y, 1.85, 0, Math.PI * 2);
      ctx.fill();

      drawRunnerBoot(leg.foot.x, leg.foot.y, leg.bootAngle, leg.planted, kit.accentGold);
    });
  ctx.restore();

  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  roundedRect(-11, 14 + torsoY * 0.12, 22, 12, 6);
  ctx.fill();

  const jerseyGradient = ctx.createLinearGradient(-13, -8, 13, 22);
  jerseyGradient.addColorStop(0, kit.shirtTop);
  jerseyGradient.addColorStop(0.58, isTeamAttacker(player) ? "#ffffff" : kit.shirtTop);
  jerseyGradient.addColorStop(1, kit.shirtBottom);
  ctx.strokeStyle = "rgba(7, 14, 25, 0.46)";
  ctx.lineWidth = 3;
  traceRunnerTorso(torsoY);
  ctx.stroke();

  ctx.fillStyle = jerseyGradient;
  traceRunnerTorso(torsoY);
  ctx.fill();

  const bodyShadow = ctx.createLinearGradient(-16, -12 + torsoY, 16, 24 + torsoY);
  bodyShadow.addColorStop(0, "rgba(255, 255, 255, 0.2)");
  bodyShadow.addColorStop(0.5, "rgba(0, 0, 0, 0)");
  bodyShadow.addColorStop(1, "rgba(0, 0, 0, 0.34)");
  ctx.fillStyle = bodyShadow;
  traceRunnerTorso(torsoY);
  ctx.fill();

  ctx.save();
  traceRunnerTorso(torsoY);
  ctx.clip();
  ctx.translate(0, torsoY);
  drawChestGraphic(kit);
  ctx.restore();

  ctx.strokeStyle = "rgba(0, 0, 0, 0.16)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-10, 1 + torsoY);
  ctx.lineTo(-7, 18 + torsoY);
  ctx.moveTo(10, 1 + torsoY);
  ctx.lineTo(7, 18 + torsoY);
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
  ctx.beginPath();
  ctx.ellipse(-5, -4 + torsoY, 5, 2.4, -0.22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isDefender ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.07)";
  ctx.beginPath();
  roundedRect(-13, -8 + torsoY, 8, 12, 4);
  roundedRect(5, -8 + torsoY, 8, 12, 4);
  ctx.fill();

  ctx.strokeStyle = kit.cuff;
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.moveTo(-13, -1 + torsoY);
  ctx.lineTo(-9, 4 + torsoY);
  ctx.moveTo(13, -1 + torsoY);
  ctx.lineTo(9, 4 + torsoY);
  ctx.stroke();

  [leftArm, rightArm]
    .sort((a, b) => b.hand.y - a.hand.y)
    .forEach((arm) => {
      drawRunnerArm(arm, 0.22);
    });

  ctx.fillStyle = kit.number;
  ctx.font = "900 10px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(player.number, 0, 8 + torsoY);

  ctx.fillStyle = shortColor;
  ctx.beginPath();
  roundedRect(-10, 17 + torsoY * 0.25, 20, 9, 4);
  ctx.fill();

  ctx.strokeStyle = isDefender ? "rgba(244, 197, 66, 0.6)" : "rgba(217, 31, 44, 0.72)";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-8, 22 + torsoY * 0.25);
  ctx.lineTo(8, 22 + torsoY * 0.25);
  ctx.stroke();

  ctx.fillStyle = kit.accentGold;
  ctx.beginPath();
  ctx.arc(-7, torsoY, 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.beginPath();
  ctx.moveTo(-6, -8 + torsoY);
  ctx.lineTo(0, -3 + torsoY);
  ctx.lineTo(6, -8 + torsoY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = skin;
  ctx.beginPath();
  roundedRect(-3.3, -17 + torsoY, 6.6, 7.6, 2.4);
  ctx.fill();

  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.ellipse(headX, headY, 7.6, 8.5, run.drive * 0.05, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
  ctx.beginPath();
  ctx.arc(headX - 2.3, headY - 2.3, 2.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(180, 108, 74, 0.72)";
  ctx.beginPath();
  ctx.ellipse(headX, headY - 7.4, 1.8, 1.15, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isDefender ? "#111111" : "#4a2a18";
  ctx.beginPath();
  ctx.arc(headX, headY - 4.2, 6, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.42)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(headX, headY, 8, -Math.PI * 0.82, -Math.PI * 0.15);
  ctx.stroke();

  ctx.restore();

  drawStaminaBar(player);

  ctx.font = "900 12px system-ui, sans-serif";
  ctx.fillStyle = "rgba(4, 12, 8, 0.72)";
  const labelWidth = Math.max(44, ctx.measureText(player.name).width + 12);
  const labelY = player.y + SETTINGS.playerRadius + 19;
  ctx.beginPath();
  roundedRect(player.x - labelWidth / 2, labelY, labelWidth, 22, 7);
  ctx.fill();

  ctx.strokeStyle = player.role === "Goalie" ? "rgba(142, 231, 216, 0.7)" : player.role === "Defender" ? "rgba(244, 197, 66, 0.46)" : "rgba(255, 255, 255, 0.52)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  roundedRect(player.x - labelWidth / 2, labelY, labelWidth, 22, 7);
  ctx.stroke();

  ctx.fillStyle = isTeamAttacker(player) ? "#ff4054" : "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(player.name, player.x, labelY + 11.5);
}

function drawDivingGoalie(player) {
  const diveDirection = player.diveDirection || (player.diveY >= player.y ? 1 : -1);
  const progress = clamp(1 - player.diveTimer / player.diveDuration, 0, 1);
  const kit = getPlayerKit(player);
  const skin = "#f1c49b";

  ctx.save();
  ctx.translate(player.diveStartX, player.diveStartY);
  ctx.globalAlpha = 0.2;
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = kit.socks;
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(player.x - player.diveStartX, player.y - player.diveStartY);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.42)";
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-18 - i * 8, 12 + i * 3);
    ctx.lineTo(player.x - player.diveStartX - 42 - i * 18, player.y - player.diveStartY + 18 + i * 5);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.fillStyle = "rgba(4, 12, 6, 0.36)";
  ctx.beginPath();
  ctx.ellipse(-28, 28, 48 + progress * 12, 7, -0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(diveDirection * Math.PI / 2);
  ctx.scale(0.72 + progress * 0.08, 0.72);

  ctx.strokeStyle = kit.socks;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(12, -6);
  ctx.lineTo(40, -12);
  ctx.moveTo(12, 5);
  ctx.lineTo(40, 11);
  ctx.stroke();

  ctx.fillStyle = "#f8f8f8";
  ctx.beginPath();
  ctx.ellipse(46, -13, 7, 4, -0.25, 0, Math.PI * 2);
  ctx.ellipse(46, 12, 7, 4, 0.25, 0, Math.PI * 2);
  ctx.fill();

  const kitGradient = ctx.createLinearGradient(-18, -12, 18, 14);
  kitGradient.addColorStop(0, kit.shirtTop);
  kitGradient.addColorStop(0.55, "#0d2a51");
  kitGradient.addColorStop(1, kit.shirtBottom);
  ctx.fillStyle = kitGradient;
  ctx.beginPath();
  roundedRect(-18, -11, 34, 25, 7);
  ctx.fill();

  ctx.fillStyle = kit.cuff;
  ctx.fillRect(-2, -10, 7, 23);

  ctx.fillStyle = kit.number;
  ctx.font = "900 10px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(player.number, 1, 2);

  ctx.strokeStyle = kit.shorts;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-12, 10);
  ctx.lineTo(-30, 18);
  ctx.moveTo(-8, -7);
  ctx.lineTo(-27, -16);
  ctx.stroke();

  ctx.strokeStyle = "#151515";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-30, 18);
  ctx.lineTo(-38, 20);
  ctx.moveTo(-27, -16);
  ctx.lineTo(-36, -18);
  ctx.stroke();

  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(22, -1, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#372313";
  ctx.beginPath();
  ctx.arc(25, -4, 5, -Math.PI * 0.5, Math.PI * 0.85);
  ctx.fill();

  ctx.restore();

  ctx.font = "800 12px system-ui, sans-serif";
  ctx.fillStyle = "rgba(9, 24, 13, 0.62)";
  const labelWidth = Math.max(44, ctx.measureText(player.name).width + 12);
  ctx.beginPath();
  roundedRect(player.x - labelWidth / 2, player.y + SETTINGS.playerRadius + 5, labelWidth, 20, 6);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(player.name, player.x, player.y + SETTINGS.playerRadius + 15);
}

function drawBall() {
  const height = ball.z || 0;
  const visualY = ball.y - height;
  const r = SETTINGS.ballRadius * (1 + clamp(height / SETTINGS.maxBallHeight, 0, 1) * 0.34);
  const speed = Math.hypot(ball.vx, ball.vy);

  if (ball.owner === null && speed > 1.2) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.strokeStyle = state === "shot" ? "rgba(244, 197, 66, 0.78)" : "rgba(255, 255, 255, 0.48)";
    ctx.lineWidth = Math.max(2, r * (state === "shot" ? 1.8 : 0.9));
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(ball.x - ball.vx * 0.8, visualY - ball.vy * 0.8);
    ctx.lineTo(ball.x - ball.vx * (state === "shot" ? 5.2 : 3.2), visualY - ball.vy * (state === "shot" ? 5.2 : 3.2));
    ctx.stroke();

    if (state === "shot") {
      for (let i = 0; i < 7; i += 1) {
        const offset = (i - 3) * r * 0.85;
        const alpha = clamp(speed / SETTINGS.superShotSpeed, 0.25, 1) * (0.36 - i * 0.028);

        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = Math.max(1.2, r * 0.35);
        ctx.beginPath();
        ctx.moveTo(ball.x - ball.vx * 0.4 - ball.vy * 0.12 * i, visualY - ball.vy * 0.4 + ball.vx * 0.12 * i + offset * 0.08);
        ctx.lineTo(ball.x - ball.vx * (3.4 + i * 0.38) - ball.vy * 0.16 * i, visualY - ball.vy * (3.4 + i * 0.38) + ball.vx * 0.16 * i + offset * 0.16);
        ctx.stroke();
      }
    }

    ctx.strokeStyle = "rgba(255, 255, 255, 0.38)";
    ctx.lineWidth = Math.max(1.4, r * 0.55);
    ctx.beginPath();
    ctx.moveTo(ball.x - ball.vx * 0.5, visualY - ball.vy * 0.5);
    ctx.lineTo(ball.x - ball.vx * 2.1 - ball.vy * 0.35, visualY - ball.vy * 2.1 + ball.vx * 0.35);
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = `rgba(0, 0, 0, ${height > 0 ? 0.14 : 0.25})`;
  ctx.beginPath();
  ctx.ellipse(ball.x + r * 0.45 + height * 0.12, ball.y + r * 0.7 + height * 0.22, r * (1 + height / SETTINGS.maxBallHeight), r * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  if (height > 0) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.34)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 8]);
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(ball.x, visualY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  const ballGradient = ctx.createRadialGradient(ball.x - r * 0.35, visualY - r * 0.45, r * 0.2, ball.x, visualY, r);
  ballGradient.addColorStop(0, "#ffffff");
  ballGradient.addColorStop(0.7, "#f2f2f2");
  ballGradient.addColorStop(1, "#c9c9c9");
  ctx.fillStyle = ballGradient;
  ctx.beginPath();
  ctx.arc(ball.x, visualY, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(ball.x, visualY);
  ctx.rotate((ball.x + ball.y + roundFrame * speed) * 0.035);
  ctx.fillStyle = "#1d1d1d";
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.58);
  ctx.lineTo(r * 0.58, -r * 0.15);
  ctx.lineTo(r * 0.28, r * 0.58);
  ctx.lineTo(-r * 0.28, r * 0.58);
  ctx.lineTo(-r * 0.58, -r * 0.15);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#242424";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.moveTo(-r, -r * 0.15);
  ctx.lineTo(-r * 0.58, -r * 0.15);
  ctx.moveTo(r * 0.58, -r * 0.15);
  ctx.lineTo(r, -r * 0.15);
  ctx.moveTo(-r * 0.28, r * 0.58);
  ctx.lineTo(-r * 0.72, r);
  ctx.moveTo(r * 0.28, r * 0.58);
  ctx.lineTo(r * 0.72, r);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.beginPath();
  ctx.arc(ball.x - r * 0.34, visualY - r * 0.43, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
}

function getAimPreview(dx, dy) {
  const intent = getKickIntent(dx, dy);
  const directShot = intent === "shot";
  const kickFactor = directShot
    ? getAbilityFactor(passer.name, "SHO", 0.007)
    : getAbilityFactor(passer.name, "PAS", 0.005);
  const angle = Math.atan2(dy, dx);
  const speed = Math.hypot(dx, dy) * SETTINGS.kickPower * kickFactor;
  const points = [];
  let previewX = ball.x;
  let previewY = ball.y;
  let previewVx = Math.cos(angle) * speed;
  let previewVy = Math.sin(angle) * speed;

  for (let frame = 0; frame <= 96; frame += 1) {
    previewX += previewVx * SETTINGS.gameSpeed;
    previewY += previewVy * SETTINGS.gameSpeed;
    previewVx *= SETTINGS.friction;
    previewVy *= SETTINGS.friction;

    if (frame % 5 === 0) {
      points.push({ x: previewX, y: previewY });
    }

    if (
      previewX < FIELD.padding * 0.3 ||
      previewX > FIELD.goalX + FIELD.goalDepth ||
      previewY < FIELD.padding * 0.35 ||
      previewY > FIELD.height - FIELD.padding * 0.35
    ) {
      break;
    }
  }

  return {
    intent,
    receiver: directShot ? null : getAimedReceiver(dx, dy) ?? getActiveReceiver(),
    landing: points[points.length - 1] ?? { x: ball.x, y: ball.y },
    points
  };
}

function drawAimPreview(preview, power) {
  if (!preview.points.length) {
    return;
  }

  const isShot = preview.intent === "shot";
  const color = isShot ? "255, 64, 84" : "105, 216, 255";

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = `rgba(${color}, ${0.34 + power * 0.28})`;
  ctx.lineWidth = 2.2 + power * 2.2;
  ctx.lineCap = "round";
  ctx.setLineDash([5, 11]);
  ctx.beginPath();
  ctx.moveTo(ball.x, ball.y);
  preview.points.forEach((point) => ctx.lineTo(point.x, point.y));
  ctx.stroke();
  ctx.setLineDash([]);

  preview.points.forEach((point, index) => {
    if (index % 2 !== 0) {
      return;
    }

    const dotRadius = 2.3 + power * 2.4 + index * 0.05;
    ctx.fillStyle = `rgba(${color}, ${clamp(0.76 - index * 0.035, 0.16, 0.76)})`;
    ctx.beginPath();
    ctx.arc(point.x, point.y, dotRadius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.strokeStyle = `rgba(${color}, 0.88)`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(preview.landing.x, preview.landing.y, 13 + power * 15, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = `rgba(${color}, 0.22)`;
  ctx.beginPath();
  ctx.ellipse(preview.landing.x + 8, preview.landing.y + 12, 24 + power * 22, 8 + power * 5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (preview.receiver) {
    ctx.strokeStyle = "rgba(244, 197, 66, 0.82)";
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(preview.landing.x, preview.landing.y);
    ctx.lineTo(preview.receiver.x, preview.receiver.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = "rgba(244, 197, 66, 0.95)";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(preview.receiver.x, preview.receiver.y, SETTINGS.receiveDistance * 0.82, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.fillStyle = "rgba(255, 64, 84, 0.18)";
    ctx.fillRect(FIELD.goalX - 6, FIELD.goalTop, 12, FIELD.goalHeight);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(FIELD.goalX, FIELD.goalTop);
    ctx.lineTo(FIELD.goalX, FIELD.goalTop + FIELD.goalHeight);
    ctx.stroke();
  }

  ctx.restore();
}

function drawAimLine() {
  if (!dragging || !dragStart || !dragPoint) {
    return;
  }

  const dx = dragStart.x - dragPoint.x;
  const dy = dragStart.y - dragPoint.y;

  if (Math.hypot(dx, dy) <= SETTINGS.clickMoveThreshold) {
    return;
  }

  const shotX = ball.x + dx;
  const shotY = ball.y + dy;
  const power = clamp(Math.hypot(dx, dy) / SETTINGS.maxDrag, 0, 1);
  const angle = Math.atan2(dy, dx);
  const aimGradient = ctx.createLinearGradient(ball.x, ball.y, shotX, shotY);
  const preview = getAimPreview(dx, dy);

  drawAimPreview(preview, power);

  aimGradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
  aimGradient.addColorStop(0.42, "rgba(244, 197, 66, 0.98)");
  aimGradient.addColorStop(1, power > 0.76 ? "rgba(255, 64, 84, 0.98)" : "rgba(105, 216, 255, 0.92)");

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = aimGradient;
  ctx.lineWidth = 6 + power * 5;
  ctx.lineCap = "round";
  ctx.shadowColor = power > 0.76 ? "rgba(255, 64, 84, 0.7)" : "rgba(244, 197, 66, 0.7)";
  ctx.shadowBlur = 18;
  ctx.setLineDash([14, 9]);
  ctx.beginPath();
  ctx.moveTo(ball.x, ball.y);
  ctx.lineTo(shotX, shotY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = power > 0.76 ? "#ff4054" : "#f4c542";
  ctx.beginPath();
  ctx.moveTo(shotX + Math.cos(angle) * 16, shotY + Math.sin(angle) * 16);
  ctx.lineTo(shotX - Math.cos(angle) * 18 + Math.cos(angle + Math.PI / 2) * 11, shotY - Math.sin(angle) * 18 + Math.sin(angle + Math.PI / 2) * 11);
  ctx.lineTo(shotX - Math.cos(angle) * 18 + Math.cos(angle - Math.PI / 2) * 11, shotY - Math.sin(angle) * 18 + Math.sin(angle - Math.PI / 2) * 11);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(dragStart.x, dragStart.y);
  ctx.lineTo(dragPoint.x, dragPoint.y);
  ctx.stroke();

  ctx.strokeStyle = "rgba(10, 32, 16, 0.45)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, 18 + power * 20, -Math.PI / 2, -Math.PI / 2 + power * Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = power > 0.76 ? "rgba(255, 64, 84, 0.9)" : "rgba(244, 197, 66, 0.9)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, 18 + power * 20, -Math.PI / 2, -Math.PI / 2 + power * Math.PI * 2);
  ctx.stroke();
}

function drawReceiveAnimation() {
  if (state !== "receive") {
    return;
  }

  const progress = clamp(1 - receiveTimer / Math.max(receiveDuration, 1), 0, 1);
  const pulse = 16 + progress * 42;
  const receiver = getActiveReceiver();

  ctx.save();
  if (receiveCarryTarget) {
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = "rgba(244, 197, 66, 0.9)";
    ctx.lineWidth = 4;
    ctx.setLineDash([14, 10]);
    ctx.beginPath();
    ctx.moveTo(receiver.x, receiver.y);
    ctx.lineTo(receiveCarryTarget.x, receiveCarryTarget.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.globalAlpha = 0.38;
    ctx.fillStyle = "#f4c542";
    ctx.beginPath();
    ctx.arc(receiveCarryTarget.x, receiveCarryTarget.y, 13 + Math.sin(roundFrame * 0.2) * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 0.78;
  ctx.strokeStyle = "#f4c542";
  ctx.lineWidth = 4 + progress * 4;
  ctx.beginPath();
  ctx.arc(receiver.x, receiver.y, pulse, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * Math.PI * 2 + progress * 2.8;
    const inner = pulse * 0.45;
    const outer = pulse * (0.92 + (i % 3) * 0.12);

    ctx.strokeStyle = i % 2 === 0 ? "rgba(255, 255, 255, 0.44)" : "rgba(244, 197, 66, 0.5)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(receiver.x + Math.cos(angle) * inner, receiver.y + Math.sin(angle) * inner);
    ctx.lineTo(receiver.x + Math.cos(angle) * outer, receiver.y + Math.sin(angle) * outer);
    ctx.stroke();
  }

  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.setLineDash([16, 12]);
  ctx.beginPath();
  ctx.moveTo(ball.x, ball.y);
  ctx.lineTo(receiveShotTarget?.x ?? FIELD.goalX + 18, receiveShotTarget?.y ?? clamp(receiver.y + (FIELD.height / 2 - receiver.y) * 0.35, FIELD.goalTop + 18, FIELD.goalTop + FIELD.goalHeight - 18));
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.globalAlpha = 0.28 + progress * 0.4;
  ctx.fillStyle = "#f4c542";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, 10 + progress * 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGoalSpeedLines() {
  if (speedLineTimer <= 0) {
    return;
  }

  const progress = 1 - speedLineTimer / SETTINGS.speedLineFrames;
  const alpha = Math.pow(1 - progress, 0.72);
  const originX = FIELD.padding + FIELD.height * 0.05;
  const targetX = FIELD.goalX + FIELD.goalDepth * (1.1 + progress * 0.8);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.lineCap = "round";
  for (let i = 0; i < 42; i += 1) {
    const lane = (i / 41) * (FIELD.height - FIELD.padding * 2) + FIELD.padding;
    const wobble = Math.sin(i * 1.7 + progress * 18) * FIELD.height * 0.025;
    const y = lane + wobble;
    const converge = netBendY + (y - FIELD.height / 2) * 0.12;
    const startX = originX + ((i * 61 + roundFrame * 14) % Math.floor(FIELD.width * 0.22));
    const length = FIELD.height * randomLineLength(i, progress);

    ctx.strokeStyle = i % 3 === 0 ? `rgba(244, 197, 66, ${alpha * 0.72})` : `rgba(255, 255, 255, ${alpha * 0.52})`;
    ctx.lineWidth = (i % 5 === 0 ? 4.6 : 2.2) * PITCH_SCALE;
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(Math.min(targetX, startX + length), converge);
    ctx.stroke();
  }
  ctx.restore();
}

function randomLineLength(index, progress) {
  return 0.38 + ((index * 37) % 53) / 120 + progress * 0.28;
}

function drawGoalParticles() {
  if (goalParticles.length === 0) {
    return;
  }

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  goalParticles.forEach((particle) => {
    const alpha = clamp(particle.life / particle.maxLife, 0, 1);

    ctx.globalAlpha = alpha;
    ctx.strokeStyle = particle.color;
    ctx.lineWidth = Math.max(1.2, particle.size * 0.45);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(particle.x - particle.vx * 2.6, particle.y - particle.vy * 2.6);
    ctx.lineTo(particle.x, particle.y);
    ctx.stroke();

    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * (0.35 + alpha * 0.42), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawGoalFlashOverlay() {
  if (goalFlashTimer <= 0) {
    return;
  }

  const progress = 1 - goalFlashTimer / SETTINGS.goalFlashFrames;
  const alpha = Math.pow(1 - progress, 1.35);
  const impact = worldToScreen({ x: netBendX || FIELD.goalX + FIELD.goalDepth * 1.2, y: netBendY });
  const flash = ctx.createRadialGradient(impact.x, impact.y, 8, impact.x, impact.y, canvas.width * 0.46);

  flash.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.78})`);
  flash.addColorStop(0.18, `rgba(244, 197, 66, ${alpha * 0.38})`);
  flash.addColorStop(0.45, `rgba(255, 64, 84, ${alpha * 0.16})`);
  flash.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = flash;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function drawCinematicOverlay() {
  const vignette = ctx.createRadialGradient(canvas.width * 0.52, canvas.height * 0.48, canvas.height * 0.24, canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.72);

  vignette.addColorStop(0, "rgba(255, 255, 255, 0)");
  vignette.addColorStop(0.72, "rgba(0, 0, 0, 0.04)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.28)");
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.018)";
  for (let y = 0; y < canvas.height; y += 18) {
    ctx.fillRect(0, y, canvas.width, 2);
  }

  const topBar = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.16);
  topBar.addColorStop(0, "rgba(0, 0, 0, 0.38)");
  topBar.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = topBar;
  ctx.fillRect(0, 0, canvas.width, canvas.height * 0.16);

  const bottomBar = ctx.createLinearGradient(0, canvas.height * 0.84, 0, canvas.height);
  bottomBar.addColorStop(0, "rgba(0, 0, 0, 0)");
  bottomBar.addColorStop(1, "rgba(0, 0, 0, 0.34)");
  ctx.fillStyle = bottomBar;
  ctx.fillRect(0, canvas.height * 0.84, canvas.width, canvas.height * 0.16);
  ctx.restore();
}

function drawDangerZoneBox() {
  const danger = getDangerZoneInfo();

  if (!danger || ["goal", "saved", "miss", "offside", "blocked", "tackled"].includes(state)) {
    return;
  }

  const width = 260;
  const height = 72;
  const x = canvas.width - width - 28;
  const y = 28;
  const pulse = 0.5 + Math.sin(roundFrame * 0.18) * 0.5;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "rgba(6, 20, 12, 0.84)";
  ctx.beginPath();
  roundedRect(x, y, width, height, 8);
  ctx.fill();

  ctx.strokeStyle = `rgba(244, 197, 66, ${0.55 + pulse * 0.35})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  roundedRect(x, y, width, height, 8);
  ctx.stroke();

  ctx.fillStyle = "#f4c542";
  ctx.font = "900 18px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("DANGER ZONE", x + 18, y + 24);

  ctx.fillStyle = "rgba(255, 255, 255, 0.86)";
  ctx.font = "800 13px system-ui, sans-serif";
  ctx.fillText(`${danger.name} has space`, x + 18, y + 50);
  ctx.restore();
}

function drawPassPraiseBox() {
  if (passPraiseTimer <= 0 || !passPraiseText) {
    return;
  }

  const width = 292;
  const height = 76;
  const x = 28;
  const y = 28;
  const fade = clamp(Math.min(passPraiseTimer / 18, (SETTINGS.passPraiseFrames - passPraiseTimer) / 10), 0, 1);
  const lift = (1 - fade) * -8;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = fade;
  ctx.fillStyle = "rgba(7, 24, 13, 0.86)";
  ctx.beginPath();
  roundedRect(x, y + lift, width, height, 8);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.24)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  roundedRect(x, y + lift, width, height, 8);
  ctx.stroke();

  ctx.fillStyle = "#f4c542";
  ctx.font = "1000 19px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(passPraiseText, x + 18, y + lift + 25);

  ctx.fillStyle = "rgba(255, 255, 255, 0.86)";
  ctx.font = "800 13px system-ui, sans-serif";
  ctx.fillText(passPraiseDetail, x + 18, y + lift + 52);
  ctx.restore();
}

function getCameraShakeOffset() {
  if (cameraShakeTimer <= 0) {
    return { x: 0, y: 0 };
  }

  const amount = Math.pow(cameraShakeTimer / SETTINGS.cameraShakeFrames, 1.7) * FIELD.height * 0.01;

  return {
    x: Math.sin(roundFrame * 2.7) * amount,
    y: Math.cos(roundFrame * 3.4) * amount * 0.62
  };
}

function drawOutcomeBanner() {
  if (!["goal", "saved", "miss", "offside", "blocked", "tackled"].includes(state)) {
    return;
  }

  const isGoal = state === "goal";
  const bannerY = canvas.height / 2 - 78;
  const bannerGradient = ctx.createLinearGradient(0, bannerY, canvas.width, bannerY + 156);

  bannerGradient.addColorStop(0, "rgba(4, 14, 8, 0)");
  bannerGradient.addColorStop(0.17, isGoal ? "rgba(244, 197, 66, 0.24)" : "rgba(10, 32, 16, 0.74)");
  bannerGradient.addColorStop(0.5, "rgba(5, 18, 10, 0.9)");
  bannerGradient.addColorStop(0.83, isGoal ? "rgba(255, 64, 84, 0.18)" : "rgba(10, 32, 16, 0.74)");
  bannerGradient.addColorStop(1, "rgba(4, 14, 8, 0)");
  ctx.fillStyle = bannerGradient;
  ctx.fillRect(0, bannerY, canvas.width, 156);

  if (isGoal) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.strokeStyle = "rgba(244, 197, 66, 0.65)";
    ctx.lineWidth = 4;
    for (let i = 0; i < 16; i += 1) {
      const y = bannerY + 24 + i * 7;
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.18 - i * 18, y);
      ctx.lineTo(canvas.width * 0.82 + i * 18, y + Math.sin(i) * 10);
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.shadowColor = isGoal ? "rgba(244, 197, 66, 0.75)" : "rgba(255, 255, 255, 0.35)";
  ctx.shadowBlur = isGoal ? 26 : 12;
  ctx.fillStyle = isGoal ? "#f4c542" : "#ffffff";
  ctx.font = "1000 68px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(roundTitle.textContent, canvas.width / 2, canvas.height / 2 - 12);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.font = "700 17px system-ui, sans-serif";
  ctx.fillText("Next round starting...", canvas.width / 2, canvas.height / 2 + 46);
}

function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#1d3e23";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  applyCameraTransform();
  const shake = getCameraShakeOffset();
  ctx.translate(shake.x, shake.y);
  drawField();
  drawGoalSpeedLines();
  drawOffsideLine();
  drawPlayer(passer);
  drawPlayer(scorer);
  drawPlayer(supporter);
  defenders.forEach(drawPlayer);
  drawPlayer(goalie);
  drawAimLine();
  drawReceiveAnimation();
  drawBall();
  drawGoalParticles();
  ctx.restore();

  drawGoalFlashOverlay();
  drawCinematicOverlay();
  drawPassPraiseBox();
  drawDangerZoneBox();
  drawOutcomeBanner();
}

function gameLoop() {
  update();
  draw();
  animationFrameId = requestAnimationFrame(gameLoop);
}

function getFullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || null;
}

function shouldOfferPitchFullscreen() {
  return gameStarted && !runFinished;
}

function shouldAutoEnterPitchFullscreen() {
  return shouldOfferPitchFullscreen() &&
    (window.matchMedia?.("(pointer: coarse)")?.matches || window.innerWidth <= 720);
}

function getVisibleViewportSize() {
  const visualViewport = window.visualViewport;
  const width = visualViewport?.width || window.innerWidth || document.documentElement.clientWidth || canvas.clientWidth;
  const height = visualViewport?.height || window.innerHeight || document.documentElement.clientHeight || canvas.clientHeight;

  return {
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height))
  };
}

function updatePitchViewportSize() {
  const { width, height } = getVisibleViewportSize();

  document.documentElement.style.setProperty("--pitch-vw", `${width}px`);
  document.documentElement.style.setProperty("--pitch-vh", `${height}px`);
}

function syncPitchViewportSoon() {
  if (!document.body.classList.contains("pitch-fullscreen")) {
    return;
  }

  updatePitchViewportSize();
  requestAnimationFrame(updatePitchViewportSize);
  window.setTimeout(updatePitchViewportSize, 180);
  window.setTimeout(updatePitchViewportSize, 620);
}

function isIOSBrowserTab() {
  const platform = navigator.platform || "";
  const userAgent = navigator.userAgent || "";
  const isiOS = /iPad|iPhone|iPod/.test(userAgent) || (platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isStandalone = window.navigator.standalone === true || window.matchMedia?.("(display-mode: standalone)")?.matches;

  return isiOS && !isStandalone;
}

function clearPitchControlsTimer() {
  if (pitchControlsHideTimer) {
    window.clearTimeout(pitchControlsHideTimer);
    pitchControlsHideTimer = null;
  }
}

function schedulePitchControlsHide() {
  clearPitchControlsTimer();

  if (!document.body.classList.contains("pitch-fullscreen")) {
    return;
  }

  pitchControlsHideTimer = window.setTimeout(() => {
    document.body.classList.add("pitch-controls-hidden");
  }, 2000);
}

function showPitchControlsTemporarily() {
  if (!document.body.classList.contains("pitch-fullscreen")) {
    return;
  }

  document.body.classList.remove("pitch-controls-hidden");
  schedulePitchControlsHide();
}

function updateFullscreenButtonAvailability() {
  if (document.body.classList.contains("pitch-fullscreen")) {
    fullscreenButton.hidden = false;
    return;
  }

  fullscreenButton.hidden = !shouldOfferPitchFullscreen();
}

function setPitchFullscreenMode(enabled) {
  if (enabled) {
    document.activeElement?.blur?.();
    updatePitchViewportSize();
  }

  document.documentElement.classList.toggle("pitch-fullscreen-root", enabled);
  document.body.classList.toggle("pitch-fullscreen", enabled);
  document.body.classList.toggle("ios-browser-fullscreen", enabled && isIOSBrowserTab());
  document.body.classList.remove("pitch-controls-hidden");
  fullscreenButton.setAttribute("aria-pressed", enabled ? "true" : "false");
  fullscreenButton.textContent = enabled ? "Exit pitch" : "Fullscreen pitch";

  if (enabled) {
    fullscreenButton.hidden = false;
    showPitchControlsTemporarily();
    syncPitchViewportSoon();
  } else {
    clearPitchControlsTimer();
    document.documentElement.classList.remove("pitch-fullscreen-root");
    document.body.classList.remove("ios-browser-fullscreen");
    document.documentElement.style.removeProperty("--pitch-vw");
    document.documentElement.style.removeProperty("--pitch-vh");
    fullscreenButton.hidden = !shouldOfferPitchFullscreen();
  }
}

async function lockLandscapeMode() {
  try {
    if (screen.orientation?.lock) {
      await screen.orientation.lock("landscape");
    }
  } catch (error) {
    // Some mobile browsers only allow manual rotation; the pitch-only view still works.
  }
}

function unlockOrientationMode() {
  try {
    screen.orientation?.unlock?.();
  } catch (error) {
    // Orientation unlock is not supported everywhere.
  }
}

async function enterPitchFullscreen() {
  if (!shouldOfferPitchFullscreen()) {
    updateFullscreenButtonAvailability();
    return;
  }

  setPitchFullscreenMode(true);
  pitchUsesBrowserFullscreen = false;

  try {
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    }

    pitchUsesBrowserFullscreen = Boolean(getFullscreenElement());
  } catch (error) {
    // Keep the pitch-only layout even if the browser blocks fullscreen.
  }

  await lockLandscapeMode();
  syncPitchViewportSoon();
}

async function exitPitchFullscreen() {
  setPitchFullscreenMode(false);
  unlockOrientationMode();

  try {
    if (getFullscreenElement() && document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (getFullscreenElement() && document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  } catch (error) {
    // Browser exit can fail if fullscreen was not granted.
  }

  pitchUsesBrowserFullscreen = false;
}

function togglePitchFullscreen() {
  if (document.body.classList.contains("pitch-fullscreen")) {
    exitPitchFullscreen();
  } else {
    enterPitchFullscreen();
  }
}

function handleFullscreenButtonPress(event) {
  event.preventDefault();
  event.stopPropagation();

  const now = performance.now();

  if (now - lastFullscreenButtonPress < 350) {
    return;
  }

  lastFullscreenButtonPress = now;
  togglePitchFullscreen();
}

function handlePitchHotspotPress(event) {
  if (!document.body.classList.contains("pitch-fullscreen")) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  showPitchControlsTemporarily();
}

function syncPitchFullscreenState() {
  syncPitchViewportSoon();

  if (
    pitchUsesBrowserFullscreen &&
    !getFullscreenElement() &&
    document.body.classList.contains("pitch-fullscreen") &&
    performance.now() - lastFullscreenButtonPress > 500
  ) {
    setPitchFullscreenMode(false);
    unlockOrientationMode();
    pitchUsesBrowserFullscreen = false;
  }
}

canvas.addEventListener("mousedown", handleInputStart);
canvas.addEventListener("mousemove", handleInputMove);
window.addEventListener("mouseup", handleInputEnd);
canvas.addEventListener("touchstart", handleInputStart, { passive: false });
canvas.addEventListener("touchmove", handleInputMove, { passive: false });
window.addEventListener("touchend", handleInputEnd, { passive: false });
fullscreenButton.addEventListener("pointerup", handleFullscreenButtonPress);
fullscreenButton.addEventListener("touchend", handleFullscreenButtonPress, { passive: false });
fullscreenButton.addEventListener("click", handleFullscreenButtonPress);
pitchHotspot.addEventListener("pointerup", handlePitchHotspotPress);
pitchHotspot.addEventListener("touchend", handlePitchHotspotPress, { passive: false });
pitchHotspot.addEventListener("click", handlePitchHotspotPress);
document.addEventListener("fullscreenchange", syncPitchFullscreenState);
document.addEventListener("webkitfullscreenchange", syncPitchFullscreenState);
window.addEventListener("resize", syncPitchViewportSoon);
window.addEventListener("orientationchange", syncPitchViewportSoon);
window.visualViewport?.addEventListener("resize", syncPitchViewportSoon);
window.visualViewport?.addEventListener("scroll", syncPitchViewportSoon);
readyPanel.addEventListener("click", skipCountdown);
readyPanel.addEventListener("touchstart", skipCountdown, { passive: false });
newRoundButton.addEventListener("click", () => {
  if (gameStarted && !runFinished) {
    startRound();
  }
});
playerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  startGameForPlayer(playerNameInput.value);
});
restartRunButton.addEventListener("click", () => {
  if (playerName) {
    startRun();
    if (shouldAutoEnterPitchFullscreen()) {
      enterPitchFullscreen();
    }
  }
});

readyPanel.hidden = true;
leaderboardPanel.hidden = true;
newRoundButton.disabled = true;
updateFullscreenButtonAvailability();
roundTitle.textContent = "Enter your name";
updateSuccessRate();
updateRunTimer();
playerNameInput.focus();
