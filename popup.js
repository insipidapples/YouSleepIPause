const $ = (id) => document.getElementById(id);

// ---------- load current settings into the popup ----------
async function load() {
  const s = await browser.storage.local.get({
    youtube: true,
    twitch: true,
    idleInterval: 900
  });

  $("youtube").checked = s.youtube;
  $("twitch").checked  = s.twitch;

  $("idleMinutes").placeholder = String(Math.round(s.idleInterval / 60));

  await refreshCount();
}

// ---------- trigger counter ----------
async function refreshCount() {
  try {
    const resp = await browser.runtime.sendMessage({ type: "getTriggerCount" });
    $("triggerCount").textContent = String(resp.count);
  } catch {
    $("triggerCount").textContent = "?";
  }
}

$("resetCount").addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  try {
    const resp = await browser.runtime.sendMessage({ type: "resetTriggerCount" });
    $("triggerCount").textContent = String(resp.count);   // shows 0
  } catch (err) {
    console.warn("[Popup] reset failed:", err);
  }
});

// ---------- checkboxes save instantly ----------
$("youtube").addEventListener("change", (e) => {
  browser.storage.local.set({ youtube: e.target.checked });
});
$("twitch").addEventListener("change", (e) => {
  browser.storage.local.set({ twitch: e.target.checked });
});

// ---------- timer input + save button ----------
$("saveTimer").addEventListener("click", async () => {
  const raw = $("idleMinutes").value.trim();

  let minutes;
  if (raw === "") {
    const { idleInterval } = await browser.storage.local.get({ idleInterval: 900 });
    minutes = Math.round(idleInterval / 60);
  } else {
    minutes = Number(raw);
  }

  if (!Number.isFinite(minutes) || minutes < 1) {
    $("status").textContent = "≥ 1 min";
    $("status").style.color = "crimson";
    setTimeout(() => ($("status").textContent = ""), 1500);
    return;
  }

  await browser.storage.local.set({ idleInterval: Math.round(minutes * 60) });

  $("idleMinutes").value = "";
  $("idleMinutes").placeholder = String(minutes);

  $("status").textContent = "Saved ✓";
  $("status").style.color = "green";
  setTimeout(() => ($("status").textContent = ""), 1500);
});

// ---------- link to full options page ----------
$("openOptions").addEventListener("click", (e) => {
  e.preventDefault();
  browser.runtime.openOptionsPage();
});

load();