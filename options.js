const DEFAULTS = {
  youtube: true,
  twitch: true,
  customSites: [],
  idleInterval: 900, // seconds
  actionDelay: 0      // seconds
};

// ---------- load ----------
async function load() {
  const s = await browser.storage.local.get(DEFAULTS);

  document.getElementById("youtube").checked = s.youtube;
  document.getElementById("twitch").checked  = s.twitch;
  document.getElementById("customSites").value = s.customSites.join("\n");
  document.getElementById("idleMinutes").value = Math.max(1, Math.round(s.idleInterval / 60));
  document.getElementById("actionDelay").value = s.actionDelay;
}

// ---------- save ----------
document.getElementById("settings-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const customSites = document
    .getElementById("customSites")
    .value
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean);

  // minutes → seconds
  const minutesRaw = Number(document.getElementById("idleMinutes").value);
  const minutes = Number.isFinite(minutesRaw) && minutesRaw >= 1 ? minutesRaw : 15;

  const settings = {
    youtube:      document.getElementById("youtube").checked,
    twitch:       document.getElementById("twitch").checked,
    customSites:  customSites,
    idleInterval: Math.round(minutes * 60),
    actionDelay:  Math.max(0, Number(document.getElementById("actionDelay").value) || 0)
  };

  await browser.storage.local.set(settings);

  const status = document.getElementById("status");
  status.textContent = "Saved ✓";
  setTimeout(() => (status.textContent = ""), 1500);
});

load();