// ---------- defaults ----------
const DEFAULTS = {
  youtube: true,
  twitch: true,
  customSites: [],
  idleInterval: 900,
  actionDelay: 0
};

// ---------- interval sanitizer ----------
function sanitizeInterval(v) {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 15 ? n : DEFAULTS.idleInterval;
}

// ---------- load & watch settings ----------
async function getSettings() {
  const data = await browser.storage.local.get(DEFAULTS);
  return { ...DEFAULTS, ...data };
}

async function applyIdleInterval() {
  const { idleInterval } = await getSettings();
  const safe = sanitizeInterval(idleInterval);
  if (safe !== idleInterval) {
    await browser.storage.local.set({ idleInterval: safe });
  }
  browser.idle.setDetectionInterval(safe);
}

browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.idleInterval) applyIdleInterval();
});

applyIdleInterval();

// ---------- build URL patterns ----------
function buildPatterns(settings) {
  const patterns = [];
  if (settings.youtube) patterns.push("*://*.youtube.com/*");
  if (settings.twitch) patterns.push("*://*.twitch.tv/*");
  for (const domain of settings.customSites) {
    if (domain.trim()) patterns.push(`*://*.${domain.trim()}/*`);
  }
  return patterns;
}

// ---------- toolbar visuals ----------
const ICON_ACTIVE = "icon-active.png";
const ICON_IDLE   = "icon.png";

function setIcon(active) {
  browser.browserAction.setIcon({
    path: active ? ICON_ACTIVE : ICON_IDLE
  }).catch(e => console.warn("[Icon] failed:", e));
}

// ---------- trigger counter ----------
let triggerCount = 0;
let countedThisSession = false;

function updateBadge() {
  // 0 or negative → empty string → no badge shown at all
  const text = triggerCount > 0 ? String(triggerCount) : "";
  browser.browserAction.setBadgeText({ text });
  browser.browserAction.setBadgeBackgroundColor({ color: "#c9b6f5" });
}

function bumpCount() {
  if (!countedThisSession) {
    triggerCount++;
    countedThisSession = true;
    updateBadge();
  }
}

// ---------- messaging ----------
browser.runtime.onMessage.addListener((msg) => {
  if (!msg) return;

  if (msg.type === "getTriggerCount") {
    return Promise.resolve({ count: triggerCount });
  }

  if (msg.type === "resetTriggerCount") {
    triggerCount = 0;
    countedThisSession = false;
    updateBadge();                        // clears the badge
    return Promise.resolve({ count: 0 });
  }
});

// ---------- pause logic ----------
let pendingTimer = null;

async function pauseVideosOnMatchingTabs() {
  const settings = await getSettings();
  const patterns = buildPatterns(settings);
  if (patterns.length === 0) return;

  const tabs = await browser.tabs.query({ url: patterns });

  for (const tab of tabs) {
    try {
      await browser.tabs.executeScript(tab.id, {
        code: `document.querySelectorAll('video').forEach(v => v.pause());`
      });
    } catch (e) {
      // tab closed or permission denied — ignore
    }
  }
}

// ---------- idle state listener ----------
browser.idle.onStateChanged.addListener(async (newState) => {
  const settings = await getSettings();


  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }

  if (newState === "idle" || newState === "locked") {
    setIcon(true);

    if (settings.actionDelay > 0) {
      pendingTimer = setTimeout(async () => {
        await pauseVideosOnMatchingTabs();
        bumpCount();
        pendingTimer = null;
      }, settings.actionDelay * 1000);
    } else {
      await pauseVideosOnMatchingTabs();
      bumpCount();
    }
  } else {
    // active — reset per-session flag, put idle icon back, leave the count visible
    countedThisSession = false;
    setIcon(false);
	browser.idle.setDetectionInterval(sanitizeInterval(settings.idleInterval));
  }
});

// ---------- initial badge state ----------
updateBadge();